/**
 * Static-site validation for the GrandSky marketing site.
 *
 * This is a no-build, zero-dependency repo: every page is hand-written HTML,
 * so the regressions that actually bite here (a mistyped path, a duplicated id,
 * a CSS custom property that no longer exists, a 25 MB logo slipping back in)
 * are all catchable by reading the files. That is what this script does.
 *
 * Run locally:  node scripts/check-site.mjs
 * Exits non-zero on the first category of failure so CI fails the build.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MAX_ASSET_BYTES = 1024 * 1024; // 1 MB — guards against the 25 MB logo incident
const BINARY_EXT = /\.(png|jpe?g|gif|webp|svg|ico|pdf|woff2?|ttf|otf|mp4)$/i;
const SKIP_DIRS = new Set(['.git', 'node_modules', '.vly-run']);

const failures = [];
const warnings = [];

function fail(section, message) {
  failures.push(`[${section}] ${message}`);
}
function warn(section, message) {
  warnings.push(`[${section}] ${message}`);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const ALL_FILES = walk(ROOT);
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const HTML_FILES = ALL_FILES.filter((f) => f.endsWith('.html'));
const CSS_FILES = ALL_FILES.filter((f) => f.endsWith('.css'));
const JS_FILES = ALL_FILES.filter((f) => f.endsWith('.js'));

/* -------------------------------------------------------------- JavaScript */
for (const file of JS_FILES) {
  const src = fs.readFileSync(file, 'utf8');
  try {
    // Compiling is the cheapest faithful syntax check for classic scripts.
    new vm.Script(src, { filename: file });
  } catch (err) {
    fail('js', `${rel(file)} — ${err.message}`);
  }
}

/* ------------------------------------------------------------------- HTML */
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);
const inlineUsed = new Set();
const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g;
const ATTR_RE = /([a-zA-Z-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

function parseAttrs(raw) {
  const attrs = {};
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(raw))) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

/** Custom properties declared in, or consumed by, inline style="" attributes. */
function collectInlineCustomProps(html) {
  const declared = new Set();
  const consumed = new Set();
  const re = /style="([^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    const declRe = /(--[\w-]+)\s*:/g;
    let d;
    while ((d = declRe.exec(m[1]))) declared.add(d[1]);
    const useRe2 = /var\(\s*(--[\w-]+)/g;
    let u;
    while ((u = useRe2.exec(m[1]))) consumed.add(u[1]);
  }
  return { declared, consumed };
}

for (const file of HTML_FILES) {
  const page = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  /* Tag balance */
  const stack = [];
  let mismatched = null;
  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(html))) {
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const selfClosing = m[4] === '/' || VOID_TAGS.has(tag);
    if (selfClosing) continue;
    if (!closing) {
      stack.push(tag);
    } else if (!stack.length) {
      mismatched = `unexpected </${tag}>`;
      break;
    } else {
      const openTag = stack.pop();
      if (openTag !== tag) {
        mismatched = `expected </${openTag}> but found </${tag}>`;
        break;
      }
    }
  }
  if (!mismatched && stack.length) mismatched = `unclosed <${stack.join('>, <')}>`;
  if (mismatched) fail('html', `${page} — ${mismatched}`);

  /* Required document furniture */
  if (!/<html[^>]+lang="[^"]+"/i.test(html)) fail('html', `${page} — <html> is missing a lang attribute`);
  if (!/<title>[^<]+<\/title>/i.test(html)) fail('html', `${page} — missing a <title>`);
  if (!/name="viewport"/i.test(html)) fail('html', `${page} — missing the viewport meta tag`);
  if (/on(click|load|error|mouseover)="/i.test(html)) fail('html', `${page} — inline event handler (blocked by the site CSP)`);
  if (/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?\S[\s\S]*?<\/script>/i.test(html)) {
    fail('html', `${page} — inline <script> block (blocked by the site CSP)`);
  }

  /* Ids must be unique per document */
  const ids = new Map();
  const idRe = /\sid="([^"]+)"/g;
  let im;
  while ((im = idRe.exec(html))) {
    ids.set(im[1], (ids.get(im[1]) || 0) + 1);
  }
  for (const [id, count] of ids) {
    if (count > 1) fail('html', `${page} — duplicate id "${id}" (${count}×)`);
  }

  /* Images need alt text */
  const imgRe = /<img\b([^>]*)>/gi;
  let bm;
  while ((bm = imgRe.exec(html))) {
    const attrs = parseAttrs(bm[1]);
    if (!('alt' in attrs)) fail('html', `${page} — <img src="${attrs.src || '?'}"> has no alt attribute`);
  }

  /* Local links and asset references must resolve on disk */
  const linkRe = /<(a|link)\b([^>]*)>/gi;
  let lm;
  while ((lm = linkRe.exec(html))) {
    const tag = lm[1].toLowerCase();
    const attrs = parseAttrs(lm[2]);
    const href = attrs.href;
    if (!href) continue;
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(href)) continue;
    if (href === '#') {
      warn('links', `${page} — placeholder link href="#" (${tag})`);
      continue;
    }
    const [target, hash] = href.split('#');
    if (target) {
      const resolved = path.resolve(dir, target);
      if (!fs.existsSync(resolved)) fail('links', `${page} — ${href} does not exist`);
      continue; // cross-file fragments are checked from the target page itself
    }
    // Same-document fragment: the id has to be on this page.
    if (hash && !ids.has(hash)) fail('links', `${page} — #${hash} has no matching element`);
  }

  const srcRe = /<(img|script|source)\b([^>]*)>/gi;
  let sm;
  while ((sm = srcRe.exec(html))) {
    const tag = sm[1].toLowerCase();
    const attrs = parseAttrs(sm[2]);
    const src = attrs.src;
    if (!src || /^(https?:|data:|\/\/)/i.test(src)) continue;
    const resolved = path.resolve(dir, src);
    if (!fs.existsSync(resolved)) fail('links', `${page} — <${tag}> src="${src}" does not exist`);
  }

  for (const name of collectInlineCustomProps(html).consumed) {
    inlineUsed.add(name);
  }
}

/* -------------------------------------------------------------------- CSS */
const cssSource = CSS_FILES.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

for (const file of CSS_FILES) {
  const src = fs.readFileSync(file, 'utf8');
  const open = (src.match(/{/g) || []).length;
  const close = (src.match(/}/g) || []).length;
  if (open !== close) fail('css', `${rel(file)} — unbalanced braces (${open} open, ${close} close)`);
  if (/@import\b/i.test(src)) fail('css', `${rel(file)} — @import is blocked by the site CSP; use a <link> instead`);
}

/* Every custom property used must be declared somewhere (CSS or inline) */
const declared = new Set();
const declareRe = /(--[\w-]+)\s*:/g;
let dm;
while ((dm = declareRe.exec(cssSource))) declared.add(dm[1]);
for (const file of HTML_FILES) {
  for (const name of collectInlineCustomProps(fs.readFileSync(file, 'utf8')).declared) declared.add(name);
}

const used = new Set();
const useRe = /var\(\s*(--[\w-]+)/g;
let um;
while ((um = useRe.exec(cssSource))) used.add(um[1]);
for (const name of inlineUsed) used.add(name);
for (const name of used) {
  if (!declared.has(name)) fail('css', `var(${name}) is used but never declared`);
}

/* ----------------------------------------------------------------- assets */
for (const file of ALL_FILES) {
  if (!BINARY_EXT.test(file)) continue;
  const size = fs.statSync(file).size;
  if (size > MAX_ASSET_BYTES) {
    fail('assets', `${rel(file)} is ${(size / 1024 / 1024).toFixed(1)} MB — over the ${MAX_ASSET_BYTES / 1024 / 1024} MB budget`);
  }
}

/* ----------------------------------------------------------------- report */
const binaryBytes = ALL_FILES.filter((f) => BINARY_EXT.test(f))
  .reduce((sum, f) => sum + fs.statSync(f).size, 0);

console.log(`Checked ${HTML_FILES.length} page(s), ${CSS_FILES.length} stylesheet(s), ${JS_FILES.length} script(s).`);
console.log(`Binary payload: ${(binaryBytes / 1024).toFixed(0)} KB.`);
for (const w of warnings) console.log(`WARN  ${w}`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s) found:`);
  for (const f of failures) console.error(`FAIL  ${f}`);
  process.exit(1);
}
console.log('\nAll site checks passed.');
