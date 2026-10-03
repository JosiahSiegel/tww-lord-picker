// Filter engine: each dimension narrows the roster independently, dimensions
// combine with AND, playstyle combines with OR or AND, and the chip counts
// are context-aware (a chip's number equals what you get if you click it,
// with its own dimension ignored). Expectations are derived from LORDS where
// possible so the tests track the data rather than pinning opaque numbers.
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, inPage, filteredCount, resetState } from './helpers.mjs';

let window;
before(() => { window = startApp().window; });
beforeEach(() => resetState(window));

const reachable = (code) => inPage(window, `LORDS.filter(${code}).length`);

test('no filters shows the whole roster', () => {
  assert.equal(filteredCount(window), 110);
});

test('race narrows to that race', () => {
  inPage(window, "state.race.add('Khorne')");
  assert.equal(filteredCount(window), reachable("l => l.r === 'Khorne'"));
});

test('start region narrows to that region', () => {
  inPage(window, "state.loc.add('naggaroth')");
  assert.equal(filteredCount(window), reachable("l => l.loc === 'naggaroth'"));
});

test('dimensions combine with AND', () => {
  inPage(window, "state.loc.add('naggaroth'); state.race.add('Dark Elves')");
  assert.equal(
    filteredCount(window),
    reachable("l => l.loc === 'naggaroth' && l.r === 'Dark Elves'"),
  );
});

test('playstyle defaults to OR and honours the AND toggle', () => {
  inPage(window, "state.psInc.add('Aggro'); state.psInc.add('Duelist')");
  assert.equal(
    filteredCount(window),
    reachable("l => l.ps.includes('Aggro') || l.ps.includes('Duelist')"),
  );
  inPage(window, 'state.psAll = true');
  assert.equal(
    filteredCount(window),
    reachable("l => l.ps.includes('Aggro') && l.ps.includes('Duelist')"),
  );
  assert.ok(filteredCount(window) < reachable("l => l.ps.includes('Aggro') || l.ps.includes('Duelist')"));
});

test('difficulty is an exact match', () => {
  inPage(window, "state.diff = '4'");
  assert.equal(filteredCount(window), reachable('l => l.d === 4'));
});

test('search matches the precomputed haystack', () => {
  inPage(window, "state.q = 'naggaroth'");
  assert.equal(filteredCount(window), reachable("l => l.hay.includes('naggaroth')"));
});

test('ownership narrows to the selected products', () => {
  inPage(window, "state.own.add('wh3')");
  assert.equal(filteredCount(window), reachable("l => l.own === 'wh3'"));
});

test('hide-played removes only marked lords', () => {
  const first = inPage(window, 'LORDS[0].n');
  inPage(window, `state.played.add(${JSON.stringify(first)}); state.hidePlayed = true`);
  assert.equal(filteredCount(window), 109);
  const shown = inPage(window, `filtered().some(l => l.n === ${JSON.stringify(first)})`);
  assert.equal(shown, false);
});

test('context-aware chip counts ignore their own dimension', () => {
  inPage(window, "state.race.add('Khorne')");
  // With Khorne selected, each region chip must count the Khorne lords in
  // that region (the loc dimension is ignored for the loc chips).
  const counts = inPage(window, `(() => {
    const out = {};
    LOC_ORDER.forEach((k) => {
      out[k] = LORDS.filter((l) => l.loc === k && _lordMatches(l, 'loc')).length;
    });
    return out;
  })()`);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.equal(total, filteredCount(window), 'region chip counts must sum to the filtered total');
  assert.equal(counts.northwastes + counts.lustria + counts.badlands, 3, 'Khorne starts in exactly three regions');
});

test('clear-all resets filters but preserves ownership', () => {
  inPage(window, "state.own.add('wh3'); state.race.add('Khorne'); state.diff = '4'; state.q = 'khorne'; state.hidePlayed = true");
  inPage(window, 'clearAllFilters()');
  assert.equal(inPage(window, 'state.race.size'), 0);
  assert.equal(inPage(window, "state.diff"), '');
  assert.equal(inPage(window, "state.q"), '');
  assert.equal(inPage(window, 'state.psInc.size'), 0);
  assert.equal(inPage(window, 'state.hidePlayed'), false);
  // Ownership is a saved preference, not a transient filter.
  assert.equal(inPage(window, 'state.own.size'), 1);
  assert.equal(filteredCount(window), reachable("l => l.own === 'wh3'"));
});
