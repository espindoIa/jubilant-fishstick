// Gerenciador de interface: diálogos com retrato, escolhas, banners, toasts,
// fades e listas navegáveis por teclado/toque (pilha de foco).
import './ui.css';
import { portraitURL } from './portraits.js';

export function h(tag, cls, html) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html !== undefined) el.innerHTML = html;
  return el;
}

// Lista navegável
export class ListCtl {
  constructor(container, items, opts = {}) {
    this.container = container;
    this.items = items;
    this.opts = opts;
    this.index = Math.max(0, Math.min(items.length - 1, opts.index || 0));
    this.cols = opts.cols || 1;
    this.el = h('div', 'list');
    if (this.cols > 1) {
      this.el.style.display = 'grid';
      this.el.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    }
    container.appendChild(this.el);
    this.render();
  }

  render() {
    this.el.innerHTML = '';
    this.nodes = this.items.map((it, i) => {
      const n = h('div', 'opt' + (it.disabled ? ' disabled' : '') + (i === this.index ? ' sel' : ''));
      if (this.opts.renderItem) n.innerHTML = this.opts.renderItem(it, i);
      else n.innerHTML = `<span>${it.label}</span>${it.right !== undefined ? `<span class="r">${it.right}</span>` : ''}`;
      n.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
      n.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.index === i || this.opts.tapSelects !== false) {
          this.index = i;
          this.refreshSel();
          this.select();
        } else {
          this.index = i;
          this.refreshSel();
          this.opts.onChange?.(this.items[i], i);
        }
      });
      this.el.appendChild(n);
      return n;
    });
    this.opts.onChange?.(this.items[this.index], this.index);
  }

  refreshSel() {
    this.nodes.forEach((n, i) => n.classList.toggle('sel', i === this.index));
    const n = this.nodes[this.index];
    if (n && n.scrollIntoView) n.scrollIntoView({ block: 'nearest' });
  }

  move(d) {
    if (!this.items.length) return;
    this.index = (this.index + d + this.items.length) % this.items.length;
    this.refreshSel();
    this.opts.sound?.('cursor');
    this.opts.onChange?.(this.items[this.index], this.index);
  }

  select() {
    const it = this.items[this.index];
    if (!it) return;
    if (it.disabled) {
      this.opts.sound?.('error');
      return;
    }
    this.opts.sound?.('confirm');
    this.opts.onSelect?.(it, this.index);
  }

  handle(a) {
    if (a === 'nav:ArrowUp') this.move(-this.cols);
    else if (a === 'nav:ArrowDown') this.move(this.cols);
    else if (a === 'nav:ArrowLeft') this.move(this.cols > 1 ? -1 : -1);
    else if (a === 'nav:ArrowRight') this.move(this.cols > 1 ? 1 : 1);
    else if (a === 'confirm') this.select();
    else if (a === 'cancel' || a === 'menu') {
      if (this.opts.onCancel) {
        this.opts.sound?.('cancel');
        this.opts.onCancel();
      }
    }
    return true;
  }

  destroy() {
    this.el.remove();
  }
}

export class UI {
  constructor(root, input, sound = () => {}) {
    this.root = root;
    this.input = input;
    this.sound = sound;
    this.focus = [];
    this.fadeEl = h('div', 'fade');
    this.flashEl = h('div', 'flash');
    // dentro do #ui e antes de tudo: cobre o cenário 3D, mas diálogos, menus e
    // o título continuam visíveis por cima do preto (narração sobre fundo escuro)
    root.prepend(this.flashEl);
    root.prepend(this.fadeEl);
    this.bannerEl = h('div', 'banner', '<div class="s"></div><div class="line"></div><div class="t"></div><div class="line"></div>');
    root.appendChild(this.bannerEl);
    this.textSpeed = 1;
    input.onPress((a) => this.dispatch(a));
  }

  get busy() {
    return this.focus.length > 0;
  }

  push(ctl) {
    this.focus.push(ctl);
    return ctl;
  }

  pop(ctl) {
    const i = this.focus.lastIndexOf(ctl);
    if (i >= 0) this.focus.splice(i, 1);
  }

  dispatch(a) {
    const top = this.focus[this.focus.length - 1];
    if (top) {
      top.handle(a);
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------- diálogo
  // speaker: { name, portrait, expr } | null (narração)
  say(speaker, text, opts = {}) {
    return new Promise((resolve) => {
      const narration = !speaker;
      const box = h('div', 'win dlg' + (narration ? ' narration' : ''));
      if (speaker && speaker.portrait) {
        const p = h('div', 'portrait');
        const url = portraitURL(speaker.portrait, speaker.expr || 'neutral');
        if (url) p.innerHTML = `<img alt="" src="${url}">`;
        box.appendChild(p);
      }
      const body = h('div', 'body');
      if (speaker && speaker.name) body.appendChild(h('div', 'name', speaker.name));
      const tx = h('div', 'text');
      body.appendChild(tx);
      box.appendChild(body);
      const next = h('div', 'next hidden', '▼');
      box.appendChild(next);
      this.root.appendChild(box);

      // marcação simples: *destaque* e _brilho_
      const html = escapeHtml(text).replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/_(.+?)_/g, '<b>$1</b>');
      const plain = html.replace(/<[^>]+>/g, '');
      let shown = 0;
      let done = false;
      const total = plain.length;
      const cps = 52 * this.textSpeed;
      let last = performance.now();
      let acc = 0;
      const render = () => {
        // revela "shown" caracteres preservando as tags
        let out = '', count = 0, i = 0;
        while (i < html.length && count < shown) {
          if (html[i] === '<') {
            const j = html.indexOf('>', i);
            out += html.slice(i, j + 1);
            i = j + 1;
          } else if (html[i] === '&') {
            const j = html.indexOf(';', i);
            out += html.slice(i, j + 1);
            i = j + 1;
            count++;
          } else {
            out += html[i++];
            count++;
          }
        }
        // fecha tags abertas
        const opens = (out.match(/<(em|b)>/g) || []).length - (out.match(/<\/(em|b)>/g) || []).length;
        if (opens > 0) out += out.lastIndexOf('<em>') > out.lastIndexOf('<b>') ? '</em>' : '</b>';
        tx.innerHTML = out;
      };
      let raf;
      const tick = (now) => {
        const dt = (now - last) / 1000;
        last = now;
        acc += dt * cps;
        const before = shown;
        while (acc >= 1 && shown < total) {
          shown++;
          acc -= 1;
          const ch = plain[shown - 1];
          if (ch === '.' || ch === '!' || ch === '?') acc -= 6;
          else if (ch === ',') acc -= 3;
        }
        if (shown !== before) {
          render();
          if (Math.floor(shown / 3) !== Math.floor(before / 3)) this.sound('text');
        }
        if (shown >= total) {
          done = true;
          next.classList.remove('hidden');
          if (opts.auto) setTimeout(finish, opts.auto * TIME.scale);
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const finish = () => {
        cancelAnimationFrame(raf);
        this.pop(ctl);
        window.removeEventListener('pointerdown', onAnyTap);
        box.remove();
        resolve();
      };
      const advance = () => {
        if (!done) {
          shown = total;
          render();
          done = true;
          next.classList.remove('hidden');
          cancelAnimationFrame(raf);
          return;
        }
        if (opts.auto) return;
        finish();
      };
      const ctl = { handle: (a) => (a === 'confirm' || a === 'cancel') && advance() };
      box.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        advance();
      });
      // no celular, tocar em qualquer lugar da tela avança o texto
      // (menos em botões e outras janelas, como o ☰ ou escolhas)
      function onAnyTap(e) {
        if (e.target.closest?.('button, .tbtn, .menu-close, .win:not(.dlg)')) return;
        advance();
      }
      window.addEventListener('pointerdown', onAnyTap);
      this.push(ctl);
    });
  }

  choose(options, opts = {}) {
    return new Promise((resolve) => {
      const win = h('div', 'win choices');
      this.root.appendChild(win);
      const ctl = new ListCtl(win, options.map((o) => (typeof o === 'string' ? { label: o } : o)), {
        sound: this.sound,
        onSelect: (it, i) => {
          this.pop(ctl);
          win.remove();
          resolve(i);
        },
        onCancel: opts.cancel !== undefined ? () => {
          this.pop(ctl);
          win.remove();
          resolve(opts.cancel);
        } : null,
      });
      this.push(ctl);
    });
  }

  // -------------------------------------------------------------- avisos
  banner(title, sub = '', ms = 2600) {
    this.bannerEl.querySelector('.t').textContent = title;
    this.bannerEl.querySelector('.s').textContent = sub;
    this.bannerEl.classList.add('on');
    clearTimeout(this._bt);
    this._bt = setTimeout(() => this.bannerEl.classList.remove('on'), ms);
  }

  toast(html, ms = 1800) {
    const t = h('div', 'win thin toast', html);
    this.root.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .3s';
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 320);
    }, ms);
  }

  // -------------------------------------------------------------- fades
  fadeOut(ms = 400, color = '#000') {
    this.fadeEl.style.background = color;
    this.fadeEl.style.transitionDuration = ms * TIME.scale + 'ms';
    this.fadeEl.style.opacity = '1';
    return wait(ms);
  }

  fadeIn(ms = 400) {
    this.fadeEl.style.transitionDuration = ms * TIME.scale + 'ms';
    this.fadeEl.style.opacity = '0';
    return wait(ms);
  }

  setFade(v, color = '#000') {
    this.fadeEl.style.transitionDuration = '0ms';
    this.fadeEl.style.background = color;
    this.fadeEl.style.opacity = String(v);
  }

  flash(ms = 260, color = '#fff', peak = 0.85) {
    const f = this.flashEl;
    f.style.background = color;
    f.style.transition = 'none';
    f.style.opacity = String(peak);
    void f.offsetWidth;
    f.style.transition = `opacity ${ms * TIME.scale}ms ease-out`;
    f.style.opacity = '0';
    return wait(ms);
  }
}

// ?fast=1 encurta esperas (testes); ?speed=N acelera o jogo inteiro N vezes
// (loop, esperas, fades e texto) — usado para assistir/testar a história rápido.
const QS = new URLSearchParams(location.search);
const SPEED = Math.max(1, Math.min(20, +(QS.get('speed') || 1) || 1));
export const TIME = { speed: SPEED, scale: (QS.get('fast') === '1' ? 0.15 : 1) / SPEED };

export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms * TIME.scale));
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}
