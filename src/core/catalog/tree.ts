import priority from '../../../config/library-priority.json';
import type { AvailableFile } from '../indicators/registry';
import type { Indicator } from '../profile/profile';
import { normalize } from '../search/normalize';
import type { UnitLevel } from '../units/types';

// Drzewo wyboru danych: Dział › Grupa › Wskaźnik. Czysta logika, bez sieci.
// Źródło: wskaźniki wbudowane (config/indicators.json) + lekki spis pobranych (available.json).

export type CatalogEntry = {
  id: string;
  name: string;
  /** Dział i grupa, w której wskaźnik leży (nazwy do pokazania). */
  section: string;
  group: string;
  /** Temat (podgrupa GUS) – nagłówek nad wierszami w grupie; pusty dla wbudowanych. */
  topic: string;
  unit: string;
  levels: UnitLevel[];
  builtin: boolean;
};
export type CatalogGroup = { id: string; name: string; entries: CatalogEntry[] };
export type CatalogSection = { id: string; name: string; weight: number; groups: CatalogGroup[]; count: number };
export type CatalogTree = { sections: CatalogSection[]; total: number };

export const BASIC_GROUP = 'Najważniejsze';
/** Grupy archiwalne nie wchodzą do menu (decyzja właściciela: bez danych archiwalnych). */
const ARCHIVE_NAME = 'dane archiwalne';
const ACRONYMS = new Set(['PSR', 'GUGIK']);

/** Wbudowane wskaźniki → dział (początek nazwy działu GUS). */
const BUILTIN_SECTION: Record<string, string> = {
  population: 'Ludność', density: 'Ludność', 'natural-increase': 'Ludność',
  'migration-balance': 'Ludność', 'share-65plus': 'Ludność', 'median-age': 'Ludność',
  'unemployment-rate': 'Rynek pracy', 'unemployed-share-working-age': 'Rynek pracy',
  'avg-wage': 'Rynek pracy', 'income-per-capita': 'Finanse publiczne',
  'spending-per-capita': 'Finanse publiczne', 'regon-per-10k': 'Podmioty gospodarki',
  'dwellings-per-1000': 'Gospodarka mieszkaniowa', 'dwelling-area-per-person': 'Gospodarka mieszkaniowa',
  'forest-cover': 'Leśnictwo', 'sewerage-share': 'Stan i ochrona środowiska',
  'preschool-3-6': 'Wychowanie przedszkolne', 'library-readers-per-1000': 'Kultura',
  'tourist-nights-per-1000': 'Turystyka', 'cars-per-1000': 'Transport i łączność',
};

type Priority = { sectionWeights: Record<string, number>; defaultSectionWeight: number };
const WEIGHTS = (priority as Priority).sectionWeights;
const DEFAULT_WEIGHT = (priority as Priority).defaultSectionWeight;
/** Klucze wag w kolejności pliku: przy równej wadze działy idą tak, jak w configu. */
const WEIGHT_KEYS = Object.keys(WEIGHTS).map((key) => ({ key, norm: normalize(key) }));

/** „SZKOLNICTWO PODSTAWOWE” → „Szkolnictwo podstawowe” (skróty z listy zostają wielkie). */
export function titleCase(raw: string): string {
  const text = raw
    .trim()
    .split(/\s+/)
    .map((w) => (ACRONYMS.has(w) ? w : w.toLowerCase()))
    .join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Pozycja klucza z library-priority.json dla działu: nazwa równa albo jedna jest początkiem drugiej. */
function priorityIndex(name: string): number {
  const n = normalize(name);
  const exact = WEIGHT_KEYS.findIndex((k) => k.norm === n);
  if (exact !== -1) return exact;
  let best = -1;
  let bestLen = 0;
  WEIGHT_KEYS.forEach((k, at) => {
    const related = n.startsWith(k.norm) || k.norm.startsWith(n);
    const len = Math.min(n.length, k.norm.length);
    if (related && len > bestLen) {
      best = at;
      bestLen = len;
    }
  });
  return best;
}

/** Waga działu z config/library-priority.json (malejąco = wyżej). */
export function sectionWeight(name: string): number {
  const at = priorityIndex(name);
  return at === -1 ? DEFAULT_WEIGHT : (WEIGHTS[WEIGHT_KEYS[at]!.key] ?? DEFAULT_WEIGHT);
}

const startsWithKey = (name: string, key: string) => normalize(name).startsWith(normalize(key));
const isArchive = (group: string) => normalize(group) === ARCHIVE_NAME;

type Draft = Map<string, Map<string, CatalogEntry[]>>;

function put(draft: Draft, section: string, group: string, entry: CatalogEntry) {
  const groups = draft.get(section) ?? new Map<string, CatalogEntry[]>();
  groups.set(group, [...(groups.get(group) ?? []), entry]);
  draft.set(section, groups);
}

function sectionKey(draft: Draft, key: string): string {
  return [...draft.keys()].find((name) => startsWithKey(name, key)) ?? key;
}

function groupOrder(a: CatalogGroup, b: CatalogGroup): number {
  const weight = (g: CatalogGroup) => (g.name === BASIC_GROUP ? 0 : 1);
  return weight(a) - weight(b) || b.entries.length - a.entries.length || a.name.localeCompare(b.name, 'pl');
}

function levelsOf(i: Indicator): UnitLevel[] {
  return i.minLevel === 'gmi' ? ['woj', 'pow', 'gmi'] : i.minLevel === 'pow' ? ['woj', 'pow'] : ['woj'];
}

/**
 * Buduje drzewo: każdy wskaźnik trafia do dokładnie jednej grupy (powtórzone id i bdlVarId pomijamy).
 * Bez grupy „Dane archiwalne”; wbudowane w grupie „Najważniejsze” swojego działu; działy wg wag z configu.
 */
export function buildCatalogTree(main: Indicator[], available: AvailableFile | null): CatalogTree {
  const draft: Draft = new Map();
  const seen = new Set<string>();
  const seenBdl = new Set<number>();
  const lib = (available?.variables ?? []).filter((v) => v.id && v.n && v.c && v.lv.length > 0);
  for (const v of lib) {
    const [rawSection = '', rawGroup = '', rawTopic = ''] = (v.c ?? '').split(' > ').map((p) => p.trim());
    if (!rawSection || !rawGroup || isArchive(rawGroup) || seen.has(`b${v.id}`)) continue;
    seen.add(`b${v.id}`);
    const section = titleCase(rawSection);
    const group = titleCase(rawGroup);
    put(draft, section, group, {
      id: `b${v.id}`, name: v.n, section, group, topic: titleCase(rawTopic),
      unit: v.u ?? '', levels: v.lv, builtin: false,
    });
  }
  // Wbudowane na końcu, bo ich dział (np. „Turystyka”) może jeszcze nie istnieć w bibliotece.
  for (const i of main) {
    if (seen.has(i.id) || seenBdl.has(i.bdlVarId)) continue;
    seen.add(i.id);
    seenBdl.add(i.bdlVarId);
    const section = sectionKey(draft, BUILTIN_SECTION[i.id] ?? i.group);
    put(draft, section, BASIC_GROUP, {
      id: i.id, name: i.name, section, group: BASIC_GROUP, topic: '', unit: i.unit,
      levels: levelsOf(i), builtin: true,
    });
  }
  const sections = [...draft.entries()].map(([name, groups]): CatalogSection => {
    // Wskaźnik z biblioteki o tym samym bdlVarId co wbudowany nie może zostać na liście drugi raz.
    const list = [...groups.entries()]
      .map(([g, entries]) => ({
        id: `${name}|${g}`,
        name: g,
        entries: entries.filter((e) => e.builtin || !seenBdl.has(Number(e.id.slice(1)))),
      }))
      .filter((g) => g.entries.length > 0)
      .sort(groupOrder);
    return { id: name, name, weight: sectionWeight(name), groups: list, count: list.reduce((n, g) => n + g.entries.length, 0) };
  });
  const order = (s: CatalogSection) => {
    const at = priorityIndex(s.name);
    return at === -1 ? WEIGHT_KEYS.length : at;
  };
  sections.sort((a, b) => b.weight - a.weight || order(a) - order(b) || b.count - a.count || a.name.localeCompare(b.name, 'pl'));
  const kept = sections.filter((s) => s.count > 0);
  return { sections: kept, total: kept.reduce((n, s) => n + s.count, 0) };
}

/** Wszystkie wskaźniki drzewa jednym płaskim wektorem (do testów i statystyk). */
export function flattenTree(tree: CatalogTree): CatalogEntry[] {
  return tree.sections.flatMap((s) => s.groups.flatMap((g) => g.entries));
}
