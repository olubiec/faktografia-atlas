import { standaloneName } from './standalone-name';
import {
  DROP_GROUPS, DROP_IDS, DROP_NAME_ENDINGS, DROP_NAME_PARTS, DROP_SECTIONS, DROP_UNITS, STALE_BEFORE_YEAR, KEEP_IDS,
} from './curation-rules';
import indicators from '../../../config/indicators.json';
import type { AvailableFile, AvailableVariable } from '../indicators/registry';

// Wybór popularnych danych z biblioteki GUS: czysta logika, bez sieci.
// Odrzucony wskaźnik znika z całej strony (menu, wyszukiwarka, porównania), bo filtr działa
// zaraz po wczytaniu spisu. Odpowiedniki wskaźników wbudowanych zostają zawsze.

const lower = (s: string) => s.toLocaleLowerCase('pl').trim();
const BUILTIN_BDL = new Set((indicators as { bdlVarId: number }[]).map((i) => String(i.bdlVarId)));

/** Powód odrzucenia (do testów i raportu) albo null, gdy wskaźnik zostaje. */
export function dropReason(v: AvailableVariable): string | null {
  if (BUILTIN_BDL.has(v.id) || KEEP_IDS.has(v.id)) return null;
  if (DROP_IDS.has(v.id)) return 'odrzucony po przeglądzie';
  const years = v.y ?? [];
  if (years.length > 0 && Math.max(...years) < STALE_BEFORE_YEAR) return 'stare dane';
  const [section = '', group = ''] = lower(v.c ?? '').split(' > ').map((p) => p.trim());
  if (DROP_SECTIONS.some((s) => section.startsWith(s))) return 'dział niszowy';
  if (DROP_GROUPS.some((g) => group.startsWith(g))) return 'grupa niszowa';
  if (DROP_UNITS.includes(lower(v.u ?? ''))) return 'jednostka techniczna';
  const name = lower(standaloneName(v.n, v.c));
  if (DROP_NAME_PARTS.some((p) => name.includes(p))) return 'wariant dla specjalistów';
  if (DROP_NAME_ENDINGS.some((e) => name.endsWith(e))) return 'podział na płeć';
  return null;
}

/** true = wskaźnik prosty i zrozumiały, zostaje na stronie. */
export function isPopular(v: AvailableVariable): boolean {
  return dropReason(v) === null;
}

const curated = new WeakMap<AvailableFile, AvailableFile>();

/**
 * Spis z samymi popularnymi wskaźnikami (ten sam obiekt wejściowy → ten sam wynik,
 * żeby useMemo w widokach nie liczył drzewa od nowa). null zostaje null.
 */
export function popularOnly(file: AvailableFile | null): AvailableFile | null {
  if (!file) return null;
  const hit = curated.get(file);
  if (hit) return hit;
  const out = { ...file, variables: file.variables.filter(isPopular) };
  curated.set(file, out);
  return out;
}
