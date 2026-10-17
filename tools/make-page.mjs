// Converte dist-single/index.html em uma página sem doctype/head/body
// (formato de publicação como página única hospedada).
// Uso: npm run build:single && node tools/make-page.mjs saida.html
import fs from 'node:fs';

const out = process.argv[2] || 'dist-single/page.html';
const src = fs.readFileSync('dist-single/index.html', 'utf8');
const head = src.slice(src.indexOf('<head>') + 6, src.indexOf('</head>'));
const body = src.slice(src.indexOf('<body>') + 6, src.lastIndexOf('</body>'));
const styles = head.match(/<style[^>]*>[\s\S]*?<\/style>/g) || [];
const scripts = (head + body).match(/<script[^>]*>[\s\S]*?<\/script>/g) || [];
const title = head.match(/<title>[\s\S]*?<\/title>/)[0];
const html = [
  title,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />',
  '<meta name="theme-color" content="#0b0a14" />',
  '<style>:root{color-scheme:dark;background:#000}html,body{background:#000;color:#fff}</style>',
  ...styles,
  body.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '').trim(),
  ...scripts,
].join('\n');
fs.writeFileSync(out, html + '\n');
console.log('página gerada:', out, (html.length / 1024).toFixed(0) + ' KB');
