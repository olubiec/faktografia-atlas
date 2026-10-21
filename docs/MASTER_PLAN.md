# MASTER PLAN — Faktografia Atlas (v3, 2026-10-17: małe zadania i praca równoległa)

Plan produktu dla agentów (Jules) i Planisty. Gdzie jesteśmy: docs/STAN.md; lista zadań i ich kolejność: docs/PLAN.md.
Paczki npm i repozytoria referencyjne poniżej zostały sprawdzone 2026-10-16 (istnieją, licencje OK).
Zmiany w tym pliku wprowadza tylko właściciel (przez PR przygotowany przez Claude).

---

## 0. SPOSÓB PRACY (WORKFLOW v5, 21.10.2026)

- **Zadania są małe:** sesja dzieli się na 3–6 promptów dla Julesa; jeden prompt = jeden PR. Kolejność i równoległość podaje Planista na początku sesji; plan sesji: docs/PLAN.md.
- **Prompty pisze Planista** (Claude albo Gemini). Właściciel wkleja je do Julesa, ogląda podgląd i scala PR. Zasady pracy agenta: AGENTS.md; opis całego procesu: WORKFLOW v5 (wiedza projektu Claude i Gema).
- **„Gotowe” = testy:** każdy warunek „Gotowe, gdy” ma test napisany przed kodem; CI musi być zielone.
- **Bramka w CI:** lint, typy, testy, e2e, skan sekretów (gitleaks), audyt paczek, Dependabot. Ryzykowne PR (⚠️) przegląda Claude przed scaleniem (`TRYB: RYZYKO`).
- **Wygląd:** makiety w docs/design/ są wzorcem; zadania z UI mają warunek „zgodne z makietą”.
  Zrzuty pikselowe tylko dla DOM/SVG; mapę WebGL sprawdzamy przez stan `window.__atlas`.
- **Dane GUS** pobiera wyłącznie robot w GitHub Actions; strona czyta tylko pliki z public/data.
- **Gotowce zamiast pisania od zera:** paczki z §6, komponenty shadcn/ui przerobione na nasz styl,
  wzorce z repozytoriów z §7.
- Poprawki do PR: komentarz do Julesa w PR. Konflikt po scaleniu innego PR: aktualizacja gałęzi tylko przez `git merge origin/main`.

---

## 1. PRODUKT

Publiczna strona z interaktywną mapą Polski: województwo > powiat > gmina > miejscowość. Kliknięcie
lub wyszukanie miejsca pokazuje jego profil ("Fiszka") z danymi GUS, a mapa koloruje się wybranym
wskaźnikiem. Marka Faktografia prowadzi IG/TikTok z karuzelami na danych publicznych. Strona daje
tematy (zbiorcze statystyki wyszukiwań), a w CC12+ lokalny, niepubliczny generator karuzel z tych
samych komponentów. Odbiorca: dorosły internauta w Polsce, głównie na telefonie.
Właściciel nie jest programistą. Kod pisze Jules w małych zadaniach (docs/PLAN.md); jedno zadanie = jeden PR.

## 2. ZAKRES

- **Teraz:** mapa 3 poziomów + wyszukiwarka miejscowości; katalog ok. 20 wskaźników GUS BDL z nocną
  aktualizacją; Fiszka; kartogram (kolor + kreskowanie) + suwak lat + porównanie 2–3 miejsc;
  system stylu "Kalka i korekta" (docs/STYL.md); tryb 3D "Arkusze"; statystyki wyszukiwań po zgodzie; generator karuzel
  tylko lokalnie (7 szablonów).
- **Później:** dane miesięczne (GUS DBW), dane na żywo (GIOŚ/IMGW/NBP), wybory PKW, podstrony SEO
  gmin, auto-publikacja IG, baza danych.
- **Nigdy:** konta użytkowników, generator w internecie, Google Maps jako mapa główna, pobieranie
  całego BDL, liczby wpisywane przez AI, śledzenie osób (IP, fingerprint), kopiowanie starego
  generatora.

## 3. DESIGN — "KALKA I KOREKTA" (obowiązuje docs/STYL.md)

**Cały system stylu jest w `docs/STYL.md`, a wartości w `config/tokens.json`.** Ta sekcja to tylko skrót.
Dawny koncept "Rocznik, który ożył" (kremowy papier, terakota, Bona Nova, faktura, druk w trzech
przebiegach) jest ANULOWANY.

- Idea: kalka kreślarska na mapie Polski. Dane i granice granatowym tuszem, jedyny akcent to czerwony
  długopis korektora, który zakreśla najważniejszą rzecz (najwyżej jedna rzecz na ekranie).
- Kolory: kalka #EEF1EF, arkusz #F8FAF9, linia #C5CDD3, tusz #15233F, ołówek #4D5B72, korekta #E3242B,
  ochra #C77700 (tylko skala dywergentna). Tryb ciemny: "negatyw kalki" (#0F1A30). Szczegóły w STYL.md.
- Krój: Atkinson Hyperlegible Next (tekst i nagłówki), Atkinson Hyperlegible Mono (tylko kolumny liczb).
  Jedyny szeryf w marce to litera F w znaku.
- Logo: pliki w `public/brand/` (logo granat/jasne, favicon, znak F na zarysach granic granat/jasny).
- Ręczne zakreślenia: rough-notation (tekst) i rough.js (owal wokół jednostki na mapie).
- Ruch "kreślenie": przy wejściu kontur Polski rysuje się tuszem (1,2 s), potem wypełnienie, potem
  zakreślenie wybranego miejsca. Dalej ruch tylko w odpowiedzi na działania. Bez sprężyn.
- Ikony: iconoir-react, linia 1,5 px.
- Mapa bez podkładu ulic: sama kalka z granicami z TopoJSON; podkład OpenFreeMap tylko przy dużym
  przybliżeniu, bardzo blady.
- Radius 0, bez cieni, bez gradientów, bez szkła. Lista kontrolna "Nie robimy" w STYL.md, sekcja 12.
- Panel `?tune` (Tweakpane) zostaje: suwaki tokenów z config/tokens.json + "Kopiuj JSON".

---

## 4. DANE

### 4.1 GUS BDL

- API: `https://bdl.stat.gov.pl/api/v1`, nagłówek `X-ClientId: $BDL_CLIENT_ID`, `format=json`,
  `lang=pl`, `page-size=100` (maksimum).
- Limity z kluczem: 10/s, 500/15 min, 5000/12 h. Klient: kolejka `p-throttle` (limit 8/s) +
  ponawianie przy HTTP 429 i 5xx (wykładniczo, maks. 5 prób) + licznik zapytań w logu.
- Pobieramy przez `data/by-variable/{varId}?unit-level=N&year=...` (całe poziomy naraz,
  stronicowanie), a NIE jednostka po jednostce.
- Bez klucza (anonimowo) limity są 2× niższe: wystarczają do developmentu.
- Licencja danych: CC BY 4.0. Atrybucja przy każdej liczbie: "Źródło: GUS, BDL, <rok>".

### 4.2 Katalog wskaźników (config/indicators.json)

**Raport Gema #1 nie podał zweryfikowanych var-id** (same "prawdopodobne" numery). Dlatego w CC6
Jules pisze skrypt `scripts/data/discover.mjs`, który przeszukuje `/subjects` i `/variables`
(parametr `name`) i proponuje var-id. Wynik trafia do `docs/data-report.md` do akceptacji
właściciela (z Claude). Do tego czasu żaden var-id nie jest "prawdziwy".

Lista docelowa (nazwa robocza | oczekiwany najniższy poziom | kierunek):

| Grupa | Wskaźnik | Poziom | Więcej = lepiej? |
|---|---|---|---|
| Ludność | Ludność ogółem | gmina | neutralny |
| Ludność | Gęstość zaludnienia (os./km²) | gmina | neutralny |
| Ludność | Przyrost naturalny na 1000 ludności | gmina | tak |
| Ludność | Saldo migracji na 1000 ludności | gmina | tak |
| Ludność | Udział ludności 65+ (%) | gmina | neutralny |
| Ludność | Mediana wieku | gmina (jeśli brak: powiat) | neutralny |
| Praca | Stopa bezrobocia rejestrowanego (%) | powiat | nie |
| Praca | Udział bezrobotnych w ludności w wieku produkcyjnym (%) | gmina | nie |
| Pieniądze | Przeciętne wynagrodzenie brutto (zł) | powiat | tak |
| Pieniądze | Dochody budżetu gminy na mieszkańca (zł) | gmina | tak |
| Pieniądze | Wydatki budżetu gminy na mieszkańca (zł) | gmina | neutralny |
| Pieniądze | Podmioty REGON na 10 tys. ludności | gmina | tak |
| Mieszkania | Mieszkania oddane do użytku na 1000 ludności | gmina | tak |
| Mieszkania | Przeciętna pow. użytkowa mieszkania na osobę (m²) | gmina | tak |
| Środowisko | Lesistość (%) | gmina | tak |
| Środowisko | Ludność korzystająca z kanalizacji (%) | gmina | tak |
| Życie | Wychowanie przedszkolne, dzieci 3–6 lat (%) | gmina | tak |
| Życie | Czytelnicy bibliotek publicznych na 1000 ludności | gmina | tak |
| Życie | Noclegi udzielone turystom na 1000 ludności | gmina | neutralny |
| Transport | Samochody osobowe na 1000 ludności | powiat | neutralny |

Zasady: przy wartości z poziomu wyższego niż wybrana jednostka Fiszka pisze "dane dla powiatu X".
Przy wynagrodzeniach przypis: "bez firm do 9 pracowników". Przy samochodach: "rejestracje flot
leasingowych zawyżają niektóre miasta".

### 4.3 Geometria

- Źródło: `https://github.com/waszkiewiczja/GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy` (gałąź main;
  pliki `wojewodztwa.json` 0,8 MB, `powiaty.json` 4,6 MB, `gminy.json` 11,8 MB; pole `JPT_KOD_JE`
  = TERYT, `JPT_NAZWA_` = nazwa; licencja public domain, zweryfikowana).
- Pobranie przez raw.githubusercontent.com w skrypcie `scripts/geo/build.mjs`, uproszczenie
  `mapshaper` (CLI, licencja MPL-2.0: tylko narzędzie budowania, nie trafia do strony), wynik
  TopoJSON `public/geo/admin.topo.json` ≤ 3 MB, warstwy woj/pow/gmi, właściwości `{teryt, name}`.
- Skrypt uruchamiany ręcznie (raz na rok, po zmianach granic), wynik commitowany. Nie w buildzie.

### 4.4 Miejscowości

- Nazwy i przypisanie do gmin: rejestr TERYT SIMC (eTERYT, plik CSV). Współrzędne: API GUGiK PRNG
  (OGC API Features `https://ogcapi.geoportal.gov.pl/res/ims/maps/PRNG/apiFeatures`, kolekcja nazw RP).
- Oba źródła czyta jednorazowy skrypt `scripts/geo/localities.mjs` (z cache), wynik
  `public/data/localities.json` commitowany. Strona nigdy nie odpytuje tych API.
- Jeśli PRNG nie da punktu: miejscowość dostaje centroid gminy i flagę `approx: true`.
- Jeśli eTERYT wymaga ręcznego pobrania: Jules zatrzymuje się i podaje właścicielowi instrukcję
  krok po kroku, gdzie kliknąć i do jakiego folderu wrzucić plik.

### 4.5 Kontrakty plików (public/data, public/geo)

```ts
// public/data/units.json
type Unit = { teryt: string; bdlId: string | null; name: string;
  level: "woj" | "pow" | "gmi"; parent: string | null;
  bbox: [number, number, number, number]; centroid: [number, number] };

// public/data/indicators.json
type Indicator = { id: string; bdlVarId: number; name: string; unit: string;
  description: string; group: string; higherIsBetter: boolean | null;
  minLevel: "woj" | "pow" | "gmi"; footnote?: string };

// public/data/values/<indicatorId>.json
type IndicatorValues = { indicatorId: string; years: number[];
  values: Record<string /* teryt */, (number | null)[]>; fetchedAt: string /* ISO */ };

// public/data/localities.json
type Locality = { simc: string; name: string; gminaTeryt: string;
  lon: number; lat: number; approx?: boolean };
```

### 4.6 Robot nocny

`.github/workflows/nightly-data.yml`: cron `0 1 * * *` (ok. 3:00 w Polsce), `pnpm data:fetch`
z sekretem `BDL_CLIENT_ID`, commit tylko gdy pliki się zmieniły, e-mail przy błędzie (domyślne
powiadomienia GitHub). Vercel publikuje automatycznie po commicie.

---

## 5. ARCHITEKTURA

- **Stack:** Vite + React + TypeScript strict, pnpm, statyczne SPA, Vercel (podgląd każdego PR).
- **Routing:** `react-router` (tryb SPA: `/`, `/design`, w CC12 `/studio` tylko w dev).
- **Stan w URL:** `nuqs` (adapter react-router): `?u=<teryt>&i=<indicatorId>&y=<rok>&c=<teryt,teryt>`.
- **Style:** Tailwind CSS v4 (`@tailwindcss/vite`, konfiguracja w CSS przez `@theme`; bez
  tailwind.config.js). Tokeny: `config/tokens.json` -> skrypt `scripts/tokens.mjs` -> `src/styles/tokens.css`.
- **core / view:** `src/core` czysta logika bez DOM (testy Vitest); `src/view` React.

```
faktografia-atlas/
├── .github/workflows/        ci.yml, nightly-data.yml
├── config/                   tokens.json, indicators.json, map-style.json
├── public/
│   ├── data/                 units.json, indicators.json, localities.json, values/*.json
│   └── geo/                  admin.topo.json
├── scripts/
│   ├── geo/                  build.mjs, localities.mjs
│   ├── data/                 discover.mjs, fetch.mjs
│   ├── tokens.mjs, shots.mjs
├── src/
│   ├── core/                 bdl/, geo/, scale/, search/, format/
│   ├── components/ui/        komponenty shadcn/ui przerobione na nasz styl
│   ├── view/
│   │   ├── map/              MapView.tsx, layers/, Legend.tsx, Breadcrumbs.tsx
│   │   ├── fiszka/           Fiszka.tsx, KpiRow.tsx, Sparkline.tsx
│   │   ├── search/           SearchPalette.tsx
│   │   ├── ui/               Footnote.tsx, PaperTexture.tsx, Sheet.tsx, primitives/
│   │   └── tune/             TunePanel.tsx
│   ├── styles/               tokens.css, global.css
│   ├── App.tsx, main.tsx
├── tests/e2e/                Playwright
├── docs/                     MASTER_PLAN.md, PLAN.md, prompty/, shots/, data-report.md
├── AGENTS.md, docs/STAN.md
```

### 5.1 Skrypty obowiązkowe (powstają w CC1)

- `pnpm verify` = lint (oxlint) + typecheck + `vitest run` + `vite build` + testy e2e (Playwright) + `pnpm shots`.
  W CI bez `shots`.
- `pnpm shots` = Playwright otwiera zbudowaną stronę (`vite preview`) i zapisuje zrzuty do
  `docs/shots/` (NADPISUJE poprzednie, bez podfolderów per sesja, format JPEG jakość 80):
  `desktop-light.jpg`, `desktop-dark.jpg`, `mobile-light.jpg`, `mobile-dark.jpg`
  (1440×900 i 390×844) + dodatkowe widoki zdefiniowane w `scripts/shots.config.json`.
  Historia wyglądu = historia PR. Bez Git LFS.
- (usunięte w WORKFLOW v3; skrypt `handoff` zlikwidowany, stan czytaj w docs/STAN.md) — dawniej `pnpm handoff` generował `GEMINI_HANDOFF.md`: data, ostatnia sesja ze STAN, drzewo
  (bez node_modules/dist/.git), zależności z package.json, lista eksportów z każdego pliku
  w src/ (nazwa + sygnatura, przez TypeScript compiler API), wynik ostatniego `vitest run`, lista
  plików w public/data z rozmiarami.

---

## 6. KATALOG PODZESPOŁÓW (paczki npm, zweryfikowane 2026-10-16)

| Obszar | Paczka npm | Wersja (ok.) | Licencja | Sesja |
|---|---|---|---|---|
| Rdzeń | react, react-dom, vite, typescript | najnowsze stabilne | MIT | CC1 |
| Routing | react-router | 8.x | MIT | CC1 |
| Style | tailwindcss, @tailwindcss/vite | 4.x | MIT | CC1 |
| Fonty | @fontsource/atkinson-hyperlegible-next, @fontsource/atkinson-hyperlegible-mono | 5.x | OFL-1.1 | CC1 |
| Testy | vitest, @playwright/test, @axe-core/playwright (dostępność, tylko dev) | najnowsze | MIT / Apache / MPL (dev) | CC1/CC2 |
| Prymitywy UI | @radix-ui/react-dialog, -tooltip, -tabs, -toggle-group, -slider, -popover | najnowsze | MIT | CC2 |
| Strojenie | tweakpane | 4.x | MIT | CC2 |
| Zakreślenia | rough-notation, roughjs | 0.5.x / 4.x | MIT | CC2 |
| Ikony | iconoir-react | 7.x | MIT | CC2 |
| Mapa | maplibre-gl, react-map-gl (import z `react-map-gl/maplibre`) | 6.x / 8.x | BSD-3 / MIT | CC4 |
| Warstwy | @deck.gl/core, @deck.gl/layers, @deck.gl/mapbox, @deck.gl/extensions | 9.x | MIT | CC4, CC8, CC10 |
| Geometria | topojson-client (strona), mapshaper + topojson-server (tylko skrypty) | — | ISC / MPL-2.0 | CC3 |
| Podkład | OpenFreeMap, styl positron: `https://tiles.openfreemap.org/styles/positron` | — | dane OSM (ODbL), atrybucja na mapie | CC4 |
| Wyszukiwarka | cmdk, minisearch | 1.x / 7.x | MIT | CC5 |
| Stan URL | nuqs | 2.x | MIT | CC4 |
| Ruch | motion | najnowsza | MIT | CC2+ |
| Wykresy | @observablehq/plot | 0.6.x | ISC | CC7 |
| Skale | d3-scale, d3-array | 4.x / 3.x | ISC | CC8 |
| Dolny arkusz | react-modal-sheet | 5.x | MIT | CC7 |
| Dane | zod, p-throttle | 4.x / 8.x | MIT | CC6 |
| Statystyki | posthog-js (region EU, ładowany dopiero po zgodzie) | 1.x | Apache-2.0/MIT | CC11 |
| Baza komponentów | shadcn/ui (kod kopiowany do repo przez CLI) + paczki instalowane przez init (class-variance-authority, clsx, tailwind-merge) | MIT | CC1.2 |

Zmiana względem raportu Gema #1: `bottleneck` zastąpiony `p-throttle` (bottleneck nie był
wydawany od 2019).

---

## 7. REPOZYTORIA REFERENCYJNE (ścieżki sprawdzone 2026-10-16)

Klonuj tylko do `/tmp/ref/<nazwa>` (`git clone --depth 1 <URL> /tmp/ref/<nazwa>`), nigdy do repo.
Ścieżki mogą się przesunąć: jeśli pliku nie ma, znajdź go `git ls-files | grep -i <fraza>`.

| Repo | Pliki | Co bierzemy | Sesja |
|---|---|---|---|
| https://github.com/visgl/react-map-gl | `examples/maplibre/deckgl-overlay/`, `examples/maplibre/zoom-to-bounds/`, `examples/maplibre/geojson/`, `examples/maplibre/interaction/` | Połączenie MapLibre + deck.gl (MapboxOverlay przez `useControl`), lot do bbox, hover i klik | CC4 |
| https://github.com/visgl/deck.gl | `examples/get-started/react/maplibre/`, `examples/website/geojson/app.tsx`, `modules/extensions/src/fill-style/procedural-pattern.ts`, `docs/api-reference/extensions/fill-style-extension.md`, `docs/api-reference/core/lighting-effect.md` | Integracja React+MapLibre, wytłoczone poligony z oświetleniem (tryb 3D), kreskowanie proceduralne (drugi kanał kartogramu) | CC4, CC8, CC10 |
| https://github.com/owid/owid-grapher | `packages/@ourworldindata/grapher/src/color/BinningStrategies.ts`, `ColorScale.ts`, `ColorScaleBin.ts` | Strategie podziału na klasy (kwantyle, równe przedziały), obsługa braków danych w legendzie. Przepisujemy własną, małą wersję w `src/core/scale/` (nie kopiujemy całego modułu; zachowaj atrybucję MIT) | CC8 |
| https://github.com/censusreporter/censusreporter | `censusreporter/apps/census/templates/profile/profile_detail.html`, `_blocks/_stat_list.html`, `_blocks/_comparative_list_item.html` | Hierarchia profilu miejsca: główna liczba, porównanie z jednostką nadrzędną i krajem obok każdej liczby | CC7 |
| https://github.com/statisticspoland/R_Package_to_API_BDL | pliki R z wywołaniami endpointów (grep `by-variable`, `unit-level`) | Wzór parametrów API BDL. Nie ufamy numerom issues z raportu Gema #1 (niezweryfikowane) | CC6 |

## 8. INSPIRACJE WIZUALNE (tylko do oglądania, nie do kodu)

- Du Bois, Paryż 1900: https://www.loc.gov/collections/african-american-photographs-1900-paris-exposition/
- Isotype: https://isotyperevisited.org/2012/08/knowledge-for-young-people.php
- Polskie roczniki statystyczne i atlasy (domena publiczna): polona.pl, hasła "Rocznik statystyczny",
  "Atlas Polski". Właściciel może dorzucić 5–10 linków do `docs/references.md`.

---

## 9. SESJE (szczegóły zadań: docs/PLAN.md)

| Sesja | Efekt dla użytkownika |
|---|---|
| CC1 | Szkielet, tokeny, bramka jakości i bezpieczeństwa |
| CC1.5 | Makiety 4 ekranów (wzorzec wyglądu), logo: w nagłówku samo F, F na powiatach w dużych rozmiarach |
| CC2 | Komponenty w stylu „Kalka i korekta”, ręczne zakreślenia, strona /design, panel ?tune |
| CC3 | Geometria województw, powiatów i gmin + logika jednostek |
| CC4 | Mapa 2D z przechodzeniem w głąb i adresem `?u=` |
| CC5 | Wyszukiwarka jednostek i miejscowości |
| CC6 | Dane GUS: klient, mapowanie, wybór wskaźników (przegląd Claude), pobieranie, nocny robot |
| CC7 | Profil miejsca (arkusz na komputerze i telefonie) |
| CC8 | Kartogram, legenda, suwak lat, porównanie |
| CC9 | Ruch „kreślenie” |
| CC10 | Tryb 3D „Arkusze” |
| CC11 | Zgoda i statystyki, prywatność, wydajność, dostępność — start |

Generator karuzel: osobne, prywatne repozytorium po starcie strony (nie w tym repo).
Przeglądy Claude: każdy PR, koniec każdej sesji, obowiązkowo po CC6.3 (wskaźniki) i przed startem.
