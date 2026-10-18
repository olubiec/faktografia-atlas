# Zadanie: CC4.R – rejestr warstw, moduł stanu adresu i sloty na panele (przebudowa bez nowej funkcji)

## Kontekst
Każda nowa funkcja mapy dopisuje dziś kod do `src/view/map/AtlasMap.tsx` i `src/view/map/layers.ts`, więc zadania mapy kolidują ze sobą. Po tej przebudowie nowa warstwa to nowy plik, a nowy panel to jedna linia w slocie. Zachowanie strony się NIE zmienia.

## Cel dla użytkownika
Brak widocznej zmiany.

## Zakres
- `src/view/map/layers/registry.ts` (nowy): lista fabryk warstw
- `src/view/map/layers/admin.ts` (nowy): obecne warstwy woj, pow, gmi, country przeniesione z `layers.ts`
- `src/view/map/layers.ts` (zostaje tylko jako ponowny eksport z `layers/`, żeby istniejące importy działały)
- `src/core/url/state.ts` (nowy): odczyt i zapis `?u=` (logika przeniesiona z `src/core/map/drill.ts`, które ją re-eksportuje)
- `src/view/map/AtlasMap.tsx` (tylko użycie rejestru i `core/url/state.ts`)
- `src/view/Home.tsx` (tylko trzy puste sloty: `side`, `bottom`, `overlay` jako elementy z `data-slot`)
- `tests/unit/layer-registry.test.ts`, `tests/unit/url-state.test.ts` (nowe)
- `docs/sessions/CC4.R.md`

## Warunki odbioru
1. Wszystkie istniejące testy przechodzą BEZ ŻADNEJ zmiany w katalogu `tests/` poza dwoma nowymi plikami (w szczególności `drill`, `breadcrumbs`, `map`, `home`, `search`).
2. `getLayerFactories()` zwraca fabryki w stałej kolejności; `window.__atlas.layers` ma te same identyfikatory co przed zmianą, w tej samej kolejności (test jednostkowy na rejestrze).
3. `readUrlState(search)` / `writeUrlState(state)` obsługują `u` (nieznany TERYT ignorowany, inne parametry jak `e2e`, `tune` zachowane); typ stanu ma już pola `i`, `y`, `c` jako opcjonalne, jeszcze nieużywane.
4. Zero hexów w `src/view/map/` (zapasowe kolory w `getMapColorsFromCss` zastąpione odczytem tokenów; jeśli zmienna CSS jest pusta, warstwa czeka na następny odczyt zamiast używać koloru z kodu).
5. Paczka główna (gzip) nie rośnie o więcej niż 2 KB.
