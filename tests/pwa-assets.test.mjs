// PWA + social-preview assets: the deploy ships them, so they must exist,
// be well-formed, and agree with each other (manifest icons, precache list,
// OG image dimensions).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, indexSource } from './helpers.mjs';

const html = indexSource();

function pngSize(path) {
  const bytes = readFileSync(path);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  assert.ok(bytes.subarray(0, 4).equals(signature), `${path} is not a PNG`);
  assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR', `${path} has no IHDR`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test('web manifest is valid and self-describing', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  assert.ok(manifest.name && manifest.short_name);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
  for (const icon of manifest.icons) {
    assert.ok(existsSync(join(ROOT, icon.src)), `manifest icon missing on disk: ${icon.src}`);
    const size = Number(icon.sizes.split('x')[0]);
    const actual = pngSize(join(ROOT, icon.src));
    assert.equal(actual.width, size, `${icon.src} declared ${icon.sizes} but is ${actual.width}x${actual.height}`);
    assert.equal(actual.height, size);
  }
});

test('index.html links the manifest and registers the service worker', () => {
  assert.match(html, /<link[^>]+rel="manifest"[^>]+href="manifest\.webmanifest"/);
  assert.match(html, /navigator\.serviceWorker\.register\('sw\.js'\)/);
});

test('service worker precaches only files that exist', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  const list = sw.match(/const PRECACHE\s*=\s*\[([\s\S]*?)\]/);
  assert.ok(list, 'sw.js must declare a PRECACHE list');
  const entries = [...list[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.ok(entries.length >= 5);
  for (const entry of entries) {
    if (entry === './') continue;
    const file = entry.replace(/^\.\//, '');
    assert.ok(existsSync(join(ROOT, file)), `precache entry missing on disk: ${entry}`);
  }
  // The document is deliberately network-first so a redeploy is picked up.
  assert.match(sw, /isDocument/);
});

test('Open Graph image is a 1200x630 PNG', () => {
  const og = pngSize(join(ROOT, 'og.png'));
  assert.deepEqual(og, { width: 1200, height: 630 });
  assert.match(html, /<meta property="og:image" content="https:\/\/twwlordpicker\.com\/og\.png">/);
});

test('social meta tags point at the canonical domain', () => {
  assert.match(html, /<meta property="og:title" content="[^"]+">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/twwlordpicker\.com\/">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
});

test('favicon and theme-colour are declared', () => {
  // The tab icon is inlined as a data URI; favicon.svg ships as the source
  // file for it and must stay in the repo.
  assert.ok(existsSync(join(ROOT, 'favicon.svg')));
  assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="data:image\/svg\+xml,/);
  assert.match(html, /<meta name="theme-color"/);
});
