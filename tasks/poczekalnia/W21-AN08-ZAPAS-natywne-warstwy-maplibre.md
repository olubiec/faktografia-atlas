# W21-AN08 – ZAPAS: natywne warstwy wypełnień MapLibre
Ostateczność (decyzja architektoniczna). Uruchomić tylko, gdy po AN07 i teście właściciela na iPhonie artefakty zostają, a `?diag=notrans,nohatch,nooutline` nie pomaga (problem w samej warstwie wypełnień deck.gl).

## 1. Kryteria uruchomienia
(1) Właściciel potwierdza artefakty po AN06 i po AN07. (2) Zgoda właściciela na zmianę architektury (`docs/ARCHITEKTURA.md`). Bez obu: nie wykonujemy.

## 2. Cel
Wypełnienia jednostek (choropleth) rysuje MapLibre jako natywne warstwy `fill` ze stanem cechy (`feature-state`) i przejściem `fill-color-transition`; deck.gl zostaje dla pozostałych warstw. Usuwa cały tor deck.gl dla wypełnień, w tym transform feedback i FillStyleExtension.

## 3. Pliki (do doprecyzowania po decyzji)
- Zmieniaj: `src/view/map/layers/choropleth.ts` (zastępuje warstwę deck), `src/view/map/layers/maplibre-fill.ts` (nowy), `tests/unit/maplibre-fill.test.ts` (nowy)
- Dotyka `AtlasMap.tsx` – tylko za wyraźną zgodą i gdy żadne zadanie Q2 go nie rusza.
- Czytaj tylko: `docs/research/q-cienie-F-gotowce.md`, `src/core/map/fill-blend.ts`

## 4. Ryzyka
Kreskowanie „brak danych” trzeba zastąpić wzorem MapLibre albo jednolitym kolorem (CN10, zmiana STYL §2). Wymaga ID cechy = TERYT (string) w źródle.

## 5. Gotowe, gdy
Testy zielone; podgląd na iPhonie bez artefaktów; wszystkie istniejące testy e2e bez zmian zielone.
