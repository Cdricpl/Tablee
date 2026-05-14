// Les trois vues principales : Bibliothèque, Semaine, Courses.
import {
  state, persist, recipeById, catById,
  DAYS_FR, SLOT_LABEL, computeShopping,
} from './state.js';
import { h, icon } from './dom.js';
import { fmtTime, formatQty } from './pure.js';
import { AISLES, CATEGORIES } from './data.js';
import {
  openRecipe, openEdit, openImport, openMenuLibre, openSettings,
  openPicker, openManualAdd, openAisleChooser, portionsControl,
} from './modals.js';
import {
  resetWeek, resetShopping, clearSlot, removeShoppingItem, exportPDF,
} from './actions.js';
import { render } from './render.js';

// === LIBRARY VIEW (catégorie-first) ===
export function viewLibrary() {
  const root = h('section');

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

// === WEEK VIEW ===
export function viewWeek() {
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

// === SHOPPING VIEW ===
export function viewShopping() {
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
