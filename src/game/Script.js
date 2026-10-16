// Contexto de scripts (cutscenes/eventos). Scripts são funções async(ctx).
// Coordenadas de tile usadas pelos scripts são as do mapa original (sem margem).
import * as THREE from 'three';
import { HERO_DATA } from '../data/heroes.js';
import { ITEMS } from '../data/items.js';
import { wait, h } from '../ui/UI.js';

export const NAMES = {
  lio: 'Lio', sena: 'Sena', estela: 'Estela', brann: 'Brann', odessa: 'Vó Odessa', varek: 'Capitão Varek',
  soldado: 'Soldado', pescador: 'Pescador', mercadora: 'Mercadora', crianca: 'Tito', menina: 'Lina',
  anciao: 'Ancião Bento', estalajadeira: 'Rosa', mineiro: 'Mineiro',
};
const PORTRAITED = new Set(['lio', 'sena', 'estela', 'brann', 'odessa', 'varek', 'soldado']);

export class ScriptContext {
  constructor(game, extra = {}) {
    this.game = game;
    Object.assign(this, extra);
  }

  get state() {
    return this.game.state;
  }

  get f() {
    return this.game.field;
  }

  get ui() {
    return this.game.ui;
  }

  m(v) {
    return v + (this.f?.map?.margin || 0);
  }

  // -------------------------------------------------------------- fala
  speaker(who, expr) {
    if (!who) return null;
    if (typeof who === 'object') return who;
    const [id, ex] = who.split(':');
    return { name: NAMES[id] || HERO_DATA[id]?.name || id, portrait: PORTRAITED.has(id) ? id : id, expr: expr || ex || 'neutral' };
  }

  say(who, text, expr) {
    return this.ui.say(this.speaker(who, expr), text);
  }

  async lines(list) {
    for (const l of list) {
      if (typeof l === 'string') await this.say(null, l);
      else await this.say(l[0], l[1], l[2]);
    }
  }

  choose(options, opts) {
    return this.ui.choose(options, opts);
  }

  wait(ms) {
    return wait(ms);
  }

  fadeOut(ms = 500, color) {
    return this.ui.fadeOut(ms, color);
  }

  fadeIn(ms = 500) {
    return this.ui.fadeIn(ms);
  }

  flash(ms, color, peak) {
    return this.ui.flash(ms, color, peak);
  }

  shake(amount = 0.4) {
    this.game.stage.shake = amount;
  }

  sfx(id) {
    this.game.sfx(id);
  }

  music(id) {
    this.game.music(id);
  }

  stopMusic(fade = 1) {
    this.game.stopMusic(fade);
  }

  banner(t, s) {
    this.ui.banner(t, s);
  }

  async chapter(title, sub) {
    await this.fadeOut(600);
    const card = h('div', 'banner on', `<div class="s">${sub || ''}</div><div class="line"></div><div class="t">${title}</div><div class="line"></div>`);
    card.style.top = '40%';
    card.style.opacity = '0';
    this.ui.root.appendChild(card);
    await wait(50);
    card.style.opacity = '1';
    await wait(2600);
    card.style.opacity = '0';
    await wait(900);
    card.remove();
  }

  // -------------------------------------------------------------- atores
  actor(id) {
    return this.f.actorById(id);
  }

  face(id, dir) {
    const a = this.actor(id);
    if (a) a.facing = dir;
  }

  // anda pelos pontos (tile coords do mapa original; centro do tile)
  async move(id, points, speed = 2.6) {
    const a = this.actor(id);
    if (!a) return;
    const isPlayer = a === this.f.player;
    const npc = [...this.f.npcs.values()].find((n) => n.actor === a);
    if (npc) npc.scripted = true;
    const fol = this.f.followers.includes(a);
    if (fol) a.scripted = true;
    if (isPlayer) this.f.scriptMoving = true;
    for (const [tx0, tz0] of points) {
      const tx = this.m(tx0) + 0.5, tz = this.m(tz0) + 0.5;
      await new Promise((resolve) => {
        const step = (dt) => {
          const p = a.position;
          const dx = tx - p.x, dz = tz - p.z;
          const d = Math.hypot(dx, dz);
          if (d < 0.05) {
            p.x = tx;
            p.z = tz;
            return true;
          }
          const s = Math.min(d, speed * dt);
          p.x += (dx / d) * s;
          p.z += (dz / d) * s;
          a.facing = Math.abs(dx) > Math.abs(dz) ? (dx < 0 ? 'left' : 'right') : dz < 0 ? 'up' : 'down';
          a.moving = true;
          return false;
        };
        this.game.addTicker((dt) => {
          const done = step(dt);
          if (done) resolve();
          return !done;
        });
      });
    }
    a.moving = false;
    if (isPlayer) this.f.scriptMoving = false;
  }

  // posiciona instantaneamente
  place(id, x, y, dir) {
    const a = this.actor(id);
    if (!a) return;
    this.f.placeActor(a, this.m(x) + 0.5, this.m(y) + 0.5);
    if (dir) a.facing = dir;
  }

  spawn(spec) {
    const n = this.f.addNpc({ ...spec, x: this.m(spec.x), y: this.m(spec.y) });
    if (n) n.scripted = !spec.wander;
    return n;
  }

  remove(id) {
    this.f.removeNpc(id);
  }

  // reúne os seguidores no líder (para cutscenes) ou libera
  gather() {
    for (const f of this.f.followers) f.scripted = true;
  }

  release() {
    for (const f of this.f.followers) f.scripted = false;
    for (const n of this.f.npcs.values()) n.scripted = false;
  }

  emote(id, symbol = '!', ms = 1100) {
    const a = this.actor(id);
    if (!a) return wait(0);
    const el = h('div', 'emote', symbol);
    el.style.cssText = 'position:absolute;transform:translate(-50%,-100%);font-size:calc(var(--fs)*1.4);background:#fff;color:#222;border-radius:10px;padding:0 8px;border:2px solid #222;text-shadow:none;pointer-events:none;animation:pop .2s ease-out';
    this.ui.root.appendChild(el);
    const v = new THREE.Vector3();
    let alive = true;
    this.game.addTicker(() => {
      if (!alive) return false;
      v.set(a.position.x, a.position.y + 2.7, a.position.z);
      v.project(this.game.stage.camera);
      el.style.left = ((v.x + 1) / 2) * window.innerWidth + 'px';
      el.style.top = ((1 - v.y) / 2) * window.innerHeight + 'px';
      return true;
    });
    this.sfx(symbol === '!' ? 'confirm' : 'cursor');
    return wait(ms).then(() => {
      alive = false;
      el.remove();
    });
  }

  // inimigo estático para cutscenes (sem IA)
  showEnemy(kind, x, y, scale) {
    const e = this.f.addEnemy({ id: 'cut_' + kind + Math.random(), kind, x: this.m(x), y: this.m(y), scale });
    e.stun = 1e9;
    e.cutscene = true;
    return e;
  }

  hideEnemy(e) {
    if (!e) return;
    this.f.world.group.remove(e.actor.group);
    this.f.enemies = this.f.enemies.filter((x) => x !== e);
  }

  // empurra o jogador um passo na direção dada
  async stepBack(dir = 'down', dist = 0.9) {
    const a = this.f.player;
    const d = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[dir];
    const from = a.position.clone();
    const facing = a.facing;
    const t0 = performance.now();
    await new Promise((resolve) => {
      this.game.addTicker(() => {
        const k = Math.min(1, (performance.now() - t0) / 260);
        a.position.x = from.x + d[0] * dist * k;
        a.position.z = from.z + d[1] * dist * k;
        a.moving = true;
        if (k >= 1) {
          a.moving = false;
          a.facing = facing;
          resolve();
          return false;
        }
        return true;
      });
    });
    this.f.pushTrail();
  }

  objective(text) {
    this.state.set('objetivo', text);
    this.ui.toast(`<span style="color:var(--gold)">★ Objetivo:</span> ${text}`, 3800);
  }

  // -------------------------------------------------------------- câmera
  async camera(x, y, ms = 800) {
    const f = this.f;
    f.cameraLocked = true;
    const target = new THREE.Vector3(this.m(x) + 0.5, f.hAt(this.m(x) + 0.5, this.m(y) + 0.5) + 0.4, this.m(y) + 0.5);
    this.game.stage.setCameraTarget(target);
    await wait(ms);
  }

  cameraFollow() {
    this.f.cameraLocked = false;
  }

  zoom(z = 1) {
    this.game.stage.zoom = z;
  }

  // -------------------------------------------------------------- estado
  flag(k) {
    return this.state.flag(k);
  }

  set(k, v = true) {
    this.state.set(k, v);
  }

  itemName(id) {
    return ITEMS[id]?.name || id;
  }

  give(id, qty = 1, silent = false) {
    this.state.addItem(id, qty);
    this.sfx('item');
    if (!silent) this.ui.toast(`Recebeu <span style="color:var(--gold)">${this.itemName(id)}</span>${qty > 1 ? ' x' + qty : ''}`);
  }

  gold(n) {
    this.state.gold += n;
    this.ui.toast(`+${n} moedas`);
  }

  async join(id, level) {
    const lv = level || Math.max(1, this.state.averageLevel());
    this.state.addHero(id, lv);
    const a = this.f.makeActor(id);
    const p = this.f.player.position;
    this.f.placeActor(a, p.x, p.z);
    a.facing = this.f.player.facing;
    this.f.followers.push(a);
    this.sfx('levelup');
    await this.say(null, `*${HERO_DATA[id].name}* (${HERO_DATA[id].cls}) entrou para o grupo!`);
  }

  heal() {
    this.state.healAll();
    this.sfx('heal');
  }

  battle(formation, opts = {}) {
    return this.game.battle(formation, opts);
  }

  teleport(mapId, spawn) {
    return this.game.changeMap(mapId, spawn, { noBanner: false, keepLock: true });
  }

  shop(list) {
    return this.game.openShop(list);
  }

  saveMenu() {
    return this.game.openSave();
  }
}
