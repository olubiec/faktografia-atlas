export type FocusControl = 'up' | 'down' | 'remove';

/**
 * Dokąd przenieść fokus po zmianie listy „Moje wskaźniki”. `list` to lista PRZED zmianą.
 * Przesunięcie: fokus zostaje na tym samym przycisku; jeśli na krawędzi się wyłączy – idzie na przeciwny.
 * Usunięcie: × następnego wiersza, a po ostatnim – poprzedniego; pusta lista → „+ Dodaj wskaźnik”.
 */
export function focusAfterChange(
  list: readonly string[],
  id: string,
  action: FocusControl,
): { id: string; control: FocusControl } | 'add' {
  const i = list.indexOf(id);
  if (action === 'remove') {
    const neighbor = list[i + 1] ?? list[i - 1];
    return neighbor ? { id: neighbor, control: 'remove' } : 'add';
  }
  const next = Math.max(0, Math.min(list.length - 1, i + (action === 'up' ? -1 : 1)));
  if (action === 'up' && next === 0) return { id, control: 'down' };
  if (action === 'down' && next === list.length - 1) return { id, control: 'up' };
  return { id, control: action };
}

// Cel fokusu do przywrócenia po najbliższej zmianie listy (jedna lista na stronie).
let pendingFocus: ReturnType<typeof focusAfterChange> | null = null;

export function rememberFocus(list: readonly string[], id: string, action: FocusControl): void {
  pendingFocus = focusAfterChange(list, id, action);
}

/** Zwraca zapamiętany cel i czyści go. */
export function takeFocus(): ReturnType<typeof focusAfterChange> | null {
  const next = pendingFocus;
  pendingFocus = null;
  return next;
}
