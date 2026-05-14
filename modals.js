// Toutes les modales : recette, édition, picker, menu libre, import, réglages,
// ajout manuel, choix de rayon. Et le picker partagé chooseAndAddToWeek.
import {
  state, persist, recipeById, catById,
  setUserAisle, aisleForUser, DAYS_FR_LONG, SLOT_LABEL,
} from './state.js';
import { $, h, closeModal, toast, field, icon } from './dom.js';
import { newId, fmtTime, cap, localMatch, detectPortions } from './pure.js';
import {
  AISLES, CATEGORIES, UNITS, INGREDIENT_DB,
  aisleFor, defaultUnitFor, normalizeIngredient, aisleEmojiOf,
} from './data.js';
import {
  llmMatchOrCreate, llmExtractFromFile, hasApiKey, getApiKey, setApiKey,
} from './llm.js';
import { deleteRecipe, exportRecipe, exportData, importData } from './actions.js';
import { render } from './render.js';

// === RECIPE MODAL ===
export function openRecipe(id, opts = {}) {
  const r = recipeById(id);
  if (!r) return;
  let portions = opts.portions || r.portions;
  const factor = () => portions / r.portions;
  const cat = catById(r.cat);

  function fmtQty(qty) {
    const v = qty * factor();
    if (v >= 100) return Math.round(v).toString();
    if (v >= 10)  return (Math.round(v * 10) / 10).toString();
    return (Math.round(v * 100) / 100).toString();
  }

  function content() {
    return h('div', { class: 'modal-card recipe-modal' },
      h('button', { class: 'modal-close', onclick: closeModal }, '×'),
      h('div', { class: 'modal-head' },
        h('span', { class: 'modal-cat' }, (cat?.name || '').toUpperCase()),
      ),
      h('div', { class: 'modal-actions' },
        h('button', { class: 'btn-ghost', onclick: () => chooseAndAddToWeek(r.id, portions) }, '+ Au menu'),
          r.file ? h('button', { class: 'btn-ghost icon-only', onclick: () => { window.open(r.file, '_blank'); }, title: 'Ouvrir le fichier source' }, icon.download()) : h('button', { class: 'btn-ghost icon-only', onclick: () => exportRecipe(r), title: 'Sauvegarder' }, icon.download()),
        h('button', { class: 'btn-ghost icon-only', onclick: () => { closeModal(); openEdit(r.id); }, title: 'Modifier' }, icon.edit()),
        h('button', { class: 'btn-ghost icon-only danger', onclick: () => deleteRecipe(r.id), title: 'Supprimer' }, icon.trash()),
      ),
      h('h2', { class: 'modal-title' }, r.name),
      h('hr', { class: 'dashed' }),
      h('div', { class: 'modal-meta-row' },
        h('span', { class: 'meta' }, icon.clock(), ' ', fmtTime(r.time)),
        portionsControl(portions, n => { portions = Math.max(1, Math.min(20, n)); renderModal(); }),
      ),
      h('h3', { class: 'subhead' }, 'Ingrédients'),
      h('ul', { class: 'ing-list' },
        ...r.ingredients.map(ing => h('li', {},
          h('span', {}, ing.name),
          h('span', { class: 'qty' }, `${fmtQty(ing.qty)} ${ing.unit}`),
        )),
      ),
      h('h3', { class: 'subhead' }, 'Préparation'),
      h('ol', { class: 'steps' },
        ...r.steps.map(s => h('li', {}, h('div', { class: 'step-text' }, s))),
      ),
    );
  }

  function renderModal() {
    const m = $('#modal');
    m.replaceChildren();
    m.append(content());
  }

  state.modal = { type: 'recipe', id };
  $('#modal').hidden = false;
  renderModal();
}

// Ouvre un modal pour une recette fournie en objet (utile pour les recettes IA non sauvegardées)
export function openRecipeObject(r, opts = {}) {
  let portions = opts.portions || r.portions;
  const factor = () => portions / r.portions;

  function fmtQty(qty) {
    const v = qty * factor();
    if (v >= 100) return Math.round(v).toString();
    if (v >= 10)  return (Math.round(v * 10) / 10).toString();
    return (Math.round(v * 100) / 100).toString();
  }

  function content() {
    const cat = catById(r.cat);
    return h('div', { class: 'modal-card recipe-modal' },
      h('button', { class: 'modal-close', onclick: closeModal }, '×'),
      h('div', { class: 'modal-head' },
        h('span', { class: 'modal-cat' }, (cat?.name || '').toUpperCase()),
      ),
      h('div', { class: 'modal-actions' },
        h('button', { class: 'btn-ghost', onclick: () => {
          let id = r.id;
          const existing = state.recipes.find(x => x.id === id);
          if (!existing) {
            const newRec = { ...r, id: newId(r.name), source: 'user' };
            state.recipes.push(newRec);
            id = newRec.id;
            persist();
          }
          chooseAndAddToWeek(id, portions || r.portions);
        } }, '+ Au menu'),
        h('button', { class: 'btn-ghost', onclick: () => {
          if (!r.name || !r.name.trim()) { toast('Nom requis pour enregistrer'); return; }
          const rec = { ...r, id: newId(r.name), source: 'user' };
          state.recipes.push(rec);
          persist();
          closeModal();
          render();
          toast('Recette enregistrée');
        } }, 'Enregistrer'),
        h('button', { class: 'btn-ghost icon-only', onclick: () => exportRecipe(r), title: 'Sauvegarder en JSON' }, icon.download()),
      ),
      h('h2', { class: 'modal-title' }, r.name),
      h('hr', { class: 'dashed' }),
      h('div', { class: 'modal-meta-row' },
        h('span', { class: 'meta' }, icon.clock(), ' ', fmtTime(r.time)),
        portionsControl(portions, n => { portions = Math.max(1, Math.min(20, n)); renderModal(); }),
      ),
      h('h3', { class: 'subhead' }, 'Ingrédients'),
      h('ul', { class: 'ing-list' },
        ...r.ingredients.map(ing => h('li', {},
          h('span', {}, ing.name),
          h('span', { class: 'qty' }, `${fmtQty(ing.qty)} ${ing.unit}`),
        )),
      ),
      h('h3', { class: 'subhead' }, 'Préparation'),
      h('ol', { class: 'steps' },
        ...r.steps.map(s => h('li', {}, h('div', { class: 'step-text' }, s))),
      ),
    );
  }

  function renderModal() {
    const m = $('#modal');
    m.replaceChildren();
    m.append(content());
  }

  state.modal = { type: 'recipe-temp' };
  $('#modal').hidden = false;
  renderModal();
}

export function portionsControl(val, onChange) {
  return h('span', { class: 'portions' },
    icon.users(),
    h('button', { type: 'button', onclick: () => onChange(val - 1) }, '−'),
    h('span', { class: 'val' }, String(val)),
    h('button', { type: 'button', onclick: () => onChange(val + 1) }, '+'),
    h('span', { class: 'label' }, 'PERS.'),
  );
}

// Ouvre un petit sélecteur pour choisir le jour et le slot (lunch/dinner), puis ajoute la recette
export function chooseAndAddToWeek(recipeId, portions, defaults = {}) {
  const dayDefault = defaults.dayIdx != null ? defaults.dayIdx : 0;
  const slotDefault = defaults.slot || 'dinner';
  const picker = h('div', { class: 'slot-picker', style: 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);z-index:9999' },
    h('div', { class: 'modal-card', style: 'max-width:420px;padding:18px' },
      h('button', { class: 'modal-close', onclick: () => picker.remove() }, '×'),
      h('h3', { class: 'modal-title' }, 'Ajouter au menu'),
      h('div', { class: 'field' },
        h('label', { class: 'field-label' }, 'Jour'),
        h('select', { id: 'slot-day' }, ...DAYS_FR_LONG.map((d, i) => h('option', { value: i, selected: i === dayDefault ? 'selected' : null }, d))),
      ),
      h('div', { class: 'field' },
        h('label', { class: 'field-label' }, 'Repas'),
        h('select', { id: 'slot-type' },
          h('option', { value: 'lunch', selected: slotDefault === 'lunch' ? 'selected' : null }, SLOT_LABEL.lunch),
          h('option', { value: 'dinner', selected: slotDefault === 'dinner' ? 'selected' : null }, SLOT_LABEL.dinner),
        ),
      ),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => picker.remove() }, 'Annuler'),
        h('button', { class: 'btn primary', onclick: () => {
          const day = +picker.querySelector('#slot-day').value;
          const slot = picker.querySelector('#slot-type').value;
          state.week[day][slot] = { recipeId, portions };
          persist(); picker.remove(); closeModal(); render(); toast('Ajouté au menu');
        } }, 'Ajouter'),
      ),
    ),
  );
  document.body.append(picker);
}

// === EDIT MODAL ===
export function openEdit(id, prefill) {
  const isNew = !id;
  const r = isNew
    ? (prefill
      ? { id: null, name: prefill.name || '', cat: prefill.cat || 'famille', time: prefill.time || 30, portions: prefill.portions || 4,
          ingredients: (prefill.ingredients || []).map(i => ({...i})),
          steps: [...(prefill.steps || [''])],
          photo: prefill.photo }
      : { id: null, name: '', cat: 'famille', time: 30, portions: 4,
          ingredients: [{ qty: 0, unit: 'g', name: '' }], steps: [''] })
    : { ...recipeById(id),
        ingredients: recipeById(id).ingredients.map(i => ({...i})),
        steps: [...recipeById(id).steps] };

  state.modal = { type: 'edit' };
  $('#modal').hidden = false;

  function renderModal() {
    const m = $('#modal');
    m.replaceChildren();
    m.append(h('div', { class: 'modal-card' },
      h('button', { class: 'modal-close', onclick: closeModal }, '×'),
      h('p', { class: 'kicker' }, h('em', {}, 'éditer')),
      h('h2', { class: 'modal-title' }, isNew ? 'Nouvelle recette' : 'Modifier la recette'),
      h('hr', { class: 'dashed' }),

      field('Nom de la recette', h('input', {
        type: 'text', value: r.name,
        oninput: e => r.name = e.target.value,
      })),

      h('div', { class: 'field' },
        h('label', { class: 'field-label' }, 'Photo (optionnel)'),
        h('label', { class: 'dropzone' },
          icon.upload(), 'Ajouter une photo',
          h('input', { type: 'file', accept: 'image/*', class: 'hidden-input',
            onchange: async e => {
              const f = e.target.files[0];
              if (!f) return;
              r.photo = await fileToDataURL(f);
              renderModal();
            } }),
        ),
        r.photo ? h('img', { src: r.photo, style: 'width:100%;border-radius:3px;margin-top:8px;max-height:200px;object-fit:cover' }) : null,
      ),

      h('div', { class: 'field-grid' },
        field('Catégorie', h('select', {
          onchange: e => r.cat = e.target.value,
        }, ...CATEGORIES.map(c =>
          h('option', { value: c.id, selected: c.id === r.cat ? 'selected' : null }, `${c.emoji} ${c.name}`),
        ))),
        field('Portions', h('input', {
          type: 'number', value: String(r.portions), min: '1',
          oninput: e => r.portions = +e.target.value || 1,
        })),
        field('Temps (min)', h('input', {
          type: 'number', value: String(r.time), min: '1',
          oninput: e => r.time = +e.target.value || 1,
        })),
      ),

      h('div', { class: 'row-head' },
        h('label', { class: 'field-label' }, 'Ingrédients'),
        h('button', { class: 'btn-ghost', onclick: () => { r.ingredients.push({qty: 0, unit: 'g', name: ''}); renderModal(); } }, '+ Ajouter'),
      ),
      ...r.ingredients.map((ing, i) => h('div', { class: 'ing-row' },
        h('input', { type: 'text', value: ing.name, placeholder: 'Nom',
          oninput: e => {
            ing.name = e.target.value;
            const u = defaultUnitFor(e.target.value);
            if (u && UNITS.includes(u)) {
              const sel = e.target.closest('.ing-row').querySelector('select');
              if (sel && sel.value === 'g' && ing.qty === 0) sel.value = u, ing.unit = u;
            }
          },
        }),
        h('input', { type: 'number', value: String(ing.qty), placeholder: '0',
          oninput: e => ing.qty = +e.target.value || 0,
        }),
        h('select', { onchange: e => ing.unit = e.target.value },
          ...UNITS.map(u => h('option', { value: u, selected: u === ing.unit ? 'selected' : null }, u)),
        ),
        h('button', { class: 'row-x', onclick: () => { r.ingredients.splice(i, 1); renderModal(); } }, '×'),
      )),

      h('div', { class: 'row-head' },
        h('label', { class: 'field-label' }, 'Étapes'),
        h('button', { class: 'btn-ghost', onclick: () => { r.steps.push(''); renderModal(); } }, '+ Ajouter'),
      ),
      ...r.steps.map((s, i) => h('div', { class: 'step-row' },
        h('span', { class: 'step-num' }, String(i + 1).padStart(2, '0')),
        h('input', { type: 'text', value: s, placeholder: 'Étape ' + (i + 1),
          oninput: e => r.steps[i] = e.target.value,
        }),
        h('button', { class: 'row-x', onclick: () => { r.steps.splice(i, 1); renderModal(); } }, '×'),
      )),

      h('div', { class: 'form-foot' },
        h('button', { class: 'btn', onclick: closeModal }, 'Annuler'),
        h('button', { class: 'btn primary', onclick: save }, 'Enregistrer'),
      ),
    ));
  }

  function save() {
    if (!r.name.trim()) { toast('Nom requis'); return; }
    r.ingredients = r.ingredients.filter(i => i.name.trim());
    r.steps = r.steps.filter(s => s.trim());
    if (isNew) {
      r.id = newId(r.name);
      r.source = 'user';
      state.recipes.push(r);
    } else {
      const existing = recipeById(id);
      Object.assign(existing, r, { _edited: existing.source === 'seed' ? true : undefined });
    }
    persist();
    closeModal();
    render();
    toast(isNew ? 'Recette créée' : 'Recette enregistrée');
  }

  renderModal();
}

function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

// === PICKER ===
export function openPicker(dayIdx, slot) {
  state.modal = { type: 'picker' };
  $('#modal').hidden = false;

  let q = '';
  const listEl = h('div', { class: 'picker-list' });

  function refreshList() {
    const lq = q.toLowerCase();
    const list = state.recipes.filter(r => !lq ||
      r.name.toLowerCase().includes(lq) ||
      catById(r.cat)?.name.toLowerCase().includes(lq));
    listEl.replaceChildren();
    if (list.length === 0) {
      listEl.append(h('p', { class: 'empty' }, 'Aucune recette trouvée.'));
      return;
    }
    list.forEach(r => listEl.append(
      h('button', { class: 'picker-item', onclick: () => {
        state.week[dayIdx][slot] = { recipeId: r.id, portions: r.portions };
        persist(); closeModal(); render(); toast('Plat ajouté');
      } },
        h('span', {}, r.name),
        h('span', { class: 'cat' }, catById(r.cat)?.name || ''),
      ),
    ));
  }
  refreshList();

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, `${DAYS_FR_LONG[dayIdx]} · ${SLOT_LABEL[slot].toLowerCase()}`)),
    h('h2', { class: 'modal-title' }, 'Choisir ', h('em', {}, 'un plat')),

    h('div', { class: 'search' },
      h('span', { class: 'search-icon' }, icon.search()),
      h('input', { type: 'text', placeholder: 'Filtrer…',
        oninput: e => { q = e.target.value; refreshList(); } }),
    ),

    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: () => { closeModal(); openMenuLibre({ dayIdx, slot }); } },
        icon.sparkle(), '(chercher une recette)'),
    ),

    listEl,
  ));
}

// Mémoriser un changement de rayon pour un ingrédient existant
export function openAisleChooser(item) {
  state.modal = { type: 'aisle' };
  $('#modal').hidden = false;
  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, 'rayon')),
    h('h2', { class: 'modal-title' }, item.name),
    h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-size:16px;' },
      'Choisissez le rayon. Tablée mémorisera votre préférence.'),
    h('div', { class: 'aisle-picker' },
      ...AISLES.map(a => h('button', {
        class: 'aisle-chip', 'data-active': a.id === item.aisle ? 'true' : 'false',
        onclick: () => {
          setUserAisle(item.name, a.id);
          for (const m of state.shopping.manual) {
            if (normalizeIngredient(m.name) === normalizeIngredient(item.name)) m.aisle = a.id;
          }
          persist(); closeModal(); render(); toast('Rayon mémorisé');
        },
      },
        h('span', {}, a.emoji),
        h('span', {}, a.name),
      )),
    ),
  ));
}

export function openManualAdd() {
  state.modal = { type: 'manual' };
  $('#modal').hidden = false;

  const seenNames = new Map();
  for (const k of Object.keys(INGREDIENT_DB)) {
    if (!seenNames.has(k)) seenNames.set(k, cap(k));
  }
  for (const r of state.recipes) for (const ing of r.ingredients) {
    const n = normalizeIngredient(ing.name);
    if (!seenNames.has(n)) seenNames.set(n, ing.name);
  }
  for (const it of state.shopping.manual) {
    const n = normalizeIngredient(it.name);
    if (!seenNames.has(n)) seenNames.set(n, it.name);
  }

  let name = '', qty = 1, unit = 'pc', chosenAisle = null;

  const inputEl = h('input', { type: 'text', placeholder: 'Ex. Tomate cerise',
    oninput: e => { name = e.target.value; refreshSuggestions(); refreshAisle(); } });

  const sugEl = h('div', { class: 'autocomplete' });
  const aisleEl = h('div', { class: 'aisle-suggest' });

  const unitSelect = h('select', { onchange: e => unit = e.target.value },
    ...UNITS.map(u => h('option', { value: u, selected: u === 'pc' ? 'selected' : null }, u))
  );
  const qtyInput = h('input', { type: 'number', value: '1', oninput: e => qty = +e.target.value || 0 });

  function refreshSuggestions() {
    sugEl.replaceChildren();
    const q = normalizeIngredient(name);
    if (!q || q.length < 1) return;
    const matches = [...seenNames.entries()]
      .filter(([norm]) => norm.includes(q))
      .slice(0, 6);
    if (matches.length === 0) return;
    matches.forEach(([norm, display]) => sugEl.append(
      h('button', { class: 'autocomplete-item', onclick: () => {
        name = display;
        inputEl.value = display;
        const u = INGREDIENT_DB[norm]?.unit;
        if (u && UNITS.includes(u)) {
          unit = u; unitSelect.value = u;
        }
        chosenAisle = null;
        refreshSuggestions();
        refreshAisle();
        inputEl.focus();
      } },
        h('span', { class: 'emoji' }, INGREDIENT_DB[norm]?.emoji || aisleEmojiOf(aisleFor(display))),
        h('span', {}, display),
        h('span', { class: 'aisle-tag muted' }, AISLES.find(a => a.id === aisleForUser(display))?.name || ''),
      ),
    ));
  }

  function refreshAisle() {
    aisleEl.replaceChildren();
    if (!name.trim()) return;
    const suggested = aisleForUser(name);
    aisleEl.append(
      h('label', { class: 'field-label' }, 'Rayon'),
      h('div', { class: 'aisle-picker' },
        ...AISLES.map(a => h('button', {
          class: 'aisle-chip',
          'data-active': (chosenAisle || suggested) === a.id ? 'true' : 'false',
          onclick: () => { chosenAisle = a.id; refreshAisle(); },
        },
          h('span', {}, a.emoji),
          h('span', {}, a.name),
        )),
      ),
    );
  }

  function add() {
    if (!name.trim()) return;
    const aisle = chosenAisle || aisleForUser(name);
    if (chosenAisle) setUserAisle(name, chosenAisle);
    state.shopping.manual.push({ name: name.trim(), qty, unit, aisle });
    persist(); closeModal(); render();
    toast('Ajouté');
  }

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, 'ajout libre')),
    h('h2', { class: 'modal-title' }, 'Ajouter un ', h('em', {}, 'ingrédient')),

    field('Nom', inputEl),
    sugEl,

    h('div', { class: 'field-grid' },
      field('Quantité', qtyInput),
      field('Unité', unitSelect),
    ),

    aisleEl,

    h('div', { class: 'form-foot' },
      h('button', { class: 'btn', onclick: closeModal }, 'Annuler'),
      h('button', { class: 'btn primary', onclick: add }, 'Ajouter'),
    ),
  ));
}

// === MENU LIBRE ===
export function openMenuLibre(opts = {}) {
  state.modal = { type: 'menulibre' };
  $('#modal').hidden = false;

  let input = '';
  let portions = null;
  let busy = false;
  let llmResult = null;
  let error = null;

  const inputEl = h('input', {
    type: 'text',
    placeholder: 'bœuf haricots pommes de terre pour 4',
    oninput: e => {
      input = e.target.value;
      portions = detectPortions(input);
      refresh();
    },
  });

  const dynEl = h('div', { class: 'menu-libre-dyn' });

  function refresh() {
    dynEl.replaceChildren();

    if (!input.trim()) {
      dynEl.append(h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-style:italic;font-size:16px;margin-top:8px' },
        'Ex. : "bœuf haricots pommes de terre pour 4". Tablée cherche dans la bibliothèque, et n\'appelle l\'IA que si vous lui demandez.'));
      return;
    }

    const matches = localMatch(input, state.recipes, 3);

    if (matches.length > 0) {
      dynEl.append(h('p', { class: 'kicker', style: 'margin-top:14px' }, h('em', {},
        `${matches.length} ${matches.length > 1 ? 'suggestions' : 'suggestion'} de votre bibliothèque`)));
      matches.forEach(r => dynEl.append(matchCard(r, false)));
    } else if (!llmResult) {
      dynEl.append(h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-style:italic;font-size:16px;margin-top:14px' },
        'Aucune correspondance dans votre bibliothèque.'));
    }

    dynEl.append(h('div', { class: 'btn-row', style: 'margin-top:14px;flex-wrap:wrap' },
      hasApiKey()
        ? h('button', { class: 'btn', disabled: busy ? 'disabled' : null, onclick: callLlm },
            icon.sparkle(),
            busy ? 'Recherche IA…'
                 : (matches.length ? 'Autres suggestions (consomme API)' : 'Générer une recette (consomme API)'))
        : null,
      h('button', { class: 'btn', onclick: () => {
          closeModal();
          openEdit(null, { name: cap(input), portions: portions || 4 });
        } }, icon.plus(), 'Créer manuellement'),
    ));

    if (busy) dynEl.append(h('p', { class: 'muted', style: 'margin-top:10px' }, '✨ Recherche IA en cours…'));
    if (error) dynEl.append(h('p', { style: 'color:var(--terra);margin-top:10px' }, error));
    if (llmResult) {
      dynEl.append(h('p', { class: 'kicker', style: 'margin-top:14px' }, h('em', {},
        llmResult.matchedExisting ? "match IA dans votre bibliothèque" : 'recette générée par l\'IA')));
      dynEl.append(matchCard(llmResult, true));
    }

    if (!hasApiKey()) {
      dynEl.append(h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-size:14px;margin-top:14px' },
        'Pour générer une recette via l\'IA, ',
        h('a', { href: '#', onclick: e => { e.preventDefault(); closeModal(); openSettings(); } }, 'configurez votre clé API'),
        '.'));
    }
  }

  function matchCard(r, fromLLM) {
    const cat = catById(r.cat);
    const finalPortions = portions || r.portions;
    return h('div', { class: 'match-card' },
      h('div', { class: 'card-head' },
        h('span', { class: 'card-cat' }, (cat?.name || '').toUpperCase()),
        fromLLM ? h('span', { class: 'card-no' }, '✨ IA') : null,
      ),
      h('h3', { class: 'card-title', style: 'font-size:22px' }, r.name),
      h('p', { class: 'section-meta' },
        `${r.time} min · ${finalPortions} pers · ${r.ingredients.length} ingrédients`),
      h('div', { class: 'btn-row', style: 'flex-wrap:wrap' },
        h('button', { class: 'btn', onclick: () => {
          closeModal();
          if (r.id && state.recipes.find(x => x.id === r.id)) openRecipe(r.id, { portions: finalPortions });
          else openRecipeObject(r, { portions: finalPortions });
        } }, 'Voir'),
        fromLLM ? h('button', { class: 'btn', onclick: () => { busy = true; refresh(); callLlm({ skipCache: true }); } }, 'Générer une autre') : null,
        h('button', { class: 'btn primary', onclick: () => {
          let id = r.id;
          const existing = state.recipes.find(x => x.id === id);
          if (!existing) {
            const newRec = { ...r, id: newId(r.name), source: 'user' };
            delete newRec.matchedExisting;
            state.recipes.push(newRec);
            id = newRec.id;
            persist();
          }
          chooseAndAddToWeek(id, finalPortions, { dayIdx: opts.dayIdx, slot: opts.slot });
        } }, '+ Au menu'),
      ),
    );
  }

  async function callLlm(callOpts = {}) {
    if (!input.trim() || !hasApiKey()) return;
    busy = true; error = null; llmResult = null; refresh();
    try {
      llmResult = await llmMatchOrCreate(input, state.recipes, callOpts);
      try { localStorage.setItem('tablee.lastAI', JSON.stringify(llmResult)); } catch (_) {}
    } catch (err) {
      error = err.message || 'Erreur IA';
    } finally {
      busy = false; refresh();
    }
  }

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, '(chercher une recette)')),
    h('h2', { class: 'modal-title' }, 'Écrire ', h('em', {}, 'un plat')),

    field('Description du plat', inputEl),

    dynEl,

    h('div', { class: 'form-foot' },
      h('button', { class: 'btn', onclick: closeModal }, 'Fermer'),
    ),
  ));
  refresh();
}

// === IMPORT ===
export function openImport() {
  state.modal = { type: 'import' };
  $('#modal').hidden = false;

  let busy = false;
  let extracted = null;
  let error = null;

  const dynEl = h('div');

  function refresh() {
    dynEl.replaceChildren();
    if (!hasApiKey()) {
      dynEl.append(h('p', { class: 'muted' }, 'Clé API requise. ',
        h('a', { href: '#', onclick: e => { e.preventDefault(); closeModal(); openSettings(); } },
          'Configurer →')));
      return;
    }
    if (busy) dynEl.append(h('p', { class: 'muted', style: 'margin-top:14px' }, '✨ Lecture du fichier…'));
    if (error) dynEl.append(h('p', { style: 'color:var(--terra);margin-top:14px' }, error));
    if (extracted) dynEl.append(renderPreview(extracted));
  }

  function renderPreview(r) {
    return h('div', { class: 'match-card' },
      h('p', { class: 'kicker' }, h('em', {}, 'aperçu')),
      h('h3', { style: 'font-family:var(--serif);font-size:24px;margin:4px 0 10px' }, r.name),
      h('p', { class: 'section-meta' },
        `${r.time} min · ${r.portions} pers · ${r.ingredients.length} ingrédients · ${r.steps.length} étapes`),
      h('div', { class: 'btn-row', style: 'flex-wrap:wrap' },
        h('button', { class: 'btn', onclick: () => { closeModal(); openEdit(null, r); } },
          'Vérifier puis enregistrer'),
        h('button', { class: 'btn primary', onclick: () => {
          const rec = { ...r, id: newId(r.name), source: 'user' };
          state.recipes.push(rec);
          persist(); closeModal(); render(); toast('Recette importée');
        } }, 'Enregistrer tel quel'),
      ),
    );
  }

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, 'importer')),
    h('h2', { class: 'modal-title' }, 'Importer ', h('em', {}, 'PDF / Image')),
    h('p', { class: 'muted', style: 'font-family:var(--serif-body);font-style:italic;font-size:16px;' },
      'Photo ou PDF d\'une recette. Tablée extrait titre, portions, temps, ingrédients et étapes.'),

    h('label', { class: 'dropzone', style: 'padding:32px' },
      icon.upload(), 'Choisir un fichier (image ou PDF)',
      h('input', { type: 'file', accept: 'image/*,application/pdf', class: 'hidden-input',
        onchange: async e => {
          const f = e.target.files[0];
          if (!f) return;
          busy = true; error = null; extracted = null; refresh();
          try {
            extracted = await llmExtractFromFile(f);
          } catch (err) {
            error = err.message || 'Erreur extraction';
          } finally {
            busy = false; refresh();
          }
        }, disabled: !hasApiKey() ? 'disabled' : null }),
    ),

    dynEl,

    h('div', { class: 'form-foot' },
      h('button', { class: 'btn', onclick: closeModal }, 'Fermer'),
    ),
  ));
  refresh();
}

// === SETTINGS (Gemini) ===
export function openSettings() {
  state.modal = { type: 'settings' };
  $('#modal').hidden = false;
  let key = getApiKey() || '';

  $('#modal').append(h('div', { class: 'modal-card' },
    h('button', { class: 'modal-close', onclick: closeModal }, '×'),
    h('p', { class: 'kicker' }, h('em', {}, 'réglages')),
    h('h2', { class: 'modal-title' }, h('em', {}, 'Tablée')),
    h('hr', { class: 'dashed' }),

    h('p', { style: 'font-family:var(--serif-body);font-size:17px;line-height:1.5' },
      'Pour le ', h('strong', {}, 'menu libre'), ' et l\'', h('strong', {}, 'import PDF/image'),
      ', Tablée s\'appuie sur ', h('strong', {}, 'Gemini'),
      '. Votre clé reste stockée localement dans ce navigateur, jamais transmise ailleurs que vers ',
      h('code', {}, 'generativelanguage.googleapis.com'), '.'),

    h('div', { class: 'callout' },
      h('strong', {}, '⚠ Sécurité de votre clé. '),
      'La clé est en clair dans ce navigateur (localStorage). ',
      'Pour limiter les risques, créez-en une ', h('strong', {}, 'dédiée à Tablée'),
      ' avec un ', h('strong', {}, 'quota quotidien'),
      ' et, si vous publiez l\'app, une ',
      h('strong', {}, 'restriction de référent HTTP'), ' dans la console Google Cloud.',
    ),

    field('Clé API Gemini', h('input', {
      type: 'password', value: key, placeholder: 'AIzaSy…', autocomplete: 'off',
      oninput: e => key = e.target.value,
    })),
    h('p', { style: 'font-size:12px;color:var(--olive);margin-top:-8px' },
      'Obtenir une clé : ',
      h('a', { href: 'https://aistudio.google.com/apikey', target: '_blank', rel: 'noopener noreferrer' },
        'aistudio.google.com/apikey')),

    h('div', { class: 'form-foot' },
      h('button', { class: 'btn', onclick: () => { setApiKey(null); closeModal(); toast('Clé supprimée'); } }, 'Supprimer'),
      h('button', { class: 'btn primary', onclick: () => { setApiKey(key.trim() || null); closeModal(); toast('Clé enregistrée'); } }, 'Enregistrer'),
    ),

    h('hr', { class: 'dashed' }),
    h('p', { class: 'kicker' }, h('em', {}, 'mes données')),
    h('p', { style: 'font-family:var(--serif-body);font-size:15px;line-height:1.5;margin-top:4px' },
      'Vos recettes, semaine et liste de courses ne quittent pas ce navigateur. ',
      'Exportez-les pour les sauvegarder ou changer d\'appareil.'),

    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: exportData }, icon.download(), 'Exporter mes données'),
      h('label', { class: 'btn' },
        icon.upload(), 'Importer une sauvegarde',
        h('input', {
          type: 'file', accept: 'application/json', class: 'hidden-input',
          onchange: async e => { const f = e.target.files[0]; if (f) await importData(f); },
        }),
      ),
    ),
  ));
}
