import type { Page, Response } from '@playwright/test';

// Adres mapy. Dziś mapa jest pod `/`; przy przebudowie tras wystarczy zmienić tę jedną stałą.
export const MAP_BASE = '/';

/** Wchodzi na mapę. `query` to końcówka adresu, np. `?e2e&u=12` (domyślnie pusta). */
export function openMap(page: Page, query = ''): Promise<Response | null> {
  return page.goto(MAP_BASE + query);
}
