// Shared test helpers.
//
// The whole app is one static index.html whose inline <script> blocks build
// every DOM node and expose the logic as globals. The canonical deploy check
// (see .deploy.yml, run by scripts/deploy.sh) evaluates `render_asserts`
// against a jsdom render, so the tests here use the same jsdom model: no
// layout engine, assertions on DOM structure / attributes / data only.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const INDEX_HTML = join(ROOT, 'index.html');
export const APP_URL = 'https://twwlordpicker.test/';

const HTML = readFileSync(INDEX_HTML, 'utf8');

export function indexSource() {
  return readFileSync(INDEX_HTML, 'utf8');
}

// Render index.html in a fresh jsdom window. `hash` seeds the URL fragment
// (the app restores filters from it) and `storage` seeds localStorage.
export function startApp({ url = APP_URL, hash = '', storage = {} } = {}) {
  // jsdom cannot parse modern CSS (`:has()`, nested media rules) and dumps the
  // whole stylesheet to stderr when it gives up. That is expected noise for a
  // layout-engine-free run, so drop only those diagnostics and surface anything
  // else the page reports.
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => {
    if (/Could not parse CSS stylesheet/i.test(error.message)) return;
    console.error('[jsdom]', error.message);
  });
  const dom = new JSDOM(HTML, {
    url: url + hash,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      // jsdom has no matchMedia; the radar tooltip code guards on typeof but
      // providing it exercises the non-touch path.
      if (typeof window.matchMedia !== 'function') {
        window.matchMedia = (query) => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {},
          dispatchEvent() { return false; },
        });
      }
      // jsdom has no layout, so scrollIntoView is a no-op. quizView schedules
      // one inside requestAnimationFrame.
      if (window.Element && !window.Element.prototype.scrollIntoView) {
        window.Element.prototype.scrollIntoView = function () {};
      }
      for (const [key, value] of Object.entries(storage)) {
        try {
          window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch { /* ignore quota / privacy errors */ }
      }
    },
  });
  return dom;
}

// Evaluate code inside the page realm. Top-level `const`/`let` bindings
// (LORDS, state, QUIZ_AXES, LOCS, ...) are lexical globals, not properties of
// window, so they are reachable through eval but not as window.LORDS.
export function inPage(window, code) {
  return window.eval(code);
}

export function filteredCount(window) {
  return inPage(window, 'filtered().length');
}

export function lordByName(window, name) {
  return inPage(window, `LORDS.find(l => l.n === ${JSON.stringify(name)})`);
}

export function resetState(window) {
  inPage(window, `(() => {
    state.q = '';
    state.race.clear(); state.loc.clear(); state.own.clear(); state.eg.clear();
    state.psInc.clear(); state.played.clear(); state.open.clear();
    state.cmp = [];
    state.psAll = false; state.diff = ''; state.hidePlayed = false; state.sort = 'race';
  })()`);
}

// Drive the real "Help me choose" quiz and return the rendered picks.
export function quiz(window, { exp, pace, battle, micro, loc = '', ownedOnly = false }) {
  inPage(window, `(() => {
    const set = (n, v) => {
      const group = [...document.querySelectorAll('input[name=q-' + n + ']')];
      const el = group.find(x => x.value === v);
      if (!el) throw new Error('missing radio q-' + n + '=' + v);
      group.forEach(x => { x.checked = false; });
      el.checked = true;
    };
    set('exp', ${JSON.stringify(exp)});
    set('pace', ${JSON.stringify(pace)});
    set('battle', ${JSON.stringify(battle)});
    set('micro', ${JSON.stringify(micro)});
    const locEl = document.getElementById('quiz-loc'); if (locEl) locEl.value = ${JSON.stringify(loc)};
    const ownEl = document.getElementById('quiz-owned'); if (ownEl) ownEl.checked = ${ownedOnly};
    runQuiz();
  })()`);
  return [...window.document.querySelectorAll('#quiz-results .quiz-card')].map((card) => ({
    name: card.querySelector('.qc-name').textContent.trim(),
    why: card.querySelector('.qc-why').textContent.trim(),
  }));
}
