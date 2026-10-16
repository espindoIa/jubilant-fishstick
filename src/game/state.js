// Estado do jogo: grupo, inventário, ouro, flags e save/load.
import { HERO_DATA, expToNext } from '../data/heroes.js';
import { ITEMS } from '../data/items.js';
import { bondsOf, BOND_HP_BONUS } from '../data/camp.js';

const SAVE_KEY = 'ecos-da-aurora-save-v1';
const STATS = ['hp', 'mp', 'atk', 'def', 'mag', 'res', 'spd'];

export class GameState {
  constructor() {
    this.party = [];
    this.heroes = {};
    this.inventory = {};
    this.gold = 0;
    this.flags = {};
    this.mapId = null;
    this.pos = null;
    this.playTime = 0;
    this.opened = {};
    this.defeated = {};
    this.settings = { music: 0.7, sfx: 0.8, quality: null, textSpeed: 1, difficulty: 'normal' };
  }

  // ------------------------------------------------------------- heróis
  addHero(id, level = 1) {
    if (this.heroes[id]) {
      if (!this.party.includes(id)) this.party.push(id);
      return this.heroes[id];
    }
    const d = HERO_DATA[id];
    const h = {
      id,
      level: 1,
      exp: 0,
      hp: 1,
      mp: 1,
      equip: { ...d.equip },
      skills: [],
      status: {},
    };
    this.heroes[id] = h;
    this.party.push(id);
    for (let l = 1; l <= level; l++) this.learnAt(h, l);
    h.level = level;
    const s = this.stats(id);
    h.hp = s.hp;
    h.mp = s.mp;
    return h;
  }

  learnAt(h, level) {
    const learned = [];
    for (const sk of HERO_DATA[h.id].learn[level] || []) {
      if (!h.skills.includes(sk)) {
        h.skills.push(sk);
        learned.push(sk);
      }
    }
    return learned;
  }

  baseStats(id, level) {
    const d = HERO_DATA[id];
    const out = {};
    for (const k of STATS) out[k] = Math.round(d.base[k] + d.grow[k] * (level - 1));
    return out;
  }

  stats(id) {
    const h = this.heroes[id];
    const s = this.baseStats(id, h.level);
    for (const slot of ['weapon', 'armor', 'acc']) {
      const it = h.equip[slot] && ITEMS[h.equip[slot]];
      if (!it) continue;
      for (const [k, v] of Object.entries(it.stats || {})) s[k] = (s[k] || 0) + v;
    }
    // cada Vínculo concluído dá +4% de HP máximo
    s.hp = Math.round(s.hp * (1 + BOND_HP_BONUS * bondsOf(this, id)));
    return s;
  }

  immunities(id) {
    const h = this.heroes[id];
    const out = new Set();
    for (const slot of ['weapon', 'armor', 'acc']) {
      const it = h.equip[slot] && ITEMS[h.equip[slot]];
      for (const s of it?.immune || []) out.add(s);
    }
    return out;
  }

  // distribui EXP; devolve lista de eventos de subida de nível
  gainExp(amount) {
    const events = [];
    for (const id of this.party) {
      const h = this.heroes[id];
      const gain = h.hp > 0 ? amount : Math.floor(amount / 2);
      h.exp += gain;
      while (h.exp >= expToNext(h.level) && h.level < 50) {
        h.exp -= expToNext(h.level);
        const before = this.stats(id);
        h.level++;
        const after = this.stats(id);
        const learned = this.learnAt(h, h.level);
        // sobe HP/MP proporcionalmente
        h.hp = Math.min(after.hp, h.hp + (after.hp - before.hp));
        h.mp = Math.min(after.mp, h.mp + (after.mp - before.mp));
        events.push({ id, level: h.level, before, after, learned });
      }
    }
    return events;
  }

  healAll() {
    for (const id of Object.keys(this.heroes)) {
      const s = this.stats(id);
      const h = this.heroes[id];
      h.hp = s.hp;
      h.mp = s.mp;
      h.status = {};
    }
  }

  averageLevel() {
    if (!this.party.length) return 1;
    return Math.round(this.party.reduce((a, id) => a + this.heroes[id].level, 0) / this.party.length);
  }

  // ------------------------------------------------------------- itens
  addItem(id, qty = 1) {
    this.inventory[id] = (this.inventory[id] || 0) + qty;
    if (this.inventory[id] <= 0) delete this.inventory[id];
  }

  hasItem(id) {
    return (this.inventory[id] || 0) > 0;
  }

  equip(heroId, slot, itemId) {
    const h = this.heroes[heroId];
    const prev = h.equip[slot];
    if (prev) this.addItem(prev, 1);
    if (itemId) this.addItem(itemId, -1);
    h.equip[slot] = itemId || null;
    const s = this.stats(heroId);
    h.hp = Math.min(h.hp, s.hp);
    h.mp = Math.min(h.mp, s.mp);
  }

  // ------------------------------------------------------------- flags
  flag(k) {
    return !!this.flags[k];
  }

  set(k, v = true) {
    this.flags[k] = v;
  }

  // ------------------------------------------------------------- save
  toJSON() {
    return {
      v: 1,
      party: this.party,
      heroes: this.heroes,
      inventory: this.inventory,
      gold: this.gold,
      flags: this.flags,
      mapId: this.mapId,
      pos: this.pos,
      playTime: this.playTime,
      opened: this.opened,
      defeated: this.defeated,
      settings: this.settings,
      savedAt: Date.now(),
    };
  }

  static fromJSON(o) {
    const s = new GameState();
    if (!o || o.v !== 1 || !Array.isArray(o.party) || !o.party.length || o.party.length > 4 ||
        new Set(o.party).size !== o.party.length || !o.heroes || typeof o.heroes !== 'object' ||
        typeof o.mapId !== 'string' || !o.pos || !Number.isFinite(o.pos.x) || !Number.isFinite(o.pos.y)) return null;
    for (const id of o.party) if (!Object.hasOwn(HERO_DATA, id) || !o.heroes[id]) return null;
    for (const [id, hero] of Object.entries(o.heroes)) {
      if (!Object.hasOwn(HERO_DATA, id) || !hero || !Number.isInteger(hero.level) || hero.level < 1 || hero.level > 50 ||
          !['hp', 'mp', 'exp'].every(k => Number.isFinite(hero[k]) && hero[k] >= 0) || !hero.equip || !Array.isArray(hero.skills)) return null;
      if (Object.values(hero.equip).some(item => item && !Object.hasOwn(ITEMS, item))) return null;
    }
    for (const key of ['party', 'heroes', 'inventory', 'gold', 'flags', 'mapId', 'pos', 'playTime', 'opened', 'defeated']) {
      if (o[key] !== undefined && o[key] !== null) s[key] = structuredClone(o[key]);
    }
    if (!Number.isFinite(s.gold) || s.gold < 0 || !Number.isFinite(s.playTime)) return null;
    if (typeof s.inventory !== 'object' || Array.isArray(s.inventory) || typeof s.flags !== 'object' || Array.isArray(s.flags)) return null;
    if (Object.entries(s.inventory).some(([id, qty]) => !Object.hasOwn(ITEMS, id) || !Number.isInteger(qty) || qty < 0)) return null;
    if (o.settings && typeof o.settings === 'object') Object.assign(s.settings, o.settings);
    return s;
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.toJSON()));
      return true;
    } catch (e) {
      return false;
    }
  }

  static hasSave() {
    try {
      return !!GameState.peek();
    } catch (e) {
      return false;
    }
  }

  static peek() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return GameState.fromJSON(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  static load() {
    const o = GameState.peek();
    return o ? GameState.fromJSON(o) : null;
  }

  static loadSettings() {
    try {
      const raw = localStorage.getItem(SAVE_KEY + '-settings');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(SAVE_KEY + '-settings', JSON.stringify(this.settings));
    } catch (e) {
      /* sem armazenamento */
    }
  }
}

export function formatTime(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}
