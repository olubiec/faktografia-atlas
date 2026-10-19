import MiniSearch from 'minisearch';
import type { Unit } from '../units/types';
import { normalize } from './normalize';
import type { Locality, SearchDoc, SearchIndex, SearchOptions, SearchResult } from './types';

export { normalize };
export type { Locality, SearchDoc, SearchIndex, SearchOptions, SearchResult, SearchResultKind } from './types';

/**
 * Zwraca czytelną etykietę określającą rodzaj jednostki.
 */
function getUnitLabel(unit: Unit): string {
  if (unit.level === 'woj') {
    return 'województwo';
  }
  if (unit.level === 'pow') {
    return unit.teryt[2] === '6' ? 'miasto na prawach powiatu' : 'powiat';
  }
  const lastDigit = unit.teryt.slice(-1);
  if (lastDigit === '1') return 'gmina miejska';
  if (lastDigit === '2') return 'gmina wiejska';
  if (lastDigit === '3') return 'gmina miejsko-wiejska';
  return 'gmina';
}

/**
 * Zwraca kontekst nadrzędny jednostki.
 */
function getUnitContext(unit: Unit, unitsMap: Map<string, Unit>): string {
  if (unit.level === 'woj') {
    return '';
  }
  if (unit.level === 'pow') {
    const parentWoj = unit.parent ? unitsMap.get(unit.parent) : null;
    return parentWoj ? parentWoj.name : '';
  }
  if (unit.level === 'gmi') {
    const parentPow = unit.parent ? unitsMap.get(unit.parent) : null;
    const parentWoj = parentPow && parentPow.parent ? unitsMap.get(parentPow.parent) : null;
    if (parentPow && parentWoj) {
      return `${parentPow.name}, ${parentWoj.name}`;
    }
    if (parentPow) {
      return parentPow.name;
    }
  }
  return '';
}

/**
 * Zwraca nazwę bez przedrostka "powiat " dla powiatów.
 */
function getCleanName(unit: Unit): string {
  if (unit.level === 'pow' && unit.name.toLowerCase().startsWith('powiat ')) {
    return unit.name.slice(7);
  }
  return unit.name;
}

/**
 * Sprawdza, czy jednostka jest miastem na prawach powiatu lub jego gminą.
 */
function isMnpp(unit: Unit, unitsMap: Map<string, Unit>): boolean {
  if (unit.level === 'pow' && unit.teryt[2] === '6') {
    return true;
  }
  if (unit.level === 'gmi' && unit.parent) {
    const parentPow = unitsMap.get(unit.parent);
    if (parentPow && parentPow.teryt[2] === '6') {
      return true;
    }
  }
  return false;
}

/**
 * Zwraca pozycję w hierarchii ważności przy remisie:
 * wojewodztwo (1) > miasto na prawach powiatu i jego gmina (2) > powiat (3) > pozostale gminy (4)
 */
function getTierRank(unit: Unit, unitsMap: Map<string, Unit>): number {
  if (unit.level === 'woj') return 1;
  if (isMnpp(unit, unitsMap)) {
    return unit.level === 'gmi' ? 2 : 2.1;
  }
  if (unit.level === 'pow') return 3;
  return 4;
}

/**
 * Określa kategoryzację dopasowania do zapytania:
 * 1 = dokładna nazwa
 * 2 = początek nazwy (prefix)
 * 3 = dopasowanie przybliżone (literówka)
 */
function getMatchCategory(queryNorm: string, doc: SearchDoc): number {
  if (doc.normName === queryNorm || doc.normClean === queryNorm) {
    return 1;
  }

  const words = `${doc.normName} ${doc.normClean}`.split(' ');
  if (words.some((w) => w.startsWith(queryNorm))) {
    return 2;
  }

  return 3;
}

/**
 * Buduje indeks wyszukiwania dla jednostek administracyjnych i opcjonalnych miejscowości.
 */
export function buildSearchIndex(units: Unit[], localities: Locality[] = []): SearchIndex {
  const unitsMap = new Map<string, Unit>();
  for (const u of units) {
    unitsMap.set(u.teryt, u);
  }

  const docs: SearchDoc[] = [];

  for (const u of units) {
    const clean = getCleanName(u);
    docs.push({
      id: `unit:${u.teryt}`,
      teryt: u.teryt,
      kind: 'unit',
      name: u.name,
      cleanName: clean,
      normName: normalize(u.name),
      normClean: normalize(clean),
      level: u.level,
      label: getUnitLabel(u),
      context: getUnitContext(u, unitsMap),
      unit: u,
    });
  }

  for (const loc of localities) {
    const parentGmi = unitsMap.get(loc.gminaTeryt);
    const context = parentGmi ? getUnitContext(parentGmi, unitsMap) : '';
    docs.push({
      id: `loc:${loc.id}`,
      teryt: loc.id,
      kind: 'locality',
      name: loc.name,
      cleanName: loc.name,
      normName: normalize(loc.name),
      normClean: normalize(loc.name),
      label: 'miejscowość',
      context,
      locality: loc,
    });
  }

  const ms = new MiniSearch<SearchDoc>({
    fields: ['normName', 'normClean'],
    storeFields: ['id', 'teryt', 'kind', 'name', 'level', 'label', 'context', 'normName', 'normClean', 'unit', 'locality'],
    processTerm: (term) => normalize(term),
  });

  ms.addAll(docs);

  return { ms, unitsMap };
}

/**
 * Wyszukuje jednostki i miejscowości na podstawie zapytania tekstowego.
 */
export function search(index: SearchIndex, query: string, options: SearchOptions = {}): SearchResult[] {
  const { limit = 8 } = options;
  const qNorm = normalize(query);

  if (!qNorm || qNorm.length < 2) {
    return [];
  }

  const msResults = index.ms.search(qNorm, {
    prefix: true,
    fuzzy: (term) => (term.length > 3 ? 0.2 : false),
    combineWith: 'AND',
  });

  const items = msResults.map((r) => {
    const doc = r as unknown as SearchDoc & { score: number };
    const unit = doc.unit;
    const matchCat = getMatchCategory(qNorm, doc);
    const tier = unit ? getTierRank(unit, index.unitsMap) : 5;

    return {
      kind: doc.kind,
      teryt: doc.teryt,
      name: doc.name,
      level: doc.level,
      label: doc.label,
      context: doc.context,
      score: doc.score,
      matchCat,
      tier,
    };
  });

  items.sort((a, b) => {
    // 1. Dokładna nazwa > początek nazwy > dopasowanie przybliżone
    if (a.matchCat !== b.matchCat) {
      return a.matchCat - b.matchCat;
    }
    // 2. Hierarchia rodzajów przy remisie
    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }
    // 3. Ocena MiniSearch
    if (Math.abs(b.score - a.score) > 0.001) {
      return b.score - a.score;
    }
    // 4. Alfabetycznie localeCompare('pl')
    return a.name.localeCompare(b.name, 'pl');
  });

  return items.slice(0, limit).map((item) => ({
    kind: item.kind,
    teryt: item.teryt,
    name: item.name,
    level: item.level,
    label: item.label,
    context: item.context,
    score: item.score,
  }));
}
