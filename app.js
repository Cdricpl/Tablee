// Point d'entrée : initialise les listeners d'onglets et lance le premier render.
// L'état, les helpers DOM et les listeners globaux (Échap, click-outside,
// beforeunload, visibilitychange) sont configurés à l'import via les modules
// state.js et dom.js.
import { state, persist } from './state.js';
import './dom.js';
import { setView, render } from './render.js';

document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', () => setView(t.dataset.view)));

render();

// Helper de debug accessible depuis la console DevTools.
window.tablee = { state, render, persist };
