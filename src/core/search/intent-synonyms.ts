/**
 * Słownik synonimów dla wyszukiwania naturalnego.
 * Frazy są zapisane już w postaci po `normalize` (małe litery, bez polskich znaków).
 */

/** Frazy → id wskaźnika z config/indicators.json. */
export const INDICATOR_PHRASES: Record<string, string> = {
  'ludnosc': 'population',
  'liczba ludnosci': 'population',
  'liczba mieszkancow': 'population',
  'mieszkancy': 'population',
  'gestosc': 'density',
  'zaludnienie': 'density',
  'gestosc zaludnienia': 'density',
  'przyrost naturalny': 'natural-increase',
  'urodzenia': 'natural-increase',
  'saldo migracji': 'migration-balance',
  'migracje': 'migration-balance',
  'naplyw ludnosci': 'migration-balance',
  'seniorzy': 'share-65plus',
  'osoby starsze': 'share-65plus',
  'udzial 65': 'share-65plus',
  'mediana wieku': 'median-age',
  'sredni wiek': 'median-age',
  'bezrobocie': 'unemployment-rate',
  'bez pracy': 'unemployment-rate',
  'stopa bezrobocia': 'unemployment-rate',
  'bezrobotni': 'unemployed-share-working-age',
  'udzial bezrobotnych': 'unemployed-share-working-age',
  'wynagrodzenie': 'avg-wage',
  'pensje': 'avg-wage',
  'zarobki': 'avg-wage',
  'dochody gminy': 'income-per-capita',
  'dochody budzetu': 'income-per-capita',
  'wydatki gminy': 'spending-per-capita',
  'wydatki budzetu': 'spending-per-capita',
  'firmy': 'regon-per-10k',
  'podmioty gospodarcze': 'regon-per-10k',
  'regon': 'regon-per-10k',
  'nowe mieszkania': 'dwellings-per-1000',
  'mieszkania oddane': 'dwellings-per-1000',
  'powierzchnia mieszkania': 'dwelling-area-per-person',
  'metraz': 'dwelling-area-per-person',
  'lasy': 'forest-cover',
  'lesistosc': 'forest-cover',
  'kanalizacja': 'sewerage-share',
  'sciekowa': 'sewerage-share',
  'przedszkola': 'preschool-3-6',
  'wychowanie przedszkolne': 'preschool-3-6',
  'czytelnicy': 'library-readers-per-1000',
  'biblioteki': 'library-readers-per-1000',
  'noclegi': 'tourist-nights-per-1000',
  'turystyka': 'tourist-nights-per-1000',
  'samochody': 'cars-per-1000',
  'auta': 'cars-per-1000',
  'motoryzacja': 'cars-per-1000',
};

/** Frazy → poziom jednostki. */
export const LEVEL_PHRASES: Record<string, 'woj' | 'pow' | 'gmi'> = {
  'wojewodztwa': 'woj',
  'wojewodztwo': 'woj',
  'wojewodztw': 'woj',
  'powiaty': 'pow',
  'powiat': 'pow',
  'powiatow': 'pow',
  'gminy': 'gmi',
  'gmina': 'gmi',
  'gmin': 'gmi',
};

/** Prefiksy nazw jednostek pomijane przy dopasowaniu. */
export const UNIT_PREFIXES = ['powiat ', 'gmina ', 'wojewodztwo ', 'm st ', 'miasto '];
