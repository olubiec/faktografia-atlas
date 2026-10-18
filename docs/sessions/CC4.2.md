# Sesja CC4.2 – Przechodzenie w głąb (województwo → powiaty → gminy)

Data: 18.10.2026

## Opis zmian

Zrealizowano nawigację w głąb podziału administracyjnego na interaktywnej mapie (województwo → powiaty → gminy) wraz z powrotem o poziom wyżej oraz pełną synchronizacją z adresem URL (`?u=<teryt>`).

1. **Czysta logika nawigacji w głąb (`src/core/map/drill.ts`)**:
   - `getDrillState(selectedTeryt, index)`: wyznacza aktywny poziom, TERYT rodzica, listę wymaganych warstw (`layerIds`), aktywne kody TERYT dla województwa i powiatu oraz prostokąt granic (`bbox`).
   - `getParentTeryt(selectedTeryt, index)`: wyznacza kod TERYT rodzica do powrotu o jeden poziom.
   - `getInitialSelectedFromUrl(search, index)`: odczytuje i weryfikuje parametr `?u=` z URL, z automatycznym wycofaniem do widoku kraju przy błędnym lub nieznanym TERYT.
   - `updateUrlTeryt(teryt)`: aktualizuje adres URL bez przeładowania strony (`history.replaceState`), zachowując inne parametry query (np. `e2e`, `tune`).

2. **Dynamiczne warstwy i obsługa kliknięć (`src/view/map/layers.ts`)**:
   - Rozbudowano `loadGeoData` o konwersję i pamięć podręczną (cache) obiektów GeoJSON dla powiatów i gmin z `admin.topo.json`.
   - W `createMapLayers` dodano warstwy `woj-layer`, `pow-layer`, `gmi-layer` oraz `country-layer` z włączoną obsługą kliknięć (`pickable: true`).
   - Zachowano zasady bezpieczeństwa i brak HTML w dymkach (`getTooltip` zwraca czysty ciąg tekstowy).

3. **Przycisk powrotu (`src/view/map/BackButton.tsx`)**:
   - Dostępny przycisk „Wróć” (ukryty na poziomie kraju) z ikoną `NavArrowLeft`, obszarem dotykowym co najmniej 44 × 44 px, pełną obsługą klawiatury i etykietą.

4. **Kamera i szew testowy (`src/view/map/AtlasMap.tsx`)**:
   - Przybliżanie widoku do obszaru wybranej jednostki na podstawie jej `bbox`.
   - Zaktualizowano `getState()` w szewie `window.__atlas`, aby przekazywał rzeczywistą listę aktywnych warstw oraz wybrany TERYT.
   - Obsługa zdarzeń `popstate` przy nawigacji wstecz/dalej w przeglądarce.

5. **Testy jednostkowe i E2E (`tests/unit/drill.test.ts`, `tests/e2e/drill.spec.ts`)**:
   - 12 nowych testów jednostkowych w Vitest sprawdzających wyznaczanie stanów, rodziców i parametru URL.
   - 5 nowych testów E2E w Playwright weryfikujących deep linking `?u=`, przechodzenie w głąb, przycisk „Wróć” i dostępność.

## Weryfikacja

- `pnpm lint`: zielone
- `pnpm typecheck`: zielone
- `pnpm test`: zielone (24 pliki, 139 testów)
- `pnpm build`: zielone
- `pnpm test:e2e`: zielone (55 testów E2E)
