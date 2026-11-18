# FIX6 – Animacja kamery mapy: research, diagnoza artefaktów, plan

Stan: 18.11.2026, `origin/main` = c764788 (po FIX4 #485). Ten dokument nie zmienia kodu strony. Zadania wykonawcze: `tasks/poczekalnia/W2-FIX6*.md`, kolejność: `tasks/poczekalnia/FIX6-KOLEJNOSC.md`.

## 1. Objawy (telefon, zoom do powiatów/gmin) i przyczyny w kodzie
| Objaw | Przyczyna (miejsce w kodzie) |
|---|---|
| Przybliżanie „kwadratowe”, trzęsie | `AtlasMap.tsx` ~356: `<Map {...currentViewState} onMove=…>` to tryb kontrolowany. Każdy `onMove` → `setCurrentViewState` → render całego ekranu → react-map-gl nadpisuje kamerę MapLibre (`jumpTo`). Wygładzenie kółka/pinch w MapLibre jest więc na każdej klatce przerywane przez opóźniony stan Reacta. Dodatkowo `onMove` odrzuca kółko w trakcie animacji (`isAnimatingRef && !isDragging`). |
| Przy oddalaniu i „Cofnij” dziwne lądowanie | `useMapViewState.animateToView`: (1) środek i zoom interpolowane liniowo i niezależnie (przy zmianie zoomu o kilka poziomów prędkość obrazu na ekranie rośnie wykładniczo: początek „stoi”, koniec „strzela”); (2) krzywa `cubic-bezier(0.2,0,0,1)` ma bardzo ostry start i długi ogon – ostatnie ~30% czasu to prawie nieruchome klatki, a pierwsze klatki robią największy skok; (3) `MAX_STEP = 0.2` przy zacięciu daje skoki po 20% drogi; (4) podmiana celu w locie (`animTargetRef`) zmienia cel bez zachowania prędkości → szarpnięcie; (5) na końcu `useEffect` ładuje `localities.json` i zmienia się koszyk warstw. |
| „Pop” na granicy koszyka | `layersZoomBucket` (5/11, próg zoom 9): warstwa miejscowości (`ScatterplotLayer`) jest tworzona/usuwana nagle, bez zanikania; przebudowa warstw w klatce, w której przekroczono 9, to dodatkowy skok czasu klatki. |
| Pomiar „przed” (PF01, ×4, SwiftShader) | kółko ×3: p95 1650 ms, 64% zgubionych; pinch: 24 długie klatki, p95 1117 ms; „Wróć”: max 767 ms; Powiaty: max 4400 ms (`docs/research/p-kamera-pomiar-telefon.md`). |

## 2. Diagnoza artefaktów ze zrzutu (wachlarze w wielokątach)
Zrzut: ciemny motyw, duże zbliżenie; wewnątrz wielokątów jaśniejsze, promieniste „wachlarze” z gładkim gradientem, rozchodzące się z wierzchołków konturu.

**Co wiemy z kodu**
- `GeoJsonLayer` choropleth nie jest wyciągany (`extruded` wyłączone) i nie ma `material`/oświetlenia → światło, ekstruzja i triangulacja same z siebie dają kolor płaski.
- Warstwa choropleth ma `...getNoDataPatternProps()` (`src/view/map/layers/no-data-pattern.ts`): `FillStyleExtension({ pattern, proceduralPattern })` jest włączone **dla wszystkich wielokątów**, nie tylko „brak danych”. `getFillPattern` zwraca `''` dla wielokątów z danymi, a deck.gl 9.4.0 dla nieznanej nazwy bierze indeks 0 (`getProceduralPatternIndex`: `patternIndices?.get(name) ?? 0`) – czyli wzór kreskowania `no-data-hatch`. Tło wzoru (`getFillPatternBackgroundColor`) to zawsze kolor `--no-data`.
- Shader tego rozszerzenia (`@deck.gl/extensions/dist/fill-style/shader-module.js`) liczy `fill_uv = geometry.position.xy` w wierzchołku (32-bit, wspólna przestrzeń), interpoluje po trójkącie i w fragmencie robi `mod(...)`, `fwidth(...)` oraz `fill_blendOverBackground` z tłem `--no-data`. To jedyne miejsce w warstwie, gdzie wartość zależna od pozycji jest interpolowana przez duże trójkąty z triangulacji (earcut: wielokąty o wielu wierzchołkach dają długie, cienkie trójkąty „wachlarzem” z jednego wierzchołka – dokładnie kształt artefaktów).
- Kolor wachlarzy na zrzucie jest przesunięty ku jasnemu niebieskoszaremu = kolor tła wzoru `--no-data` (ciemny motyw), a nie ku jakiemuś kolorowi światła.

**Ranking hipotez**
1. (najbardziej prawdopodobna) Precyzja i interpolacja `fill_uv` w rozszerzeniu wzoru procedury przy zoomie 11–12 (`maxZoom` = 12) na GPU telefonu; błąd przyjmuje postać wachlarzy, bo każdy wielokąt jest triangulowany od wierzchołka. Naprawa: wzór tylko dla wielokątów „brak danych” w **osobnej warstwie** (`choropleth-nodata-layer`), a warstwa kolorów bez rozszerzenia.
2. Precyzja pozycji 32-bit: mało prawdopodobna, bo deck.gl w trybie LNGLAT przekazuje pozycje z częścią 64-bitową, a poniżej zoomu 12 nie używa offsetu. Gdyby hipoteza 1 się nie potwierdziła: sprawdzić `coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS`/`coordinateOrigin` w zadaniu A (krok 5).
3. Oświetlenie / ekstruzja: odrzucone (brak `extruded`, brak `material`).
4. Samo wygładzanie/gradient koloru: odrzucone (`getFillColor` zwraca stały kolor na wielokąt; przejście koloru `transitions.getFillColor` działa w czasie, nie w przestrzeni).

**Uczciwe ograniczenie.** Próba odtworzenia w headless Chromium (SwiftShader, 560×560, ciemny motyw, poziom gmin, zoom 12, kilka przesunięć) dała płaskie kolory bez wachlarzy, a w tej samej próbie wzór kreskowania też nie był widoczny na wielokątach z danymi. Czyli: rozszerzenie jest podejrzaną przyczyną na podstawie kodu i kształtu artefaktu, ale artefakt zależy od GPU telefonu i **nie został odtworzony lokalnie**. Zadanie A musi więc zawierać test jednostkowy zachowania warstw (brak rozszerzenia na warstwie z kolorami) i prośbę o sprawdzenie na telefonie na podglądzie Vercel; jeśli wachlarze zostaną, hipoteza 2 (krok 5 zadania A).

## 3. Gotowce i wzorce (sprawdzone w rejestrze npm 18.11.2026)
| Pakiet / API | Licencja | Ostatnie wydanie | Wniosek |
|---|---|---|---|
| `maplibre-gl` 6.19.0 (mamy ^6.15) – `easeTo`, `jumpTo`, `scrollZoom.setWheelZoomRate/setZoomRate`, `dragPan`, `touchZoomRotate`, zdarzenia `movestart/moveend` z `originalEvent` | BSD-3-Clause | 2026-11-17 | **Używamy.** Natywne kółko, pinch i inercja są dobre, o ile mapa nie jest kontrolowana stanem Reacta. Własny rAF wywołuje `map.jumpTo` (bez Reacta). |
| `deck.gl` / `@deck.gl/core` 9.4.1 – `FlyToInterpolator`, `LinearInterpolator`, `transitionDuration`, `MapController` | MIT | 2026-10-28 | **Nie** (dotyczy widoków deck.gl, my mamy deck jako nakładkę `MapboxOverlay` na MapLibre; kamerę trzyma MapLibre). `transitions` atrybutów deck.gl używamy tylko dla koloru/alfa warstw. |
| `d3-ease` 3.0.2 (BSD-3-Clause, 2026-11-03), `d3-interpolate` 3.0.2 (ISC, 2026-11-03) – `interpolateZoom` (van Wijk) | BSD/ISC | 2026-11 | **Nie dodajemy.** Potrzebne funkcje (easeInOutCubic, waga środka przy zoomie) to ~15 linii; własny moduł z testami. Wzorzec „waga środka” wzięty z koncepcji van Wijk & Nuij (2003), implementacja własna. |
| `popmotion` 11.0.5 | MIT | 2022-08-15 (nieutrzymywany) | Odrzucone (stare). |
| `motion` 14.14.0 | MIT | 2026-11-13 | Odrzucone (animacje DOM/CSS, nie kamera mapy). |
| `react-spring` 10.0.4 / `@react-spring/web` 10.1.2 | MIT | 2026-05/06 | Odrzucone (animuje stan Reacta – to jest właśnie przyczyna problemu). |
Pobrania tygodniowe: API pobrań npm niedostępne z tego środowiska (proxy); wartości nie podajemy. Nie dodajemy żadnego pakietu, więc wpis w `ELEMENTY.md` niepotrzebny.
Repozytoria-wzorce: w `docs/INSPIRACJE.md` ze statusem `zweryfikowane` jest tylko dokumentacja MapLibre (kamera: `fitBounds`, `flyTo`, `AnimationOptions`) i deck.gl (przejścia atrybutów). Inne źródła są tu jedynie opisane (koncepty), kodu nie czytano.

## 4. Koncepty i decyzje (nie do ponownej dyskusji w zadaniach)
1. **Kamera poza Reactem.** `<Map>` przestaje być kontrolowany (`initialViewState`/ref); animację prowadzi jeden `requestAnimationFrame` w `useCameraDriver`, wywołujący `map.jumpTo` i zapisujący bieżący widok do `ref`. Stan Reacta aktualizowany tylko na `moveend` i przy zmianie koszyka warstw.
2. **Zoom w skali logarytmicznej.** `zoom` to już log2 skali, więc interpolujemy zoom liniowo w czasie (stała prędkość wizualna), a środek z wagą van Wijk: `u = (2^-z(t) − 2^-z0)/(2^-z1 − 2^-z0)` (dla z0 = z1: `u = s(t)`). Dzięki temu przesunięcie na ekranie ma stałą prędkość podczas zoomu.
3. **Easing:** `easeInOutCubic` (prędkość 0 na początku i końcu → miękkie lądowanie). Zastępuje `cubic-bezier(0.2,0,0,1)` w kamerze (token `motion.easing` zostaje dla reszty UI).
4. **Czas zależny od dystansu:** `score = |Δzoom| + log2(1 + dystans_w_szerokościach_ekranu)`; `czas = clamp(motion.cameraOut + 130·score, motion.cameraOut, 1,5·motion.cameraIn)` = 400…900 ms; przy `prefers-reduced-motion` 0. Bez zmiany `config/tokens.json` (stałe 130 i 1,5 w module, z komentarzem).
5. **Postęp z czasu zegara**, bez `MAX_STEP`; po długiej klatce animacja „doskakuje” do właściwego punktu krzywej (brak skoku zoomu > 0,25 na klatkę przy 60 fps dla Δzoom ≤ 4 – to wynika z nachylenia easeInOutCubic: 3·Δ/N_klatek).
6. **Zmiana celu w locie (retarget)** zachowuje bieżącą pozycję i prędkość: nowy plan startuje z bieżącego widoku z czasem skróconym; zero skoku.
7. **Dotyk/kółko przerywa animację** (`movestart` z `originalEvent` ≠ undefined → `driver.cancel()`), natywne gesty MapLibre przejmują sterowanie bez odrzucania zdarzeń.
8. **„Cofnij” = ten sam planer** co wejście (żadnych osobnych czasów/krzywych); kind `in/out` tylko wybiera klamrę czasu.
9. **Koszyk 5/11 bez „pop”:** warstwa miejscowości budowana od zoomu 8,5 (histereza 8,5/9,0), a pojawia się przez przejście alfa (`transitions.getFillColor/getLineColor` = `motion.base`, 300 ms), nie przez utworzenie warstwy.
10. **Wzór „brak danych” tylko dla wielokątów bez danych**, w osobnej warstwie; reszta bez rozszerzeń.
11. **Brak nowych pakietów.**

## 5. Kryteria akceptacji liczbowe (cały FIX6)
Przy dławieniu CPU ×4 i metodzie PF01 (`tests/e2e/perf-camera-frames.spec.ts`):
- p95 odstępu klatek ≤ 33 ms i `droppedShare` < 10% w scenariuszach: kółko ×3, pinch, „Cofnij”/„Wróć”, powrót z Powiatów (cel; mierzone na SwiftShader jest pesymistyczne, rozstrzyga telefon właściciela).
- `max` odstępu ≤ 100 ms w tych scenariuszach, zero długich klatek (> 50 ms) w samym ruchu poza pierwszą klatką.
- Skok zoomu na klatkę ≤ 0,25 (60 fps, Δzoom ≤ 4); skok środka ≤ 8% szerokości widoku.
- Prędkość zoomu w ostatniej klatce animacji ≤ 1% prędkości maksymalnej (lądowanie → 0); „Cofnij” kończy dokładnie w `viewState` sprzed wejścia (± 1e-6).
- Zero `setState` kamery na klatkę (licznik renderów `AtlasMapReady` podczas animacji ≤ 3).
- Przejście 8,9 → 9,1: zmiana alfa miejscowości rozłożona na ≥ 10 klatek, brak klatki > 50 ms.
