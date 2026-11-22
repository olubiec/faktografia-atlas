// Detektor zmian granic (KONCEPT-ODKRYCIA §2, pułapki 1–2).
// Powierzchnia = ludność ÷ gęstość. Skok powierzchni > progu rok do roku oznacza zmianę granic
// (np. Opole 2017) albo błąd pojedynczego roku (Hel 2023) – okna z takim rokiem nie dają faktów o zmianie.

/** Powierzchnia (km²) w kolejnych latach z dwóch serii: ludności i gęstości. */
export function impliedArea(
  popYears: readonly number[],
  population: readonly (number | null)[] | undefined,
  densityYears: readonly number[],
  density: readonly (number | null)[] | undefined,
): Map<number, number> {
  const area = new Map<number, number>();
  if (!population || !density) return area;
  const popByYear = new Map<number, number | null>(popYears.map((y, i) => [y, population[i] ?? null]));
  densityYears.forEach((year, i) => {
    const d = density[i];
    const p = popByYear.get(year);
    if (d != null && d > 0 && p != null && p > 0) area.set(year, p / d);
  });
  return area;
}

/** Lata, w których powierzchnia zmieniła się o więcej niż `jump` (ułamek) względem roku poprzedniego. */
export function boundaryChangeYears(area: Map<number, number>, jump: number): number[] {
  const years = [...area.keys()].sort((a, b) => a - b);
  const out: number[] = [];
  for (let i = 1; i < years.length; i++) {
    const prev = area.get(years[i - 1])!;
    const cur = area.get(years[i])!;
    if (years[i] - years[i - 1] === 1 && Math.abs(cur / prev - 1) > jump) out.push(years[i]);
  }
  return out;
}

/** Czy okno (from, to] zawiera rok zmiany granic. */
export function windowHasBoundaryChange(changes: readonly number[], from: number, to: number): boolean {
  return changes.some((y) => y > from && y <= to);
}
