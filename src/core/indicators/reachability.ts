// Strażnik osiągalności wskaźników – czysta funkcja audytu (pliki czyta test, nie moduł).
import type { Indicator } from '../profile/profile';
import { normalize } from '../search/normalize';
import { buildRegistry, isLibraryIndicatorId, type AvailableFile } from './registry';

export type AuditInput = {
  main: Indicator[];
  valuesFileIds: string[];
  available: AvailableFile | null;
  basic?: readonly string[];
  /** Województwo -> id wskaźników z klucza `years` pliku profilu. */
  profileShards?: Record<string, string[]>;
};

export type AuditResult = { checked: number; problems: string[] };

/** Ta sama reguła co w pickerze: pusta fraza = cała lista, inaczej dopasowanie znormalizowanej nazwy. */
export function searchIndicators(list: Indicator[], query: string): Indicator[] {
  const q = normalize(query);
  if (q === '') return list;
  return list.filter((ind) => normalize(ind.name).includes(q));
}

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dup.add(id);
    seen.add(id);
  }
  return [...dup];
}

/** Zwraca listę problemów (po polsku, każdy z id) i liczbę sprawdzonych wskaźników. */
export function auditIndicators(input: AuditInput): AuditResult {
  const { main, valuesFileIds, available, basic = [], profileShards } = input;
  const problems: string[] = [];
  const mainIds = new Set(main.map((i) => i.id));
  const files = new Set(valuesFileIds);

  for (const id of findDuplicates(main.map((i) => i.id))) {
    problems.push(`duplikat id w configu: ${id}`);
  }
  for (const id of mainIds) {
    if (!files.has(id)) problems.push(`wskaźnik ${id} bez pliku wartości`);
  }
  for (const id of files) {
    if (!mainIds.has(id)) problems.push(`plik bez wpisu w config: ${id}`);
  }
  for (const id of basic) {
    if (!mainIds.has(id)) problems.push(`wskaźnik podstawowy ${id} nie istnieje w configu`);
  }

  const registry = buildRegistry(main, available);

  // Pliki profili obejmują wskaźniki główne; biblioteka ładuje się osobno
  if (profileShards) {
    for (const [woj, ids] of Object.entries(profileShards)) {
      const have = new Set(ids);
      for (const ind of registry.all) {
        if (!isLibraryIndicatorId(ind.id) && !have.has(ind.id)) {
          problems.push(`profil ${woj} nie ma wskaźnika ${ind.id}`);
        }
      }
    }
  }

  for (const ind of registry.all) {
    if (!searchIndicators(registry.all, ind.name).some((found) => found.id === ind.id)) {
      problems.push(`wskaźnik ${ind.id} niewyszukiwalny po własnej nazwie`);
    }
  }

  const groups = new Map<string, string[]>();
  for (const ind of registry.library) {
    const key = `${normalize(ind.name)}\u0000${ind.description}`;
    groups.set(key, [...(groups.get(key) ?? []), ind.id]);
  }
  for (const ids of groups.values()) {
    if (ids.length > 1) problems.push(`wskaźniki ${ids.join(', ')} nie do odróżnienia (ta sama nazwa i opis)`);
  }

  return { checked: registry.all.length, problems };
}
