// "Help me choose" scoring.
//
// Regression under test: with Veteran / Build & defend / No preference /
// Give me the buttons, the quiz used to surface Drycha (Monsters + Strike,
// an aggressive campaign) at #3. She matched none of the requested campaign
// feel; she won an alphabetical tie-break among eight equally-scored partial
// matches. Scoring is now weighted by answer group, so a lord that ignores
// the requested campaign pace cannot rank on a peripheral axis.
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, quiz, resetState, inPage, lordByName } from './helpers.mjs';

let window;
before(() => { window = startApp().window; });
beforeEach(() => resetState(window));

const REPORTED = { exp: 'vet', pace: 'build', battle: 'none', micro: 'high' };

test('reported case: build & defend + high micro no longer returns Drycha', () => {
  const picks = quiz(window, REPORTED);
  assert.equal(picks.length, 3);
  assert.ok(!picks.some((p) => p.name.includes('Drycha')), `Drycha should not be a top pick: ${picks.map((p) => p.name).join(', ')}`);
  assert.equal(picks[0].name, 'Miao Ying, the Storm Dragon');
});

test('reported case: every top pick matches the requested campaign feel', () => {
  const picks = quiz(window, REPORTED);
  for (const pick of picks) {
    assert.match(pick.why, /campaign feel:/, `pick "${pick.name}" ignored the campaign-feel answer: ${pick.why}`);
  }
  // At least one pick should also surface the micro answer, since it is a
  // real (lower-weight) signal.
  assert.ok(picks.some((p) => /micro:/.test(p.why)), 'expected a pick to reflect the micro answer');
});

test('a peripheral-only match cannot outrank the requested pace', () => {
  const picks = quiz(window, REPORTED);
  const top = lordByName(window, picks[0].name);
  // Miao Ying is the Builder + Defense lord; the answer asked for build & defend.
  assert.ok(top.ps.includes('Builder') && top.ps.includes('Defense'));
});

test('results are deterministic for identical answers', () => {
  const first = quiz(window, REPORTED).map((p) => p.name);
  const second = quiz(window, REPORTED).map((p) => p.name);
  assert.deepEqual(second, first);
});

test('aggressive beginners get aggressive, forgiving lords', () => {
  const picks = quiz(window, { exp: 'new', pace: 'war', battle: 'melee', micro: 'low' });
  assert.equal(picks.length, 3);
  const top = lordByName(window, picks[0].name);
  assert.ok(top.ps.includes('Aggro'), `${top.n} should be an aggro lord`);
  assert.ok(top.d <= 2, `${top.n} should be an easy first campaign`);
});

test('horde answers return horde lords', () => {
  const picks = quiz(window, { exp: 'some', pace: 'horde', battle: 'none', micro: 'some' });
  const top = lordByName(window, picks[0].name);
  assert.ok(top.ps.includes('Horde'), `${top.n} should be a horde lord`);
});

test('schemes + magic answers return campaign-layer casters', () => {
  const picks = quiz(window, { exp: 'vet', pace: 'schemes', battle: 'magic', micro: 'high' });
  const top = lordByName(window, picks[0].name);
  assert.ok(top.ps.includes('Politics') || top.ps.includes('Schemes'), `${top.n} should be a politics/schemes lord`);
});

test('a chosen start region is honoured', () => {
  const picks = quiz(window, { exp: 'some', pace: 'war', battle: 'none', micro: 'some', loc: 'naggaroth' });
  const top = lordByName(window, picks[0].name);
  assert.equal(top.loc, 'naggaroth');
  assert.match(picks[0].why, /starts in/);
});

test('only-content-I-own restricts picks to the saved library', () => {
  inPage(window, "state.own = new Set(['wh3'])");
  const picks = quiz(window, { ...REPORTED, ownedOnly: true });
  assert.equal(picks.length, 3);
  for (const pick of picks) {
    const lord = lordByName(window, pick.name);
    assert.equal(lord.own, 'wh3', `${lord.n} is outside the owned library`);
    assert.match(pick.why, /you own it/);
  }
});

test('owned-only with an empty match reports the empty state', () => {
  inPage(window, "state.own = new Set(['__no_such_product__'])");
  const picks = quiz(window, { ...REPORTED, ownedOnly: true });
  assert.equal(picks.length, 0);
  assert.match(window.document.getElementById('quiz-results').textContent, /No lords match/);
});

test('openQuiz reports whether ownership is in play', () => {
  inPage(window, "state.own = new Set(['wh3'])");
  inPage(window, 'openQuiz()');
  assert.match(window.document.getElementById('quiz-ownhint').textContent, /Own tab/);
  inPage(window, 'closeQuiz()');
  resetState(window);
  inPage(window, 'openQuiz()');
  assert.match(window.document.getElementById('quiz-ownhint').textContent, /ignored/);
  inPage(window, 'closeQuiz()');
});

test('picking a suggestion clears filters, sets the search and closes the quiz', () => {
  inPage(window, "state.race.add('Khorne'); state.diff = '4'");
  const picks = quiz(window, REPORTED);
  const button = window.document.querySelector('#quiz-results [data-quiz-view]');
  assert.ok(button, 'a suggestion must render a Show button');
  button.click();
  assert.equal(inPage(window, 'state.race.size'), 0, 'race filter should be cleared');
  assert.equal(inPage(window, 'state.diff'), '', 'difficulty filter should be cleared');
  assert.equal(inPage(window, 'state.q'), picks[0].name.split(',')[0].toLowerCase());
  const results = inPage(window, 'filtered().map(l => l.n)');
  // Searching a lord's short name can legitimately surface a second lord whose
  // write-up mentions them (e.g. "Miao Ying" appears in Zhao Ming's text), so
  // assert the pick is present rather than that it is alone.
  assert.ok(results.includes(picks[0].name), `expected ${picks[0].name} among ${results.join(', ')}`);
  assert.equal(window.document.getElementById('quiz').classList.contains('show'), false);
});
