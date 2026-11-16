# N-36 – Dług rozmiaru: obrys wybranej jednostki w osobnym pliku (choropleth.ts 224 → ≤ 220)
Cel: Zmniejszyć dług z listy `GRANDFATHERED_LINE_COUNT` w style-guard. Fabryka warstwy obrysu (`selectedOutlineLayerFactory`) przenosi się z `choropleth.ts` do własnego pliku, bez zmiany wyglądu mapy i bez zmiany importów w reszcie kodu.
Zmieniaj: src/view/map/layers/choropleth.ts, src/view/map/layers/selected-outline.ts, tests/unit/selected-outline-split.test.ts
Wymagane: src/view/map/layers/selected-outline.ts, tests/unit/selected-outline-split.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/main-screen.spec.ts tests/e2e/drill.spec.ts tests/e2e/compare-pick.spec.ts tests/e2e/s18-compare.spec.ts
Przeczytaj najpierw: src/view/map/layers/choropleth.ts (linie 179–224: `selectedOutlineLayerFactory`; `resolveTokenColor` linie 10–50), src/view/map/layers/admin.ts (`LayerFactory`, `LayerContext`, `loadGeoData`, `parseCssColor`), src/view/map/AtlasMap.tsx (import obu fabryk z `./layers/choropleth` – tylko czytasz, plik ekranu), src/view/map/layers/no-data-pattern.ts, tests/unit/no-data-pattern.test.ts, tests/unit/style-guard.test.ts

Zadanie:
1. Przenieś `selectedOutlineLayerFactory` (treść bez zmian) do `src/view/map/layers/selected-outline.ts`. Zależności (`LayerFactory`, `LayerContext`, `loadGeoData` z `./admin`, `readUrlState` z `@/core/url/state`, `GeoJsonLayer` i inne użyte w niej) importuje bezpośrednio; nie importuje niczego z `./choropleth` (dziś obrys nie używa `resolveTokenColor` – sprawdź). Nieużywane już w choropleth.ts importy usuń.
2. `choropleth.ts` re-eksportuje `selectedOutlineLayerFactory` (`export { selectedOutlineLayerFactory } from './selected-outline'`), więc AtlasMap.tsx, no-data-pattern.ts i testy nie zmieniają importów. Id warstwy (`selected-outline-layer`) i kolejność rejestracji bez zmian. Komentarze po polsku.
3. `tests/unit/selected-outline-split.test.ts`: (a) `choropleth.ts` i `selected-outline.ts` mają po ≤ 220 linii; (b) `selectedOutlineLayerFactory` importowany z `choropleth.ts` i z `selected-outline.ts` to ten sam obiekt, `id === 'selected-outline-layer'`; (c) eksporty `choropleth.ts` zawierają nadal `resolveTokenColor`, `choroplethLayerFactory`, `selectedOutlineLayerFactory`.

Gotowe, gdy:
- Nowy test zielony; no-data-pattern.test, style-guard i pozostałe testy jednostkowe warstw zielone bez zmian; 4 speki e2e zielone (`--workers=1`), w tym obrys porównywanych jednostek (`?c=`) w compare-pick/s18-compare.
- `wc -l` obu plików ≤ 220 (podaj w raporcie).

Nie rób: zmian w AtlasMap.tsx, admin.ts, style-guard.test.ts ani w wyglądzie warstw; bez nowych pakietów.
