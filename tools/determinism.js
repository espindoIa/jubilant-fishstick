// Reprodutibilidade: (1) mesma semente + mesmas decisões => jornada idêntica;
// (2) salvar em JSON no meio da jornada e continuar dá o mesmo resultado
// (é o que o botão "Continuar jornada" faz); (3) sementes diferentes divergem.
const { DATA, ENGINE } = require('./load-engine')();
function decide(run, k) {
  // política simples e determinística (sem PRNG próprio)
  if (run.phase === 'map') { const o = ENGINE.availableNodes(run); ENGINE.enterNode(run, o[k % o.length]); }
  else if (run.phase === 'battle') {
    ENGINE.runUntilDecision(run);
    if (run.battle.result) { ENGINE.finishBattle(run); return; }
    const acts = ENGINE.legalActions(run).filter((a) => a.kind !== 'hold');
    const a = acts[k % acts.length];
    ENGINE.doAction(run, { kind: a.kind, id: a.id, target: a.targets ? a.targets[k % a.targets.length] : undefined });
  } else if (run.phase === 'reward' || run.phase === 'treasure') ENGINE.chooseReward(run, 0);
  else if (run.phase === 'rest') ENGINE.restChoice(run, k % 2 ? 'rest' : 'train');
  else if (run.phase === 'event') ENGINE.eventChoice(run, 0);
}
function play(seed, saveAt) {
  let run = ENGINE.newRun(seed, ['lume', 'sino'], ENGINE.newMeta());
  for (let k = 0; run.phase !== 'over' && k < 20000; k++) {
    if (k === saveAt) run = JSON.parse(JSON.stringify(run));
    decide(run, k);
  }
  return JSON.stringify({ over: run.over, stats: run.stats, party: run.party, relics: run.relics, rng: run.rng });
}
let ok = 0, fail = 0;
for (let s = 1; s <= 200; s++) {
  const seed = (s * 2654435761) >>> 0;
  const a = play(seed, -1), b = play(seed, -1), c = play(seed, 37 + (s % 50));
  if (a === b && a === c) ok++; else { fail++; console.log('divergiu na semente', ENGINE.seedToStr(seed)); }
}
const distinct = new Set(); for (let s = 1; s <= 50; s++) distinct.add(play(s * 7919, -1));
console.log(`reprodutível: ${ok}/200 sementes (incl. salvar+recarregar no meio) · sementes distintas geraram ${distinct.size}/50 jornadas diferentes`);
process.exitCode = fail || distinct.size < 45 ? 1 : 0;
