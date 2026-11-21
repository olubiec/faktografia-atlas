import MiniSearch from 'minisearch';
import { normalize } from '../search/normalize';
import { sectionHintFor, synonymsOf } from './synonyms';
import type { CatalogEntry, CatalogSection, CatalogTree } from './tree';

// Szukajka po całym drzewie wyboru danych (minisearch, bez sieci).

export type CatalogHit = { entry: CatalogEntry; section: string; group: string };
export type SearchOutcome =
  | { kind: 'hits'; hits: CatalogHit[] }
  | { kind: 'none'; message: string; nearestSection: string | null };

const MIN_LENGTH = 2;
const MAX_VARIANTS = 12;

/** Polski „stemmer na skróty”: ucina końcówkę, żeby „szkoły” znalazły „szkolnictwo”. */
export function stem(word: string): string {
  const w = normalize(word);
  if (w.length <= 3) return w;
  return w.slice(0, w.length <= 5 ? w.length - 1 : Math.max(4, w.length - 3));
}

type Doc = { key: string; entry: CatalogEntry; section: string; group: string; weight: number; name: string; topic: string };
const engines = new WeakMap<CatalogTree, MiniSearch<Doc>>();

function engineFor(tree: CatalogTree): MiniSearch<Doc> {
  const cached = engines.get(tree);
  if (cached) return cached;
  const engine = new MiniSearch<Doc>({
    idField: 'key',
    fields: ['name', 'topic', 'group', 'section'],
    storeFields: ['entry', 'section', 'group', 'weight'],
    processTerm: (term) => stem(term) || null,
  });
  engine.addAll(
    tree.sections.flatMap((s) =>
      s.groups.flatMap((g) =>
        g.entries.map((entry) => ({
          key: `${s.id}|${g.id}|${entry.id}`, entry, section: s.name, group: g.name,
          weight: s.weight, name: entry.name, topic: entry.topic,
        })),
      ),
    ),
  );
  engines.set(tree, engine);
  return engine;
}

/** Wpisane słowa → warianty zapytania: każde słowo samo albo z jednym z synonimów (z limitem). */
export function queryVariants(text: string): string[] {
  const words = normalize(text).split(' ').filter(Boolean);
  let variants: string[][] = [[]];
  for (const w of words) {
    const options = [w, ...synonymsOf(w)];
    variants = variants.flatMap((v) => options.map((o) => [...v, o])).slice(0, MAX_VARIANTS);
  }
  return variants.map((v) => v.join(' '));
}

/**
 * Szukanie po całym drzewie: wszystkie słowa muszą pasować (początek słowa, bez polskich liter i wielkości liter).
 * Wbudowane są wyżej, wyżej też działy o większej wadze z config/library-priority.json.
 */
export function searchCatalog(tree: CatalogTree, text: string, limit = 50): CatalogHit[] {
  if (normalize(text).length < MIN_LENGTH) return [];
  const engine = engineFor(tree);
  const best = new Map<string, { score: number; hit: CatalogHit }>();
  for (const query of queryVariants(text)) {
    const found = engine.search(query, {
      prefix: true,
      combineWith: 'AND',
      boost: { topic: 3, group: 2, name: 2 },
      boostDocument: (_id, _term, stored) => {
        const entry = stored?.entry as CatalogEntry | undefined;
        const weight = Number(stored?.weight ?? 20);
        return (entry?.builtin ? 4 : 1) * (0.5 + weight / 100);
      },
    });
    for (const h of found) {
      const hit: CatalogHit = { entry: h.entry as CatalogEntry, section: String(h.section), group: String(h.group) };
      const prev = best.get(hit.entry.id);
      if (!prev || h.score > prev.score) best.set(hit.entry.id, { score: h.score, hit });
    }
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit).map((b) => b.hit);
}

/** Najbliższy dział dla frazy bez wyniku: podpowiedź z synonimów albo dopasowanie po nazwie działu. */
export function nearestSection(tree: CatalogTree, text: string): CatalogSection | null {
  const words = normalize(text).split(' ').filter(Boolean);
  const byName = (key: string) => tree.sections.find((s) => normalize(s.name).startsWith(key));
  for (const w of words) {
    const hint = sectionHintFor(w);
    const found = hint ? byName(hint) : undefined;
    if (found) return found;
  }
  for (const w of words) {
    const root = stem(w);
    if (root.length < 3) continue;
    const found = tree.sections.find((s) => normalize(s.name).split(' ').some((p) => p.startsWith(root)));
    if (found) return found;
  }
  return null;
}

export const noDataMessage = (text: string) => `Nie mamy jeszcze tych danych o „${text.trim()}”.`;

/** Wynik do pokazania: trafienia albo komunikat „Nie mamy jeszcze tych danych” z najbliższym działem. */
export function searchOutcome(tree: CatalogTree, text: string, limit = 200): SearchOutcome {
  const hits = searchCatalog(tree, text, limit);
  if (hits.length > 0) return { kind: 'hits', hits };
  return { kind: 'none', message: noDataMessage(text), nearestSection: nearestSection(tree, text)?.name ?? null };
}
