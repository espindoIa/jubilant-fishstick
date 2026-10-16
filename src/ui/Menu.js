// Menu de pausa: Grupo, Itens, Técnicas, Equipar, Status, Configurações.
import { h, ListCtl } from './UI.js';
import { portraitURL } from './portraits.js';
import { HERO_DATA, expToNext } from '../data/heroes.js';
import { ITEMS } from '../data/items.js';
import { SKILLS, ELEMENTS, WEAPON_TYPES } from '../data/skills.js';
import { formatTime } from '../game/state.js';
import { MAPS } from '../data/maps/index.js';

const STAT_NAMES = { hp: 'HP', mp: 'MP', atk: 'Ataque', def: 'Defesa', mag: 'Magia', res: 'Resistência', spd: 'Agilidade' };

export function heroCardHTML(game, id, extra = '') {
  const st = game.state;
  const hh = st.heroes[id];
  const s = st.stats(id);
  const d = HERO_DATA[id];
  const url = portraitURL(id, hh.hp <= 0 ? 'sad' : 'neutral');
  return `
    <img class="face" src="${url || ''}" alt="">
    <div class="info">
      <div><span class="nm">${d.name}</span> <span class="cls">· ${d.cls} · Nv ${hh.level}</span></div>
      <div class="bars">
        <span>HP</span><div class="bar"><i style="width:${(100 * hh.hp) / s.hp}%"></i></div><span>${hh.hp}/${s.hp}</span>
        <span>MP</span><div class="bar mp"><i style="width:${(100 * hh.mp) / s.mp}%"></i></div><span>${hh.mp}/${s.mp}</span>
      </div>
      ${extra}
    </div>`;
}

export class Menu {
  constructor(game) {
    this.game = game;
    this.st = game.state;
    this.ui = game.ui;
  }

  sound = (s) => this.game.sfx(s);

  run() {
    return new Promise((resolve) => {
      this.resolve = resolve;
      const root = h('div', 'menu-root');
      this.root = root;
      this.ui.root.appendChild(root);
      root.style.pointerEvents = 'auto';
      this.tabsWin = h('div', 'win menu-tabs');
      this.infoWin = h('div', 'win menu-info');
      this.main = h('div', 'win menu-main');
      root.append(this.tabsWin, this.main, this.infoWin);
      const close = h('div', 'menu-close', '✕');
      close.addEventListener('click', () => this.close());
      this.main.appendChild(close);
      this.renderInfo();
      const tabs = [
        { label: 'Grupo', v: 'party' },
        { label: 'Itens', v: 'items' },
        { label: 'Técnicas', v: 'skills' },
        { label: 'Equipar', v: 'equip' },
        { label: 'Status', v: 'status' },
        { label: 'Opções', v: 'config' },
        { label: 'Fechar', v: 'close' },
      ];
      this.tabs = new ListCtl(this.tabsWin, tabs, {
        sound: this.sound,
        onChange: (it) => this.preview(it.v),
        onSelect: (it) => this.open(it.v),
        onCancel: () => this.close(),
      });
      this.ui.push(this.tabs);
    });
  }

  close() {
    this.ui.pop(this.tabs);
    this.root.remove();
    this.resolve();
  }

  renderInfo() {
    const map = MAPS[this.game.field.mapId];
    this.infoWin.innerHTML = `
      <div>💰 <span style="color:var(--gold)">${this.st.gold}</span> moedas</div>
      <div>⏱ ${formatTime(this.st.playTime)}</div>
      <div style="color:var(--muted)">📍 ${map?.name || ''}</div>`;
  }

  clearMain() {
    [...this.main.children].forEach((c) => {
      if (!c.classList.contains('menu-close')) c.remove();
    });
  }

  preview(v) {
    this.clearMain();
    if (v === 'party' || v === 'items' || v === 'skills' || v === 'equip' || v === 'status') this.renderParty();
    if (v === 'config') this.main.appendChild(h('div', 'desc', 'Ajuste gráficos, volume e velocidade do texto.'));
  }

  renderParty(sel = -1) {
    const wrap = h('div', '');
    this.st.party.forEach((id, i) => {
      const hh = this.st.heroes[id];
      const extra = `<div class="desc">EXP para o próximo nível: ${expToNext(hh.level) - hh.exp}</div>`;
      const c = h('div', 'hero-card' + (i === sel ? ' sel' : ''), heroCardHTML(this.game, id, extra));
      wrap.appendChild(c);
    });
    this.main.appendChild(wrap);
  }

  // escolhe um herói (retorna id ou null)
  pickHero(title, filter = () => true) {
    return new Promise((resolve) => {
      this.clearMain();
      this.main.appendChild(h('div', 'section-title', title));
      const items = this.st.party.map((id) => ({ id, disabled: !filter(id) }));
      const ctl = new ListCtl(this.main, items, {
        sound: this.sound,
        renderItem: (it) => `<div class="hero-card" style="padding:0;width:100%">${heroCardHTML(this.game, it.id)}</div>`,
        onSelect: (it) => {
          this.ui.pop(ctl);
          resolve(it.id);
        },
        onCancel: () => {
          this.ui.pop(ctl);
          resolve(null);
        },
      });
      this.ui.push(ctl);
    });
  }

  async open(v) {
    if (v === 'close') return this.close();
    if (v === 'party') return this.openParty();
    if (v === 'items') return this.openItems();
    if (v === 'skills') return this.openSkills();
    if (v === 'equip') return this.openEquip();
    if (v === 'status') return this.openStatus();
    if (v === 'config') return this.openConfig();
  }

  async openParty() {
    // reorganizar o líder
    const id = await this.pickHero('Escolha quem lidera o grupo');
    if (id) {
      const p = this.st.party;
      p.splice(p.indexOf(id), 1);
      p.unshift(id);
      this.game.sfx('confirm');
      this.ui.toast(`${HERO_DATA[id].name} agora lidera o grupo.`);
      this.game.field.pendingReload = true;
    }
    this.preview('party');
  }

  async openItems() {
    for (;;) {
      this.clearMain();
      this.main.appendChild(h('div', 'section-title', 'Itens'));
      const desc = h('div', 'desc', '');
      const inv = Object.entries(this.st.inventory).filter(([k, q]) => q > 0 && ITEMS[k]);
      if (!inv.length) {
        this.main.appendChild(h('div', 'desc', 'A bolsa está vazia.'));
        return;
      }
      inv.sort((a, b) => (ITEMS[a[0]].type === 'use' ? 0 : 1) - (ITEMS[b[0]].type === 'use' ? 0 : 1));
      const items = inv.map(([k, q]) => ({ label: `${ITEMS[k].icon || '◆'} ${ITEMS[k].name}`, right: 'x' + q, k, disabled: !(ITEMS[k].type === 'use' && ITEMS[k].field) }));
      this.main.appendChild(desc);
      const pick = await new Promise((resolve) => {
        const ctl = new ListCtl(this.main, items, {
          sound: this.sound,
          onChange: (it) => (desc.textContent = ITEMS[it.k].desc + (ITEMS[it.k].stats ? '  ' + statsText(ITEMS[it.k].stats) : '')),
          onSelect: (it) => {
            this.ui.pop(ctl);
            resolve(it.k);
          },
          onCancel: () => {
            this.ui.pop(ctl);
            resolve(null);
          },
        });
        this.ui.push(ctl);
      });
      if (!pick) break;
      const it = ITEMS[pick];
      if (it.target === 'allies') {
        this.useItemOn(pick, null);
      } else {
        const target = await this.pickHero(`Usar ${it.name} em…`, (id) => (it.effect.revive ? this.st.heroes[id].hp <= 0 : this.st.heroes[id].hp > 0));
        if (target) this.useItemOn(pick, target);
      }
    }
    this.preview('items');
  }

  useItemOn(itemId, target) {
    const it = ITEMS[itemId];
    const ids = target ? [target] : this.st.party;
    for (const id of ids) {
      const hh = this.st.heroes[id];
      const s = this.st.stats(id);
      const e = it.effect;
      if (e.heal || e.healAll) hh.hp = Math.min(s.hp, hh.hp + (e.heal || e.healAll));
      if (e.mp || e.mpAll) hh.mp = Math.min(s.mp, hh.mp + (e.mp || e.mpAll));
      if (e.revive && hh.hp <= 0) hh.hp = Math.max(1, Math.round(s.hp * e.revive));
      if (e.cure) for (const c of e.cure) delete hh.status[c];
    }
    this.st.addItem(itemId, -1);
    this.game.sfx('heal');
    this.renderInfo();
  }

  async openSkills() {
    const id = await this.pickHero('Técnicas de quem?');
    if (!id) return this.preview('skills');
    for (;;) {
      this.clearMain();
      const hh = this.st.heroes[id];
      this.main.appendChild(h('div', 'section-title', `${HERO_DATA[id].name} — ${HERO_DATA[id].cls}  <span class="pill">MP ${hh.mp}</span>`));
      const desc = h('div', 'desc', '');
      this.main.appendChild(desc);
      const items = hh.skills.map((k) => {
        const s = SKILLS[k];
        const fieldOk = ['heal', 'cure', 'revive'].includes(s.kind) && hh.mp >= s.mp && hh.hp > 0;
        return { label: s.name + (s.element ? ' ' + ELEMENTS[s.element].icon : ''), right: s.mp + ' MP', k, disabled: !fieldOk };
      });
      const pick = await new Promise((resolve) => {
        const ctl = new ListCtl(this.main, items, {
          sound: this.sound,
          onChange: (it) => (desc.textContent = SKILLS[it.k].desc),
          onSelect: (it) => {
            this.ui.pop(ctl);
            resolve(it.k);
          },
          onCancel: () => {
            this.ui.pop(ctl);
            resolve(null);
          },
        });
        this.ui.push(ctl);
      });
      if (!pick) break;
      const sk = SKILLS[pick];
      const targets = sk.target === 'allies' ? this.st.party : [await this.pickHero(`${sk.name} em…`, (t) => (sk.kind === 'revive' ? this.st.heroes[t].hp <= 0 : this.st.heroes[t].hp > 0))];
      if (!targets[0]) continue;
      hh.mp -= sk.mp;
      const mag = this.st.stats(id).mag;
      for (const t of targets) {
        const th = this.st.heroes[t];
        const ts = this.st.stats(t);
        if (sk.kind === 'heal') th.hp = Math.min(ts.hp, th.hp + Math.round(sk.power + mag * 1.6));
        if (sk.kind === 'revive' && th.hp <= 0) th.hp = Math.round(ts.hp * sk.power);
        if (sk.kind === 'cure') th.status = {};
      }
      this.game.sfx('heal');
    }
    this.preview('skills');
  }

  async openEquip() {
    const id = await this.pickHero('Equipar quem?');
    if (!id) return this.preview('equip');
    for (;;) {
      this.clearMain();
      const hh = this.st.heroes[id];
      this.main.appendChild(h('div', 'section-title', `${HERO_DATA[id].name} — Equipamento`));
      const statBox = h('div', 'stat-grid', '');
      const slots = [
        { label: '⚔ Arma', slot: 'weapon' },
        { label: '🛡 Armadura', slot: 'armor' },
        { label: '💍 Acessório', slot: 'acc' },
      ].map((s) => ({ ...s, right: hh.equip[s.slot] ? ITEMS[hh.equip[s.slot]].name : '—' }));
      const desc = h('div', 'desc', '');
      const renderStats = (cmp) => {
        const cur = this.st.stats(id);
        statBox.innerHTML = Object.keys(STAT_NAMES).map((k) => {
          const v = cmp ? cmp[k] : cur[k];
          const diff = cmp ? cmp[k] - cur[k] : 0;
          const col = diff > 0 ? '#8affa0' : diff < 0 ? '#ff8a8a' : '#fff';
          return `<div><span class="k">${STAT_NAMES[k]}</span> <span style="color:${col}">${v}${diff ? (diff > 0 ? ' ▲' : ' ▼') : ''}</span></div>`;
        }).join('');
      };
      renderStats(null);
      const slot = await new Promise((resolve) => {
        const ctl = new ListCtl(this.main, slots, {
          sound: this.sound,
          onChange: (it) => (desc.textContent = hh.equip[it.slot] ? ITEMS[hh.equip[it.slot]].desc : 'Nada equipado.'),
          onSelect: (it) => {
            this.ui.pop(ctl);
            resolve(it.slot);
          },
          onCancel: () => {
            this.ui.pop(ctl);
            resolve(null);
          },
        });
        this.ui.push(ctl);
      });
      this.main.append(desc, statBox);
      if (!slot) break;
      // lista de itens compatíveis
      this.clearMain();
      this.main.appendChild(h('div', 'section-title', 'Escolha o equipamento'));
      const desc2 = h('div', 'desc', '');
      const options = Object.entries(this.st.inventory)
        .filter(([k, q]) => q > 0 && ITEMS[k] && ITEMS[k].type === slot && (!ITEMS[k].for || ITEMS[k].for.includes(id)))
        .map(([k, q]) => ({ label: ITEMS[k].name, right: 'x' + q, k }));
      if (slot === 'acc') options.unshift({ label: '(remover)', k: null });
      if (!options.length) {
        this.main.appendChild(h('div', 'desc', 'Nenhum item compatível na bolsa.'));
        await new Promise((r) => setTimeout(r, 900));
        continue;
      }
      this.main.appendChild(desc2);
      const statBox2 = h('div', 'stat-grid', '');
      const pick = await new Promise((resolve) => {
        const ctl = new ListCtl(this.main, options, {
          sound: this.sound,
          onChange: (it) => {
            desc2.textContent = it.k ? ITEMS[it.k].desc : '';
            // prévia
            const saved = hh.equip[slot];
            hh.equip[slot] = it.k;
            const cmp = this.st.stats(id);
            hh.equip[slot] = saved;
            const cur = this.st.stats(id);
            statBox2.innerHTML = Object.keys(STAT_NAMES).map((k) => {
              const diff = cmp[k] - cur[k];
              const col = diff > 0 ? '#8affa0' : diff < 0 ? '#ff8a8a' : '#fff';
              return `<div><span class="k">${STAT_NAMES[k]}</span> ${cur[k]} → <span style="color:${col}">${cmp[k]}</span></div>`;
            }).join('');
          },
          onSelect: (it) => {
            this.ui.pop(ctl);
            resolve(it);
          },
          onCancel: () => {
            this.ui.pop(ctl);
            resolve(null);
          },
        });
        this.main.appendChild(statBox2);
        this.ui.push(ctl);
      });
      if (pick) {
        this.st.equip(id, slot, pick.k);
        this.game.sfx('confirm');
      }
    }
    this.preview('equip');
  }

  async openStatus() {
    const id = await this.pickHero('Status de quem?');
    if (!id) return this.preview('status');
    this.clearMain();
    const d = HERO_DATA[id];
    const hh = this.st.heroes[id];
    const s = this.st.stats(id);
    const box = h('div', '');
    box.innerHTML = `
      <div class="hero-card" style="padding:0">${heroCardHTML(this.game, id)}</div>
      <div class="section-title">${d.title}</div>
      <div class="desc" style="margin-bottom:8px">${d.bio}</div>
      <div class="stat-grid">${Object.keys(STAT_NAMES).map((k) => `<div><span class="k">${STAT_NAMES[k]}</span> ${s[k]}</div>`).join('')}</div>
      <div class="section-title">Tipo de arma</div>
      <div><span class="pill">${WEAPON_TYPES[d.weaponType].icon} ${WEAPON_TYPES[d.weaponType].name}</span></div>
      <div class="section-title">Técnicas</div>
      <div>${hh.skills.map((k) => `<span class="pill">${SKILLS[k].name}</span>`).join(' ')}</div>
      <div class="desc" style="margin-top:8px">EXP: ${hh.exp} / ${expToNext(hh.level)}</div>`;
    this.main.appendChild(box);
    await new Promise((resolve) => {
      const ctl = { handle: (a) => (a === 'cancel' || a === 'confirm' || a === 'menu') && (this.ui.pop(ctl), resolve()) };
      box.addEventListener('click', () => {
        this.ui.pop(ctl);
        resolve();
      });
      this.ui.push(ctl);
    });
    this.preview('status');
  }

  async openConfig() {
    const set = this.st.settings;
    for (;;) {
      this.clearMain();
      this.main.appendChild(h('div', 'section-title', 'Opções'));
      const q = { high: 'Alta', medium: 'Média', low: 'Baixa' };
      const opts = [
        { label: 'Gráficos', right: q[set.quality] || 'Média', k: 'quality' },
        { label: 'Música', right: Math.round(set.music * 10) + '/10', k: 'music' },
        { label: 'Efeitos', right: Math.round(set.sfx * 10) + '/10', k: 'sfx' },
        { label: 'Texto', right: set.textSpeed >= 1.5 ? 'Rápido' : set.textSpeed <= 0.75 ? 'Lento' : 'Normal', k: 'text' },
        { label: 'Tela cheia', right: '', k: 'full' },
        { label: 'Voltar', k: 'back' },
      ];
      const desc = h('div', 'desc', 'Toque para alternar. Gráficos exigem recarregar a página.');
      this.main.appendChild(desc);
      const pick = await new Promise((resolve) => {
        const ctl = new ListCtl(this.main, opts, {
          sound: this.sound,
          onSelect: (it) => {
            this.ui.pop(ctl);
            resolve(it.k);
          },
          onCancel: () => {
            this.ui.pop(ctl);
            resolve('back');
          },
        });
        this.ui.push(ctl);
      });
      if (pick === 'back') break;
      if (pick === 'quality') {
        const order = ['high', 'medium', 'low'];
        set.quality = order[(order.indexOf(set.quality) + 1) % 3];
        this.st.saveSettings();
        this.ui.toast('Recarregue a página para aplicar.');
      } else if (pick === 'music') {
        set.music = set.music >= 1 ? 0 : Math.round((set.music + 0.2) * 10) / 10;
        this.game.applyVolumes();
      } else if (pick === 'sfx') {
        set.sfx = set.sfx >= 1 ? 0 : Math.round((set.sfx + 0.2) * 10) / 10;
        this.game.applyVolumes();
      } else if (pick === 'text') {
        set.textSpeed = set.textSpeed >= 1.5 ? 0.75 : set.textSpeed <= 0.75 ? 1 : 1.6;
        this.ui.textSpeed = set.textSpeed;
      } else if (pick === 'full') {
        try {
          if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
          else await document.exitFullscreen();
        } catch (e) {
          this.ui.toast('Tela cheia indisponível aqui.');
        }
      }
      this.st.saveSettings();
    }
    this.preview('config');
  }
}

export function statsText(stats) {
  const n = { atk: 'ATQ', def: 'DEF', mag: 'MAG', res: 'RES', spd: 'AGI', hp: 'HP', mp: 'MP' };
  return Object.entries(stats).map(([k, v]) => `${n[k]} +${v}`).join('  ');
}
