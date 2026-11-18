import { loadIndicatorValues } from '../data/load-values';
import { loadLibraryValues, valuesByTeryt } from '../library/load-library';
import type { LibraryValues } from '../library/load-library';
import type { IndicatorValues } from '../profile/profile';
import type { Unit, UnitLevel } from '../units/types';

// Wskaźnik z biblioteki ma id „b<liczba>”. Reguła lokalna – bez zależności od rejestru (QC602).
const LIBRARY_ID = /^b\d+$/;
const ALL_LEVELS: UnitLevel[] = ['woj', 'pow', 'gmi'];
const LEVEL_KEY: Record<UnitLevel, 'l3' | 'l5' | 'l6'> = { woj: 'l3', pow: 'l5', gmi: 'l6' };

export type LoadAnyContext = {
  units: Unit[];
  levels?: UnitLevel[];
  fetchImpl?: typeof fetch;
};

/**
 * Scala wartości z kilku poziomów w jedną mapę TERYT → wiersz.
 * Kody TERYT różnych poziomów się nie powtarzają. Oś lat = suma posortowana, braki = null.
 */
export function mergeLevels(parts: IndicatorValues[]): IndicatorValues {
  const years = [...new Set(parts.flatMap((p) => p.years))].sort((a, b) => a - b);
  const values: Record<string, (number | null)[]> = {};
  for (const part of parts) {
    for (const [teryt, row] of Object.entries(part.values)) {
      values[teryt] = years.map((y) => {
        const i = part.years.indexOf(y);
        return i >= 0 ? (row[i] ?? null) : null;
      });
    }
  }
  return {
    indicatorId: parts[0]?.indicatorId ?? '',
    years,
    values,
    fetchedAt: parts.find((p) => p.fetchedAt)?.fetchedAt ?? '',
  };
}

function fromLibrary(id: string, raw: LibraryValues, ctx: LoadAnyContext): IndicatorValues {
  const wanted = ctx.levels ?? ALL_LEVELS;
  const parts = wanted
    .filter((lv) => raw[LEVEL_KEY[lv]])
    .map((lv) => valuesByTeryt(raw, lv, ctx.units));
  const fetchedAt = typeof raw.fetchedAt === 'string' ? raw.fetchedAt : '';
  const merged = mergeLevels(parts.map((p) => ({ ...p, fetchedAt })));
  return { ...merged, indicatorId: id, fetchedAt };
}

/**
 * Jeden sposób pobierania wartości: wskaźnik główny albo z biblioteki, ten sam format.
 * Jedno żądanie na wskaźnik (cache w loaderach). Brak pliku / zły format → null, nie rzuca.
 */
export async function loadAnyValues(
  id: string,
  ctx: LoadAnyContext
): Promise<IndicatorValues | null> {
  try {
    if (!LIBRARY_ID.test(id)) {
      return await (ctx.fetchImpl ? loadIndicatorValues(id, ctx.fetchImpl) : loadIndicatorValues(id));
    }
    const varId = id.slice(1);
    const raw = await (ctx.fetchImpl
      ? loadLibraryValues(varId, ctx.fetchImpl)
      : loadLibraryValues(varId));
    return raw ? fromLibrary(id, raw, ctx) : null;
  } catch {
    return null;
  }
}
