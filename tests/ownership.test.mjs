// Ownership accuracy.
//
// Model (Total War's official new-player FAQ + SEGA's Immortal Empires DLC
// ownership guide):
//  - Ownership is a plain membership test with NO base-game implication.
//  - Free-LC is unlocked by owning any product that grants the lord's race.
//  - Bretonnia is free for every player, independent of Warhammer I.
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, inPage, filteredCount, resetState, quiz, lordByName } from './helpers.mjs';

let window;
before(() => { window = startApp().window; });
beforeEach(() => resetState(window));

const owned = () => Array.from(inPage(window, '[...state.own].sort()'));
const setOwn = (...keys) => inPage(window, `state.own = new Set(${JSON.stringify(keys)})`);
const shown = () => Array.from(inPage(window, 'filtered().map(l => l.n)'));
const expected = (...keys) => inPage(window, `LORDS.filter(l => ownsLord(l, new Set(${JSON.stringify(keys)}))).length`);

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

test('ownership tables are internally consistent', () => {
  const report = inPage(window, `(() => {
    const bad = [];
    Object.keys(OWN_RACES).forEach((race) => {
      if (!RACES[race]) bad.push('unknown race ' + race);
      OWN_RACES[race].forEach((k) => { if (!OWN_LABEL[k]) bad.push(race + ' -> unknown product ' + k); });
    });
    ['Undead Legions', 'Vampire Counts', 'High Elves'].forEach((race) => {
      if (!OWN_RACES[race]) bad.push('race missing from OWN_RACES: ' + race);
    });
    LORDS.forEach((l) => {
      if (!RACES[l.r]) bad.push(l.n + ' unknown race');
      if (!OWN_RACES[l.r]) bad.push(l.n + ' race not in OWN_RACES: ' + l.r);
      (l.also || []).forEach((k) => {
        if (!OWN_LABEL[k]) bad.push(l.n + ' -> unknown ' + k);
        if (k === l.own) bad.push(l.n + ' -> duplicate of primary');
      });
      if (l.free && (l.also || []).length) bad.push(l.n + ' is free but has alternatives');
    });
    return { bad, flcMissing: [...OWN_FLC].filter((n) => !LORDS.some((l) => l.n === n)), freeMissing: [...OWN_FREE].filter((n) => !LORDS.some((l) => l.n === n)) };
  })()`);
  assert.equal(Array.from(report.bad).length, 0, `problems:\n${Array.from(report.bad).join('\n')}`);
  assert.equal(Array.from(report.flcMissing).length, 0, `OWN_FLC names not in roster: ${Array.from(report.flcMissing).join(', ')}`);
  assert.equal(Array.from(report.freeMissing).length, 0, `OWN_FREE names not in roster: ${Array.from(report.freeMissing).join(', ')}`);
});

// Every product the sources say grants each free lord. Derived from race
// access, so the last three (WH3 DLCs) are the interesting additions.
const FLC_UNLOCKS = [
  ['Imrik', ['wh2', 'wh2_qc', 'wh2_wp', 'wh3_tot']],
  ['Alith Anar', ['wh2', 'wh2_qc', 'wh2_wp', 'wh3_tot']],
  ['Lokhir Fellheart', ['wh2', 'wh2_qc', 'wh2_sb']],
  ['Rakarth', ['wh2', 'wh2_qc', 'wh2_sb']],
  ['Gor-Rok', ['wh2', 'wh2_pw', 'wh2_hb', 'wh2_sf']],
  ["Tiktaq'to", ['wh2', 'wh2_pw', 'wh2_hb', 'wh2_sf']],
  ['Tretch Craventail', ['wh2', 'wh2_pw', 'wh2_sb', 'wh2_tw', 'wh3_eot']],
  ['Wurrzag', ['wh1', 'wh1_kw', 'wh2_wp', 'wh3_ood']],
  ['Vlad von Carstein', ['wh1', 'wh1_gg', 'wh3_eot']],
  ['Isabella von Carstein', ['wh1', 'wh1_gg', 'wh3_eot']],
  ['Grombrindal', ['wh1', 'wh1_kw', 'wh3_tod']],
  ['Thorek Ironbrow', ['wh1', 'wh1_kw', 'wh3_tod']],
  ['Drycha', ['wh1_woodelves', 'wh2_tw']],
  ['Epidemius', ['wh3', 'wh3_tod']],
  ['Arbaal the Undefeated', ['wh3', 'wh3_ood']],
  ['The Masque of Slaanesh', ['wh3', 'wh3_tot']],
  ['Neferata, the Vampire Queen', ['wh1', 'wh1_gg', 'wh3_eot']],
];

test('free lords unlock from every product that grants their race', () => {
  for (const [name, products] of FLC_UNLOCKS) {
    for (const product of products) {
      setOwn(product);
      assert.ok(shown().includes(name), `${name} should be granted by ${product}`);
    }
  }
});

test('Tides of Torment unlocks the High Elf free lords (official example)', () => {
  setOwn('wh3_tot');
  const names = shown();
  assert.ok(names.includes('Alith Anar') && names.includes('Imrik'));
  assert.ok(names.includes('The Masque of Slaanesh'), 'Slaanesh FLC follows Dechala too');
});

test('Bretonnia is free for every owner', () => {
  const bret = ['Louen Leoncoeur', 'Alberic de Bordeleaux', 'The Fay Enchantress', 'Repanse de Lyonesse'];
  for (const product of ['wh3', 'wh2', 'wh1_gg', 'wh3_coc']) {
    setOwn(product);
    for (const name of bret) assert.ok(shown().includes(name), `${name} should be free with ${product}`);
  }
  // and they are never tied to a product
  for (const name of bret) {
    const lord = lordByName(window, name);
    assert.equal(lord.free, true, `${name} should be flagged free`);
  }
});

test('a DLC does not imply its base game', () => {
  setOwn('wh3_coc');
  const names = shown();
  assert.ok(!names.includes('Skarbrand the Exiled'), 'a WH3 base lord must not appear');
  assert.ok(!names.includes('Archaon the Everchosen'), 'Archaon needs the WH1 Chaos Warriors pack');
  assert.equal(filteredCount(window), expected('wh3_coc'));
});

test('Drycha belongs to Realm of the Wood Elves but follows the Wood Elf race', () => {
  assert.equal(lordByName(window, 'Drycha').own, 'wh1_woodelves');
  setOwn('wh1_woodelves');
  assert.ok(shown().includes('Drycha'));
  setOwn('wh2_tw');
  assert.ok(shown().includes('Drycha'), 'Twisted & Twilight grants the Wood Elf race, so Drycha follows');
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
  setOwn('wh2_tk');
  assert.equal(filteredCount(window), expected('wh2_tk'));
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

test('the quiz honours race-derived unlocks when restricted to owned content', () => {
  setOwn('wh2_qc');
  const picks = quiz(window, { exp: 'some', pace: 'schemes', battle: 'none', micro: 'some', ownedOnly: true });
  assert.ok(picks.length > 0);
  for (const pick of picks) {
    const granted = inPage(window, `ownsLord(LORDS.find(l => l.n === ${JSON.stringify(pick.name)}), new Set(['wh2_qc']))`);
    assert.equal(granted, true, `${pick.name} is outside owned content`);
  }
});
