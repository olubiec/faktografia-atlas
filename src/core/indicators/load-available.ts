import { libraryBase } from '../library/config';
import type { AvailableFile, AvailableVariable } from './registry';

const TIMEOUT_MS = 8000;

let promise: Promise<AvailableFile | null> | null = null;
let cache: AvailableFile | null = null;
let isCached = false;

function isEntry(v: unknown): v is AvailableVariable {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    o.id !== '' &&
    typeof o.n === 'string' &&
    Array.isArray(o.lv) &&
    Array.isArray(o.y)
  );
}

/** Zwraca plik z odrzuconymi wpisami o złym kształcie albo null, gdy cały plik jest zły. */
function validate(data: unknown): AvailableFile | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (o.version !== 1 || !Array.isArray(o.variables)) return null;
  return { ...(o as unknown as AvailableFile), variables: o.variables.filter(isEntry) };
}

/**
 * Pobiera spis pobranych wskaźników (<base>/available.json) jednym żądaniem.
 * Wynik (także null po błędzie, 404 lub timeoucie 8 s) jest zapamiętany na czas sesji strony.
 */
export function loadAvailable(
  fetchImpl: typeof fetch = (...args) => fetch(...args)
): Promise<AvailableFile | null> {
  if (promise) return promise;

  const url = `${libraryBase()}/available.json`;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      controller?.abort();
      resolve(null);
    }, TIMEOUT_MS);
  });
  const request: Promise<AvailableFile | null> = Promise.resolve()
    .then(() => fetchImpl(url, controller ? { signal: controller.signal } : undefined))
    .then((res) => (res.ok ? res.json() : null))
    .then(validate)
    .catch(() => null);

  const attempt: Promise<AvailableFile | null> = Promise.race([request, timeout]).then((result) => {
    clearTimeout(timer);
    // Reset w trakcie ładowania nie może nadpisać nowszej próby.
    if (promise === attempt) {
      cache = result;
      isCached = true;
    }
    return result;
  });
  promise = attempt;
  return attempt;
}

/** Synchroniczny odczyt cache: undefined = jeszcze nie załadowano. */
export function peekAvailable(): AvailableFile | null | undefined {
  return isCached ? cache : undefined;
}

/** Czyszczenie pamięci podręcznej (testy). */
export function resetAvailableCache(): void {
  promise = null;
  cache = null;
  isCached = false;
}
