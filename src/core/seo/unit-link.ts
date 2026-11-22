/** Adres tabeli adresów miejsc (teryt → adres), generowanej przy budowie przez scripts/seo/build-pages.mjs. */
export const SEO_PATHS_URL = '/data/seo-paths.json';

export type UnitPathTable = Record<string, string>;

/** Adres strony miejsca albo `null`, gdy TERYT jest nieznany (wtedy linku nie pokazujemy). */
export function unitPagePath(teryt: string, table: UnitPathTable | null | undefined): string | null {
  if (!table) return null;
  return Object.prototype.hasOwnProperty.call(table, teryt) ? table[teryt]! : null;
}

let cached: Promise<UnitPathTable | null> | null = null;

/** Wczytuje tabelę leniwie, raz na sesję (po otwarciu profilu); błąd = brak linków, bez wyjątku. */
export function loadUnitPathTable(fetcher: typeof fetch = fetch): Promise<UnitPathTable | null> {
  cached ??= fetcher(SEO_PATHS_URL)
    .then((r) => (r.ok ? (r.json() as Promise<UnitPathTable>) : null))
    .catch(() => null);
  return cached;
}
