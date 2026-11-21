# PM02 – Kamera sterowana wprost na mapie (bez stanu Reacta w każdej klatce): matematyka kroku + hook
Cel: Gotowy, przetestowany sterownik animacji kamery, który w każdej klatce przestawia mapę MapLibre bezpośrednio (`jumpTo`), a stan Reacta aktualizuje tylko na końcu ruchu i co najwyżej raz na ok. 100 ms.
Zmieniaj: src/core/map/camera-step.ts, src/view/map/hooks/useImperativeCamera.ts, tests/unit/camera-step.test.ts, tests/unit/use-imperative-camera.test.tsx
Wymagane: tests/unit/camera-step.test.ts, tests/unit/use-imperative-camera.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/research/q-c401-ruch-mapy.md (pkt 2–4 rekomendacji R0), src/view/map/hooks/useMapViewState.ts (`animateToView`, `MAX_STEP`, `markUserMoved` – **tylko czytasz**; to wzorzec zachowania do odtworzenia), src/core/map/camera.ts (`cameraTransition`, `CameraKind`), src/core/map/ease.ts (`parseCubicBezier`), src/core/map/view.ts (`ViewState`), tests/unit/camera.test.ts, tests/unit/camera-layout-shift.test.ts, node_modules/react-map-gl (typ `MapRef`, metoda `jumpTo`)

## Kontekst
Dziś każda klatka animacji kamery to `setCurrentViewState` w `useMapViewState`, a ten stan żyje w `AtlasMap`, więc **całe drzewo ekranu** (panel wskaźnika, tooltipy, arkusz profilu…) renderuje się 60 razy na sekundę i przebudowuje listę warstw deck.gl (`viewStateForLayers` to nowy obiekt w każdej klatce). Na telefonie to główny podejrzany o brak płynności (raport QC401, pkt 2 i 4). Nowy sterownik jest **dodatkiem obok** starego: żaden istniejący plik nie jest zmieniany, nic jeszcze nie jest podłączone. Podłączenie to zadanie PM10 (fala 3, za zgodą D4).

## Research (15 min, bez nowych pakietów)
1. W `node_modules/react-map-gl` i `maplibre-gl` potwierdź sygnaturę `jumpTo({ center, zoom })` i że deck.gl `MapboxOverlay` (tryb interleaved) podąża za kamerą mapy bez udziału Reacta; zapisz ścieżki plików w opisie PR.
2. Zdecyduj, czy `jumpTo` w każdej klatce, czy `easeTo` z `essential: false` – QC401 (pkt 4) pokazał, że `easeTo` jest kasowane przez kontrolowany `viewState`. Ten hook ma `jumpTo` w klatce (sami liczymy krzywą), więc działa z obiema architekturami mapy.
3. **Nie dodawaj pakietów** (żadnych bibliotek animacji).

## Zadanie
1. `src/core/map/camera-step.ts` (czysty TS):
   - `export function stepProgress(prev: number, elapsedMs: number, durationMs: number, maxStep = 0.2): number` – `min(elapsed/duration, prev + maxStep)`, w [0,1]; `durationMs <= 0` → 1.
   - `export function lerpView(from: ViewState, to: ViewState, t: number): ViewState` – liniowo długość/szerokość/zoom (jak dziś w `animateToView`).
   - `export function retarget(current: ViewState, newTarget: ViewState): { from: ViewState; to: ViewState }` – ruch w toku dostaje nowy cel bez skoku (start = bieżący widok).
   - `export function zoomStepTarget(currentTarget: ViewState | null, current: ViewState, delta: number, min: number, max: number): ViewState` – cel kroku „+/−” liczony od **trwającego celu** (jeśli jest), a nie od bieżącej klatki; zoom przycięty do [min, max].
2. `src/view/map/hooks/useImperativeCamera.ts`:
   - `export type CameraMap = { jumpTo(o: { center: [number, number]; zoom: number }): void }`.
   - `export function useImperativeCamera(getMap: () => CameraMap | null, opts: { onSettled: (v: ViewState) => void; onProgress?: (v: ViewState) => void; progressEveryMs?: number; reducedMotion?: () => boolean })` → `{ animateTo(target: ViewState, kind: CameraKind, from?: ViewState): void; stop(): void; isAnimating(): boolean; current(): ViewState | null }`.
   - W klatce: `stepProgress` → `lerpView` z krzywą z `cameraTransition(...)` → `getMap()?.jumpTo(...)`; **bez** `setState`. `onProgress` wołane najwyżej co `progressEveryMs` (domyślnie 100); `onSettled` raz na końcu. `stop()` (gest użytkownika) zatrzymuje ruch bez wołania `onSettled` z celem. Przy `reducedMotion()` lub czasie 0: jeden `jumpTo` na cel i `onSettled`. `animateTo` w trakcie ruchu używa `retarget`. Sprzątanie `requestAnimationFrame` przy odmontowaniu.

## Testy
`camera-step.test.ts`:
1. `stepProgress`: elapsed 300 z duration 600 → 0,5; po zacięciu (elapsed 1000, prev 0,1) → 0,3 (nie skacze do 1); duration 0 → 1.
2. `lerpView` dla t=0, 0,5, 1 daje start, środek, cel.
3. `retarget`: `from` równe bieżącemu widokowi, `to` równe nowemu celowi.
4. `zoomStepTarget`: trzy szybkie kroki +0,5 od trwającego celu dają +1,5 (nie +0,5 trzy razy od bieżącego zoomu); przycięcie do `max`.
`use-imperative-camera.test.tsx` (sztuczne `requestAnimationFrame` i sztuczna mapa z `jumpTo` jako `vi.fn`):
5. W trakcie ruchu `jumpTo` jest wołane w każdej klatce, a `onProgress` co najwyżej co 100 ms (np. 600 ms ruchu → ≤ 7 wywołań), `onSettled` dokładnie raz z celem.
6. `stop()` w środku ruchu: kolejne klatki nie wołają `jumpTo`; `onSettled` nie jest wołane z celem.
7. `animateTo` w trakcie ruchu zmienia cel bez skoku (pierwszy `jumpTo` po zmianie jest bliski ostatniemu sprzed zmiany).
8. `reducedMotion() === true` → dokładnie jedno `jumpTo` na cel i `onSettled` natychmiast.
9. Odmontowanie komponentu anuluje zaplanowaną klatkę (brak `jumpTo` po odmontowaniu).
10. `getMap()` zwracające `null` (mapa jeszcze nie gotowa) nie rzuca wyjątku.

## Gotowe, gdy
- 10 testów zielonych; pliki ≤ 120 linii każdy; `useMapViewState.ts`, `AtlasMap.tsx` i istniejące testy bez zmian.
Nie ruszaj: `src/view/map/AtlasMap.tsx`, `src/view/map/hooks/useMapViewState.ts`, `src/core/map/camera.ts`, `ease.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
