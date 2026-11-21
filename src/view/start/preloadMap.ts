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
