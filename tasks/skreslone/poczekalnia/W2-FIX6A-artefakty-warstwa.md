# W2-FIX6A – Naprawa wachlarzy w wielokątach (wzór tylko dla braku danych)
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
Znikają promieniste, jaśniejsze „wachlarze” wewnątrz wielokątów przy dużym zbliżeniu (zoom 11–12) na telefonie. Na podglądzie: powiaty/gminy po zbliżeniu mają jednolite kolory; obszary „brak danych” nadal kreskowane.

## 2. Decyzje (nie do dyskusji)
- Przyczyna (hipoteza 1, `docs/research/p-animacja-kamery.md` §2): `FillStyleExtension` z wzorem procedury działa na wszystkich wielokątach warstwy `choropleth-layer`; `getFillPattern` daje `''` → indeks 0 (kreskowanie), tło = `--no-data`.
- Naprawa: dwie warstwy. `choropleth-layer` – bez `extensions`, bez `getFillPattern*`. Nowa `choropleth-nodata-layer` – tylko cechy z klasą `no-data` (w zakresie), z `FillStyleExtension`.
- Nie ruszasz tokenów, wyglądu kreskowania (kąt 45, grubość 1, odstęp 4), ani `transitions.getFillColor`.
- Lokalnie (SwiftShader) wachlarze nie odtwarzają się; nie próbuj dalej, zostaw test zachowania i prośbę o sprawdzenie na telefonie.

## 3. Pliki
- Zmieniaj: `src/view/map/AtlasMap.tsx` (tylko jedna linia rejestracji fabryki), `src/view/map/layers/choropleth.ts`, `src/view/map/layers/no-data-pattern.ts`, `tests/unit/choropleth-layers-split.test.ts` (nowy)
- Wymagane (istnieją, nie ruszać): `src/view/map/layers/registry.ts`, `src/view/map/layers/admin.ts`, `tests/unit/layers-view-state.test.ts`
- Czytaj tylko: `choropleth.ts` całość (fabryka `choroplethLayerFactory`), `no-data-pattern.ts` całość, `registry.ts` (jak `createMapLayers` składa warstwy: jeśli `LayerFactory.create` zwraca jedną warstwę, druga warstwa to druga fabryka `choroplethNoDataLayerFactory` eksportowana z `choropleth.ts`; jej rejestracja wymaga zmiany `AtlasMap.tsx` (rejestry w liniach 39–42) – to jedyna dozwolona zmiana tego pliku w A: dopisz jedną linię `registerLayerFactory`; opisz w PR).
- Nie czytaj: reszty `src/`, `docs/`.

## 4. Kroki
1. Test najpierw `tests/unit/choropleth-layers-split.test.ts` (mockuj `loadGeoData` jak w istniejących testach warstw, albo zbuduj `ctx` z małym `topoData` z `tests/fixtures`): 
   a) warstwa kolorów (`id 'choropleth-layer'`) ma `props.extensions` puste lub brak i `props.getFillPattern` niezdefiniowane;
   b) warstwa `choropleth-nodata-layer` istnieje, gdy ≥ 1 cecha ma klasę `no-data` w zakresie, i jej `data.features` zawiera wyłącznie takie cechy (sprawdź liczbę);
   c) gdy żadna cecha nie jest `no-data` → warstwa kreskowania = `null`;
   d) cechy poza zakresem (`isInScope` false) nie trafiają do warstwy kreskowania.
2. Kod: wydziel z `choropleth.ts` filtr cech no-data i budowę drugiej `GeoJsonLayer` (`filled: true`, `stroked: false`, `pickable: false`, `...getNoDataPatternProps(...)`, `getFillColor: kolor linii`); popraw `no-data-pattern.ts` tak, by `getFillPattern` zwracał zawsze `'no-data-hatch'` (bez `''`).
3. Zachowaj `pickable`/klik/hover na warstwie kolorów (kliknięcie w kreskowany obszar nadal działa – warstwa kolorów nadal rysuje te cechy pod spodem w kolorze `--no-data`).
4. Kolejność rysowania: kolory → kreskowanie → obrys wybranej.
5. (Tylko jeśli właściciel po wdrożeniu zgłosi, że wachlarze zostały) hipoteza 2: dodaj `coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS`/`coordinateOrigin` – to osobne zadanie, nie rób go tutaj.

## 5. Gotowe, gdy
- Testy 1a–1d zielone; istniejące `layers-view-state.test.ts` bez zmian i zielone.
- `grep -n "extensions" src/view/map/layers/choropleth.ts` nie znajduje `extensions` w warstwie `choropleth-layer`.
- Na podglądzie: zbliżenie do zoomu 12 na telefonie bez wachlarzy; kreskowanie „brak danych” nadal widać (zgłoś w PR, że potwierdza właściciel).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6A origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6A] `. Opis (po polsku, bez `Closes #`):
```
## Po ludzku
- Co zrobiłem: …
- Co sprawdzić na podglądzie Vercel (telefon): … (gdzie na stronie i co powinno być widać)
- Czego nie zrobiłem i dlaczego: …
## Liczby
przed → po (z testów/pomiaru) …
```
Dopisz: wzorce zrzutów (`*-snapshots/`) odświeża właściciel, jeśli zmienił się wygląd. Poczekaj na CI (shardy 1–4); znane flaki (library-only-fetched:103, library-search:99, picker-scroll:25, network-resilience:135) – zrób rerun, nie zmieniaj tych testów.

## 8. Zakazy
Nie edytuj `docs/STAN.md`, `package.json`, `pnpm-lock.yaml`, istniejących testów ani snapshotów. Bez nowych pakietów. Nie scalaj PR. Musisz zmienić plik spoza listy „Zmieniaj” → zatrzymaj się i opisz w PR dlaczego. Kolory/czasy/odstępy tylko z tokenów (`config/tokens.json`), pliki do ok. 200 linii, komentarze po polsku, nazwy po angielsku, kody TERYT jako string. Nie czytaj nic poza `AGENTS.md` i plikami/fragmentami wskazanymi w sekcji 3.

## 9. Zależności
Brak (może iść równolegle z B i I). Sprawdzenie startu: `git fetch -q && git log origin/main --oneline | head -1` (cokolwiek).
Dotyka tych samych plików co F? Nie. Dotyka `AtlasMap.tsx` (jedna linia rejestracji) – jeśli H2 jest już scalone, zrób `git merge origin/main` przed edycją; A idzie PRZED H2 albo po F, nie równolegle z H2–F.
