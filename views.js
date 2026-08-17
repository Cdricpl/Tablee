// Les vues de l'app : accueil (Bibliothèque, Semaine, Courses) + les vues
// transverses de la barre du bas (Favoris, À tester, Recherche, Plus).
import {
  state, recipeById, catById,
  DAYS_FR, SLOT_LABEL, computeShopping,
} from './state.js';
import { h, icon } from './dom.js';
import { fmtTime, formatQty } from './pure.js';
import { AISLES, CATEGORIES } from './data.js';
import {
  openRecipe, openEdit, openImport, openMenuLibre, openSettings,
  openPicker, openManualAdd, openAisleChooser, openDayMenu,
} from './modals.js';
import {
  resetWeek, resetShopping, clearSlot, removeShoppingItem, exportPDF,
  toggleFavorite, isFavorite,
  isChecked, toggleChecked, toggleCheckAll,
  exportData, importData,
} from './actions.js';
import { setView } from './render.js';

// En-tête commun à toutes les vues : surtitre, titre en deux temps, compteur.
function pageHead(kicker, titleStart, titleEm, meta) {
  return [
    h('p', { class: 'kicker' }, h('em', {}, kicker)),
    h('h2', { class: 'section-title' }, titleStart, h('em', {}, titleEm)),
    meta ? h('p', { class: 'section-meta' }, meta) : null,
  ];
}

const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

// === CARTE RECETTE ===
function recipeCard(r) {
  const cat = catById(r.cat);
  const fav = isFavorite(r.id);
  return h('article', { class: 'card', onclick: () => openRecipe(r.id) },
    h('div', { class: 'card-head' },
      h('span', { class: 'card-cat' }, (cat?.name || '').toUpperCase()),
      h('button', {
        class: 'card-fav',
        'data-on': fav ? 'true' : 'false',
        title: fav ? 'Retirer des favoris' : 'Ajouter aux favoris',
        'aria-label': fav ? 'Retirer des favoris' : 'Ajouter aux favoris',
        onclick: e => { e.stopPropagation(); toggleFavorite(r.id); },
      }, fav ? icon.heartFull() : icon.heart()),
    ),
    h('h3', { class: 'card-title' }, r.name),
    r.reconstructed ? h('span', { class: 'card-flag' }, 'à vérifier') : null,
    h('hr', { class: 'dashed' }),
    h('div', { class: 'card-foot' },
      h('span', { class: 'meta' }, icon.clock(), fmtTime(r.time)),
      h('span', { class: 'meta' }, icon.users(), String(r.portions)),
      h('span', { class: 'ingredients-count' }, `${r.ingredients.length} ingrédients`),
    ),
  );
}

const recipeGrid = list => h('div', { class: 'recipe-grid' }, ...list.map(recipeCard));

function emptyState(title, sub, art) {
  return h('div', { class: 'empty-state' },
    art || null,
    h('p', { class: 'empty-title' }, title),
    sub ? h('p', { class: 'empty-sub' }, h('em', {}, sub)) : null,
  );
}

// === BIBLIOTHÈQUE ===
export function viewLibrary() {
  const root = h('section');

  const counts = {};
  for (const c of CATEGORIES) counts[c.id] = state.recipes.filter(r => r.cat === c.id).length;

  const resultsEl = h('div', { id: 'recipeResults' });

  function clearFilters() {
    state.filter.cat = null;
    state.filter.q = '';
    const inp = document.querySelector('.search input');
    if (inp) inp.value = '';
    refreshCatCards();
    refreshResults();
  }

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
    if (!q && !cat) return;
    if (visible.length === 0) {
      resultsEl.append(h('p', { class: 'empty' },
        q ? `Aucun résultat pour « ${q} ».` : 'Aucune recette dans cette catégorie.'));
      return;
    }
    resultsEl.append(
      h('div', { class: 'results-head' },
        h('p', { class: 'section-meta' }, plural(visible.length, 'recette', 'recettes')),
        h('button', { class: 'btn-ghost', onclick: clearFilters }, 'Effacer'),
      ),
      recipeGrid(visible),
    );
  }

  function refreshCatCards() {
    document.querySelectorAll('.cat-card').forEach(b => {
      b.dataset.active = (state.filter.cat === b.dataset.cat) ? 'true' : 'false';
    });
  }

  root.append(
    ...pageHead('toutes vos recettes', 'Mes ', 'recettes',
      `${state.recipes.length} recettes au total`),

    h('div', { class: 'search' },
      h('span', { class: 'search-icon' }, icon.search()),
      h('input', {
        type: 'text',
        placeholder: 'Rechercher une recette…',
        value: state.filter.q,
        oninput: e => { state.filter.q = e.target.value; refreshResults(); },
      }),
      h('button', {
        class: 'search-filter', title: 'Recherche avancée',
        'aria-label': 'Recherche avancée',
        onclick: () => setView('search'),
      }, icon.sliders()),
    ),

    h('button', { class: 'btn primary block', onclick: () => openEdit(null) },
      icon.plus(), 'Nouvelle recette'),

    h('div', { class: 'cat-grid' },
      ...CATEGORIES.map(c => h('button', {
        class: 'cat-card',
        'data-cat': c.id,
        'data-active': state.filter.cat === c.id ? 'true' : 'false',
        onclick: () => {
          state.filter.cat = (state.filter.cat === c.id ? null : c.id);
          state.filter.q = '';
          const inp = document.querySelector('.search input');
          if (inp) inp.value = '';
          refreshCatCards();
          refreshResults();
          if (state.filter.cat) {
            setTimeout(() => resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
          }
        },
      },
        // Photo optionnelle : si img/cat-<id>.jpg est absent, l'image se retire
        // elle-même et la tuile dégradée + emoji reste visible dessous.
        h('span', { class: 'cat-photo', 'data-cat': c.id },
          h('img', {
            src: `img/cat-${c.id}.jpg`, alt: '', loading: 'lazy',
            onerror: e => e.target.remove(),
          }),
          h('span', { class: 'cat-photo-emoji' }, c.emoji),
        ),
        h('span', { class: 'cat-body' },
          h('span', { class: 'cat-name' }, c.name),
          h('span', { class: 'cat-count' }, plural(counts[c.id], 'recette', 'recettes')),
        ),
      )),
    ),

    resultsEl,
  );

  refreshResults();
  return root;
}

// === SEMAINE ===
export function viewWeek() {
  const root = h('section');
  let planned = 0;
  for (const d of state.week) { if (d.lunch) planned++; if (d.dinner) planned++; }

  root.append(
    ...pageHead('sept jours, deux repas', 'La ', 'semaine',
      `${planned} repas planifiés sur 14`),

    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: resetWeek }, icon.refresh(), 'Réinitialiser'),
      h('button', { class: 'btn primary', onclick: () => openMenuLibre() },
        icon.plus(), 'Choisir une recette'),
    ),

    h('div', { class: 'week-list' }, ...state.week.map((d, i) => weekDayRow(d, i))),
  );

  return root;
}

function weekDayRow(day, i) {
  return h('div', { class: 'week-row' },
    h('div', { class: 'week-daycell' },
      h('span', { class: 'week-dayname' }, DAYS_FR[i]),
      h('span', { class: 'week-daynum' }, `Jour ${i + 1}`),
    ),
    h('span', { class: 'week-sun' }, icon.sun()),
    weekSlot(day, i, 'lunch'),
    weekSlot(day, i, 'dinner'),
    h('button', {
      class: 'week-more', title: 'Options du jour',
      'aria-label': `Options du ${DAYS_FR[i]}`,
      onclick: () => openDayMenu(i),
    }, icon.dots()),
  );
}

function weekSlot(day, i, slot) {
  const meal = day[slot];
  const r = meal ? recipeById(meal.recipeId) : null;
  const cell = h('div', { class: 'week-slot' },
    h('span', { class: 'week-slot-label' }, SLOT_LABEL[slot].toUpperCase()),
  );

  if (!meal) {
    cell.append(h('button', { class: 'week-slot-empty', onclick: () => openPicker(i, slot) },
      '+ choisir un plat'));
  } else if (!r) {
    cell.append(h('button', { class: 'week-slot-empty', onclick: () => clearSlot(i, slot) },
      'Recette supprimée'));
  } else {
    cell.append(
      h('button', {
        class: 'week-slot-name',
        onclick: () => openRecipe(r.id, { portions: meal.portions }),
      }, r.name),
      h('span', { class: 'week-slot-meta' },
        `${fmtTime(r.time)} · ${meal.portions || r.portions} pers`),
    );
  }
  return cell;
}

// === COURSES ===
export function viewShopping() {
  const items = computeShopping();
  const root = h('section');

  const byAisle = new Map();
  for (const a of AISLES) byAisle.set(a.id, []);
  for (const it of items) byAisle.get(it.aisle)?.push(it);
  const usedAisles = AISLES.filter(a => byAisle.get(a.id).length > 0);
  const done = items.filter(it => isChecked(it.key)).length;

  root.append(
    ...pageHead('liste d\'achat', 'Mes ', 'courses',
      `${items.length} ingrédients · ${usedAisles.length} rayons`),

    h('div', { class: 'btn-row' },
      h('button', { class: 'btn dark', onclick: exportPDF }, icon.download(), 'Exporter PDF'),
      h('button', { class: 'btn', onclick: resetShopping }, icon.refresh(), 'Réinitialiser'),
    ),

    h('button', { class: 'btn block', onclick: openManualAdd },
      icon.plus(), 'Ajouter un ingrédient'),

    items.length === 0
      ? emptyState('Aucun ingrédient.', 'Planifiez des repas pour générer la liste.', icon.basket())
      : h('div', { class: 'aisle-wrap' }, ...usedAisles.map(a => aisleBlock(a, byAisle.get(a.id)))),

    items.length > 0
      ? h('div', { class: 'shop-bar' },
          h('span', { class: 'shop-bar-count' },
            h('strong', {}, `${done} / ${items.length}`),
            h('span', {}, 'ingrédients')),
          h('button', { class: 'shop-bar-btn', onclick: toggleCheckAll },
            icon.checkCircle(),
            done === items.length ? 'Tout décocher' : 'Tout cocher'),
        )
      : null,
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
      ...items.map(it => {
        const on = isChecked(it.key);
        return h('div', { class: 'aisle-item', 'data-checked': on ? 'true' : 'false' },
          h('button', {
            class: 'aisle-check', 'data-on': on ? 'true' : 'false',
            'aria-label': on ? `Décocher ${it.name}` : `Cocher ${it.name}`,
            onclick: () => toggleChecked(it.key),
          }, on ? icon.checkCircle() : null),
          h('span', { class: 'emoji' }, it.emoji),
          h('div', { class: 'name' }, it.name),
          h('div', { class: 'qty-pill' }, `${formatQty(it.qty)} ${it.unit}`),
          h('div', { class: 'aisle-actions' },
            h('button', { class: 'aisle-edit', title: 'Changer le rayon',
              onclick: () => openAisleChooser(it) }, '⇄'),
            h('button', { class: 'x', onclick: () => removeShoppingItem(it.key), title: 'Retirer' }, '×'),
          ),
        );
      }),
    ),
  );
}

// === FAVORIS ===
export function viewFavorites() {
  const list = state.favorites.map(recipeById).filter(Boolean);
  const root = h('section');
  root.append(
    ...pageHead('vos incontournables', 'Mes ', 'favoris',
      list.length ? plural(list.length, 'recette', 'recettes') : null),
    list.length === 0
      ? emptyState('Aucun favori pour l\'instant.',
          'Touchez le cœur sur une recette pour la retrouver ici.')
      : recipeGrid(list),
  );
  return root;
}

// === À TESTER ===
export function viewToTry() {
  const list = state.toTry.map(recipeById).filter(Boolean);
  const root = h('section');
  root.append(
    ...pageHead('la liste d\'envies', 'À ', 'tester',
      list.length ? plural(list.length, 'recette', 'recettes') : null),
    list.length === 0
      ? emptyState('Rien à tester pour le moment.',
          'Marquez une recette « à tester » depuis sa fiche.')
      : recipeGrid(list),
  );
  return root;
}

// === RECHERCHE ===
export function viewSearch() {
  const root = h('section');
  let q = state.filter.q || '';
  let cat = state.filter.cat;
  const resultsEl = h('div');
  const chipRow = h('div', { class: 'chip-row' });

  function results() {
    let list = state.recipes;
    if (cat) list = list.filter(r => r.cat === cat);
    const lq = q.trim().toLowerCase();
    if (lq) {
      list = list.filter(r =>
        (r.name + ' ' + r.ingredients.map(i => i.name).join(' ')).toLowerCase().includes(lq));
    }

    resultsEl.replaceChildren();
    if (!lq && !cat) {
      resultsEl.append(h('p', { class: 'empty' },
        h('em', {}, 'Tapez un ingrédient ou un nom de plat, ou filtrez par catégorie.')));
      return;
    }
    resultsEl.append(
      h('p', { class: 'section-meta' }, plural(list.length, 'résultat', 'résultats')),
      list.length ? recipeGrid(list) : h('p', { class: 'empty' }, 'Aucun résultat.'),
    );
  }

  chipRow.append(...CATEGORIES.map(c => h('button', {
    class: 'chip', 'data-cat': c.id,
    'data-active': cat === c.id ? 'true' : 'false',
    onclick: () => {
      cat = (cat === c.id ? null : c.id);
      chipRow.querySelectorAll('.chip').forEach(x => {
        x.dataset.active = (x.dataset.cat === cat) ? 'true' : 'false';
      });
      results();
    },
  }, c.emoji, ' ', c.name)));

  root.append(
    ...pageHead('trouver un plat', 'La ', 'recherche', null),

    h('div', { class: 'search' },
      h('span', { class: 'search-icon' }, icon.search()),
      h('input', {
        type: 'text', placeholder: 'Ingrédient, nom de plat…', value: q,
        oninput: e => { q = e.target.value; results(); },
      }),
    ),

    chipRow,

    h('button', { class: 'btn block', onclick: () => openMenuLibre() },
      icon.sparkle(), 'Demander à l\'IA'),

    resultsEl,
  );

  results();
  return root;
}

// === PLUS ===
export function viewMore() {
  const root = h('section');
  const toCheck = state.recipes.filter(r => r.reconstructed).length;

  const row = (ico, label, sub, onclick) => h('button', { class: 'more-row', onclick },
    h('span', { class: 'more-ico' }, ico),
    h('span', { class: 'more-text' },
      h('span', { class: 'more-label' }, label),
      sub ? h('span', { class: 'more-sub' }, sub) : null,
    ),
    h('span', { class: 'more-chev' }, '›'),
  );

  root.append(
    ...pageHead('réglages et outils', 'Encore ', 'plus', null),

    h('div', { class: 'more-list' },
      row(icon.upload(), 'Importer PDF / Image', 'Extraire une recette d\'un document', openImport),
      row(icon.sparkle(), 'Menu libre', 'Décrire un plat et laisser l\'IA chercher', () => openMenuLibre()),
      row(icon.download(), 'Sauvegarder mes données', 'Télécharger un fichier de secours', exportData),
      row(icon.upload(), 'Restaurer une sauvegarde', 'Recharger un fichier exporté', () => {
        const inp = h('input', {
          type: 'file', accept: 'application/json', class: 'hidden-input',
          onchange: async e => { const f = e.target.files[0]; if (f) await importData(f); },
        });
        document.body.append(inp);
        inp.click();
        inp.remove();
      }),
      row(icon.edit(), 'Réglages', 'Clé API Gemini et confidentialité', openSettings),
    ),

    toCheck > 0
      ? h('p', { class: 'more-note' },
          `${toCheck} recettes sont marquées « à vérifier » : leur fiche d'origine a été perdue `,
          'et leur contenu a été reconstitué. Ouvrez-les pour corriger les quantités.')
      : null,
  );

  return root;
}
