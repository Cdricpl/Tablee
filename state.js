// État global, persistance, lookups.
import {
  SEED_RECIPES, INGREDIENT_DB, CATEGORIES, TAGS,
  aisleFor, normalizeIngredient, aisleEmojiOf, normalizeRecipeTaxonomy,
} from './data.js';

export const STORAGE_KEY = 'tablee.v1';
export const USER_AISLES_KEY = 'tablee.userAisles';

export const DAYS_FR_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
export const SLOT_LABEL = { lunch: 'Déjeuner', dinner: 'Dîner' };

// getDay() compte à partir de dimanche ; la semaine de Tablée commence lundi.
const todayJS = new Date().getDay();
export const todayIndex = (todayJS + 6) % 7;
export const dayLabel = DAYS_FR_LONG[todayIndex].toUpperCase();

export const defaultState = () => ({
  recipes: SEED_RECIPES.map(r => ({ ...r, source: 'seed' })),
  week: Array.from({ length: 7 }, (_, i) => ({ day: i, lunch: null, dinner: null })),
  shopping: { manual: [], removed: [], checked: [] },
  favorites: [],
  toTry: [],
  view: 'library',
  filter: { cat: null, q: '', tags: [] },
});

export const state = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.recipes) {
      const seedIds = new Set(SEED_RECIPES.map(r => r.id));
      // Les recettes enregistrées avant la refonte portent une ancienne
      // catégorie de style ; sans cette conversion elles seraient introuvables
      // (leur catégorie n'existe plus) et leur carte afficherait un vide.
      const userRecipes = saved.recipes
        .filter(r => !seedIds.has(r.id))
        .map(normalizeRecipeTaxonomy);
      return {
        ...defaultState(),
        ...saved,
        recipes: [...SEED_RECIPES.map(r => ({ ...r, source: 'seed' })), ...userRecipes],
        favorites: Array.isArray(saved.favorites) ? saved.favorites : [],
        toTry: Array.isArray(saved.toTry) ? saved.toTry : [],
        view: 'library',
        filter: { cat: null, q: '', tags: [] },
      };
    } else if (saved && saved.shopping) {
      return {
        ...defaultState(),
        shopping: saved.shopping,
        view: 'library',
      };
    }
  } catch (_) {}
  return defaultState();
})();

export let userAisleMap = {};
try { userAisleMap = JSON.parse(localStorage.getItem(USER_AISLES_KEY)) || {}; } catch (_) {}

export function setUserAisleMap(map) {
  userAisleMap = map || {};
  localStorage.setItem(USER_AISLES_KEY, JSON.stringify(userAisleMap));
}

export function setUserAisle(name, aisle) {
  userAisleMap[normalizeIngredient(name)] = aisle;
  localStorage.setItem(USER_AISLES_KEY, JSON.stringify(userAisleMap));
}

export function aisleForUser(name) {
  const n = normalizeIngredient(name);
  if (userAisleMap[n]) return userAisleMap[n];
  return aisleFor(name);
}

export function emojiForUser(name) {
  const n = normalizeIngredient(name);
  if (INGREDIENT_DB[n]?.emoji) return INGREDIENT_DB[n].emoji;
  return aisleEmojiOf(aisleForUser(name));
}

export function persistNow() {
  // view n'est volontairement pas persisté : l'app ouvre toujours sur Recettes.
  const toSave = {
    recipes: state.recipes.filter(r => r.source !== 'seed' || r._edited),
    week: state.week,
    shopping: state.shopping,
    favorites: state.favorites,
    toTry: state.toTry,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('persist failed', e);
  }
}

let _persistTimer = null;
export function persist() {
  clearTimeout(_persistTimer);
  _persistTimer = setTimeout(() => { _persistTimer = null; persistNow(); }, 250);
}

window.addEventListener('beforeunload', () => {
  if (_persistTimer) { clearTimeout(_persistTimer); _persistTimer = null; persistNow(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && _persistTimer) {
    clearTimeout(_persistTimer); _persistTimer = null; persistNow();
  }
});

export const catById = id => CATEGORIES.find(c => c.id === id);
export const tagById = id => TAGS.find(t => t.id === id);
export const tagsOf = r => (r?.tags || []).map(tagById).filter(Boolean);
export const recipeById = id => state.recipes.find(r => r.id === id);

// Dérivation de la liste de courses depuis la semaine + ajouts manuels.
export function computeShopping() {
  const items = new Map();

  function addItem(name, qty, unit, explicitAisle) {
    const key = `${normalizeIngredient(name)}|${unit}`;
    if (state.shopping.removed.includes(key)) return;
    const ex = items.get(key);
    if (ex) { ex.qty += qty; return; }
    items.set(key, {
      key, name, qty, unit,
      aisle: explicitAisle || aisleForUser(name),
      emoji: emojiForUser(name),
    });
  }

  for (const d of state.week) {
    for (const slot of ['lunch', 'dinner']) {
      const m = d[slot];
      if (!m) continue;
      const r = recipeById(m.recipeId);
      if (!r) continue;
      // Garde-fou : r.portions à 0 donnerait Infinity → quantités NaN.
      const basePortions = r.portions > 0 ? r.portions : 1;
      const factor = (m.portions || basePortions) / basePortions;
      for (const ing of r.ingredients) {
        addItem(ing.name, ing.qty * factor, ing.unit);
      }
    }
  }

  for (const it of state.shopping.manual) addItem(it.name, it.qty, it.unit, it.aisle);

  return [...items.values()];
}
