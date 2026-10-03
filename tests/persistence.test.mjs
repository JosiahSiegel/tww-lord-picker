// URL-hash and localStorage state.
//
// Two contracts matter here:
//   1. A shared link (#race=..., #own=...) restores exactly the state it
//      encodes, and the hash round-trips through pushState.
//   2. Personal state (owned library, played marks) survives a plain reload,
//      but opening someone else's shared link must NOT overwrite the
//      visitor's saved library.
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, inPage, filteredCount, resetState } from './helpers.mjs';

let window;
before(() => { window = startApp().window; });
beforeEach(() => resetState(window));

test('a shared hash restores its filters', () => {
  const { window: shared } = startApp({ hash: '#race=Khorne&loc=naggaroth&diff=2' });
  assert.equal(inPage(shared, "state.race.has('Khorne')"), true);
  assert.equal(inPage(shared, "state.loc.has('naggaroth')"), true);
  assert.equal(inPage(shared, 'state.diff'), '2');
  assert.equal(
    inPage(shared, 'filtered().length'),
    inPage(shared, "LORDS.filter(l => l.r === 'Khorne' && l.loc === 'naggaroth' && l.d === 2).length"),
  );
});

test('unknown hash values are dropped rather than trusted', () => {
  const { window: shared } = startApp({ hash: '#loc=atlantis&own=not_a_product&race=Khorne' });
  assert.equal(inPage(shared, 'state.loc.size'), 0);
  assert.equal(inPage(shared, 'state.own.size'), 0);
  assert.equal(inPage(shared, "state.race.has('Khorne')"), true);
});

test('pushState round-trips the shareable filters', () => {
  inPage(window, `(() => {
    state.q = 'khorne';
    state.race.add('Khorne');
    state.loc.add('naggaroth');
    state.own.add('wh3');
    state.eg.add(ENDGAMES[0].n);
    state.diff = '4';
    state.sort = 'name';
    state.psInc.add('Aggro');
    state.cmp = [1, 2, 3];
    pushState();
  })()`);
  const hash = window.location.hash;
  const { window: reopened } = startApp({ hash });
  assert.equal(inPage(reopened, 'state.q'), 'khorne');
  assert.equal(inPage(reopened, "state.race.has('Khorne')"), true);
  assert.equal(inPage(reopened, "state.loc.has('naggaroth')"), true);
  assert.equal(inPage(reopened, "state.own.has('wh3')"), true);
  assert.equal(inPage(reopened, `state.eg.has(ENDGAMES[0].n)`), true);
  assert.equal(inPage(reopened, 'state.diff'), '4');
  assert.equal(inPage(reopened, 'state.sort'), 'name');
  assert.equal(inPage(reopened, "state.psInc.has('Aggro')"), true);
  assert.deepEqual(Array.from(inPage(reopened, 'state.cmp')), [1, 2, 3]);
});

test('a plain reload restores the saved library', () => {
  const { window: returning } = startApp({ storage: { 'twwlp.own.v1': ['wh3'] } });
  assert.equal(inPage(returning, "state.own.has('wh3')"), true);
  assert.equal(
    inPage(returning, 'filtered().length'),
    inPage(returning, "LORDS.filter(l => ownsLord(l, new Set(['wh3']))).length"),
  );
});

test('played marks and the hide-played toggle survive a reload', () => {
  const { window: returning } = startApp({
    storage: {
      'twwlp.played.v1': ['Skarbrand the Exiled'],
      'twwlp.hidePlayed.v1': true,
    },
  });
  assert.equal(inPage(returning, "state.played.has('Skarbrand the Exiled')"), true);
  assert.equal(inPage(returning, 'state.hidePlayed'), true);
  assert.equal(inPage(returning, "filtered().some(l => l.n === 'Skarbrand the Exiled')"), false);
});

test('the hide-played toggle is remembered without editing ownership', () => {
  // Drive the real control: switch "Hide played" on, without ever touching
  // the owned-content library (so _ownPersist stays false).
  inPage(window, `(() => {
    const el = document.getElementById('hideplayed');
    el.checked = true;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  assert.equal(inPage(window, 'state.hidePlayed'), true);
  assert.equal(JSON.parse(window.localStorage.getItem('twwlp.hidePlayed.v1')), true);
  // ...and it comes back on the next visit.
  const { window: returning } = startApp({ storage: { 'twwlp.hidePlayed.v1': true } });
  assert.equal(inPage(returning, 'state.hidePlayed'), true);
});

test('marking played updates the card in place instead of rebuilding the grid', () => {
  // Re-rendering the whole grid on every tick replayed the card entrance
  // animation across all 110 cards - the "flash" the user reported. Tag the
  // node, toggle the real checkbox, and prove it survived (no render).
  inPage(window, 'state.hidePlayed = false; _afterFilterChange()');
  inPage(window, `(() => {
    document.querySelector('.card')._probe = 'kept';
    document.querySelector('.card .played-toggle input').click();
  })()`);
  assert.equal(inPage(window, "document.querySelector('.card')._probe === 'kept'"), true, 'the card node was not replaced');
  assert.equal(inPage(window, "document.querySelector('.card').classList.contains('played')"), true);
  assert.equal(inPage(window, "document.querySelector('.card .played-label').textContent.trim()"), '✓ Played');
  assert.equal(inPage(window, "document.getElementById('playedcount').textContent"), '1 marked');
  assert.equal(JSON.parse(window.localStorage.getItem('twwlp.played.v1')).length, 1);
  assert.equal(inPage(window, "document.querySelectorAll('.card-entering').length"), 0, 'no entrance animation on an update');
});

test('marking played while Hide played is on removes just that lord', () => {
  inPage(window, 'state.hidePlayed = true; _afterFilterChange()');
  const name = inPage(window, "document.querySelector('.card .played-toggle input').dataset.played");
  inPage(window, "document.querySelector('.card .played-toggle input').click()");
  assert.equal(inPage(window, `filtered().some(l => l.n === ${JSON.stringify(name)})`), false);
  assert.equal(
    inPage(window, `[...document.querySelectorAll('.card .played-toggle input')].some(i => i.dataset.played === ${JSON.stringify(name)})`),
    false,
    'the hidden lord leaves the DOM',
  );
  assert.equal(inPage(window, "document.querySelectorAll('.card-entering').length"), 0);
  assert.equal(inPage(window, "document.getElementById('playedcount').textContent"), '1 marked');
});

test('cards animate in only on the first render', () => {
  const { window: fresh } = startApp();
  assert.equal(inPage(fresh, "document.querySelectorAll('.card-entering').length"), 110);
  inPage(fresh, "state.race.add('Khorne'); _afterFilterChange()");
  assert.equal(inPage(fresh, "document.querySelectorAll('.card-entering').length"), 0, 're-renders do not replay the entrance animation');
  assert.ok(inPage(fresh, "document.querySelectorAll('.card').length") > 0);
});

test("a shared link does not overwrite the visitor's saved library", () => {
  const { window: visitor } = startApp({
    hash: '#own=wh3',
    storage: { 'twwlp.own.v1': ['wh1'] },
  });
  // The link wins for the current view...
  assert.equal(inPage(visitor, 'state.own.size'), 1);
  assert.equal(inPage(visitor, "state.own.has('wh3')"), true);
  // ...but the saved library is untouched (ownership persists only after an edit).
  assert.deepEqual(JSON.parse(visitor.localStorage.getItem('twwlp.own.v1')), ['wh1']);
});

test('editing ownership persists it for next time', () => {
  inPage(window, "_ownPersist = true; state.own.add('wh1'); pushState()");
  assert.deepEqual(JSON.parse(window.localStorage.getItem('twwlp.own.v1')), ['wh1']);
  assert.equal(filteredCount(window), inPage(window, "LORDS.filter(l => ownsLord(l, new Set(['wh1']))).length"));
});
