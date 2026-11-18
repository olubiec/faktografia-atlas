/** Tymczasowe przełączniki diagnostyczne `?diag=` (do usunięcia po ustaleniu przyczyny cieni). */
export interface Diag {
  notrans: boolean;
  nohatch: boolean;
  nooutline: boolean;
}

/** Czyta wartości `diag` (po przecinku, bez względu na wielkość liter); nieznane są ignorowane. */
export function parseDiag(search: string): Diag {
  const values = new URLSearchParams(search).getAll('diag').flatMap((v) => v.toLowerCase().split(','));
  const has = (name: string) => values.map((v) => v.trim()).includes(name);
  return { notrans: has('notrans'), nohatch: has('nohatch'), nooutline: has('nooutline') };
}

let lastLogged = '';

/** Odczyt z adresu strony (bez okna: wszystko false); przy zmianie wartości jedno `console.info`. */
export function readDiag(): Diag {
  const search = typeof window !== 'undefined' ? (window.location?.search ?? '') : '';
  const diag = parseDiag(search);
  const key = (Object.keys(diag) as (keyof Diag)[]).filter((k) => diag[k]).join(',');
  if (key !== lastLogged) {
    lastLogged = key;
    if (key) console.info(`[diag] ${key}`);
  }
  return diag;
}
