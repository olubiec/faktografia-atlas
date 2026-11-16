import MiniSearch from 'minisearch';
import type { Unit } from '../units/types';
import { normalize } from './normalize';
import { getCleanName, getMatchCategory, getTierRank, getUnitContext, getUnitLabel } from './unit-meta';
import type { Locality, SearchDoc, SearchIndex, SearchOptions, SearchResult } from './types';

export { normalize };
export type { Locality, SearchDoc, SearchIndex, SearchOptions, SearchResult, SearchResultKind } from './types';

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
