import { standaloneName } from '../catalog/standalone-name';
import { normalize } from '../search/normalize';
import type { Indicator } from '../profile/profile';
import type { UnitLevel } from '../units/types';

export const LIBRARY_ID_PREFIX = 'b';
const LIBRARY_NOTE = '(z biblioteki GUS)';

export type AvailableVariable = {
  id: string;
  n: string;
  u: string;
  s?: string;
  c?: string;
  lv: UnitLevel[];
  y: number[];
};

export type AvailableFile = {
  version: number;
  generatedAt?: string;
  variables: AvailableVariable[];
};

export type Registry = {
  all: Indicator[];
  byId: Map<string, Indicator>;
  library: Indicator[];
  years: Map<string, number[]>;
  levels: Map<string, UnitLevel[]>;
};

export function libraryIndicatorId(varId: string | number): string {
  return `${LIBRARY_ID_PREFIX}${varId}`;
}

export function isLibraryIndicatorId(id: string): boolean {
  return /^b\d+$/.test(id);
}

export function libraryVarId(id: string): string | null {
  return isLibraryIndicatorId(id) ? id.slice(LIBRARY_ID_PREFIX.length) : null;
}

const LEVELS: UnitLevel[] = ['woj', 'pow', 'gmi'];

function isValid(v: AvailableVariable | null | undefined): v is AvailableVariable {
  return (
    !!v &&
    typeof v.id === 'string' && /^\d+$/.test(v.id) &&
    typeof v.n === 'string' && v.n.trim() !== '' &&
    Array.isArray(v.lv) && v.lv.some((l) => LEVELS.includes(l))
  );
}

/** Najmniejsza jednostka z danymi: gmi > pow > woj. */
function minLevelOf(lv: UnitLevel[]): UnitLevel {
  if (lv.includes('gmi')) return 'gmi';
  if (lv.includes('pow')) return 'pow';
  return 'woj';
}

function toIndicator(v: AvailableVariable, duplicatesMain: boolean): Indicator {
  const path = v.c ?? '';
  const note = duplicatesMain ? ` ${LIBRARY_NOTE}` : '';
  return {
    id: libraryIndicatorId(v.id),
    bdlVarId: Number(v.id),
    name: standaloneName(v.n, v.c),
    unit: v.u ?? '',
    description: `${path}${note}`.trim(),
    group: path.split(' > ')[0] ?? '',
    higherIsBetter: null,
    minLevel: minLevelOf(v.lv),
  };
}

/** Wspólny rejestr: wskaźniki główne (jak w configu), potem biblioteka po nazwie. Czysta funkcja. */
export function buildRegistry(main: Indicator[], available: AvailableFile | null): Registry {
  const byId = new Map<string, Indicator>();
  const years = new Map<string, number[]>();
  const levels = new Map<string, UnitLevel[]>();
  const all: Indicator[] = [];
  for (const i of main) {
    if (byId.has(i.id)) continue;
    byId.set(i.id, i);
    all.push(i);
  }
  const mainNames = new Set(main.map((i) => normalize(i.name)));
  const library: Indicator[] = [];
  const meta = new Map<string, AvailableVariable>();
  for (const v of available?.variables ?? []) {
    if (!isValid(v) || byId.has(libraryIndicatorId(v.id))) continue;
    const ind = toIndicator(v, mainNames.has(normalize(v.n)));
    byId.set(ind.id, ind);
    meta.set(ind.id, v);
    library.push(ind);
  }
  library.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  for (const ind of library) {
    const v = meta.get(ind.id)!;
    all.push(ind);
    years.set(ind.id, [...(v.y ?? [])]);
    levels.set(ind.id, v.lv.filter((l) => LEVELS.includes(l)));
  }
  return { all, byId, library, years, levels };
}
