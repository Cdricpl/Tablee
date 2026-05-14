// Logique pure (sans DOM, sans état global). Testable via `node --test`.
import { normalizeIngredient } from './data.js';

export const STOPWORDS = new Set([
  'pour', 'avec', 'sans', 'de', 'du', 'des', 'et', 'ou', 'la', 'le', 'les',
  'un', 'une', 'personnes', 'personne', 'pers', 'aux', 'au', 'en', 'a', 'à',
]);

export const slug = s => (s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const newId = name => slug(name) + '-' + Math.random().toString(36).slice(2, 7);

export const fmtTime = m => `${m} MIN`;

export const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export function formatQty(q) {
  if (q >= 100) return Math.round(q).toString();
  if (q >= 10) return (Math.round(q * 10) / 10).toString();
  return (Math.round(q * 100) / 100).toString();
}

export function localMatch(input, recipes, max = 3) {
  const tokens = normalizeIngredient(input).split(' ')
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
  if (tokens.length === 0) return [];
  const scored = recipes.map(r => {
    const norm = normalizeIngredient(r.name + ' ' + r.ingredients.map(i => i.name).join(' '));
    let score = 0;
    for (const t of tokens) if (norm.includes(t)) score++;
    return { r, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map(x => x.r);
}

export function detectPortions(text) {
  const m = (text || '').match(/(\d+)\s*(?:pers|personne)/i);
  return m ? +m[1] : null;
}
