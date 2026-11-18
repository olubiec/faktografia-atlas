# R-C: zamiennik wzoru „brak danych” bez shadera FillStyleExtension

Stan: 18.11.2026 (kod na a88c98f). Dokument nie zmienia kodu strony. Cel: jasne „wachlarze” w wielokątach na iPhonie podczas ruchu kamery; podejrzany jest wzór proceduralny z `src/view/map/layers/no-data-pattern.ts`. Wartości w kolumnach „wydajność” i „artefakty” to ocena z kodu i dokumentacji, nie pomiar na telefonie.

## 1. Co jest w kodzie
- Wzór ma **jedno miejsce użycia**: `choroplethNoDataLayerFactory` w `choropleth.ts` (warstwa `choropleth-nodata-layer`, zarejestrowana w `AtlasMap.tsx:42`). Definicja: `no-data-pattern.ts` (`FillStyleExtension({pattern, proceduralPattern})`, hatch 45°, gap 4 px, tło `--no-data`, kolor linii z `getFillColor` = `--linia`).
- FIX6A już rozdzielił warstwy: `choropleth-layer` (kolory) **nie ma** rozszerzenia (test `choropleth-layers-split.test.ts`), shader działa tylko na wielokątach „brak danych” w aktywnym zakresie. Jeśli wachlarze zostały, są w tych wielokątach (długie trójkąty z triangulacji + interpolowane `fill_uv`), albo mają inną przyczynę. Najtańsza diagnoza przed jakąkolwiek zmianą: na telefonie na podglądzie wyłączyć tylko tę warstwę (np. `return null` z fabryki) i sprawdzić, czy wachlarze znikają.
- Legenda (`Legend.tsx:40`) rysuje próbkę **w CSS**: `repeating-linear-gradient(45deg, linia 1px, no-data 1px…5px)`, nie zależy od deck.gl; test `legend-no-data-swatch.test.tsx` pilnuje gradientu. Pozycja „brak danych” jest zawsze ostatnia (`core/legend/legend.ts:58`).
- Inne miejsca „brak danych”: `CompareMaps.tsx:157` (SVG, **płaski** `--no-data`, bez kreskowania), `UnitTooltip.tsx:99,129` (tekst „brak danych”), `DesignPage.tsx` (opis tokenu). Karty udostępniania (`core/share`) mają tylko tekst.
- Testy dotykające wzoru: `no-data-pattern.test.ts`, `choropleth-layers-split.test.ts`, `legend-no-data-swatch.test.tsx`.
- Pułapka kolorystyczna: w skali dywergentnej środek to `arkusz` (#F8FAF9), czyli **ten sam kolor co `--no-data` (jasny)**. Płaski `--no-data` bez wzoru byłby nie do odróżnienia od klasy środkowej. Dziś na mapie brak danych wypełnia `--linia` (#C5CDD3) z kreskami, więc płaskie wypełnienie musi być `linia`, nie `arkusz`, i legenda musi to samo pokazywać.
- Rozbieżność w dokumentach: STYL §2 mówi „arkusz z kropkowaniem w kolorze linia”, kod robi kreski 45°, a ostatni punkt STYL §2 mówi, że kreskowanie jest „drugim kanałem” opcjonalnym. Zmiana STYL.md wymaga zgody właściciela (AGENTS: najpierw zapytaj).
- Mapa rysuje wielokąty w deck.gl (`MapboxOverlay` bez `interleaved`, osobne płótno), geometrii nie ma w źródle MapLibre.

## 2. Porównanie

| # | Sposób | Wygląd | Koszt na telefonie | Ryzyko artefaktów | Tokeny STYL | Pliki do zmiany | A11y (nie tylko kolor) |
|---|---|---|---|---|---|---|---|
| 1 | Jednolity kolor `linia` + obrys | płaski szary, bez wzoru; w sk. sekwencyjnej `seq-1` (#D6DEEA) bywa podobny | zerowy (zwykły fill GeoJsonLayer, usuwamy jedną warstwę) | brak (ten sam kod co reszta kolorów) | tak, ale STYL §2 żąda kropkowania: wymaga zgody | ok. 6: usunąć `no-data-pattern.ts` + test, `choropleth.ts`, `AtlasMap.tsx`, test podziału, `Legend.tsx` + jego test | słabsze: tylko legenda z tekstem i tooltip „brak danych”; na mapie sam odcień |
| 2 | Osobna `PathLayer` z kreskami 45°, przycięta do wielokąta | najbliższy dzisiejszemu (kreski `linia`) | średni: tysiące krótkich ścieżek przy gminach; przycięcie w czasie działania kosztuje CPU | niskie (zwykła geometria, bez interpolowanego `fill_uv`); przy przycinaniu `MaskExtension` – framebuffer, ryzyko na iOS | tak (kolor z tokenu, gap/grubość do dodania) | 4-5: nowa fabryka, `AtlasMap.tsx`, usunąć stary wzór i test, ewentualnie moduł przycinania | dobre: wzór widoczny na mapie |
| 3 | Wzór CSS/SVG nad mapą | kreski na całym ekranie, trzeba maski kształtów | wysoki: SVG z `clip-path` z setek ścieżek synchronizowanych z kamerą co klatkę | średnie: rozjazd z kamerą, migotanie | tak (CSS) | duże: nowa nakładka, projekcja, klik/hover przechodzą przez nią | dobre wizualnie, ale kruche |
| 4 | `BitmapLayer`/tekstura | raster z kreskami na obszarze | średni; rozmycie przy zoomie, tekstura per jednostka | średnie (skalowanie, szwy) | tak | duże: generowanie rastra per poziom/zoom | dobre, ale rozmyte |
| 5 | MapLibre `fill-pattern` | idealny wzór natywny | niski | niskie | tak (obraz z tokenu przez `addImage`) | **bardzo duże**: choropleth musiałby przejść z deck.gl do źródła/warstwy MapLibre (inny pipeline kolorów, kliknięcia, przejścia, kafelkowanie) | dobre; koszt migracji nieuzasadniony |
| 6a | `FillStyleExtension` z atlasem (nie proceduralny) | jak dziś | jak dziś | **ten sam shader i `fill_uv`**, więc ta sama podejrzana ścieżka | tak | 1 | jak dziś |
| 6b | `PathStyleExtension` (kropki/kreski) na obrysie wewnętrznym | kropkowany obrys wokół „brak danych” (zgodne z duchem „kropkowania”) | niski: ścieżki, nie wypełnienia | niskie-średnie (shader kresek jest 1D wzdłuż odcinków, bez triangulacji wypełnień) | tak | 3-4 | umiarkowane |
| 6c | `textures` 1.2.3 (MIT, 2021-04) | wzory SVG | – | – | – | – | **odrzucone**: SVG/D3, nieutrzymywane, nic nie daje w deck.gl |
| 6d | `polygon-clipping` 0.15.7 (MIT, 2023-12) / `@turf/bbox-clip` 7.4.0 (MIT, 2026-08) / `lineclip` 2.0.0 (ISC, 2025-07) | narzędzia do przycięcia kresek z opcji 2 | jednorazowy CPU | – | – | +1 pakiet, wpis w `ELEMENTY.md`, opis w PR | – |

Pobrania tygodniowe: API pobrań npm niedostępne z tego środowiska (proxy), nie podaję. `@deck.gl/extensions` 9.4.1 (MIT, 2026-10-28) zawiera `MaskExtension` i `PathStyleExtension`, więc opcje 2 (przez maskę) i 6b nie wymagają nowego pakietu. Na GitHubie nie szukano osobno: wszystko powyżej jest w rejestrze npm.

## 3. Rekomendacja
**Krok 0 (diagnoza, bez kodu strony):** na telefonie wyłączyć warstwę `choropleth-nodata-layer` i sprawdzić wachlarze. Jeśli zostają, to nie wzór i dalsze kroki nie pomogą.

**Rekomendacja: opcja 1** (jednolite wypełnienie `--linia` + obrys, usunięcie `FillStyleExtension` z projektu). Powód: jedyny sposób bez żadnego shadera i bez nowych pakietów, najmniejsza zmiana, zero ryzyka artefaktów; legenda już jest w CSS. Warunki: (a) fill = `linia`, nie `arkusz` (kolizja ze środkiem skali dywergentnej); (b) próbka w legendzie zmienia się na to samo płaskie `linia` (test legendy do aktualizacji przez zadanie, AGENTS zabrania zmian istniejących testów bez prośby, więc zadanie musi to wprost zlecić); (c) osobna zgoda właściciela na zmianę STYL §2 („kropkowanie” → „szary + etykieta”), bo traci się drugi kanał; (d) kompensata a11y: tooltip i profil już mówią „brak danych” tekstem, a w legendzie pozycja ma etykietę.

**Plan awaryjny (gdy właściciel chce zachować kreskowanie):** opcja 2 bez nowego pakietu: kreski jako `PathLayer`, przycięte `MaskExtension` do wielokątów „brak danych” (wszystko z `@deck.gl/extensions`); sprawdzić na iPhonie, bo maska używa framebuffera. Jeśli maska też daje artefakty: przycięcie kresek w czasie budowy danych (`polygon-clipping`, MIT, wymaga zgody na zmianę `scripts/data` i wpisu w `ELEMENTY.md`), albo wariant 6b (kropkowany obrys) jako lżejszy drugi kanał.
