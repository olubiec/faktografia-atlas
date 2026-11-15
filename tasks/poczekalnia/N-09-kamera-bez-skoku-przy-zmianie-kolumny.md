# N-09 – Kamera bez skoku, gdy kolumna profilu pojawia się lub znika w trakcie animacji
Cel: Naprawić przyczynę niestabilnego `camera.spec.ts` (pada 2–3 z 6 także na czystym main). Animacja przybliżenia/oddalenia ma dobiec do końca płynnie, nawet gdy w jej trakcie zmienia się szerokość mapy.
Zmieniaj: src/view/map/hooks/useMapViewState.ts, src/core/map/camera-resize.ts, tests/unit/camera-resize.test.ts, tests/e2e/camera-resize-retarget.spec.ts
Wymagane: src/core/map/camera-resize.ts, tests/unit/camera-resize.test.ts, tests/e2e/camera-resize-retarget.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/camera-resize-retarget.spec.ts tests/e2e/camera.spec.ts --repeat-each=3
Przeczytaj najpierw: src/view/map/hooks/useMapViewState.ts (funkcje `animateToView` i `measure` w efekcie z ResizeObserver), src/view/map/AtlasMap.tsx (kolumna `data-slot="side"` z klasą `empty:hidden md:w-[440px]`), src/core/map/camera.ts, tests/e2e/camera.spec.ts

Diagnoza (planista, 2026-11-15, lokalny przebieg: padły test 1 „>= 3 intermediate values” – 0 wartości – i test 4 „Wróć” – ślad ma 3 punkty):
- Na komputerze profil wpada do kolumny `[data-slot="side"]` (440 px), która jest `empty:hidden`. Gdy profil się otwiera (po pobraniu pliku profili, czyli w trakcie animacji) albo zamyka („Wróć”), szerokość kontenera mapy zmienia się o 440 px.
- ResizeObserver woła `measure(true)`. Klucz (bbox + inset) się nie zmienił, więc wpada gałąź `isResizeEvent && !userMovedRef.current` → `animateToView(targetView, 'instant')`, które anuluje trwającą animację i skacze do celu. Ślad kamery: [start, 1 klatka, cel] – stąd 3 punkty i brak wartości pośrednich.

Zadanie:
1. `src/core/map/camera-resize.ts`: czysta funkcja `resizeCameraAction(input)` z polami `{ hasLocalityTarget, fittedKey, nextKey, isResize, animating, userMoved }`, zwraca jedną z: `'locality' | 'init' | 'animate' | 'retarget' | 'instant' | 'none'`. Odwzoruj obecne gałęzie `measure` 1:1, z jedną zmianą: zmiana rozmiaru w trakcie animacji (`isResize && animating && klucz bez zmian`) daje `'retarget'` zamiast `'instant'`. Komentarze po polsku.
2. `useMapViewState.ts`: `measure` korzysta z `resizeCameraAction`. Dla `'retarget'`: trwająca animacja NIE jest anulowana; przelicz nowy cel (`viewStateWithInset` dla nowych wymiarów) i podmień go w biegnącej animacji (np. `animTargetRef`, czytany w każdej klatce zamiast stałego `targetView`). Czas i krzywa bez zmian. Pozostałe gałęzie zachowują się dokładnie jak dziś (rozmiar okna bez animacji → `'instant'`).
3. `tests/unit/camera-resize.test.ts`: każda z 6 odpowiedzi ma co najmniej jeden przypadek; osobno: resize w trakcie animacji = `'retarget'`, resize bez animacji = `'instant'`, resize po ruchu użytkownika = `'none'`.
4. `tests/e2e/camera-resize-retarget.spec.ts` (nazwy z `@S16`, okno 1440×900): (a) `/?u=12&e2e`, klik „Wróć”, czekaj najpierw na `__atlas.camera.animating === true`, potem `=== false`; ślad ma ≥ 5 punktów, zoom w śladzie nie rośnie, a żaden pojedynczy krok nie przekracza 60% całej zmiany zoomu (brak skoku). (b) `/?e2e`, wyszukiwarka → „małopolskie” → Enter, czekaj na animating true → false; co najmniej 3 wartości pośrednie zoomu (ta sama definicja co w camera.spec.ts).

Gotowe, gdy:
- Testy jednostkowe zielone.
- Nowy spec i istniejący `camera.spec.ts` przechodzą 3 razy z rzędu (`--repeat-each=3`), bez zmian w camera.spec.ts.
- Jeśli test 1 z camera.spec.ts nadal czasem pada (możliwy wyścig: test czeka na `animating === false`, zanim animacja wystartuje) – nie zmieniaj testu; w PR podaj zmierzony ślad (`__atlas.camera.trace`) i ile razy padł na 9 prób.
- keyboard-zoom.spec.ts, map-zoom-out.spec.ts, responsive-resize.spec.ts, reduced-motion.spec.ts zielone bez zmian.

Nie rób: zmian w AtlasMap.tsx, camera.ts, tokenach czasu ani w istniejących testach; bez `waitForTimeout` > 500 ms w nowym specu; bez wydłużania czasów animacji, żeby test „złapał” klatki.
