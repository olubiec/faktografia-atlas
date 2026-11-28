// Obracana próbka adresów do inspekcji w Search Console (S15, docs/SEO.md §8). Czyste funkcje, bez sieci.

/** Skrócony stan adresu w zgłoszeniu: i = zaindeksowany, n = nie. */
export type CoverageCode = 'i' | 'n';
export type Coverage = Record<string, CoverageCode>;

/** Próg spadku (punkty procentowe) i minimum adresów po obu stronach (docs/SEO.md §8). */
export const COVERAGE_DROP_PP = 0.2;
export const COVERAGE_MIN_URLS = 100;

export interface PickedSample { sample: string[]; cursor: number }

/** Kolejne `size` adresów z listy posortowanej alfabetycznie, od kursora, z zawinięciem na początek. */
export function pickSample(urls: readonly string[], previousCursor: number | null | undefined, size: number): PickedSample {
  const sorted = [...new Set(urls)].sort();
  const n = sorted.length;
  if (n === 0 || size <= 0) return { sample: [], cursor: 0 };
  const start = Number.isInteger(previousCursor) && (previousCursor as number) > 0 ? (previousCursor as number) % n : 0;
  const count = Math.min(size, n);
  const sample = Array.from({ length: count }, (_, i) => sorted[(start + i) % n] as string);
  return { sample, cursor: (start + count) % n };
}

export interface CoverageSummary { coverage: Coverage; indexedShare: number | null; known: number }

const summarize = (coverage: Coverage): CoverageSummary => {
  const codes = Object.values(coverage);
  return { coverage, known: codes.length, indexedShare: codes.length ? codes.filter((c) => c === 'i').length / codes.length : null };
};

/** Ostatni znany stan każdego adresu: adresy spoza bieżącej próbki zostają, te z próbki są nadpisane. */
export function mergeCoverage(previous: Coverage | null | undefined, current: Coverage): CoverageSummary {
  return summarize({ ...(previous ?? {}), ...current });
}

/** Czerwona flaga: udział zaindeksowanych spadł o > 20 pp, a oba odczyty obejmują ≥ 100 adresów. */
export function coverageDropFlag(previous: Coverage | null | undefined, merged: CoverageSummary): string | null {
  if (!previous) return null;
  const before = summarize(previous);
  if (before.indexedShare === null || merged.indexedShare === null) return null;
  if (before.known < COVERAGE_MIN_URLS || merged.known < COVERAGE_MIN_URLS) return null;
  const drop = before.indexedShare - merged.indexedShare;
  if (drop <= COVERAGE_DROP_PP) return null;
  const pct = (x: number) => `${Math.round(x * 100)} %`;
  return `Spadek zaindeksowanych stron o ${Math.round(drop * 100)} p.p. w tydzień (${pct(before.indexedShare)} → ${pct(merged.indexedShare)}, znany stan ${merged.known} adresów z mapy strony).`;
}

/** Poprawny kursor i mapa stanu z odczytanego `gsc-state`; wszystko inne → pusty początek. */
export function readRotation(state: unknown): { cursor: number; coverage: Coverage | null } {
  const s = (state ?? {}) as { cursor?: unknown; coverage?: unknown };
  const cursor = typeof s.cursor === 'number' && Number.isInteger(s.cursor) && s.cursor >= 0 ? s.cursor : 0;
  const raw = s.coverage;
  if (!raw || typeof raw !== 'object') return { cursor, coverage: null };
  const coverage: Coverage = {};
  for (const [k, v] of Object.entries(raw)) if (v === 'i' || v === 'n') coverage[k] = v;
  return { cursor, coverage };
}
