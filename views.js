// Les vues de l'app : accueil (Bibliothèque, Semaine, Courses) + les vues
// transverses de la barre du bas (Favoris, À tester, Recherche, Plus).
import {
  state, recipeById, catById,
  DAYS_FR_LONG, SLOT_LABEL, todayIndex, computeShopping,
} from './state.js';
import { h, icon, appendAll } from './dom.js';
import { fmtTime, formatQty } from './pure.js';
import { AISLES, CATEGORIES } from './data.js';
import {
  openRecipe, openEdit, openImport, openMenuLibre, openSettings,
  openPicker, openManualAdd, openItemMenu, openDayMenu,
} from './modals.js';
import {
  resetWeek, resetShopping, clearSlot, exportPDF,
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

// Fil de retour des sous-pages (favoris, à tester, catégorie) vers leur section.
// La barre du bas n'ayant pas d'entrée pour elles, c'est le seul chemin retour.
function backLink(label, view) {
  return h('button', { class: 'back-link', onclick: () => setView(view) },
    icon.arrowLeft(), label);
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
// Ouvre une collection ou une catégorie sur sa propre page : cliquer une tuile
// amenait auparavant les résultats *sous* la grille, ce qui envoyait l'écran
// tout en bas. Une sous-page repart du haut.
export function openCategory(catId) {
  state.filter.cat = catId;
  setView('category');
}

function catTile(c, count) {
  return h('button', {
    class: 'cat-card',
    'data-cat': c.id,
    onclick: () => openCategory(c.id),
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
      h('span', { class: 'cat-count' }, plural(count, 'recette', 'recettes')),
    ),
  );
}

// Les trois raccourcis d'entrée de la bibliothèque. Favoris et « à tester »
// vivaient dans la barre du bas ; ce sont des collections de recettes, leur
// place est ici, sous « Recettes ».
function collectionRow() {
  const cells = [
    { label: 'Toutes',   n: state.recipes.length,  ico: icon.book(),     go: () => openCategory(null) },
    { label: 'Favoris',  n: state.favorites.length, ico: icon.heart(),   go: () => setView('favorites') },
    { label: 'À tester', n: state.toTry.length,     ico: icon.chefHat(), go: () => setView('totry') },
  ];
  return h('div', { class: 'collections' }, ...cells.map(c =>
    h('button', { class: 'collection-card', onclick: c.go },
      h('span', { class: 'collection-ico' }, c.ico),
      h('span', { class: 'collection-label' }, c.label),
      h('span', { class: 'collection-count' }, String(c.n)),
    )));
}

export function viewLibrary() {
  const root = h('section');

  const counts = {};
  for (const c of CATEGORIES) counts[c.id] = state.recipes.filter(r => r.cat === c.id).length;

  appendAll(root,
    ...pageHead('toutes vos recettes', 'Mes ', 'recettes',
      `${state.recipes.length} recettes au total`),

    // Un seul champ de recherche dans l'app : ce bouton mène à la vue Recherche
    // plutôt que de dupliquer un filtre ici.
    h('button', { class: 'search search-btn', onclick: () => setView('search') },
      h('span', { class: 'search-icon' }, icon.search()),
      h('span', { class: 'search-btn-text' }, 'Rechercher une recette…'),
      h('span', { class: 'search-filter' }, icon.sliders()),
    ),

    h('button', { class: 'btn primary block', onclick: () => openEdit(null) },
      icon.plus(), 'Nouvelle recette'),

    collectionRow(),

    h('p', { class: 'group-label' }, 'Par catégorie'),
    h('div', { class: 'cat-grid' }, ...CATEGORIES.map(c => catTile(c, counts[c.id]))),
  );

  return root;
}

// === CATÉGORIE (sous-page de la bibliothèque) ===
export function viewCategory() {
  const root = h('section');
  const cat = state.filter.cat ? catById(state.filter.cat) : null;
  const list = cat ? state.recipes.filter(r => r.cat === cat.id) : state.recipes;

  // Les puces permettent de passer d'une catégorie à l'autre sans revenir en
  // arrière ; elles remplacent le va-et-vient vers la grille d'accueil.
  const chips = h('div', { class: 'chip-row scroller' },
    h('button', {
      class: 'chip', 'data-active': cat ? 'false' : 'true',
      onclick: () => openCategory(null),
    }, 'Toutes'),
    ...CATEGORIES.map(c => h('button', {
      class: 'chip', 'data-active': cat?.id === c.id ? 'true' : 'false',
      onclick: () => openCategory(c.id),
    }, c.emoji, ' ', c.name)),
  );

  appendAll(root,
    backLink('Recettes', 'library'),
    ...pageHead(cat ? 'catégorie' : 'la bibliothèque',
      '', cat ? cat.name : 'Toutes les recettes',
      plural(list.length, 'recette', 'recettes')),
    chips,
    list.length === 0
      ? emptyState('Aucune recette dans cette catégorie.',
          'Ajoutez-en une depuis « Mes recettes ».')
      : recipeGrid(list),
  );

  // La catégorie ouverte peut se trouver hors champ dans la rangée défilante.
  setTimeout(() => chips.querySelector('.chip[data-active="true"]')
    ?.scrollIntoView({ block: 'nearest', inline: 'center' }), 0);

  return root;
}

// === SEMAINE ===
export function viewWeek() {
  const root = h('section');
  let planned = 0;
  for (const d of state.week) { if (d.lunch) planned++; if (d.dinner) planned++; }

  appendAll(root,
    ...pageHead('sept jours, deux repas', 'La ', 'semaine',
      `${planned} repas planifiés sur 14`),

    // Action principale en pleine largeur (le libellé passait sur deux lignes
    // dans une demi-colonne), remise à zéro en retrait à droite.
    h('button', { class: 'btn primary block', onclick: () => openMenuLibre() },
      icon.plus(), 'Choisir une recette'),
    h('div', { class: 'row-end' },
      h('button', { class: 'btn-ghost', onclick: resetWeek },
        icon.refresh(), 'Vider la semaine'),
    ),

    h('div', { class: 'week-list' }, ...state.week.map((d, i) => weekDayCard(d, i))),
  );

  return root;
}

// Une carte par jour, les deux repas empilés en pleine largeur. Les deux repas
// côte à côte laissaient ~140 px par plat : les noms étaient tronqués ou
// écrasés en corps 14, illisibles d'un coup d'œil.
function weekDayCard(day, i) {
  const today = i === todayIndex;
  return h('article', { class: 'day-card', 'data-today': today ? 'true' : 'false' },
    h('div', { class: 'day-head' },
      h('span', { class: 'day-name' }, DAYS_FR_LONG[i]),
      today ? h('span', { class: 'day-today' }, 'aujourd\'hui') : null,
      h('button', {
        class: 'day-menu', title: 'Options du jour',
        'aria-label': `Options du ${DAYS_FR_LONG[i]}`,
        onclick: () => openDayMenu(i),
      }, icon.dots()),
    ),
    weekMealRow(day, i, 'lunch'),
    weekMealRow(day, i, 'dinner'),
  );
}

function weekMealRow(day, i, slot) {
  const meal = day[slot];
  const r = meal ? recipeById(meal.recipeId) : null;
  const label = h('span', { class: 'meal-label' }, SLOT_LABEL[slot]);

  // Créneau libre : toute la ligne ouvre le sélecteur, pas un lien de 14 px.
  if (!meal) {
    return h('button', { class: 'meal-row meal-row-empty', onclick: () => openPicker(i, slot) },
      label,
      h('span', { class: 'meal-add' }, icon.plus(), 'Choisir un plat'),
    );
  }
  if (!r) {
    return h('button', { class: 'meal-row meal-row-empty', onclick: () => clearSlot(i, slot) },
      label,
      h('span', { class: 'meal-add' }, 'Recette supprimée — toucher pour retirer'),
    );
  }
  return h('div', { class: 'meal-row' },
    label,
    h('button', {
      class: 'meal-main',
      onclick: () => openRecipe(r.id, { portions: meal.portions }),
    },
      h('span', { class: 'meal-name' }, r.name),
      h('span', { class: 'meal-meta' },
        `${fmtTime(r.time)} · ${meal.portions || r.portions} pers`),
    ),
    h('button', {
      class: 'meal-x', title: 'Retirer ce plat',
      'aria-label': `Retirer ${r.name} du ${SLOT_LABEL[slot].toLowerCase()} de ${DAYS_FR_LONG[i]}`,
      onclick: () => clearSlot(i, slot),
    }, '×'),
  );
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

  appendAll(root,
    ...pageHead('liste d\'achat', 'Mes ', 'courses',
      `${items.length} ingrédients · ${usedAisles.length} rayons`),

    h('button', { class: 'btn primary block', onclick: openManualAdd },
      icon.plus(), 'Ajouter un ingrédient'),

    h('div', { class: 'row-end' },
      h('button', { class: 'btn-ghost', onclick: exportPDF }, icon.download(), 'Exporter PDF'),
      h('button', { class: 'btn-ghost', onclick: resetShopping }, icon.refresh(), 'Vider la liste'),
    ),

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
  const done = items.filter(it => isChecked(it.key)).length;
  // Ce qu'il reste à prendre remonte en tête du rayon : dans un magasin, les
  // articles déjà cochés n'ont plus à être relus.
  const sorted = [...items].sort((a, b) => Number(isChecked(a.key)) - Number(isChecked(b.key)));

  return h('section', { class: 'aisle', 'data-done': done === items.length ? 'true' : 'false' },
    h('div', { class: 'aisle-head' },
      h('h3', { class: 'aisle-title' }, aisle.emoji, ' ', aisle.name),
      h('span', { class: 'aisle-count' }, `${done}/${items.length}`),
    ),
    h('div', { class: 'shop-list' }, ...sorted.map(shopRow)),
  );
}

// Ligne pleine largeur : toute la surface coche l'article. L'ancienne grille à
// deux colonnes imposait de viser une pastille de 22 px dans un coin, plus les
// deux boutons d'action affichés en permanence sur chaque vignette.
function shopRow(it) {
  const on = isChecked(it.key);
  return h('div', { class: 'shop-item', 'data-checked': on ? 'true' : 'false' },
    h('button', {
      class: 'shop-tap',
      'aria-pressed': on ? 'true' : 'false',
      'aria-label': `${on ? 'Décocher' : 'Cocher'} ${it.name}`,
      onclick: () => toggleChecked(it.key),
    },
      h('span', { class: 'shop-check' }, on ? icon.check() : null),
      h('span', { class: 'shop-emoji' }, it.emoji),
      h('span', { class: 'shop-name' }, it.name),
      h('span', { class: 'shop-qty' }, `${formatQty(it.qty)} ${it.unit}`),
    ),
    h('button', {
      class: 'shop-more', title: 'Options',
      'aria-label': `Options pour ${it.name}`,
      onclick: () => openItemMenu(it),
    }, icon.dots()),
  );
}

// === FAVORIS ===
export function viewFavorites() {
  const list = state.favorites.map(recipeById).filter(Boolean);
  const root = h('section');
  appendAll(root,
    backLink('Recettes', 'library'),
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
  appendAll(root,
    backLink('Recettes', 'library'),
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
  // Le filtre catégorie de la recherche reste local : state.filter.cat sert à la
  // sous-page « catégorie », les deux ne doivent pas se marcher dessus.
  let cat = null;
  const resultsEl = h('div');
  const chipRow = h('div', { class: 'chip-row scroller' });

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
    if (list.length) {
      resultsEl.append(
        h('p', { class: 'section-meta' }, plural(list.length, 'résultat', 'résultats')),
        recipeGrid(list),
      );
      // Des résultats mais aucun qui convient : le recours à l'IA reste à
      // portée, en retrait, et emporte lui aussi la saisie.
      if (lq) {
        resultsEl.append(h('div', { class: 'row-end', style: 'margin-top:16px' },
          h('button', { class: 'btn-ghost', onclick: () => askAI() },
            icon.sparkle(), 'Demander à l\'IA')));
      }
      return;
    }
    // Sans résultat, le rebond utile est l'IA — avec la saisie déjà reprise.
    resultsEl.append(
      h('p', { class: 'section-meta' }, '0 résultat'),
      h('div', { class: 'no-result' },
        h('p', { class: 'no-result-title' },
          lq ? `Rien pour « ${q.trim()} ».` : 'Rien dans cette catégorie.'),
        h('p', { class: 'no-result-sub' }, h('em', {},
          lq
            ? 'Tablée peut demander à l\'IA d\'inventer une recette avec ces ingrédients.'
            : 'Essayez un ingrédient ou un nom de plat.')),
        lq
          ? h('button', { class: 'btn primary block', onclick: () => askAI() },
              icon.sparkle(), 'Demander à l\'IA')
          : null,
      ),
    );
  }

  // La saisie part telle quelle vers le menu libre : la ressaisir n'avait
  // aucun intérêt et c'était le principal point de friction de la recherche.
  const askAI = () => openMenuLibre({ query: q.trim() });

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

  const input = h('input', {
    type: 'text', placeholder: 'Ingrédient, nom de plat…', value: q,
    oninput: e => { q = e.target.value; state.filter.q = q; results(); },
  });

  appendAll(root,
    ...pageHead('trouver un plat', 'La ', 'recherche', null),

    h('div', { class: 'search' },
      h('span', { class: 'search-icon' }, icon.search()),
      input,
    ),

    chipRow,

    resultsEl,
  );

  results();
  // Arriver sur la recherche depuis l'accueil doit permettre de taper aussitôt.
  setTimeout(() => input.focus(), 0);
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

  appendAll(root,
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
      row(icon.refresh(), 'Forcer la mise à jour', 'Vider le cache et recharger l\'application',
        forceUpdate),
    ),

    toCheck > 0
      ? h('p', { class: 'more-note' },
          `${toCheck} recettes sont marquées « à vérifier » : leur fiche d'origine a été perdue `,
          'et leur contenu a été reconstitué. Ouvrez-les pour corriger les quantités.')
      : null,

    versionLine(),
  );

  return root;
}

// Dernier recours quand un appareil reste bloqué sur une version périmée :
// on vide les caches, on désinscrit le service worker et on recharge.
// Les recettes et la semaine vivent dans localStorage, qui n'est pas touché.
async function forceUpdate() {
  if (!confirm('Vider le cache et recharger l\'application ?\n\nVos recettes, votre semaine et vos courses sont conservées.')) return;
  try {
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  } catch (e) {
    console.error('forceUpdate', e);
  }
  // reload(true) n'existe plus : on repasse par l'URL en cassant le cache HTTP.
  const u = new URL(location.href);
  u.searchParams.set('maj', String(Date.now()));
  location.replace(u.toString());
}

// Repère de version : indique quel cache le service worker sert réellement.
// Sert à vérifier d'un coup d'œil qu'un appareil a bien reçu la dernière version.
function versionLine() {
  const el = h('p', { class: 'version-line' }, 'Version : lecture…');
  const controlled = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
  if (!window.caches) {
    el.textContent = 'Version : hors cache (mode navigation directe)';
    return el;
  }
  caches.keys().then(keys => {
    const mine = keys.filter(k => k.startsWith('tablee-'));
    el.textContent = mine.length
      ? `Version : ${mine.join(', ')}${controlled ? '' : ' (service worker inactif)'}`
      : 'Version : aucun cache installé';
  }).catch(() => { el.textContent = 'Version : indisponible'; });
  return el;
}
