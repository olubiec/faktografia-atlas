import type { LibraryQuery } from '@/core/library/query';

// Zapytanie biblioteki ↔ parametry adresu. Domyślnie „tylko z danymi”:
// brak parametru p = filtr włączony, p=0 = pokaż wszystkie.
export function queryFromParams(params: URLSearchParams): LibraryQuery {
  const k = params.get('k');
  const j = params.get('j');
  const l = params.get('l');
  const p = params.get('p');

  return {
    cat: k && k.trim() !== '' ? k : null,
    text: params.get('q') ?? '',
    level: l === '5' ? 5 : l === '6' ? 6 : null,
    unit: j && j.trim() !== '' ? j : null,
    onlyReady: !(p === '0' || p === 'false'),
  };
}

export function paramsFromQuery(current: URLSearchParams, next: LibraryQuery): URLSearchParams {
  const out = new URLSearchParams(current);
  const setOrDelete = (key: string, value: string | null) => {
    if (value) out.set(key, value);
    else out.delete(key);
  };

  setOrDelete('k', next.cat);
  setOrDelete('q', next.text);
  setOrDelete('l', next.level === 5 || next.level === 6 ? String(next.level) : null);
  setOrDelete('j', next.unit);

  if (next.onlyReady) out.delete('p');
  else out.set('p', '0');

  return out;
}
