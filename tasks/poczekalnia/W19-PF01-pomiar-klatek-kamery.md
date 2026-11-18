# PF01 – Pomiar klatek kamery na „telefonie” (narzędzie + raport wyjściowy)
Cel: Powtarzalny pomiar płynności ruchu mapy (klatki, p95, długie zadania) przy dławieniu procesora jak w telefonie, żeby dalsze poprawki ruchu opierały się na liczbach.
Zmieniaj: src/core/map/frame-stats.ts, tests/unit/frame-stats.test.ts, tests/e2e/perf-camera-frames.spec.ts, docs/research/p-kamera-pomiar-telefon.md
Wymagane: src/core/map/frame-stats.ts, tests/unit/frame-stats.test.ts, tests/e2e/perf-camera-frames.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/perf-camera-frames.spec.ts
Przeczytaj najpierw: docs/research/q-c401-ruch-mapy.md (cały, w tym skrypt pomiarowy w dodatku), src/core/map/test-seam.ts, src/view/map/hooks/useMapViewState.ts (`animateToView`, `syncCameraSeam`), tests/e2e/camera.spec.ts, tests/e2e/perf-budget.spec.ts, playwright.config.ts (tylko czytasz)

## Kontekst
Właściciel ocenia na telefonie i widzi, że zoom oraz dojazd kamery nadal nie są płynne. Raport QC401 (17.11) mierzył na SwiftShader bez dławienia procesora i dał tylko liczby względne (w oknie 2,5 s zebrano 4–13 klatek rAF). Zanim ktokolwiek ruszy `AtlasMap.tsx` i `useMapViewState.ts` (zadania PM10, QC403, QC404), potrzebujemy narzędzia, które daje **te same liczby przed i po** każdej zmianie. Nic w kodzie strony się tu nie zmienia.

## Research (15 min, bez nowych pakietów)
1. Przeczytaj skrypt z dodatku do `docs/research/q-c401-ruch-mapy.md`; przepisz jego próbnik rAF do testu (własny kod, w stylu repo).
2. Chrome DevTools Protocol w Playwright: `context.newCDPSession(page)` + `Emulation.setCPUThrottlingRate { rate: 4 }` (dławienie ×4 ≈ średni telefon). Sprawdź w dokumentacji Playwright 1.64 i CDP, że obie rzeczy działają w Chromium headless; zapisz wersję i link w opisie PR.
3. Długie zadania: `PerformanceObserver` z `entryTypes: ['longtask']` (API przeglądarki, bez pakietu). Zanotuj, że headless na SwiftShader zawyża czasy – raport ma podawać to wprost.
4. **Nie dodawaj pakietów** (np. do statystyk). Percentyle liczysz sam.

## Zadanie
- `src/core/map/frame-stats.ts` (czysty TS): 
  - `export type FrameSummary = { frames: number; durationMs: number; p50: number; p95: number; max: number; longFrames: number; droppedShare: number }`.
  - `export function percentile(sorted: number[], p: number): number` (metoda najbliższej pozycji; pusta tablica → 0).
  - `export function summarizeFrames(timestampsMs: number[], budgetMs = 1000 / 60): FrameSummary` – z kolejnych znaczników czasu rAF liczy odstępy; `longFrames` = odstępy > 50 ms; `droppedShare` = udział odstępów > 1,5 × budżet; mniej niż 2 znaczniki → same zera.
- `tests/e2e/perf-camera-frames.spec.ts` (nazwy z `@P1`): próbnik rAF w stronie (`page.evaluate`), dławienie CPU przez CDP, widok 390×844, `hasTouch`, `deviceScaleFactor: 3`. Scenariusze: (a) wybór województwa przez wyszukiwarkę, (b) przycisk/klawisz „+” , (c) kółko ×3, (d) pinch dwoma palcami (CDP `Input.dispatchTouchEvent`), (e) „Wróć”, (f) zmiana wskaźnika, (g) przełączenie na „Powiaty”. Dla każdego: `summarizeFrames` + liczba długich zadań + `zoom` z `window.__atlas.viewState` na początku i końcu. Wyniki jako `test.info().attach('camera-frames.json', …)` i tabela w konsoli.
- Test pomiarowy (b–g) uruchamia się tylko przy `PERF=1` (`test.skip(!process.env.PERF, 'pomiar wydajności: tylko na żądanie, wynik zależy od maszyny')`). Jeden test **bez** warunku: próbnik na bezczynnej stronie zbiera > 30 klatek w 1 s, a `summarizeFrames` z tych znaczników daje `p50` < 100 ms (sprawdza samo narzędzie, nie wydajność aplikacji).
- `docs/research/p-kamera-pomiar-telefon.md`: tabela wyników z jednego uruchomienia `PERF=1` (maszyna, wersje, dławienie), kolumny jak w QC401 plus p95 i `droppedShare`; sekcja „Ograniczenia pomiaru”; sekcja „Próg do dalszych zadań”: zaproponuj liczby docelowe (np. p95 < 33 ms, `droppedShare` < 10% przy dławieniu ×4) – tylko propozycja, decyduje właściciel.

## Testy
1. `percentile`: [1,2,3,4,5] i p=0,5 → 3; p=0,95 → 5; pusta tablica → 0.
2. `summarizeFrames` na 61 znacznikach co 16,7 ms: `frames` = 60, `p95` ≈ 16,7, `longFrames` = 0, `droppedShare` = 0.
3. `summarizeFrames` ze znacznikami z jedną przerwą 120 ms: `longFrames` = 1, `max` = 120, `droppedShare` > 0.
4. Mniej niż 2 znaczniki → wszystkie pola 0 (bez dzielenia przez zero).
5. e2e `@P1` bez `PERF`: próbnik na bezczynnej stronie działa (warunek jak wyżej).

## Gotowe, gdy
- Testy 1–5 zielone; `PERF=1 pnpm exec playwright test tests/e2e/perf-camera-frames.spec.ts` drukuje tabelę dla 7 scenariuszy.
- `docs/research/p-kamera-pomiar-telefon.md` zawiera prawdziwe liczby z uruchomienia i uczciwe ograniczenia.
- Zwykłe `pnpm test:e2e` nie wydłuża się (testy pomiarowe pominięte z komentarzem).
Nie ruszaj: `src/view/**`, `src/core/map/test-seam.ts`, `playwright.config.ts`, istniejących testów e2e.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
