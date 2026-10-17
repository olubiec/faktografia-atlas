# Sesja CC4.1b — Komponent mapy (MapLibre + deck.gl) na ekranie startowym

## Treść zadania
Warunek wysyłki: CC4.1a scalone (#57).
Cel: na ekranie startowym zamiast statycznej kalki jest prawdziwa mapa Polski, którą można przesuwać i przybliżać tylko w granicach kraju. Wygląda jak kalka z makiety 01: granice województw, bez podkładu ulic.

## Warunki odbioru → test lub weryfikacja

| Warunek odbioru | Test / Weryfikacja |
|---|---|
| Pusty styl MapLibre z tłem w kolorze tokena kalka, bez zewnętrznych kafelków i bez zewnętrznego style.json. Test e2e: na stronie z mapą żadne żądanie nie wychodzi poza origin. | `tests/e2e/map.spec.ts` (`empty MapLibre style with kalka background color - no external tile requests`) |
| Warstwy deck.gl: województwa z wypełnieniem arkusz i szczelinami w kolorze kalka, kontur kraju 1,5 px w kolorze tusz. Kolory czytane ze zmiennych CSS, przełączenie motywu zmienia kolory bez przeładowania. | `src/view/map/layers.ts`, `tests/e2e/map.spec.ts` (`theme toggle updates window.__atlas.theme without page reload`) |
| Widok startowy i granice z `initialViewState`, `countryBounds`, `mapLimits`. Klawiatura: strzałki przesuwają, + i - przybliżają. `aria-label="Mapa Polski"`. | `src/view/map/AtlasMap.tsx`, `tests/e2e/map.spec.ts` (`keyboard controls (+, -, arrows) pan and zoom map, aria-label="Mapa Polski"`) |
| Szew `window.__atlas` (`installAtlasSeam`) tylko z `?e2e`. Testy e2e czytają stan (ready = true, layers, theme, viewState w Polsce 49–55°N, 14–24°E). `?name=e2e` NIE włącza szwu. | `src/core/map/test-seam.ts`, `tests/unit/map-seam.test.ts`, `tests/e2e/map.spec.ts` |
| Mapa w tym samym miejscu co dotychczasowa kalka. Istniejące testy `home.spec.ts` przechodzą. Brak poziomego przewijania przy 390 px. | `src/view/Home.tsx`, `tests/e2e/map.spec.ts` (`no horizontal scroll at 390px viewport width`) |
| Kod mapy ładowany leniwie. Główny pakiet nie rośnie o więcej niż 30 KB gzip względem main. | `src/view/Home.tsx` (`React.lazy`), pomiar rozmiarów paczek przed/po. |

## Rozmiary pakietu (bundle size)

Przed zmianą (main):
- `dist/assets/index-*.js`: 459.74 kB │ gzip: 142.04 kB

Po zmianie (CC4.1b):
- `dist/assets/index-*.js`: 459.74 kB │ gzip: 142.04 kB
- `dist/assets/AtlasMap-*.js`: 3,613.84 kB │ gzip: 1,088.63 kB (leniwie ładowane przy wejściu na mapę)

Różnica w głównym pakiecie (`index-*.js`): **0 KB** (zmiana < 30 KB gzip).

## Zmienione pliki

- `src/core/map/test-seam.ts`: zmiana sprawdzania `?e2e` na `URLSearchParams.has('e2e')`
- `tests/unit/map-seam.test.ts`: dodanie testu jednostkowego dla `?name=e2e`
- `src/view/map/layers.ts`: nowe warstwy deck.gl (województwa + kontur) z parsowaniem zmiennych CSS
- `src/view/map/AtlasMap.tsx`: nowy komponent mapy MapLibre + deck.gl (`MapboxOverlay`)
- `src/view/Home.tsx`: zamiana statycznej kalki na `<AtlasMap />` ładowane leniwie przez `React.lazy`
- `tests/e2e/map.spec.ts`: nowe testy e2e mapy
- `docs/sessions/CC4.1b.md`: dokumentacja sesji
