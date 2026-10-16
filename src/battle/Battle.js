// Batalha ATB (modo espera) com quebra de escudo por fraqueza e técnicas duplas.
import * as THREE from 'three';
import { buildWorld } from '../render/World.js';
import { Actor } from '../render/Actor.js';
import { battleSheet } from '../game/assets.js';
import { ATMOSPHERES } from '../data/atmospheres.js';
import { HERO_DATA } from '../data/heroes.js';
import { SKILLS, DUAL_TECHS, ELEMENTS, WEAPON_TYPES } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { ENEMIES, ENEMY_SKILLS, enemySheet, enemyGlowSheet } from '../data/enemies.js';
import { arenaMap, ARENA_W, ARENA_H, themeAtmosphere } from './arena.js';
import { Effects } from './effects.js';
import { h, ListCtl, wait } from '../ui/UI.js';
import { portraitURL } from '../ui/portraits.js';
import { updateOcclusion } from '../render/occlusion.js';

const HERO_SLOTS = [[2.8, -2.1], [4.4, -0.6], [2.8, 0.9], [4.4, 2.4]];
const ENEMY_SLOTS = {
  1: [[-3.4, 0.1]],
  2: [[-3.5, -1.5], [-2.6, 0.8]],
  3: [[-4.1, -2.2], [-2.5, -0.6], [-3.7, 1.1]],
  4: [[-4.6, -2.3], [-2.6, -1.3], [-4.3, 0.4], [-2.4, 1.3]],
};
const STATUS_NAMES = { veneno: 'Veneno', sono: 'Sono', lento: 'Lento' };
const STATUS_ICONS = { veneno: '☠', sono: '💤', lento: '🐌' };

function rnd(a, b) {
  return a + Math.random() * (b - a);
}

export class Battle {
  constructor(game, formation, opts = {}) {
    this.game = game;
    this.stage = game.stage;
    this.state = game.state;
    this.ui = game.ui;
    this.formation = formation;
    this.opts = opts;
    this.heroes = [];
    this.enemies = [];
    this.actionQueue = [];
    this.readyQueue = [];
    this.busy = false;
    this.menuOpen = false;
    this.done = false;
    this.time = 0;
    this.dom = [];
  }

  get all() {
    return [...this.heroes, ...this.enemies];
  }

  // -------------------------------------------------------------- montagem
  build() {
    const theme = this.opts.bg || this.game.field?.map?.battleBg || 'forest';
    const amap = arenaMap(theme, Math.floor(Math.random() * 1000));
    const W = buildWorld(amap, { night: true });
    this.W = W;
    this.stage.setWorld(W.group);
    const atmKey = this.opts.atmosphere || themeAtmosphere(theme);
    const atm = ATMOSPHERES[atmKey] || ATMOSPHERES.forest;
    this.stage.setAtmosphere(atm);
    this.stage.setPointLights(W.lights);
    const M = W.map.margin;
    this.center = new THREE.Vector3(M + ARENA_W / 2, W.groundHeight(M + ARENA_W / 2, M + 6) || 1, M + 6.2);
    this.stage.pitchOverride = THREE.MathUtils.degToRad(36);
    // chefes grandes: câmera mais afastada para caber o sprite inteiro
    const bigBoss = this.formation.some((k) => (enemySheet(k).fh || 0) > 60);
    this.stage.zoom = bigBoss ? 1.22 : 0.98;
    updateOcclusion(this.stage, null, false);
    this.stage.setCameraTarget(this.center.clone().add(new THREE.Vector3(0, bigBoss ? 1.6 : 0.8, 0.9)), true);
    this.effects = new Effects(W.group, this.stage);

    // heróis
    this.state.party.forEach((id, i) => {
      const hh = this.state.heroes[id];
      const s = this.state.stats(id);
      const a = new Actor(battleSheet(id), { floats: HERO_DATA[id] && id === 'estela' });
      a.lockFrame = true;
      const [ox, oz] = HERO_SLOTS[i % 4];
      const home = this.center.clone().add(new THREE.Vector3(ox, 0, oz));
      home.y = W.groundHeight(home.x, home.z) ?? this.center.y;
      a.setPosition(home.x, home.y, home.z);
      W.group.add(a.group);
      const c = {
        side: 'hero', id, name: HERO_DATA[id].name, actor: a, home,
        hp: hh.hp, mp: hh.mp, maxhp: s.hp, maxmp: s.mp,
        base: { atk: s.atk, def: s.def, mag: s.mag, res: s.res, spd: s.spd },
        atb: rnd(10, 45) + s.spd, buffs: {}, status: { ...(hh.status || {}) }, immune: this.state.immunities(id),
        weaponType: HERO_DATA[id].weaponType, skills: hh.skills.slice(), defending: false,
      };
      a.setFrame(c.hp > 0 ? 'idle' : 'ko');
      this.heroes.push(c);
    });

    // inimigos
    const n = this.formation.length;
    const slots = ENEMY_SLOTS[Math.min(4, n)];
    this.formation.forEach((kind, i) => {
      const e = ENEMIES[kind];
      const a = new Actor(enemySheet(kind), { floats: e.floats, blobSize: Math.min(3, enemySheet(kind).fw / 16) * 0.7 });
      a.lockFrame = true;
      a.setFrame('idle');
      a.setGlow(enemyGlowSheet(kind), 1.6);
      const [ox, oz] = slots[i] || [-3, i - 1];
      const home = this.center.clone().add(new THREE.Vector3(ox, 0, oz));
      home.y = W.groundHeight(home.x, home.z) ?? this.center.y;
      a.setPosition(home.x, home.y, home.z);
      W.group.add(a.group);
      const sameKind = this.formation.filter((k) => k === kind).length > 1;
      const letter = sameKind ? ' ' + 'ABCD'[this.formation.slice(0, i + 1).filter((k) => k === kind).length - 1] : '';
      const c = {
        side: 'enemy', id: kind, kind, name: e.name + letter, actor: a, home, data: e,
        hp: e.hp, maxhp: e.hp, mp: 99, maxmp: 99,
        base: { atk: e.atk, def: e.def, mag: e.mag, res: e.res, spd: e.spd },
        atb: rnd(0, 30), buffs: {}, status: {}, immune: new Set(e.boss ? ['sono'] : []),
        shield: e.shield, maxShield: e.shield, broken: 0, weak: e.weak, revealed: new Set(),
        boss: !!e.boss, alt: 0,
      };
      this.enemies.push(c);
    });
    this.buildHUD();
  }

  // -------------------------------------------------------------- HUD
  buildHUD() {
    const root = this.ui.root;
    this.partyWin = h('div', 'win battle-party');
    root.appendChild(this.partyWin);
    this.dom.push(this.partyWin);
    this.partyRows = this.heroes.map((c) => {
      const row = h('div', 'bp-row');
      row.innerHTML = `<span class="bp-name">${c.name}</span>
        <div><div class="bp-num"><span>HP</span><b class="hpn"></b></div><div class="bar"><i class="hpb"></i></div></div>
        <div><div class="bp-num"><span>MP</span><b class="mpn"></b></div><div class="bar mp"><i class="mpb"></i></div></div>
        <div><div class="bp-num"><span class="st"></span><span>ATB</span></div><div class="bar atb"><i class="atbb"></i></div></div>`;
      this.partyWin.appendChild(row);
      return row;
    });
    this.enemyTags = this.enemies.map((c) => {
      const t = h('div', 'enemy-tag');
      t.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onEnemyTap?.(c);
      });
      root.appendChild(t);
      this.dom.push(t);
      return t;
    });
    this.helpWin = h('div', 'win thin battle-help hidden');
    root.appendChild(this.helpWin);
    this.dom.push(this.helpWin);
    this.updateHUD(true);
  }

  help(text) {
    if (!text) this.helpWin.classList.add('hidden');
    else {
      this.helpWin.classList.remove('hidden');
      this.helpWin.innerHTML = text;
    }
  }

  project(v3) {
    const v = v3.clone().project(this.stage.camera);
    return { x: ((v.x + 1) / 2) * window.innerWidth, y: ((1 - v.y) / 2) * window.innerHeight };
  }

  updateHUD(full = false) {
    this.heroes.forEach((c, i) => {
      const r = this.partyRows[i];
      r.querySelector('.hpn').textContent = `${c.hp}/${c.maxhp}`;
      r.querySelector('.mpn').textContent = `${c.mp}`;
      r.querySelector('.hpb').style.width = (100 * c.hp) / c.maxhp + '%';
      r.querySelector('.mpb').style.width = (100 * c.mp) / Math.max(1, c.maxmp) + '%';
      r.querySelector('.atbb').style.width = Math.min(100, c.atb) + '%';
      r.querySelector('.bar.atb').classList.toggle('full', c.atb >= 100 && c.hp > 0);
      r.classList.toggle('ready', c.atb >= 100 && c.hp > 0);
      r.classList.toggle('ko', c.hp <= 0);
      r.classList.toggle('active', this.activeHero === c);
      r.querySelector('.st').textContent = Object.keys(c.status).map((s) => STATUS_ICONS[s] || '').join('');
      r.querySelector('.hpn').style.color = c.hp <= 0 ? 'var(--danger)' : c.hp < c.maxhp * 0.25 ? '#ffb84a' : '';
    });
    this.enemies.forEach((c, i) => {
      const t = this.enemyTags[i];
      if (c.hp <= 0) {
        t.style.display = 'none';
        return;
      }
      const top = c.actor.position.clone();
      const fh = (c.actor.sheet.fh / 16) * 1.18 * (c.actor.group.scale.y || 1);
      top.y += fh + 0.25 + (c.data.floats ? 0.3 : 0);
      const p = this.project(top);
      // empurra para baixo tags que colidem com as anteriores
      let py = p.y;
      for (let j = 0; j < i; j++) {
        const o = this._tagPos?.[j];
        if (o && Math.abs(o.x - p.x) < 150 && Math.abs(o.y - py) < 46) py = o.y + 48;
      }
      py = Math.max(64, py);
      (this._tagPos ||= [])[i] = { x: p.x, y: py };
      t.style.left = p.x + 'px';
      t.style.top = py + 'px';
      if (full || this._hudDirty) {
        const weak = c.weak.map((w) => (c.revealed.has(w) ? `<span title="${(ELEMENTS[w] || WEAPON_TYPES[w]).name}">${(ELEMENTS[w] || WEAPON_TYPES[w]).icon}</span>` : '<span>?</span>')).join('');
        t.innerHTML = `<div class="nm">${c.name}</div><div><span class="shield${c.broken ? ' broken' : ''}">${c.broken ? '✖' : c.shield}</span><span class="weak">${weak}</span></div><div class="hpbar"><i style="width:${(100 * c.hp) / c.maxhp}%"></i></div>`;
        t.classList.toggle('targetable', !!this.targeting && this.targeting.includes(c));
      }
    });
    this._hudDirty = false;
  }

  popup(c, text, cls = '') {
    const pos = c.actor.position.clone();
    pos.y += c.side === 'hero' ? 1.6 : (c.actor.sheet.fh / 16) * 0.7 + 0.4;
    const p = this.project(pos);
    const el = h('div', 'dmg ' + cls, text);
    el.style.left = p.x + (Math.random() - 0.5) * 20 + 'px';
    el.style.top = p.y + 'px';
    this.ui.root.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  async banner(text, ms = 900) {
    const el = h('div', 'win thin skill-name', text);
    this.ui.root.appendChild(el);
    await wait(ms);
    el.remove();
  }

  // -------------------------------------------------------------- execução
  run() {
    this.build();
    const music = this.opts.music || (this.enemies.some((e) => e.boss) ? 'boss' : 'battle');
    this.game.music(music);
    this.ui.fadeIn(350);
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.intro();
    });
  }

  async intro() {
    this.busy = true;
    const boss = this.enemies.find((e) => e.boss);
    if (boss) {
      await wait(300);
      await this.banner(`⚔ ${boss.name}`, 1300);
    } else {
      await wait(350);
    }
    if (this.opts.introScript) await this.opts.introScript(this);
    this.busy = false;
    if (this.game.debug?.autoWin) {
      await wait(400);
      for (const e of this.enemies) {
        e.hp = 0;
        this.onDeath(e);
      }
      this.checkEnd();
    }
  }

  speedOf(c) {
    let s = this.stat(c, 'spd');
    if (c.status.lento) s *= 0.5;
    return s;
  }

  stat(c, k) {
    let v = c.base[k];
    for (const b of Object.values(c.buffs)) if (b[k]) v *= 1 + b[k];
    return v;
  }

  update(dt) {
    if (this.done && !this.finishing) return;
    this.time += dt;
    this.effects?.update(dt);
    for (const c of this.all) {
      const a = c.actor;
      a.update(dt);
      if (c.side === 'enemy' && c.hp > 0 && !c.anim) {
        c.alt += dt;
        a.setFrame(Math.floor(c.alt * 2) % 2 ? 'alt' : 'idle');
      }
      if (c.side === 'hero' && !c.anim) {
        a.setFrame(c.hp <= 0 ? 'ko' : c.hp < c.maxhp * 0.25 || c.status.sono ? 'hurt' : 'idle');
      }
    }
    for (const u of this.W.updaters) u(dt, this.time);

    if (!this.done && !this.busy && !this.menuOpen) {
      // ATB
      for (const c of this.all) {
        if (c.hp <= 0 || c.waiting) continue;
        c.atb += dt * (22 + this.speedOf(c)) * 1.25;
        if (c.atb >= 100) {
          c.atb = 100;
          c.waiting = true;
          this.onTurnStart(c);
          break;
        }
      }
    }
    if (!this.done && !this.busy && !this.menuOpen) {
      if (this.actionQueue.length) {
        const act = this.actionQueue.shift();
        this.busy = true;
        this.execute(act).then(() => {
          this.busy = false;
          this.checkEnd();
        });
      } else {
        const ready = this.heroes.find((c) => c.waiting && c.hp > 0 && !c.queued);
        if (ready) this.openCommand(ready);
      }
    }
    this.updateHUD();
  }

  // começo do turno: estados, quebra, veneno
  onTurnStart(c) {
    // duração de buffs
    for (const [k, b] of Object.entries(c.buffs)) {
      b.turns--;
      if (b.turns <= 0) delete c.buffs[k];
    }
    c.defending = false;
    if (c.side === 'enemy' && c.broken) {
      c.broken = 0;
      c.shield = c.maxShield;
      c.atb = 0;
      c.waiting = false;
      this.popup(c, 'Recuperou!', 'label');
      this._hudDirty = true;
      return;
    }
    if (c.status.veneno) {
      const d = Math.max(1, Math.round(c.maxhp * 0.07));
      c.hp = Math.max(1, c.hp - d);
      this.popup(c, d, '');
      c.status.veneno--;
      if (c.status.veneno <= 0) delete c.status.veneno;
    }
    if (c.status.lento) {
      c.status.lento--;
      if (c.status.lento <= 0) delete c.status.lento;
    }
    if (c.status.sono) {
      c.status.sono--;
      if (c.status.sono <= 0) delete c.status.sono;
      this.popup(c, 'Zzz…', 'label');
      c.atb = 0;
      c.waiting = false;
      return;
    }
    if (c.side === 'enemy') {
      this.actionQueue.push(this.enemyAction(c));
      c.queued = true;
    }
  }

  // -------------------------------------------------------------- IA
  enemyAction(c) {
    const e = c.data;
    let skill;
    if (c.charging) {
      skill = ENEMY_SKILLS[c.charging];
      c.charging = null;
    } else {
      // pesos; evita carregar duas vezes seguidas e curas sem necessidade
      const opts = e.ai.filter(([s]) => {
        if (s.kind === 'heal') return this.enemies.some((x) => x.hp > 0 && x.hp < x.maxhp * 0.6);
        if (s.kind === 'charge') return c.hp < c.maxhp * 0.85 || Math.random() < 0.3;
        if (s.kind === 'buff' && s.target === 'self') return !Object.keys(c.buffs).length;
        return true;
      });
      const total = opts.reduce((a, [, w]) => a + w, 0);
      let r = Math.random() * total;
      for (const [s, w] of opts) {
        r -= w;
        if (r <= 0) {
          skill = s;
          break;
        }
      }
      skill = skill || opts[0][0];
    }
    return { actor: c, type: 'enemy', skill };
  }

  pickHeroTarget() {
    const alive = this.heroes.filter((x) => x.hp > 0);
    const taunter = alive.find((x) => x.buffs.taunt);
    if (taunter && Math.random() < 0.8) return taunter;
    return alive[Math.floor(Math.random() * alive.length)];
  }

  // -------------------------------------------------------------- comandos do jogador
  async openCommand(c) {
    this.menuOpen = true;
    this.activeHero = c;
    this.game.sfx('cursor');
    c.actor.flash = 0.25;
    const action = await this.commandMenu(c);
    this.activeHero = null;
    if (action) {
      if (action.type === 'dual') {
        action.partner.queued = true;
      }
      c.queued = true;
      this.actionQueue.push(action);
    }
    this.menuOpen = false;
  }

  closeCmd() {
    if (this.cmdWin) {
      this.cmdWin.remove();
      this.cmdWin = null;
    }
  }

  listMenu(title, items, opts = {}) {
    return new Promise((resolve) => {
      this.closeCmd();
      const win = h('div', 'win battle-cmd');
      win.appendChild(h('div', 'title', title));
      if (!opts.noCancel) {
        const back = h('div', 'menu-close', '↩');
        back.title = 'Voltar';
        back.addEventListener('click', (e) => {
          e.stopPropagation();
          this.ui.dispatch('cancel');
        });
        win.appendChild(back);
      }
      const desc = h('div', 'desc', '');
      this.ui.root.appendChild(win);
      this.cmdWin = win;
      const ctl = new ListCtl(win, items, {
        sound: (s) => this.game.sfx(s),
        index: opts.index || 0,
        onChange: (it) => (desc.textContent = it?.desc || ''),
        onSelect: (it) => {
          this.ui.pop(ctl);
          resolve(it);
        },
        onCancel: opts.noCancel ? null : () => {
          this.ui.pop(ctl);
          resolve(null);
        },
      });
      if (opts.showDesc) win.appendChild(desc);
      this.ui.push(ctl);
    });
  }

  availableDuals(c) {
    const out = [];
    for (const [k, d] of Object.entries(DUAL_TECHS)) {
      if (!d.users.includes(c.id)) continue;
      const otherId = d.users.find((u) => u !== c.id);
      const other = this.heroes.find((x) => x.id === otherId);
      if (!other) continue;
      const myMp = d.mp[d.users.indexOf(c.id)], oMp = d.mp[d.users.indexOf(otherId)];
      const ok = other.hp > 0 && other.waiting && !other.queued && c.mp >= myMp && other.mp >= oMp && !other.status.sono;
      out.push({ k, d, other, ok, myMp, oMp });
    }
    return out;
  }

  async commandMenu(c) {
    for (;;) {
      const duals = this.availableDuals(c);
      const canFlee = !this.enemies.some((e) => e.boss) && !this.opts.noFlee;
      const items = [
        { label: '⚔ Atacar', v: 'attack', desc: `Ataque com ${WEAPON_TYPES[c.weaponType].name.toLowerCase()} ${WEAPON_TYPES[c.weaponType].icon}` },
        { label: '✦ Técnicas', v: 'skill', desc: 'Usa MP.' },
      ];
      if (duals.length) items.push({ label: '✧ Duplas', v: 'dual', disabled: !duals.some((d) => d.ok), desc: 'Técnica em dupla (os dois precisam estar prontos).' });
      items.push({ label: '🎒 Itens', v: 'item', desc: '' });
      items.push({ label: '🛡 Defender', v: 'defend', desc: 'Reduz o dano pela metade até o próximo turno.' });
      if (canFlee) items.push({ label: '💨 Fugir', v: 'flee', desc: 'Tentar escapar.' });
      this.help(`<span style="color:var(--gold)">${c.name}</span> — o que fazer?`);
      const pick = await this.listMenu(c.name, items, { noCancel: true, index: this.lastCmd?.[c.id] || 0 });
      this.lastCmd = { ...(this.lastCmd || {}), [c.id]: items.indexOf(pick) };
      if (pick.v === 'attack') {
        const t = await this.chooseEnemy(c);
        if (t) return this.finishCmd({ actor: c, type: 'attack', targets: [t] });
      } else if (pick.v === 'skill') {
        const sk = await this.listMenu('Técnicas', c.skills.map((k) => {
          const s = SKILLS[k];
          return { label: s.name + (s.element ? ' ' + ELEMENTS[s.element].icon : ''), right: s.mp + ' MP', v: k, disabled: c.mp < s.mp, desc: s.desc };
        }), { showDesc: true });
        if (!sk) continue;
        const s = SKILLS[sk.v];
        const targets = await this.chooseTargets(c, s.target);
        if (targets) return this.finishCmd({ actor: c, type: 'skill', skill: s, skillId: sk.v, targets });
      } else if (pick.v === 'dual') {
        const dd = await this.listMenu('Técnicas Duplas', duals.map((d) => ({
          label: d.d.name, right: `${d.myMp}+${d.oMp} MP`, v: d, disabled: !d.ok,
          desc: `${d.d.desc} (com ${d.other.name})`,
        })), { showDesc: true });
        if (!dd) continue;
        const targets = await this.chooseTargets(c, dd.v.d.target);
        if (targets) return this.finishCmd({ actor: c, type: 'dual', dual: dd.v.d, partner: dd.v.other, targets, mp: [dd.v.myMp, dd.v.oMp] });
      } else if (pick.v === 'item') {
        const inv = Object.entries(this.state.inventory).filter(([k, q]) => q > 0 && ITEMS[k]?.battle);
        if (!inv.length) {
          this.game.sfx('error');
          continue;
        }
        const it = await this.listMenu('Itens', inv.map(([k, q]) => ({ label: `${ITEMS[k].icon || ''} ${ITEMS[k].name}`, right: 'x' + q, v: k, desc: ITEMS[k].desc })), { showDesc: true });
        if (!it) continue;
        const item = ITEMS[it.v];
        const targets = await this.chooseTargets(c, item.target);
        if (targets) return this.finishCmd({ actor: c, type: 'item', item: it.v, targets });
      } else if (pick.v === 'defend') {
        return this.finishCmd({ actor: c, type: 'defend' });
      } else if (pick.v === 'flee') {
        return this.finishCmd({ actor: c, type: 'flee' });
      }
    }
  }

  finishCmd(act) {
    this.closeCmd();
    this.help(null);
    return act;
  }

  async chooseTargets(c, kind) {
    if (kind === 'enemy') {
      const t = await this.chooseEnemy(c);
      return t ? [t] : null;
    }
    if (kind === 'enemies') return this.enemies.filter((e) => e.hp > 0);
    if (kind === 'self') return [c];
    if (kind === 'allies') return this.heroes.filter((x) => x.hp > 0);
    if (kind === 'ally' || kind === 'ally_ko') {
      const ko = kind === 'ally_ko';
      const pick = await this.listMenu('Em quem?', this.heroes.map((x) => ({
        label: x.name, right: `${x.hp}/${x.maxhp}`, v: x, disabled: ko ? x.hp > 0 : x.hp <= 0,
      })));
      return pick ? [pick.v] : null;
    }
    return null;
  }

  chooseEnemy(c) {
    return new Promise((resolve) => {
      const alive = this.enemies.filter((e) => e.hp > 0);
      let idx = 0;
      this.targeting = alive;
      this._hudDirty = true;
      this.help('Escolha o alvo (toque no inimigo)');
      const arrow = h('div', 'target-arrow', '▼');
      this.ui.root.appendChild(arrow);
      let alive2 = true;
      const place = () => {
        if (!alive2) return false;
        const t = alive[idx];
        const pos = t.actor.position.clone();
        pos.y += (t.actor.sheet.fh / 16) * 1.18 * (t.actor.group.scale.y || 1) + 1.1;
        const p = this.project(pos);
        arrow.style.left = p.x + 'px';
        arrow.style.top = p.y + 'px';
        return true;
      };
      this.game.addTicker(place);
      const finish = (t) => {
        alive2 = false;
        arrow.remove();
        this.targeting = null;
        this._hudDirty = true;
        this.onEnemyTap = null;
        this.ui.pop(ctl);
        this.help(null);
        resolve(t);
      };
      const ctl = {
        handle: (a) => {
          if (a === 'nav:ArrowLeft' || a === 'nav:ArrowUp') {
            idx = (idx - 1 + alive.length) % alive.length;
            this.game.sfx('cursor');
          } else if (a === 'nav:ArrowRight' || a === 'nav:ArrowDown') {
            idx = (idx + 1) % alive.length;
            this.game.sfx('cursor');
          } else if (a === 'confirm') {
            this.game.sfx('confirm');
            finish(alive[idx]);
          } else if (a === 'cancel') {
            this.game.sfx('cancel');
            finish(null);
          }
        },
      };
      this.onEnemyTap = (e) => {
        if (!alive.includes(e)) return;
        if (alive[idx] === e) {
          this.game.sfx('confirm');
          finish(e);
        } else {
          idx = alive.indexOf(e);
          this.game.sfx('cursor');
          // um toque escolhe direto no celular
          if (window.matchMedia('(pointer: coarse)').matches) finish(e);
        }
      };
      // toque no canvas: escolhe o inimigo mais próximo do toque
      const onCanvas = (ev) => {
        const x = ev.clientX, y = ev.clientY;
        let best = null, bd = 1e9;
        for (const e of alive) {
          const pos = e.actor.position.clone();
          pos.y += (e.actor.sheet.fh / 16) * 0.6;
          const p = this.project(pos);
          const d = Math.hypot(p.x - x, p.y - y);
          if (d < bd) {
            bd = d;
            best = e;
          }
        }
        if (best && bd < 140) this.onEnemyTap?.(best);
      };
      this.game.canvas.addEventListener('pointerdown', onCanvas, { once: true });
      const cancelBtn = h('div', 'win thin', '✕ Voltar');
      cancelBtn.style.cssText = 'left:max(10px,var(--safe-l));bottom:calc(10px + var(--safe-b));cursor:pointer;pointer-events:auto';
      cancelBtn.addEventListener('click', () => {
        this.game.canvas.removeEventListener('pointerdown', onCanvas);
        cancelBtn.remove();
        this.game.sfx('cancel');
        finish(null);
      });
      this.closeCmd();
      this.ui.root.appendChild(cancelBtn);
      const origFinish = finish;
      const wrapped = (t) => {
        cancelBtn.remove();
        this.game.canvas.removeEventListener('pointerdown', onCanvas);
        origFinish(t);
      };
      // garante limpeza em qualquer caminho
      ctl.handle = ((orig) => (a) => {
        if (a === 'confirm') {
          this.game.sfx('confirm');
          return wrapped(alive[idx]);
        }
        if (a === 'cancel') {
          this.game.sfx('cancel');
          return wrapped(null);
        }
        return orig(a);
      })(ctl.handle);
      this.onEnemyTap = (e) => {
        if (!alive.includes(e)) return;
        this.game.sfx('confirm');
        wrapped(e);
      };
      this.ui.push(ctl);
    });
  }

  // -------------------------------------------------------------- ações
  async execute(act) {
    const c = act.actor;
    c.waiting = false;
    c.queued = false;
    if (c.hp <= 0) return;
    // retarget se o alvo morreu
    if (act.targets) {
      act.targets = act.targets.map((t) => {
        if (t.hp > 0 || act.type === 'item' && ITEMS[act.item]?.effect?.revive || act.skill?.kind === 'revive') return t;
        const pool = (t.side === 'enemy' ? this.enemies : this.heroes).filter((x) => x.hp > 0);
        return pool[Math.floor(Math.random() * pool.length)];
      }).filter(Boolean);
      if (!act.targets.length && act.type !== 'defend' && act.type !== 'flee') {
        c.atb = 0;
        return;
      }
    }
    switch (act.type) {
      case 'attack':
        await this.doAttack(c, act.targets[0], { power: 1, hits: 1, type: c.weaponType, fx: c.id === 'brann' ? 'pierce' : c.weaponType === 'impacto' ? 'blunt' : 'slash' });
        break;
      case 'skill':
        c.mp -= act.skill.mp;
        await this.doSkill(c, act.skill, act.targets);
        break;
      case 'dual':
        await this.doDual(c, act);
        break;
      case 'item':
        await this.doItem(c, act.item, act.targets);
        break;
      case 'defend':
        c.defending = true;
        this.popup(c, 'Defesa', 'label');
        this.game.sfx('buff');
        await wait(300);
        break;
      case 'flee':
        await this.doFlee(c);
        break;
      case 'enemy':
        await this.doEnemy(c, act.skill);
        break;
    }
    c.atb = 0;
  }

  // distância de parada do avanço: metade da largura visível do alvo + folga
  reach(c, t) {
    const tw = (t.actor.sheet.fw / 16) * (t.actor.group.scale.x || 1);
    const visible = t.side === 'enemy' ? tw * 0.42 : 0.5;
    return visible + (c.side === 'hero' ? 1.0 : 0.9);
  }

  async lunge(c, target, dist = 1.4) {
    const a = c.actor;
    const from = c.home.clone();
    const dir = new THREE.Vector3().subVectors(target.actor.position, from);
    dir.y = 0;
    const len = dir.length();
    const to = from.clone().addScaledVector(dir.normalize(), Math.max(0, len - dist));
    await this.tween(0.22, (k) => a.position.lerpVectors(from, to, k * k));
    return async () => {
      await this.tween(0.22, (k) => a.position.lerpVectors(to, from, k));
      a.position.copy(c.home);
    };
  }

  tween(dur, fn) {
    return new Promise((resolve) => {
      let t = 0;
      this.game.addTicker((dt) => {
        t += dt;
        const k = Math.min(1, t / dur);
        fn(k);
        if (k >= 1) {
          resolve();
          return false;
        }
        return true;
      });
    });
  }

  heroAnim(c, frame, ms = 260) {
    c.anim = true;
    c.actor.setFrame(frame);
    return wait(ms).then(() => (c.anim = false));
  }

  async doAttack(c, t, { power = 1, hits = 1, type, element, fx = 'slash', name, shieldHits = 1, multiType } = {}) {
    if (name) this.banner(name, 900);
    c.anim = true;
    c.actor.setFrame('windup');
    const back = await this.lunge(c, t, this.reach(c, t));
    for (let i = 0; i < hits; i++) {
      if (t.hp <= 0) break;
      c.actor.setFrame('attack');
      this.effects.play(fx, t.actor.position, c.actor.position);
      this.game.sfx(element ? elementSfx(element) : type === 'perfuracao' ? 'pierce' : type === 'impacto' ? 'blunt' : 'slash');
      const tp = multiType ? multiType[i % multiType.length] : type;
      this.applyDamage(c, t, this.calcPhys(c, t, power), { type: tp, element, shieldHits });
      await wait(170);
      c.actor.setFrame('windup');
      await wait(60);
    }
    c.actor.setFrame('attack');
    await wait(120);
    await back();
    c.anim = false;
  }

  calcPhys(c, t, power) {
    const atk = this.stat(c, 'atk');
    const def = this.stat(t, 'def');
    return Math.max(1, atk * power * 1.5 - def * 0.75);
  }

  calcMag(c, t, power) {
    const mag = this.stat(c, 'mag');
    const res = this.stat(t, 'res');
    return Math.max(1, power * 0.65 + mag * 1.45 - res * 0.7);
  }

  // aplica dano com fraquezas, quebra, crítico e defesa
  applyDamage(src, t, base, { type, element, shieldHits = 1, noCrit = false } = {}) {
    let dmg = base * rnd(0.92, 1.08);
    let weakHit = false;
    let crit = false;
    if (t.side === 'enemy') {
      const keys = [type, element].filter(Boolean);
      for (const k of keys) {
        if (t.weak.includes(k)) {
          weakHit = true;
          if (!t.revealed.has(k)) {
            t.revealed.add(k);
            this._hudDirty = true;
          }
        }
      }
      if (weakHit) dmg *= 1.3;
      if (t.broken) dmg *= 1.6;
      if (weakHit && !t.broken) {
        t.shield = Math.max(0, t.shield - shieldHits);
        this._hudDirty = true;
        this.game.sfx('weak');
        if (t.shield <= 0) this.breakEnemy(t);
      }
    } else {
      if (t.defending) dmg *= 0.5;
    }
    if (!noCrit && Math.random() < 0.06) {
      crit = true;
      dmg *= 1.5;
    }
    dmg = Math.max(1, Math.round(dmg));
    t.hp = Math.max(0, t.hp - dmg);
    t.actor.flash = 0.9;
    if (t.status.sono) delete t.status.sono;
    this.popup(t, dmg, crit ? 'crit' : weakHit ? 'weak' : '');
    if (weakHit) this.popup(t, 'FRACO!', 'label');
    if (crit) this.game.sfx('crit');
    this.knock(t);
    if (t.hp <= 0) this.onDeath(t);
    return dmg;
  }

  breakEnemy(t) {
    t.broken = 1;
    t.atb = 0;
    t.waiting = false;
    t.queued = false;
    // cancela ação na fila e carga
    this.actionQueue = this.actionQueue.filter((a) => a.actor !== t);
    if (t.charging) {
      t.charging = null;
      setTimeout(() => this.popup(t, 'Carga interrompida!', 'label'), 300);
    }
    this.game.sfx('break');
    this.effects.play('break', t.actor.position);
    this.popup(t, 'QUEBRA!', 'break');
    this.stage.shake = 0.5;
    this._hudDirty = true;
  }

  knock(t) {
    const a = t.actor;
    const dir = t.side === 'enemy' ? -1 : 1;
    const base = t.home.clone();
    if (t.side === 'hero' && t.hp > 0) {
      t.anim = true;
      a.setFrame('hurt');
      setTimeout(() => (t.anim = false), 380);
    }
    this.tween(0.25, (k) => {
      const off = Math.sin(k * Math.PI) * 0.25 * dir;
      a.position.x = base.x + off;
    });
  }

  onDeath(t) {
    if (t.side === 'enemy') {
      this.game.sfx('enemy_die');
      this.effects.play('death', t.actor.position);
      const a = t.actor;
      t.anim = true;
      this.tween(0.7, (k) => {
        a.material.opacity = 1 - k;
        a.material.transparent = true;
        a.material.alphaTest = 0.01;
        a.material.emissive.setRGB(1 - k * 0.5, 0.3, 0.6);
        a.material.emissiveMap = null;
        a.group.scale.y = (1 - k * 0.3);
        if (a.blob) a.blob.material.opacity = 0.9 * (1 - k);
      }).then(() => (a.group.visible = false));
      this.actionQueue = this.actionQueue.filter((x) => x.actor !== t);
      this._hudDirty = true;
    } else {
      this.game.sfx('ko');
      t.status = {};
      t.buffs = {};
      t.atb = 0;
      t.waiting = false;
      t.queued = false;
      this.actionQueue = this.actionQueue.filter((x) => x.actor !== t && x.partner !== t);
    }
  }

  async doSkill(c, s, targets) {
    if (s.kind === 'phys') {
      this.banner(s.name, 900);
      if (s.target === 'enemies') {
        c.anim = true;
        c.actor.setFrame('windup');
        await wait(250);
        c.actor.setFrame('attack');
        this.game.sfx(s.element ? elementSfx(s.element) : 'slash');
        for (const t of targets) {
          if (t.hp <= 0) continue;
          this.effects.play(s.fx, t.actor.position);
          this.applyDamage(c, t, this.calcPhys(c, t, s.power), { type: c.weaponType, element: s.element });
          await wait(90);
        }
        await wait(300);
        c.anim = false;
      } else {
        await this.doAttack(c, targets[0], { power: s.power, hits: s.hits || 1, type: c.weaponType, element: s.element, fx: s.fx });
      }
      return;
    }
    // técnicas mágicas / suporte
    this.banner(s.name, 1000);
    c.anim = true;
    c.actor.setFrame('cast');
    this.effects.play('cast', c.actor.position, true);
    this.game.sfx('magic');
    await wait(420);
    if (s.kind === 'mag') {
      for (const t of targets) {
        if (t.hp <= 0) continue;
        this.effects.play(s.fx, t.actor.position, c.actor.position);
        this.game.sfx(elementSfx(s.element));
        this.applyDamage(c, t, this.calcMag(c, t, s.power), { element: s.element });
        await wait(120);
      }
    } else if (s.kind === 'gravity') {
      for (const t of targets) {
        this.effects.play('gravity', t.actor.position);
        this.game.sfx('quake');
        const dmg = t.boss ? Math.round(t.hp * 0.08) : Math.round(t.hp * s.power);
        this.applyDamage(c, t, Math.max(1, dmg), { element: s.element, noCrit: true });
      }
    } else if (s.kind === 'heal') {
      for (const t of targets) {
        if (t.hp <= 0) continue;
        const amt = Math.round(s.power + this.stat(c, 'mag') * 1.6);
        this.heal(t, amt);
      }
    } else if (s.kind === 'revive') {
      for (const t of targets) {
        if (t.hp > 0) continue;
        this.effects.play('revive', t.actor.position);
        t.hp = Math.round(t.maxhp * s.power);
        this.popup(t, t.hp, 'heal');
        this.game.sfx('heal');
      }
    } else if (s.kind === 'cure') {
      for (const t of targets) {
        t.status = {};
        this.effects.play('heal', t.actor.position);
        this.popup(t, 'Purificado', 'label');
        this.game.sfx('heal');
      }
    } else if (s.kind === 'buff' || s.kind === 'taunt') {
      for (const t of targets) {
        t.buffs[s.name] = { ...s.buff, turns: (s.turns || 3) + 1 };
        if (s.kind === 'taunt') t.buffs.taunt = { turns: (s.turns || 3) + 1 };
        this.effects.play(s.fx || 'buff', t.actor.position);
        this.popup(t, Object.keys(s.buff).map((k) => ({ atk: 'ATQ', def: 'DEF', mag: 'MAG', res: 'RES', spd: 'AGI' })[k] + '↑').join(' '), 'label');
      }
      this.game.sfx('buff');
    }
    await wait(500);
    c.anim = false;
  }

  heal(t, amt) {
    t.hp = Math.min(t.maxhp, t.hp + amt);
    this.effects.play('heal', t.actor.position);
    this.popup(t, amt, 'heal');
    this.game.sfx('heal');
  }

  async doDual(c, act) {
    const d = act.dual;
    const p = act.partner;
    c.mp -= act.mp[0];
    p.mp -= act.mp[1];
    p.waiting = false;
    p.queued = false;
    p.atb = 0;
    this.actionQueue = this.actionQueue.filter((x) => x.actor !== p);
    await this.banner(`✧ ${d.name} ✧`, 1100);
    c.anim = p.anim = true;
    c.actor.setFrame('cast');
    p.actor.setFrame('cast');
    this.effects.play('cast', c.actor.position, true);
    this.effects.play('cast', p.actor.position, true);
    this.game.sfx('magic');
    this.ui.flash(200, '#fff', 0.5);
    await wait(500);
    if (d.kind === 'phys') {
      c.anim = false;
      p.actor.setFrame('attack');
      for (const t of act.targets) {
        await this.doAttack(c, t, { power: d.power, hits: d.hits || 1, type: c.weaponType, element: d.element, fx: d.fx, shieldHits: d.shieldHits || 1, multiType: d.multiType });
      }
    } else if (d.kind === 'mag') {
      const caster = { ...c, base: { ...c.base, mag: Math.max(this.stat(c, 'mag'), this.stat(p, 'mag')) * 1.15 } };
      for (const t of act.targets) {
        if (t.hp <= 0) continue;
        this.effects.play(d.fx, t.actor.position, c.actor.position);
        this.game.sfx(elementSfx(d.element));
        this.applyDamage(caster, t, this.calcMag(caster, t, d.power), { element: d.element, shieldHits: 1 });
        if (d.extraElement && t.hp > 0 && t.weak.includes(d.extraElement)) this.applyDamage(caster, t, this.calcMag(caster, t, d.power * 0.3), { element: d.extraElement });
        await wait(140);
      }
      if (d.healAll) for (const hh of this.heroes) if (hh.hp > 0) this.heal(hh, Math.round(d.healAll + this.stat(c, 'mag')));
    } else if (d.kind === 'heal') {
      for (const hh of this.heroes) {
        if (hh.hp <= 0) continue;
        this.heal(hh, Math.round(d.power + Math.max(this.stat(c, 'mag'), this.stat(p, 'mag')) * 1.6));
        if (d.buff) hh.buffs[d.name] = { ...d.buff, turns: (d.turns || 3) + 1 };
      }
      this.game.sfx('buff');
    }
    await wait(450);
    c.anim = p.anim = false;
  }

  async doItem(c, itemId, targets) {
    const it = ITEMS[itemId];
    this.state.addItem(itemId, -1);
    this.banner(it.name, 800);
    c.anim = true;
    c.actor.setFrame('cast');
    await wait(300);
    const e = it.effect;
    for (const t of targets) {
      if (e.damage) {
        this.effects.play('explosion', t.actor.position);
        this.game.sfx('explosion');
        this.applyDamage(c, t, e.damage, { element: e.element, noCrit: true });
        continue;
      }
      if (e.revive) {
        if (t.hp <= 0) {
          t.hp = Math.max(1, Math.round(t.maxhp * e.revive));
          this.effects.play('revive', t.actor.position);
          this.popup(t, t.hp, 'heal');
          this.game.sfx('heal');
        }
        continue;
      }
      if (t.hp <= 0) continue;
      if (e.heal || e.healAll) this.heal(t, Math.min(t.maxhp - t.hp, e.heal || e.healAll) || 0);
      if (e.mp || e.mpAll) {
        const amt = Math.min(t.maxmp - t.mp, e.mp || e.mpAll);
        t.mp += amt;
        this.popup(t, amt, 'mp');
      }
      if (e.cure) for (const s of e.cure) delete t.status[s];
    }
    await wait(400);
    c.anim = false;
  }

  async doFlee(c) {
    const ps = this.heroes.filter((x) => x.hp > 0).reduce((a, x) => a + this.stat(x, 'spd'), 0) / Math.max(1, this.heroes.filter((x) => x.hp > 0).length);
    const es = this.enemies.filter((x) => x.hp > 0).reduce((a, x) => a + this.stat(x, 'spd'), 0) / Math.max(1, this.enemies.filter((x) => x.hp > 0).length);
    const chance = Math.min(0.92, Math.max(0.35, 0.6 + (ps - es) * 0.03 + (this.fleeTries || 0) * 0.15));
    this.fleeTries = (this.fleeTries || 0) + 1;
    if (Math.random() < chance) {
      this.game.sfx('flee');
      await this.banner('Fugiu!', 700);
      for (const hh of this.heroes) {
        const a = hh.actor;
        const from = a.position.clone();
        this.tween(0.5, (k) => (a.position.x = from.x + k * 6));
      }
      await wait(500);
      this.end('flee');
    } else {
      this.game.sfx('error');
      await this.banner('Não conseguiu fugir!', 800);
    }
  }

  async doEnemy(c, s) {
    if (s.kind === 'charge') {
      c.charging = s.next;
      this.banner(s.name, 900);
      this.effects.play('charge', c.actor.position);
      this.game.sfx('steam');
      if (s.msg) {
        this.help(s.msg + ' <span style="color:var(--gold)">Quebre o escudo para interromper!</span>');
        setTimeout(() => this.help(null), 2600);
      }
      await wait(700);
      return;
    }
    if (s.name !== 'Ataque') this.banner(s.name, 900);
    if (s.kind === 'phys') {
      if (s.target === 'heroes') {
        c.actor.flash = 0.6;
        await wait(250);
        for (const t of this.heroes.filter((x) => x.hp > 0)) {
          this.effects.play(s.fx || 'slash', t.actor.position);
          this.applyDamage(c, t, this.calcPhys(c, t, s.power), {});
          await wait(80);
        }
        this.game.sfx('slash');
      } else {
        const t = this.pickHeroTarget();
        if (!t) return;
        const back = await this.lunge(c, t, this.reach(c, t));
        for (let i = 0; i < (s.hits || 1); i++) {
          if (t.hp <= 0) break;
          this.effects.play(s.fx || 'slash', t.actor.position);
          this.game.sfx('hit');
          this.applyDamage(c, t, this.calcPhys(c, t, s.power), {});
          if (s.status && Math.random() < (s.chance || 0.4)) this.inflict(t, s.status);
          await wait(160);
        }
        await back();
      }
    } else if (s.kind === 'mag') {
      c.actor.flash = 0.7;
      this.game.sfx('magic');
      await wait(350);
      const targets = s.target === 'heroes' ? this.heroes.filter((x) => x.hp > 0) : [this.pickHeroTarget()].filter(Boolean);
      for (const t of targets) {
        this.effects.play(s.fx, t.actor.position, c.actor.position);
        this.game.sfx(elementSfx(s.element));
        this.applyDamage(c, t, this.calcMag(c, t, s.power), {});
        await wait(100);
      }
    } else if (s.kind === 'status') {
      c.actor.flash = 0.5;
      await wait(300);
      const targets = s.target === 'heroes' ? this.heroes.filter((x) => x.hp > 0) : [this.pickHeroTarget()].filter(Boolean);
      for (const t of targets) {
        this.effects.play(s.fx, t.actor.position);
        if (Math.random() < (s.chance || 0.5)) this.inflict(t, s.status);
        else this.popup(t, 'Errou', 'label');
      }
      this.game.sfx('magic');
    } else if (s.kind === 'buff') {
      const targets = s.target === 'allies' ? this.enemies.filter((x) => x.hp > 0) : [c];
      for (const t of targets) {
        t.buffs[s.name] = { ...s.buff, turns: (s.turns || 3) + 1 };
        this.effects.play(s.fx || 'buff', t.actor.position);
      }
      this.game.sfx('buff');
    } else if (s.kind === 'heal') {
      const t = this.enemies.filter((x) => x.hp > 0).sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0];
      if (t) this.heal(t, s.power);
    }
    await wait(350);
  }

  inflict(t, status) {
    if (t.immune?.has(status)) {
      this.popup(t, 'Imune', 'label');
      return;
    }
    t.status[status] = status === 'sono' ? 2 : 3;
    this.popup(t, STATUS_NAMES[status], 'label');
  }

  // -------------------------------------------------------------- fim
  checkEnd() {
    if (this.done) return;
    if (this.enemies.every((e) => e.hp <= 0)) this.victory();
    else if (this.heroes.every((x) => x.hp <= 0)) this.defeat();
  }

  async victory() {
    this.done = true;
    this.finishing = true;
    this.closeCmd();
    this.help(null);
    await wait(600);
    this.game.music('victory');
    for (const c of this.heroes) {
      if (c.hp > 0) {
        c.anim = true;
        c.actor.setFrame('win');
      }
    }
    const exp = this.enemies.reduce((a, e) => a + e.data.exp, 0);
    const gold = this.enemies.reduce((a, e) => a + e.data.gold, 0);
    const drops = [];
    for (const e of this.enemies) for (const [item, ch] of e.data.drops || []) if (Math.random() < ch) drops.push(item);
    this.syncState();
    this.state.gold += gold;
    for (const d of drops) this.state.addItem(d, 1);
    const ups = exp ? this.state.gainExp(exp) : [];
    // janela de resultados
    const win = h('div', 'win results');
    let html = `<div class="section-title" style="text-align:center">Vitória!</div>
      <div class="row"><span>EXP</span><span style="color:var(--gold)">${exp}</span></div>
      <div class="row"><span>Moedas</span><span style="color:var(--gold)">${gold}</span></div>`;
    if (drops.length) html += `<div class="row"><span>Itens</span><span>${drops.map((d) => ITEMS[d].name).join(', ')}</span></div>`;
    for (const u of ups) {
      html += `<div class="row" style="color:#8affa0"><span>${HERO_DATA[u.id].name} subiu para o Nv ${u.level}!</span><span>HP ${u.after.hp}</span></div>`;
      for (const l of u.learned) html += `<div class="row" style="color:#8ff2ff"><span>&nbsp;&nbsp;Aprendeu ${SKILLS[l].name}!</span></div>`;
    }
    win.innerHTML = html;
    this.ui.root.appendChild(win);
    if (ups.length) this.game.sfx('levelup');
    await this.waitTap(900);
    win.remove();
    this.end('win');
  }

  waitTap(minMs = 600) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const ctl = {
        handle: (a) => {
          if ((a === 'confirm' || a === 'cancel') && performance.now() - t0 > minMs) {
            this.ui.pop(ctl);
            window.removeEventListener('pointerdown', onTap);
            resolve();
          }
        },
      };
      const onTap = () => ctl.handle('confirm');
      window.addEventListener('pointerdown', onTap);
      this.ui.push(ctl);
    });
  }

  async defeat() {
    this.done = true;
    this.finishing = true;
    this.closeCmd();
    this.help(null);
    await wait(800);
    if (this.opts.canLose) {
      this.syncState(true);
      this.end('lose-ok');
      return;
    }
    this.end('lose');
  }

  syncState(reviveOne = false) {
    for (const c of this.heroes) {
      const hh = this.state.heroes[c.id];
      hh.hp = c.hp;
      hh.mp = Math.max(0, c.mp);
      hh.status = {};
      if (c.status.veneno) hh.status.veneno = c.status.veneno;
    }
    if (reviveOne) for (const c of this.heroes) if (this.state.heroes[c.id].hp <= 0) this.state.heroes[c.id].hp = 1;
  }

  end(result) {
    if (result === 'flee') this.syncState();
    this.done = true;
    this.closeCmd();
    for (const el of this.dom) el.remove();
    this.help(null);
    while (this.ui.focus.length) this.ui.focus.pop();
    this.resolve(result === 'lose-ok' ? 'lose-ok' : result);
  }
}

function elementSfx(el) {
  return { fogo: 'fire', gelo: 'ice', raio: 'thunder', luz: 'light', vento: 'wind', terra: 'quake', trevas: 'magic' }[el] || 'magic';
}
