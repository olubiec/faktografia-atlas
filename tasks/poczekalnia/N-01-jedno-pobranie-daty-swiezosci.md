# N-01 – Data świeżości danych bez ponownego pobierania density.json
Cel: Stopka z linijką „Dane GUS odświeżone: …” nie pobiera `data/values/density.json` drugi raz – ani przy powrocie na /rankingi, ani na stronie, która już ma ten plik w pamięci (domknięcie znaleziska z W17-T05).
Zmieniaj: src/view/layout/DataFreshness.tsx, tests/unit/data-freshness-cache.test.ts, tests/e2e/freshness-single-fetch.spec.ts
Wymagane: tests/unit/data-freshness-cache.test.ts, tests/e2e/freshness-single-fetch.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/freshness-single-fetch.spec.ts
Przeczytaj najpierw: docs/PRODUKT.md (§7), src/core/freshness/freshness.ts, src/core/data/load-values.ts, src/view/layout/DataFreshness.tsx, tasks/poczekalnia/NOC-RAPORT.md (W17-T05, P3-D)

Zadanie:
1. Przyczyna: `DataFreshness` przy każdym zamontowaniu stopki woła `loadFreshness()`, które robi własny `fetch` na `/data/values/density.json` bez pamięci podręcznej. Ten sam plik ma już pamięć w `loadIndicatorValues` (`src/core/data/load-values.ts`, typ `IndicatorValues` ma pole `fetchedAt`).
2. W `DataFreshness.tsx` dodaj i wyeksportuj funkcję `loadFreshnessLabel(load = loadIndicatorValues, now = new Date())`, która woła `load('density')` i zwraca `freshnessLabel(values?.fetchedAt, now)` (brak pliku / błąd = `null`). Komponent `DataFreshness` używa jej zamiast `loadFreshness()`. Identyfikator `'density'` weź z `DEFAULT_INDICATOR_ID` (`src/core/map/main-view.ts`), jeśli to ten sam plik co `FRESHNESS_URL`; w komentarzu po polsku zaznacz zależność.
3. `src/core/freshness/freshness.ts` zostaje bez zmian (istniejący test `freshness.test.ts` go używa).
4. `tests/unit/data-freshness-cache.test.ts`: (a) z atrapą `load` zwracającą obiekt z `fetchedAt` – etykieta „Dane GUS odświeżone: DD.MM.RRRR”; (b) atrapa zwraca `null` – wynik `null`; (c) dwa wywołania `loadFreshnessLabel()` z prawdziwym `loadIndicatorValues` i atrapą `fetch` (przez `vi.stubGlobal('fetch', …)` + `resetValuesCache()` przed testem) = dokładnie 1 wywołanie `fetch`.
5. `tests/e2e/freshness-single-fetch.spec.ts` (nazwa testu z `@S99`): licz żądania `**/data/values/density.json`; wejdź na /rankingi, przejdź linkiem w nagłówku na /o-projekcie i wróć linkiem na /rankingi (nawigacja SPA, bez `page.goto` w środku) – łącznie najwyżej 1 żądanie, a stopka pokazuje tekst „Dane GUS odświeżone”.

Gotowe, gdy:
- Test jednostkowy (c) wykazuje 1 żądanie przy dwóch wywołaniach.
- Test e2e: najwyżej 1 żądanie density.json w ścieżce /rankingi → /o-projekcie → /rankingi, linijka świeżości widoczna.
- Istniejące testy (freshness.test.ts, navigation-and-budgets.spec.ts, site-footer-mobile.*) zielone bez zmian.

Nie rób: zmian w src/core/freshness/freshness.ts, src/core/data/load-values.ts, SiteFooter.tsx ani w istniejących testach; nie importuj plików JSON z public/data.
