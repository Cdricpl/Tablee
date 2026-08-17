// Rendu principal et routing entre vues.
import { state, dayLabel } from './state.js';
import { $, h, icon } from './dom.js';
import {
  viewLibrary, viewWeek, viewShopping,
  viewFavorites, viewToTry, viewSearch, viewMore,
} from './views.js';

// Les trois onglets du haut restent le cœur de l'app ; la barre du bas y ajoute
// les vues transverses (favoris, à tester, recherche, plus).
const TOP_TABS = ['library', 'week', 'shopping'];

const BOTTOM_NAV = [
  { view: 'library',   label: 'Accueil',   ico: 'home' },
  { view: 'favorites', label: 'Favoris',   ico: 'heart' },
  { view: 'totry',     label: 'À tester',  ico: 'chefHat' },
  { view: 'search',    label: 'Recherche', ico: 'search' },
  { view: 'more',      label: 'Plus',      ico: 'dotsH' },
];

const VIEW_RENDERERS = {
  library: viewLibrary,
  week: viewWeek,
  shopping: viewShopping,
  favorites: viewFavorites,
  totry: viewToTry,
  search: viewSearch,
  more: viewMore,
};

export function setMastheadDay() {
  $('#issueNo').textContent = `N° ${String(state.recipes.length || 0).padStart(3, '0')}`;
  $('#issueDay').textContent = dayLabel;
}

function syncTabs() {
  // Une vue hors des trois onglets (favoris, recherche…) n'en sélectionne aucun.
  document.querySelectorAll('.tab').forEach(t =>
    t.setAttribute('aria-selected', t.dataset.view === state.view ? 'true' : 'false'));
}

function renderBottomNav() {
  const nav = $('#bottomNav');
  if (!nav) return;
  nav.replaceChildren(...BOTTOM_NAV.map(item => {
    // « Accueil » reste allumé sur les trois onglets du haut, qui forment l'accueil.
    const active = item.view === 'library'
      ? TOP_TABS.includes(state.view)
      : state.view === item.view;
    return h('button', {
      type: 'button',
      class: 'nav-item',
      'data-view': item.view,
      'aria-current': active ? 'page' : null,
      onclick: () => setView(item.view),
    },
      icon[item.ico](),
      h('span', { class: 'nav-label' }, item.label),
    );
  }));
}

export function setView(v) {
  state.view = v;
  render();
  // Chaque vue repart du haut : sinon on atterrit au milieu de la précédente.
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function render() {
  setMastheadDay();
  syncTabs();
  renderBottomNav();
  // La barre du haut ne concerne que l'accueil : on la masque ailleurs.
  const tabs = document.querySelector('.tabs');
  if (tabs) tabs.hidden = !TOP_TABS.includes(state.view);

  const app = $('#app');
  app.replaceChildren();
  const renderer = VIEW_RENDERERS[state.view] || viewLibrary;
  app.append(renderer());
}
