# W2-FIX6G – Reduced-motion i pomiar po
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
Przy ustawieniu systemu „ogranicz ruch” kamera nie animuje się, a kółko/pinch nie mają wygładzenia; na koniec uzupełniona tabela „po”. Na podglądzie: telefon z włączonym ograniczeniem ruchu – wejście w województwo i „Wróć” to natychmiastowy skok, bez jazdy.

## 2. Decyzje
`planCamera(…, reducedMotion: true)` daje czas 0 (B); sterownik przy czasie 0 robi jeden `jumpTo` i `onEnd`. Dodatkowo `map.scrollZoom`: przy reduced-motion krok zoomu = `wheelZoomDelta` bez interpolacji (`jumpTo`), `map.dragPan` bez inercji (`inertia: false` – opcje `dragPan({ linearity: 0, deceleration: 1e6 })`). Zmiana ustawienia w trakcie sesji (`matchMedia change`) jest uwzględniana.

## 3. Pliki
- Zmieniaj: `src/view/map/hooks/useCameraDriver.ts`, `src/view/map/hooks/useReducedMotion.ts` (nowy, ≤ 30 linii, `matchMedia` + `change`), `tests/unit/camera-reduced-motion.test.ts` (nowy), `tests/e2e/fix6-reduced-motion.spec.ts` (nowy), `docs/research/p-animacja-kamery-pomiar.md` (kolumna „po”)
- Wymagane (istnieją, nie ruszać): `src/core/map/camera-plan.ts`, `src/core/map/camera-driver.ts`, `tests/e2e/s16-motion.spec.ts`, `docs/research/p-animacja-kamery-pomiar.md` (z zadania I)
- Czytaj tylko: `useCameraDriver.ts` całość, `s16-motion.spec.ts` (wzór `page.emulateMedia({ reducedMotion: 'reduce' })`), `p-animacja-kamery-pomiar.md`.
- Nie czytaj: reszty. `AtlasMap.tsx` NIE jest w tym zadaniu.

## 4. Kroki
1. Testy najpierw: unit – `planCamera(..., reduced=true).durationMs === 0`; sterownik z planem 0: dokładnie jedno `jumpTo` = `to`, `onEnd` raz, `schedule` ≤ 1. e2e (`@FIX6G`, `emulateMedia reducedMotion: 'reduce'`): wejście w województwo → `camera.trace.length ≤ 2` i `animating` nigdy true po 100 ms; `viewState` = cel.
2. Kod: hook `useReducedMotion` i przekazanie flagi do `planCamera`.
3. Po zakończeniu zadań A–F uruchom `PERF=1 FIX6_GATE=1 pnpm exec playwright test tests/e2e/fix6-camera-metrics.spec.ts` (3 przebiegi, mediana) i wpisz kolumnę „po” + porównanie z progami do pliku pomiaru oraz do opisu PR (tabela przed/po).

## 5. Gotowe, gdy
- Testy zielone; tabela przed/po w `p-animacja-kamery-pomiar.md` i w PR; wynik względem progów (§5 research) opisany uczciwie (spełnione / niespełnione, które).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6G origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6G] `. Opis (po polsku, bez `Closes #`):
```
## Po ludzku
- Co zrobiłem: …
- Co sprawdzić na podglądzie Vercel (telefon): … (gdzie na stronie i co powinno być widać)
- Czego nie zrobiłem i dlaczego: …
## Liczby
przed → po (z testów/pomiaru) …
```
Dopisz: wzorce zrzutów (`*-snapshots/`) odświeża właściciel, jeśli zmienił się wygląd. Poczekaj na CI (shardy 1–4); znane flaki (library-only-fetched:103, library-search:99, picker-scroll:25, network-resilience:135) – zrób rerun, nie zmieniaj tych testów.

## 8. Zakazy
Nie edytuj `docs/STAN.md`, `package.json`, `pnpm-lock.yaml`, istniejących testów ani snapshotów. Bez nowych pakietów. Nie scalaj PR. Musisz zmienić plik spoza listy „Zmieniaj” → zatrzymaj się i opisz w PR dlaczego. Kolory/czasy/odstępy tylko z tokenów (`config/tokens.json`), pliki do ok. 200 linii, komentarze po polsku, nazwy po angielsku, kody TERYT jako string. Nie czytaj nic poza `AGENTS.md` i plikami/fragmentami wskazanymi w sekcji 3.

## 9. Zależności
Po scaleniu A–F i I: `ls tests/e2e/fix6-*.spec.ts | wc -l` ≥ 6 oraz `test -f docs/research/p-animacja-kamery-pomiar.md && echo OK`. Zadanie końcowe.
