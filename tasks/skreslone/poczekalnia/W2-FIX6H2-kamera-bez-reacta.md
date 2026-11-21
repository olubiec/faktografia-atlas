# W2-FIX6H2 – Kamera bez setState na klatkę
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
Mapa przestaje być kontrolowana stanem Reacta; animacje „Wróć”, wejście w jednostkę, wyszukiwarka i zmiana układu idą przez sterownik z H1. Na podglądzie (telefon): wejście w województwo i „Wróć” płynne, bez szarpnięć; kółko i pinch działają natywnie bez trzęsienia.

## 3. Pliki
- Zmieniaj: `src/view/map/AtlasMap.tsx` (wymienione wprost w prompcie właściciela), `src/view/map/hooks/useMapViewState.ts`, `tests/e2e/fix6-camera-driver.spec.ts` (nowy), `tests/unit/map-view-state-shift.test.ts` (nowy, tylko jeśli dotyczy `shiftForLayout`)
- Wymagane (istnieją, nie ruszać): `src/view/map/hooks/useCameraDriver.ts`, `src/core/map/camera-driver.ts`, `src/core/map/camera-plan.ts`, `src/core/map/test-seam.ts`, `tests/e2e/camera.spec.ts`, `tests/e2e/map-zoom-out.spec.ts`
- Czytaj tylko: `AtlasMap.tsx` całość (444 linie; ważne: `<Map {...currentViewState} onMove=…>` ok. linie 353–377, `layersZoomBucket` 232–235, `getState` 249–268), `useMapViewState.ts` całość (427 linii), `camera-driver.ts` sygnatury.
- Nie czytaj: reszty.

## 2. Decyzje
- `<Map>` dostaje `initialViewState` i `ref` (`useRef<MapRef>`), nie `{...currentViewState}`; usuń `onMove` → `setCurrentViewState`.
- `currentViewStateRef` zostaje źródłem prawdy dla `window.__atlas.viewState` (seam), aktualizowany z `onFrame` i z `onMove` MapLibre (bez setState).
- Stan Reacta `currentViewState` zostaje tylko jako „widok spoczynkowy”: aktualizowany na `moveend` i gdy zmienia się koszyk warstw (`layersZoomBucket`), nie na klatkę; hook `useMapViewState` zachowuje publiczne API (`currentViewState`, `currentViewStateRef`, `setCurrentViewState`, `updateViewStateForBbox`, `markUserMoved`, `handleKeyDown`, `isAnimatingRef`), by `AtlasMap` i reszta nie zmieniły się poza `<Map>`.
- `kind` (in/out/instant) zostaje, ale czas i krzywa z `planCamera`; `cameraTransition` w `camera.ts` pozostaje (nieużywane tam, gdzie planer; nie usuwaj – zasada „nie usuwasz funkcji”).
- Klawisze `+ − strzałki` pozostają jak są (osobna zmiana później), ale przez `map.jumpTo`/`setCurrentViewState` tak jak dziś.

## 4. Kroki
1. Test najpierw `tests/e2e/fix6-camera-driver.spec.ts` (`@FIX6H2`, `?e2e`): (a) wejście w województwo (wyszukiwarka): `__atlas.camera.trace` ma ≥ 20 punktów, zoom monotoniczny, ostatni punkt = `viewState`; (b) „Wróć” kończy w widoku początkowym ± 1e-3 zoom; (c) w trakcie animacji kółko nie jest odrzucane: `wheel` w środku animacji → animacja przerwana (`camera.animating === false` w ≤ 100 ms) i zoom zmienia się; (d) w trakcie animacji (próbnik rAF z PF01) żadna klatka nie trwa > 100 ms przy dławieniu ×4 (tylko z `PERF=1`).
2. Kod: podłącz `useCameraDriver` w `useMapViewState`; `animateToView` buduje plan i woła `driver.start`; `markUserMoved` → `driver.cancel()`; resize w trakcie animacji → `driver.retarget`.
3. W `AtlasMap.tsx`: `mapRef`, `initialViewState`, `onMoveEnd` → `setCurrentViewState`, usuń odrzucanie zdarzeń kółka (`isAnimatingRef && !isDragging`). `layersZoom` liczone z `currentViewState` zaktualizowanego dodatkowo, gdy `onMove` przekracza próg 9 (jeden `setState` przy zmianie koszyka, nie na klatkę).
4. Nie dotykaj plików poza listą; jeśli istniejący test e2e przestaje przechodzić, nie zmieniaj go – opisz w PR i zatrzymaj się.

## 5. Gotowe, gdy
- Testy z kroku 1 zielone w CI; `camera.spec.ts` i `map-zoom-out.spec.ts` bez zmian i zielone.
- `grep -n "{...currentViewState}" src/view/map/AtlasMap.tsx` puste.
- Pomiar PF01 (`PERF=1`, ×4) „Wróć”: `max` ≤ 100 ms i p95 ≤ 33 ms (SwiftShader – jeśli niespełnione, podaj liczby w PR, nie ukrywaj).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6H2 origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6H2] `. Opis (po polsku, bez `Closes #`):
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
Po scaleniu H1 (i B): `test -f src/view/map/hooks/useCameraDriver.ts && test -f src/core/map/camera-plan.ts && echo OK`. Pierwsze z zadań ruszających `AtlasMap.tsx`/`useMapViewState.ts` – wszystkie następne (C, D, E, F) idą po nim, po kolei, nie równolegle.
