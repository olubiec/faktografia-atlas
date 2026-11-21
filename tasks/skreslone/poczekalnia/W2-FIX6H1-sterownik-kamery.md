# W2-FIX6H1 – Imperatywny sterownik kamery (niepodłączony)
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
Imperatywny sterownik kamery (jeden rAF, `map.jumpTo`, zero Reacta), jeszcze niepodłączony do ekranu. Na podglądzie: nic.

## 2. Decyzje
Zgodnie z `docs/research/p-animacja-kamery.md` §4 pkt 1, 5, 6, 7. Sterownik przyjmuje „mapę” przez minimalny interfejs (łatwy do sfałszowania w teście), nie importuje `maplibre-gl`.

## 3. Pliki
- Zmieniaj: `src/view/map/hooks/useCameraDriver.ts` (nowy), `src/core/map/camera-driver.ts` (nowy, czysta logika pętli), `tests/unit/camera-driver.test.ts` (nowy)
- Wymagane (istnieją, nie ruszać): `src/core/map/camera-plan.ts` (z zadania B), `src/view/map/hooks/useMapViewState.ts`, `src/view/map/AtlasMap.tsx`
- Czytaj tylko: `camera-plan.ts` (eksporty `planCamera`, `sampleCamera`, `CameraPlan`), `useMapViewState.ts` linie 150–215 (`animateToView`, dla zachowania semantyki `kind` i `syncCameraSeam`).
- Nie czytaj: reszty. Nie zmieniaj `AtlasMap.tsx` ani `useMapViewState.ts` (to H2).

## 4. Kroki
1. Test najpierw (`camera-driver.test.ts`, fałszywy zegar `{ now, schedule(cb) }` i fałszywa mapa `{ jumpTo(view), getView() }`):
   - `start(plan)` 60 klatek co 16,7 ms → `jumpTo` wywołane ≥ 50 razy; ostatnie wywołanie dokładnie `plan.to`; po końcu `isAnimating() === false` i brak kolejnych klatek (`schedule` niewywołane).
   - Zacięcie: jedna klatka po 300 ms (plan 600 ms) → pozycja = `sampleCamera(plan, 300+…)` (brak limitu kroku, brak skoku powyżej krzywej).
   - `cancel()` w środku: `jumpTo` już nie wywoływane, `isAnimating()` false, `getCurrent()` = ostatni wysłany widok.
   - `retarget(newTo)` w środku: pierwszy `jumpTo` po retarget różni się od poprzedniego o ≤ 0,25 zoomu i ≤ 8% szerokości widoku (brak skoku); kończy na `newTo`.
   - `onFrame` wołany co klatkę; `onEnd` raz.
   - Liczba wywołań `React.setState`: sterownik nie dostaje żadnego settera (test sprawdza sygnaturę: opcje to tylko `map`, `clock`, `onFrame`, `onEnd`).
2. Kod: `camera-driver.ts` – klasa/fabryka `createCameraDriver({ map, clock, onFrame, onEnd })` z `start`, `cancel`, `retarget`, `isAnimating`, `getCurrent`. `retarget` = nowy plan od bieżącego widoku z czasem `planCamera(current, newTo)` skróconym do ≥ 200 ms, easing startuje od prędkości 0 tylko gdy poprzednia animacja się skończyła; w locie użyj `easeOutCubic`-owego startu (łagodne przejęcie) – opisz wybór w komentarzu.
3. `useCameraDriver.ts` (≤ 60 linii): hook trzymający driver w `useRef`, tworzony z `mapRef.current` i `requestAnimationFrame`/`performance.now`; sprzątanie `cancel()` przy odmontowaniu.

## 5. Gotowe, gdy
- Wszystkie asercje kroku 1 zielone; pliki ≤ 200 linii; w `src/view/map/hooks/useCameraDriver.ts` brak `useState`/`setState` (`grep -n "useState" …` puste).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6H1 origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6H1] `. Opis (po polsku, bez `Closes #`):
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
Po scaleniu B: `test -f src/core/map/camera-plan.ts && echo OK`. Niezależne od A, I.
