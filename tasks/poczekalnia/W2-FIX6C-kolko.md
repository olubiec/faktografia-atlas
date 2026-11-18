# W2-FIX6C – Płynne kółko
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
Przybliżanie kółkiem płynne i proporcjonalne (nie schodkowe), bez trzęsienia. Na podglądzie: kółko myszy/touchpad na mapie – zoom narasta ciągle, dojeżdża miękko; na telefonie bez zmian w gestach.

## 2. Decyzje
Natywny `scrollZoom` MapLibre zostaje (po H2 nie jest już zakłócany). Zmieniamy tylko jego tempo: `map.scrollZoom.setWheelZoomRate(1/450)` i `setZoomRate(1/100)` (wartości początkowe; dobierz w teście tak, by 3×`wheel(0,-100)` dało Δzoom ∈ [0,6; 1,5]). Dla `prefers-reduced-motion`: `map.scrollZoom` bez wygładzania nie jest dostępne w MapLibre → reduced = krok zoomu 0,5 na zdarzenie przez `jumpTo` (patrz G; tu tylko nie psuj).

## 3. Pliki
- Zmieniaj: `src/view/map/AtlasMap.tsx` (tylko efekt konfigurujący `scrollZoom` po `onLoad`), `src/core/map/camera-wheel.ts` (nowy: stałe i funkcja `wheelZoomDelta(deltaY, deltaMode)`), `tests/unit/camera-wheel.test.ts` (nowy), `tests/e2e/fix6-wheel.spec.ts` (nowy)
- Wymagane (istnieją, nie ruszać): `src/view/map/hooks/useMapViewState.ts`, `src/core/map/camera-driver.ts`, `tests/e2e/fix6-camera-driver.spec.ts`
- Czytaj tylko: `AtlasMap.tsx` linie 340–380 (`<Map …>` po H2), dokumentacja `ScrollZoomHandler` (`setWheelZoomRate`, `setZoomRate`) z `node_modules/maplibre-gl/dist/maplibre-gl.d.ts` (szukaj `setWheelZoomRate`).
- Nie czytaj: reszty.

## 4. Kroki
1. Testy najpierw: `camera-wheel.test.ts` – `wheelZoomDelta(-100, 0)` > 0, `(100,0)` < 0, symetryczne; `deltaMode` 1 (linie) daje ≈ 16× większy krok niż piksele; wartość dla jednego „kliknięcia” kółka (-100 px) ∈ [0,15; 0,5]; klamra ±0,6 na zdarzenie. `fix6-wheel.spec.ts` (`@FIX6C`): 3 zdarzenia kółka po 120 ms: Δzoom ∈ [0,4; 1,5], próbkowany zoom monotoniczny, brak kroku > 0,25 między kolejnymi próbkami rAF, po 1,5 s zoom nie zmienia się (dojazd skończony).
2. Kod: stałe w `camera-wheel.ts`; w `AtlasMap.tsx` efekt po `onLoad` wywołuje `setWheelZoomRate`/`setZoomRate` z tych stałych.

## 5. Gotowe, gdy
- Testy z kroku 1 zielone; `PERF=1` kółko ×3 (×4): p95 ≤ 33 ms, droppedShare < 10% (zapisz liczby w PR; jeśli SwiftShader nie daje, podaj faktyczne).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6C origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6C] `. Opis (po polsku, bez `Closes #`):
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
Po scaleniu H2: `grep -c "initialViewState" src/view/map/AtlasMap.tsx` ≥ 1. Rusza `AtlasMap.tsx` → po H2, przed D (kolejno).
