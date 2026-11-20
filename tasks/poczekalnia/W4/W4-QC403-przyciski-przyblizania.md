# QC403 – Przyciski „+ / −” na mapie (przybliżenie o 1 poziom, animowane)
Cel: Na mapie są widoczne przyciski „Przybliż” i „Oddal”, które zmieniają zoom o 1 poziom płynnie (napędem kamery), mają ≥ 44 px i nie zasłaniają się z arkuszem na telefonie.
Zależy od: FIX6 (planer `camera-plan.ts` i napęd `camera-driver.ts` są na main). Nie zależy od PM10/PM02 (nie weszły na main; `useImperativeCamera` i `zoomStepTarget` NIE istnieją – nie używaj ich).
Kolizje plików: `useMapViewState.ts` i `AtlasMap.tsx` rrusza też QC404 → najpierw QC403, potem QC404 (QC404 startuje od main po scaleniu QC403).
Zmieniaj: src/view/map/ZoomButtons.tsx (nowy), src/view/map/hooks/useMapViewState.ts, src/view/map/AtlasMap.tsx, tests/unit/zoom-buttons.test.tsx (nowy), tests/unit/zoom-by.test.ts (nowy)
Wymagane: tests/unit/zoom-buttons.test.tsx, tests/unit/zoom-by.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/AUDYT-W4-20-11.md (wiersz QC403), src/view/map/hooks/useMapViewState.ts (`animateToView`, `handleKeyDown` ~linie 396–416, `limits`), src/core/map/camera-plan.ts (`planCamera`, `planDuration`), src/core/map/camera-driver.ts, src/view/map/hooks/useCameraDriver.ts, src/view/map/sheetInset.ts (`useSheetInset`), src/view/map/BackButton.tsx (styl przycisku na mapie), src/view/ui/Icon.tsx, docs/STYL.md, tests/unit/camera-plan.test.ts (wzór testu planera – nie zmieniaj)

## Zgoda na pliki ekranu
ZGODA WŁAŚCICIELA (decyzja z 20.11.2026): wolno dopisać w `src/view/map/hooks/useMapViewState.ts` **wąsko** tylko funkcję `zoomBy` (i jej zwrot z hooka) oraz zamienić w `handleKeyDown` skok klawiszy `+`/`=`/`-` na wywołanie tej samej drogi; w `src/view/map/AtlasMap.tsx` wolno dodać **jedną linię** `<ZoomButtons … />` (plus ewentualny `zoomBy` w destrukturyzacji hooka). Innych zmian w tych plikach nie rób; `Home.tsx`, `ProfileSheet*.tsx`, pozostałych `map/hooks/*` nie ruszaj.

## Kontekst
- Dziś klawisze `+`/`-` (`handleKeyDown`) robią `setCurrentViewState` ze zoom ±0,5 = skok bez animacji; przycisków nie ma. Audyt: `ZoomButtons`, `zoomStepTarget`, `useImperativeCamera` nie istnieją.
- Kamera jest niekontrolowana: `animateToView(target, kind, fromOverride?)` w `useMapViewState.ts` planuje przez `planCamera` (reduced-motion/`instant` → czas 0) i uruchamia napęd `driverRef.current.start(plan)`; stan widoku jest w `currentViewStateRef`, a w trybie `?e2e` ślad ruchu trafia do `window.__atlas.camera.trace` (`syncCameraSeam`).
- Decyzja: krok przycisków = **1 poziom**, klawisze `+`/`-` zostają przy **0,5**, ale mają jechać tą samą animowaną drogą.
- Mobile: kontener mapy (`containerRef` w `AtlasMap.tsx`, `relative overflow-hidden`) kończy się nad `MobileIndicatorBar`; dolny arkusz profilu jest dialogiem nałożonym na mapę, a jego widoczną wysokość (do 45% okna) publikuje `setSheetInset` (czyta ją `useSheetInset()`). Przyciski zoomu stoją w prawym dolnym rogu kontenera i muszą być przesunięte o `sheetInset` w górę, żeby arkusz ich nie zakrywał. Lewy górny róg zajmują okruszki i „Wróć” – nie ruszaj ich.
- Mapa nie ma `NavigationControl` MapLibre (grep: brak w `src/`), więc nic nie wyłączamy.

## Zadanie
1. `src/view/map/hooks/useMapViewState.ts`: dodaj `zoomBy(delta: number)`:
   - cel = bieżący widok (`currentViewStateRef.current`) z `zoom` ograniczonym do `[limits.minZoom, limits.maxZoom]` (środek bez zmian);
   - jeśli cel = bieżący zoom (granica) – nic nie rób;
   - w przeciwnym razie `markUserMoved()` (przerywa trwający ruch, jak gest) i `animateToView(cel, delta > 0 ? 'in' : 'out')`. Ruch idzie przez `planCamera` (czas z planera, nie wymyślony; reduced-motion → natychmiast, bo `animateToView` to obsługuje).
   - Uwaga: `animateToView` czyta bieżący widok z refa, więc kolejne kliknięcia w trakcie ruchu startują od aktualnej klatki (nie od starego celu).
   - Zwróć `zoomBy` z hooka.
2. W `handleKeyDown` klawisze `+`/`=`/`-` wołają `zoomBy(±0.5)` zamiast `move(...)` ze skokiem; strzałki bez zmian. Zachowaj `e.preventDefault()`.
3. `src/view/map/ZoomButtons.tsx` (≤ 80 linii): props `{ onZoom: (delta: 1 | -1) => void; canZoomIn?: boolean; canZoomOut?: boolean }`. Grupa `role="group"` `aria-label="Powiększenie mapy"` z dwoma `<button type="button">`: „Przybliż” (`aria-label`, `title`, ikona `Plus` z iconoir-react przez `Icon`) i „Oddal” (ikona `Minus`). `min-h-[44px] min-w-[44px]`, klasy jak `BackButton` (`border border-linia bg-arkusz text-tusz rounded-none focus-visible:ring-1 focus-visible:ring-tusz`), `disabled:opacity-50`. Położenie: `absolute right-4 z-10 mb-4 flex flex-col`, a `bottom` ustawione stylem inline na `sheetInset` z `useSheetInset()` (wartość dynamiczna, nie sztywny kolor/rozmiar). Przyciski nie mogą przechwytywać gestów mapy: `onMouseDown`/`onTouchStart` na kontenerze mapy wołają `markUserMoved` – to jest zamierzone (klik też przerywa ruch), więc nic dodatkowo nie blokuj, ale dodaj `onClick={(e) => e.stopPropagation()}` na grupie, by `handleContainerClick` nie traktował kliknięcia jak kliknięcia w tło mapy.
4. `AtlasMap.tsx`: dodaj `zoomBy` do destrukturyzacji `useMapViewState(...)` i **jedną linię** w kontenerze mapy, obok `<Map>`: `<ZoomButtons onZoom={zoomBy} canZoomIn={currentViewState.zoom < limits.maxZoom} canZoomOut={currentViewState.zoom > limits.minZoom} />`.

## Testy (najpierw)
`tests/unit/zoom-buttons.test.tsx` (React Testing Library):
1. Klik „Przybliż” woła `onZoom(1)`, „Oddal” → `onZoom(-1)`.
2. `canZoomIn={false}` → przycisk `disabled` i klik nic nie woła; analogicznie `canZoomOut={false}`.
3. Oba przyciski mają nazwę dostępną (`getByRole('button', { name: 'Przybliż' })`) i klasy `min-h-[44px] min-w-[44px]`.
4. `getByRole('group', { name: 'Powiększenie mapy' })` istnieje.
5. Z `setSheetInset(200)` grupa ma `style.bottom === '200px'`; po `setSheetInset(0)` – `0px` (przyciski nad arkuszem).
6. Klawisze Enter/Spacja na przycisku wołają `onZoom` (userEvent.keyboard).

`tests/unit/zoom-by.test.ts` (renderHook `useMapViewState` z atrapą `mapRef`/stałymi wymiarami albo, jeśli zbyt kosztowne, test przez czysty cel wydzielony do `src/core/map/…` – wtedy dopisz ten plik do „Zmieniaj” i opisz w PR):
7. `zoomBy(1)` przy zoomie 6 uruchamia animację (`isAnimatingRef.current === true`, plan o `to.zoom === 7`, `durationMs > 0`), a po zakończeniu `currentViewStateRef.current.zoom === 7`.
8. `zoomBy(1)` przy `limits.maxZoom` i `zoomBy(-1)` przy `limits.minZoom` – brak zmiany i brak animacji; cel jest obcięty do granicy (np. z 0,5 poniżej max → max).
9. Przy `prefers-reduced-motion` (mock `matchMedia`) `zoomBy` ustawia zoom od razu (czas 0, bez animacji).
10. Klawisz `+` w `handleKeyDown` daje cel `zoom + 0.5` animowany (a nie natychmiastowy skok) i wywołuje `preventDefault`.
Opcjonalnie e2e **w nowym pliku** `tests/e2e/q-zoom-buttons.spec.ts` (`@Q403`): klik „Przybliż” → `__atlas.camera.trace` ma ≥ 4 różne zoomy, a końcowy `viewState.zoom` = start + 1 (dopisz do „Zmieniaj”, jeśli robisz).

## Gotowe, gdy
- `zoom-buttons.test.tsx` (1–6) zielony: kierunek, `disabled` na granicach, ≥ 44 px, nazwa grupy, przesunięcie o `sheetInset`, klawiatura.
- `zoom-by.test.ts` (7–10) zielony: animowany krok ±1, obcięcie do `limits`, reduced-motion = natychmiast, klawisze `+`/`-` (0,5) animowane.
- W `AtlasMap.tsx` różnica to dokładnie jedna linia JSX plus `zoomBy` w destrukturyzacji; istniejące testy (m.in. `camera*.test.ts`, `tests/e2e/fix6-*.spec.ts`) nieruszone i zielone.
Nie ruszaj: `Home.tsx`, `ProfileSheet*.tsx`, innych `src/view/map/hooks/*`, `src/core/map/camera-*.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
