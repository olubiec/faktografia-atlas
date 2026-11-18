# Q-CIENIE A: czy wachlarze w choropleth to FillStyleExtension? (R-A + R-B)

Stan: 18.11.2026. Wersje z `pnpm-lock.yaml`: `@deck.gl/*` 9.4.0, `@luma.gl/*` 9.4.2. Kod strony bez zmian.

## Wniosek
- **FillStyleExtension jako jedyna przyczyna: NIEPEWNE, raczej odrzucone w obecnym kodzie.** Po FIX6A rozszerzenie siedzi tylko na warstwie `choropleth-nodata-layer` (wielokąty „brak danych”). Warstwa `choropleth-layer` (kolory) nie ma żadnego rozszerzenia, a wachlarze widać w wielokątach z kolorami. Rozszerzenie nie może więc zepsuć tych wielokątów.
- **Nowa, lepiej pasująca hipoteza (niepotwierdzona na urządzeniu): przejście atrybutu `getFillColor` (`transitions` w `choropleth.ts`) przy zmianie `data`.** Dowód z kodu poniżej. Pasuje do „tylko w ruchu” i „znika po zatrzymaniu”.

## Dowody
**1. Kod rozszerzenia (deck.gl 9.4.0, `node_modules/@deck.gl/extensions/dist/fill-style/shader-module.js`).**
`fill_uv` liczone w wierzchołku (`geometry.position.xy`, potem `(origin + position) / patternFrameCommon`), w fragmencie `mod`, `fwidth`, `fract`. Rozszerzenie ma świadomie obejście precyzji (osobne `uvCoordinateOrigin` i `64Low`, redukcja części wysokiej przez `mod`). Efekt błędu precyzji to paski, schodki i migotanie kreskowania, a **nie gładki gradient koloru z wierzchołka**. Gładki wachlarz oznacza, że wierzchołki tego samego wielokąta mają różne wartości koloru (interpolacja po trójkącie).
**2. Skąd różne kolory w wierzchołkach (kod deck.gl 9.4.0).** `transitions.getFillColor` (300 ms) w `choropleth.ts` ~l.116. W `SolidPolygonLayer` kolor jest atrybutem na wierzchołek (`startIndices`). Gdy zmienia się `data` (zmiana poziomu/zakresu), `padBuffer` w `@deck.gl/core/dist/transitions/gpu-interpolation-transition.js` uzupełnia stary bufor przez `padArray` (`utils/array-utils.js`): cechy dopasowane **po numerze w tablicy, nie po TERYT**; pierwsze wierzchołki cechy dostają STARY kolor innej jednostki, nadmiarowe wierzchołki kolor docelowy. Sprawdzone na sucho (skrypt w scratchpadzie, `padArray` z paczki): stary układ `[10,10 | 20,20]`, nowy `[5 wierzch. | 3 wierzch.]`, kolor docelowy 99 → bufor startowy `[10,10,99,99,99 | 99,99,99]`. Czyli w jednym wielokącie część wierzchołków startuje od obcego koloru, część od docelowego, a przejście 0 → 1 interpoluje je w czasie. Wynik: jasne/ciemne promienie z wierzchołków konturu. Dodatkowo `padBuffer` robi synchroniczny `readSyncWebGL` (w logu SwiftShader: „GPU stall due to ReadPixels”), co na iPhonie wydłuża klatki.
**3. Issues/changelog w sieci (wyszukiwanie 18.11.2026; część hostów niedostępna z sesji, np. lists.webkit.org).** Nie znaleziono zgłoszenia o artefaktach FillStyleExtension/`fill_uv` na iOS/Safari/Metal ani o mediump/highp w tym module. Znalezione, tylko pośrednio związane: deck.gl [#8582](https://github.com/visgl/deck.gl/issues/8582) (5.03.2024–30.03.2024, 9.0.0-beta: „checkerboard” z MapLibre interleaved, naprawy luma.gl PR #2032, dotyczy bety 9.0, nie 9.4); WebKit [218949](https://bugs.webkit.org/show_bug.cgi?id=218949) (instancing GeoJsonLayer na iPhone 12 Pro, iOS 14, naprawione w iOS 15); deck.gl [#6133](https://github.com/visgl/deck.gl/issues/6133) (2021, wolne Safari przy zoomie). Mediump: `solid-polygon-layer-fragment.glsl.js` deklaruje `precision highp float`, więc „mediump” nie wynika z kodu warstwy. Nie znaleziono też zgłoszenia o `padArray`/przejściach kolorów z innym `data` (brak dowodu zewnętrznego, tylko analiza kodu).
**4. Mapa jest nakładką, nie interleaved.** `AtlasMap.tsx` ~l.403: `MapboxOverlay` bez `interleaved` (domyślnie false), osobny canvas deck.gl nad MapLibre, `useDevicePixels` 2. Podczas ruchu deck przerysowuje się za MapLibre; to nie tłumaczy gradientu, ale tłumaczy, czemu przejście i przebudowa warstw wypadają w klatkach ruchu.

## Próba odtworzenia (uczciwie: NIE odtworzono)
Skrypty (poza repo): `.../scratchpad/repro.mjs`, `drill.mjs`, `pad.mjs`.
- Środowisko: headless Chromium 1243 z `/opt/pw-browsers` (SwiftShader, ANGLE), build produkcyjny `pnpm build` + `vite preview`, motyw ciemny, viewport mobilny 390×780 @2x i desktop 1440×900. **WebKit niedostępny** (`playwright install` nie ma sieci); nie da się uruchomić Safari/Metal.
- Scenariusz 1: kółko ×14 (zoom 4,6 → 6,8) i cofanie, zrzuty co 3 kroki: płaskie kolory, zero wachlarzy.
- Scenariusz 2: `?u=0201`, potem „Wróć” (zmiana poziomu = zmiana `data` w trakcie przejścia), 14 zrzutów: płaskie kolory. Zrzut na SwiftShader trwa setki ms, więc okno przejścia 300 ms jest tylko grubo próbkowane; kamera była już na końcu przy 1. zrzucie. Wynik nie obala hipotezy przejścia.
- Wymuszenie niskiej precyzji: podmiana `precision highp float` na `mediump` w `shaderSource` kończy się błędem linkowania luma.gl („Precisions of uniform block … differ”), a SwiftShader i tak liczy mediump jako fp32. Test precyzji w CI jest więc **nieprzydatny**; nie da się go uczciwie zrobić bez prawdziwego GPU.

## Proponowany powtarzalny test (nie wymaga GPU telefonu)
Test sprawdza przyczynę (kolory wierzchołków), nie piksele. Plik `tests/e2e/q-cienie-transition.spec.ts` (@Q): `?u=0201&e2e` → „Wróć” → w ciągu ~100 ms odczyt `instanceFillColors` warstwy przez szew (`window.__atlas`, nowe pole np. `choroplethFillColorsUniform`: dla każdej cechy liczba różnych kolorów wierzchołków = 1) i asercja, że w żadnym momencie przejścia wielokąt nie ma więcej niż jednego koloru. Alternatywnie test jednostkowy Vitest: factory nie zwraca `transitions.getFillColor` lub `id` zależny od `level`+zakresu. Test jednostkowy jest szybki i deterministyczny, e2e na SwiftShader do potwierdzenia.

## Dlaczego tylko w ruchu
Zmiana poziomu/zakresu (powiaty ⇄ województwa ⇄ kraj, `drillState`) zmienia `data` i `updateTriggers.getFillColor` dokładnie wtedy, gdy kamera jedzie (animacja 400–900 ms). Przejście 300 ms startuje w pierwszej klatce ruchu, kończy się, gdy ruch dobiega końca; po nim bufor = docelowy, kolory płaskie. Zwykła mapa po zatrzymaniu nie ma przejścia. Kreskowanie „brak danych” (osobna warstwa, bez `transitions`) nie ma tego mechanizmu.

## Rekomendacja
1. W `choropleth.ts` usunąć `transitions.getFillColor` dla zmiany `data`/poziomu: albo `id: `choropleth-layer-${level}-${scopeKey}`` (nowa warstwa = brak bufora do dopasowania, pozostaje przejście przy zmianie wskaźnika/roku tylko gdy `data` ta sama), albo wyłączyć przejście na czas ruchu/zmiany poziomu (`transitions: {}` gdy `data` się zmieniło). Najprostsze: klucz warstwy zależny od poziomu i zakresu.
2. Zostawić osobną warstwę kreskowania; nie przywracać rozszerzenia na warstwie kolorów.
3. Zweryfikować na iPhonie na podglądzie Vercel. Jeśli wachlarze zostaną, następny krok: wyłączyć `choropleth-nodata-layer` (tymczasowo) i sprawdzić, czy wachlarze są tylko w „brak danych”; potem `LNGLAT_OFFSETS` (hipoteza 2 z `p-animacja-kamery.md`).

## Pliki do zmiany
- `src/view/map/layers/choropleth.ts` (id warstwy / transitions)
- `src/core/map/test-seam.ts` (opcjonalnie, odczyt kolorów dla testu e2e; wymaga zgody, ekran-seam)
- nowy `tests/e2e/q-cienie-transition.spec.ts` lub test jednostkowy factory w `tests/` (bez zmiany istniejących testów)
