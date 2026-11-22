// Linki z mapy do stron miejsc (S09, docs/SEO.md D6, D9). Czyste funkcje, bez Reacta.
// Adresy liczy ten sam algorytm co generator stron (slug.ts) na liście jednostek, którą mapa już wczytała
// (`/data/units.json`) – bez dodatkowego pliku i bez dodatkowego żądania.
import { buildUnitPaths, type SlugUnit } from './slug';
import { unitHeading } from './sentences';

/** Pamięć adresów dla danej listy jednostek (lista z loadUnits jest jedna na całą aplikację). */
const cache = new WeakMap<readonly SlugUnit[], Map<string, string>>();

function pathTable(units: readonly SlugUnit[]): Map<string, string> {
  let table = cache.get(units);
  if (!table) {
    table = buildUnitPaths(units).pathByTeryt;
    cache.set(units, table);
  }
  return table;
}

/** Adres strony miejsca dla TERYT (np. 1261 i 1261011 → `/miasto/krakow`); nieznany TERYT → null. */
export function unitPagePath(teryt: string, units: readonly SlugUnit[] | null | undefined): string | null {
  if (!teryt || !units || units.length === 0) return null;
  return pathTable(units).get(teryt) ?? null;
}

/** Ścieżka kanoniczna mapy: przy `?u=<teryt>` strona miejsca, w pozostałych przypadkach `/mapa` (D6). */
export function mapCanonicalPath(search: string, units: readonly SlugUnit[] | null | undefined): string {
  const teryt = new URLSearchParams(search).get('u');
  return (teryt && unitPagePath(teryt, units)) || '/mapa';
}

export interface PlaceLink {
  teryt: string;
  name: string;
  path: string;
}

export interface VoivodeshipPlaces extends PlaceLink {
  /** Powiaty i miasta na prawach powiatu województwa (gminy są na stronach powiatów). */
  children: PlaceLink[];
}

/** Spis do strony `/miejsca`: 16 województw z powiatami i miastami, alfabetycznie po polsku. */
export function placesIndex(units: readonly SlugUnit[]): VoivodeshipPlaces[] {
  const paths = pathTable(units);
  const collator = new Intl.Collator('pl');
  const byName = (a: PlaceLink, b: PlaceLink) => collator.compare(a.name, b.name);
  const link = (u: SlugUnit): PlaceLink | null => {
    const path = paths.get(u.teryt);
    return path ? { teryt: u.teryt, name: unitHeading(u, units), path } : null;
  };
  const counties = units.filter((u) => u.level === 'pow');
  return units
    .filter((u) => u.level === 'woj')
    .flatMap((woj) => {
      const head = link(woj);
      if (!head) return [];
      const children = counties
        .filter((u) => u.teryt.slice(0, 2) === woj.teryt)
        .map(link)
        .filter((l): l is PlaceLink => l !== null)
        .sort(byName);
      return [{ ...head, children }];
    })
    .sort(byName);
}
