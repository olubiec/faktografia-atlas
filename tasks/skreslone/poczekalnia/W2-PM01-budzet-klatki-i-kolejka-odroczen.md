# PM01 – Budżet klatek i kolejka odroczeń (czysta logika)
Cel: Dwa małe, przetestowane moduły: wykrywanie, że telefon nie wyrabia z klatkami, oraz kolejka, która wstrzymuje ciężką pracę na czas ruchu mapy i wykonuje ją, gdy ruch ustanie.
Zmieniaj: src/core/map/frame-budget.ts, src/core/map/defer-queue.ts, tests/unit/frame-budget.test.ts, tests/unit/defer-queue.test.ts
Wymagane: tests/unit/frame-budget.test.ts, tests/unit/defer-queue.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/map/frame-stats.ts (PF01: `percentile`, `summarizeFrames`), docs/research/p-kamera-pomiar-telefon.md (PF01: proponowane progi), src/view/map/hooks/useMapViewState.ts (gdzie dziś startuje `loadLocalities` przy zoomie ≥ 8,5 i inne prace w trakcie ruchu – tylko czytasz), src/view/map/hooks/useChoropleth.ts, docs/PRODUKT.md §5a, §7

## Kontekst
Ruch mapy na telefonie zacina się m.in. dlatego, że w trakcie animacji kamery dzieje się inna praca: pobranie i budowa warstwy miejscowości, aktualizacje paneli, odpytywanie adresu. Zamiast zgadywać, ile jej zostawić, dajemy logice dwa narzędzia: (1) **budżet klatek** – z ostatnich odstępów rAF wnioskuje „pełna jakość / oszczędnie” z histerezą; (2) **kolejkę odroczeń** – zadania zgłoszone w trakcie ruchu czekają do jego końca. Wpięcie w ekrany robią późniejsze zadania (PM13, PM14); tu tylko logika.

## Research (10 min, bez nowych pakietów)
Przeczytaj progi z raportu PF01. Jeśli raportu jeszcze nie ma (PF01 niescalone), zatrzymaj się i napisz w PR, że zadanie czeka na falę 19.

## Zadanie
1. `src/core/map/frame-budget.ts`:
   - `export type QualityLevel = 'full' | 'lite'`.
   - `export function createFrameBudget(opts?: { window?: number; slowP95Ms?: number; recoverP95Ms?: number; recoverFrames?: number })` → `{ record(dtMs: number): void; level(): QualityLevel; reset(): void }`. Domyślnie okno 30 klatek, `slowP95Ms` 33, `recoverP95Ms` 22, `recoverFrames` 60. Przejście `full → lite`, gdy p95 okna > `slowP95Ms`; powrót `lite → full` dopiero po `recoverFrames` kolejnych klatek z p95 < `recoverP95Ms` (histereza: brak migotania). Odstępy > 500 ms (karta w tle) ignorowane. `level()` przed zebraniem pełnego okna = `full`.
2. `src/core/map/defer-queue.ts`:
   - `export function createDeferQueue(opts?: { settleMs?: number; now?: () => number; setTimer?: (fn: () => void, ms: number) => unknown; clearTimer?: (h: unknown) => void })` → `{ setMoving(moving: boolean): void; run(key: string, task: () => void): void; pending(): number }`.
   - `run` gdy nie ma ruchu → wykonuje od razu; w ruchu → zapamiętuje (**ostatnie** zadanie pod danym `key` zastępuje poprzednie, żeby nie wykonać 20 razy tego samego).
   - `setMoving(false)` → po `settleMs` (domyślnie 120 ms) wykonuje zaległe zadania w kolejności zgłoszenia; `setMoving(true)` w tym czasie anuluje odliczanie.
   - Błąd w jednym zadaniu nie blokuje pozostałych (przechwyć i kontynuuj).

## Testy
`frame-budget.test.ts`:
1. 30 klatek po 16,7 ms → `full`; 30 klatek po 50 ms → `lite`.
2. Po przejściu na `lite` krótka seria dobrych klatek (30) nie wraca do `full`; po 60 dobrych klatek wraca.
3. Odstęp 2000 ms (karta w tle) nie zmienia poziomu.
4. `reset()` przywraca `full`.
5. Własne progi w `opts` są respektowane.
`defer-queue.test.ts` (wstrzyknięty zegar i timer, bez prawdziwych timerów):
6. Bez ruchu `run` wykonuje zadanie natychmiast.
7. W ruchu zadania czekają (`pending()` = liczba kluczy); po `setMoving(false)` i upływie `settleMs` wykonują się raz każde, w kolejności.
8. Dwa zadania pod tym samym kluczem w ruchu → wykona się tylko ostatnie.
9. `setMoving(true)` w czasie odliczania anuluje wykonanie; kolejne `setMoving(false)` wznawia.
10. Wyjątek w zadaniu nie zatrzymuje następnych.

## Gotowe, gdy
- 10 testów zielonych; oba pliki ≤ 100 linii; zero `window`/`document`/`setTimeout` wprost (zegar i timer wstrzykiwane, domyślnie globalne).
Nie ruszaj: `src/view/**`, `frame-stats.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
