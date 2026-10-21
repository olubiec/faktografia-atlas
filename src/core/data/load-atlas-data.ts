import type { Unit } from '@/core/units/types';

export const UNITS_URL = '/data/units.json';
export const ADMIN_TOPO_URL = '/geo/admin.topo.json';

type Fetch = typeof fetch;
const defaultFetch: Fetch = (...args) => fetch(...args);

let unitsPromise: Promise<Unit[]> | null = null;
let topoPromise: Promise<unknown> | null = null;

async function getJson<T>(url: string, fetchImpl: Fetch): Promise<T> {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`Nie udało się wczytać ${url}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

/**
 * Lista jednostek (woj/pow/gmi) jako osobny plik, nie część kodu.
 * Jedno żądanie na całą aplikację – mapa, wyszukiwarka i okruszki korzystają z tej samej pamięci.
 */
export function loadUnits(fetchImpl: Fetch = defaultFetch): Promise<Unit[]> {
  if (!unitsPromise) {
    unitsPromise = getJson<Unit[]>(UNITS_URL, fetchImpl).catch((err: unknown) => {
      unitsPromise = null;
      throw err;
    });
  }
  return unitsPromise;
}

/** Granice administracyjne (TopoJSON) jako osobny plik, nie część kodu. */
export function loadAdminTopo(fetchImpl: Fetch = defaultFetch): Promise<unknown> {
  if (!topoPromise) {
    topoPromise = getJson<unknown>(ADMIN_TOPO_URL, fetchImpl).catch((err: unknown) => {
      topoPromise = null;
      throw err;
    });
  }
  return topoPromise;
}

/** Tylko do testów. */
export function resetAtlasDataCache(): void {
  unitsPromise = null;
  topoPromise = null;
}
