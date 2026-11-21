# PD01 – Skrypt „status danych”: mały plik `status.json` z datami pobrań i liczbami
Cel: Czysta funkcja i skrypt, które z plików robota budują mały `status.json` (kiedy robot ostatnio sprawdzał, które dane z jakiego dnia, ile wskaźników jest pobranych), do pokazania w interfejsie i do kontroli „czy automat działa”.
Zmieniaj: scripts/data/status.mjs, tests/unit/data-status-script.test.ts
Wymagane: tests/unit/data-status-script.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: raport audytu automatu z zadania FIX5 (docs/ lub opis PR FIX5 – jeśli nie jest scalony, zatrzymaj się), scripts/data/library-available.mjs (wzór: czysta `buildAvailable` + cienka nakładka z zapisem atomowym), tests/unit/library-available-script.test.ts (wzór testu), scripts/data/nightly-checks.mjs (`revert-noise` – dlaczego `fetchedAt` w plikach wartości się nie zmienia), src/core/data/freshness.ts (PF03), docs/ARCHITEKTURA.md §5.2

## Kontekst
Nocny robot „Fetch data” zapisuje zmiany tylko wtedy, gdy zmieniły się liczby (`revert-noise` cofa zmiany samych znaczników czasu), więc `fetchedAt` w plikach wartości mówi „kiedy liczby faktycznie się zmieniły” (dziś: wszystkie 19.10.2026), a nie „kiedy robot sprawdzał”. Gdy nic się nie zmienia, strona nie ma jak pokazać, że automat żyje. Rozwiązanie: osobny, malutki plik statusu zapisywany **zawsze**, na gałęzi, która nie wymaga scalania PR (patrz D5 w `docs/PLAN-POPRAWEK.md`). To zadanie robi tylko skrypt i test; podpięcie do workflowów to PD02 (fala 3, za zgodą).

## Research (10 min, bez nowych pakietów)
1. Przeczytaj wnioski FIX5: gdzie dziś brakuje śladu przebiegu, jak wygląda `data/library/library/state.json` (pola `done`, `queue`, `pending`).
2. Sprawdź rozmiar: `status.json` ma mieć < 8 KB (limit PRODUKT §7 dla małych plików wejścia); nie wpisuj wartości danych, tylko daty i liczby.

## Zadanie
`scripts/data/status.mjs` (ESM, jak `library-available.mjs`):
- `export function buildStatus({ valuesFiles, available, state, now })` → obiekt (bez wcięć przy zapisie):  
  `{ version: 1, checkedAt: now.toISOString(), values: { count, latestFetchedAt, latestYear, oldestFetchedAt }, library: { availableCount, availableGeneratedAt, doneCount, pendingCount } }`  
  gdzie `valuesFiles` = tablica plików z `public/data/values` (`fetchedAt`, `years`), `available` = zawartość `available.json` lub `null`, `state` = `state.json` lub `null`. Brakujące źródło → pola `null`, nie wyjątek.
- `export async function writeStatus({ valuesDir, libraryDir, out, now = new Date() })` – czyta katalogi, zapisuje atomowo (`.tmp` + `rename`), `JSON.stringify` bez spacji.
- Wywołanie z linii poleceń: `node scripts/data/status.mjs --values public/data/values --library lib-wt/library --out <plik>`; brak parametru → komunikat użycia i kod 1.

## Testy (`tests/unit/data-status-script.test.ts`)
1. Na 3 sztucznych plikach wartości (`fetchedAt` z różnych dni) `latestFetchedAt` i `oldestFetchedAt` wskazują właściwe daty; `latestYear` = największy rok ze wszystkich `years`.
2. `available` z fixtures (`tests/fixtures/library/available.json`) daje `availableCount` = 5; `state` z `done` o 3 kluczach daje `doneCount` = 3.
3. `available = null` i `state = null` → pola biblioteki `null`, `checkedAt` ustawione, brak wyjątku.
4. `checkedAt` równe wstrzykniętemu `now` (deterministycznie).
5. Zapis atomowy: po `writeStatus` istnieje plik wynikowy i nie ma `.tmp`; wynik parsuje się jako JSON i ma < 8 KB także dla 2000 wskaźników biblioteki.
6. Plik wynikowy nie zawiera wcięć/nowych linii (jedna linia).

## Gotowe, gdy
- 6 testów zielonych; skrypt ≤ 120 linii; `package.json` bez zmian (skrypt wołany wprost przez `node` w workflow).
Nie ruszaj: `.github/workflows/*`, `scripts/data/library*.mjs`, `scripts/data/nightly-checks.mjs`, `package.json`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
