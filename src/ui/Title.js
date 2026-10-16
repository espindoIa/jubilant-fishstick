// Tela de título com cenário 3D vivo (Vila Maré ao entardecer) ao fundo.
import * as THREE from 'three';
import { h, ListCtl, wait } from './UI.js';
import { buildWorld } from '../render/World.js';
import { ATMOSPHERES } from '../data/atmospheres.js';
import { MAPS } from '../data/maps/index.js';
import { GameState, formatTime } from '../game/state.js';

export class Title {
  constructor(game) {
    this.game = game;
    this.t = 0;
  }

  update(dt, time) {
    this.t += dt;
    if (!this.W) return;
    for (const u of this.W.updaters) u(dt, time);
    const m = this.W.map.margin;
    const k = (Math.sin(this.t * 0.06) + 1) / 2;
    const x = m + 10 + k * 18;
    const z = m + 15 + Math.sin(this.t * 0.04) * 3;
    this.game.stage.setCameraTarget(new THREE.Vector3(x, 1.4, z));
  }

  async run() {
    const g = this.game;
    const stage = g.stage;
    const atm = ATMOSPHERES.dusk;
    stage.setAtmosphere(atm);
    this.W = buildWorld(MAPS.vila, { night: true });
    stage.setWorld(this.W.group);
    stage.setPointLights(this.W.lights);
    stage.zoom = 1.25;
    stage.pitchOverride = THREE.MathUtils.degToRad(30);
    const m = this.W.map.margin;
    stage.setCameraTarget(new THREE.Vector3(m + 10, 1.4, m + 15), true);
    g.ui.setFade(1);
    await wait(60);
    g.ui.fadeIn(1600);

    const scr = h('div', 'title-screen');
    scr.innerHTML = `<div class="logo"><div class="a">Ecos da Aurora</div><div class="b">CRÔNICA I · A ESTRELA QUE CANTA</div></div>`;
    const hint = h('div', 'title-hint', 'Toque na tela para começar');
    scr.appendChild(hint);
    g.ui.root.appendChild(scr);

    // espera o primeiro toque (destrava o áudio no celular)
    await new Promise((resolve) => {
      const go = () => {
        scr.removeEventListener('pointerdown', go);
        off();
        resolve();
      };
      scr.addEventListener('pointerdown', go);
      const off = g.input.onPress((a) => a === 'confirm' && go());
    });
    hint.textContent = 'v0.1 · feito com pixel art e carinho';
    g.music('title');
    g.sfx('confirm');

    const menu = h('div', 'win title-menu');
    scr.appendChild(menu);
    const save = GameState.peek();
    const items = [
      { label: 'Novo Jogo', v: 'new' },
      { label: 'Continuar', v: 'continue', disabled: !save, right: save ? formatTime(save.playTime || 0) : '' },
    ];
    const choice = await new Promise((resolve) => {
      const ctl = new ListCtl(menu, items, {
        index: save ? 1 : 0,
        sound: (s) => g.sfx(s),
        onSelect: (it) => {
          g.ui.pop(ctl);
          resolve(it.v);
        },
      });
      g.ui.push(ctl);
    });
    await g.ui.fadeOut(800);
    scr.remove();
    stage.zoom = 1;
    stage.pitchOverride = null;
    return choice;
  }
}
