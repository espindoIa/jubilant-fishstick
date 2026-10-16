// Orquestrador: modos (título, campo, batalha, menu), loop principal,
// troca de mapas, scripts, áudio e save.
import * as THREE from 'three';
import { Stage, detectQuality } from '../render/Stage.js';
import { Input, TouchControls } from '../core/input.js';
import { UI, wait } from '../ui/UI.js';
import { GameState } from './state.js';
import { Field } from '../field/Field.js';
import { ScriptContext } from './Script.js';
import { MAPS } from '../data/maps/index.js';
import { SCRIPTS } from '../data/story.js';
import { Menu } from '../ui/Menu.js';
import { Shop } from '../ui/Shop.js';
import { Title } from '../ui/Title.js';

const audioMods = import.meta.glob('../audio/audio.js', { eager: true });
const AudioEngine = Object.values(audioMods)[0]?.Audio || null;

export class Game {
  constructor() {
    const settings = GameState.loadSettings();
    this.canvas = document.getElementById('game');
    const params = new URLSearchParams(location.search);
    this.params = params;
    const quality = params.get('q') || settings?.quality || detectQuality();
    this.stage = new Stage(this.canvas, quality);
    this.input = new Input();
    this.uiRoot = document.getElementById('ui');
    this.ui = new UI(this.uiRoot, this.input, (s) => this.sfx(s));
    this.touch = new TouchControls(this.input, this.uiRoot);
    this.touch.show(false);
    this.state = new GameState();
    if (settings) Object.assign(this.state.settings, settings);
    this.state.settings.quality = quality;
    this.field = new Field(this);
    this.mode = 'boot';
    this.tickers = [];
    this.time = 0;
    this.last = performance.now();
    this.audio = AudioEngine;
    this.applyVolumes();
    // destrava áudio no primeiro toque
    const unlock = () => {
      try {
        this.audio?.init();
        this.audio?.unlock();
        this.applyVolumes();
      } catch (e) {
        /* sem áudio */
      }
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    // pausa a música quando o app vai para segundo plano
    document.addEventListener('visibilitychange', () => {
      try {
        if (document.hidden) this.audio?.pauseMusic?.();
        else this.audio?.resumeMusic?.();
      } catch (e) {
        /* ignore */
      }
    });
    // perda do contexto WebGL (comum em celulares): oferece recarregar
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.mode !== 'title' && this.mode !== 'boot') this.saveGame?.();
      const el = document.createElement('div');
      el.className = 'win';
      el.style.cssText = 'left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:auto;z-index:99';
      el.innerHTML = 'O gráfico foi interrompido pelo sistema.<br><br><b>Toque para continuar</b>';
      el.addEventListener('click', () => location.reload());
      this.uiRoot.appendChild(el);
    });
    window.__game = this;
    // modo de teste: texto instantâneo e esperas curtas (?fast=1)
    this.fast = params.get('fast') === '1';
    if (this.fast) this.ui.textSpeed = 60;
    this.debug = {
      battle: (f, o) => this.battle(f, o),
      flag: (k, v = true) => this.state.set(k, v),
      tp: (m, s) => this.changeMap(m, s),
      give: (i, q = 1) => this.state.addItem(i, q),
      lv: (n) => Object.values(this.state.heroes).forEach((h) => (h.level = n)),
      heal: () => this.state.healAll(),
    };
  }

  applyVolumes() {
    try {
      this.audio?.setMusicVolume?.(this.state.settings.music);
      this.audio?.setSfxVolume?.(this.state.settings.sfx);
    } catch (e) {
      /* ignore */
    }
  }

  sfx(id) {
    try {
      this.audio?.playSfx(id);
    } catch (e) {
      /* ignore */
    }
  }

  music(id, fade = 1.2) {
    try {
      if (id) this.audio?.playMusic(id, { fade });
    } catch (e) {
      /* ignore */
    }
  }

  stopMusic(f = 1) {
    try {
      this.audio?.stopMusic(f);
    } catch (e) {
      /* ignore */
    }
  }

  addTicker(fn) {
    this.tickers.push(fn);
  }

  // -------------------------------------------------------------- loop
  start() {
    requestAnimationFrame((t) => this.frame(t));
    this.title();
  }

  frame(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    if (this.mode === 'field' || this.mode === 'menu' || this.mode === 'script') {
      this.state.playTime += dt;
      this.field.update(dt);
    } else if (this.mode === 'battle' && this.battleScene) {
      this.battleScene.update(dt);
    } else if (this.mode === 'title' && this.titleScene) {
      this.titleScene.update(dt, this.time);
    }
    this.tickers = this.tickers.filter((fn) => fn(dt) !== false);
    this.stage.update(dt, this.time);
    this.stage.render(dt);
    this.input.endFrame();
    requestAnimationFrame((t) => this.frame(t));
  }

  // -------------------------------------------------------------- telas
  async title() {
    this.mode = 'title';
    this.touch.show(false);
    this.titleScene = new Title(this);
    const choice = await this.titleScene.run();
    this.titleScene = null;
    if (choice === 'continue') await this.continueGame();
    else await this.newGame();
  }

  async newGame() {
    this.state = new GameState();
    const settings = GameState.loadSettings();
    if (settings) Object.assign(this.state.settings, settings);
    const start = this.params.get('start');
    const party = start && MAPS[start] ? (this.params.get('party') || 'lio').split(',') : ['lio'];
    const lv = start ? +(this.params.get('lv') || 3) : 1;
    for (const id of party) this.state.addHero(id, lv);
    this.state.gold = 60;
    this.state.addItem('pocao', 3);
    this.state.addItem('antidoto', 1);
    if (start && MAPS[start]) {
      // atalho de depuração: ?start=mapa&party=lio,sena&lv=5
      for (const f of (this.params.get('flags') || '').split(',').filter(Boolean)) this.state.set(f);
      await this.changeMap(start, this.params.get('spawn') || undefined);
      return;
    }
    await this.changeMap('vila', 'start', { noFadeIn: true, silentBanner: true });
    await this.runScript('intro');
  }

  async continueGame() {
    const st = GameState.load();
    if (!st) return this.newGame();
    this.state = st;
    this.ui.setFade(1);
    await this.changeMap(st.mapId, { raw: true, x: st.pos.x, y: st.pos.y, dir: st.pos.dir });
  }

  // -------------------------------------------------------------- mapas
  async changeMap(mapId, spawn, opts = {}) {
    const prevMode = this.mode;
    this.mode = 'loading';
    this.touch.show(false);
    if (!opts.noFadeOut) await this.ui.fadeOut(350);
    this.field.dispose?.();
    await this.field.load(mapId, spawn);
    const src = MAPS[mapId];
    const song = typeof src.music === 'function' ? src.music(this.state) : src.music;
    if (song && !opts.keepMusic) this.music(song);
    this.mode = opts.keepLock && prevMode === 'script' ? 'script' : 'field';
    this.touch.show(this.mode === 'field');
    if (src.onEnter) {
      const ctx = new ScriptContext(this, { field: this.field });
      await src.onEnter(ctx);
    }
    if (!opts.noFadeIn) await this.ui.fadeIn(450);
    else this.ui.setFade(0);
    if (!opts.silentBanner && !opts.noBanner && src.name && this.lastBanner !== mapId) {
      this.ui.banner(src.name, src.region || '');
    }
    this.lastBanner = mapId;
    if (src.onEntered) await this.runScript(src.onEntered);
  }

  // -------------------------------------------------------------- scripts
  async runScript(script, extra = {}) {
    const fn = typeof script === 'function' ? script : SCRIPTS[script];
    if (!fn) {
      console.warn('script inexistente', script);
      return;
    }
    const prev = this.mode;
    this.mode = 'script';
    this.field.locked++;
    this.touch.show(false);
    const ctx = new ScriptContext(this, { field: this.field, ...extra });
    try {
      await fn(ctx);
    } catch (e) {
      console.error('erro no script', e);
    }
    this.field.locked = Math.max(0, this.field.locked - 1);
    ctx.release?.();
    this.field.cameraLocked = false;
    if (this.mode === 'script') this.mode = prev === 'script' ? 'field' : prev === 'battle' ? 'field' : prev;
    if (this.mode === 'loading' || this.mode === 'boot') this.mode = 'field';
    if (this.mode === 'field' && !this.field.locked) this.touch.show(true);
  }

  // -------------------------------------------------------------- batalha
  async battle(formation, opts = {}) {
    const { Battle } = await import('../battle/Battle.js');
    const prev = this.mode;
    this.touch.show(false);
    if (this.field.hintEl) this.field.hintEl.style.display = 'none';
    this.mode = 'transition';
    this.sfx('encounter');
    await this.encounterTransition();
    const prevSong = this.audio?.currentSong;
    this.battleScene = new Battle(this, formation, opts);
    this.mode = 'battle';
    const result = await this.battleScene.run();
    this.battleScene = null;
    if (result === 'lose') {
      await this.gameOver();
      return 'lose';
    }
    // volta ao campo
    await this.ui.fadeOut(300);
    this.field.stage.setWorld(this.field.world.group);
    this.stage.setAtmosphere(this.field.atm);
    this.stage.setPointLights(this.field.world.lights);
    this.stage.pitchOverride = null;
    this.stage.zoom = 1;
    this.stage.setCameraTarget(this.field.focusPoint(), true);
    if (!opts.keepBattleMusic) {
      const src = MAPS[this.field.mapId];
      const song = typeof src.music === 'function' ? src.music(this.state) : src.music;
      if (opts.afterMusic) this.music(opts.afterMusic);
      else if (song) this.music(song);
      else if (prevSong) this.music(prevSong);
    }
    this.mode = prev === 'battle' ? 'field' : prev;
    await this.ui.fadeIn(350);
    if (this.mode === 'field' && !this.field.locked) this.touch.show(true);
    return result;
  }

  async encounterTransition() {
    const st = this.stage;
    const z0 = st.zoom || 1;
    const t0 = performance.now();
    await new Promise((resolve) => {
      this.addTicker(() => {
        const k = Math.min(1, (performance.now() - t0) / 500);
        st.zoom = z0 * (1 - k * 0.35);
        if (k >= 1) {
          resolve();
          return false;
        }
        return true;
      });
    });
    await this.ui.flash(120, '#fff', 0.9);
    await this.ui.fadeOut(220);
    st.zoom = 1;
  }

  async gameOver() {
    this.stopMusic(0.5);
    const root = this.uiRoot;
    const el = document.createElement('div');
    el.className = 'title-screen';
    el.innerHTML = `<div class="logo"><div class="a" style="font-size:clamp(28px,5vw,64px)">Fim de Jogo</div><div class="b">a luz se apagou… por enquanto</div></div>`;
    el.style.background = 'radial-gradient(ellipse at 50% 40%, #1a0e24 0%, #000 75%)';
    this.ui.setFade(0);
    root.appendChild(el);
    await wait(500);
    const menu = document.createElement('div');
    menu.className = 'win title-menu';
    el.appendChild(menu);
    const hasSave = GameState.hasSave();
    const choice = await new Promise((resolve) => {
      import('../ui/UI.js').then(({ ListCtl }) => {
        const ctl = new ListCtl(menu, [
          { label: 'Continuar do último save', disabled: !hasSave, v: 'load' },
          { label: 'Voltar ao título', v: 'title' },
        ], { sound: (s) => this.sfx(s), onSelect: (it) => { this.ui.pop(ctl); resolve(it.v); } });
        this.ui.push(ctl);
      });
    });
    el.remove();
    if (choice === 'load') await this.continueGame();
    else location.reload();
  }

  // -------------------------------------------------------------- menus
  async openMenu() {
    if (this.mode !== 'field') return;
    this.mode = 'menu';
    this.touch.show(false);
    this.sfx('menu_open');
    await new Menu(this).run();
    this.mode = 'field';
    this.touch.show(true);
  }

  openShop(list) {
    return new Shop(this, list).run();
  }

  async openSave() {
    const ok = this.saveGame();
    this.sfx(ok ? 'save' : 'error');
    return ok;
  }

  saveGame() {
    const p = this.field.player.position;
    this.state.pos = { x: p.x, y: p.z, dir: this.field.player.facing };
    this.state.mapId = this.field.mapId;
    return this.state.save();
  }
}

export { THREE };
