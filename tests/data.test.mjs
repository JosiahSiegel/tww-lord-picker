// Data integrity: the roster and every one of its foreign keys must be
// internally consistent. These are the invariants the UI silently relies on
// (LOCS[l.loc], OWN_LABEL[l.own], PS[p], RACES[l.r]) and the class of bug
// that makes a card render "undefined" or vanish from a filter.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, inPage } from './helpers.mjs';

let window;
before(() => { window = startApp().window; });

test('roster holds exactly 110 lords, indexed in order', () => {
  const { count, badIndex } = inPage(window, `(() => {
    const badIndex = [];
    LORDS.forEach((l, i) => { if (l.i !== i) badIndex.push(l.n); });
    return { count: LORDS.length, badIndex };
  })()`);
  assert.equal(count, 110);
  assert.deepEqual(Array.from(badIndex), []);
});

test('every lord has valid foreign keys and shape', () => {
  const bad = inPage(window, `(() => {
    const problems = [];
    const note = (l, why) => problems.push(l.n + ': ' + why);
    LORDS.forEach((l) => {
      if (!l.n || typeof l.n !== 'string') note(l, 'missing name');
      if (!LOCS[l.loc]) note(l, 'unknown loc ' + l.loc);
      if (!OWN_LABEL[l.own]) note(l, 'unknown own ' + l.own);
      if (!RACES[l.r]) note(l, 'unknown race ' + l.r);
      if (!(l.d >= 1 && l.d <= 4)) note(l, 'difficulty out of range ' + l.d);
      if (!Array.isArray(l.ps) || l.ps.length === 0) note(l, 'empty playstyles');
      else {
        l.ps.forEach((p) => { if (!PS[p]) note(l, 'unknown playstyle ' + p); });
        if (new Set(l.ps).size !== l.ps.length) note(l, 'duplicate playstyles');
      }
      if (!Array.isArray(l.eg)) note(l, 'eg not an array');
      if (typeof l.hay !== 'string' || !l.hay.length) note(l, 'missing haystack');
      else {
        if (l.hay !== l.hay.toLowerCase()) note(l, 'haystack not lowercased');
        if (!l.hay.includes(l.n.toLowerCase())) note(l, 'haystack omits name');
      }
    });
    return problems;
  })()`);
  assert.equal(Array.from(bad).length, 0, `data problems:\n${Array.from(bad).join('\n')}`);
});

test('ownership catalogue is the expected 27 products', () => {
  const { ownKeys, locKeys, locOrder } = inPage(window, `({
    ownKeys: Object.keys(OWN_LABEL).length,
    locKeys: Object.keys(LOCS).length,
    locOrder: LOC_ORDER.length,
  })`);
  assert.equal(ownKeys, 27);
  assert.equal(locOrder, locKeys, 'LOC_ORDER must cover exactly the known regions');
});

test('every start region actually hosts a lord', () => {
  const empty = inPage(window, `(() => {
    const used = new Set(LORDS.map((l) => l.loc));
    return LOC_ORDER.filter((k) => !used.has(k));
  })()`);
  assert.equal(Array.from(empty).length, 0, `regions with no lords: ${Array.from(empty).join(', ')}`);
});

test('End Game scenario rosters reference real lords', () => {
  const missing = inPage(window, `ENDGAMES.flatMap(g =>
    g.lords.filter((n) => !LORDS.some((l) => l.n === n)).map((n) => g.n + ' -> ' + n)
  )`);
  assert.equal(Array.from(missing).length, 0, `unknown lords: ${Array.from(missing).join(', ')}`);
});

test('quiz axes reference only real playstyles', () => {
  const bad = inPage(window, `(() => {
    const problems = [];
    Object.entries(QUIZ_AXES).forEach(([group, answers]) => {
      Object.entries(answers).forEach(([answer, axes]) => {
        axes.forEach((axis) => { if (!PS[axis]) problems.push(group + '.' + answer + ' -> ' + axis); });
      });
    });
    QUIZ_SYSTEMS.forEach((axis) => { if (!PS[axis]) problems.push('QUIZ_SYSTEMS -> ' + axis); });
    return problems;
  })()`);
  assert.equal(Array.from(bad).length, 0, `invalid quiz axes: ${Array.from(bad).join(', ')}`);
});

test('every playstyle pill on a card maps to a known PS entry', () => {
  const bad = inPage(window, `(() => {
    const problems = [];
    document.querySelectorAll('.card .ps-pill').forEach((pill) => {
      const key = pill.dataset.ps.charAt(0).toUpperCase() + pill.dataset.ps.slice(1);
      if (!PS[key]) problems.push(pill.dataset.ps);
    });
    return problems;
  })()`);
  assert.equal(Array.from(bad).length, 0, `unknown ps-pill values: ${Array.from(bad).join(', ')}`);
});
