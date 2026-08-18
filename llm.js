// llm.js — intégration Gemini API côté navigateur
// Stocke la clé en localStorage. La clé n'est envoyée qu'à generativelanguage.googleapis.com.

import { normalizeRecipeTaxonomy } from './data.js';

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

async function callGemini({ system, parts, model = MODEL_FAST, jsonOnly = true, temperature }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Clé API manquante (Réglages)');
  const genConfig = {};
  if (jsonOnly) genConfig.response_mime_type = 'application/json';
  if (temperature != null) genConfig.temperature = temperature;
  const body = {
    system_instruction: system ? { parts: [{ text: system }] } : undefined,
    contents: [{ role: 'user', parts }],
    generation_config: Object.keys(genConfig).length ? genConfig : undefined,
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
  "cat": "viande|volaille|poisson|vege|dessert|encas|apero|petitdej",
  "tags": ["rapide", "four", "mijote", "sauce", "monde", "eco", "famille"],
  "time": 30,
  "portions": 4,
  "ingredients": [{"qty": 600, "unit": "g", "name": "Bœuf"}],
  "steps": ["Étape 1", "Étape 2"]
}`;

const UNITS_HINT = 'Unités autorisées: g, kg, ml, cl, l, pc, cc, cs, pincée, gousse, branche, botte, tranche.';

// Mémoire des plats déjà proposés pour une même description.
// Une demande de génération relance TOUJOURS l'IA (pas de cache de résultat :
// resservir la recette précédente donnait l'impression que le bouton ne marchait pas).
// On garde seulement les noms déjà sortis, pour demander autre chose la fois suivante.
const LLM_RECENT_KEY = 'tablee.llmRecent';
const LLM_RECENT_TTL = 7 * 24 * 60 * 60 * 1000;
const RECENT_PER_INPUT = 8;
const RECENT_MAX_INPUTS = 40;
const normCacheKey = s => (s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');

function recentGet(input) {
  try {
    const all = JSON.parse(localStorage.getItem(LLM_RECENT_KEY) || '{}');
    const e = all[normCacheKey(input)];
    if (!e || Date.now() - e.t > LLM_RECENT_TTL) return [];
    return Array.isArray(e.names) ? e.names : [];
  } catch (_) { return []; }
}

function recentPut(input, name) {
  if (!name) return;
  try {
    const all = JSON.parse(localStorage.getItem(LLM_RECENT_KEY) || '{}');
    const k = normCacheKey(input);
    const prev = (all[k] && Array.isArray(all[k].names)) ? all[k].names : [];
    const names = [name, ...prev.filter(n => normCacheKey(n) !== normCacheKey(name))].slice(0, RECENT_PER_INPUT);
    all[k] = { t: Date.now(), names };
    const keys = Object.keys(all);
    if (keys.length > RECENT_MAX_INPUTS) {
      const sorted = keys.map(x => [x, all[x].t]).sort((a, b) => a[1] - b[1]);
      for (let i = 0; i < sorted.length - RECENT_MAX_INPUTS; i++) delete all[sorted[i][0]];
    }
    localStorage.setItem(LLM_RECENT_KEY, JSON.stringify(all));
  } catch (_) {}
}

// === MENU LIBRE ===
export async function llmMatchOrCreate(input, recipes) {
  const alreadySeen = recentGet(input);
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

  const avoidBlock = alreadySeen.length
    ? `\n\nDéjà proposé pour cette description (ne les repropose pas, invente une variante nettement différente : autre technique, autre garniture ou autre inspiration) :\n${alreadySeen.map(n => `- ${n}`).join('\n')}`
    : '';

  const userMsg = `Bibliothèque (${recipes.length} recettes):
${recipeIndex}

Description du plat: "${input}"${avoidBlock}`;

  const txt = await callGemini({
    system,
    parts: [{ text: userMsg }],
    model: MODEL_FAST,
    // Température haute : deux clics successifs doivent donner deux plats distincts.
    temperature: 1.2,
  });

  const parsed = parseJsonFromText(txt);

  if (parsed.matchedExisting) {
    const r = recipes.find(x => x.id === parsed.id);
    if (!r) throw new Error('Recette non trouvée dans la bibliothèque');
    return { ...r, matchedExisting: true, portions: parsed.portions || r.portions };
  }
  recentPut(input, parsed.name);
  // Le modèle peut renvoyer une catégorie ou des étiquettes hors liste malgré
  // la consigne : on repasse par les mêmes règles que le reste de l'app.
  return { ...normalizeRecipeTaxonomy({ ...parsed }), matchedExisting: false };
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
- "cat" : une seule valeur, l'ingrédient principal ou le moment du repas — viande, volaille, poisson, vege, dessert, encas, apero, petitdej
- "tags" : liste, éventuellement vide, du style de préparation — rapide, four, mijote, sauce, monde, eco, famille
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

  return normalizeRecipeTaxonomy(parseJsonFromText(txt));
}
