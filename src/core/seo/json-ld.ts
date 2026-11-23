// Dane strukturalne JSON-LD (schema.org): czyste funkcje, bez Reacta. Domena: docs/SEO.md (D1).

import { CONTACT_EMAIL, SOCIAL_PROFILE_URLS } from '../brand/social';

export const SITE_URL = 'https://faktografia.eu';
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

export type LdObject = Record<string, unknown>;

/** Minimalny opis wskaźnika potrzebny do zbioru danych. */
export interface LdIndicator {
  name: string;
}

/** Wizytówka serwisu (strona startowa). */
export function websiteLd(): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Faktografia',
    url: `${SITE_URL}/`,
    inLanguage: 'pl-PL',
    description: 'Interaktywna mapa Polski z danymi GUS: województwa, powiaty, gminy i miejscowości.',
    publisher: { '@type': 'Organization', name: 'Faktografia', url: `${SITE_URL}/` },
  };
}

/** Organizacja: nazwa, logo i kraj (dokładnego adresu pocztowego nie publikujemy). */
export function organizationLd(): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Faktografia',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/brand/faktografia-logo-granat.svg`,
    address: { '@type': 'PostalAddress', addressCountry: 'PL' },
    email: CONTACT_EMAIL,
    sameAs: SOCIAL_PROFILE_URLS,
  };
}

/** Zbiór danych GUS BDL: lata z danych (najstarszy i najnowszy), nazwy wskaźników w `variableMeasured`. */
export function datasetLd(indicators: LdIndicator[], years: number[]): LdObject {
  const names = indicators.map((i) => i.name);
  const ld: LdObject = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Wskaźniki społeczno-gospodarcze Polski według GUS BDL',
    description:
      `Zbiór ${names.length} wskaźników społeczno-gospodarczych (m.in. ludność, rynek pracy, mieszkalnictwo) ` +
      'dla województw, powiatów i gmin Polski, pobieranych z Banku Danych Lokalnych GUS i prezentowanych ' +
      'na interaktywnej mapie Faktografii razem z szeregami czasowymi.',
    url: `${SITE_URL}/zrodla`,
    license: LICENSE_URL,
    isAccessibleForFree: true,
    inLanguage: 'pl-PL',
    creator: { '@type': 'Organization', name: 'Główny Urząd Statystyczny', url: 'https://stat.gov.pl' },
    publisher: { '@type': 'Organization', name: 'Faktografia', url: `${SITE_URL}/` },
    isBasedOn: 'https://bdl.stat.gov.pl',
    spatialCoverage: { '@type': 'Place', name: 'Polska', address: { '@type': 'PostalAddress', addressCountry: 'PL' } },
    variableMeasured: names,
  };
  if (years.length > 0) {
    ld.temporalCoverage = `${Math.min(...years)}/${Math.max(...years)}`;
  }
  return ld;
}

/** JSON do wstawienia w <script>: `<`, `>` i `&` zamienione na sekwencje \u, więc nie da się zamknąć skryptu. */
export function serializeLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
