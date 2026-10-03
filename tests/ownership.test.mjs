// Ownership accuracy.
//
// Model (SEGA Immortal Empires DLC Ownership Guide): ownership is a plain
// membership test with NO base-game implication - DLC "can be purchased
// regardless of whether you own the game they were originally released for,
// and will unlock any associated Lords". A lord is playable if the visitor
// owns any product that grants it, and some lords are granted by more than
// one product (marked * in the guide).
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, inPage, filteredCount, resetState, quiz, lordByName } from './helpers.mjs';

let window;
before(() => { window = startApp().window; });
beforeEach(() => resetState(window));

const owned = () => Array.from(inPage(window, '[...state.own].sort()'));
const setOwn = (...keys) => inPage(window, `state.own = new Set(${JSON.stringify(keys)})`);
const shown = () => Array.from(inPage(window, 'filtered().map(l => l.n)'));

test('every product key resolves to a known product', () => {
  const bad = inPage(window, `(() => {
    const bases = ['wh1', 'wh2', 'wh3'];
    return Object.keys(OWN_LABEL).filter((k) => !bases.includes(k.slice(0, 3)));
  })()`);
  assert.equal(Array.from(bad).length, 0, `products with no game prefix: ${Array.from(bad).join(', ')}`);
});

test('every lord source resolves without the silent wh3 fallback', () => {
  const unresolved = inPage(window, `LORDS.filter((l) => !(OWN_SRC[l.src] || OWN_OVERRIDE[l.n])).map((l) => l.n + ' <- ' + l.src)`);
  assert.equal(Array.from(unresolved).length, 0, `sources silently defaulted to wh3:\n${Array.from(unresolved).join('\n')}`);
});

test('every alternative unlock is a valid, distinct product', () => {
  const bad = inPage(window, `(() => {
    const problems = [];
    LORDS.forEach((l) => {
      (l.also || []).forEach((k) => {
        if (!OWN_LABEL[k]) problems.push(l.n + ' -> unknown ' + k);
        if (k === l.own) problems.push(l.n + ' -> duplicate of primary');
      });
    });
    return problems;
  })()`);
  assert.equal(Array.from(bad).length, 0, `bad alternative unlocks:\n${Array.from(bad).join('\n')}`);
});

test('a DLC does not imply its base game', () => {
  setOwn('wh3_coc');
  assert.equal(filteredCount(window), 4, 'Champions of Chaos grants only its four lords');
  const names = shown();
  assert.ok(names.includes('Valkia the Bloody'));
  assert.ok(!names.includes('Skarbrand the Exiled'), 'a WH3 base lord must not appear');
  assert.ok(!names.includes('Archaon the Everchosen'), 'Archaon needs the WH1 Chaos Warriors pack');
});

test('a base game does not imply its expansions', () => {
  setOwn('wh3');
  assert.ok(!shown().includes('Valkia the Bloody'), 'a WH3 DLC lord must not appear');
  assert.equal(
    filteredCount(window),
    inPage(window, "LORDS.filter(l => l.own === 'wh3').length"),
  );
});

// The guide's asterisked lords are granted by more than one product.
const MULTI = [
  ['Imrik', ['wh2', 'wh2_qc', 'wh2_wp']],
  ['Alith Anar', ['wh2', 'wh2_qc', 'wh2_wp']],
  ['Lokhir Fellheart', ['wh2', 'wh2_qc', 'wh2_sb']],
  ['Rakarth', ['wh2', 'wh2_qc', 'wh2_sb']],
  ['Gor-Rok', ['wh2', 'wh2_pw', 'wh2_hb', 'wh2_sf']],
  ["Tiktaq'to", ['wh2', 'wh2_pw', 'wh2_hb', 'wh2_sf']],
  ['Tretch Craventail', ['wh2', 'wh2_pw', 'wh2_sb', 'wh2_tw']],
  ['Wurrzag', ['wh1', 'wh1_kw', 'wh2_wp']],
  ['Vlad von Carstein', ['wh1', 'wh1_gg']],
  ['Isabella von Carstein', ['wh1', 'wh1_gg']],
  ['Grombrindal', ['wh1', 'wh1_kw']],
  ['Thorek Ironbrow', ['wh1', 'wh1_kw']],
];

test('starred lords are granted by every product the guide lists', () => {
  for (const [name, products] of MULTI) {
    for (const product of products) {
      setOwn(product);
      assert.ok(shown().includes(name), `${name} should be granted by ${product}`);
    }
  }
});

test('a lord-packs-only owner still gets the free lords it ships', () => {
  // Queen and the Crone ships Alarielle/Hellebron plus the free Alith Anar, Imrik, Lokhir, Rakarth.
  setOwn('wh2_qc');
  const names = shown();
  for (const expected of ['Alarielle the Radiant', 'Crone Hellebron', 'Alith Anar', 'Imrik', 'Lokhir Fellheart', 'Rakarth']) {
    assert.ok(names.includes(expected), `wh2_qc should grant ${expected}`);
  }
  assert.ok(!names.includes('Tyrion'), 'the WH2 base-game lord must not appear');
});

test('Drycha belongs to Realm of the Wood Elves, not the lord pack', () => {
  assert.equal(lordByName(window, 'Drycha').own, 'wh1_woodelves');
  setOwn('wh1_woodelves');
  assert.ok(shown().includes('Drycha'));
  setOwn('wh2_tw');
  assert.ok(!shown().includes('Drycha'), 'Twisted & Twilight grants the Sisters, not Drycha');
  assert.ok(shown().includes('Sisters of Twilight'));
});

test('Helman Ghorst belongs to The Grim and the Grave', () => {
  assert.equal(lordByName(window, 'Helman Ghorst').own, 'wh1_gg');
  setOwn('wh1');
  assert.ok(!shown().includes('Helman Ghorst'), 'WH1 base alone does not grant Ghorst');
  setOwn('wh1_gg');
  assert.ok(shown().includes('Helman Ghorst'));
});

test('Neferata follows Vampire Counts / Nagash ownership, not WH3 base', () => {
  setOwn('wh3');
  assert.ok(!shown().includes('Neferata, the Vampire Queen'), 'WH3 base alone does not grant Neferata');
  for (const product of ['wh1', 'wh1_gg', 'wh3_eot']) {
    setOwn(product);
    assert.ok(shown().includes('Neferata, the Vampire Queen'), `Neferata should be granted by ${product}`);
  }
});

test('Archaon needs the WH1 Chaos Warriors pack, not Champions of Chaos', () => {
  setOwn('wh3_coc');
  assert.ok(!shown().includes('Archaon the Everchosen'));
  setOwn('wh1_chaos');
  assert.ok(shown().includes('Archaon the Everchosen'));
});

test('the checkbox path records exactly the product ticked', () => {
  const checkbox = (k) => window.document.querySelector(`input[data-own="${k}"]`);
  checkbox('wh2_tk').checked = true;
  checkbox('wh2_tk').dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.deepEqual(owned(), ['wh2_tk']);
  assert.equal(checkbox('wh2').checked, false, 'the base game must not be auto-ticked');
  assert.equal(
    filteredCount(window),
    inPage(window, "LORDS.filter(l => ownsLord(l, new Set(['wh2_tk']))).length"),
  );
});

test('the ownership presets are distinct', () => {
  inPage(window, "document.querySelector('[data-own-all=base]').click()");
  assert.deepEqual(owned(), ['wh1', 'wh2', 'wh3']);
  inPage(window, "document.querySelector('[data-own-all=wh3]').click()");
  assert.deepEqual(owned(), ['wh3']);
  inPage(window, "document.querySelector('[data-own-all=clear]').click()");
  assert.equal(filteredCount(window), 110);
});

test('the active-filter pill removes one product', () => {
  setOwn('wh3', 'wh3_coc');
  inPage(window, 'renderActiveFilters()');
  const clicked = inPage(window, `(() => {
    const x = [...document.querySelectorAll('[data-clear=own][data-own]')].find(p => p.dataset.own === 'wh3_coc');
    return x ? (x.click(), true) : false;
  })()`);
  assert.equal(clicked, true);
  assert.deepEqual(owned(), ['wh3']);
});

test('the quiz honours alternative unlocks when restricted to owned content', () => {
  setOwn('wh2_qc');
  const picks = quiz(window, { exp: 'some', pace: 'schemes', battle: 'none', micro: 'some', ownedOnly: true });
  assert.ok(picks.length > 0);
  for (const pick of picks) {
    const lord = lordByName(window, pick.name);
    const granted = inPage(window, `ownsLord(LORDS.find(l => l.n === ${JSON.stringify(pick.name)}), new Set(['wh2_qc']))`);
    assert.equal(granted, true, `${lord.n} is outside owned content`);
  }
});
