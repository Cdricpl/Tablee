import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  slug, fmtTime, cap, formatQty, localMatch, detectPortions, STOPWORDS,
} from './pure.js';

test('slug normalise accents et caractères non alphanum', () => {
  assert.equal(slug('Bœuf bourguignon'), 'b-uf-bourguignon');
  assert.equal(slug('Crème brûlée!'), 'creme-brulee');
  assert.equal(slug('  ÉtéÉté  '), 'eteete');
  assert.equal(slug(''), '');
  assert.equal(slug(null), '');
});

test('fmtTime', () => {
  assert.equal(fmtTime(30), '30 MIN');
  assert.equal(fmtTime(0), '0 MIN');
});

test('cap met la première lettre en majuscule', () => {
  assert.equal(cap('bœuf'), 'Bœuf');
  assert.equal(cap(''), '');
  assert.equal(cap(null), null);
});

test('formatQty arrondit selon la taille', () => {
  assert.equal(formatQty(123.7), '124');
  assert.equal(formatQty(12.345), '12.3');
  assert.equal(formatQty(0.456), '0.46');
  assert.equal(formatQty(0), '0');
});

test('detectPortions extrait le nombre de personnes', () => {
  assert.equal(detectPortions('bœuf pour 4 personnes'), 4);
  assert.equal(detectPortions('pâtes pour 2 pers'), 2);
  assert.equal(detectPortions('riz au lait'), null);
  assert.equal(detectPortions(''), null);
  assert.equal(detectPortions(null), null);
});

test('localMatch trie par score décroissant et limite à max', () => {
  const recipes = [
    { id: 'a', name: 'Bœuf bourguignon', ingredients: [{ name: 'bœuf' }, { name: 'carotte' }] },
    { id: 'b', name: 'Salade verte', ingredients: [{ name: 'salade' }] },
    { id: 'c', name: 'Carottes Vichy', ingredients: [{ name: 'carotte' }] },
    { id: 'd', name: 'Bœuf à la carotte', ingredients: [{ name: 'bœuf' }, { name: 'carotte' }] },
  ];
  const r = localMatch('bœuf carotte', recipes);
  assert.ok(r.length > 0);
  // 'a' et 'd' ont les deux tokens → score 2, doivent venir avant 'c' (score 1)
  assert.ok(['a', 'd'].includes(r[0].id));
  assert.equal(r.length, 3);
});

test('localMatch ignore les tokens courts et stopwords', () => {
  const recipes = [{ id: 'x', name: 'Test', ingredients: [{ name: 'pour' }] }];
  // 'a', 'pour' filtrés → aucun token utile → []
  assert.deepEqual(localMatch('a pour', recipes), []);
});

test('STOPWORDS contient les mots français courants', () => {
  for (const w of ['pour', 'avec', 'et', 'de']) assert.ok(STOPWORDS.has(w));
});
