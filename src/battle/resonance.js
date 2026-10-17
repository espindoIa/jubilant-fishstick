// Ressonância: o limite de cada herói, liberado quando a barra de ECO enche.
import { portraitURL } from '../ui/portraits.js';

export const RESONANCE = {
  lio: { name: 'Canto do Farol', target: 'enemy', desc: 'A canção de Aurora na lâmina: dano enorme de luz e quebra o escudo.' },
  sena: { name: 'Hino da Maré', target: 'allies', desc: 'Cura todo o grupo, remove males e reergue os caídos.' },
  estela: { name: 'Canção Estelar', target: 'enemies', desc: 'Uma chuva de estrelas atinge todos os inimigos.' },
  brann: { name: 'Baluarte de Ferro', target: 'allies', desc: 'DEF +80% e ATQ +30% para todo o grupo por 3 turnos.' },
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function cutIn(b, c) {
  const el = document.createElement('div');
  el.className = 'cutin';
  const url = portraitURL(c.id, 'happy') || portraitURL(c.id);
  el.innerHTML = `<img src="${url || ''}" alt=""><div><small>RESSONÂNCIA</small><b>${RESONANCE[c.id].name}</b></div>`;
  b.ui.root.appendChild(el);
  return el;
}

export async function doResonance(b, c, act) {
  const r = RESONANCE[c.id];
  b.eco = 0;
  b._hudDirty = true;
  c.anim = true;
  c.actor.setFrame('cast');
  b.game.sfx('star');
  b.ui.flash(260, '#d8f0ff', 0.7);
  const ci = cutIn(b, c);
  await wait(1100);
  ci.remove();
  b.effects.play('cast', c.actor.position, true);
  if (c.id === 'lio') {
    c.anim = false;
    await b.doAttack(c, act.targets[0], { power: 3.6, hits: 1, type: 'corte', element: 'luz', fx: 'starfall', shieldHits: 99 });
  } else if (c.id === 'estela') {
    b.game.sfx('magic');
    for (const t of act.targets) {
      if (t.hp <= 0) continue;
      b.effects.play('supernova', t.actor.position, c.actor.position);
      b.applyDamage(c, t, b.calcMag(c, t, 68), { element: 'luz', shieldHits: 2 });
      await wait(160);
    }
  } else if (c.id === 'sena') {
    for (const t of b.heroes) {
      t.status = {};
      if (t.hp <= 0) {
        b.effects.play('revive', t.actor.position);
        t.hp = Math.round(t.maxhp * 0.4);
        b.popup(t, t.hp, 'heal');
      } else {
        b.heal(t, Math.round(60 + b.stat(c, 'mag') * 3));
      }
      await wait(120);
    }
  } else if (c.id === 'brann') {
    for (const t of b.heroes) {
      if (t.hp <= 0) continue;
      t.buffs.Baluarte = { def: 0.8, atk: 0.3, turns: 4 };
      b.effects.play('buff', t.actor.position);
      b.popup(t, 'DEF↑ ATQ↑', 'label');
    }
    b.game.sfx('buff');
  }
  await wait(450);
  c.anim = false;
}
