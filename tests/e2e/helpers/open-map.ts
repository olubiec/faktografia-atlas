import type { Page, Response } from '@playwright/test';

// Adres mapy. Mapa jest pod `/mapa` (od B03); `/` to ekran startowy.
export const MAP_BASE = '/mapa';

/** Wchodzi na mapę. `query` to końcówka adresu, np. `?e2e&u=12` (domyślnie pusta). */
export function openMap(page: Page, query = ''): Promise<Response | null> {
  return page.goto(MAP_BASE + query);
}
