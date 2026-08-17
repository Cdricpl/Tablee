// Helpers DOM (sélection, création), toast, modale, icônes SVG.
import { state } from './state.js';

export const $ = sel => document.querySelector(sel);

// `html:` n'accepte que des chaînes inertes (SVG d'icônes hardcodés). Toute trace
// de <script>, gestionnaire d'événement inline ou URL `javascript:` est refusée
// pour empêcher une XSS si du contenu dynamique y atterrissait par erreur.
export const UNSAFE_HTML_RE = /<script\b|\son\w+\s*=|javascript:/i;

export const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') {
      if (typeof v !== 'string' || UNSAFE_HTML_RE.test(v)) {
        throw new Error('h(): contenu html non sûr refusé');
      }
      el.innerHTML = v;
    }
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'data') Object.entries(v).forEach(([dk, dv]) => el.dataset[dk] = dv);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(c));
  }
  return el;
};

// Element.append() convertit null/undefined en texte : un « null » s'affichait
// littéralement dans les vues qui assemblent des morceaux conditionnels
// (compteur absent, bloc masqué…). On filtre avant d'insérer.
export const appendAll = (el, ...children) => {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c);
  }
  return el;
};

export function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2200);
}

export function closeModal() {
  state.modal = null;
  $('#modal').hidden = true;
  $('#modal').replaceChildren();
}

export function field(label, input) {
  return h('div', { class: 'field' },
    h('label', { class: 'field-label' }, label),
    input,
  );
}

export const icon = {
  search: () => h('span', { html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-5-5"/></svg>' }),
  upload: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V4m-4 4 4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>' }),
  plus: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>' }),
  clock: () => h('span', { html: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' }),
  users: () => h('span', { html: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 4a3 3 0 0 1 0 6M21 20v-2a4 4 0 0 0-3-3.87"/></svg>' }),
  edit: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' }),
  trash: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' }),
  download: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>' }),
  refresh: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>' }),
  sparkle: () => h('span', { html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 13.8 8.2 20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/></svg>' }),
  bell: () => h('span', { html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>' }),
  home: () => h('span', { html: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 3 10.2V21h6v-6h6v6h6V10.2Z"/></svg>' }),
  book: () => h('span', { html: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v4H6.5A2.5 2.5 0 0 1 4 19.5Z"/><path d="M9 7.5h6"/></svg>' }),
  calendar: () => h('span', { html: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>' }),
  cart: () => h('span', { html: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 4h2l2.2 10.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.55L21 8H7"/><circle cx="10.5" cy="19.5" r="1.4"/><circle cx="17.5" cy="19.5" r="1.4"/></svg>' }),
  arrowLeft: () => h('span', { html: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>' }),
  heart: () => h('span', { html: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20.3 4.6 13a4.8 4.8 0 0 1 6.8-6.8l.6.6.6-.6A4.8 4.8 0 1 1 19.4 13Z"/></svg>' }),
  heartFull: () => h('span', { html: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.3 4.6 13a4.8 4.8 0 0 1 6.8-6.8l.6.6.6-.6A4.8 4.8 0 1 1 19.4 13Z"/></svg>' }),
  chefHat: () => h('span', { html: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 18h12v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM6 18V13a4 4 0 0 1-1-7.9 4 4 0 0 1 7-2.1 4 4 0 0 1 7 2.1A4 4 0 0 1 18 13v5"/></svg>' }),
  dots: () => h('span', { html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>' }),
  dotsH: () => h('span', { html: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>' }),
  sliders: () => h('span', { html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></svg>' }),
  checkCircle: () => h('span', { html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5L16 9.5"/></svg>' }),
  sun: () => h('span', { html: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' }),
  basket: () => h('span', { class: 'basket-art', html: '<svg width="132" height="112" viewBox="0 0 132 112" fill="none" aria-hidden="true"><ellipse cx="66" cy="103" rx="44" ry="6" fill="rgba(42,58,38,.09)"/><path d="M24 52h84l-8 44a8 8 0 0 1-8 7H40a8 8 0 0 1-8-7Z" fill="#d9b381"/><path d="M24 52h84l-1.6 9H25.6Z" fill="#c79b63"/><path d="M40 60l4 40M56 60l2 40M76 60l-2 40M92 60l-4 40" stroke="#c79b63" stroke-width="2.5"/><path d="M34 76h64M32 88h68" stroke="#c79b63" stroke-width="2.5"/><path d="M40 52a26 26 0 0 1 52 0" stroke="#c79b63" stroke-width="3.5" fill="none"/><circle cx="46" cy="44" r="10" fill="#c44a2a"/><circle cx="64" cy="41" r="11" fill="#e07a3f"/><circle cx="83" cy="45" r="9" fill="#7d9150"/><path d="M96 46c6-14 12-20 18-22-2 10-6 18-13 24Z" fill="#7d9150"/><path d="M30 47c-4-10-3-17 0-21 5 6 7 13 6 21Z" fill="#8ea55c"/><path d="M72 33c1-8 4-12 8-14 0 7-2 12-5 15Z" fill="#8ea55c"/></svg>' }),
};

// Listeners globaux : Échap et click-outside ferment la modale.
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

// Sauvegarde/restauration du scroll de la vue sous-jacente quand une modale s'ouvre/ferme.
// La modale est position:fixed inset:0 — sur mobile certains navigateurs perdent la
// position de scroll du body. On la mémorise dès que #modal devient visible et on la
// restaure dès qu'il se cache. MutationObserver = un seul point d'instrumentation pour
// toutes les modales, sans toucher à modals.js.
let _savedScrollY = 0;
{
  const modalEl = $('#modal');
  let prevHidden = modalEl.hidden;
  new MutationObserver(() => {
    const nowHidden = modalEl.hidden;
    if (prevHidden && !nowHidden) {
      // Ouverture : capturer le scroll actuel.
      _savedScrollY = window.scrollY || window.pageYOffset || 0;
    } else if (!prevHidden && nowHidden) {
      // Fermeture : restaurer.
      window.scrollTo({ top: _savedScrollY, behavior: 'instant' });
    }
    prevHidden = nowHidden;
  }).observe(modalEl, { attributes: true, attributeFilter: ['hidden'] });
}
