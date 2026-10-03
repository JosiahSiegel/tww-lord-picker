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
    inPage(returning, "LORDS.filter(l => l.own === 'wh3').length"),
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
  assert.equal(filteredCount(window), inPage(window, "LORDS.filter(l => l.own === 'wh1').length"));
});
