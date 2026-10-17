// Estilhaços de Memória: fragmentos de Estela espalhados pelos mapas.
// Cada um revela uma lembrança; juntar os seis monta a verdade sobre a Lua Cinzenta.
export const SHARDS = {
  vila: [
    { id: 'vila1', x: 22, y: 24, title: 'O mar de luz', text: 'Havia uma noite sem lua em que todas nós cantávamos juntas. Não existia “eu” nem “você”. Era um único mar de luz, e o céu respirava no mesmo ritmo.' },
  ],
  bosque: [
    { id: 'bosque1', x: 9, y: 35, title: 'A voz que nos chamava', text: 'Alguém nos chamava do chão. Uma voz de mulher dizia nossos nomes, um por um — e a gente respondia. Eu sempre soube qual era o meu pela forma como ela o cantava.' },
    { id: 'bosque2', x: 25, y: 26, title: 'Polar', text: 'Minha irmã mais velha se chamava Polar. Numa noite, uma sombra redonda e cinzenta passou por cima dela. Polar parou de cantar sem fazer barulho nenhum. Ninguém a viu cair.' },
  ],
  caverna: [
    { id: 'caverna1', x: 13, y: 12, title: 'O aviso', text: 'Fomos avisadas: “quando uma de vocês cair, o mundo esquecerá”. Eu quis ficar. Mas a voz da mulher parou de repente, e o chão me puxou como uma mão fria.' },
    { id: 'caverna2', x: 33, y: 10, title: 'Fumaça preta', text: 'Antes de eu cair, vi um navio de fumaça preta subindo para nos alcançar. O Império já sabia onde cada uma de nós ia pousar. Alguém lá dentro conhecia o mapa do céu.' },
  ],
  forte: [
    { id: 'forte1', x: 30, y: 37, title: 'A lua que não canta', text: 'A Lua Cinzenta não é uma lua. É a primeira de nós que parou de cantar. Ela ainda me chama — mas o chamado, agora, é fome. É por isso que o céu está esquecendo.' },
  ],
};

export const ALL_SHARDS = Object.values(SHARDS).flat();
export const shardFlag = (id) => 'eco_' + id;

export function shardCount(state) {
  return ALL_SHARDS.filter((s) => state.flag(shardFlag(s.id))).length;
}

export function shardInteractables(mapId) {
  return (SHARDS[mapId] || []).map((s) => ({
    x: s.x, y: s.y, script: 'shard_' + s.id, r: 1.0,
    cond: (st) => !st.flag(shardFlag(s.id)),
  }));
}

// props visíveis (apenas os ainda não coletados)
export function shardProps(mapId, state) {
  if (!state) return [];
  return (SHARDS[mapId] || [])
    .filter((s) => !state.flag(shardFlag(s.id)))
    .map((s) => ({ prop: 'crystalblue', x: s.x + 0.5, y: s.y + 0.5, noCollide: true }));
}
