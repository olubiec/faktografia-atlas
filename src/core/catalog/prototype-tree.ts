import MiniSearch from 'minisearch';
import type { AvailableFile } from '../indicators/registry';
import type { Indicator } from '../profile/profile';
import { normalize } from '../search/normalize';
import type { UnitLevel } from '../units/types';

// PROTOTYP (U04): drzewo Dział › Grupa › Wskaźnik z wbudowanych i pobranych wskaźników
// oraz szukajka po całym drzewie. Czysta logika, bez sieci. Wejście: to, co dziś daje
// rejestr (config/indicators.json + available.json).

export type CatalogEntry = {
  id: string;
  name: string;
  /** Temat (podgrupa GUS) – nagłówek nad wierszami w grupie; pusty dla wbudowanych. */
  topic: string;
  unit: string;
  levels: UnitLevel[];
  builtin: boolean;
};
export type CatalogGroup = { id: string; name: string; entries: CatalogEntry[] };
export type CatalogSection = { id: string; name: string; groups: CatalogGroup[]; count: number };
export type CatalogTree = { sections: CatalogSection[]; total: number };
export type CatalogHit = { entry: CatalogEntry; section: string; group: string };

export const BASIC_GROUP = 'Najważniejsze';
const ARCHIVE_NAME = 'dane archiwalne';
const ACRONYMS = new Set(['PSR', 'GUGIK']);

/** Wbudowane wskaźniki → dział (początek nazwy działu GUS, bez polskich liter). */
const BUILTIN_SECTION: Record<string, string> = {
  population: 'Ludność', density: 'Ludność', 'natural-increase': 'Ludność',
  'migration-balance': 'Ludność', 'share-65plus': 'Ludność', 'median-age': 'Ludność',
  'unemployment-rate': 'Rynek pracy', 'unemployed-share-working-age': 'Rynek pracy',
  'avg-wage': 'Rynek pracy', 'income-per-capita': 'Samorząd terytorialny',
  'spending-per-capita': 'Samorząd terytorialny', 'regon-per-10k': 'Podmioty gospodarki',
  'dwellings-per-1000': 'Gospodarka mieszkaniowa', 'dwelling-area-per-person': 'Gospodarka mieszkaniowa',
  'forest-cover': 'Leśnictwo', 'sewerage-share': 'Stan i ochrona środowiska',
  'preschool-3-6': 'Wychowanie przedszkolne', 'library-readers-per-1000': 'Kultura',
  'tourist-nights-per-1000': 'Turystyka', 'cars-per-1000': 'Transport i łączność',
};

/**
 * Propozycja kolejności działów: to, czego szuka zwykły człowiek, na górze.
 * Do zgrania z config/library-priority.json (zadanie U11), gdy ten plik powstanie.
 */
export const SECTION_ORDER = [
  'Ludność', 'Rynek pracy', 'Gospodarka mieszkaniowa', 'Samorząd terytorialny', 'Szkolnictwo',
  'Wychowanie przedszkolne', 'Ochrona zdrowia', 'Stan i ochrona środowiska', 'Transport',
  'Kultura', 'Turystyka', 'Podmioty gospodarki', 'Przemysł i budownictwo', 'Handel', 'Rolnictwo',
  'Leśnictwo', 'Powszechne spisy rolne', 'Podział terytorialny',
];

/** „SZKOLNICTWO PODSTAWOWE” → „Szkolnictwo podstawowe” (skróty z listy zostają wielkie). */
export function titleCase(raw: string): string {
  const text = raw
    .trim()
    .split(/\s+/)
    .map((w) => (ACRONYMS.has(w) ? w : w.toLowerCase()))
    .join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const startsWithKey = (name: string, key: string) => normalize(name).startsWith(normalize(key));
const rank = (name: string) => {
  const at = SECTION_ORDER.findIndex((k) => startsWithKey(name, k));
  return at === -1 ? SECTION_ORDER.length : at;
};

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
  const weight = (g: CatalogGroup) => (g.name === BASIC_GROUP ? 0 : normalize(g.name) === ARCHIVE_NAME ? 2 : 1);
  return weight(a) - weight(b) || b.entries.length - a.entries.length || a.name.localeCompare(b.name, 'pl');
}

/** Buduje drzewo: każdy wskaźnik trafia do dokładnie jednej grupy (powtórzone id i bdlVarId pomijamy). */
export function buildCatalogTree(main: Indicator[], available: AvailableFile | null): CatalogTree {
  const draft: Draft = new Map();
  const seen = new Set<string>();
  const seenBdl = new Set<number>();
  const lib = (available?.variables ?? []).filter((v) => v.id && v.n && v.c && v.lv.length > 0);
  for (const v of lib) {
    const [section = '', group = '', topic = ''] = (v.c ?? '').split(' > ').map((p) => p.trim());
    if (!section || !group || seen.has(`b${v.id}`)) continue;
    seen.add(`b${v.id}`);
    put(draft, titleCase(section), titleCase(group), {
      id: `b${v.id}`, name: v.n, topic: titleCase(topic), unit: v.u ?? '', levels: v.lv, builtin: false,
    });
  }
  // Wbudowane na końcu, bo ich dział (np. „Turystyka”) może jeszcze nie istnieć w bibliotece.
  for (const i of main) {
    if (seen.has(i.id) || seenBdl.has(i.bdlVarId)) continue;
    seen.add(i.id);
    seenBdl.add(i.bdlVarId);
    const levels: UnitLevel[] = i.minLevel === 'gmi' ? ['woj', 'pow', 'gmi'] : i.minLevel === 'pow' ? ['woj', 'pow'] : ['woj'];
    const section = sectionKey(draft, BUILTIN_SECTION[i.id] ?? i.group);
    put(draft, section, BASIC_GROUP, {
      id: i.id, name: i.name, topic: '', unit: i.unit, levels, builtin: true,
    });
  }
  // Wskaźnik z biblioteki o tym samym bdlVarId co wbudowany nie może zostać na liście drugi raz.
  const sections = [...draft.entries()].map(([name, groups]): CatalogSection => {
    const list = [...groups.entries()]
      .map(([g, entries]) => ({ id: `${name}|${g}`, name: g, entries: dedupe(entries, seenBdl) }))
      .filter((g) => g.entries.length > 0)
      .sort(groupOrder);
    return { id: name, name, groups: list, count: list.reduce((n, g) => n + g.entries.length, 0) };
  });
  sections.sort((a, b) => rank(a.name) - rank(b.name) || b.count - a.count || a.name.localeCompare(b.name, 'pl'));
  return { sections: sections.filter((s) => s.count > 0), total: sections.reduce((n, s) => n + s.count, 0) };
}

function dedupe(entries: CatalogEntry[], builtinBdl: Set<number>): CatalogEntry[] {
  return entries.filter((e) => e.builtin || !builtinBdl.has(Number(e.id.slice(1))));
}

/** Polski „stemmer na skróty”: ucina końcówkę, żeby „szkoły” znalazły „szkolnictwo”. */
export function stem(word: string): string {
  const w = normalize(word);
  if (w.length <= 3) return w;
  return w.slice(0, w.length <= 5 ? w.length - 1 : Math.max(4, w.length - 3));
}

type Doc = CatalogHit & { key: string; name: string; topic: string; groupName: string; sectionName: string };
/** Słowa zwykłych ludzi, których nie ma w nazwach GUS → słowo z nazwy wskaźnika. */
const SYNONYMS: Record<string, string> = { zarobki: 'wynagrodzenie', place: 'wynagrodzenie', pensje: 'wynagrodzenie', mieszkancy: 'ludnosc' };
const engines = new WeakMap<CatalogTree, MiniSearch<Doc>>();

function engineFor(tree: CatalogTree): MiniSearch<Doc> {
  const cached = engines.get(tree);
  if (cached) return cached;
  const engine = new MiniSearch<Doc>({
    idField: 'key',
    fields: ['name', 'topic', 'groupName', 'sectionName'],
    storeFields: ['entry', 'section', 'group'],
    processTerm: (term) => stem(term) || null,
  });
  engine.addAll(
    tree.sections.flatMap((s) =>
      s.groups.flatMap((g) =>
        g.entries.map((entry) => ({
          key: `${s.id}|${g.id}|${entry.id}`, entry, section: s.name, group: g.name,
          name: entry.name, topic: entry.topic, groupName: g.name, sectionName: s.name,
        })),
      ),
    ),
  );
  engines.set(tree, engine);
  return engine;
}

/** Szukanie po całym drzewie: wszystkie słowa muszą pasować (początek słowa, bez polskich liter). */
export function searchCatalog(tree: CatalogTree, text: string, limit = 50): CatalogHit[] {
  const words = normalize(text).split(' ').filter(Boolean).map((w) => SYNONYMS[w] ?? w);
  if (words.join(' ').length < 2) return [];
  const hits = engineFor(tree).search(words.join(' '), {
    prefix: true,
    combineWith: 'AND',
    boost: { topic: 3, groupName: 2, name: 2 },
    // Wbudowane najpierw, grupa „Dane archiwalne” niżej, wcześniejsze działy lekko wyżej.
    boostDocument: (_id, _term, stored) => {
      const entry = stored?.entry as CatalogEntry | undefined;
      const archive = normalize(String(stored?.group ?? '')) === ARCHIVE_NAME ? 0.5 : 1;
      return (entry?.builtin ? 4 : 1) * archive * (1 + (SECTION_ORDER.length - rank(String(stored?.section ?? ''))) / 40);
    },
  });
  return hits.slice(0, limit).map((h) => ({ entry: h.entry as CatalogEntry, section: String(h.section), group: String(h.group) }));
}

/** Liczby do raportu: ile działów, grup, wskaźników i ile ma dane na danym poziomie. */
export function treeStats(tree: CatalogTree) {
  const entries = tree.sections.flatMap((s) => s.groups.flatMap((g) => g.entries));
  const withLevel = (l: UnitLevel) => entries.filter((e) => e.levels.includes(l)).length;
  return {
    sections: tree.sections.length,
    groups: tree.sections.reduce((n, s) => n + s.groups.length, 0),
    entries: entries.length,
    woj: withLevel('woj'), pow: withLevel('pow'), gmi: withLevel('gmi'),
  };
}
