import type { AvailableVariable } from '../indicators/registry';

// „Ludność – 0”, „… – 1”, … „… – 19” to jedna rodzina: ten sam wskaźnik w różnych rocznikach wieku.
// W menu zostaje jedna pozycja na rodzinę, a rocznik wybiera się suwakiem w panelu wskaźnika.

export type AgeMember = { age: number; id: string };
export type AgeFamily = { key: string; base: string; members: AgeMember[] };

const AGE_RE = /^(.*?) – (\d{1,3})$/;
const MIN_MEMBERS = 4;

/** Rodziny wieku: klucz = nazwa bez rocznika + ścieżka kategorii; tylko grupy o min. 4 rocznikach. */
export function buildAgeFamilies(vars: AvailableVariable[]): AgeFamily[] {
  const map = new Map<string, AgeFamily>();
  for (const v of vars) {
    const m = AGE_RE.exec(v.n);
    if (!m || !v.c) continue;
    const key = `${m[1]}|${v.c}`;
    const fam = map.get(key) ?? { key, base: m[1], members: [] };
    fam.members.push({ age: Number(m[2]), id: v.id });
    map.set(key, fam);
  }
  return [...map.values()]
    .filter((f) => f.members.length >= MIN_MEMBERS)
    .map((f) => ({ ...f, members: f.members.sort((a, b) => a.age - b.age) }));
}

/** Rodzina, do której należy zmienna (po id z biblioteki, np. „72”), albo null. */
export function familyOf(families: AgeFamily[], bdlId: string): AgeFamily | null {
  return families.find((f) => f.members.some((m) => m.id === bdlId)) ?? null;
}

/** Id (z biblioteki) rocznika; reprezentant rodziny w menu to najmłodszy rocznik. */
export function representativeIds(families: AgeFamily[]): Set<string> {
  return new Set(families.map((f) => f.members[0]!.id));
}
export function hiddenIds(families: AgeFamily[]): Set<string> {
  return new Set(families.flatMap((f) => f.members.slice(1).map((m) => m.id)));
}
