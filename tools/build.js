// Monta o jogo em um arquivo único a partir de src/. Uso: node tools/build.js
//  - index.html          : versão autônoma (abre direto no navegador)
//  - dist/artifact.html  : mesma página sem <!doctype>/<html> (o publicador do Artifact adiciona o esqueleto)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
let body = fs.readFileSync(path.join(root, 'src/shell.html'), 'utf8');
body = body.replace(/\/\*@include ([\w.-]+)\*\//g, (_, f) => fs.readFileSync(path.join(root, 'src', f), 'utf8').replace(/\s+$/, ''));
const full = '<!doctype html>\n<html lang="pt-BR">\n<head>\n' + body.replace('<div id="app"></div>', '</head>\n<body>\n<div id="app"></div>') + '\n</body>\n</html>\n';
fs.writeFileSync(path.join(root, 'index.html'), full);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/artifact.html'), body);
console.log('index.html', (full.length / 1024).toFixed(1) + ' KB · dist/artifact.html', (body.length / 1024).toFixed(1) + ' KB');
