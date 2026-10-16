import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// SINGLE=1 gera um único index.html autocontido (usado para publicar como página única).
const single = process.env.SINGLE === '1';

export default defineConfig({
  base: './',
  plugins: single ? [viteSingleFile()] : [],
  server: { host: true, port: 5173 },
  build: {
    outDir: single ? 'dist-single' : 'dist',
    target: 'es2020',
    assetsInlineLimit: single ? 100000000 : 4096,
    chunkSizeWarningLimit: 2000,
  },
});
