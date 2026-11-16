/** Paginacja kart wielostronicowych: czysta funkcja dzieląca treść na strony. */

export interface CardPage<T> {
  /** Numer strony od 1. */
  number: number;
  total: number;
  /** Etykieta „n/N”. */
  label: string;
  items: T[];
}

export function pageLabel(number: number, total: number): string {
  return `${number}/${total}`;
}

/** Dzieli listę na strony po `perPage` elementów; pusta lista daje jedną pustą stronę. */
export function paginate<T>(items: readonly T[], perPage: number): CardPage<T>[] {
  const size = Math.max(1, Math.floor(perPage));
  const total = Math.max(1, Math.ceil(items.length / size));
  return Array.from({ length: total }, (_, i) => ({
    number: i + 1,
    total,
    label: pageLabel(i + 1, total),
    items: items.slice(i * size, (i + 1) * size),
  }));
}
