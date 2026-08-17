// Point d'entrée : cloche du bandeau, premier render.
// La navigation vit entièrement dans la barre du bas (render.js) ; l'état, les
// helpers DOM et les listeners globaux (Échap, click-outside, beforeunload,
// visibilitychange) sont configurés à l'import via state.js et dom.js.
import { state, persist } from './state.js';
import { setView, render } from './render.js';
import { icon } from './dom.js';
import { openNotifications } from './modals.js';

const bell = document.getElementById('bellBtn');
if (bell) {
  bell.append(icon.bell());
  bell.addEventListener('click', openNotifications);
}

render();

// Helper de debug accessible depuis la console DevTools.
window.tablee = { state, render, persist, setView };
