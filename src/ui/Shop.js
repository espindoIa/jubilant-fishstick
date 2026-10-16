// Loja: comprar e vender itens.
import { h, ListCtl } from './UI.js';
import { ITEMS } from '../data/items.js';
import { statsText } from './Menu.js';

export class Shop {
  constructor(game, list) {
    this.game = game;
    this.list = list;
    this.st = game.state;
    this.ui = game.ui;
  }

  sound = (s) => this.game.sfx(s);

  async run() {
    const root = h('div', 'menu-root');
    this.ui.root.appendChild(root);
    const top = h('div', 'win menu-tabs');
    const main = h('div', 'win menu-main');
    const info = h('div', 'win menu-info');
    root.append(top, main, info);
    const back = h('div', 'menu-close', '✕');
    back.addEventListener('click', (e) => {
      e.stopPropagation();
      this.ui.dispatch('cancel');
    });
    main.appendChild(back);
    const renderInfo = () => (info.innerHTML = `💰 <span style="color:var(--gold)">${this.st.gold}</span> moedas`);
    renderInfo();
    for (;;) {
      top.innerHTML = '';
      main.innerHTML = '';
      main.appendChild(back);
      main.appendChild(h('div', 'desc', 'O que deseja?'));
      const mode = await new Promise((resolve) => {
        const ctl = new ListCtl(top, [{ label: 'Comprar', v: 'buy' }, { label: 'Vender', v: 'sell' }, { label: 'Sair', v: 'exit' }], {
          sound: this.sound,
          onSelect: (it) => {
            this.ui.pop(ctl);
            resolve(it.v);
          },
          onCancel: () => {
            this.ui.pop(ctl);
            resolve('exit');
          },
        });
        this.ui.push(ctl);
      });
      if (mode === 'exit') break;
      for (;;) {
        main.innerHTML = '';
        main.appendChild(back);
        const desc = h('div', 'desc', '');
        main.appendChild(h('div', 'section-title', mode === 'buy' ? 'Comprar' : 'Vender'));
        main.appendChild(desc);
        const entries = mode === 'buy'
          ? this.list.map((k) => ({ k, label: ITEMS[k].name, right: ITEMS[k].price + ' 💰', disabled: this.st.gold < ITEMS[k].price }))
          : Object.entries(this.st.inventory).filter(([k, q]) => q > 0 && ITEMS[k] && ITEMS[k].price > 0).map(([k, q]) => ({ k, label: `${ITEMS[k].name} x${q}`, right: Math.floor(ITEMS[k].price / 2) + ' 💰' }));
        if (!entries.length) {
          main.appendChild(h('div', 'desc', 'Nada para vender.'));
          await new Promise((r) => setTimeout(r, 800));
          break;
        }
        const pick = await new Promise((resolve) => {
          const ctl = new ListCtl(main, entries, {
            sound: this.sound,
            onChange: (it) => {
              const item = ITEMS[it.k];
              const owned = this.st.inventory[it.k] || 0;
              const forWho = item.for ? ' · Para: ' + item.for.map((x) => x[0].toUpperCase() + x.slice(1)).join(', ') : '';
              desc.innerHTML = `${item.desc}${item.stats ? ' <span style="color:var(--gold)">' + statsText(item.stats) + '</span>' : ''}${forWho} <span class="pill">Tem: ${owned}</span>`;
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
          this.ui.push(ctl);
        });
        if (!pick) break;
        const item = ITEMS[pick.k];
        if (mode === 'buy') {
          if (this.st.gold >= item.price) {
            this.st.gold -= item.price;
            this.st.addItem(pick.k, 1);
            this.game.sfx('item');
            this.ui.toast(`Comprou ${item.name}.`, 900);
          }
        } else {
          this.st.gold += Math.floor(item.price / 2);
          this.st.addItem(pick.k, -1);
          this.game.sfx('item');
        }
        renderInfo();
      }
    }
    root.remove();
  }
}
