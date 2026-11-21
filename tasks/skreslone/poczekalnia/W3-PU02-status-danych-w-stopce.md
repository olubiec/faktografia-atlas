# PU02 – „Dane z dnia…” widoczne w stopce strony
Cel: W stopce każdej strony widać, z kiedy są dane i kiedy automat ostatnio sprawdzał (gdy plik statusu istnieje); brak pliku niczego nie psuje.
Zmieniaj: src/view/layout/SiteFooter.tsx, tests/unit/site-footer-freshness.test.tsx
Wymagane: tests/unit/site-footer-freshness.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/editorial-pages.spec.ts tests/e2e/home.spec.ts
Przeczytaj najpierw: src/view/layout/SiteFooter.tsx, src/view/layout/DataFreshness.tsx i src/core/data/load-status.ts (PU01), tests/unit/site-layout.test.tsx (**istniejący – nie zmieniaj**), tests/e2e/editorial-pages.spec.ts, docs/PRODUKT.md §7 (budżet żądań na wejściu: `status.json` jest malutki i ładowany po wejściu, nie blokuje mapy)

## Kontekst
Odpowiedź na pytanie właściciela „czy automat coś pobrał”. `DataFreshness` i `loadDataStatus` istnieją (PU01), a `status.json` zapisują workflowy (PD02). Tu tylko wstawiamy napis w stopkę. Żądanie `status.json` musi być **po** wejściu (po załadowaniu mapy), jedno na sesję, bez wpływu na próg „dane na wejściu” z PRODUKT §7.

## Research (5 min)
Sprawdź w `tests/e2e/perf-budget.spec.ts` i `main-screen.spec.ts`, jakie żądania są liczone na wejściu; ustal, czy nowe żądanie `…/status.json` zmieni któryś istniejący licznik (jeśli tak – zatrzymaj się, opisz w PR: wtedy odroczyć żądanie do `requestIdleCallback`/po `ready`).

## Zadanie
`SiteFooter.tsx`: po zamontowaniu (efekt) `loadDataStatus()`; wynik do `<DataFreshness status={…} />` w istniejącej stopce (nowy wiersz pod źródłem danych GUS); bez statusu – komponent nic nie pokazuje (stopka jak dziś). Zero zmian w układzie, gdy statusu brak; stopka nie rośnie ponad ok. 200 linii.

## Testy (`tests/unit/site-footer-freshness.test.tsx`)
1. Z atrapą `loadDataStatus` zwracającą status ze świeżym `checkedAt` stopka zawiera „Sprawdzone przez automat”.
2. Z `null` (brak pliku) stopka renderuje się jak dziś (brak słów „Sprawdzone”, brak wyjątku).
3. Status z `checkedAt` sprzed 5 dni → w stopce słowo „uwaga”.
4. `loadDataStatus` wołane najwyżej raz na montaż stopki.
5. Istniejące `site-layout.test.tsx` i e2e z linii „Weryfikacja” zielone bez zmian; żaden istniejący licznik żądań na wejściu się nie zmienia.

## Gotowe, gdy
- Testy zielone; na podglądzie Vercel w stopce widać wiersz z datą (po scaleniu PD02 i pierwszym przebiegu robota).
Nie ruszaj: `DataFreshness.tsx`, `load-status.ts`, `SiteLayout.tsx`, `IndicatorPanel.tsx`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
