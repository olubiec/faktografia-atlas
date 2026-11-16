// Czysta logika SEO: budowa obiektów JSON-LD (schema.org). Bez UI i bez plików danych.
// Wynik trafia do <script type="application/ld+json"> przez JSON.stringify (nigdy jako HTML).

const GUS_NAME = 'Główny Urząd Statystyczny';
const GUS_URL = 'https://stat.gov.pl/';
const PLACEHOLDER = '{search_term_string}';

export interface DatasetInput {
  name: string; // nazwa jednostki, np. „Kraków”
  teryt: string; // kod TERYT jako string (może zaczynać się od 0)
  url: string; // pełny adres profilu
  year?: number; // rok danych; brak = bez zakresu czasowego
  indicator?: string; // nazwa wskaźnika (opcjonalnie)
}

export interface DatasetJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Dataset';
  name: string;
  description: string;
  url: string;
  identifier: string;
  creator: { '@type': 'Organization'; name: string; url: string };
  isBasedOn: string;
  inLanguage: 'pl';
  spatialCoverage: string;
  temporalCoverage?: string;
  variableMeasured?: string;
}

export interface WebSiteInput {
  name: string;
  url: string;
  searchUrlTemplate: string; // musi zawierać {search_term_string}
}

export interface WebSiteJsonLd {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction: {
    '@type': 'SearchAction';
    target: { '@type': 'EntryPoint'; urlTemplate: string };
    'query-input': string;
  };
}

/** Dataset dla profilu jednostki. Rzuca błąd, gdy TERYT nie jest ciągiem cyfr. */
export function buildDatasetJsonLd(input: DatasetInput): DatasetJsonLd {
  const teryt = input.teryt;
  if (!/^\d+$/.test(teryt)) {
    throw new Error(`Nieprawidłowy kod TERYT: "${teryt}"`);
  }
  const name = input.name.trim();
  const indicator = input.indicator?.trim() || undefined;
  const hasYear = typeof input.year === 'number' && Number.isFinite(input.year);
  const yearText = hasYear ? String(input.year) : undefined;

  const title = [name, indicator, yearText].filter(Boolean).join(' – ');
  const description = yearText
    ? `Dane statystyczne GUS dla jednostki ${name} (TERYT ${teryt}), rok ${yearText}.`
    : `Dane statystyczne GUS dla jednostki ${name} (TERYT ${teryt}).`;

  const result: DatasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: title,
    description,
    url: input.url,
    identifier: `TERYT:${teryt}`,
    creator: { '@type': 'Organization', name: GUS_NAME, url: GUS_URL },
    isBasedOn: GUS_URL,
    inLanguage: 'pl',
    spatialCoverage: name,
  };
  // Pola opcjonalne dodajemy tylko, gdy mają wartość (bez kluczy z undefined).
  if (yearText) result.temporalCoverage = yearText;
  if (indicator) result.variableMeasured = indicator;
  return result;
}

/** WebSite z SearchAction (pole wyszukiwania w wynikach Google). */
export function buildWebSiteJsonLd(input: WebSiteInput): WebSiteJsonLd {
  if (!input.searchUrlTemplate.includes(PLACEHOLDER)) {
    throw new Error(`Szablon wyszukiwania musi zawierać ${PLACEHOLDER}`);
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name.trim(),
    url: input.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: input.searchUrlTemplate },
      'query-input': 'required name=search_term_string',
    },
  };
}
