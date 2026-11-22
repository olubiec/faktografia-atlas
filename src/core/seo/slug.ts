import type { Unit } from '../units/types';

/** Minimalny opis jednostki potrzebny do adresów. */
export type SlugUnit = Pick<Unit, 'teryt' | 'name' | 'level' | 'parent'>;

const PL: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };

/** Nazwa → fragment adresu: małe litery, bez polskich znaków, inne znaki jako „-”. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => PL[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Miasto na prawach powiatu: powiat o numerze 61–99 (TERYT: WWPP, PP ≥ 61). */
export function isCityCounty(powTeryt: string): boolean {
  return powTeryt.length === 4 && Number(powTeryt.slice(2)) >= 61;
}

const GMINA_KIND: Record<string, string> = { '1': 'miasto', '2': 'gmina-wiejska', '3': 'gmina-miejsko-wiejska' };

export interface UnitPaths {
  /** TERYT → adres (miasto na prawach powiatu: powiat i gmina mają ten sam adres). */
  byTeryt: Map<string, string>;
  /** adres → TERYT (dla miasta: TERYT gminy). */
  byPath: Map<string, string>;
}

/** Wspólna reguła: elementy o tym samym adresie dostają kolejne dopiski, aż adresy będą różne. */
function resolve(items: { unit: SlugUnit; base: string }[], steps: ((u: SlugUnit) => string)[]): Map<string, string> {
  const result = new Map<string, string>(items.map((i) => [i.unit.teryt, i.base]));
  let pending = items;
  for (const step of [...steps, (u: SlugUnit) => u.teryt]) {
    const groups = new Map<string, typeof items>();
    for (const i of pending) {
      const key = result.get(i.unit.teryt)!;
      groups.set(key, [...(groups.get(key) ?? []), i]);
    }
    pending = [];
    for (const [key, group] of groups) {
      if (group.length < 2) continue;
      for (const i of group) {
        const part = step(i.unit);
        result.set(i.unit.teryt, part ? `${key}-${part}` : key);
        pending.push(i);
      }
    }
    if (pending.length === 0) break;
  }
  return result;
}

/**
 * Stałe adresy wszystkich miejsc (decyzja D2 w docs/SEO.md).
 * Zmiana algorytmu zmienia adresy w wyszukiwarkach – tylko za zgodą właściciela.
 */
export function buildUnitPaths(units: readonly SlugUnit[]): UnitPaths {
  const byTeryt = new Map<string, string>();
  const name = new Map(units.map((u) => [u.teryt, u.name]));
  const slugOf = (teryt: string | null) => slugify((teryt && name.get(teryt)) || '');
  const powName = (u: SlugUnit) => u.name.replace(/^powiat\s+/i, '');

  for (const u of units) if (u.level === 'woj') byTeryt.set(u.teryt, `/wojewodztwo/${slugify(u.name)}`);

  // Miasta na prawach powiatu: jedna strona dla powiatu i jego gminy.
  const cityGminas = units.filter((u) => u.level === 'gmi' && u.parent && isCityCounty(u.parent));
  const cities = resolve(
    cityGminas.map((u) => ({ unit: u, base: `/miasto/${slugify(u.name)}` })),
    [(u) => slugOf(u.parent?.slice(0, 2) ?? null)],
  );
  for (const u of cityGminas) {
    const path = cities.get(u.teryt)!;
    byTeryt.set(u.teryt, path);
    if (u.parent) byTeryt.set(u.parent, path);
  }

  const counties = units.filter((u) => u.level === 'pow' && !isCityCounty(u.teryt));
  const countyPaths = resolve(
    counties.map((u) => ({ unit: u, base: `/powiat/${slugify(powName(u))}` })),
    [(u) => slugOf(u.parent)],
  );
  for (const u of counties) byTeryt.set(u.teryt, countyPaths.get(u.teryt)!);

  const gminas = units.filter((u) => u.level === 'gmi' && !(u.parent && isCityCounty(u.parent)));
  const gminaPaths = resolve(
    gminas.map((u) => ({ unit: u, base: `/gmina/${slugify(u.name)}` })),
    [(u) => GMINA_KIND[u.teryt.slice(6, 7)] ?? '', (u) => `powiat-${slugOf(u.parent)}`],
  );
  for (const u of gminas) byTeryt.set(u.teryt, gminaPaths.get(u.teryt)!);

  const byPath = new Map<string, string>();
  for (const u of units) {
    const path = byTeryt.get(u.teryt);
    if (!path) continue;
    // Powiat-miasto nie nadpisuje gminy: adres miasta wskazuje TERYT gminy.
    if (u.level === 'pow' && isCityCounty(u.teryt)) continue;
    byPath.set(path, u.teryt);
  }
  return { byTeryt, byPath };
}

/** Fragment adresu wskaźnika: nazwa bez jednostki w nawiasie, np. „Lesistość (%)” → `lesistosc`. */
export function indicatorSlug(name: string): string {
  return slugify(name.replace(/\([^)]*\)/g, ''));
}
