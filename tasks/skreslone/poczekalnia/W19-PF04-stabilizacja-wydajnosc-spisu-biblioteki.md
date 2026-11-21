# PF04 – Stabilizacja: przygotowanie spisu biblioteki szybsze (test `library-only-fetched` bez losowych czerwieni)
Cel: Pierwsze zapytanie do 64 000 zmiennych nie normalizuje wszystkich nazw z góry, więc test czasu (< 200 ms) przechodzi także na wolnym runnerze CI.
Zmieniaj: src/core/library/query.ts, tests/unit/library-prepare-cost.test.ts
Wymagane: tests/unit/library-prepare-cost.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/library/query.ts (`getPreparedIndex`, `filterVars`, `filterFetched`, `libraryCounts`), src/core/library/index-contract.ts (`prepare` – tylko czytasz), tests/unit/library-only-fetched.test.ts (**istniejący – nie zmieniaj**; linia ~103: `expect(duration).toBeLessThan(200)`), tests/unit/library-query-perf.test.ts, src/core/search/normalize.ts

## Kontekst
Test `library-only-fetched` mierzy `filterFetched(index, emptyQuery())` na 64 000 zmiennych z limitem 200 ms i czasem wypada czerwono na CI (zależy od obciążenia runnera). Mierzone jest **pierwsze** wywołanie, czyli także `getPreparedIndex`, a ta pętla robi `normalize(v.name)` dla każdej z 64 000 nazw, choć przy pustej frazie nikt tej wartości nie używa. Zmiany istniejącego testu zabronione (AGENTS.md) – poprawiamy kod, nie limit.

## Research (10 min, bez nowych pakietów)
1. Uruchom istniejący test 20 razy (`pnpm exec vitest run tests/unit/library-only-fetched.test.ts --repeat 20` lub pętla) i zapisz najgorszy czas; w drugim kroku zmierz, ile z tego to `getPreparedIndex` (tymczasowy `console.time`, usuń przed commitem).
2. Znajdź w `query.ts` wszystkie miejsca czytające `normName` (szukanie po frazie, sortowanie?). Lista trafia do opisu PR.
3. Sprawdź `index-contract.ts → prepare`: tam `normName` liczy się przy wczytaniu pliku robota (poza ścieżką testu); nie zmieniaj, jeśli to osobny kod ścieżki produkcyjnej – opisz w PR, czy dubluje pracę.

## Zadanie
W `src/core/library/query.ts` zrób `normName` **leniwym**: przygotowanie spisu (`getPreparedIndex`) nie normalizuje nazw; nazwa jest normalizowana przy pierwszym użyciu frazy tekstowej (pamięć podręczna w `WeakMap`/polu na zmiennej, jedna normalizacja na zmienną). Zachowanie wyników **bez zmian** (te same wyniki i kolejność dla każdej frazy). Jeśli `v.normName` jest już ustawione (ścieżka `prepare`), użyj go. Nie zmieniaj sygnatur eksportów.
Jeśli po zmianie najgorszy czas z 20 przebiegów nadal > 100 ms, opisz w PR, co jeszcze kosztuje, i zaproponuj dalszy krok (bez zmiany limitu testu).

## Testy (`tests/unit/library-prepare-cost.test.ts` – nowy plik; istniejących nie ruszasz)
Zlicz wywołania `normalize` przez zamockowany moduł `../../src/core/search/normalize` (`vi.mock` z przekazaniem do prawdziwej funkcji):
1. `filterFetched(index64k, emptyQuery())` wykonuje **0** normalizacji nazw zmiennych (pusta fraza).
2. To samo zapytanie z frazą („wskaznik 12”) normalizuje każdą nazwę **najwyżej raz**; drugie zapytanie z inną frazą → 0 dodatkowych normalizacji.
3. Wyniki dla 5 różnych fraz (w tym z polskimi znakami: „ludność”/„ludnosc”) są identyczne z wynikami sprzed zmiany (zapisz oczekiwane listy id w teście na małym fixture `tests/fixtures/library/index.json`).
4. `libraryCounts(index64k)` zwraca `{ fetched: 100, total: 64000 }` bez normalizacji nazw.
5. Istniejące `library-only-fetched`, `library-query`, `library-query-perf` zielone bez zmian.

## Gotowe, gdy
- Testy 1–5 zielone; 20 przebiegów `library-only-fetched` bez czerwonego; zmiana ≤ 60 linii w `query.ts`.
Nie ruszaj: `tests/unit/library-only-fetched.test.ts`, `index-contract.ts`, widoków biblioteki.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
