const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'products.html', 'solutions.html', 'research.html'];
const forbidden = [
  /\b\d+(?:[.,]\d+)?\s*(?:x|%|times|ms|ns|ghz|mhz|nm|watts?|years?|months?)\b/i,
  /[$€£]\s*\d/,
  /\b(?:faster|speedups?|lower energy|performance gains?|unprecedented|state-of-the-art)\b/i,
  /\b(?:pricing plans?|purchase now|buy starter|buy professional|latest release)\b/i,
  /\b(?:case studies|industry leaders|outperform(?:s|ed)?|quantum advantage)\b/i,
];

function visibleText(html) {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const errors = [];
for (const page of pages) {
  const file = path.join(root, page);
  const html = fs.readFileSync(file, 'utf8');
  const text = visibleText(html);

  if ((html.match(/data-status-disclosure/g) || []).length !== 1) {
    errors.push(`${page}: requires exactly one explicit status disclosure`);
  }
  for (const pattern of forbidden) {
    if (pattern.test(text)) errors.push(`${page}: forbidden unsupported-claim pattern ${pattern}`);
  }
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (/^(?:https?:|#)/.test(href)) continue;
    const target = href.split('#')[0];
    if (!fs.existsSync(path.join(root, target))) {
      errors.push(`${page}: broken local link ${href}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Content integrity passed for ${pages.length} public pages`);
