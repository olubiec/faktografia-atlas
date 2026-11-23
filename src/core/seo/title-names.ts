// Krótkie nazwy wskaźników do tytułów stron (≤ 65 znaków, docs/SEO.md §5, audyt S08).
// H1 i treść zostają przy pełnej nazwie; krótka nazwa jest tylko ostatnią deską, gdy pełna się nie mieści.
import { shortIndicatorName } from './sentences';

/** Najdłuższa krótka nazwa: „ – gminy, woj. warmińsko-mazurskie” ma 34 znaki, razem ≤ 65. */
export const TITLE_NAME_MAX = 31;

const COMPACT: Readonly<Record<string, string>> = {
  'natural-increase': 'Przyrost naturalny',
  'migration-balance': 'Saldo migracji',
  'unemployed-share-working-age': 'Udział bezrobotnych',
  'income-per-capita': 'Dochody gminy na mieszkańca',
  'spending-per-capita': 'Wydatki gminy na mieszkańca',
  'regon-per-10k': 'Podmioty REGON na 10 tys.',
  'dwellings-per-1000': 'Nowe mieszkania na 1000 osób',
  'dwelling-area-per-person': 'Metraż mieszkania na osobę',
  'sewerage-share': 'Dostęp do kanalizacji',
  'preschool-3-6': 'Przedszkola, dzieci 3–6 lat',
  'library-readers-per-1000': 'Czytelnicy bibliotek na 1000',
  'tourist-nights-per-1000': 'Noclegi turystów na 1000 osób',
  'cars-per-1000': 'Samochody na 1000 osób',
};

/** Nazwa do tytułu: krótka z listy, a gdy jej brak – nazwa bez dopisku jednostki. */
export function titleIndicatorName(ind: { id: string; name: string; unit: string }): string {
  return COMPACT[ind.id] ?? shortIndicatorName(ind.name, ind.unit);
}
