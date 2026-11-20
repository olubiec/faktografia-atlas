# U11 – Robot biblioteki: najpierw wskaźniki podstawowe i popularne, codziennie do limitu API
Cel: robot pobiera najpierw wskaźniki podstawowe i najczęściej potrzebne, a każdej doby zużywa prawie cały dozwolony budżet zapytań do GUS, bez przekroczenia żadnego okna limitu.
Zmieniaj: config/library-priority.json, scripts/data/library-priority.mjs, scripts/data/library.mjs, .github/workflows/fetch-library.yml, tests/unit/library-priority.test.ts, tests/fixtures/library-catalog-sample.json, docs/research/u/U11.md
Wymagane: tests/unit/library-priority.test.ts, tests/fixtures/library-catalog-sample.json, docs/research/u/U11.md
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (§0, decyzja D2), AGENTS.md, docs/research/biblioteka-gus.md (limity i koszt zapytań), scripts/data/library.mjs, scripts/data/library-lib.mjs, .github/workflows/fetch-library.yml, .github/workflows/fetch-data.yml, tests/unit/library.test.ts, docs/research/u/WYTYCZNE.md
Zgoda właściciela (20.11) na zmiany w scripts/data, config/ i .github/workflows/fetch-library.yml w zakresie tego zadania. Innych workflowów i skryptów nie ruszasz.

## Stan wyjściowy (gałąź data/library, 20.11.2026; sprawdź ponownie i wpisz do raportu)
- Katalog: 172 740 zmiennych. Z danymi na poziomie powiatu lub gminy (level ≥ 5): 63 960. Pobrane: 2 436 (3,8%). Nieudane: 155. Do pobrania: ok. 61 500.
- Obecna kolejność (`sortQueue` w library-lib.mjs): najpierw zmienne z gminami, potem rosnąco po numerze id. Numer id nie mówi nic o popularności.
- Największe działy w katalogu: Fundusze unijne 42 428, Narodowe spisy powszechne 40 342, Rynek pracy 16 211, Ludność 10 119, Przemysł i budownictwo 9 085, Szkolnictwo 7 188. Dwa pierwsze to w większości drobne tabele rozbić, mało przydatne na mapie.
- Budżet dziś: 2 przebiegi po 2 500 zapytań (04:40 i 16:40) = ok. 5 000 na dobę; do tego nocne „Fetch data” ok. 750. Ok. 45 zapytań na zmienną daje ok. 110 zmiennych na dobę, czyli komplet zająłby ponad rok.
- Limity klucza BDL: 10/s, 500/15 min, 5 000/12 h, 50 000/7 dni (docs/research/biblioteka-gus.md). Nie rejestrujemy kolejnych kluczy.

## Zadanie
1. **Kolejka wg priorytetu.** Nowy plik scripts/data/library-priority.mjs z czystymi funkcjami: `priorityScore(variable, subjectPath, config)` i `sortQueueByPriority(variables, catalog, config, state)`. Funkcji `sortQueue` z library-lib.mjs nie zmieniasz (test library.test.ts musi dalej przechodzić). `downloadValues` w library.mjs używa nowej kolejki. Wynik jest deterministyczny: ten sam katalog daje tę samą kolejność, remis rozstrzyga rosnące id.
2. **Wagi w pliku, nie w kodzie.** config/library-priority.json (da się go edytować bez ruszania kodu):
   - `sectionWeights`: waga 0–100 dla działu najwyższego poziomu. Nazwy działów weź z catalog.json (nie zgaduj). Propozycja wyjściowa: 100 – Ludność, Rynek pracy, Wynagrodzenia i świadczenia, Szkolnictwo, Ochrona zdrowia, Finanse publiczne, Budownictwo mieszkaniowe, Gospodarka komunalna i ochrona środowiska, Transport; 50 – Kultura, Turystyka, Pomoc społeczna, Bezpieczeństwo publiczne, Rolnictwo, Podmioty gospodarki narodowej, Ceny, Szkolnictwo wyższe, Przemysł i budownictwo; 10 – Narodowe spisy powszechne, Powszechne spisy rolne, Finanse przedsiębiorstw (dane kwartalne); 1 – Fundusze unijne (dane półroczne). Dział bez wpisu: 20.
   - `keywordBoosts`: lista `{ "match": "ogółem", "points": 10 }` itp. (dopasowanie bez rozróżniania wielkości liter w nazwach n1–n5). Propozycja: „ogółem” +10, „na 1000” +15, „%” +10, „bezrobot” +15, „wynagrodzen” +15, „liczba ludności” +20, „dochody” +10, „mieszkań” +10.
   - `depthPenalty`: −8 punktów za każdy dodatkowy poziom rozbicia (n2…n5), żeby „ogółem” poprzedzało „kobiety 25–29 lat z wykształceniem…”.
   - `levelBonus`: gminy +20, powiaty 0.
   - `pinnedIds`: zmienne zawsze pierwsze (dziś 20 z config/indicators.json, żeby ich odświeżanie nie głodziło).
   - `popularIds` (opcjonalnie, może być pusta lista): +40; miejsce na przyszłe dane o tym, co użytkownicy naprawdę wybierają.
   - `maxSectionShareInRun`: 0,4. W jednym przebiegu najwyżej 40% pobranych zmiennych z jednego działu, dopóki są inne do pobrania. Strona dostaje przekrój tematów, a nie 200 tabel o ludności.
   - Nieudane (`state.failed` < 3) idą na koniec kolejki.
3. **Cały dzienny limit.** Plan dobowy liczysz jako: 95% limitu 7-dniowego (47 500) ÷ 7 dni − nocne „Fetch data” (ok. 750) ≈ 6 000 zapytań na dobę dla biblioteki. Wstępnie: 2 przebiegi po 3 000 (04:40 i 16:40; do 100 min przy 1 zapytaniu na 2 s). Zmień `LIBRARY_BUDGET` i domyślną wartość w fetch-library.yml; `LIBRARY_MINUTES` i `timeout-minutes` dopasuj do czasu przebiegu (sprawdź, czy 3 000 zapytań mieści się w ograniczeniu czasu przy ponowieniach). Zachowaj grupę `concurrency: fetch-data`.
4. **Dowód, że limity są bezpieczne.** `scripts/data/library-priority.mjs` ma też funkcję `checkWindows(runs, limits, safety)`: bierze listę przebiegów (godzina startu, liczba zapytań, tempo) razem z nocnym robotem i sprawdza każde przesuwne okno 15 min, 12 h i 7 dni. Domyślnie `safety` = 0,95 dla 12 h i 7 dni oraz 0,9 dla 15 min. Test sprawdza, że obecny plan przechodzi, a zły plan (np. dwa przebiegi po 3 000 w odstępie 6 h) nie przechodzi.
5. **Podgląd bez sieci.** `LIBRARY_DRY=1 node scripts/data/library.mjs` wypisuje, ile i które zmienne weszłyby do kolejki (po działach), i kończy przed pierwszym zapytaniem. Użyj go do raportu na katalogu z gałęzi data/library (`git fetch origin data/library`, `git worktree add` do scratchpada).
6. **Wynik widoczny w Actions.** Na końcu przebiegu skrypt wypisuje tabelę „Pobrano w tym przebiegu wg działów” i liczbę zmiennych pozostałych w kolejce. Workflow dopisuje ją do podsumowania „Biblioteka GUS” (GITHUB_STEP_SUMMARY).
7. **Raport U11.md** (wg WYTYCZNE): (a) stan wyjściowy z liczbami, (b) pierwsze 100 zmiennych kolejki z działem i wynikiem, (c) rozkład działów w pierwszych 1 000, 5 000 i 20 000, (d) szacunek: po ilu dniach ukończone 1 000 / 5 000 / 20 000 zmiennych przy 6 000 zapytań na dobę i faktycznym koszcie zapytań na zmienną (zmierz ze state.json i logów; podaj metodę), (e) co użytkownik zobaczy na stronie po 7, 30 i 90 dniach (np. liczba wskaźników w wyborze danych), (f) ryzyka i pytania do właściciela (najwyżej 3, np. czy wagi działów są dobre, czy spisy powszechne podnieść).

Gotowe, gdy:
- Test: w próbce prawdziwych zmiennych (tests/fixtures/library-catalog-sample.json, ok. 60 pozycji z katalogu: z różnych działów, z rozbiciami i bez) „Ludność ogółem, gmina” jest przed rozbiciem po wieku i płci, a zmienne działu „Fundusze unijne” są za zmiennymi z działów o wadze 100.
- Test: `pinnedIds` zawsze pierwsze; nieudane na końcu; ta sama kolejność przy dwóch wywołaniach.
- Test: limit udziału działu w przebiegu (przy kolejce z 100 zmiennych z jednego działu i 20 z innych, pierwsze 50 ma ≥ 12 z innych działów).
- Test: `checkWindows` przepuszcza plan z kroku 3 i odrzuca zły plan.
- Test: config/library-priority.json ma poprawny kształt (wagi 0–100, liczby całkowite, brak duplikatów kluczy).
- Istniejący tests/unit/library.test.ts przechodzi bez zmian.
- U11.md zawiera punkty a–f z kroku 7.
Nie ruszaj: src/*, public/*, scripts/data/fetch-values.mjs, scripts/data/library-lib.mjs, scripts/data/library-available.mjs, innych workflowów, istniejących testów, docs/STAN.md, package.json, pnpm-lock.yaml, klucza BDL (sekret zostaje, nie wypisuj go w logach).
Po ludzku w PR: co zmieni się w kolejności pobierania, ile wskaźników pojawi się na stronie po tygodniu, jak sprawdzić w Actions (zakładka „Fetch library”, podsumowanie przebiegu), że robot dalej mieści się w limitach.
Tytuł PR zaczyna się od `[W22-U11]`; opis ma „Po ludzku”.
