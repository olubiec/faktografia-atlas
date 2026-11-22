// Stałe adresy stron miejsc (docs/SEO.md, D2). Czyste funkcje, bez Reacta.
// UWAGA: zmiana algorytmu zmienia adresy znane Google – tylko za zgodą właściciela (test stabilności S05).
import { isCityCounty } from '../units/label';

/** Minimum danych jednostki potrzebne do zbudowania adresu. */
export interface SlugUnit {
  teryt: string;
  name: string;
  level: 'woj' | 'pow' | 'gmi';
  parent: string | null;
}

export interface UnitPaths {
  /** TERYT → adres. Miasto na prawach powiatu: TERYT powiatu i gminy dają ten sam adres. */
  pathByTeryt: Map<string, string>;
  /** Adres → TERYT. Dla `/miasto/…` to TERYT powiatu (4 cyfry). */
  terytByPath: Map<string, string>;
}

const PL_TO_ASCII: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

/** „Kędzierzyn-Koźle” → „kedzierzyn-kozle”; inne znaki → „-”, bez podwójnych i skrajnych „-”. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => PL_TO_ASCII[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const stripPowiat = (name: string) => name.replace(/^powiat\s+/i, '');

/** Dopisek rodzaju gminy z 7. cyfry TERYT. */
const GMINA_SUFFIX: Record<string, string> = {
  '1': 'miasto',
  '2': 'gmina-wiejska',
  '3': 'gmina-miejsko-wiejska',
};

/**
 * Rozróżnia powtórzone nazwy kolejnymi dopiskami: każdy krok dotyczy tylko tych,
 * które nadal się powtarzają. Ostatni ratunek: TERYT (zawsze unikalny).
 */
function disambiguate(
  items: { teryt: string; slug: string }[],
  steps: ((teryt: string) => string)[],
): Map<string, string> {
  const current = new Map(items.map((i) => [i.teryt, i.slug]));
  const allSteps = [...steps, (teryt: string) => teryt];
  for (const step of allSteps) {
    const counts = new Map<string, number>();
    for (const slug of current.values()) counts.set(slug, (counts.get(slug) ?? 0) + 1);
    let changed = false;
    for (const [teryt, slug] of current) {
      if ((counts.get(slug) ?? 0) > 1) {
        current.set(teryt, `${slug}-${step(teryt)}`);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return current;
}

/** Buduje adresy wszystkich jednostek: `/wojewodztwo/…`, `/powiat/…`, `/miasto/…`, `/gmina/…`. */
export function buildUnitPaths(units: readonly SlugUnit[]): UnitPaths {
  const byTeryt = new Map(units.map((u) => [u.teryt, u]));
  const voivSlug = (teryt: string) => slugify(byTeryt.get(teryt.slice(0, 2))?.name ?? teryt.slice(0, 2));
  const powSlug = (teryt: string) =>
    slugify(stripPowiat(byTeryt.get(teryt.slice(0, 4))?.name ?? teryt.slice(0, 4)));

  const pathByTeryt = new Map<string, string>();
  const terytByPath = new Map<string, string>();
  const add = (prefix: string, slugs: Map<string, string>) => {
    for (const [teryt, slug] of slugs) {
      const path = `/${prefix}/${slug}`;
      pathByTeryt.set(teryt, path);
      terytByPath.set(path, teryt);
    }
  };

  const woj = units.filter((u) => u.level === 'woj');
  add('wojewodztwo', disambiguate(woj.map((u) => ({ teryt: u.teryt, slug: slugify(u.name) })), []));

  const pow = units.filter((u) => u.level === 'pow' && !isCityCounty(u.teryt));
  add('powiat', disambiguate(pow.map((u) => ({ teryt: u.teryt, slug: slugify(stripPowiat(u.name)) })), [voivSlug]));

  const cities = units.filter((u) => u.level === 'pow' && isCityCounty(u.teryt));
  add('miasto', disambiguate(cities.map((u) => ({ teryt: u.teryt, slug: slugify(stripPowiat(u.name)) })), [voivSlug]));

  const gmi = units.filter((u) => u.level === 'gmi' && !isCityCounty(u.teryt));
  const kindSuffix = (teryt: string) => GMINA_SUFFIX[teryt.charAt(6)] ?? teryt;
  add(
    'gmina',
    disambiguate(gmi.map((u) => ({ teryt: u.teryt, slug: slugify(u.name) })), [
      kindSuffix,
      (teryt) => `powiat-${powSlug(teryt)}`,
    ]),
  );

  // Gmina miasta na prawach powiatu to ta sama strona co powiat (np. 1261011 → adres 1261).
  for (const u of units) {
    if (u.level !== 'gmi' || !isCityCounty(u.teryt)) continue;
    const cityPath = pathByTeryt.get(u.teryt.slice(0, 4));
    if (cityPath) pathByTeryt.set(u.teryt, cityPath);
  }

  return { pathByTeryt, terytByPath };
}
