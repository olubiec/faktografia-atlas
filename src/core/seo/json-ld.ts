import { SITE_URL, absoluteUrl } from './site';

export type JsonLd = Record<string, unknown>;

const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';
const BDL_URL = 'https://bdl.stat.gov.pl/';

/** JSON do wstawienia w <script type="application/ld+json">: znaki <, >, & zamienione na sekwencje \u. */
export function serializeLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function organizationLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Faktografia',
    url: `${SITE_URL}/`,
    logo: absoluteUrl('/brand/faktografia-logo-granat.svg'),
  };
}

export function websiteLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Faktografia',
    url: `${SITE_URL}/`,
    inLanguage: 'pl',
    description: 'Mapa Polski z danymi GUS: województwa, powiaty i gminy.',
    publisher: { '@type': 'Organization', name: 'Faktografia', url: `${SITE_URL}/`, logo: absoluteUrl('/brand/faktografia-logo-granat.svg') },
  };
}

export interface LdIndicator {
  name: string;
}

/** Zbiór danych: wskaźniki z BDL GUS, zakres lat z danych (jeden rok = zakres otwarty). */
export function datasetLd(indicators: readonly LdIndicator[], years: readonly number[]): JsonLd {
  const first = Math.min(...years);
  const last = Math.max(...years);
  const names = indicators.map((i) => i.name);
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Wskaźniki GUS dla gmin, powiatów i województw Polski',
    description:
      `Zestawienie ${names.length} wskaźników statystycznych dla polskich gmin, powiatów i województw ` +
      'na podstawie Banku Danych Lokalnych Głównego Urzędu Statystycznego: ludność, rynek pracy, ' +
      'mieszkania, środowisko i inne. Dane przygotowane do wyświetlania na mapie i porównań.',
    url: absoluteUrl('/zrodla'),
    license: LICENSE_URL,
    creator: { '@type': 'Organization', name: 'Główny Urząd Statystyczny', url: 'https://stat.gov.pl/' },
    isBasedOn: BDL_URL,
    inLanguage: 'pl',
    spatialCoverage: { '@type': 'Place', name: 'Polska' },
    temporalCoverage: first === last ? `${first}/..` : `${first}/${last}`,
    variableMeasured: names,
  };
}

/** Zbiór danych jednego wskaźnika w jednym roku (strona rankingu). */
export function rankingDatasetLd(name: string, year: number, url: string, description: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${name} (${year})`,
    description,
    url,
    license: LICENSE_URL,
    creator: { '@type': 'Organization', name: 'Główny Urząd Statystyczny', url: 'https://stat.gov.pl/' },
    isBasedOn: BDL_URL,
    inLanguage: 'pl',
    spatialCoverage: { '@type': 'Place', name: 'Polska' },
    temporalCoverage: String(year),
    variableMeasured: name,
  };
}
