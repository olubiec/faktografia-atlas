# QC404 – Ruch przy wejściu w głąb: miejscowość bez skoku, małe ruchy bez „instant”
Cel: Wybór miejscowości i niewielkie zmiany widoku jadą animowanym ruchem kamery zamiast skoku; zachowanie potwierdza nowy test e2e na stanie `window.__atlas`.
Zależy od: FIX6 (na main); **QC403** (ten sam `useMapViewState.ts` i `AtlasMap.tsx` – QC404 startuje po scaleniu QC403).
Kolizje plików: `useMapViewState.ts`, `AtlasMap.tsx` (QC403 – kolejność: QC403 → QC404); `useMapSelection.ts` czytaj, nie zmieniaj.
Zmieniaj: src/view/map/hooks/useMapViewState.ts, src/view/map/AtlasMap.tsx, tests/e2e/q-drill-motion.spec.ts (nowy)
Wymagane: tests/e2e/q-drill-motion.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-drill-motion.spec.ts tests/e2e/fix6-camera-driver.spec.ts tests/e2e/camera.spec.ts tests/e2e/drill.spec.ts tests/e2e/breadcrumbs.spec.ts tests/e2e/localities-map.spec.ts
Przeczytaj najpierw: docs/AUDYT-W4-20-11.md (wiersz QC404), src/view/map/hooks/useMapViewState.ts (`updateViewStateForBbox` ~275–315, efekt `measure` ~317–386, w tym gałąź `localityTargetRef`), src/view/map/AtlasMap.tsx (~linie 115–125, `onLocalitySelectView`), src/view/map/hooks/useMapSelection.ts (~95–120, zdarzenie `atlas:select-locality`), src/core/map/camera-plan.ts, src/core/map/camera-retarget.ts (`stackStep`), tests/e2e/fix6-camera-driver.spec.ts (wzór: `settled`, `searchVoivodeship`, odczyt `__atlas.camera.trace`), tests/e2e/localities-search.spec.ts, docs/PRODUKT.md §5a

## Zgoda na pliki ekranu
ZGODA WŁAŚCICIELA (decyzja z 20.11.2026): wolno zmienić `src/view/map/hooks/useMapViewState.ts` oraz `src/view/map/AtlasMap.tsx` – w `AtlasMap.tsx` **wyłącznie** callback `onLocalitySelectView` (miejscowość / `localityTargetRef`). Innych fragmentów `AtlasMap.tsx`, `Home.tsx` i `useMapSelection.ts` nie ruszaj.

## Kontekst (co audyt już rozstrzygnął)
FIX6 dostarczył planer (`planCamera`: czas 400–900 ms wg dystansu i Δzoomu) oraz napęd kamery; wejście w województwo/powiat i „Wróć” już animują się przez `updateViewStateForBbox` → `animateToView` – **nie przepisuj ich**, tylko dopisz test regresyjny. Zostają dwa błędy:
1. **Miejscowość skacze.** `onLocalitySelectView` w `AtlasMap.tsx` robi `localityTargetRef.current = targetView; setCurrentViewState(targetView)` (natychmiastowy `jumpTo`), a potem efekt `measure` w gałęzi `if (localityTargetRef.current)` znów ustawia widok przez `setCurrentViewState` i `driverRef.current?.cancel()`. Zoom 11,5 z zoomu ~5–8 ląduje więc bez ruchu.
2. **Próg 0,05 daje „instant” dla małych ruchów.** W `updateViewStateForBbox` (`Math.abs(newView.zoom - currentViewStateRef.current.zoom) < 0.05` → `kind = 'instant'`) każde wejście o zbliżonym zoomie (np. powiat sąsiadujący z poprzednim, albo środek w innym miejscu przy tym samym zoomie) jest skokiem, choć środek mapy może przesuwać się o setki km.

## Zadanie
1. **Miejscowość:** w `useMapViewState.ts` dodaj `flyToLocality(view: ViewState)` (zwróć z hooka): ustawia `localityTargetRef.current = view` (znacznik „nie dopasowuj do bbox”) i woła `animateToView(view, 'in')` bez wcześniejszego skoku; nie ustawia `userMovedRef` na `true` przed startem (animacja go zeruje). Gałąź `if (localityTargetRef.current)` w efekcie `measure` ma tylko zapisać `fittedBboxRef`/`fittedKeyRef` i wyzerować ref – **bez** `driverRef.cancel()`, `setCurrentViewState` i bez przerywania trwającej animacji (jeśli `isAnimatingRef.current`, zostaw ją). W `AtlasMap.tsx` callback `onLocalitySelectView` zamień na `(targetView) => flyToLocality(targetView)` (dodaj `flyToLocality` do destrukturyzacji hooka; uwaga: callback jest przekazany do `useMapSelection` przed destrukturyzacją – użyj istniejącego wzorca `updateViewStateForBbox`, który też jest zadeklarowany niżej).
2. **Próg 0,05:** w `updateViewStateForBbox` kategoria `instant` ma wynikać także z dystansu, nie tylko z Δzoomu: `instant` tylko gdy |Δzoom| < 0,05 **i** `planDuration(bieżący, nowy, szerokość, false)` jest bliski minimum, tzn. ruch jest praktycznie żaden. Najprościej: oblicz `planCamera(...)` raz i uznaj za `instant` tylko, gdy |Δzoom| < 0,05 oraz przesunięcie środka < 0,5 px (wylicz z `degPerPx = 360 / (512 · 2^zoom)`); w pozostałych przypadkach `kind = 'in'` (przy `Δzoom` ≥ 0 lub środku przesuniętym) i `animateToView` ruszy płynnie. Stałą progu nazwij (`SAME_VIEW_PX`), bez magicznych liczb. Zmiana układu panelu (gałąź `lastSideRef`) i resize pozostają `instant` jak dziś – nie ruszaj.
3. **Nie zmieniaj** istniejących testów FIX6 (`fix6-*.spec.ts`, `camera-*.test.ts`, `camera.spec.ts`, `drill.spec.ts`, `breadcrumbs.spec.ts`); jeśli któryś zaczyna być czerwony, opisz w PR i zatrzymaj się.

## Testy (najpierw) – `tests/e2e/q-drill-motion.spec.ts` (`@Q404`, `/?e2e`, stan przez `window.__atlas`, bez pikseli; wzór pomocników z `fix6-camera-driver.spec.ts`)
1. Wejście w województwo (wyszukiwarka „małopolskie”): `__atlas.camera.trace` ma ≥ 6 punktów, zoom niemalejący, końcowy `viewState.zoom` = ostatni punkt śladu (regresja – ruch już działa).
2. „Wróć”: po wejściu i kliknięciu „Wróć” ślad ma ≥ 4 punkty, a koniec = widok początkowy (zoom i środek z tolerancją 1e-6).
3. **Miejscowość:** wybór miejscowości z wyszukiwarki (wzór `localities-search.spec.ts`; ustal w specu, jak wybrać wynik typu miejscowość) → `camera.animating` bywa `true`, `trace` ma ≥ 6 punktów, ślad zoomu rośnie monotonicznie od startu do 11,5 (±1e-6) – a nie jeden skok (`trace.length === 2`).
4. **Mały ruch:** wejście w powiat o zoomie bliskim bieżącemu (np. przejście z powiatu do sąsiedniego przez okruszki/wyszukiwarkę, jeśli taki scenariusz da się zrobić na danych testowych) daje ślad o ≥ 3 punktach, a środek kamery zmienia się stopniowo; jeśli scenariusz nie jest wykonalny e2e, zamiast tego dodaj test jednostkowy czystej funkcji progu (wydzielonej do `src/core/map/camera-plan.ts` – wtedy dopisz plik i `tests/unit/camera-same-view.test.ts` do „Zmieniaj” i opisz w PR).
5. Wejście z linku `/?e2e&u=<teryt>` i zmiana rozmiaru okna (`page.setViewportSize`) nadal bez animacji (`trace.length <= 2`, `animating === false`).
6. `prefers-reduced-motion: reduce` (`page.emulateMedia`) → wybór miejscowości kończy się od razu (`trace.length <= 2`).

## Gotowe, gdy
- `q-drill-motion.spec.ts` zielony: województwo i „Wróć” animowane (1, 2), miejscowość jedzie ≥ 6 klatek zamiast skoku (3), mały ruch nie jest skokiem (4), link `?u=`/resize/reduced-motion bez animacji (5, 6).
- Wszystkie istniejące specy z linii „Weryfikacja” (FIX6, camera, drill, breadcrumbs, localities-map) zielone bez edycji.
- Diff w `AtlasMap.tsx` obejmuje wyłącznie callback `onLocalitySelectView` (i `flyToLocality` w destrukturyzacji).
Nie ruszaj: `Home.tsx`, `useMapSelection.ts`, `useCameraDriver.ts`, `src/core/map/camera-driver.ts`, pozostałych części `AtlasMap.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
