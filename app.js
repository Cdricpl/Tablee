import {
  AISLES, CATEGORIES, UNITS, SEED_RECIPES, INGREDIENT_DB,
  aisleFor, defaultUnitFor, normalizeIngredient, aisleEmojiOf,
} from './data.js';

import { llmMatchOrCreate, llmExtractFromFile, hasApiKey, getApiKey, setApiKey } from './llm.js';

// === STATE ===
const STORAGE_KEY = 'tablee.v1';
const USER_AISLES_KEY = 'tablee.userAisles';

const DAYS_FR = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
const DAYS_FR_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const SLOT_LABEL = { lunch: 'Déjeuner', dinner: 'Dîner' };

const STOPWORDS = new Set([
  'pour','avec','sans','de','du','des','et','ou','la','le','les','un','une',
  'personnes','personne','pers','aux','au','en','a','à','la','les',
]);

const todayJS = new Date().getDay();
const dayLabel = (todayJS === 0 ? 'Dimanche' : DAYS_FR_LONG[todayJS - 1]).toUpperCase();

const defaultState = () => ({
  recipes: SEED_RECIPES.map(r => ({ ...r, source: 'seed' })),
  week: Array.from({ length: 7 }, (_, i) => ({ day: i, lunch: null, dinner: null })),
  shopping: { manual: [], removed: [], checked: [] },
  view: 'library',
  filter: { cat: null, q: '' },
});

let state;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved && saved.recipes) {
    const seedIds = new Set(SEED_RECIPES.map(r => r.id));
    const userRecipes = saved.recipes.filter(r => !seedIds.has(r.id));
    state = {
      ...defaultState(),
      ...saved,
      recipes: [...SEED_RECIPES.map(r => ({ ...r, source: 'seed' })), ...userRecipes],
      view: saved.view || 'library',
      filter: { cat: null, q: '' },
    };
  } else if (saved && saved.shopping) {
    // Charger au moins la liste de courses si elle existe, même si les recettes sont absentes
    state = {
      ...defaultState(),
      shopping: saved.shopping,
      view: saved.view || 'library',
    };
  } else {
    state = defaultState();
  }
} catch {
  state = defaultState();
}

// surrides utilisateur du rayon par ingrédient
let userAisleMap = {};
try { userAisleMap = JSON.parse(localStorage.getItem(USER_AISLES_KEY)) || {}; } catch {}

function setUserAisle(name, aisle) {
  userAisleMap[normalizeIngredient(name)] = aisle;
  localStorage.setItem(USER_AISLES_KEY, JSON.stringify(userAisleMap));
}

function aisleForUser(name) {
  const n = normalizeIngredient(name);
  if (userAisleMap[n]) return userAisleMap[n];
  return aisleFor(name);
}

function emojiForUser(name) {
  const n = normalizeIngredient(name);
  if (INGREDIENT_DB[n]?.emoji) return INGREDIENT_DB[n].emoji;
  return aisleEmojiOf(aisleForUser(name));
}

function persistNow() {
  const toSave = {
    recipes: state.recipes.filter(r => r.source !== 'seed' || r._edited),
    week: state.week,
    shopping: state.shopping,
    view: state.view,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('persist failed', e);
  }
}

let _persistTimer = null;
function persist() {
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

// === HELPERS ===
const $ = sel => document.querySelector(sel);
// `html:` n'accepte que des chaînes inertes (SVG d'icônes hardcodés). Toute trace
// de <script>, gestionnaire d'événement inline ou URL `javascript:` est refusée
// pour empêcher une XSS si du contenu dynamique y atterrissait par erreur.
const UNSAFE_HTML_RE = /<script\b|\son\w+\s*=|javascript:/i;
const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') {
      if (typeof v !== 'string' || UNSAFE_HTML_RE.test(v)) {
        throw new Error('h(): contenu html non sûr refusé');
      }
      el.innerHTML = v;
    }
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'data') Object.entries(v).forEach(([dk, dv]) => el.dataset[dk] = dv);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(c));
  }
  return el;
};

const catById = id => CATEGORIES.find(c => c.id === id);
const recipeById = id => state.recipes.find(r => r.id === id);

const slug = s => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const newId = name => slug(name) + '-' + Math.random().toString(36).slice(2, 7);

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2200);
}

const fmtTime = m => `${m} MIN`;

const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// === ICONS ===
const icon = {
  search: () => h('span', { html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-5-5"/></svg>' }),
  upload: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V4m-4 4 4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>' }),
  plus: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>' }),
  clock: () => h('span', { html: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' }),
  users: () => h('span', { html: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 4a3 3 0 0 1 0 6M21 20v-2a4 4 0 0 0-3-3.87"/></svg>' }),
  edit: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' }),
  trash: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' }),
  download: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>' }),
  refresh: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>' }),
  sparkle: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 13.8 8.2 20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/></svg>' }),
};

// === HEADER ===
function setMastheadDay() {
  $('#issueNo').textContent = `N° ${String(state.recipes.length || 0).padStart(3, '0')}`;
  $('#issueDay').textContent = dayLabel;
}

// === ROUTING ===
function setView(v) {
  state.view = v;
  document.querySelectorAll('.tab').forEach(t =>
    t.setAttribute('aria-selected', t.dataset.view === v ? 'true' : 'false'));
  render();
}
document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', () => setView(t.dataset.view)));

// === LIBRARY VIEW (catégorie-first) ===
function viewLibrary() {
  const root = h('section');

  // count par cat
  const counts = {};
  for (const c of CATEGORIES) counts[c.id] = state.recipes.filter(r => r.cat === c.id).length;

  const resultsEl = h('div', { id: 'recipeResults' });

  function refreshResults() {
    const q = (state.filter.q || '').trim();
    const cat = state.filter.cat;
    let visible = [];
    if (q) {
      const lq = q.toLowerCase();
      visible = state.recipes.filter(r => {
        const hay = (r.name + ' ' + r.ingredients.map(i => i.name).join(' ')).toLowerCase();
        return hay.includes(lq);
      });
    } else if (cat) {
      visible = state.recipes.filter(r => r.cat === cat);
    }

    resultsEl.replaceChildren();
    if (!q && !cat) {
      resultsEl.append(h('p', { class: 'empty' },
        h('em', {}, 'Choisissez une catégorie ci-dessus pour voir les recettes,'),
        h('br', {}),
        h('em', {}, 'ou utilisez la recherche.')));
      return;
    }
    if (visible.length === 0) {
      resultsEl.append(h('p', { class: 'empty' },
        q ? `Aucun résultat pour « ${q} ».` : 'Aucune recette dans cette catégorie.'));
      return;
    }
    resultsEl.append(
      h('p', { class: 'section-meta' }, `${visible.length} ${visible.length > 1 ? 'recettes' : 'recette'}`),
      h('div', { class: 'recipe-grid' }, ...visible.map(recipeCard)),
    );
  }

  // synchroniser état actif des boutons cat sans tout re-rendre
  function refreshCatButtons() {
    document.querySelectorAll('.cat-btn').forEach(b => {
      b.dataset.active = (state.filter.cat === b.dataset.cat) ? 'true' : 'false';
    });
  }

  root.append(
    h('p', { class: 'kicker' }, h('em', {}, 'bibliothèque')),
    h('h2', { class: 'section-title' }, 'Mes ', h('em', {}, 'recettes')),
    h('p', { class: 'section-meta' }, `${state.recipes.length} recettes au total`),

    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: openImport }, icon.upload(), 'Importer PDF / Image'),
      h('button', { class: 'btn primary', onclick: () => openEdit(null) }, icon.plus(), 'Nouvelle'),
    ),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: openMenuLibre }, icon.sparkle(), '(chercher une recette)'),
      h('button', { class: 'btn', onclick: openSettings }, '⚙ Réglages'),
    ),

    h('div', { class: 'search' },
      h('span', { class: 'search-icon' }, icon.search()),
      h('input', {
        type: 'text',
        placeholder: 'Chercher une recette…',
        value: state.filter.q,
        oninput: e => { state.filter.q = e.target.value; refreshResults(); },
      }),
    ),

    h('div', { class: 'cat-grid' },
      ...CATEGORIES.map(c => h('button', {
        class: 'cat-btn',
        'data-cat': c.id,
        'data-active': state.filter.cat === c.id ? 'true' : 'false',
        onclick: () => {
          state.filter.cat = (state.filter.cat === c.id ? null : c.id);
          state.filter.q = '';
          // remettre la valeur de l'input search à vide (sans re-rendre tout)
          const inp = document.querySelector('.search input');
          if (inp) inp.value = '';
          refreshCatButtons();
          refreshResults();
        },
      },
        h('span', { class: 'cat-emoji' }, c.emoji),
        h('span', { class: 'cat-name' }, c.name),
        h('span', { class: 'cat-count' }, String(counts[c.id])),
      )),
    ),

    resultsEl,
  );

  refreshResults();
  return root;
}

function recipeCard(r) {
  const cat = catById(r.cat);
  const idx = state.recipes.indexOf(r) + 1;
  return h('article', { class: 'card', onclick: () => openRecipe(r.id) },
    h('div', { class: 'card-head' },
      h('span', { class: 'card-cat' }, (cat?.name || '').toUpperCase()),
      h('span', { class: 'card-no' }, `N° ${String(idx).padStart(2, '0')}`),
    ),
    h('h3', { class: 'card-title' }, r.name),
    h('hr', { class: 'dashed' }),
    h('div', { class: 'card-foot' },
      h('span', { class: 'meta' }, icon.clock(), fmtTime(r.time)),
      h('span', { class: 'meta' }, icon.users(), String(r.portions)),
      h('span', { class: 'ingredients-count' }, `${r.ingredients.length} ingrédients`),
    ),
  );
}

// === RECIPE MODAL ===
function openRecipe(id, opts = {}) {
  const r = recipeById(id);
  if (!r) return;
  let portions = opts.portions || r.portions;
  const factor = () => portions / r.portions;
  const cat = catById(r.cat);

  function fmtQty(qty) {
    const v = qty * factor();
    if (v >= 100) return Math.round(v).toString();
    if (v >= 10)  return (Math.round(v * 10) / 10).toString();
    return (Math.round(v * 100) / 100).toString();
  }

  function content() {
    return h('div', { class: 'modal-card recipe-modal' },
      h('button', { class: 'modal-close', onclick: closeModal }, '×'),
      h('div', { class: 'modal-head' },
        h('span', { class: 'modal-cat' }, (cat?.name || '').toUpperCase()),
      ),
      h('div', { class: 'modal-actions' },
        h('button', { class: 'btn-ghost', onclick: () => chooseAndAddToWeek(r.id, portions) }, '+ Au menu'),
          r.file ? h('button', { class: 'btn-ghost icon-only', onclick: () => { window.open(r.file, '_blank'); }, title: 'Ouvrir le fichier source' }, icon.download()) : h('button', { class: 'btn-ghost icon-only', onclick: () => exportRecipe(r), title: 'Sauvegarder' }, icon.download()),
        h('button', { class: 'btn-ghost icon-only', onclick: () => { closeModal(); openEdit(r.id); }, title: 'Modifier' }, icon.edit()),
        h('button', { class: 'btn-ghost icon-only danger', onclick: () => deleteRecipe(r.id), title: 'Supprimer' }, icon.trash()),
      ),
      h('h2', { class: 'modal-title' }, r.name),
      h('hr', { class: 'dashed' }),
      h('div', { class: 'modal-meta-row' },
        h('span', { class: 'meta' }, icon.clock(), ' ', fmtTime(r.time)),
        portionsControl(portions, n => { portions = Math.max(1, Math.min(20, n)); renderModal(); }),
      ),
      h('h3', { class: 'subhead' }, 'Ingrédients'),
      h('ul', { class: 'ing-list' },
        ...r.ingredients.map(ing => h('li', {},
          h('span', {}, ing.name),
          h('span', { class: 'qty' }, `${fmtQty(ing.qty)} ${ing.unit}`),
        )),
      ),
      h('h3', { class: 'subhead' }, 'Préparation'),
      h('ol', { class: 'steps' },
        ...r.steps.map(s => h('li', {}, h('div', { class: 'step-text' }, s))),
      ),
    );
  }

  function renderModal() {
    const m = $('#modal');
    m.replaceChildren();
    m.append(content());
  }

  state.modal = { type: 'recipe', id };
  $('#modal').hidden = false;
  renderModal();
}

// Ouvre un modal pour une recette fournie en objet (utile pour les recettes IA non sauvegardées)
function openRecipeObject(r, opts = {}) {
  let portions = opts.portions || r.portions;
  const factor = () => portions / r.portions;

  function fmtQty(qty) {
    const v = qty * factor();
    if (v >= 100) return Math.round(v).toString();
    if (v >= 10)  return (Math.round(v * 10) / 10).toString();
    return (Math.round(v * 100) / 100).toString();
  }

  function content() {
    const cat = catById(r.cat);
    return h('div', { class: 'modal-card recipe-modal' },
      h('button', { class: 'modal-close', onclick: closeModal }, '×'),
      h('div', { class: 'modal-head' },
        h('span', { class: 'modal-cat' }, (cat?.name || '').toUpperCase()),
      ),
      h('div', { class: 'modal-actions' },
        h('button', { class: 'btn-ghost', onclick: () => {
          let id = r.id;
          const existing = state.recipes.find(x => x.id === id);
          if (!existing) {
            const newRec = { ...r, id: newId(r.name), source: 'user' };
            state.recipes.push(newRec);
            id = newRec.id;
            persist();
          }
          chooseAndAddToWeek(id, portions || r.portions);
        } }, '+ Au menu'),
        h('button', { class: 'btn-ghost', onclick: () => {
          if (!r.name || !r.name.trim()) { toast('Nom requis pour enregistrer'); return; }
          const rec = { ...r, id: newId(r.name), source: 'user' };
          state.recipes.push(rec);
          persist();
          closeModal();
          render();
          toast('Recette enregistrée');
        } }, 'Enregistrer'),
        h('button', { class: 'btn-ghost icon-only', onclick: () => exportRecipe(r), title: 'Sauvegarder en JSON' }, icon.download()),
      ),
      h('h2', { class: 'modal-title' }, r.name),
      h('hr', { class: 'dashed' }),
      h('div', { class: 'modal-meta-row' },
        h('span', { class: 'meta' }, icon.clock(), ' ', fmtTime(r.time)),
        portionsControl(portions, n => { portions = Math.max(1, Math.min(20, n)); renderModal(); }),
      ),
      h('h3', { class: 'subhead' }, 'Ingrédients'),
      h('ul', { class: 'ing-list' },
        ...r.ingredients.map(ing => h('li', {},
          h('span', {}, ing.name),
          h('span', { class: 'qty' }, `${fmtQty(ing.qty)} ${ing.unit}`),
        )),
      ),
      h('h3', { class: 'subhead' }, 'Préparation'),
      h('ol', { class: 'steps' },
        ...r.steps.map(s => h('li', {}, h('div', { class: 'step-text' }, s))),
      ),
    );
  }

  function renderModal() {
    const m = $('#modal');
    m.replaceChildren();
    m.append(content());
  }

  state.modal = { type: 'recipe-temp' };
  $('#modal').hidden = false;
  renderModal();
}

function portionsControl(val, onChange) {
  return h('span', { class: 'portions' },
    icon.users(),
    h('button', { type: 'button', onclick: () => onChange(val - 1) }, '−'),
    h('span', { class: 'val' }, String(val)),
    h('button', { type: 'button', onclick: () => onChange(val + 1) }, '+'),
    h('span', { class: 'label' }, 'PERS.'),
  );
}

function closeModal() {
  state.modal = null;
  $('#modal').hidden = true;
  $('#modal').replaceChildren();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

// === ACTIONS ===
// Ouvre un petit sélecteur pour choisir le jour et le slot (lunch/dinner), puis ajoute la recette
function chooseAndAddToWeek(recipeId, portions, defaults = {}) {
  const dayDefault = defaults.dayIdx != null ? defaults.dayIdx : 0;
  const slotDefault = defaults.slot || 'dinner';
  const picker = h('div', { class: 'slot-picker', style: 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);z-index:9999' },
    h('div', { class: 'modal-card', style: 'max-width:420px;padding:18px' },
      h('button', { class: 'modal-close', onclick: () => picker.remove() }, '×'),
      h('h3', { class: 'modal-title' }, 'Ajouter au menu'),
      h('div', { class: 'field' },
        h('label', { class: 'field-label' }, 'Jour'),
        h('select', { id: 'slot-day' }, ...DAYS_FR_LONG.map((d, i) => h('option', { value: i, selected: i === dayDefault ? 'selected' : null }, d))),
      ),
      h('div', { class: 'field' },
        h('label', { class: 'field-label' }, 'Repas'),
        h('select', { id: 'slot-type' },
          h('option', { value: 'lunch', selected: slotDefault === 'lunch' ? 'selected' : null }, SLOT_LABEL.lunch),
          h('option', { value: 'dinner', selected: slotDefault === 'dinner' ? 'selected' : null }, SLOT_LABEL.dinner),
        ),
      ),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => picker.remove() }, 'Annuler'),
        h('button', { class: 'btn primary', onclick: () => {
          const day = +picker.querySelector('#slot-day').value;
          const slot = picker.querySelector('#slot-type').value;
          state.week[day][slot] = { recipeId, portions };
          persist(); picker.remove(); closeModal(); render(); toast('Ajouté au menu');
        } }, 'Ajouter'),
      ),
    ),
  );
  document.body.append(picker);
}

function deleteRecipe(id) {
  const r = recipeById(id);
  if (!r) return;
  if (!confirm(`Supprimer "${r.name}" ?`)) return;
  state.recipes = state.recipes.filter(x => x.id !== id);
  for (const day of state.week) {
    if (day.lunch?.recipeId === id) day.lunch = null;
    if (day.dinner?.recipeId === id) day.dinner = null;
  }
  persist();
  closeModal();
  render();
}

function exportRecipe(r) {
  const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${slug(r.name)}.json`; a.click();
  URL.revokeObjectURL(url);
  toast('Recette exportée');
}

// === EDIT MODAL ===
function openEdit(id, prefill) {
  const isNew = !id;
  const r = isNew
    ? (prefill
      ? { id: null, name: prefill.name || '', cat: prefill.cat || 'famille', time: prefill.time || 30, portions: prefill.portions || 4,
          ingredients: (prefill.ingredients || []).map(i => ({...i})),
          steps: [...(prefill.steps || [''])],
          photo: prefill.photo }
      : { id: null, name: '', cat: 'famille', time: 30, portions: 4,
          ingredients: [{ qty: 0, unit: 'g', name: '' }], steps: [''] })
    : { ...recipeById(id),
        ingredients: recipeById(id).ingredients.map(i => ({...i})),
        steps: [...recipeById(id).steps] };

  state.modal = { type: 'edit' };
  $('#modal').hidden = false;

  function renderModal() {
    const m = $('#modal');
    m.replaceChildren();
    m.append(h('div', { class: 'modal-card' },
      h('button', { class: 'modal-close', onclick: closeModal }, '×'),
      h('p', { class: 'kicker' }, h('em', {}, 'éditer')),
      h('h2', { class: 'modal-title' }, isNew ? 'Nouvelle recette' : 'Modifier la recette'),
      h('hr', { class: 'dashed' }),

      field('Nom de la recette', h('input', {
        type: 'text', value: r.name,
        oninput: e => r.name = e.target.value,
      })),

      h('div', { class: 'field' },
        h('label', { class: 'field-label' }, 'Photo (optionnel)'),
        h('label', { class: 'dropzone' },
          icon.upload(), 'Ajouter une photo',
          h('input', { type: 'file', accept: 'image/*', class: 'hidden-input',
            onchange: async e => {
              const f = e.target.files[0];
              if (!f) return;
              r.photo = await fileToDataURL(f);
              renderModal();
            } }),
        ),
        r.photo ? h('img', { src: r.photo, style: 'width:100%;border-radius:3px;margin-top:8px;max-height:200px;object-fit:cover' }) : null,
      ),

      h('div', { class: 'field-grid' },
        field('Catégorie', h('select', {
          onchange: e => r.cat = e.target.value,
        }, ...CATEGORIES.map(c =>
          h('option', { value: c.id, selected: c.id === r.cat ? 'selected' : null }, `${c.emoji} ${c.name}`),
        ))),
        field('Portions', h('input', {
          type: 'number', value: String(r.portions), min: '1',
          oninput: e => r.portions = +e.target.value || 1,
        })),
        field('Temps (min)', h('input', {
          type: 'number', value: String(r.time), min: '1',
          oninput: e => r.time = +e.target.value || 1,
        })),
      ),

      h('div', { class: 'row-head' },
        h('label', { class: 'field-label' }, 'Ingrédients'),
        h('button', { class: 'btn-ghost', onclick: () => { r.ingredients.push({qty: 0, unit: 'g', name: ''}); renderModal(); } }, '+ Ajouter'),
      ),
      ...r.ingredients.map((ing, i) => h('div', { class: 'ing-row' },
        h('input', { type: 'text', value: ing.name, placeholder: 'Nom',
          oninput: e => {
            ing.name = e.target.value;
            const u = defaultUnitFor(e.target.value);
            if (u && UNITS.includes(u)) {
              const sel = e.target.closest('.ing-row').querySelector('select');
              if (sel && sel.value === 'g' && ing.qty === 0) sel.value = u, ing.unit = u;
            }
          },
        }),
        h('input', { type: 'number', value: String(ing.qty), placeholder: '0',
          oninput: e => ing.qty = +e.target.value || 0,
        }),
        h('select', { onchange: e => ing.unit = e.target.value },
          ...UNITS.map(u => h('option', { value: u, selected: u === ing.unit ? 'selected' : null }, u)),
        ),
        h('button', { class: 'row-x', onclick: () => { r.ingredients.splice(i, 1); renderModal(); } }, '×'),
      )),

      h('div', { class: 'row-head' },
        h('label', { class: 'field-label' }, 'Étapes'),
        h('button', { class: 'btn-ghost', onclick: () => { r.steps.push(''); renderModal(); } }, '+ Ajouter'),
      ),
      ...r.steps.map((s, i) => h('div', { class: 'step-row' },
        h('span', { class: 'step-num' }, String(i + 1).padStart(2, '0')),
        h('input', { type: 'text', value: s, placeholder: 'Étape ' + (i + 1),
          oninput: e => r.steps[i] = e.target.value,
        }),
        h('button', { class: 'row-x', onclick: () => { r.steps.splice(i, 1); renderModal(); } }, '×'),
      )),

      h('div', { class: 'form-foot' },
        h('button', { class: 'btn', onclick: closeModal }, 'Annuler'),
        h('button', { class: 'btn primary', onclick: save }, 'Enregistrer'),
      ),
    ));
  }

  function save() {
    if (!r.name.trim()) { toast('Nom requis'); return; }
    r.ingredients = r.ingredients.filter(i => i.name.trim());
    r.steps = r.steps.filter(s => s.trim());
    if (isNew) {
      r.id = newId(r.name);
      r.source = 'user';
      state.recipes.push(r);
    } else {
      const existing = recipeById(id);
      Object.assign(existing, r, { _edited: existing.source === 'seed' ? true : undefined });
    }
    persist();
    closeModal();
    render();
    toast(isNew ? 'Recette créée' : 'Recette enregistrée');
  }

  renderModal();
}

function field(label, input) {
  return h('div', { class: 'field' },
    h('label', { class: 'field-label' }, label),
    input,
  );
}

function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

// === WEEK VIEW (un bloc par jour, 2 repas) ===
function viewWeek() {
  const root = h('section');
  let planned = 0;
  for (const d of state.week) { if (d.lunch) planned++; if (d.dinner) planned++; }

  root.append(
    h('p', { class: 'kicker' }, h('em', {}, 'sept jours, deux repas')),
    h('h2', { class: 'section-title' }, 'La ', h('em', {}, 'semaine')),
    h('p', { class: 'section-meta' }, `${planned} repas planifiés sur 14`),

    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: resetWeek }, icon.refresh(), 'Réinitialiser'),
      h('button', { class: 'btn primary', onclick: openMenuLibre }, icon.sparkle(), '(chercher une recette)'),
    ),

    h('div', { class: 'week-list' },
      ...state.week.map((d, i) => weekDayBlock(d, i)),
    ),
  );

  return root;
}

function weekDayBlock(day, i) {
  return h('div', { class: 'week-day-block' },
    h('div', { class: 'week-day' },
      h('span', { class: 'num' }, `Jour ${i + 1}`),
      h('span', { class: 'name' }, DAYS_FR[i]),
    ),
    h('div', { class: 'week-meals' },
      weekMeal(day, i, 'lunch'),
      h('div', { class: 'week-meal-sep' }),
      weekMeal(day, i, 'dinner'),
    ),
  );
}

function weekMeal(day, i, slot) {
  const meal = day[slot];
  const label = SLOT_LABEL[slot];
  const cell = h('div', { class: 'week-meal' });

  if (!meal) {
    cell.append(
      h('div', { class: 'week-meal-cat' }, label.toUpperCase()),
      h('button', { class: 'empty-slot',
        onclick: () => openPicker(i, slot),
      }, '+ choisir un plat…'),
    );
  } else {
    const r = recipeById(meal.recipeId);
    if (!r) {
      cell.append(
        h('div', { class: 'week-meal-cat' }, label.toUpperCase()),
        h('div', { class: 'empty-slot muted' }, 'Recette supprimée'),
      );
    } else {
      const cat = catById(r.cat);
      cell.append(
        h('div', { class: 'week-meal-cat' }, `${label.toUpperCase()} · ${(cat?.name || '').toUpperCase()}`),
        h('h4', { class: 'week-meal-name', onclick: () => openRecipe(r.id, { portions: meal.portions }) }, r.name),
        h('div', { class: 'week-meal-time' }, fmtTime(r.time)),
        h('div', { class: 'week-meal-actions' },
          portionsControl(meal.portions, n => {
            meal.portions = Math.max(1, Math.min(20, n));
            persist(); render();
          }),
          h('button', { class: 'btn-ghost', onclick: () => openPicker(i, slot) }, 'Changer'),
          h('button', { class: 'btn-ghost icon-only', onclick: () => clearSlot(i, slot), title: 'Retirer' }, '×'),
        ),
      );
    }
  }
  return cell;
}

function clearSlot(dayIdx, slot) {
  state.week[dayIdx][slot] = null;
  persist(); render();
}

function resetWeek() {
  if (!confirm('Vider toute la semaine ?')) return;
  state.week = state.week.map(d => ({ ...d, lunch: null, dinner: null }));
  persist(); render();
  toast('Semaine réinitialisée');
}

// === PICKER (input séparé du list refresh — corrige le bug d'écriture) ===
function openPicker(dayIdx, slot) {
  state.modal = { type: 'picker' };
  $('#modal').hidden = false;

  let q = '';
  const listEl = h('div', { class: 'picker-list' });

  function refreshList() {
    const lq = q.toLowerCase();
    const list = state.recipes.filter(r => !lq ||
      r.name.toLowerCase().includes(lq) ||
      catById(r.cat)?.name.toLowerCase().includes(lq));
    listEl.replaceChildren();
    if (list.length === 0) {
      listEl.append(h('p', { class: 'empty' }, 'Aucune recette trouvée.'));
      return;
    }
    list.forEach(r => listEl.append(
      h('button', { class: 'picker-item', onclick: () => {
        state.week[dayIdx][slot] = { recipeId: r.id, portions: r.portions };
        persist(); closeModal(); render(); toast('Plat ajouté');
      } },
        h('span', {}, r.name),
        h('span', { class: 'cat' }, catById(r.cat)?.name || ''),
      ),
    ));
  }
  refreshList();

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, `${DAYS_FR_LONG[dayIdx]} · ${SLOT_LABEL[slot].toLowerCase()}`)),
    h('h2', { class: 'modal-title' }, 'Choisir ', h('em', {}, 'un plat')),

    h('div', { class: 'search' },
      h('span', { class: 'search-icon' }, icon.search()),
      h('input', { type: 'text', placeholder: 'Filtrer…',
        oninput: e => { q = e.target.value; refreshList(); } }),
    ),

    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: () => { closeModal(); openMenuLibre({ dayIdx, slot }); } },
        icon.sparkle(), '(chercher une recette)'),
    ),

    listEl,
  ));
}

// === SHOPPING ===
function computeShopping() {
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
      const factor = m.portions / r.portions;
      for (const ing of r.ingredients) {
        addItem(ing.name, ing.qty * factor, ing.unit);
      }
    }
  }

  for (const it of state.shopping.manual) addItem(it.name, it.qty, it.unit, it.aisle);

  return [...items.values()];
}

function viewShopping() {
  const items = computeShopping();
  const root = h('section');

  const byAisle = new Map();
  for (const a of AISLES) byAisle.set(a.id, []);
  for (const it of items) byAisle.get(it.aisle)?.push(it);
  const usedAisles = AISLES.filter(a => byAisle.get(a.id).length > 0);

  root.append(
    h('p', { class: 'kicker' }, h('em', {}, "liste d'achat")),
    h('h2', { class: 'section-title' }, 'Mes ', h('em', {}, 'courses')),
    h('p', { class: 'section-meta' }, `${items.length} ingrédients · ${usedAisles.length} rayons`),

    h('div', { class: 'btn-row' },
      h('button', { class: 'btn dark', onclick: exportPDF }, icon.download(), 'Exporter PDF'),
      h('button', { class: 'btn', onclick: resetShopping }, icon.refresh(), 'Réinitialiser'),
    ),

    h('button', { class: 'add-bar', onclick: openManualAdd }, '+ ajouter un ingrédient'),

    items.length === 0
      ? h('p', { class: 'empty' }, 'Aucun ingrédient. Planifiez des repas pour générer la liste.')
      : h('div', {}, ...usedAisles.map(a => aisleBlock(a, byAisle.get(a.id)))),
  );

  return root;
}

function aisleBlock(aisle, items) {
  return h('section', { class: 'aisle' },
    h('div', { class: 'aisle-head' },
      h('h3', { class: 'aisle-title' }, aisle.emoji, ' ', aisle.name),
      h('span', { class: 'aisle-count' }, String(items.length)),
    ),
    h('div', { class: 'aisle-grid' },
      ...items.map(it => h('div', { class: 'aisle-item' },
        h('span', { class: 'emoji' }, it.emoji),
        h('div', { class: 'name' }, it.name),
        h('div', { class: 'qty-pill' }, `${formatQty(it.qty)} ${it.unit}`),
        h('button', { class: 'aisle-edit', title: 'Changer le rayon',
          onclick: () => openAisleChooser(it) }, '⇄'),
        h('button', { class: 'x', onclick: () => removeShoppingItem(it.key), title: 'Retirer' }, '×'),
      )),
    ),
  );
}

function formatQty(q) {
  if (q >= 100) return Math.round(q).toString();
  if (q >= 10) return (Math.round(q * 10) / 10).toString();
  return (Math.round(q * 100) / 100).toString();
}

function removeShoppingItem(key) {
  if (!state.shopping.removed.includes(key)) state.shopping.removed.push(key);
  state.shopping.manual = state.shopping.manual.filter(it =>
    `${normalizeIngredient(it.name)}|${it.unit}` !== key);
  persist(); render();
}

function resetShopping() {
  if (!confirm('Vider la liste de courses ?')) return;
  state.shopping = { manual: [], removed: [], checked: [] };
  persist(); render();
  toast('Liste vidée');
}

// Mémoriser un changement de rayon pour un ingrédient existant
function openAisleChooser(item) {
  state.modal = { type: 'aisle' };
  $('#modal').hidden = false;
  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, 'rayon')),
    h('h2', { class: 'modal-title' }, item.name),
    h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-size:16px;' },
      'Choisissez le rayon. Tablée mémorisera votre préférence.'),
    h('div', { class: 'aisle-picker' },
      ...AISLES.map(a => h('button', {
        class: 'aisle-chip', 'data-active': a.id === item.aisle ? 'true' : 'false',
        onclick: () => {
          setUserAisle(item.name, a.id);
          // si c'est un manual, on update son aisle aussi
          for (const m of state.shopping.manual) {
            if (normalizeIngredient(m.name) === normalizeIngredient(item.name)) m.aisle = a.id;
          }
          persist(); closeModal(); render(); toast('Rayon mémorisé');
        },
      },
        h('span', {}, a.emoji),
        h('span', {}, a.name),
      )),
    ),
  ));
}

function openManualAdd() {
  state.modal = { type: 'manual' };
  $('#modal').hidden = false;

  // pool de suggestions = clés DB + noms d'ingrédients utilisés (recettes & manual)
  const seenNames = new Map(); // norm -> display
  for (const k of Object.keys(INGREDIENT_DB)) {
    if (!seenNames.has(k)) seenNames.set(k, cap(k));
  }
  for (const r of state.recipes) for (const ing of r.ingredients) {
    const n = normalizeIngredient(ing.name);
    if (!seenNames.has(n)) seenNames.set(n, ing.name);
  }
  for (const it of state.shopping.manual) {
    const n = normalizeIngredient(it.name);
    if (!seenNames.has(n)) seenNames.set(n, it.name);
  }

  let name = '', qty = 1, unit = 'pc', chosenAisle = null;

  // input et select restent stables (pas recréés sur frappe)
  const inputEl = h('input', { type: 'text', placeholder: 'Ex. Tomate cerise',
    oninput: e => { name = e.target.value; refreshSuggestions(); refreshAisle(); } });

  const sugEl = h('div', { class: 'autocomplete' });
  const aisleEl = h('div', { class: 'aisle-suggest' });

  const unitSelect = h('select', { onchange: e => unit = e.target.value },
    ...UNITS.map(u => h('option', { value: u, selected: u === 'pc' ? 'selected' : null }, u))
  );
  const qtyInput = h('input', { type: 'number', value: '1', oninput: e => qty = +e.target.value || 0 });

  function refreshSuggestions() {
    sugEl.replaceChildren();
    const q = normalizeIngredient(name);
    if (!q || q.length < 1) return;
    const matches = [...seenNames.entries()]
      .filter(([norm]) => norm.includes(q))
      .slice(0, 6);
    if (matches.length === 0) return;
    matches.forEach(([norm, display]) => sugEl.append(
      h('button', { class: 'autocomplete-item', onclick: () => {
        name = display;
        inputEl.value = display;
        const u = INGREDIENT_DB[norm]?.unit;
        if (u && UNITS.includes(u)) {
          unit = u; unitSelect.value = u;
        }
        chosenAisle = null;
        refreshSuggestions();
        refreshAisle();
        inputEl.focus();
      } },
        h('span', { class: 'emoji' }, INGREDIENT_DB[norm]?.emoji || aisleEmojiOf(aisleFor(display))),
        h('span', {}, display),
        h('span', { class: 'aisle-tag muted' }, AISLES.find(a => a.id === aisleForUser(display))?.name || ''),
      ),
    ));
  }

  function refreshAisle() {
    aisleEl.replaceChildren();
    if (!name.trim()) return;
    const suggested = aisleForUser(name);
    aisleEl.append(
      h('label', { class: 'field-label' }, 'Rayon'),
      h('div', { class: 'aisle-picker' },
        ...AISLES.map(a => h('button', {
          class: 'aisle-chip',
          'data-active': (chosenAisle || suggested) === a.id ? 'true' : 'false',
          onclick: () => { chosenAisle = a.id; refreshAisle(); },
        },
          h('span', {}, a.emoji),
          h('span', {}, a.name),
        )),
      ),
    );
  }

  function add() {
    if (!name.trim()) return;
    const aisle = chosenAisle || aisleForUser(name);
    if (chosenAisle) setUserAisle(name, chosenAisle);
    state.shopping.manual.push({ name: name.trim(), qty, unit, aisle });
    persist(); closeModal(); render();
    toast('Ajouté');
  }

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, 'ajout libre')),
    h('h2', { class: 'modal-title' }, 'Ajouter un ', h('em', {}, 'ingrédient')),

    field('Nom', inputEl),
    sugEl,

    h('div', { class: 'field-grid' },
      field('Quantité', qtyInput),
      field('Unité', unitSelect),
    ),

    aisleEl,

    h('div', { class: 'form-foot' },
      h('button', { class: 'btn', onclick: closeModal }, 'Annuler'),
      h('button', { class: 'btn primary', onclick: add }, 'Ajouter'),
    ),
  ));
}

function exportPDF() {
  const items = computeShopping();
  const byAisle = new Map();
  for (const a of AISLES) byAisle.set(a.id, []);
  for (const it of items) byAisle.get(it.aisle)?.push(it);
  const usedAisles = AISLES.filter(a => byAisle.get(a.id).length > 0);

  const w = window.open('', '_blank');
  if (!w) { toast('Impression bloquée'); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Mes courses · Tablée</title>
  <style>
    body{font-family:Georgia,serif;color:#1c2a1d;max-width:600px;margin:32px auto;padding:0 24px;}
    h1{font-size:36px;margin:0 0 4px;font-weight:400;}
    .meta{color:#8a9876;font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:24px;}
    h2{font-size:20px;border-bottom:1px solid #c44a2a;padding-bottom:6px;margin-top:24px;}
    ul{list-style:none;padding:0;margin:0;}
    li{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #ccc;}
    .qty{color:#c44a2a;font-family:monospace;}
    @media print{body{margin:12mm;}}
  </style></head><body>
  <h1>Mes courses</h1>
  <div class="meta">${items.length} ingrédients · ${usedAisles.length} rayons · Tablée</div>
  ${usedAisles.map(a => `<h2>${a.emoji} ${a.name}</h2><ul>${
    byAisle.get(a.id).map(it => `<li><span>${it.name}</span><span class="qty">${formatQty(it.qty)} ${it.unit}</span></li>`).join('')
  }</ul>`).join('')}
  <script>window.onload=()=>setTimeout(()=>window.print(),200)</script>
  </body></html>`);
  w.document.close();
}

// === MENU LIBRE (local-first) ===
function localMatch(input, recipes, max = 3) {
  const tokens = normalizeIngredient(input).split(' ')
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
  if (tokens.length === 0) return [];
  const scored = recipes.map(r => {
    const norm = normalizeIngredient(r.name + ' ' + r.ingredients.map(i => i.name).join(' '));
    let score = 0;
    for (const t of tokens) if (norm.includes(t)) score++;
    return { r, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map(x => x.r);
}

function detectPortions(text) {
  const m = text.match(/(\d+)\s*(?:pers|personne)/i);
  return m ? +m[1] : null;
}

function openMenuLibre(_opts = {}) {
  state.modal = { type: 'menulibre' };
  $('#modal').hidden = false;

  let input = '';
  let portions = null;
  let busy = false;
  let llmResult = null;
  let error = null;

  // input statique : créé une fois, ne sera pas recréé sur frappe
  const inputEl = h('input', {
    type: 'text',
    placeholder: 'bœuf haricots pommes de terre pour 4',
    oninput: e => {
      input = e.target.value;
      portions = detectPortions(input);
      refresh();
    },
  });

  const dynEl = h('div', { class: 'menu-libre-dyn' });

  function refresh() {
    dynEl.replaceChildren();

    if (!input.trim()) {
      dynEl.append(h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-style:italic;font-size:16px;margin-top:8px' },
        'Ex. : "bœuf haricots pommes de terre pour 4". Tablée cherche dans la bibliothèque, et n\'appelle l\'IA que si vous lui demandez.'));
      return;
    }

    const matches = localMatch(input, state.recipes, 3);

    if (matches.length > 0) {
      dynEl.append(h('p', { class: 'kicker', style: 'margin-top:14px' }, h('em', {},
        `${matches.length} ${matches.length > 1 ? 'suggestions' : 'suggestion'} de votre bibliothèque`)));
      matches.forEach(r => dynEl.append(matchCard(r, false)));
    } else if (!llmResult) {
      dynEl.append(h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-style:italic;font-size:16px;margin-top:14px' },
        'Aucune correspondance dans votre bibliothèque.'));
    }

    // Actions: appeler l'IA, créer manuellement
    dynEl.append(h('div', { class: 'btn-row', style: 'margin-top:14px;flex-wrap:wrap' },
      hasApiKey()
        ? h('button', { class: 'btn', disabled: busy ? 'disabled' : null, onclick: callLlm },
            icon.sparkle(),
            busy ? 'Recherche IA…'
                 : (matches.length ? 'Autres suggestions (consomme API)' : 'Générer une recette (consomme API)'))
        : null,
      h('button', { class: 'btn', onclick: () => {
          // créer rapidement avec ce qui a été tapé
          closeModal();
          openEdit(null, { name: cap(input), portions: portions || 4 });
        } }, icon.plus(), 'Créer manuellement'),
    ));

    if (busy) dynEl.append(h('p', { class: 'muted', style: 'margin-top:10px' }, '✨ Recherche IA en cours…'));
    if (error) dynEl.append(h('p', { style: 'color:var(--terra);margin-top:10px' }, error));
    if (llmResult) {
      dynEl.append(h('p', { class: 'kicker', style: 'margin-top:14px' }, h('em', {},
        llmResult.matchedExisting ? "match IA dans votre bibliothèque" : 'recette générée par l\'IA')));
      dynEl.append(matchCard(llmResult, true));
    }

    if (!hasApiKey()) {
      dynEl.append(h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-size:14px;margin-top:14px' },
        'Pour générer une recette via l\'IA, ',
        h('a', { href: '#', onclick: e => { e.preventDefault(); closeModal(); openSettings(); } }, 'configurez votre clé API'),
        '.'));
    }
  }

  function matchCard(r, fromLLM) {
    const cat = catById(r.cat);
    const finalPortions = portions || r.portions;
    return h('div', { class: 'match-card' },
      h('div', { class: 'card-head' },
        h('span', { class: 'card-cat' }, (cat?.name || '').toUpperCase()),
        fromLLM ? h('span', { class: 'card-no' }, '✨ IA') : null,
      ),
      h('h3', { class: 'card-title', style: 'font-size:22px' }, r.name),
      h('p', { class: 'section-meta' },
        `${r.time} min · ${finalPortions} pers · ${r.ingredients.length} ingrédients`),
      h('div', { class: 'btn-row', style: 'flex-wrap:wrap' },
        h('button', { class: 'btn', onclick: () => {
          closeModal();
          if (r.id && state.recipes.find(x => x.id === r.id)) openRecipe(r.id, { portions: finalPortions });
          else openRecipeObject(r, { portions: finalPortions });
        } }, 'Voir'),
        fromLLM ? h('button', { class: 'btn', onclick: () => { busy = true; refresh(); callLlm({ skipCache: true }); } }, 'Générer une autre') : null,
        h('button', { class: 'btn primary', onclick: () => {
          let id = r.id;
          const existing = state.recipes.find(x => x.id === id);
          if (!existing) {
            const newRec = { ...r, id: newId(r.name), source: 'user' };
            delete newRec.matchedExisting;
            state.recipes.push(newRec);
            id = newRec.id;
            persist();
          }
          chooseAndAddToWeek(id, finalPortions);
        } }, '+ Au menu'),
      ),
    );
  }

  async function callLlm(opts = {}) {
    if (!input.trim() || !hasApiKey()) return;
    busy = true; error = null; llmResult = null; refresh();
    try {
      llmResult = await llmMatchOrCreate(input, state.recipes, opts);
      try { localStorage.setItem('tablee.lastAI', JSON.stringify(llmResult)); } catch (_) {}
    } catch (err) {
      error = err.message || 'Erreur IA';
    } finally {
      busy = false; refresh();
    }
  }

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, '(chercher une recette)')),
    h('h2', { class: 'modal-title' }, 'Écrire ', h('em', {}, 'un plat')),

    field('Description du plat', inputEl),

    dynEl,

    h('div', { class: 'form-foot' },
      h('button', { class: 'btn', onclick: closeModal }, 'Fermer'),
    ),
  ));
  refresh();
}

// === IMPORT ===
function openImport() {
  state.modal = { type: 'import' };
  $('#modal').hidden = false;

  let busy = false;
  let extracted = null;
  let error = null;

  const dynEl = h('div');

  function refresh() {
    dynEl.replaceChildren();
    if (!hasApiKey()) {
      dynEl.append(h('p', { class: 'muted' }, 'Clé API requise. ',
        h('a', { href: '#', onclick: e => { e.preventDefault(); closeModal(); openSettings(); } },
          'Configurer →')));
      return;
    }
    if (busy) dynEl.append(h('p', { class: 'muted', style: 'margin-top:14px' }, '✨ Lecture du fichier…'));
    if (error) dynEl.append(h('p', { style: 'color:var(--terra);margin-top:14px' }, error));
    if (extracted) dynEl.append(renderPreview(extracted));
  }

  function renderPreview(r) {
    return h('div', { class: 'match-card' },
      h('p', { class: 'kicker' }, h('em', {}, 'aperçu')),
      h('h3', { style: 'font-family:var(--serif);font-size:24px;margin:4px 0 10px' }, r.name),
      h('p', { class: 'section-meta' },
        `${r.time} min · ${r.portions} pers · ${r.ingredients.length} ingrédients · ${r.steps.length} étapes`),
      h('div', { class: 'btn-row', style: 'flex-wrap:wrap' },
        h('button', { class: 'btn', onclick: () => { closeModal(); openEdit(null, r); } },
          'Vérifier puis enregistrer'),
        h('button', { class: 'btn primary', onclick: () => {
          const rec = { ...r, id: newId(r.name), source: 'user' };
          state.recipes.push(rec);
          persist(); closeModal(); render(); toast('Recette importée');
        } }, 'Enregistrer tel quel'),
      ),
    );
  }

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, 'importer')),
    h('h2', { class: 'modal-title' }, 'Importer ', h('em', {}, 'PDF / Image')),
    h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-style:italic;font-size:16px;' },
      'Photo ou PDF d\'une recette. Tablée extrait titre, portions, temps, ingrédients et étapes.'),

    h('label', { class: 'dropzone', style: 'padding:32px' },
      icon.upload(), 'Choisir un fichier (image ou PDF)',
      h('input', { type: 'file', accept: 'image/*,application/pdf', class: 'hidden-input',
        onchange: async e => {
          const f = e.target.files[0];
          if (!f) return;
          busy = true; error = null; extracted = null; refresh();
          try {
            extracted = await llmExtractFromFile(f);
          } catch (err) {
            error = err.message || 'Erreur extraction';
          } finally {
            busy = false; refresh();
          }
        }, disabled: !hasApiKey() ? 'disabled' : null }),
    ),

    dynEl,

    h('div', { class: 'form-foot' },
      h('button', { class: 'btn', onclick: closeModal }, 'Fermer'),
    ),
  ));
  refresh();
}

// === SETTINGS (Gemini) ===
function openSettings() {
  state.modal = { type: 'settings' };
  $('#modal').hidden = false;
  let key = getApiKey() || '';

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, 'réglages')),
    h('h2', { class: 'modal-title' }, h('em', {}, 'Tablée')),
    h('hr', { class: 'dashed' }),

    h('p', { style: 'font-family:var(--serif-body);font-size:17px;line-height:1.5' },
      'Pour le ', h('strong', {}, 'menu libre'), ' et l\'', h('strong', {}, 'import PDF/image'),
      ', Tablée s\'appuie sur ', h('strong', {}, 'Gemini'),
      '. Votre clé reste stockée localement dans ce navigateur, jamais transmise ailleurs que vers ',
      h('code', {}, 'generativelanguage.googleapis.com'), '.'),

    h('div', { class: 'callout' },
      h('strong', {}, '⚠ Sécurité de votre clé. '),
      'La clé est en clair dans ce navigateur (localStorage). ',
      'Pour limiter les risques, créez-en une ', h('strong', {}, 'dédiée à Tablée'),
      ' avec un ', h('strong', {}, 'quota quotidien'),
      ' et, si vous publiez l\'app, une ',
      h('strong', {}, 'restriction de référent HTTP'), ' dans la console Google Cloud.',
    ),

    field('Clé API Gemini', h('input', {
      type: 'password', value: key, placeholder: 'AIzaSy…', autocomplete: 'off',
      oninput: e => key = e.target.value,
    })),
    h('p', { style: 'font-size:12px;color:var(--olive);margin-top:-8px' },
      'Obtenir une clé : ',
      h('a', { href: 'https://aistudio.google.com/apikey', target: '_blank', rel: 'noopener noreferrer' },
        'aistudio.google.com/apikey')),

    h('div', { class: 'form-foot' },
      h('button', { class: 'btn', onclick: () => { setApiKey(null); closeModal(); toast('Clé supprimée'); } }, 'Supprimer'),
      h('button', { class: 'btn primary', onclick: () => { setApiKey(key.trim() || null); closeModal(); toast('Clé enregistrée'); } }, 'Enregistrer'),
    ),

    h('hr', { class: 'dashed' }),
    h('p', { class: 'kicker' }, h('em', {}, 'mes données')),
    h('p', { style: 'font-family:var(--serif-body);font-size:15px;line-height:1.5;margin-top:4px' },
      'Vos recettes, semaine et liste de courses ne quittent pas ce navigateur. ',
      'Exportez-les pour les sauvegarder ou changer d\'appareil.'),

    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: exportData }, icon.download(), 'Exporter mes données'),
      h('label', { class: 'btn' },
        icon.upload(), 'Importer une sauvegarde',
        h('input', {
          type: 'file', accept: 'application/json', class: 'hidden-input',
          onchange: async e => { const f = e.target.files[0]; if (f) await importData(f); },
        }),
      ),
    ),
  ));
}

function exportData() {
  try {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      recipes: state.recipes.filter(r => r.source !== 'seed' || r._edited),
      week: state.week,
      shopping: state.shopping,
      userAisles: userAisleMap,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tablee-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Sauvegarde téléchargée');
  } catch (e) {
    console.error(e);
    toast('Export impossible');
  }
}

async function importData(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') throw new Error('Format invalide');
    if (!confirm('Importer cette sauvegarde ? Vos recettes / semaine / courses actuelles seront remplacées.')) return;
    if (Array.isArray(data.recipes)) {
      const seedIds = new Set(SEED_RECIPES.map(r => r.id));
      const userRecipes = data.recipes.filter(r => r && r.id && !seedIds.has(r.id));
      state.recipes = [...SEED_RECIPES.map(r => ({ ...r, source: 'seed' })), ...userRecipes];
    }
    if (data.week && Array.isArray(data.week) && data.week.length === 7) state.week = data.week;
    if (data.shopping && typeof data.shopping === 'object') state.shopping = data.shopping;
    if (data.userAisles && typeof data.userAisles === 'object') {
      userAisleMap = data.userAisles;
      localStorage.setItem(USER_AISLES_KEY, JSON.stringify(userAisleMap));
    }
    persist();
    closeModal();
    render();
    toast('Sauvegarde importée');
  } catch (e) {
    console.error(e);
    toast('Import impossible : fichier invalide');
  }
}

// === MAIN RENDER ===
function render() {
  setMastheadDay();
  const app = $('#app');
  app.replaceChildren();
  if (state.view === 'library') app.append(viewLibrary());
  else if (state.view === 'week') app.append(viewWeek());
  else if (state.view === 'shopping') app.append(viewShopping());
}

render();

window.tablee = { state, render, persist };
