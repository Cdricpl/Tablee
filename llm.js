// llm.js — intégration Gemini API côté navigateur
// Stocke la clé en localStorage. La clé n'est envoyée qu'à generativelanguage.googleapis.com.

const KEY = 'tablee.apiKey';

export function hasApiKey() { return !!localStorage.getItem(KEY); }
export function getApiKey() { return localStorage.getItem(KEY); }
export function setApiKey(k) {
  if (!k) localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, k);
  // Try to request persistent storage so the key survives aggressive storage eviction
  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
  } catch (_) {}
}

const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_SMART = 'gemini-2.5-flash'; // flash gère aussi très bien la vision/PDF
const ENDPOINT = m => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;

async function callGemini({ system, parts, model = MODEL_FAST, jsonOnly = true }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Clé API manquante (Réglages)');
  const body = {
    system_instruction: system ? { parts: [{ text: system }] } : undefined,
    contents: [{ role: 'user', parts }],
    generation_config: jsonOnly ? { response_mime_type: 'application/json' } : undefined,
  };
  let res;
  try {
    res = await fetch(ENDPOINT(model), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (_) {
    throw new Error('Connexion impossible à Gemini. Vérifiez votre réseau.');
  }
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    const tail = t.slice(0, 300);
    if (res.status === 400 && /API key not valid/i.test(t))
      throw new Error('Clé API invalide. Vérifiez-la dans Réglages.');
    if (res.status === 401 || res.status === 403)
      throw new Error('Clé API refusée par Google. Vérifiez les restrictions de la clé.');
    if (res.status === 429)
      throw new Error('Quota Gemini dépassé. Réessayez plus tard.');
    if (res.status >= 500)
      throw new Error('Gemini est temporairement indisponible. Réessayez.');
    throw new Error(`Gemini API ${res.status}: ${tail}`);
  }
  const json = await res.json();
  const txt = json?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim() || '';
  if (!txt) throw new Error('Réponse vide de Gemini');
  return txt;
}

function parseJsonFromText(text) {
  let t = (text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) t = fence[1];
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  try {
    return JSON.parse(t);
  } catch (_) {
    throw new Error("Réponse de Gemini illisible. Réessayez.");
  }
}

const RECIPE_SCHEMA_DESC = `{
  "name": "Nom du plat",
  "cat": "viande|volaille|poisson|vege|mijote|rapide|eco|famille|monde|four|sauce",
  "time": 30,
  "portions": 4,
  "ingredients": [{"qty": 600, "unit": "g", "name": "Bœuf"}],
  "steps": ["Étape 1", "Étape 2"]
}`;

const UNITS_HINT = 'Unités autorisées: g, kg, ml, cl, l, pc, cc, cs, pincée, gousse, branche, botte, tranche.';

// Cache des résultats LLM générés (matchedExisting=false), TTL 24h
const LLM_CACHE_KEY = 'tablee.llmCache';
const LLM_CACHE_TTL = 24 * 60 * 60 * 1000;
const normCacheKey = s => (s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');

function llmCacheGet(input) {
  try {
    const all = JSON.parse(localStorage.getItem(LLM_CACHE_KEY) || '{}');
    const e = all[normCacheKey(input)];
    if (!e) return null;
    if (Date.now() - e.t > LLM_CACHE_TTL) return null;
    return e.v;
  } catch (_) { return null; }
}
function llmCachePut(input, v) {
  try {
    const all = JSON.parse(localStorage.getItem(LLM_CACHE_KEY) || '{}');
    all[normCacheKey(input)] = { t: Date.now(), v };
    // Limite simple : 40 entrées max (FIFO grossier)
    const keys = Object.keys(all);
    if (keys.length > 40) {
      const sorted = keys.map(k => [k, all[k].t]).sort((a, b) => a[1] - b[1]);
      for (let i = 0; i < sorted.length - 40; i++) delete all[sorted[i][0]];
    }
    localStorage.setItem(LLM_CACHE_KEY, JSON.stringify(all));
  } catch (_) {}
}

// === MENU LIBRE ===
export async function llmMatchOrCreate(input, recipes, opts = {}) {
  if (!opts.skipCache) {
    const cached = llmCacheGet(input);
    if (cached) return cached;
  }
  const recipeIndex = recipes.map(r => `${r.id} :: ${r.name}`).join('\n');
  const system = `Tu aides à choisir un plat dans une bibliothèque culinaire ou à en créer un.
${UNITS_HINT}

D'abord, regarde si la description correspond à une recette de la bibliothèque (match flexible: ingrédients principaux, technique, type de plat).
Si oui, réponds ce JSON:
{"matchedExisting": true, "id": "<id de la recette>", "portions": <nombre>}

Sinon, crée une recette française complète avec ingrédients réalistes et étapes claires:
${RECIPE_SCHEMA_DESC}
+ "matchedExisting": false

Réponds UNIQUEMENT en JSON, pas de texte autour.`;

  const userMsg = `Bibliothèque (${recipes.length} recettes):
${recipeIndex}

Description du plat: "${input}"`;

  const txt = await callGemini({
    system,
    parts: [{ text: userMsg }],
    model: MODEL_FAST,
  });

  const parsed = parseJsonFromText(txt);

  if (parsed.matchedExisting) {
    const r = recipes.find(x => x.id === parsed.id);
    if (!r) throw new Error('Recette non trouvée dans la bibliothèque');
    return { ...r, matchedExisting: true, portions: parsed.portions || r.portions };
  }
  const result = { ...parsed, matchedExisting: false };
  // On cache uniquement les recettes générées (indépendantes du contenu de la bibliothèque)
  llmCachePut(input, result);
  return result;
}

// === IMPORT (image / pdf) ===
export async function llmExtractFromFile(file) {
  const isPdf = file.type === 'application/pdf';
  const isImg = file.type.startsWith('image/');
  if (!isPdf && !isImg) throw new Error('Format non supporté (image ou PDF requis)');

  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
  const base64 = dataUrl.split(',')[1];

  const system = `Tu extrais une recette à partir d'une photo ou d'un PDF.
${UNITS_HINT}

Retourne UNIQUEMENT ce JSON, sans texte autour:
${RECIPE_SCHEMA_DESC}

Règles:
- "name" en français, capitalisée naturellement
- "cat" parmi: viande, volaille, poisson, vege, mijote, rapide, eco, famille, monde, four, sauce
- "time" en minutes (estime si non précisé)
- "portions" (4 par défaut si non précisé)
- "ingredients": noms en français, quantités numériques
- "steps": étapes courtes et claires en français`;

  const txt = await callGemini({
    system,
    parts: [
      { inline_data: { mime_type: file.type, data: base64 } },
      { text: 'Extrais la recette. JSON uniquement.' },
    ],
    model: MODEL_SMART,
  });

  return parseJsonFromText(txt);
}
