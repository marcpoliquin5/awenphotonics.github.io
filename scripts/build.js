const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function minifyHTML(input) {
  return input
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function minifyCSS(input) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .trim();
}

function copyAndMinify(filePath, rel) {
  const ext = path.extname(filePath).toLowerCase();
  let outPath = path.join(OUT, rel);
  ensureDir(path.dirname(outPath));
  let data = fs.readFileSync(filePath, 'utf8');
  if (ext === '.html') data = minifyHTML(data);
  else if (ext === '.css') data = minifyCSS(data);
  fs.writeFileSync(outPath, data, 'utf8');
}

function shouldInclude(name) {
  if (name === 'node_modules') return false;
  if (name === '.git') return false;
  if (name === 'dist') return false;
  if (name === 'scripts') return true;
  return true;
}

function walk(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (!shouldInclude(e.name)) continue;
    const full = path.join(dir, e.name);
    const rel = path.join(base, e.name);
    if (e.isDirectory()) {
      walk(full, rel);
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.txt', '.pdf', '.woff2', '.woff', '.ttf', '.eot', '.map', '.json', ''].includes(ext || '')) {
        copyAndMinify(full, rel);
      } else {
        copyAndMinify(full, rel);
      }
    }
  }
}

function cleanOut() {
  if (fs.existsSync(OUT)) {
    fs.rmSync(OUT, { recursive: true, force: true });
  }
  ensureDir(OUT);
}

function main() {
  console.log('Building site into dist/');
  cleanOut();
  walk(ROOT);
  console.log('Build complete. Files written to dist/');
}

main();
