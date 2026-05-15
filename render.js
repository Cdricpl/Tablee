// Rendu principal et routing entre vues.
import { state, dayLabel } from './state.js';
import { $ } from './dom.js';
import { viewLibrary, viewWeek, viewShopping } from './views.js';

export function setMastheadDay() {
  $('#issueNo').textContent = `N° ${String(state.recipes.length || 0).padStart(3, '0')}`;
  $('#issueDay').textContent = dayLabel;
}

function syncTabs() {
  document.querySelectorAll('.tab').forEach(t =>
    t.setAttribute('aria-selected', t.dataset.view === state.view ? 'true' : 'false'));
}

export function setView(v) {
  state.view = v;
  render();
}

export function render() {
  setMastheadDay();
  syncTabs();
  const app = $('#app');
  app.replaceChildren();
  if (state.view === 'library') app.append(viewLibrary());
  else if (state.view === 'week') app.append(viewWeek());
  else if (state.view === 'shopping') app.append(viewShopping());
}
