import MiniSearch from 'minisearch';
import { normalize } from './normalize';
import type { Unit } from '../units/types';
import type { Locality } from './types';

export interface LocalitySearchResult {
  id: string;
  teryt: string;
  gminaTeryt: string;
  kind: 'locality';
  name: string;
  type?: string;
  gminaName: string;
  label: string;
  context: string;
  score?: number;
}

export type LocalityData = Locality & {
  id?: string;
  kind?: string;
  type?: string;
};

interface LocalitySearchDoc {
  id: string;
  simc: string;
  name: string;
  normName: string;
  kind?: string;
  gminaTeryt: string;
  locality: LocalityData;
}

export interface LocalitiesIndex {
  ms: MiniSearch<LocalitySearchDoc>;
  unitsMap: Map<string, Unit>;
  localities: LocalityData[];
}

export function buildLocalitiesIndex(
  localities: LocalityData[],
  units: Unit[] | Map<string, Unit> = []
): LocalitiesIndex {
  const unitsMap =
    units instanceof Map
      ? units
      : new Map<string, Unit>(units.map((u) => [u.teryt, u]));

  const docs: LocalitySearchDoc[] = localities.map((loc, index) => {
    const locId = loc.id || loc.simc || `${loc.gminaTeryt}-${index}`;
    return {
      id: locId,
      simc: loc.simc || locId,
      name: loc.name,
      normName: normalize(loc.name),
      kind: loc.kind || loc.type,
      gminaTeryt: loc.gminaTeryt,
      locality: loc,
    };
  });

  const ms = new MiniSearch<LocalitySearchDoc>({
    fields: ['normName'],
    storeFields: ['id', 'simc', 'name', 'normName', 'kind', 'gminaTeryt', 'locality'],
    processTerm: (term) => normalize(term),
  });

  ms.addAll(docs);

  return { ms, unitsMap, localities };
}

function getMatchCategory(queryNorm: string, doc: LocalitySearchDoc): number {
  if (doc.normName === queryNorm) {
    return 1;
  }
  const words = doc.normName.split(' ');
  if (words.some((w) => w.startsWith(queryNorm))) {
    return 2;
  }
  return 3;
}

export function searchLocalities(
  query: string,
  localitiesOrIndex?: LocalityData[] | LocalitiesIndex,
  units: Unit[] | Map<string, Unit> = [],
  options: { limit?: number } = {}
): LocalitySearchResult[] {
  const { limit = 50 } = options;
  const qNorm = normalize(query);

  if (!qNorm || qNorm.length < 2) {
    return [];
  }

  if (!localitiesOrIndex) {
    return [];
  }

  let index: LocalitiesIndex;
  if ('ms' in localitiesOrIndex && 'unitsMap' in localitiesOrIndex) {
    index = localitiesOrIndex as LocalitiesIndex;
  } else {
    index = buildLocalitiesIndex(localitiesOrIndex as LocalityData[], units);
  }

  const msResults = index.ms.search(qNorm, {
    prefix: true,
    fuzzy: (term) => (term.length > 3 ? 0.2 : false),
    combineWith: 'AND',
  });

  const items = msResults.map((r) => {
    const doc = r as unknown as LocalitySearchDoc & { score: number };
    const matchCat = getMatchCategory(qNorm, doc);
    const gminaUnit = index.unitsMap.get(doc.gminaTeryt);
    const gminaName = gminaUnit ? gminaUnit.name : '';
    const locKind = doc.locality.kind || doc.locality.type || doc.kind;

    const formattedGmina = gminaName
      ? gminaName.toLowerCase().startsWith('gmina ')
        ? gminaName
        : `gmina ${gminaName}`
      : '';

    return {
      id: doc.id,
      teryt: doc.gminaTeryt,
      gminaTeryt: doc.gminaTeryt,
      kind: 'locality' as const,
      name: doc.name,
      type: locKind,
      gminaName,
      label: locKind || 'miejscowość',
      context: formattedGmina,
      score: doc.score,
      matchCat,
    };
  });

  items.sort((a, b) => {
    if (a.matchCat !== b.matchCat) {
      return a.matchCat - b.matchCat;
    }
    if (Math.abs(b.score - a.score) > 0.001) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name, 'pl');
  });

  return items.slice(0, limit).map((item) => ({
    id: item.id,
    teryt: item.teryt,
    gminaTeryt: item.gminaTeryt,
    kind: item.kind,
    name: item.name,
    type: item.type,
    gminaName: item.gminaName,
    label: item.label,
    context: item.context,
    score: item.score,
  }));
}
