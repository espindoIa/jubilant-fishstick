// Ecos da Aurora — ponto de entrada.
import '@fontsource/dotgothic16/latin.css';
import '@fontsource/dotgothic16/latin-ext.css';
import { Game } from './game/Game.js';
import { registerCharacters } from './game/assets.js';
import { HEROES } from './art/sprites/index.js';
import { loadImageSprites } from './art/imageSprites.js';

const npcMods = import.meta.glob('./art/sprites/npcs.js', { eager: true });
const NPCS = Object.values(npcMods)[0]?.NPCS || [];
registerCharacters([...HEROES, ...NPCS]);

// evita zoom/rolagem acidental no celular
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

const game = new Game();
// sprites em PNG, se houver, carregam antes do primeiro quadro
Promise.allSettled([document.fonts?.ready, loadImageSprites()]).finally(() => game.start());
