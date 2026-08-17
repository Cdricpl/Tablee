// Rendu principal et routing entre vues.
import { state, dayLabel } from './state.js';
import { $, h, icon } from './dom.js';
import {
  viewLibrary, viewWeek, viewShopping,
  viewFavorites, viewToTry, viewSearch, viewMore, viewCategory,
} from './views.js';

// Une seule navigation : la barre du bas. Les anciens onglets du haut faisaient
// doublon avec elle, ils ont été retirés.
const BOTTOM_NAV = [
  { view: 'library',  label: 'Recettes',  ico: 'book' },
  { view: 'week',     label: 'Semaine',   ico: 'calendar' },
  { view: 'shopping', label: 'Courses',   ico: 'cart' },
  { view: 'search',   label: 'Recherche', ico: 'search' },
  { view: 'more',     label: 'Plus',      ico: 'dotsH' },
];

// Vues secondaires : elles n'ont pas d'entrée propre dans la barre du bas, mais
// gardent leur section parente allumée et savent où revenir.
export const PARENT_VIEW = {
  favorites: 'library',
  totry: 'library',
  category: 'library',
};

const VIEW_RENDERERS = {
  library: viewLibrary,
  week: viewWeek,
  shopping: viewShopping,
  favorites: viewFavorites,
  totry: viewToTry,
  category: viewCategory,
  search: viewSearch,
  more: viewMore,
};

export function setMastheadDay() {
  $('#issueNo').textContent = `N° ${String(state.recipes.length || 0).padStart(3, '0')}`;
  $('#issueDay').textContent = dayLabel;
}

function renderBottomNav() {
  const nav = $('#bottomNav');
  if (!nav) return;
  const section = PARENT_VIEW[state.view] || state.view;
  nav.replaceChildren(...BOTTOM_NAV.map(item => h('button', {
    type: 'button',
    class: 'nav-item',
    'data-view': item.view,
    'aria-current': item.view === section ? 'page' : null,
    onclick: () => setView(item.view),
  },
    icon[item.ico](),
    h('span', { class: 'nav-label' }, item.label),
  )));
}

export function setView(v) {
  state.view = v;
  render();
  // Chaque vue repart du haut : sinon on atterrit au milieu de la précédente.
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function render() {
  setMastheadDay();
  renderBottomNav();

  const app = $('#app');
  app.replaceChildren();
  const renderer = VIEW_RENDERERS[state.view] || viewLibrary;
  app.append(renderer());
}
