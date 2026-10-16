// Entrada unificada: teclado, controle virtual (joystick + botões) e toque.
export class Input {
  constructor() {
    this.keys = new Set();
    this.pressed = new Set(); // ações disparadas neste frame
    this.axis = { x: 0, y: 0 };
    this.stick = { x: 0, y: 0, active: false, run: false };
    this.enabled = true;
    window.addEventListener('keydown', (e) => {
      if (e.repeat) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) this.press('nav:' + e.key);
        return;
      }
      this.keys.add(e.key.toLowerCase());
      const map = {
        enter: 'confirm', ' ': 'confirm', z: 'confirm', j: 'confirm',
        escape: 'cancel', x: 'cancel', k: 'cancel', backspace: 'cancel',
        m: 'menu', tab: 'menu', c: 'menu',
      };
      const a = map[e.key.toLowerCase()];
      if (a) {
        this.press(a);
        if (e.key === 'Tab' || e.key === ' ') e.preventDefault();
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.press('nav:' + e.key);
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());
  }

  press(a) {
    this.pressed.add(a);
    for (const fn of this.listeners || []) fn(a);
  }

  onPress(fn) {
    (this.listeners ||= []).push(fn);
    return () => (this.listeners = this.listeners.filter((f) => f !== fn));
  }

  consume(a) {
    if (this.pressed.has(a)) {
      this.pressed.delete(a);
      return true;
    }
    return false;
  }

  endFrame() {
    this.pressed.clear();
  }

  move() {
    if (!this.enabled) return { x: 0, y: 0 };
    let x = 0, y = 0;
    const k = this.keys;
    if (k.has('arrowleft') || k.has('a')) x -= 1;
    if (k.has('arrowright') || k.has('d')) x += 1;
    if (k.has('arrowup') || k.has('w')) y -= 1;
    if (k.has('arrowdown') || k.has('s')) y += 1;
    if (this.stick.active) {
      x = this.stick.x;
      y = this.stick.y;
    }
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    return { x, y, run: k.has('shift') || (this.stick.active && this.stick.run) };
  }
}

// Vibração curta (onde houver suporte) para dar resposta tátil aos botões.
export function buzz(ms = 10) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* sem vibração */
  }
}

// Controles virtuais de toque (joystick flutuante na metade esquerda, botões à direita)
export class TouchControls {
  constructor(input, root) {
    this.input = input;
    const el = document.createElement('div');
    el.className = 'touch-layer';
    el.innerHTML = `
      <div class="stick-zone"></div>
      <div class="stick-base"><div class="stick-knob"></div></div>
      <button class="tbtn tbtn-a" aria-label="Ação">A</button>
      <button class="tbtn tbtn-menu" aria-label="Menu">☰</button>
    `;
    root.appendChild(el);
    this.el = el;
    const hint = document.createElement('div');
    hint.className = 'rotate-hint';
    hint.textContent = '↻ Gire o aparelho para jogar deitado';
    root.appendChild(hint);
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('dblclick', (e) => e.preventDefault());
    // mantém a tela ligada durante o jogo (o pedido é renovado ao voltar à aba)
    const keepAwake = async () => {
      try {
        if (document.visibilityState === 'visible') await navigator.wakeLock?.request('screen');
      } catch {
        /* sem wake lock */
      }
    };
    window.addEventListener('pointerdown', keepAwake, { once: true });
    document.addEventListener('visibilitychange', keepAwake);
    const zone = el.querySelector('.stick-zone');
    const base = el.querySelector('.stick-base');
    const knob = el.querySelector('.stick-knob');
    let id = null, ox = 0, oy = 0;
    const R = 46;
    const start = (e) => {
      const t = e.changedTouches ? e.changedTouches[0] : e;
      id = t.identifier ?? 'mouse';
      ox = t.clientX;
      oy = t.clientY;
      base.style.left = ox + 'px';
      base.style.top = oy + 'px';
      base.classList.add('on');
      input.stick.active = true;
      input.stick.x = input.stick.y = 0;
      e.preventDefault();
    };
    const moveH = (e) => {
      if (id === null) return;
      const list = e.changedTouches ? [...e.changedTouches] : [e];
      const t = list.find((tt) => (tt.identifier ?? 'mouse') === id);
      if (!t) return;
      let dx = t.clientX - ox, dy = t.clientY - oy;
      const l = Math.hypot(dx, dy);
      if (l > R) {
        dx = (dx / l) * R;
        dy = (dy / l) * R;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const k = Math.min(1, l / R);
      const dead = 0.18;
      const m = k < dead ? 0 : (k - dead) / (1 - dead);
      input.stick.x = l ? (dx / Math.max(l, 1)) * m : 0;
      input.stick.y = l ? (dy / Math.max(l, 1)) * m : 0;
      // empurrar o joystick até a borda = correr (o botão acende)
      input.stick.run = k >= 0.97;
      knob.classList.toggle('run', input.stick.run);
      e.preventDefault();
    };
    const end = (e) => {
      const list = e.changedTouches ? [...e.changedTouches] : [e];
      if (!list.some((tt) => (tt.identifier ?? 'mouse') === id)) return;
      id = null;
      base.classList.remove('on');
      knob.style.transform = '';
      input.stick.active = false;
      input.stick.run = false;
      knob.classList.remove('run');
      input.stick.x = input.stick.y = 0;
    };
    zone.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('touchmove', moveH, { passive: false });
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);
    const btn = (sel, action) => {
      const b = el.querySelector(sel);
      const fire = (e) => {
        e.preventDefault();
        e.stopPropagation();
        b.classList.add('down');
        buzz(12);
        input.press(action);
      };
      b.addEventListener('touchstart', fire, { passive: false });
      b.addEventListener('mousedown', fire);
      const up = () => b.classList.remove('down');
      b.addEventListener('touchend', up);
      b.addEventListener('mouseup', up);
    };
    btn('.tbtn-a', 'confirm');
    btn('.tbtn-menu', 'menu');
  }

  show(v) {
    this.el.style.display = v ? '' : 'none';
    if (!v) {
      this.input.stick.active = false;
      this.input.stick.x = this.input.stick.y = 0;
    }
  }
}
