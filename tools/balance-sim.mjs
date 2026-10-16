// Read-only gameplay probe. Source evaluated directly; presentation stubs only.
import fs from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
const root = resolve(
  process.env.AURORA_ROOT ||
    resolve(dirname(fileURLToPath(import.meta.url)), ".."),
);
if (process.argv.includes("--help")) {
  console.log(`Usage: N=300 node tools/balance-sim.mjs > results.json
Final chain: ONLY=tita LEVEL=7 START_EXP=150 CHAIN=1 GEAR=chests
Experiments: TITA_ATK=32 (in-memory source overrides only)
Policies: NAIVE=1 uses first learned affordable offensive skill; BONDS=1 sets all bond flags.
AURORA_ROOT overrides the default repository root (parent of tools/).
Active simulation seconds exclude presentation and user command time.`);
  process.exit(0);
}
const read = (p) => fs.readFile(root + "/" + p, "utf8");
const { GameState } = await import(pathToFileURL(root + "/src/game/state.js"));
const { HERO_DATA, expToNext } = await import(
  pathToFileURL(root + "/src/data/heroes.js")
);
const { SKILLS, DUAL_TECHS, ELEMENTS, WEAPON_TYPES } = await import(
  pathToFileURL(root + "/src/data/skills.js")
);
const { ITEMS } = await import(pathToFileURL(root + "/src/data/items.js"));
const { bondRank, BOND_DUAL_BONUS, CAMP_SCENES } = await import(
  pathToFileURL(root + "/src/data/camp.js")
);
let es = (await read("src/data/enemies.js"))
  .split(
    "// ---------------------------------------------------------------- arte",
  )[0]
  .replace(/^import .*;\n/gm, "")
  .replace(
    /const artMods =[\s\S]*?\/\/ Habilidades de inimigos/,
    "// Habilidades de inimigos",
  )
  .replaceAll("export const", "const");
// Numeric experiments affect only the loaded source string; the repository is read-only.
es = es.replace(/name: 'Armadura Titã'[^\n]+/, (line) => {
  for (const [key, env] of [
    ["hp", "TITA_HP"],
    ["atk", "TITA_ATK"],
    ["mag", "TITA_MAG"],
  ]) {
    if (process.env[env]) {
      const value = Number(process.env[env]);
      if (!Number.isFinite(value) || value <= 0)
        throw new Error(env + " must be positive");
      line = line.replace(
        new RegExp("\\b" + key + ": [0-9.]+"),
        key + ": " + value,
      );
    }
  }
  return line;
});
const { ENEMIES, ENEMY_SKILLS } = new Function(
  es + ";return {ENEMIES,ENEMY_SKILLS}",
)();
let seed = 12345;
Math.random = () => {
  seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noop = () => {};
const fakeTimer = () => 0;
const document = { createElement: () => ({ remove: noop }) };
const rs = (await read("src/battle/resonance.js"))
  .replace(/^import .*;\n/gm, "")
  .replace(/const wait = .*;/, "const wait=async()=>{};")
  .replaceAll("export const", "const")
  .replaceAll("export async function", "async function");
const { RESONANCE, doResonance } = new Function(
  "document",
  "portraitURL",
  rs + ";return {RESONANCE,doResonance}",
)(document, () => null);
const bs = (await read("src/battle/Battle.js"))
  .replace(/^import .*;\n/gm, "")
  .replace("export class Battle", "class Battle");
const deps = {
  HERO_DATA,
  SKILLS,
  DUAL_TECHS,
  ELEMENTS,
  WEAPON_TYPES,
  ITEMS,
  ENEMIES,
  ENEMY_SKILLS,
  bondRank,
  BOND_DUAL_BONUS,
  RESONANCE,
  doResonance,
  wait: async () => {},
  TIME: { scale: 0 },
  setTimeout: fakeTimer,
};
const { Battle, DIFFICULTY } = new Function(
  ...Object.keys(deps),
  bs + ";return {Battle,DIFFICULTY}",
)(...Object.values(deps));
const actor = () => ({ position: {}, setFrame: noop, update: noop });
function makeBattle(sc, difficulty, state) {
  const b = Object.create(Battle.prototype);
  Object.assign(b, {
    state,
    game: { sfx: noop },
    ui: { flash: noop, root: { appendChild: noop } },
    stage: {},
    effects: { play: noop, update: noop },
    W: { updaters: [] },
    heroes: [],
    enemies: [],
    actionQueue: [],
    busy: false,
    done: false,
    time: 0,
    ecoOn: sc.eco,
    eco: sc.eco ? 30 : 0,
    barks: { say: noop, alive: () => b.heroes.filter((c) => c.hp > 0) },
    lastAction: {},
    diff: DIFFICULTY[difficulty],
    metrics: {
      damage: 0,
      potions: 0,
      ether: 0,
      mp: 0,
      reso: 0,
      dual: 0,
      breaks: 0,
      actions: 0,
      weakHits: 0,
      phoenix: 0,
    },
  });
  for (const id of state.party) {
    const hh = state.heroes[id],
      s = state.stats(id);
    b.heroes.push({
      id,
      name: id,
      side: "hero",
      hp: hh.hp,
      mp: hh.mp,
      maxhp: s.hp,
      maxmp: s.mp,
      base: { ...s },
      actor: actor(),
      atb: 10 + Math.random() * 35 + s.spd,
      buffs: {},
      status: { ...hh.status },
      immune: state.immunities(id),
      skills: hh.skills,
      weaponType: HERO_DATA[id].weaponType,
    });
  }
  for (const kind of sc.group) {
    const e = ENEMIES[kind],
      hp = Math.round(e.hp * b.diff.hp);
    b.enemies.push({
      id: kind,
      kind,
      data: e,
      name: e.name,
      side: "enemy",
      hp,
      maxhp: hp,
      mp: 99,
      maxmp: 99,
      base: { ...e, atk: e.atk * b.diff.atk, mag: e.mag * b.diff.atk },
      actor: actor(),
      atb: Math.random() * 30,
      buffs: {},
      status: {},
      immune: new Set(e.boss ? ["sono"] : []),
      shield: e.shield,
      maxShield: e.shield,
      broken: 0,
      weak: e.weak,
      revealed: new Set(),
      boss: !!e.boss,
    });
  }
  for (const name of ["popup", "knock", "updateHUD", "help"]) b[name] = noop;
  b.banner = async () => {};
  b.reach = () => 0;
  b.lunge = async () => async () => {};
  b.onDeath = (c) => {
    c.atb = 0;
    c.waiting = false;
    c.queued = false;
    b.actionQueue = b.actionQueue.filter((a) => a.actor !== c);
  };
  const originalDamage = b.applyDamage.bind(b);
  b.applyDamage = (s, t, ...rest) => {
    const hp = t.hp;
    if (
      t.side === "enemy" &&
      rest[1] &&
      [rest[1].type, rest[1].element].some((k) => k && t.weak.includes(k))
    )
      b.metrics.weakHits++;
    const result = originalDamage(s, t, ...rest);
    if (t.side === "hero") b.metrics.damage += hp - t.hp;
    return result;
  };
  const originalBreak = b.breakEnemy.bind(b);
  b.breakEnemy = (t) => {
    b.metrics.breaks++;
    return originalBreak(t);
  };
  b.checkEnd = () => {
    if (b.enemies.every((c) => c.hp <= 0) || b.heroes.every((c) => c.hp <= 0))
      b.done = true;
  };
  b.openCommand = async (c) => {
    c.queued = true;
    b.actionQueue.push(choose(b, c));
  };
  const execute = b.execute.bind(b);
  b.execute = async (a) => {
    b.metrics.actions++;
    const before = b.heroes.reduce((n, c) => n + c.mp, 0);
    if (a.type === "item") {
      if (a.item === "eter") b.metrics.ether++;
      else if (a.item === "pena") b.metrics.phoenix++;
      else if (a.item === "pocao" || a.item === "hipocao") b.metrics.potions++;
    }
    if (a.type === "dual") b.metrics.dual++;
    if (a.type === "resonance") b.metrics.reso++;
    await execute(a);
    b.metrics.mp += Math.max(
      0,
      before - b.heroes.reduce((n, c) => n + c.mp, 0),
    );
  };
  return b;
}
function choose(b, c) {
  const living = b.heroes.filter((t) => t.hp > 0),
    enemies = b.enemies.filter((t) => t.hp > 0),
    hurt = [...living].sort((a, z) => a.hp / a.maxhp - z.hp / z.maxhp)[0],
    dead = b.heroes.find((t) => t.hp <= 0);
  const skill = (id, targets) => ({
    actor: c,
    type: "skill",
    skill: SKILLS[id],
    targets,
  });
  if (b.ecoOn && b.eco >= 100) {
    if (c.id === "sena" && (dead || living.some((t) => t.hp < t.maxhp * 0.65)))
      return { actor: c, type: "resonance", targets: living };
    if (c.id === "lio" || c.id === "estela")
      return {
        actor: c,
        type: "resonance",
        targets: c.id === "lio" ? [enemies[0]] : enemies,
      };
  }
  if (dead && b.state.inventory.pena)
    return { actor: c, type: "item", item: "pena", targets: [dead] };
  if (c.skills.includes("cura") && c.mp >= 4 && hurt.hp < hurt.maxhp * 0.62)
    return skill("cura", [hurt]);
  if (hurt.hp < hurt.maxhp * 0.35 && b.state.inventory.pocao)
    return { actor: c, type: "item", item: "pocao", targets: [hurt] };
  if (
    c.id === "sena" &&
    c.mp < 4 &&
    hurt.hp < hurt.maxhp * 0.7 &&
    b.state.inventory.eter
  )
    return { actor: c, type: "item", item: "eter", targets: [c] };
  const target = [...enemies].sort((a, z) => a.hp - z.hp)[0];
  // Do not wait for dual availability, but use Aurora when it heals two allies.
  const dual = b
    .availableDuals(c)
    .find(
      (d) =>
        d.ok &&
        d.k === "aurora" &&
        living.filter((t) => t.hp < t.maxhp * 0.75).length >= 2,
    );
  if (dual)
    return {
      actor: c,
      type: "dual",
      dual: dual.d,
      partner: dual.other,
      mp: [dual.myMp, dual.oMp],
      targets: enemies,
    };
  const options = c.skills
    .map((id) => [id, SKILLS[id]])
    .filter(([, s]) => c.mp >= s.mp && ["phys", "mag"].includes(s.kind));
  if (process.env.NAIVE === "1" && options.length) {
    const [id, s] = options[0];
    return skill(id, s.target === "enemies" ? enemies : [target]);
  }
  const expected = (s, t) =>
    (s.kind === "phys" ? b.calcPhys(c, t, s.power) : b.calcMag(c, t, s.power)) *
    (s.hits || 1) *
    (t.weak.includes(s.element) ||
    (s.kind === "phys" && t.weak.includes(c.weaponType))
      ? 1.3
      : 1) *
    (t.broken ? 1.6 : 1);
  const attackScore =
    b.calcPhys(c, target, 1) *
    (target.weak.includes(c.weaponType) ? 1.3 : 1) *
    (target.broken ? 1.6 : 1);
  const ranked = options
    .map(([id, s]) => ({
      id,
      s,
      score: (s.target === "enemies" ? enemies : [target]).reduce(
        (n, t) => n + Math.min(t.hp, expected(s, t)),
        0,
      ),
    }))
    .sort((a, z) => z.score - a.score);
  if (ranked[0] && ranked[0].score > attackScore * 1.18) {
    const { id, s } = ranked[0];
    return skill(id, s.target === "enemies" ? enemies : [target]);
  }
  return { actor: c, type: "attack", targets: [target] };
}
function stateFor(sc, difficulty) {
  const s = new GameState();
  s.settings.difficulty = difficulty;
  for (const id of sc.party) s.addHero(id, sc.level);
  if (process.env.START_EXP)
    for (const h of Object.values(s.heroes))
      h.exp = Number(process.env.START_EXP);
  s.inventory = { pocao: 6, eter: 2, pena: 2 };
  if (sc.eco) {
    s.heroes.lio.equip.weapon = "lamina_farol";
  }
  if (process.env.GEAR === "chests") {
    if (s.heroes.sena && sc.level >= 5)
      s.heroes.sena.equip.weapon = "cajado_lunar";
    if (sc.eco) {
      s.heroes.lio.equip.armor = "malha_aco";
      s.heroes.brann.equip.weapon = "lanca_guerra";
      s.heroes.estela.equip.weapon = "astrolabio_prata";
      s.heroes.estela.equip.acc = "broche_estelar";
    }
  }
  if (process.env.BONDS === "1")
    for (const scene of CAMP_SCENES) s.set("camp_" + scene.id);
  s.healAll();
  return s;
}
async function simulate(b) {
  let ticks = 0;
  while (!b.done && ticks++ < 60 * 600) {
    b.update(1 / 60);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }
  while (b.busy) await Promise.resolve();
}
const scenarios = [];
for (const [map, party, level, eco] of [
  ["bosque", ["lio"], 2, false],
  ["caverna", ["lio", "sena", "estela"], 4, false],
  ["forte", ["lio", "sena", "estela", "brann"], 6, true],
]) {
  const src = await read("src/data/maps/" + map + ".js");
  for (const match of src.matchAll(
    /\{ id: '(e\d+)', kind: '[^']+'[^\n]*group: (\[[^\]]+\])[^\n]*/g,
  )) {
    const group = JSON.parse(match[2].replaceAll("'", '"'));
    scenarios.push({
      name: map + "_" + match[1],
      group,
      party:
        map === "bosque" && match[1] === "e8" ? ["lio", "sena", "estela"] :
        map === "caverna" && Number(match[1].slice(1)) >= 6
          ? [...party, "brann"]
          : party,
      level: map === "bosque" && Number(match[1].slice(1)) <= 2 ? 1 : map === "bosque" && match[1] === "e8" ? 4 : level,
      eco,
    });
  }
}
scenarios.push(
  {
    name: "cao_ferro",
    group: ["cao_ferro"],
    party: ["lio", "sena"],
    level: 3,
    eco: false,
  },
  {
    name: "recrutas",
    group: ["recruta", "recruta"],
    party: ["lio", "sena", "estela"],
    level: 3,
    eco: false,
  },
  {
    name: "golem",
    group: ["golem"],
    party: ["lio", "sena", "estela", "brann"],
    level: 5,
    eco: false,
  },
  {
    name: "varek",
    group: ["varek"],
    party: ["lio", "sena", "estela", "brann"],
    level: 7,
    eco: true,
  },
  {
    name: "tita",
    group: ["tita"],
    party: ["lio", "sena", "estela", "brann"],
    level: 8,
    eco: true,
  },
);
if (process.env.LEVEL)
  for (const sc of scenarios) sc.level = Number(process.env.LEVEL);
const n = Number(process.env.N || 300),
  results = [];
if (!Number.isInteger(n) || n < 1)
  throw new Error("N must be a positive integer");
const sourceHashes = {};
for (const name of [
  "src/battle/Battle.js",
  "src/battle/resonance.js",
  "src/data/enemies.js",
  "src/game/state.js",
])
  sourceHashes[name] = createHash("sha256")
    .update(await read(name))
    .digest("hex");
for (const sc of scenarios.filter(
  (s) => !process.env.ONLY || s.name.includes(process.env.ONLY),
))
  for (const difficulty of Object.keys(DIFFICULTY)) {
    const rows = [];
    for (let i = 0; i < n; i++) {
      seed = 12345 + i * 7919;
      const state = stateFor(sc, difficulty);
      let preMetrics = null;
      if (process.env.CHAIN === "1" && sc.name === "tita") {
        const pre = makeBattle({ ...sc, group: ["varek"] }, difficulty, state);
        await simulate(pre);
        preMetrics = {
          ...pre.metrics,
          defeat: pre.heroes.every((c) => c.hp <= 0) ? 1 : 0,
        };
        pre.syncState();
        state.gainExp(Math.round(600 * pre.diff.rew));
      }
      const b = makeBattle(sc, difficulty, state);
      await simulate(b);
      rows.push({
        chainMpSpent: (preMetrics?.mp || 0) + b.metrics.mp,
        chainPotions: (preMetrics?.potions || 0) + b.metrics.potions,
        preDefeat: preMetrics?.defeat || 0,
        activeSeconds: b.time,
        defeat: b.heroes.every((c) => c.hp <= 0) ? 1 : 0,
        timeout: !b.done ? 1 : 0,
        ...b.metrics,
        mpLeft: b.heroes.reduce((n, c) => n + c.mp, 0),
        ecoLeft: b.eco,
      });
    }
    const avg = (k) => +(rows.reduce((a, r) => a + r[k], 0) / n).toFixed(4),
      sorted = rows.map((r) => r.activeSeconds).sort((a, z) => a - z);
    results.push({
      encounter: sc.name,
      group: sc.group.join("+"),
      level: sc.level,
      party: sc.party.length,
      difficulty,
      n,
      activeSeconds: avg("activeSeconds"),
      p90Seconds: +sorted[Math.floor(n * 0.9)].toFixed(2),
      damage: avg("damage"),
      potions: avg("potions"),
      ether: avg("ether"),
      defeatCount: rows.reduce((n, r) => n + r.defeat, 0),
      defeatRate: avg("defeat"),
      timeoutRate: avg("timeout"),
      mpSpent: avg("mp"),
      chainMpSpent: avg("chainMpSpent"),
      chainPotions: avg("chainPotions"),
      preDefeatRate: avg("preDefeat"),
      phoenix: avg("phoenix"),
      mpLeft: avg("mpLeft"),
      ecoLeft: avg("ecoLeft"),
      resonances: avg("reso"),
      duals: avg("dual"),
      breaks: avg("breaks"),
      actions: avg("actions"),
      weakHits: avg("weakHits"),
    });
  }
console.log(
  JSON.stringify(
    {
      metadata: {
        n,
        seed: 12345,
        source: root,
        sourceHashes,
        configuration: {
          level: process.env.LEVEL || "scenario defaults",
          chain: process.env.CHAIN === "1",
          startExp: Number(process.env.START_EXP || 0),
          gear: process.env.GEAR || "starter",
          bonds: process.env.BONDS === "1",
          naive: process.env.NAIVE === "1",
          tita: {
            hp: ENEMIES.tita.hp,
            atk: ENEMIES.tita.atk,
            mag: ENEMIES.tita.mag,
          },
        },
        approximations: [
          "Renderer, audio, animation waits and browser timers stubbed. Actual Battle source evaluated with injected imports; GameState imported normally.",
          "Active ATB time excludes animation duration, command selection, intro/results; does not equal player wall-clock duration. update uses real 60Hz loop with promise flushing.",
          "Each encounter starts fully healed with starter gear (Lio has story sword after ECO), six potions, two ethers, two phoenix feathers; inventory does not represent earned economy.",
          "Heuristic immediate commands use healing/weakness attacks; only situational Aurora dual. No deliberate waiting, player learning, field attrition or camp bonuses unless BONDS=1.",
          "CHAIN=1 carries Varek HP/MP/status/inventory and actual reward EXP into Titã; ECO restarts at actual constructor default 30 each battle. CHAIN loss includes entering Titã after a Varek defeat, reflecting chain failure. Levels are explicit plausible story checkpoints, not tracked campaign leveling; forest e1/e2 L1, e3–e7 L2, cap2-only e8 L4 with three heroes; cave L4 before Brann/L4 after; fortress L6, bosses as shown.",
          "Scratch copies hero/enemy construction from Battle.build because build creates WebGL. Battle damage/stat/shield/ATB/status/skill/enemy/dual/resonance execution is reused.",
        ],
      },
      results,
    },
    null,
    2,
  ),
);
