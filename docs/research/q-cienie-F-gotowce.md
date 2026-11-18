# R-F – Gotowe rozwiązania zamiast własnych (choropleth na iPhonie, przejścia poziomów)

Stan: 18.11.2026. Tylko badanie; bez zmian w `src/`. Wersje i daty z rejestru npm (`registry.npmjs.org`, dziś).
**Ograniczenie:** `api.npmjs.org` (pobrania tygodniowe) i `npmjs.com` są z tego środowiska zablokowane przez proxy – kolumna „pobrania” = **nie sprawdzono**. Trzeba ją uzupełnić z przeglądarki przed wpisem do `ELEMENTY.md`.

## 0. Co jest dziś w repo (sprawdzone w kodzie)
- `AtlasMap.tsx:381-404`: `react-map-gl/maplibre` + `MapboxOverlay` (deck.gl, tryb **nie-interleaved**, osobna kanwa WebGL) z `useDevicePixels={pixelRatio}`. Dwa konteksty WebGL na iPhonie (MapLibre + deck.gl).
- `layers/choropleth.ts`: `GeoJsonLayer` z `transitions.getFillColor` (300 ms) i `updateTriggers` zmieniającym się co klatkę reveal. `layers/no-data-pattern.ts`: `FillStyleExtension({pattern, proceduralPattern})` – to ten „podejrzany shader”; komentarz w `choropleth.ts:187` mówi, że wachlarze już raz zwalczano przez wydzielenie warstwy.
- Dane: jeden plik `public/geo/admin.topo.json` (1,28 MB) – ~16 woj. + ~380 powiatów + ~2480 gmin. To mało: nie ma potrzeby kafelków wektorowych.
- Istniejąca diagnoza ruchu: `docs/research/q-c401-ruch-mapy.md` (własny rAF + `setCurrentViewState` co klatkę; przebudowa warstw).

## 1. Znane problemy iOS Safari (c)
Wyszukiwanie nie znalazło zgłoszenia o dokładnie takim objawie (wachlarze w wielokątach + FillStyleExtension na iOS). Znalezione pokrewne:
- deck.gl #8602 „checkerboard” przy `interleaved:true` + MapLibre (iPhone 12 Pro Max, iOS 16) – zamknięte PR #8844 (kwiecień 2024); przyczyna niepotwierdzona (z-fighting / precyzja bufora głębi). **Nas to nie dotyczy bezpośrednio**, bo nie używamy `interleaved`.
- WebKit #218949 (wolne instancingi na iPhone 12 Pro, naprawione iOS 15), WebKit #274084 / #247240 (brak rozszerzeń float w WebGL2 na iOS) – możliwy wpływ na shadery z teksturami/float; niepotwierdzone dla FillStyleExtension.
- Wniosek: wachlarze to najpewniej triangulacja wielokątów (earcut w deck.gl, duże współrzędne przy dużym zoomie, precyzja 32-bit float na GPU iOS) i/lub shader wzoru. MapLibre tnie geometrię na kafelki (geojson-vt) i liczy w współrzędnych kafelka, więc **ten rodzaj artefaktu dla niego nie występuje** – to argument za (a), ale nie dowód.
- Szybki test bez migracji: usunąć `FillStyleExtension` (kreskowanie jako obraz `fill-pattern` albo jednolity jasny kolor + obrys) i sprawdzić na telefonie, czy wachlarze znikają.

## 2. Kandydaci

| # | Kandydat | Wersja / data | Licencja | Pobrania/tydz. | Co daje | Koszt migracji (pliki) | Werdykt |
|---|---|---|---|---|---|---|---|
| 1 | **MapLibre natywne warstwy `fill`/`line` + `setFeatureState`** (już mamy `maplibre-gl`; link: https://maplibre.org/maplibre-style-spec/layers/ , https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#setfeaturestate) | maplibre-gl 6.19.0, 2026-11-17 (w repo ^6.15.0) | BSD-3-Clause | nie sprawdzono (pakiet już w użyciu) | Choropleth jako `source: geojson` (`promoteId: 'teryt'`) + `fill-color` ze `feature-state` lub wyrażeniem `match`; `fill-opacity` interpolowane po zoomie; `fill-pattern` dla „brak danych”; jeden kontekst WebGL; picking przez `queryRenderedFeatures`/zdarzenia warstwy; `fill-color-transition` 300 ms gratis | **Wysoki**: nowy moduł warstw w MapLibre zamiast `layers/choropleth.ts`, `no-data-pattern.ts`, `admin.ts`, `registry.ts`; zmiany w `AtlasMap.tsx` (usunięcie `DeckGLOverlay`, onClick/onHover), `hooks/useChoropleth.ts` (kolory → feature-state), `layers/localities.ts`; trzeba dostosować `core/map/test-seam.ts` (`window.__atlas`), `outline-visibility.ts`. Zakazane bez wzmianki w prompcie: `AtlasMap.tsx`, `hooks/*` (AGENTS.md). Zero nowych pakietów. Zmiana architektury → najpierw pytanie do właściciela | **Najlepszy kandydat docelowy**, jeśli test z p. 1 nie usunie artefaktów. Wymaga decyzji o architekturze. |
| 2 | **Hybryda: zostać przy deck.gl, tylko zdjąć `FillStyleExtension`** | @deck.gl/extensions 9.4.1, 2026-10-28 | MIT | nie sprawdzono | Usuwa podejrzany shader; kreskowanie przez osobną warstwę `PathLayer`/`SolidPolygonLayer` z jaśniejszym kolorem lub obraz ikony | **Niski**: `layers/no-data-pattern.ts`, `layers/choropleth.ts` (fabryka no-data), ewentualnie `registry.ts`; bez zmian w plikach ekranu | **Zrób najpierw** jako diagnozę (tani eksperyment) |
| 3 | **PMTiles** (https://www.npmjs.com/package/pmtiles) | 4.5.0, 2026-08-10 | BSD-3-Clause | nie sprawdzono | Jednoplikowe kafelki wektorowe z zakresami HTTP (`addProtocol`) | **Średni/wysoki**: nowy pakiet (wpis `ELEMENTY.md`), potok budowy (`scripts/geo`), nowy plik w `public/`, a AGENTS.md ogranicza pliki danych do jednego żądania (PRODUKT §7); `vercel.json` (zakresy) – wymaga zgody | **Nie teraz**. 2,9 tys. wielokątów / 1,3 MB nie uzasadnia kafelków; wartość dopiero przy granicach miejscowości lub dokładnych granicach gmin (S16 „kafelki”) |
| 4 | **tippecanoe** (https://github.com/felt/tippecanoe) | narzędzie C++, nie npm; wersję/licencję sprawdzić na GitHubie | BSD-2-Clause (z pamięci – **do potwierdzenia**, brak dostępu do strony) | – | Generator kafelków z GeoJSON | Jak PMTiles + binarka w CI (zmiana `.github/workflows/` zakazana bez prośby) | **Nie teraz**, jak wyżej |
| 5 | **geojson-vt** (https://www.npmjs.com/package/geojson-vt) | 5.0.4, 2026-09-30 | ISC | nie sprawdzono | Cięcie GeoJSON na kafelki w locie – **już wbudowane w `maplibre-gl`** (source `geojson`) | Zero (to wewnątrz kandydata 1) | Nie dodawać osobno |
| 6 | **@deck.gl/geo-layers (`MVTLayer`)** | 9.4.1, 2026-10-28 | MIT | nie sprawdzono | Kafelki wektorowe w deck.gl | Nowy pakiet + dane kafelkowe; nie usuwa problemu deck.gl | **Odrzucony** (nie rozwiązuje iOS, dokłada pakiet) |
| 7 | **@maplibre/maplibre-gl-style-spec** | 26.8.0, 2026-11-14 | ISC | nie sprawdzono | Walidacja i funkcje stylu (`expression`, `validate`) w testach jednostkowych | Mały (devDependency, test stylu), tylko jeśli przejdziemy na kandydata 1 | Opcjonalny dodatek do kandydata 1 |
| 8 | protomaps-leaflet 5.1.0 (BSD-3-Clause, 2025-06-18) | – | BSD-3 | nie sprawdzono | Dla Leaflet, nie MapLibre | – | **Odrzucony** (inny silnik mapy) |

Nie znalazłem gotowego pakietu „choropleth dla MapLibre” – wzorzec to wyrażenia stylu + `setFeatureState`, opisany w dokumentacji MapLibre (przykład „Create a choropleth / Update a feature state”, https://maplibre.org/maplibre-gl-js/docs/examples/). To wzorzec, nie pakiet; do `INSPIRACJE.md` wpisać jako „do weryfikacji”, licencja dokumentacji/przykładów (MapLibre – BSD-3-Clause) do potwierdzenia przez planistę.

## 3. Płynne przejście między poziomami (b) – wzorzec bez własnego kodu animacji
Tak jak w kandydacie 1 (wszystko deklaratywne, liczone przez GPU, bez rAF w React):
1. Trzy warstwy `fill` (woj/pow/gmina) w jednym źródle lub trzech, każda z `minzoom`/`maxzoom` i `fill-opacity` jako `["interpolate",["linear"],["zoom"], z1,0, z2,1, z3,1, z4,0]` – crossfade po zoomie, który nie wymaga animacji kamery ani stanu Reacta.
2. Zmiana wskaźnika/roku: `fill-color-transition: {duration: 300}` + aktualizacja przez `setFeatureState` (lub `setPaintProperty` z wyrażeniem `match` po `teryt`; dla ~2,5 tys. gmin `setPaintProperty` z jednym wyrażeniem jest tańsze niż tysiące `setFeatureState`).
3. „Wyblakła reszta kraju”: osobna warstwa z `fill-opacity` zależnym od `feature-state.active`.
4. Kamera: `map.easeTo/fitBounds` (opcja `essential:false` dla reduced-motion – już zweryfikowane w INSPIRACJE) zamiast własnego rAF; wymaga zmiany z kontrolowanego `viewState` (patrz `q-c401`, pkt 4) → to ten sam koszt, co R0 w QC401.
Dziś analog robi się w deck.gl przez `transitions` + `updateTriggers` (zmieniający się co klatkę – źródło „dziwnych animacji przy cofaniu”, hipoteza z `q-c401` pkt 6).

## 4. Rekomendacja
1. **Teraz (tani, bez migracji):** zdjąć `FillStyleExtension` i `updateTriggers.reveal.progress` z `getFillColor`; sprawdzić na iPhonie. Pliki: `layers/no-data-pattern.ts`, `layers/choropleth.ts`.
2. **Jeśli artefakty zostają:** migracja na natywne warstwy MapLibre (kandydat 1) jako osobne zadanie z decyzją właściciela (zmiana architektury, pliki ekranu). Zero nowych pakietów, mniej JS (odpada ok. cały deck.gl), jeden kontekst WebGL.
3. PMTiles/tippecanoe dopiero przy kafelkach miejscowości; nie dla tych 2,9 tys. wielokątów.

Źródła: [deck.gl #8602](https://github.com/visgl/deck.gl/issues/8602), [WebKit #218949](https://bugs.webkit.org/show_bug.cgi?id=218949), [WebKit #274084](https://bugs.webkit.org/show_bug.cgi?id=274084), [MapLibre style spec](https://maplibre.org/maplibre-style-spec/), rejestr npm (wersje, licencje, daty).
