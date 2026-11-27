# O01 – Fakty niosą percentyl kraju, stosunek do mediany i histogram rozkładu
Cel: każdy fakt gminy w `facts/<WW>.json` ma percentyl wśród gmin w Polsce i stosunek do mediany kraju, a plik województwa zawiera histogram rozkładu każdego wskaźnika (pod pasek „Na tle kraju”).
Zmieniaj: scripts/data/build-facts.mjs, src/core/facts/codec.ts, src/core/facts/types.ts, config/facts.json, tests/unit/w31-o01-percentiles.test.ts, tests/fixtures/facts-percentile/*
Wymagane: tests/unit/w31-o01-percentiles.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (§2, §8), scripts/data/build-facts.mjs, src/core/facts/codec.ts, src/core/facts/types.ts, docs/PRODUKT.md §7 (budżety)

Zadanie:
1. W `build-facts.mjs` policz dla każdego wskaźnika gminnego z `public/data/values` i najnowszego roku: percentyl gminy (0–100, 100 = najwyższa wartość), mediana kraju i stosunek wartości do mediany.
2. Reguła zer (`zeroGuard` w `config/facts.json`): gdy mediana = 0 albo wartość = 0, stosunek nie jest liczony (pole puste), percentyl zostaje. Wartości `null` nie wchodzą do rozkładu.
3. Do pliku województwa dopisz `dist`: dla każdego wskaźnika 20 przedziałów (liczba gmin w kraju na przedział, równe przedziały od 1. do 99. percentyla), mediana i granice. Dopasuj `codec.ts` i `types.ts` (zapis zwarty, bez wcięć).
4. Wzrost `facts/<WW>.json` ≤ 30% (po gzip ≤ +5 KB). `facts-start.json` bez zmian rozmiarem.
5. Stare pliki bez nowych pól nadal się wczytują (pola opcjonalne).

Gotowe, gdy:
- Test: na fixture z 11 gminami percentyl i stosunek zgadzają się z obliczeniem ręcznym (wartości w teście).
- Test: mediana 0 albo wartość 0 = brak stosunku, jest percentyl; `null` pomijane.
- Test: histogram ma 20 przedziałów, suma = liczba gmin z wartością.
- Test: stary plik faktów bez nowych pól dekoduje się bez wyjątku.
- Test: przyrost rozmiaru pliku województwa z fixture ≤ 30%.
Nie ruszaj: `src/view/*`, kolejności i wyboru faktów (to O04), istniejących testów.
Tytuł PR zaczyna się od `[W31-O01]`; opis ma „Po ludzku”. Po merge trzeba przebiegu „Fetch data” (zrobi właściciel).
