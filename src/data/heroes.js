// Heróis: classe, atributos base, crescimento por nível, técnicas aprendidas.
export const HERO_DATA = {
  lio: {
    name: 'Lio',
    title: 'Aprendiz de Faroleiro',
    cls: 'Espadachim',
    weaponType: 'corte',
    color: '#ff7a5a',
    base: { hp: 52, mp: 10, atk: 12, def: 8, mag: 5, res: 6, spd: 11 },
    grow: { hp: 9.5, mp: 1.8, atk: 2.2, def: 1.4, mag: 0.8, res: 1.0, spd: 0.9 },
    learn: { 1: ['corte_duplo'], 3: ['lamina_ignea'], 6: ['foco'], 9: ['ventania'], 12: ['estrela_cadente'] },
    equip: { weapon: 'espada_curta', armor: 'roupa_viagem', acc: null },
    bio: 'Neto da faroleira Odessa. Ouve o "canto" das estrelas desde criança, mas nunca contou isso a ninguém.',
  },
  sena: {
    name: 'Sena',
    title: 'Guardiã do Santuário',
    cls: 'Sacerdotisa',
    weaponType: 'impacto',
    color: '#5fe0c8',
    base: { hp: 40, mp: 22, atk: 7, def: 7, mag: 10, res: 11, spd: 9 },
    grow: { hp: 7.2, mp: 3.4, atk: 1.2, def: 1.1, mag: 1.8, res: 1.6, spd: 0.9 },
    learn: { 1: ['cura', 'luz_sagrada'], 4: ['bencao'], 6: ['purificar'], 8: ['prece'], 10: ['reviver'] },
    equip: { weapon: 'cajado_carvalho', armor: 'veste_santuario', acc: null },
    bio: 'Amiga de infância de Lio. Calma por fora, teimosa por dentro. Cuida sozinha do santuário desde que a mãe partiu.',
  },
  estela: {
    name: 'Estela',
    title: 'A Estrela Caída',
    cls: 'Maga Estelar',
    weaponType: 'impacto',
    color: '#ffd860',
    base: { hp: 34, mp: 26, atk: 5, def: 5, mag: 14, res: 10, spd: 10 },
    grow: { hp: 6.2, mp: 4.0, atk: 0.8, def: 0.9, mag: 2.4, res: 1.5, spd: 1.0 },
    learn: { 1: ['faisca', 'geada', 'trovao'], 6: ['chuva_estelar'], 9: ['gravidade'], 12: ['supernova'] },
    equip: { weapon: 'astrolabio_rachado', armor: 'vestido_estelar', acc: null },
    bio: 'Caiu do céu na noite do festival. Não lembra de quase nada — só que "o céu está esquecendo".',
  },
  brann: {
    name: 'Brann',
    title: 'O Desertor',
    cls: 'Guardião',
    weaponType: 'perfuracao',
    color: '#9ab4d0',
    base: { hp: 72, mp: 8, atk: 13, def: 13, mag: 4, res: 8, spd: 7 },
    grow: { hp: 12, mp: 1.5, atk: 2.1, def: 2.0, mag: 0.6, res: 1.1, spd: 0.7 },
    learn: { 1: ['provocar', 'estocada'], 5: ['muralha'], 8: ['terremoto'], 11: ['investida'] },
    equip: { weapon: 'lanca_velha', armor: 'armadura_amassada', acc: null },
    bio: 'Ex-cavaleiro do Império de Ferro. Raspou o brasão da própria armadura no dia em que se recusou a cumprir uma ordem.',
  },
};

export function expToNext(level) {
  return Math.round(26 + level * level * 11 + level * 6);
}
