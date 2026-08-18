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
  deriveTags,
  normalizeRecipeTaxonomy,
  CATEGORIES,
  TAGS,
  SEED_RECIPES,
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

const isKnownCat = c => CATEGORIES.some(x => x.id === c);

test('inferCategory retourne une catégorie connue', () => {
  assert.ok(isKnownCat(inferCategory('Bœuf bourguignon', [{ name: 'boeuf' }])));
});

test('inferCategory place sur l\'axe ingrédient, pas sur le style', () => {
  // Un poulet au curry doit atterrir sur « volaille » : c'est tout le point de
  // la refonte, « du monde » n'est plus une catégorie mais une étiquette.
  assert.equal(inferCategory('Curry de poulet', [{ name: 'Blanc de poulet' }]), 'volaille');
  assert.equal(inferCategory('Tajine de poulet', [{ name: 'Cuisses de poulet' }]), 'volaille');
  assert.equal(inferCategory('Pavé de saumon', [{ name: 'Saumon' }]), 'poisson');
  assert.equal(inferCategory('Bœuf bourguignon', [{ name: 'Bœuf' }]), 'viande');
});

test('inferCategory : le sucré prime sur les féculents', () => {
  // « Pâtes » déclencherait « vege » ; le mot-clé sucré doit passer avant.
  assert.equal(inferCategory('Pâtes brioches aux pépites de chocolat',
    [{ name: 'Chocolat' }, { name: 'Farine' }]), 'dessert');
});

test('inferCategory résout la ligature œ', () => {
  assert.equal(inferCategory('Omelette', [{ name: 'Œuf' }]), 'vege');
});

test('deriveTags déduit le style et les critères objectifs', () => {
  const tags = deriveTags({
    name: 'Gratin de courgettes', time: 25, portions: 8,
    ingredients: [{ name: 'Courgette' }], steps: ['Enfourner 20 minutes'],
  });
  assert.ok(tags.includes('four'), 'gratin → au four');
  assert.ok(tags.includes('rapide'), '25 min → rapide');
  assert.ok(tags.includes('famille'), '8 portions → familial');
});

test('normalizeRecipeTaxonomy convertit une ancienne catégorie de style', () => {
  const r = normalizeRecipeTaxonomy({
    name: 'Tajine de poulet aux abricots', cat: 'monde', time: 60, portions: 4,
    ingredients: [{ name: 'Cuisses de poulet' }], steps: ['Laisser mijoter'],
  });
  assert.equal(r.cat, 'volaille', 'la catégorie repasse sur l\'axe ingrédient');
  assert.ok(r.tags.includes('monde'), 'l\'ancienne catégorie devient une étiquette');
});

test('normalizeRecipeTaxonomy est idempotent', () => {
  const base = { name: 'Curry de poulet', cat: 'monde', time: 35, portions: 4,
    ingredients: [{ name: 'Poulet' }], steps: [] };
  const once = normalizeRecipeTaxonomy({ ...base });
  const twice = normalizeRecipeTaxonomy({ ...once, tags: [...once.tags] });
  assert.equal(twice.cat, once.cat);
  assert.deepEqual([...twice.tags].sort(), [...once.tags].sort());
});

test('normalizeRecipeTaxonomy encaisse une catégorie inconnue ou absente', () => {
  assert.ok(isKnownCat(normalizeRecipeTaxonomy({
    name: 'Tarte aux pommes', cat: 'categorie-qui-nexiste-pas', time: 60, portions: 8,
    ingredients: [{ name: 'Pomme' }, { name: 'Sucre' }], steps: ['Enfourner'],
  }).cat));
  assert.ok(isKnownCat(normalizeRecipeTaxonomy({
    name: 'Salade de lentilles', time: 20, portions: 2,
    ingredients: [{ name: 'Lentilles' }], steps: [],
  }).cat));
});

test('toutes les recettes du dépôt sont sur la nouvelle taxonomie', () => {
  const knownTag = t => TAGS.some(x => x.id === t);
  for (const r of SEED_RECIPES) {
    assert.ok(isKnownCat(r.cat), `catégorie inconnue « ${r.cat} » sur ${r.name}`);
    assert.ok(Array.isArray(r.tags), `étiquettes absentes sur ${r.name}`);
    assert.ok(r.tags.every(knownTag), `étiquette inconnue sur ${r.name}`);
  }
});

test('chaque plat au poulet ou à la dinde est bien dans Volaille', () => {
  // Le symptôme d'origine : 9 des 16 plats au poulet échappaient à « Volaille ».
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const poultry = SEED_RECIPES.filter(r =>
    /poulet|dinde/.test(norm(r.name + ' ' + r.ingredients.map(i => i.name).join(' '))));
  assert.ok(poultry.length >= 15, 'échantillon significatif');
  const egares = poultry.filter(r => r.cat !== 'volaille').map(r => r.name);
  assert.deepEqual(egares, [], 'aucun plat au poulet hors de Volaille');
});
