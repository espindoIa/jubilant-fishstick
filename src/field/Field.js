// Exploração: carrega mapas, move o grupo (com seguidores), colisão,
// interação com NPCs/baús/placas, inimigos visíveis, saídas e gatilhos.
import * as THREE from 'three';
import { buildWorld } from '../render/World.js';
import { Actor } from '../render/Actor.js';
import { fieldSheet, propTextures, charDef } from '../game/assets.js';
import { ATMOSPHERES } from '../data/atmospheres.js';
import { MAPS } from '../data/maps/index.js';
import { cellMat, cellH } from '../art/terrain.js';
import { groundHeight } from '../render/TerrainMesh.js';
import { enemySheet, ENEMIES } from '../data/enemies.js';
import { SPRITE_SCALE_Y } from '../render/Actor.js';
import { updateOcclusion } from '../render/occlusion.js';

const DIRS = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
const R = 0.26; // raio do jogador

export class Field {
  constructor(game) {
    this.game = game;
    this.stage = game.stage;
    this.world = null;
    this.player = null;
    this.followers = [];
    this.npcs = new Map();
    this.chests = [];
    this.enemies = [];
    this.trail = [];
    this.walking = false;
    this.locked = 0; // >0 enquanto scripts controlam
    this.time = 0;
    this.invuln = 0;
    this.stepTimer = 0;
  }

  get state() {
    return this.game.state;
  }

  // -------------------------------------------------------------- carregar
  async load(mapId, spawn) {
    const src = MAPS[mapId];
    if (!src) throw new Error('mapa inexistente: ' + mapId);
    const st = this.state;
    const atmKey = typeof src.atmosphere === 'function' ? src.atmosphere(st) : src.atmosphere;
    const atm = ATMOSPHERES[atmKey] || ATMOSPHERES.day;
    this.atm = atm;
    this.stage.pitchOverride = null;
    this.stage.zoom = 1;
    this.cameraLocked = false;
    this.stage.setAtmosphere(atm);
    const W = buildWorld(src, { night: atm.night, state: st });
    this.world = W;
    this.map = W.map;
    this.mapId = mapId;
    this.stage.setWorld(W.group);
    this.stage.setPointLights(W.lights);
    st.mapId = mapId;

    // posição inicial
    let sp = typeof spawn === 'string' ? this.map.spawns[spawn] : spawn;
    if (spawn && spawn.raw) sp = { x: spawn.x, y: spawn.y, dir: spawn.dir };
    if (!sp) sp = Object.values(this.map.spawns)[0] || { x: this.map.w / 2, y: this.map.h / 2 };

    // jogador + seguidores
    this.followers = [];
    const party = st.party.length ? st.party : ['lio'];
    this.player = this.makeActor(party[0]);
    this.placeActor(this.player, sp.x, sp.y);
    this.player.facing = sp.dir || 'down';
    for (let i = 1; i < party.length; i++) {
      const a = this.makeActor(party[i]);
      this.placeActor(a, sp.x, sp.y);
      a.facing = this.player.facing;
      this.followers.push(a);
    }
    this.trail = [];
    for (let i = 0; i < 60; i++) this.trail.push({ x: sp.x, z: sp.y, dir: this.player.facing });
    // recua seguidores atrás do líder
    const [dx, dz] = DIRS[this.player.facing] || [0, 1];
    for (let i = 0; i < 60; i++) {
      const k = i * 0.12;
      const tx = sp.x - dx * k, tz = sp.y - dz * k;
      if (this.walkable(tx, tz, this.hAt(sp.x, sp.y))) this.trail[i] = { x: tx, z: tz, dir: this.player.facing };
      else this.trail[i] = { ...this.trail[Math.max(0, i - 1)] };
    }
    this.followers.forEach((f, i) => {
      const t = this.trail[Math.min(this.trail.length - 1, (i + 1) * 7)];
      this.placeActor(f, t.x, t.z);
    });

    // NPCs
    this.npcs = new Map();
    for (const n of this.map.npcs) {
      if (n.cond && !n.cond(st)) continue;
      this.addNpc(n);
    }
    // baús
    this.chests = [];
    for (const c of this.map.chests) {
      const opened = !!st.opened[mapId + ':' + c.id];
      if (c.cond && !c.cond(st)) continue;
      const mesh = this.makePropSprite(opened ? 'chest_open' : 'chest', c.x + 0.5, c.y + 0.6);
      this.world.group.add(mesh);
      this.chests.push({ ...c, opened, mesh });
    }
    // inimigos visíveis
    this.enemies = [];
    for (const e of this.map.enemies) {
      const key = mapId + ':' + e.id;
      if (e.unique && st.defeated[key]) continue;
      if (e.cond && !e.cond(st)) continue;
      this.addEnemy(e);
    }
    this.stage.setCameraTarget(this.focusPoint(), true);
    this.updateActors(0);
    this.invuln = 1.2;
  }

  makeActor(id) {
    const sheet = fieldSheet(id);
    const a = new Actor(sheet, { floats: sheet.floats });
    a.id = id;
    this.world.group.add(a.group);
    return a;
  }

  makePropSprite(name, x, z) {
    const t = propTextures(name);
    const w = t.w / 16, hh = (t.h / 16) * SPRITE_SCALE_Y;
    const geo = new THREE.PlaneGeometry(w, hh);
    geo.translate(0, hh / 2, 0);
    const n = geo.attributes.normal;
    for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 0.55, 0.83);
    const mat = new THREE.MeshLambertMaterial({ map: t.map, alphaTest: 0.5, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    m.rotation.x = -0.12;
    m.position.set(x, this.hAt(x, z), z);
    return m;
  }

  addNpc(n) {
    const def = charDef(n.char);
    if (!def) {
      console.warn('NPC sem sprite', n.char);
      return null;
    }
    const a = this.makeActor(n.char);
    this.placeActor(a, n.x + 0.5, n.y + 0.5);
    a.facing = n.dir || 'down';
    if (n.pose) {
      a.lockFrame = true;
      a.setFrame(n.pose);
    }
    const npc = { ...n, actor: a, home: { x: n.x + 0.5, z: n.y + 0.5 }, wanderT: Math.random() * 3, target: null };
    this.npcs.set(n.id, npc);
    return npc;
  }

  removeNpc(id) {
    const n = this.npcs.get(id);
    if (!n) return;
    this.world.group.remove(n.actor.group);
    this.npcs.delete(id);
  }

  addEnemy(e) {
    const kind = ENEMIES[e.kind];
    const sheet = enemySheet(e.kind);
    const a = new Actor(sheet, { scaleY: SPRITE_SCALE_Y, floats: kind?.floats, blobSize: Math.min(2, (sheet.fw * (sheet.scale || 1)) / 16) * 0.6 });
    a.group.scale.setScalar(e.scale || kind?.fieldScale || 0.8);
    a.lockFrame = true;
    a.setFrame('idle');
    this.world.group.add(a.group);
    this.placeActor(a, e.x + 0.5, e.y + 0.5);
    const en = { ...e, actor: a, home: { x: e.x + 0.5, z: e.y + 0.5 }, t: Math.random() * 5, stun: 0, wx: 0, wz: 0 };
    this.enemies.push(en);
    return en;
  }

  placeActor(a, x, z) {
    a.setPosition(x, this.hAt(x, z), z);
    a.tx = x;
    a.tz = z;
  }

  // -------------------------------------------------------------- mundo
  hAt(x, z) {
    const h = groundHeight(this.map, Math.floor(x), Math.floor(z));
    return h ?? 0;
  }

  cellWalkable(cx, cy, fromH) {
    const m = this.map;
    if (cx < 0 || cy < 0 || cx >= m.w || cy >= m.h) return false;
    const inner = m.inner;
    const inside = cx >= inner.x0 && cy >= inner.y0 && cx < inner.x1 && cy < inner.y1;
    if (!inside) {
      // fora do mapa só é permitido dentro de uma saída (sempre transitável)
      return m.exits.some((e) => cx >= e.x && cy >= e.y && cx < e.x + (e.w || 1) && cy < e.y + (e.h || 1));
    }
    const mat = cellMat(m, cx, cy);
    if (mat === 'water' || mat === 'void') return false;
    if (this.world.blocked.has(`${cx},${cy}`)) return false;
    if (m.walls && m.walls.has(`${cx},${cy}`)) return false;
    const h = groundHeight(m, cx, cy);
    if (h === null) return false;
    if (fromH !== undefined && Math.abs(h - fromH) > 0.55) return false;
    return true;
  }

  walkable(x, z, fromH) {
    const pts = [[x - R, z - R * 0.6], [x + R, z - R * 0.6], [x - R, z + R * 0.5], [x + R, z + R * 0.5]];
    for (const [px, pz] of pts) {
      if (!this.cellWalkable(Math.floor(px), Math.floor(pz), fromH)) return false;
    }
    return true;
  }

  blockedByCircles(x, z, self) {
    for (const c of this.world.colliders) {
      if (c.disabled) continue;
      const dx = x - c.x, dz = (z - c.z) * 1.3;
      if (dx * dx + dz * dz < (c.r + R * 0.7) ** 2) return true;
    }
    for (const n of this.npcs.values()) {
      if (n.actor === self || n.ghost) continue;
      const p = n.actor.position;
      const dx = x - p.x, dz = z - p.z;
      if (dx * dx + dz * dz < 0.55 * 0.55) return true;
    }
    for (const c of this.chests) {
      const dx = x - (c.x + 0.5), dz = z - (c.y + 0.6);
      if (dx * dx + dz * dz < 0.5 * 0.5) return true;
    }
    return false;
  }

  tryMove(a, dx, dz) {
    const p = a.position;
    const fromH = this.hAt(p.x, p.z);
    let moved = false;
    const nx = p.x + dx;
    if (dx && this.walkable(nx, p.z, fromH) && !this.blockedByCircles(nx, p.z, a)) {
      p.x = nx;
      moved = true;
    }
    const nz = p.z + dz;
    if (dz && this.walkable(p.x, nz, this.hAt(p.x, p.z)) && !this.blockedByCircles(p.x, nz, a)) {
      p.z = nz;
      moved = true;
    }
    return moved;
  }

  focusPoint() {
    const p = this.player.position;
    return new THREE.Vector3(p.x, p.y + 0.4, p.z);
  }

  // -------------------------------------------------------------- atualização
  update(dt) {
    this.time += dt;
    this.invuln = Math.max(0, this.invuln - dt);
    const g = this.game;
    const free = !this.locked && !g.ui.busy && g.mode === 'field';

    if (free) {
      if (g.input.consume('confirm')) this.interact();
      else if (g.input.consume('menu')) g.openMenu();
    }

    // movimento do jogador
    const mv = free ? g.input.move() : { x: 0, y: 0 };
    const speed = (mv.run ? 5.2 : 3.9) * dt;
    const mag = Math.hypot(mv.x, mv.y);
    this.player.moving = false;
    if (mag > 0.05) {
      if (Math.abs(mv.x) > Math.abs(mv.y) * 0.9) this.player.facing = mv.x < 0 ? 'left' : 'right';
      else this.player.facing = mv.y < 0 ? 'up' : 'down';
      const moved = this.tryMove(this.player, mv.x * speed, mv.y * speed);
      this.player.moving = moved || mag > 0.05;
      this.player.walkFps = 6 + mag * 4;
      if (moved) {
        this.pushTrail();
        this.stepTimer += dt;
        if (this.stepTimer > 0.32) {
          this.stepTimer = 0;
          g.sfx('step');
        }
      }
    }
    if (this.scriptMoving) this.pushTrail();

    this.updateFollowers(dt);
    this.updateNpcs(dt);
    if (free) {
      this.updateEnemies(dt);
      this.checkExits();
      this.checkTriggers();
    } else {
      for (const e of this.enemies) e.actor.update(dt);
    }
    this.updateActors(dt);
    if (!this.cameraLocked) this.stage.setCameraTarget(this.focusPoint());
    for (const u of this.world.updaters) u(dt, this.time);
    updateOcclusion(this.stage, this.player.position, this.game.mode !== 'battle');
    this.updateHint();
  }

  pushTrail() {
    const p = this.player.position;
    const last = this.trail[0];
    if (Math.hypot(p.x - last.x, p.z - last.z) >= 0.12) {
      this.trail.unshift({ x: p.x, z: p.z, dir: this.player.facing });
      if (this.trail.length > 80) this.trail.pop();
    }
  }

  updateFollowers(dt) {
    this.followers.forEach((f, i) => {
      if (f.scripted) return;
      const t = this.trail[Math.min(this.trail.length - 1, (i + 1) * 7)];
      const p = f.position;
      const dx = t.x - p.x, dz = t.z - p.z;
      const d = Math.hypot(dx, dz);
      f.moving = d > 0.02 && this.player.moving;
      if (d > 0.01) {
        const k = Math.min(1, dt * 14);
        p.x += dx * k;
        p.z += dz * k;
        f.facing = t.dir;
      }
      if (!this.player.moving && d < 0.05) f.moving = false;
    });
  }

  updateNpcs(dt) {
    for (const n of this.npcs.values()) {
      const a = n.actor;
      if (n.scripted) continue;
      if (n.wander && !this.locked) {
        n.wanderT -= dt;
        if (!n.target && n.wanderT <= 0) {
          const ang = Math.random() * Math.PI * 2;
          const r = Math.random() * n.wander;
          n.target = { x: n.home.x + Math.cos(ang) * r, z: n.home.z + Math.sin(ang) * r };
          n.wanderT = 2 + Math.random() * 3;
        }
        if (n.target) {
          const p = a.position;
          const dx = n.target.x - p.x, dz = n.target.z - p.z;
          const d = Math.hypot(dx, dz);
          if (d < 0.1) {
            n.target = null;
            a.moving = false;
          } else {
            const s = 1.4 * dt;
            const ok = this.tryMove(a, (dx / d) * s, (dz / d) * s);
            a.moving = ok;
            if (!ok) n.target = null;
            a.facing = Math.abs(dx) > Math.abs(dz) ? (dx < 0 ? 'left' : 'right') : dz < 0 ? 'up' : 'down';
            // não esbarra no jogador
            const pp = this.player.position;
            if (Math.hypot(pp.x - p.x, pp.z - p.z) < 0.6) {
              n.target = null;
              a.moving = false;
            }
          }
        }
      }
    }
  }

  updateEnemies(dt) {
    const pp = this.player.position;
    for (const e of this.enemies) {
      const a = e.actor;
      const kind = ENEMIES[e.kind];
      e.t += dt;
      e.stun = Math.max(0, e.stun - dt);
      a.update(dt);
      // animação idle alternada
      a.setFrame(Math.floor(e.t * 2.5) % 2 ? 'alt' : 'idle');
      const p = a.position;
      const dx = pp.x - p.x, dz = pp.z - p.z;
      const d = Math.hypot(dx, dz);
      const aggro = e.aggro ?? 4.2;
      let vx = 0, vz = 0;
      if (e.stun <= 0 && d < aggro && this.invuln <= 0 && Math.abs(this.hAt(p.x, p.z) - pp.y) < 1) {
        const s = (kind?.fieldSpeed || 2.4);
        vx = (dx / d) * s;
        vz = (dz / d) * s;
        e.chasing = true;
      } else {
        e.chasing = false;
        // vagueia em torno de casa
        const hx = e.home.x - p.x, hz = e.home.z - p.z;
        if (Math.hypot(hx, hz) > (e.radius || 2.5)) {
          vx = hx * 0.6;
          vz = hz * 0.6;
        } else {
          vx = Math.sin(e.t * 0.7 + e.home.x) * 0.7;
          vz = Math.cos(e.t * 0.53 + e.home.z) * 0.6;
        }
      }
      const fromH = this.hAt(p.x, p.z);
      const nx = p.x + vx * dt, nz = p.z + vz * dt;
      if (this.walkable(nx, p.z, fromH)) p.x = nx;
      if (this.walkable(p.x, nz, fromH)) p.z = nz;
      p.y += (this.hAt(p.x, p.z) - p.y) * Math.min(1, dt * 10);
      a.group.scale.x = Math.abs(a.group.scale.x) * (vx < -0.05 ? -1 : 1);
      // contato => batalha
      if (d < 0.75 && this.invuln <= 0 && e.stun <= 0) {
        this.startEncounter(e);
        return;
      }
    }
  }

  async startEncounter(e) {
    this.locked++;
    const formation = e.group || [e.kind];
    const res = await this.game.battle(formation, { boss: e.boss, music: e.music, enemyRef: e, bg: this.map.battleBg });
    this.locked--;
    if (res === 'win') {
      this.world.group.remove(e.actor.group);
      this.enemies = this.enemies.filter((x) => x !== e);
      if (e.unique) this.state.defeated[this.mapId + ':' + e.id] = true;
    } else if (res === 'flee') {
      e.stun = 3;
      this.invuln = 2.5;
    }
  }

  updateActors(dt) {
    const all = [this.player, ...this.followers, ...[...this.npcs.values()].map((n) => n.actor)];
    for (const a of all) {
      if (!a) continue;
      a.update(dt);
      const p = a.position;
      const target = this.hAt(p.x, p.z);
      p.y += (target - p.y) * Math.min(1, dt * 12 || 1);
    }
  }

  // -------------------------------------------------------------- interação
  facingPoint(dist = 0.8) {
    const [dx, dz] = DIRS[this.player.facing];
    const p = this.player.position;
    return { x: p.x + dx * dist, z: p.z + dz * dist };
  }

  // encontra o que está à frente do jogador (para interagir ou mostrar dica)
  findInteractable() {
    const f = this.facingPoint(0.85);
    const p = this.player.position;
    let best = null, bd = 1.1;
    for (const n of this.npcs.values()) {
      if (!n.talk) continue;
      const q = n.actor.position;
      const d = Math.hypot(q.x - f.x, q.z - f.z);
      if (d < bd) {
        bd = d;
        best = { kind: 'npc', x: q.x, y: q.y + 2.3, z: q.z };
      }
    }
    if (best) return best;
    for (const c of this.chests) {
      if (!c.opened && Math.hypot(c.x + 0.5 - f.x, c.y + 0.6 - f.z) < 0.85) return { kind: 'chest', x: c.x + 0.5, y: this.hAt(c.x + 0.5, c.y + 0.6) + 1.3, z: c.y + 0.6 };
    }
    for (const o of this.map.interactables || []) {
      const ox = o.x + 0.5 + (o.ox || 0), oz = o.y + 0.5 + (o.oz || 0);
      if (o.cond && !o.cond(this.state)) continue;
      if (Math.hypot(ox - f.x, oz - f.z) < (o.r || 0.9) || Math.hypot(ox - p.x, oz - p.z) < (o.r || 0.9) * 0.8) return { kind: 'obj', x: ox, y: this.hAt(ox, oz) + 1.8, z: oz };
    }
    return null;
  }

  updateHint() {
    const target = !this.locked && this.game.mode === 'field' && !this.game.ui.busy ? this.findInteractable() : null;
    if (!this.hintEl) {
      this.hintEl = document.createElement('div');
      this.hintEl.className = 'interact-hint';
      this.hintEl.textContent = '!';
      this.game.uiRoot.appendChild(this.hintEl);
      this.hintEl.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.game.input.press('confirm');
      });
    }
    this.game.touch?.el.querySelector('.tbtn-a')?.classList.toggle('ready', !!target);
    if (!target) {
      this.hintEl.style.display = 'none';
      return;
    }
    const v = new THREE.Vector3(target.x, target.y, target.z).project(this.stage.camera);
    this.hintEl.style.display = '';
    this.hintEl.textContent = target.kind === 'chest' ? '✦' : target.kind === 'npc' ? '💬' : '!';
    this.hintEl.style.left = ((v.x + 1) / 2) * window.innerWidth + 'px';
    this.hintEl.style.top = ((1 - v.y) / 2) * window.innerHeight + 'px';
  }

  interact() {
    const f = this.facingPoint(0.85);
    const p = this.player.position;
    // NPCs
    let best = null, bd = 1.1;
    for (const n of this.npcs.values()) {
      const q = n.actor.position;
      const d = Math.hypot(q.x - f.x, q.z - f.z);
      if (d < bd) {
        bd = d;
        best = n;
      }
    }
    if (best) return this.talk(best);
    // baús
    for (const c of this.chests) {
      if (Math.hypot(c.x + 0.5 - f.x, c.y + 0.6 - f.z) < 0.85) return this.openChest(c);
    }
    // objetos com script (placas, portas, cristal de save)
    for (const o of this.map.interactables || []) {
      const ox = o.x + 0.5 + (o.ox || 0), oz = o.y + 0.5 + (o.oz || 0);
      if (o.cond && !o.cond(this.state)) continue;
      if (Math.hypot(ox - f.x, oz - f.z) < (o.r || 0.9) || Math.hypot(ox - p.x, oz - p.z) < (o.r || 0.9) * 0.8) {
        return this.game.runScript(o.script, { field: this, obj: o });
      }
    }
    // portas de casas
    for (const o of this.map.objects) {
      if (o.type !== 'house' || o.door === undefined || o.door === null) continue;
      const dx = o.x + o.door + 0.5, dz = o.y + o.d + 0.3;
      if (Math.hypot(dx - f.x, dz - f.z) < 0.9 && this.player.facing === 'up') {
        return this.game.runScript(o.doorScript || 'porta_trancada', { field: this, obj: o });
      }
    }
  }

  talk(n) {
    const a = n.actor;
    const p = this.player.position;
    const q = a.position;
    if (!n.fixedDir) {
      const dx = p.x - q.x, dz = p.z - q.z;
      a.facing = Math.abs(dx) > Math.abs(dz) ? (dx < 0 ? 'left' : 'right') : dz < 0 ? 'up' : 'down';
    }
    n.target = null;
    a.moving = false;
    const talk = typeof n.talk === 'function' ? n.talk(this.state) : n.talk;
    if (!talk) return;
    if (Array.isArray(talk)) {
      return this.game.runScript(async (ctx) => {
        for (const line of talk) await ctx.say(n.speaker || n.char, line);
      }, { field: this, npc: n });
    }
    return this.game.runScript(talk, { field: this, npc: n });
  }

  async openChest(c) {
    if (c.opened) {
      return this.game.runScript(async (ctx) => ctx.say(null, 'O baú está vazio.'), { field: this });
    }
    c.opened = true;
    this.state.opened[this.mapId + ':' + c.id] = true;
    const nm = this.makePropSprite('chest_open', c.x + 0.5, c.y + 0.6);
    this.world.group.remove(c.mesh);
    c.mesh = nm;
    this.world.group.add(nm);
    this.game.sfx('chest');
    return this.game.runScript(async (ctx) => {
      if (c.gold) {
        ctx.state.gold += c.gold;
        await ctx.say(null, `Encontrou *${c.gold} moedas*!`);
      }
      if (c.item) {
        ctx.give(c.item, c.qty || 1, true);
        await ctx.say(null, `Encontrou *${ctx.itemName(c.item)}*${(c.qty || 1) > 1 ? ' x' + c.qty : ''}!`);
      }
    }, { field: this });
  }

  checkExits() {
    const p = this.player.position;
    const cx = Math.floor(p.x), cz = Math.floor(p.z);
    for (const e of this.map.exits) {
      if (cx >= e.x && cz >= e.y && cx < e.x + (e.w || 1) && cz < e.y + (e.h || 1)) {
        if (e.cond && !e.cond(this.state)) {
          if (e.blockedScript && !this._exitBusy) {
            this._exitBusy = true;
            this.game.runScript(e.blockedScript, { field: this }).then(() => (this._exitBusy = false));
          }
          return;
        }
        this.game.changeMap(e.to, e.spawn);
        return;
      }
    }
  }

  checkTriggers() {
    const p = this.player.position;
    const cx = Math.floor(p.x), cz = Math.floor(p.z);
    for (const t of this.map.triggers) {
      if (t.done) continue;
      const inside = cx >= t.x && cz >= t.y && cx < t.x + (t.w || 1) && cz < t.y + (t.h || 1);
      if (!inside) continue;
      if (t.cond && !t.cond(this.state)) continue;
      if (t.once) t.done = true;
      if (t.flag && this.state.flag(t.flag)) continue;
      if (t.flag) this.state.set(t.flag);
      this.game.runScript(t.script, { field: this, trigger: t });
      return;
    }
  }

  // -------------------------------------------------------------- utilidades de script
  actorById(id) {
    if (id === 'player' || id === this.player.id) return this.player;
    const f = this.followers.find((a) => a.id === id);
    if (f) return f;
    const n = this.npcs.get(id);
    return n ? n.actor : null;
  }

  dispose() {
    for (const a of [this.player, ...this.followers]) a?.dispose?.();
  }
}
