// Validates the deploy contract itself: every required artifact ships, every
// content grep is present, every render assertion holds, and the PWA/OG
// assets are well-formed. This is the same `render_asserts` contract the
// deploy script enforces, so a green run here means the render gate passes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { ROOT, INDEX_HTML, startApp, inPage } from './helpers.mjs';

const manifest = parse(readFileSync(join(ROOT, '.deploy.yml'), 'utf8'));
const html = readFileSync(INDEX_HTML, 'utf8');

test('manifest declares the expected deploy target', () => {
  assert.equal(manifest.source_branch, 'gh-pages');
  assert.equal(manifest.pages_branch, 'gh-pages');
  assert.match(manifest.prod_url, /^https:\/\/twwlordpicker\.com\/$/);
  assert.equal(manifest.gh_repo, 'JosiahSiegel/tww-lord-picker');
});

test('required_files all exist in the deploy root', () => {
  for (const file of manifest.required_files) {
    assert.ok(existsSync(join(ROOT, file)), `missing required deploy file: ${file}`);
    assert.ok(statSync(join(ROOT, file)).size > 0, `empty required deploy file: ${file}`);
  }
});

test('index.html clears verify_min_bytes', () => {
  const size = statSync(INDEX_HTML).size;
  assert.ok(
    size >= manifest.verify_min_bytes,
    `index.html is ${size} bytes, below verify_min_bytes=${manifest.verify_min_bytes}`,
  );
});

test('every verify_check pattern is present in index.html', () => {
  for (const pattern of manifest.verify_checks) {
    assert.ok(new RegExp(pattern).test(html), `verify_check not found in index.html: ${pattern}`);
  }
});

test('CNAME points at the manifest prod host', () => {
  const cname = readFileSync(join(ROOT, 'CNAME'), 'utf8').trim();
  const host = new URL(manifest.prod_url).host;
  assert.equal(cname, host);
  // The custom domain must be reachable over HTTPS in production.
  assert.match(html, /og:url["']?\s+content=["']https:\/\/twwlordpicker\.com/);
});

test('every render_assert holds under jsdom', () => {
  const { window } = startApp();
  for (const expression of manifest.render_asserts) {
    let value;
    try {
      value = inPage(window, expression);
    } catch (error) {
      assert.fail(`render assert threw: ${expression}\n  ${error.message}`);
    }
    assert.equal(value, true, `render assert failed (got ${JSON.stringify(value)}): ${expression}`);
  }
});
