// Point d'entrée : listeners d'onglets, cloche du bandeau, premier render.
// L'état, les helpers DOM et les listeners globaux (Échap, click-outside,
// beforeunload, visibilitychange) sont configurés à l'import via les modules
// state.js et dom.js.
import { state, persist } from './state.js';
import { setView, render } from './render.js';
import { icon } from './dom.js';
import { openNotifications } from './modals.js';

document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', () => setView(t.dataset.view)));

const bell = document.getElementById('bellBtn');
if (bell) {
  bell.append(icon.bell());
  bell.addEventListener('click', openNotifications);
}

render();

// Helper de debug accessible depuis la console DevTools.
window.tablee = { state, render, persist, setView };
