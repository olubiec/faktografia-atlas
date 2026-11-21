# W2-FIX6D – Pinch i przerwanie animacji dotykiem
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
Pinch (dwa palce) i dotknięcie przerywają trwającą animację kamery natychmiast i bez szarpnięcia; pinch płynny. Na podglądzie (telefon): wejdź w województwo i w trakcie jazdy kamery złap mapę palcem – kamera staje, mapa idzie za palcem.

## 2. Decyzje
Gesty natywne MapLibre; sterownik słucha zdarzeń `movestart`/`mousedown`/`touchstart`/`wheel` z `originalEvent` i woła `cancel()`. Jedna ścieżka (pinch i drag), bez osobnego toru kodu. `touchZoomRotate` z `disableRotation()` (mapa nie obraca się) – sprawdź, czy już jest; jeśli nie, dodaj.

## 3. Pliki
- Zmieniaj: `src/view/map/AtlasMap.tsx` (tylko podpięcie `onMoveStart`/`touchZoomRotate`), `src/view/map/hooks/useMapViewState.ts` (tylko `markUserMoved`/anulowanie), `tests/e2e/fix6-touch-interrupt.spec.ts` (nowy)
- Wymagane (istnieją, nie ruszać): `src/core/map/camera-driver.ts`, `src/view/map/hooks/useCameraDriver.ts`, `tests/e2e/fix6-wheel.spec.ts`, `tests/e2e/perf-camera-frames.spec.ts`
- Czytaj tylko: `AtlasMap.tsx` linie 340–380, `useMapViewState.ts` funkcja `markUserMoved` (ok. linia 150), helper `pinch` z `perf-camera-frames.spec.ts` (skopiuj do własnego testu).
- Nie czytaj: reszty.

## 4. Kroki
1. Test najpierw `fix6-touch-interrupt.spec.ts` (`@FIX6D`, widok 390×844, `hasTouch`): (a) start animacji (`?e2e`, wyszukiwarka → województwo), po 150 ms `Input.dispatchTouchEvent` touchStart/touchMove → `__atlas.camera.animating === false` w ≤ 100 ms; (b) po przerwaniu zoom i środek nie cofają się do celu (po 1 s `viewState` ≠ cel animacji); (c) pinch od d=20 do d=100 → zoom rośnie ≥ 0,5 i jest monotoniczny; (d) brak skoku zoomu > 0,25 między klatkami rAF.
2. Kod jak w sekcji 2; nie dodawaj setState na klatkę.

## 5. Gotowe, gdy
- Testy (a)–(d) zielone w CI; `PERF=1` pinch (×4): p95 ≤ 33 ms, max ≤ 100 ms (liczby w PR).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6D origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6D] `. Opis (po polsku, bez `Closes #`):
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
Po scaleniu C: `test -f src/core/map/camera-wheel.ts && echo OK`. Rusza `AtlasMap.tsx` i `useMapViewState.ts` → po C, przed E.
