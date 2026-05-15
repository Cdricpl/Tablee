// Actions transverses : suppression, exports, imports, resets.
import { state, persist, recipeById, setUserAisleMap, userAisleMap, computeShopping } from './state.js';
import { closeModal, toast } from './dom.js';
import { slug, formatQty } from './pure.js';
import { AISLES, SEED_RECIPES, normalizeIngredient } from './data.js';
import { render } from './render.js';

export function deleteRecipe(id) {
  const r = recipeById(id);
  if (!r) return;
  if (!confirm(`Supprimer "${r.name}" ?`)) return;
  state.recipes = state.recipes.filter(x => x.id !== id);
  for (const day of state.week) {
    if (day.lunch?.recipeId === id) day.lunch = null;
    if (day.dinner?.recipeId === id) day.dinner = null;
  }
  persist();
  closeModal();
  render();
}

export function exportRecipe(r) {
  const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${slug(r.name)}.json`; a.click();
  URL.revokeObjectURL(url);
  toast('Recette exportée');
}

export function clearSlot(dayIdx, slot) {
  state.week[dayIdx][slot] = null;
  persist(); render();
}

export function resetWeek() {
  if (!confirm('Vider toute la semaine ?')) return;
  state.week = state.week.map(d => ({ ...d, lunch: null, dinner: null }));
  persist(); render();
  toast('Semaine réinitialisée');
}

export function removeShoppingItem(key) {
  if (!state.shopping.removed.includes(key)) state.shopping.removed.push(key);
  state.shopping.manual = state.shopping.manual.filter(it =>
    `${normalizeIngredient(it.name)}|${it.unit}` !== key);
  persist(); render();
}

export function resetShopping() {
  if (!confirm('Vider la liste de courses ?')) return;
  state.shopping = { manual: [], removed: [], checked: [] };
  persist(); render();
  toast('Liste vidée');
}

export function exportPDF() {
  const items = computeShopping();
  const byAisle = new Map();
  for (const a of AISLES) byAisle.set(a.id, []);
  for (const it of items) byAisle.get(it.aisle)?.push(it);
  const usedAisles = AISLES.filter(a => byAisle.get(a.id).length > 0);

  const w = window.open('', '_blank');
  if (!w) { toast('Impression bloquée'); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Mes courses · Tablée</title>
  <style>
    body{font-family:Georgia,serif;color:#1c2a1d;max-width:600px;margin:32px auto;padding:0 24px;}
    h1{font-size:36px;margin:0 0 4px;font-weight:400;}
    .meta{color:#8a9876;font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:24px;}
    h2{font-size:20px;border-bottom:1px solid #c44a2a;padding-bottom:6px;margin-top:24px;}
    ul{list-style:none;padding:0;margin:0;}
    li{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #ccc;}
    .qty{color:#c44a2a;font-family:monospace;}
    @media print{body{margin:12mm;}}
  </style></head><body>
  <h1>Mes courses</h1>
  <div class="meta">${items.length} ingrédients · ${usedAisles.length} rayons · Tablée</div>
  ${usedAisles.map(a => `<h2>${a.emoji} ${a.name}</h2><ul>${
    byAisle.get(a.id).map(it => `<li><span>${it.name}</span><span class="qty">${formatQty(it.qty)} ${it.unit}</span></li>`).join('')
  }</ul>`).join('')}
  <script>window.onload=()=>setTimeout(()=>window.print(),200)</script>
  </body></html>`);
  w.document.close();
}

export function exportData() {
  try {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      recipes: state.recipes.filter(r => r.source !== 'seed' || r._edited),
      week: state.week,
      shopping: state.shopping,
      userAisles: userAisleMap,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tablee-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Sauvegarde téléchargée');
  } catch (e) {
    console.error(e);
    toast('Export impossible');
  }
}

export async function importData(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') throw new Error('Format invalide');
    if (!confirm('Importer cette sauvegarde ? Vos recettes / semaine / courses actuelles seront remplacées.')) return;
    if (Array.isArray(data.recipes)) {
      const seedIds = new Set(SEED_RECIPES.map(r => r.id));
      const userRecipes = data.recipes.filter(r => r && r.id && !seedIds.has(r.id));
      state.recipes = [...SEED_RECIPES.map(r => ({ ...r, source: 'seed' })), ...userRecipes];
    }
    if (data.week && Array.isArray(data.week) && data.week.length === 7) state.week = data.week;
    if (data.shopping && typeof data.shopping === 'object') state.shopping = data.shopping;
    if (data.userAisles && typeof data.userAisles === 'object') {
      setUserAisleMap(data.userAisles);
    }
    persist();
    closeModal();
    render();
    toast('Sauvegarde importée');
  } catch (e) {
    console.error(e);
    toast('Import impossible : fichier invalide');
  }
}
