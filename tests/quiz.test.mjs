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
  assert.equal(picks.length, 5);
  assert.ok(!picks.some((p) => p.name.includes('Drycha')), `Drycha should not be a top pick: ${picks.map((p) => p.name).join(', ')}`);
  assert.equal(picks[0].name, 'Miao Ying, the Storm Dragon');
});

test('reported case: every top pick matches the requested campaign feel', () => {
  const picks = quiz(window, REPORTED);
  for (const pick of picks) {
    assert.match(pick.why, /campaign feel:/, `pick "${pick.name}" ignored the campaign-feel answer: ${pick.why}`);
  }
  // The micromanagement answer is a real signal: "give me the buttons"
  // rewards lords with campaign systems, and the reason says so.
  assert.ok(
    picks.some((p) => /campaign systems/.test(p.why)),
    'expected a pick to reflect the micromanagement answer',
  );
});

test('a peripheral-only match cannot outrank the requested pace', () => {
  const picks = quiz(window, REPORTED);
  const top = lordByName(window, picks[0].name);
  // Miao Ying is the Builder + Defense lord; the answer asked for build & defend.
  assert.ok(top.ps.includes('Builder') && top.ps.includes('Defense'));
});

test('the army answer is never double-counted by micromanagement', () => {
  // Regression: micro used to map to ['Schemes','Magic'], so "spells & magic"
  // scored Magic a second time. Magic is a battle axis, not a campaign system.
  assert.equal(inPage(window, "QUIZ_SYSTEMS.includes('Magic')"), false);
  assert.equal(inPage(window, "('micro' in QUIZ_AXES)"), false);
});

test('micromanagement shifts the ranking instead of duplicating an answer', () => {
  // "Give me the buttons" should surface systems-heavy lords that "keep it
  // simple" would not.
  const high = quiz(window, { exp: 'vet', pace: 'war', battle: 'magic', micro: 'high' }).map((p) => p.name);
  const low = quiz(window, { exp: 'vet', pace: 'war', battle: 'magic', micro: 'low' }).map((p) => p.name);
  assert.ok(high.includes('Mother Ostankya'), `systems-heavy caster missing: ${high.join(', ')}`);
  assert.ok(!low.includes('Mother Ostankya'), 'low micromanagement should not favour a systems-heavy lord');
});

test('war + magic: the exact matches are stable, the third pick responds', () => {
  const thirds = new Set();
  for (const exp of ['new', 'some', 'vet']) {
    for (const micro of ['low', 'some', 'high']) {
      const picks = quiz(window, { exp, pace: 'war', battle: 'magic', micro });
      // Azhag and Wurrzag are the only two lords tagged both Aggro and Magic,
      // so they are the correct top two for this pairing.
      assert.equal(picks[0].name, 'Azhag the Slaughterer');
      assert.equal(picks[1].name, 'Wurrzag');
      thirds.add(picks[2].name);
    }
  }
  assert.ok(thirds.size >= 3, `the third pick should vary with the answers: ${[...thirds].join(', ')}`);
});

test('results are deterministic for identical answers', () => {
  const first = quiz(window, REPORTED).map((p) => p.name);
  const second = quiz(window, REPORTED).map((p) => p.name);
  assert.deepEqual(second, first);
});

test('aggressive beginners get aggressive, forgiving lords', () => {
  const picks = quiz(window, { exp: 'new', pace: 'war', battle: 'melee', micro: 'low' });
  assert.equal(picks.length, 5);
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
  assert.equal(picks.length, 5);
  for (const pick of picks) {
    const granted = inPage(window, `ownsLord(LORDS.find(l => l.n === ${JSON.stringify(pick.name)}), new Set(['wh3']))`);
    assert.equal(granted, true, `${pick.name} is outside the owned library`);
    // Owned lords say "you own it"; the universally free Bretonnia lords say so.
    assert.match(pick.why, lordByName(window, pick.name).free ? /free for everyone/ : /you own it/);
  }
});

test('owned-only labels owned and free picks correctly', () => {
  inPage(window, "state.own = new Set(['wh2_tk'])");
  const picks = quiz(window, { exp: 'some', pace: 'war', battle: 'none', micro: 'some', ownedOnly: true });
  assert.ok(picks.length >= 2);
  for (const pick of picks) {
    const free = lordByName(window, pick.name).free;
    assert.match(pick.why, free ? /free for everyone/ : /you own it/, `${pick.name}: ${pick.why}`);
  }
  assert.ok(picks.some((p) => /free for everyone/.test(p.why)), 'expected a free Bretonnia lord among the picks');
  assert.ok(picks.some((p) => /you own it/.test(p.why)), 'expected an owned lord among the picks');
});

test('owned-only never hides the universally free Bretonnia lords', () => {
  // Bretonnia is free for everyone, so even a library that matches nothing
  // still leaves the four Bretonnia lords available.
  inPage(window, "state.own = new Set(['__no_such_product__'])");
  const picks = quiz(window, { ...REPORTED, ownedOnly: true });
  assert.equal(picks.length, 4, 'only the four free Bretonnia lords remain');
  for (const pick of picks) {
    assert.equal(lordByName(window, pick.name).free, true, `${pick.name} should be a free Bretonnia lord`);
  }
});

test('every playstyle can be requested by some answer', () => {
  const missing = inPage(window, `(() => {
    const req = new Set();
    Object.values(QUIZ_AXES).forEach((g) => Object.values(g).forEach((a) => a.forEach((x) => req.add(x))));
    QUIZ_SYSTEMS.forEach((x) => req.add(x));
    return Object.keys(PS).filter((ax) => !req.has(ax));
  })()`);
  assert.equal(Array.from(missing).length, 0, `no answer can request: ${Array.from(missing).join(', ')}`);
});

test('every lord is reachable within the five shown picks', () => {
  // Exercises the app's own quizRank across the full answer space, so this
  // stays true if the weights or the mappings change.
  const missing = inPage(window, `(() => {
    const LOCS = ['', 'oldworld', 'northwastes', 'naggaroth', 'ulthuan', 'lustria', 'badlands', 'darklands', 'fareast', 'southwastes'];
    const best = {}; LORDS.forEach((l) => { best[l.n] = Infinity; });
    for (const exp of ['new', 'some', 'vet'])
      for (const pace of ['war', 'build', 'schemes', 'horde'])
        for (const battle of ['melee', 'magic', 'none'])
          for (const micro of ['low', 'some', 'high'])
            for (const flavour of ['none', 'raid', 'strike', 'weird', 'quest', 'craft'])
              for (const loc of LOCS) {
                quizRank({ exp, pace, battle, micro, flavour, loc, ownedOnly: false })
                  .forEach((x, i) => { if (i + 1 < best[x.l.n]) best[x.l.n] = i + 1; });
              }
    return LORDS.map((l) => l.n).filter((n) => best[n] > 5);
  })()`);
  assert.equal(Array.from(missing).length, 0, `lords never reachable in 5 picks: ${Array.from(missing).join(', ')}`);
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

test('the quiz "Only content I own" default follows the Own switch', () => {
  inPage(window, "state.own = new Set(['wh3']); state.ownFilter = true; _afterFilterChange()");
  inPage(window, 'openQuiz()');
  assert.equal(window.document.getElementById('quiz-owned').checked, true);
  assert.match(window.document.getElementById('quiz-ownhint').textContent, /Own tab/);
  inPage(window, 'closeQuiz()');

  inPage(window, "state.ownFilter = false; _afterFilterChange(); openQuiz()");
  assert.equal(window.document.getElementById('quiz-owned').checked, false);
  assert.match(window.document.getElementById('quiz-ownhint').textContent, /filter is off/);
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

// ── "What haven't I played yet?" ─────────────────────────────────────────
// The dice and the quiz both lean on the per-device played marks, so a
// returning player gets a fresh recommendation instead of a lord they have
// already finished.

test('the quiz skips campaigns you have already played', () => {
  const baseline = quiz(window, REPORTED).map((p) => p.name);
  const played = baseline[0];
  inPage(window, `state.played = new Set(${JSON.stringify([played])})`);
  const skipped = quiz(window, REPORTED).map((p) => p.name);
  assert.ok(!skipped.includes(played), `${played} should be skipped once marked played`);
  assert.equal(skipped.length, 5, 'skipping one lord still returns five picks');
  // Unticking "Skip played" restores the full ranking.
  const restored = quiz(window, { ...REPORTED, skipPlayed: false }).map((p) => p.name);
  assert.ok(restored.includes(played), `${played} should return when Skip played is off`);
});

test('Skip played still answers when every lord is marked', () => {
  inPage(window, 'state.played = new Set(LORDS.map((l) => l.n))');
  const picks = quiz(window, REPORTED);
  assert.equal(picks.length, 5, 'the quiz falls back to the full roster rather than showing nothing');
});

test('openQuiz surfaces how many played marks are being skipped', () => {
  inPage(window, "state.played = new Set(['Skarbrand the Exiled', 'Skulltaker'])");
  inPage(window, 'openQuiz()');
  assert.equal(window.document.getElementById('quiz-skip-count').textContent, ' (2)');
  inPage(window, 'closeQuiz()');
});
