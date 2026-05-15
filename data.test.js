// Tests Node minimaux pour la logique pure (sans DOM).
// Lancement : node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeIngredient,
  aisleFor,
  defaultUnitFor,
  aisleEmojiOf,
  inferCategory,
} from './data.js';

test('normalizeIngredient enlève accents, gère œ, casse, espaces', () => {
  assert.equal(normalizeIngredient('  Bœuf  '), 'boeuf');
  assert.equal(normalizeIngredient('Crème fraîche'), 'creme fraiche');
  assert.equal(normalizeIngredient('OIGNONS'), 'oignon');
  assert.equal(normalizeIngredient(''), '');
  assert.equal(normalizeIngredient(null), '');
});

test('aisleFor classe correctement les ingrédients', () => {
  assert.equal(aisleFor('boeuf'), 'meat');
  assert.equal(aisleFor('poulet'), 'meat');
  assert.equal(aisleFor('saumon'), 'meat');
  assert.equal(aisleFor('lait'), 'dairy');
  assert.equal(aisleFor('tomate'), 'veg');
  assert.equal(aisleFor('huile olive'), 'pantry');
  assert.equal(aisleFor('zigouigoui-imaginaire-xyz'), 'misc');
});

test('defaultUnitFor retourne une unité plausible', () => {
  const u = defaultUnitFor('boeuf');
  assert.ok(u, 'unité non vide');
});

test('aisleEmojiOf fallback sur 🛒', () => {
  assert.equal(aisleEmojiOf('xyzpasunrayon'), '🛒');
});

test('inferCategory retourne une catégorie connue', () => {
  const cat = inferCategory('Bœuf bourguignon', [{ name: 'boeuf' }]);
  assert.ok(typeof cat === 'string' && cat.length > 0);
});
