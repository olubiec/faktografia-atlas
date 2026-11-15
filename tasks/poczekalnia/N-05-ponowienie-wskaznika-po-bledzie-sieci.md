# N-05 – Wskaźnik da się wczytać ponownie po chwilowym błędzie sieci
Cel: Gdy pobranie `values/<id>.json` padnie przez chwilowy brak sieci albo błąd serwera (5xx), następna próba (ponowny wybór wskaźnika, powrót na stronę) pobiera plik jeszcze raz zamiast do końca sesji pokazywać „brak danych”; prawdziwy brak pliku (404) dalej jest zapamiętany.
Zmieniaj: src/core/data/load-values.ts, tests/unit/load-values-retry.test.ts
Wymagane: tests/unit/load-values-retry.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/data/load-values.ts, tests/unit/load-values.test.ts (nie zmieniać), docs/PRODUKT.md (§7), tasks/poczekalnia/NOC-RAPORT.md (W17-T04)

Zadanie:
1. W `loadIndicatorValues`: odpowiedź 404 (i inne 4xx) → `valuesCache.set(id, null)` jak dziś; odpowiedź 5xx oraz odrzucony `fetch` (błąd sieci) → zwróć `null`, ale NIE zapisuj nic w `valuesCache` (wpis w `loadingPromises` i tak znika w `finally`). Plik z niepoprawną treścią (brak `years`/`values`) → zapamiętany `null` jak dziś.
2. Równoległe wywołania dla tego samego `id` dalej dają jedno żądanie.
3. Komentarz JSDoc po polsku: które błędy są zapamiętywane, a które nie i dlaczego.
4. `tests/unit/load-values-retry.test.ts` (każdy test zaczyna od `resetValuesCache()`):
   - pierwsze wywołanie: `fetch` odrzucony → `null`; drugie: poprawny plik → dane; `fetch` wywołany 2 razy;
   - pierwsze: status 503 → `null`; drugie: 200 → dane; 2 wywołania;
   - 404 → `null`, drugie wywołanie bez nowego żądania (1 wywołanie);
   - po udanym pobraniu kolejne wywołania bez żądań;
   - dwa równoległe wywołania przy błędzie sieci → 1 żądanie, oba `null`.

Gotowe, gdy:
- Wszystkie 5 przypadków w load-values-retry.test.ts przechodzi.
- load-values.test.ts, network-resilience.spec.ts i perf-budget.spec.ts zielone bez zmian.

Nie rób: zmian w load-profile.ts (istniejący test wymaga tam zapamiętania błędu sieci – osobna decyzja), w widokach, w istniejących testach; bez automatycznych ponowień w pętli i bez timerów.
