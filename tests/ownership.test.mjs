// Ownership implication.
//
// The sound rule: you cannot play an expansion without its base game, so
// owning ANY product must imply owning its base game (Warhammer I/II/III).
// The owned set is closed under that rule at every entry point, so a DLC
// owner also sees the base-game lords, and a shared #own= link can carry a
// lone expansion id and still behave correctly.
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, inPage, filteredCount, resetState, quiz, lordByName } from './helpers.mjs';

let window;
before(() => { window = startApp().window; });
beforeEach(() => resetState(window));

// Array.from bridges the jsdom realm's Array to a Node array so strict
// deepEqual compares values, not realm prototypes.
const owned = () => Array.from(inPage(window, '[...state.own].sort()'));

test('every product key resolves to a real base game', () => {
  const bad = inPage(window, `(() => {
    const bases = ['wh1', 'wh2', 'wh3'];
    return Object.keys(OWN_LABEL).filter((k) => !bases.includes(OWN_BASE(k)));
  })()`);
  assert.equal(Array.from(bad).length, 0, `products with no base game: ${Array.from(bad).join(', ')}`);
});

test('every lord source resolves without the silent wh3 fallback', () => {
  const unresolved = inPage(window, `LORDS.filter((l) => !(OWN_SRC[l.src] || OWN_OVERRIDE[l.n])).map((l) => l.n + ' <- ' + l.src)`);
  assert.equal(Array.from(unresolved).length, 0, `sources silently defaulted to wh3:\n${Array.from(unresolved).join('\n')}`);
});

test('owning an expansion implies its base game', () => {
  for (const [dlc, base] of [['wh3_coc', 'wh3'], ['wh2_tk', 'wh2'], ['wh1_chaos', 'wh1']]) {
    inPage(window, `state.own.clear(); ownAdd(state.own, '${dlc}')`);
    assert.deepEqual(owned(), [base, dlc].sort(), `${dlc} should imply ${base}`);
  }
});

test('a base game does not imply the other base games', () => {
  inPage(window, "state.own.clear(); ownAdd(state.own, 'wh1')");
  assert.deepEqual(owned(), ['wh1']);
});

test('unchecking a base game removes its expansions', () => {
  inPage(window, "state.own.clear(); ['wh3', 'wh3_coc', 'wh3_eot', 'wh1'].forEach(k => ownAdd(state.own, k))");
  inPage(window, "ownRemove(state.own, 'wh3')");
  assert.deepEqual(owned(), ['wh1'], 'only the unrelated base game should remain');
});

test('unchecking one expansion keeps the base game', () => {
  inPage(window, "state.own.clear(); ownAdd(state.own, 'wh2'); ownAdd(state.own, 'wh2_tk'); ownRemove(state.own, 'wh2_tk')");
  assert.deepEqual(owned(), ['wh2']);
});

test('a DLC owner sees the base-game lords too', () => {
  inPage(window, "ownAdd(state.own, 'wh3_coc')");
  assert.equal(
    filteredCount(window),
    inPage(window, "LORDS.filter(l => l.own === 'wh3' || l.own === 'wh3_coc').length"),
  );
  assert.ok(filteredCount(window) > 4, 'more than just the four Champions of Chaos lords');
});

test('the checkbox path closes the set and ticks the implied base game', () => {
  const checkbox = (k) => window.document.querySelector(`input[data-own="${k}"]`);
  checkbox('wh3_coc').checked = true;
  checkbox('wh3_coc').dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.deepEqual(owned(), ['wh3', 'wh3_coc']);
  assert.equal(checkbox('wh3').checked, true, 'the base game checkbox should reflect the implication');

  checkbox('wh3').checked = false;
  checkbox('wh3').dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.deepEqual(owned(), [], 'unchecking the base game drops its expansion too');
});

test('a shared #own link is closed on load and round-trips', () => {
  const { window: shared } = startApp({ hash: '#own=wh2_tk' });
  assert.deepEqual([...inPage(shared, 'state.own')].sort(), ['wh2', 'wh2_tk']);
  assert.equal(
    inPage(shared, 'filtered().length'),
    inPage(shared, "LORDS.filter(l => l.own === 'wh2' || l.own === 'wh2_tk').length"),
  );
  inPage(shared, 'pushState()');
  const hash = shared.location.hash;
  assert.match(hash, /wh2_tk/);
  assert.match(hash, /wh2(,|$)/, 'pushState should persist the implied base game');
});

test('a saved library is closed on load', () => {
  const { window: returning } = startApp({ storage: { 'twwlp.own.v1': ['wh1_beastmen'] } });
  assert.deepEqual([...inPage(returning, 'state.own')].sort(), ['wh1', 'wh1_beastmen']);
});

test('a shared link still never overwrites the saved library', () => {
  const { window: visitor } = startApp({ hash: '#own=wh3_coc', storage: { 'twwlp.own.v1': ['wh1'] } });
  assert.deepEqual([...inPage(visitor, 'state.own')].sort(), ['wh3', 'wh3_coc']);
  assert.deepEqual(JSON.parse(visitor.localStorage.getItem('twwlp.own.v1')), ['wh1']);
});

test('the ownership presets are closed and distinct', () => {
  inPage(window, "document.querySelector('[data-own-all=base]').click()");
  assert.deepEqual(owned(), ['wh1', 'wh2', 'wh3']);
  inPage(window, "document.querySelector('[data-own-all=wh3]').click()");
  assert.deepEqual(owned(), ['wh3']);
  inPage(window, "document.querySelector('[data-own-all=clear]').click()");
  assert.deepEqual(owned(), []);
  assert.equal(filteredCount(window), 110);
});

test('the active-filter pill removes one product without cascading', () => {
  inPage(window, "ownAdd(state.own, 'wh3'); ownAdd(state.own, 'wh3_coc'); renderActiveFilters()");
  const pill = inPage(window, `(() => {
    const x = [...document.querySelectorAll('[data-clear=own][data-own]')].find(p => p.dataset.own === 'wh3_coc');
    return x ? (x.click(), true) : false;
  })()`);
  assert.equal(pill, true, 'expected an active-filter pill for the expansion');
  assert.deepEqual(owned(), ['wh3']);
});

test('the quiz honours implied base games when restricted to owned content', () => {
  inPage(window, "ownAdd(state.own, 'wh3_coc')");
  const picks = quiz(window, { exp: 'some', pace: 'war', battle: 'none', micro: 'some', ownedOnly: true });
  assert.ok(picks.length > 0);
  for (const pick of picks) {
    const lord = lordByName(window, pick.name);
    assert.ok(['wh3', 'wh3_coc'].includes(lord.own), `${lord.n} (${lord.own}) is outside owned content`);
  }
});
