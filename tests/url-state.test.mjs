// URL state hygiene: every value in a shared link is validated, and the
// search / playstyle-toggle round-trip exactly.
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, inPage, filteredCount, resetState } from './helpers.mjs';

let window;
before(() => { window = startApp().window; });
beforeEach(() => resetState(window));

test('a search in a shared link is normalised to match the input handler', () => {
  const { window: shared } = startApp({ hash: '#q=Khorne' });
  assert.equal(inPage(shared, 'state.q'), 'khorne');
  assert.equal(shared.document.getElementById('q').value, 'khorne', 'the search box must show the loaded query');
  assert.ok(inPage(shared, 'filtered().length') > 0, 'the search must not silently match nothing');
});

test('pressing Enter normalises the search like typing does', () => {
  const q = window.document.getElementById('q');
  q.value = 'Khorne';
  q.dispatchEvent(new window.Event('input', { bubbles: true }));
  q.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(inPage(window, 'state.q'), 'khorne');
});

test('the playstyle AND mode round-trips through the URL', () => {
  inPage(window, "state.psInc = new Set(['Aggro','Duelist']); state.psAll = true; pushState()");
  assert.match(window.location.hash, /psall=1/);
  const { window: reopened } = startApp({ hash: window.location.hash });
  assert.equal(inPage(reopened, 'state.psAll'), true);
  assert.equal(
    inPage(reopened, 'filtered().length'),
    inPage(reopened, "LORDS.filter(l => l.ps.includes('Aggro') && l.ps.includes('Duelist')).length"),
  );
});

test('unknown or malformed hash values are ignored, not trusted', () => {
  const { window: shared } = startApp({ hash: '#race=Atlantis&diff=abc&sort=bogus&cmp=999,1,1,-3&loc=naggaroth' });
  assert.equal(inPage(shared, 'state.race.size'), 0);
  assert.equal(inPage(shared, 'state.diff'), '');
  assert.equal(inPage(shared, 'state.sort'), 'race');
  assert.deepEqual(Array.from(inPage(shared, 'state.cmp')), [1], 'compare indices must be de-duped and range-checked');
  assert.equal(inPage(shared, "state.loc.has('naggaroth')"), true, 'valid values in the same link still load');
});

test('a valid compare set is restored in full', () => {
  const { window: shared } = startApp({ hash: '#cmp=3,7,11' });
  assert.deepEqual(Array.from(inPage(shared, 'state.cmp')), [3, 7, 11]);
});

test('a shareable link does not carry local-only view state', () => {
  inPage(window, "state.played = new Set(['Drycha']); state.hidePlayed = true; pushState()");
  const hash = window.location.hash;
  assert.doesNotMatch(hash, /played/);
  assert.doesNotMatch(hash, /hideplayed/);
});

test('showing a quiz pick clears the ownership filter without touching the saved library', () => {
  inPage(window, "STORE.set('twwlp.own.v1', ['wh2_tk']); _ownPersist = true; state.own = new Set(['wh2_tk'])");
  const picks = inPage(window, `(() => {
    const set = (n, v) => { [...document.querySelectorAll('input[name=q-' + n + ']')].find(x => x.value === v).checked = true; };
    set('exp', 'some'); set('pace', 'build'); set('battle', 'none'); set('micro', 'some');
    document.getElementById('quiz-owned').checked = false;
    document.getElementById('quiz-go').click();
    return [...document.querySelectorAll('#quiz-results .quiz-card .qc-name')].map(n => n.textContent.trim());
  })()`);
  const pick = picks[0];
  inPage(window, `quizView(LORDS.findIndex(l => l.n === ${JSON.stringify(pick)}))`);
  assert.equal(inPage(window, 'state.own.size'), 0, 'the ownership filter should be cleared for the jump');
  assert.ok(Array.from(inPage(window, 'filtered().map(l => l.n)')).includes(pick), `the pick ${pick} must be visible`);
  assert.deepEqual(JSON.parse(window.localStorage.getItem('twwlp.own.v1')), ['wh2_tk'], 'the saved library must survive');
});
