# PM10 – [CZEKA NA ZGODĘ D4] Podłączenie kamery bez stanu Reacta w klatce (płynny zoom i dojazd na telefonie)
Cel: Ruch kamery (dojazd do jednostki, „Wróć”, kółko, pinch) nie renderuje całego ekranu w każdej klatce; kółko i palce działają także w trakcie animacji (zastępuje QC402).
STATUS: **Nie puszczać bez zgody właściciela (decyzja D4 w docs/PLAN-POPRAWEK.md).** Prompt wprost wymienia pliki ekranu `AtlasMap.tsx` i `useMapViewState.ts`. W fali 3 jest jedynym zadaniem na tych plikach. **Zadanie QC402 nie jest puszczane** (jego treść – naprawa `onMove` i test kółka – wchodzi tutaj).
Zmieniaj: src/view/map/AtlasMap.tsx, src/view/map/hooks/useMapViewState.ts, tests/e2e/p-camera-smooth.spec.ts
Wymagane: tests/e2e/p-camera-smooth.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/camera.spec.ts tests/e2e/map-zoom-out.spec.ts tests/e2e/drill.spec.ts tests/e2e/responsive-resize.spec.ts tests/e2e/s16-motion.spec.ts tests/e2e/p-camera-smooth.spec.ts
Przeczytaj najpierw: docs/research/q-c401-ruch-mapy.md (pkt 2–4 i R0 wariant A), docs/research/p-kamera-pomiar-telefon.md (PF01: liczby **przed**), src/view/map/hooks/useImperativeCamera.ts i src/core/map/camera-step.ts (PM02 – gotowy sterownik), src/core/map/frame-stats.ts, src/view/map/hooks/useMapViewState.ts (całość; zmiany FIX3/FIX4 w zoomie), src/view/map/AtlasMap.tsx (`<Map … {...currentViewState} onMove=…>`, `viewStateForLayers`, `getState`), tests/unit/camera-layout-shift.test.ts (importuje `shiftForLayout` – **eksport musi zostać**), tests/e2e/camera.spec.ts, tests/e2e/map-zoom-out.spec.ts, tests/e2e/responsive-resize.spec.ts, AGENTS.md (błąd powtarzalny o drugim stanie widoku)

## Kontekst
Na telefonie zoom i dojazd kamery są nadal niepłynne mimo poprawek FIX3/FIX4. Przyczyny z raportu QC401 (potwierdzone w kodzie): każda klatka animacji to `setCurrentViewState` → re-render `AtlasMap` i całego drzewa + nowy `viewStateForLayers` → przebudowa listy warstw deck.gl; `onMove` odrzuca kółko i klawisze w trakcie animacji (`if (isAnimatingRef.current && !isDragging) return;`); kontrolowany `viewState` mapy nadpisuje kamerę MapLibre. PM02 dostarczył sterownik `useImperativeCamera` (przestawia mapę wprost, `jumpTo`), tu go podłączamy.

## Research (20 min, bez nowych pakietów)
1. Przed zmianą uruchom `PERF=1 pnpm exec playwright test tests/e2e/perf-camera-frames.spec.ts` i zapisz liczby „przed” (do opisu PR).
2. Znajdź w `AtlasMap.tsx`, jak dostać się do instancji mapy (`useMap`, `ref` na `Map` z react-map-gl 8); `DeckGLOverlay` (interleaved) podąża za kamerą samo.
3. Wypisz wszystkich czytelników `currentViewState`/`currentViewStateRef`/`isAnimatingRef` (Grep) – które potrzebują wartości w każdej klatce, a które wystarczy co ~100 ms (np. próg `shouldShowLocalitiesLayer`, ładowanie miejscowości przy zoomie ≥ 8,5, szew testowy).
4. Zasada z AGENTS.md: **nie tworzysz drugiego stanu widoku** – `useMapSelection`/`useMainView` zostają źródłem prawdy dla wskaźnika, roku i jednostki.

## Zadanie
1. `useMapViewState.ts`: animację (`animateToView`, `updateViewStateForBbox`, `measure`) wykonuje `useImperativeCamera` (PM02). W klatce zapisywany jest tylko `currentViewStateRef` (i szew `syncCameraSeam`, aby `__atlas.camera.trace` i `__atlas.viewState` nadal pokazywały każdą klatkę); stan Reacta (`currentViewState`) aktualizowany na końcu ruchu i co najwyżej co 100 ms w trakcie. Zachowaj wszystkie eksporty (`shiftForLayout`, `getCameraState`, `CameraSeamState`), zwracany kształt obiektu i zachowanie: czasy z tokenów (`cameraTransition`), tryb `instant` przy samej zmianie układu, brak animacji przy `prefers-reduced-motion`, korekta `shiftForLayout`.
2. `AtlasMap.tsx`: mapa przestaje być kontrolowana wartością z każdej klatki (np. `initialViewState` + sterowanie przez sterownik), `onMove` **zawsze** przepuszcza ruch z `originalEvent` (kółko, pinch, przeciąganie, klawisze): przerywa trwającą animację (`stop()`) i przejmuje kamerę – usuń warunek `isAnimatingRef && !isDragging`. `viewStateForLayers` zależy tylko od progu `localitiesZoomThreshold` (stabilna referencja między klatkami), więc warstwy nie są przebudowywane w czasie ruchu.
3. Ładowanie miejscowości (`loadLocalities` przy zoomie ≥ 8,5) nie startuje w trakcie klatek animacji – po zakończeniu ruchu (`onSettled`).
4. Plik `AtlasMap.tsx` ma dziś 444 linie: nie powiększaj go; wyniesienie fragmentów do nowych plików wolno, jeśli wpiszesz je w opisie PR (odstępstwo od „Zmieniaj” – tylko za wcześniejszym wpisem w PR i zatrzymaniem na odpowiedź, jeśli będzie sprzeczność z AGENTS.md).

## Testy (`tests/e2e/p-camera-smooth.spec.ts`, nazwy z `@P2`)
1. Dojazd do województwa (wyszukiwarka): `__atlas.camera.trace` ma ≥ 10 różnych widoków, a ruch trwa 400–900 ms (czas w tokenie ±150).
2. Kółko ×3 w trakcie dojazdu: `zoom` w `__atlas.viewState` po ruchu **różni się** od celu dojazdu (użytkownik przejął kamerę) i jest monotonicznie rosnący w próbkach (to dawny test z QC402).
3. Pinch (CDP, dwa palce) w trakcie dojazdu przejmuje kamerę tak samo.
4. „Wróć”: ruch odwrotny trwa krócej niż dojazd (≈ 400 ms).
5. Dławienie CPU ×4 (CDP): `summarizeFrames` z PF01 dla dojazdu daje `p95` i `droppedShare` **lepsze niż liczby „przed” z raportu PF01 o co najmniej 30%** (próg do potwierdzenia przez właściciela; jeśli pomiar w CI jest niestabilny, test tylko drukuje wynik, a próg sprawdza się ręcznie – opisz w PR).
6. `prefers-reduced-motion`: dojazd, „Wróć” i zoom kończą się w 1 klatce (`trace.length` ≤ 2).
7. Zmiana rozmiaru okna i otwarcie profilu nie powodują skoku (istniejące `responsive-resize`, `camera-layout-shift` zielone).
8. Wszystkie istniejące testy z linii „Weryfikacja” zielone bez zmian.

## Gotowe, gdy
- Testy 1–8 zielone; w opisie PR tabela „przed/po” z PF01 (te same scenariusze, ta sama maszyna) i filmik/opis, co sprawdzić na telefonie: klik w województwo, „Wróć”, zoom dwoma palcami, kółko.
- `AtlasMap.tsx` nie urósł; brak nowych pakietów; brak drugiego stanu widoku.
Nie ruszaj: `src/core/map/camera.ts`, `test-seam.ts` (QC303), `useChoropleth.ts`, `ProfilePortal.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
