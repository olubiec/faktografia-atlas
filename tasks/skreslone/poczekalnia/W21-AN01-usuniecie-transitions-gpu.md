# W21-AN01 – Usuń transitions GPU z warstw kolorów
Opis zakresu już zaimplementowanego. Kontekst: `docs/research/q-cienie-2-analiza.md` §2, §6.

## 1. Cel
Żadna warstwa kolorów nie używa przejść atrybutów GPU (`transitions`), więc na iOS nie działa `GPUInterpolationTransition` (transform feedback).

## 2. Pliki
- Zmieniaj: `src/view/map/layers/choropleth.ts`, `src/view/map/layers/localities.ts`, `tests/unit/choropleth-no-transitions.test.ts` (nowy)
- Wymagane: `tests/unit/choropleth-layers-split.test.ts` (bez zmian; id warstwy `choropleth-layer` zostaje)
- Zmiany w `choropleth.ts` i `localities.ts` dotyczą tylko usunięcia pola `transitions` i martwych importów/stałych czasu.

## 3. Testy
Dla poziomów woj/pow/gmi: `props.transitions` jest `undefined` w warstwie kolorów, w „brak danych”, w obrysie i w kropkach miejscowości; zmiana `classByTeryt` nie dodaje przejścia.

## 4. Gotowe, gdy
`grep -rn "transitions" src/view/map/layers` puste; test zielony; `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.
