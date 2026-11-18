# W20-CN04 – Stabilne referencje `data` warstw „brak danych” i obrysu
Prompt samowystarczalny. Kontekst: `docs/research/q-cienie-E-cofanie.md` (K4/K5), `docs/research/q-cienie-A-shader.md`.

## 1. Cel
Podczas ruchu i animacji warstwy `choropleth-nodata-layer` i `selected-outline-layer` nie przeliczają geometrii co klatkę (nowy obiekt `data` przy każdym wywołaniu fabryki = pełne ponowne tesselowanie i wysłanie buforów na GPU, co na iPhonie daje mignięcia i cienie).

## 2. Decyzje
- Fabryki budują dziś `data: { type:'FeatureCollection', features: noData }` i `{..., features: foundFeatures}` od nowa przy każdym wywołaniu → deck widzi zmianę referencji.
- Dodaj mały helper `memoLast` (`src/core/map/memo-last.ts`): `memoLast<K extends unknown[], V>(compute:(…K)=>V, same:(a:K,b:K)=>boolean)` zwraca tę samą wartość, dopóki klucz taki sam (porównanie referencji elementów klucza).
- Klucz dla `nodata`: `[features (referencja zestawu poziomu), classByTeryt (referencja), level, activeWojTeryt, activePowTeryt]`. Dla obrysu: `[terytsToOutline.join(','), referencje wojFeatures/powFeatures/gmiFeatures]`.
- `updateTriggers.data` zostaje (istniejące testy).

## 3. Pliki
- Zmieniaj: `src/core/map/memo-last.ts` (nowy), `src/view/map/layers/choropleth.ts`, `tests/unit/memo-last.test.ts` (nowy), `tests/unit/choropleth-data-stable.test.ts` (nowy)
- Wymagane: `tests/unit/choropleth-layers-split.test.ts`, `tests/unit/no-data-pattern.test.ts` (istnieją, nie ruszać)
- Czytaj tylko: `choropleth.ts` (fabryki `choroplethNoDataLayerFactory`, `selectedOutlineLayerFactory`).

## 4. Kroki
1. Testy najpierw: `memo-last.test.ts` (ta sama zawartość klucza → ta sama referencja wyniku, jeden `compute`; zmiana elementu klucza → nowy wynik); `choropleth-data-stable.test.ts` (mock `loadGeoData` jak w `choropleth-layers-split.test.ts`): dwa wywołania `choroplethNoDataLayerFactory.create` z tym samym `classByTeryt` (ta sama referencja) i zakresem → `layerA.props.data === layerB.props.data`; inny `classByTeryt` → inna referencja; to samo dla obrysu (`drillState.selected` ten sam → ta sama referencja `data`; inny → inna).
2. Kod: owiń budowę `data` w `memoLast`; nic poza tym nie zmieniaj (kolejność warstw, `getFillPattern`, tokeny).
3. Dodaj w teście `choropleth-data-stable` asercję, że `data` warstwy kolorów (`choropleth-layer`) też jest stałą referencją z `loadGeoData` (ta sama dla tego samego poziomu).

## 5. Gotowe, gdy
- Testy 4.1 i 4.3 zielone; istniejące `choropleth-layers-split.test.ts` i `no-data-pattern.test.ts` zielone bez zmian.
- Podgląd: przy przeciąganiu/zoomie nie ma mignięć kreskowania; kreskowanie „brak danych” wygląda jak dotąd.

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/CN04 origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (jeśli jest): `pnpm exec playwright test <plik> --trace off`.
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W20-CN04] <krótko>`. Opis po polsku, bez `Closes #`, z sekcjami:
```
## Po ludzku
- Co zrobiłem: …
- Co sprawdzić na podglądzie Vercel (iPhone, Safari): … (gdzie na stronie i co powinno być widać)
- Czego nie zrobiłem i dlaczego: …
## Liczby
przed → po (z testów) …
```
Poczekaj na CI; znane flaki (library-only-fetched:103, library-search:99, picker-scroll:25, network-resilience:135) – rerun, nie zmieniaj tych testów. Wzorce zrzutów odświeża właściciel.

## 8. Zakazy
Nie edytuj `docs/STAN.md`, `package.json`, `pnpm-lock.yaml`, istniejących testów ani snapshotów. Bez nowych pakietów. Nie scalaj PR. Musisz zmienić plik spoza listy „Zmieniaj” albo istniejący test przeszkadza → zatrzymaj się i opisz w PR. Kolory/czasy tylko z tokenów (`config/tokens.json`), pliki do ok. 200 linii, komentarze po polsku, nazwy po angielsku, TERYT jako string. Nie czytaj nic poza `AGENTS.md` i plikami wskazanymi w sekcji 3.

## 9. Zależności
Po CN03. Ten sam plik `choropleth.ts` co CN01/CN02/CN05 – idą po kolei, nigdy równolegle.
