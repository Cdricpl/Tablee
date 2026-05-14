// Rendu principal et routing entre vues.
import { state, dayLabel } from './state.js';
import { $ } from './dom.js';
import { viewLibrary, viewWeek, viewShopping } from './views.js';

export function setMastheadDay() {
  $('#issueNo').textContent = `N° ${String(state.recipes.length || 0).padStart(3, '0')}`;
  $('#issueDay').textContent = dayLabel;
}

export function setView(v) {
  state.view = v;
  document.querySelectorAll('.tab').forEach(t =>
    t.setAttribute('aria-selected', t.dataset.view === v ? 'true' : 'false'));
  render();
}

export function render() {
  setMastheadDay();
  const app = $('#app');
  app.replaceChildren();
  if (state.view === 'library') app.append(viewLibrary());
  else if (state.view === 'week') app.append(viewWeek());
  else if (state.view === 'shopping') app.append(viewShopping());
}
