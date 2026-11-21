import { loadAdminTopo, loadUnits } from '@/core/data/load-atlas-data';

// Wczesne ładowanie kodu mapy (Home + ciężki AtlasMap z MapLibre i deck.gl), żeby klik „Otwórz mapę” nie czekał.
let loaded = false;
let pending: Promise<unknown> | null = null;

/** Zaczyna ładować kod mapy (raz); błąd sieci pozwala spróbować ponownie przy następnym wywołaniu. */
export function preloadMap(): void {
  if (loaded || pending) return;
  pending = Promise.all([import('../Home'), import('../map/AtlasMap')])
    .then(() => {
      loaded = true;
    })
    .catch(() => undefined)
    .finally(() => {
      pending = null;
    });
}

type Connection = { saveData?: boolean; effectiveType?: string };

/** Oszczędzanie danych albo wolna sieć: dane mapy nie są pobierane „na zapas”. */
export function isFrugalNetwork(conn: Connection | undefined = (navigator as { connection?: Connection }).connection): boolean {
  return Boolean(conn?.saveData) || conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g';
}

/** Rozgrzewa dane mapy (lista jednostek i granice): klik „Otwórz mapę” nie czeka na sieć. Błędy ignorujemy. */
export function preloadMapData(): void {
  void Promise.all([loadUnits(), loadAdminTopo()]).catch(() => undefined);
}
