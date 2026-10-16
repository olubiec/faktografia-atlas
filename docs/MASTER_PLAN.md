# MASTER PLAN — Faktografia Atlas (v1, 2026-10-16)

Źródło prawdy dla Gema #2 i agenta Jules. Powstał z raportu Gema #1 (research) i poprawek Claude'a
(dyrektor kreatywny). Gdzie raport Gema #1 i ten plik się różnią, obowiązuje ten plik.
Paczki npm i repozytoria referencyjne poniżej zostały sprawdzone 2026-10-16 (istnieją, licencje OK).
Zmiany w tym pliku wprowadza tylko właściciel.

---

## 1. PRODUKT

Publiczna strona z interaktywną mapą Polski: województwo > powiat > gmina > miejscowość. Kliknięcie
lub wyszukanie miejsca pokazuje jego profil ("Fiszka") z danymi GUS, a mapa koloruje się wybranym
wskaźnikiem. Marka Faktografia prowadzi IG/TikTok z karuzelami na danych publicznych. Strona daje
tematy (zbiorcze statystyki wyszukiwań), a w CC12+ lokalny, niepubliczny generator karuzel z tych
samych komponentów. Odbiorca: dorosły internauta w Polsce, głównie na telefonie.
Właściciel nie jest programistą. Kod pisze Jules w sesjach CC1..CCn; jedna sesja = jeden PR.

## 2. ZAKRES

- **Teraz:** mapa 3 poziomów + wyszukiwarka miejscowości; katalog ok. 20 wskaźników GUS BDL z nocną
  aktualizacją; Fiszka; kartogram (kolor + kreskowanie) + suwak lat + porównanie 2–3 miejsc;
  sygnatury designu S1–S7; tryb 3D "Arkusze"; statystyki wyszukiwań po zgodzie; generator karuzel
  tylko lokalnie (7 szablonów).
- **Później:** dane miesięczne (GUS DBW), dane na żywo (GIOŚ/IMGW/NBP), wybory PKW, podstrony SEO
  gmin, auto-publikacja IG, baza danych.
- **Nigdy:** konta użytkowników, generator w internecie, Google Maps jako mapa główna, pobieranie
  całego BDL, liczby wpisywane przez AI, śledzenie osób (IP, fingerprint), kopiowanie starego
  generatora.

## 3. DESIGN — "ROCZNIK, KTÓRY OŻYŁ"

Drukowany polski rocznik statystyczny i atlas narodowy z połowy XX w., przeniesiony do przeglądarki
i ożywiony. Druk 2–3 farbami na ciepłym papierze, kreskowanie zamiast gradientów, przypisy, numery
katalogowe, rygorystyczna siatka. Nowoczesność = ruch, precyzja, płynność.

**Uwaga do raportu Gema #1:** to NIE jest "analityczny brutalizm" i nie ma "świetlistych krawędzi".
Inspiracje (Du Bois, Isotype, roczniki GUS) dotyczą płaskich farb, siatki i kreskowania. Tryb 3D
istnieje (S3), ale tylko na żądanie użytkownika, domyślnie mapa jest płaska.

### 3.1 Paleta (startowe wartości w config/tokens.json, strojone w panelu ?tune)

| Token | Jasny "papier" | Ciemny "odbitka nocna" |
|---|---|---|
| paper | #F3ECDD | #1C1510 |
| paper-raised | #FBF7EE | #2A2018 |
| rule | #D8CBB0 | #4A3B2C |
| ink | #241C15 | #EFE6D3 |
| ink-muted | #6B5D4A | #B8A98F |
| spot-teal (farba danych) | #00838A | #3FB5B9 |
| spot-terracotta (akcent) | #C1440E | #E8763F |

- Skala sekwencyjna: 5 klas w teal (od paper do spot-teal ciemniejszego o 25%).
- Skala dywergentna: teal <-> paper <-> terracotta.
- Drugi kanał danych: gęstość kreskowania (klasa 1 = brak, klasa 5 = gęste). Kolor i kreska razem.
- Brak danych: paper + kropkowanie w kolorze rule.
- Farby nakładają się jak w druku (mix-blend-mode: multiply w trybie jasnym).

### 3.2 Typografia (self-hosted, zero zapytań do Google)

- Nagłówki i duże liczby: **Bona Nova** (`@fontsource/bona-nova`, OFL). Rewitalizacja kroju Bona
  Andrzeja Heidricha, projektanta polskich banknotów.
- Interfejs: **Schibsted Grotesk** (`@fontsource/schibsted-grotesk`, OFL).
- Metadane, TERYT, przypisy: **IBM Plex Mono** (`@fontsource/ibm-plex-mono`, OFL), tabular-nums.

### 3.3 Sygnatury i jak je zbudować

| # | Nazwa | Co widzi użytkownik | Jak (technicznie) | Sesja |
|---|---|---|---|---|
| S1 | Druk w trzech przebiegach | Przy pierwszym wejściu mapa składa się z 3 "farb" z lekkim niespasowaniem, które wskakuje w pasery (< 1,2 s) | 3 instancje GeoJsonLayer (ink-kontur, teal-wypełnienie, terracotta-akcent) z `modelMatrix` przesuniętym o kilka px; przesunięcie animowane do 0 przez `motion` (animate/useMotionValue). Raz na sesję (sessionStorage). Brak przy reduced-motion. Bez sprężyn: krzywa ease-out | CC9 |
| S2 | Kreskowanie | Kartogram = kolor + kreski pod 45° o gęstości zależnej od klasy | `@deck.gl/extensions` FillStyleExtension z `{pattern: true, proceduralPattern: true}` (wzór: deck.gl `modules/extensions/src/fill-style/procedural-pattern.ts`) | CC8 |
| S3 | Arkusze | Tryb 3D: gminy unoszą się jak ułożone arkusze papieru, matowe boki, jaśniejsza górna krawędź | GeoJsonLayer `extruded: true`, `getElevation` z wartości, `material` matowy, LightingEffect (AmbientLight + DirectionalLight); podkład wygaszony do gładkiego papieru (bez etykiet i dróg) | CC10 |
| S4 | Fiszka | Profil jak karta katalogowa: nr katalogowy = TERYT, pieczątka "STAN NA <rok>", metadane w mono, przypisy na dole | Komponent React; układ wzorowany na Census Reporter (patrz sekcja 8) | CC7 |
| S5 | Licznik | Liczby przewijają się jak w liczniku mechanicznym | `@number-flow/react` | CC7 |
| S6 | Przypisy | Numerowane indeksy górne przy liczbach, na desktopie notki na marginesie | Komponent Footnote + lista źródeł | CC2 |
| S7 | Faktura | Bardzo subtelne ziarno papieru | `@paper-design/shaders-react` (grain/paper texture), opacity ≤ 0,06; wyłączone przy reduced-motion i na słabych urządzeniach | CC2 |

### 3.4 Zakazy anty-"AI slop" (twarde)

Gradienty fioletowo-niebieskie; glassmorphism i rozmycia; bloby w tle; emoji jako ikony; domyślny
wygląd shadcn / Tailwind UI; fonty Inter, Geist, Space Grotesk, Roboto; zaokrąglone karty z cieniem
wszędzie (promień max 2 px); neony i poświaty; ikony "sparkles"; hasła marketingowe ("Odkryj moc
danych!"). Zamiast tego: cienkie linie 1 px w kolorze rule, siatka 8 px, numeracja sekcji (§ 1, § 2),
prawdziwe dane jako dekoracja.

### 3.5 Ruch

- Czasy 150–400 ms, ease-out "druku" (szybki start, miękkie lądowanie). Zero sprężyn i odbić.
- Zmiana poziomu mapy: lot kamery (`fitBounds`, 800 ms) + przenikanie warstw.
- Zmiana wskaźnika/roku: interpolacja kolorów kartogramu (deck.gl `transitions`), legenda liczy się licznikiem.
- Mobile first: dolny arkusz z Fiszką (react-modal-sheet), mapa widoczna nad nim (snap: 40% / 90%).
- `prefers-reduced-motion`: wszystkie animacje skracane do 0 ms, S1 i S7 wyłączone.

### 3.6 Panel strojenia `?tune`

Tweakpane v4 widoczny tylko z parametrem `?tune` w URL (w podglądach Vercel też). Suwaki: wszystkie
tokeny kolorów, czasy animacji, kamera 3D, siła faktury. Przycisk "Kopiuj JSON" kopiuje komplet
wartości w formacie config/tokens.json. Właściciel wkleja ten JSON w uwagach do kolejnej sesji.

### 3.7 Logo

Wordmark Faktografia w SVG: `legacy/marka/` (właściciel dodaje ręcznie). Jeśli pliku nie ma,
nagłówek pokazuje słowo "Faktografia" złożone krojem Bona Nova i zostawia TODO w STAN_PROJEKTU.md.

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
│   ├── tokens.mjs, shots.mjs, handoff.mjs
├── src/
│   ├── core/                 bdl/, geo/, scale/, search/, format/
│   ├── view/
│   │   ├── map/              MapView.tsx, layers/, Legend.tsx, Breadcrumbs.tsx
│   │   ├── fiszka/           Fiszka.tsx, KpiRow.tsx, Sparkline.tsx, Stamp.tsx
│   │   ├── search/           SearchPalette.tsx
│   │   ├── ui/               Footnote.tsx, PaperTexture.tsx, Sheet.tsx, primitives/
│   │   └── tune/             TunePanel.tsx
│   ├── styles/               tokens.css, global.css
│   ├── App.tsx, main.tsx
├── tests/e2e/                Playwright
├── docs/                     MASTER_PLAN.md, sessions/, shots/, data-report.md
├── legacy/                   tylko odczyt
├── AGENTS.md, STAN_PROJEKTU.md, GEMINI_HANDOFF.md
```

### 5.1 Skrypty obowiązkowe (powstają w CC1)

- `pnpm verify` = `eslint` + `tsc --noEmit` + `vitest run` + `vite build` + `pnpm shots`.
- `pnpm shots` = Playwright otwiera zbudowaną stronę (`vite preview`) i zapisuje zrzuty do
  `docs/shots/` (NADPISUJE poprzednie, bez podfolderów per sesja, format JPEG jakość 80):
  `desktop-light.jpg`, `desktop-dark.jpg`, `mobile-light.jpg`, `mobile-dark.jpg`
  (1440×900 i 390×844) + dodatkowe widoki zdefiniowane w `scripts/shots.config.json`.
  Historia wyglądu = historia PR. Bez Git LFS.
- `pnpm handoff` generuje `GEMINI_HANDOFF.md`: data, ostatnia sesja ze STAN_PROJEKTU.md, drzewo
  (bez node_modules/dist/.git/legacy), zależności z package.json, lista eksportów z każdego pliku
  w src/ (nazwa + sygnatura, przez TypeScript compiler API), wynik ostatniego `vitest run`, lista
  plików w public/data z rozmiarami.

---

## 6. KATALOG PODZESPOŁÓW (paczki npm, zweryfikowane 2026-10-16)

| Obszar | Paczka npm | Wersja (ok.) | Licencja | Sesja |
|---|---|---|---|---|
| Rdzeń | react, react-dom, vite, typescript | najnowsze stabilne | MIT | CC1 |
| Routing | react-router | 8.x | MIT | CC1 |
| Style | tailwindcss, @tailwindcss/vite | 4.x | MIT | CC1 |
| Fonty | @fontsource/bona-nova, @fontsource/schibsted-grotesk, @fontsource/ibm-plex-mono | 5.x | OFL-1.1 | CC1 |
| Testy | vitest, @playwright/test, @axe-core/playwright (dostępność, tylko dev) | najnowsze | MIT / Apache / MPL (dev) | CC1/CC2 |
| Prymitywy UI | @radix-ui/react-dialog, -tooltip, -tabs, -toggle-group, -slider, -popover | najnowsze | MIT | CC2 |
| Strojenie | tweakpane | 4.x | MIT | CC2 |
| Faktura | @paper-design/shaders-react | 0.0.x (młoda paczka, przypiąć wersję) | Apache-2.0 | CC2 |
| Mapa | maplibre-gl, react-map-gl (import z `react-map-gl/maplibre`) | 6.x / 8.x | BSD-3 / MIT | CC4 |
| Warstwy | @deck.gl/core, @deck.gl/layers, @deck.gl/mapbox, @deck.gl/extensions | 9.x | MIT | CC4, CC8, CC10 |
| Geometria | topojson-client (strona), mapshaper + topojson-server (tylko skrypty) | — | ISC / MPL-2.0 | CC3 |
| Podkład | OpenFreeMap, styl positron: `https://tiles.openfreemap.org/styles/positron` | — | dane OSM (ODbL), atrybucja na mapie | CC4 |
| Wyszukiwarka | cmdk, minisearch | 1.x / 7.x | MIT | CC5 |
| Stan URL | nuqs | 2.x | MIT | CC4 |
| Ruch | motion | najnowsza | MIT | CC2+ |
| Liczby | @number-flow/react | 0.6.x | MIT | CC7 |
| Wykresy | @observablehq/plot | 0.6.x | ISC | CC7 |
| Skale | d3-scale, d3-array | 4.x / 3.x | ISC | CC8 |
| Dolny arkusz | react-modal-sheet | 5.x | MIT | CC7 |
| Dane | zod, p-throttle | 4.x / 8.x | MIT | CC6 |
| Statystyki | posthog-js (region EU, ładowany dopiero po zgodzie) | 1.x | Apache-2.0/MIT | CC11 |

Zmiana względem raportu Gema #1: `bottleneck` zastąpiony `p-throttle` (bottleneck nie był
wydawany od 2019).

---

## 7. REPOZYTORIA REFERENCYJNE (ścieżki sprawdzone 2026-10-16)

Klonuj tylko do `/tmp/ref/<nazwa>` (`git clone --depth 1 <URL> /tmp/ref/<nazwa>`), nigdy do repo.
Ścieżki mogą się przesunąć: jeśli pliku nie ma, znajdź go `git ls-files | grep -i <fraza>`.

| Repo | Pliki | Co bierzemy | Sesja |
|---|---|---|---|
| https://github.com/visgl/react-map-gl | `examples/maplibre/deckgl-overlay/`, `examples/maplibre/zoom-to-bounds/`, `examples/maplibre/geojson/`, `examples/maplibre/interaction/` | Połączenie MapLibre + deck.gl (MapboxOverlay przez `useControl`), lot do bbox, hover i klik | CC4 |
| https://github.com/visgl/deck.gl | `examples/get-started/react/maplibre/`, `examples/website/geojson/app.tsx`, `modules/extensions/src/fill-style/procedural-pattern.ts`, `docs/api-reference/extensions/fill-style-extension.md`, `docs/api-reference/core/lighting-effect.md` | Integracja React+MapLibre, wytłoczone poligony z oświetleniem (S3), kreskowanie proceduralne (S2) | CC4, CC8, CC10 |
| https://github.com/owid/owid-grapher | `packages/@ourworldindata/grapher/src/color/BinningStrategies.ts`, `ColorScale.ts`, `ColorScaleBin.ts` | Strategie podziału na klasy (kwantyle, równe przedziały), obsługa braków danych w legendzie. Przepisujemy własną, małą wersję w `src/core/scale/` (nie kopiujemy całego modułu; zachowaj atrybucję MIT) | CC8 |
| https://github.com/censusreporter/censusreporter | `censusreporter/apps/census/templates/profile/profile_detail.html`, `_blocks/_stat_list.html`, `_blocks/_comparative_list_item.html` | Hierarchia profilu miejsca: główna liczba, porównanie z jednostką nadrzędną i krajem obok każdej liczby | CC7 |
| https://github.com/statisticspoland/R_Package_to_API_BDL | pliki R z wywołaniami endpointów (grep `by-variable`, `unit-level`) | Wzór parametrów API BDL. Nie ufamy numerom issues z raportu Gema #1 (niezweryfikowane) | CC6 |
| https://github.com/paper-design/shaders | README i katalog pakietu react | Parametry shaderów grain/paper texture | CC2 |

## 8. INSPIRACJE WIZUALNE (tylko do oglądania, nie do kodu)

- Du Bois, Paryż 1900: https://www.loc.gov/collections/african-american-photographs-1900-paris-exposition/
- Isotype: https://isotyperevisited.org/2012/08/knowledge-for-young-people.php
- Polskie roczniki statystyczne i atlasy (domena publiczna): polona.pl, hasła "Rocznik statystyczny",
  "Atlas Polski". Właściciel może dorzucić 5–10 linków do `docs/references.md`.

---

## 9. SESJE

Każda sesja kończy się: zielonym `pnpm verify`, nowymi zrzutami w `docs/shots/`, `pnpm handoff`,
dopiskiem w STAN_PROJEKTU.md, plikiem `docs/sessions/CCx.md` z treścią zadania i PR po polsku.

### CC1 — Szkielet i narzędzia
- **Efekt:** strona z papierowym tłem, logo (lub wordmarkiem) i próbnikiem trzech krojów; działają testy i zrzuty.
- **Paczki:** react, react-dom, vite, typescript, react-router, tailwindcss, @tailwindcss/vite, 3× @fontsource, vitest, @playwright/test, eslint.
- **Warunki odbioru:**
  - [ ] `pnpm verify` przechodzi lokalnie i w `ci.yml` (GitHub Actions).
  - [ ] `config/tokens.json` z paletą z sekcji 3.1 -> `src/styles/tokens.css` przez `scripts/tokens.mjs`.
  - [ ] Test Playwright potwierdza zero zapytań do fonts.googleapis.com i fonts.gstatic.com.
  - [ ] 4 zrzuty w `docs/shots/`, tryb ciemny przez `prefers-color-scheme` i przełącznik.
  - [ ] `GEMINI_HANDOFF.md` wygenerowany skryptem, zawiera eksporty z src/.
  - [ ] `vercel.json` z rewrite wszystkich ścieżek do `/index.html` (SPA).

### CC2 — System wizualny
- **Efekt:** strona `/design`: kolory, skala typograficzna, przyciski, zakładki, dymek, okno, suwak, przypisy (S6), faktura papieru (S7); panel `?tune`.
- **Paczki:** @radix-ui/react-*, tweakpane, @paper-design/shaders-react, motion, @axe-core/playwright.
- **Warunki odbioru:**
  - [ ] Każdy komponent ostylowany tylko tokenami; zero zaokrągleń > 2 px, zero cieni rozmytych.
  - [ ] `?tune` zmienia kolory na żywo, "Kopiuj JSON" daje poprawny tokens.json.
  - [ ] Test axe: brak naruszeń kontrastu WCAG AA na `/design` w obu trybach.
  - [ ] Faktura wyłączona przy `prefers-reduced-motion` (test).
  - [ ] Zrzuty `/design` desktop i mobile.

### CC3 — Geometria i jednostki
- **Efekt:** w PR raport liczności i rozmiaru plików; podgląd SVG Polski z granicami gmin w `docs/shots/geo-preview.png`.
- **Paczki:** mapshaper, topojson-server (dev), topojson-client.
- **Warunki odbioru:**
  - [ ] `public/geo/admin.topo.json` ≤ 3 MB, warstwy woj/pow/gmi.
  - [ ] `public/data/units.json`: 16 / 380 / 2479 jednostek, TERYT jako string długości 2 / 4 / 7.
  - [ ] Każdy powiat ma rodzica-województwo, każda gmina rodzica-powiat (test).
  - [ ] `bdlId` na razie `null` (uzupełnia CC6).

### CC4 — Mapa 2D
- **Efekt:** klikalna mapa: Polska -> województwo -> powiaty -> gminy, lot kamery, okruszki, link do jednostki.
- **Paczki:** maplibre-gl, react-map-gl, @deck.gl/core, @deck.gl/layers, @deck.gl/mapbox, nuqs.
- **Referencje:** react-map-gl `examples/maplibre/deckgl-overlay`, `zoom-to-bounds`; deck.gl `examples/get-started/react/maplibre`.
- **Warunki odbioru:**
  - [ ] Styl positron pobrany i przekształcony skryptem do `config/map-style.json`: kolory z tokenów, bez POI, drogi tylko główne i bardzo jasne, etykiety miast w Schibsted Grotesk (jeśli glify niedostępne: domyślne glify, TODO).
  - [ ] Hover podświetla jednostkę, klik schodzi poziom niżej (`fitBounds`), przycisk "poziom wyżej".
  - [ ] `?u=1465011` otwiera mapę na Warszawie (test e2e).
  - [ ] Zrzuty: Polska, mazowieckie, powiat tatrzański.

### CC5 — Wyszukiwarka
- **Efekt:** Ctrl+K lub pole w nagłówku; "zakopane", "lodz", "bialystok" znajdują właściwe miejsca; wybór = lot mapy.
- **Paczki:** cmdk, minisearch.
- **Warunki odbioru:**
  - [ ] `public/data/localities.json` z SIMC + PRNG (lub instrukcja dla właściciela, jeśli plik trzeba pobrać ręcznie).
  - [ ] Indeks MiniSearch budowany skryptem do pliku (nie w przeglądarce przy starcie).
  - [ ] Ignoruje polskie znaki i wielkość liter, toleruje 1 literówkę (testy core).
  - [ ] Ładowanie indeksu dopiero po otwarciu wyszukiwarki (lazy).

### CC6 — Dane GUS i robot
- **Efekt:** `docs/data-report.md` z tabelą wskaźników (var-id, nazwa BDL, poziomy, lata) do akceptacji; pliki wartości w `public/data/values/`; zielony robot w Actions.
- **Paczki:** zod, p-throttle.
- **Warunki odbioru:**
  - [ ] `src/core/bdl/` klient z walidacją zod i limitem zapytań (testy na nagranych odpowiedziach, bez sieci).
  - [ ] `scripts/data/discover.mjs` proponuje var-id dla 20 wskaźników z sekcji 4.2; niepewne oznaczone.
  - [ ] Mapowanie BDL id <-> TERYT uzupełnia `units.json`; rozbieżności wypisane w raporcie.
  - [ ] Dla 3 jednostek raport podaje wartości do ręcznego sprawdzenia na bdl.stat.gov.pl.
  - [ ] `nightly-data.yml` działa (uruchomienie ręczne przez workflow_dispatch zakończone sukcesem).
- **STOP:** po tej sesji właściciel wysyła raport Claude'owi przed CC7.

### CC7 — Fiszka
- **Efekt:** klik w gminę: karta katalogowa z liczbami (licznik), mini-wykresami i przypisami; na telefonie dolny arkusz.
- **Paczki:** @number-flow/react, @observablehq/plot, react-modal-sheet.
- **Referencje:** censusreporter `profile_detail.html`, `_stat_list.html`.
- **Warunki odbioru:**
  - [ ] Nagłówek: nazwa, typ, TERYT jako numer katalogowy, pieczątka "STAN NA <rok>".
  - [ ] Każda liczba: wartość, zmiana r/r, porównanie z województwem i Polską, przypis źródła.
  - [ ] Dane z wyższego poziomu oznaczone ("dane dla powiatu X").
  - [ ] Miejscowość pokazuje Fiszkę gminy z dopiskiem.
  - [ ] Zrzuty: gmina miejska, gmina wiejska, mobile z arkuszem.

### CC8 — Kartogram
- **Efekt:** wybór wskaźnika koloruje i kreskuje mapę; legenda; suwak lat z odtwarzaniem; porównanie 2–3 jednostek.
- **Paczki:** @deck.gl/extensions, d3-scale, d3-array.
- **Referencje:** deck.gl `procedural-pattern.ts`; owid `BinningStrategies.ts`, `ColorScale.ts`.
- **Warunki odbioru:**
  - [ ] 5 klas kwantylowych liczone w `src/core/scale/` (testy), kolor + gęstość kreskowania wg klasy.
  - [ ] Brak danych = osobny wzór i pozycja w legendzie.
  - [ ] Płynna zmiana kolorów przy zmianie roku (deck.gl transitions, 300 ms).
  - [ ] Zrzuty: 2 różne wskaźniki, legenda, porównanie.

### CC9 — Ruch i S1
- **Efekt:** "druk w trzech przebiegach" przy pierwszym wejściu; dopracowane przejścia poziomów i panelu.
- **Paczki:** motion (już jest).
- **Warunki odbioru:**
  - [ ] S1 zgodnie z sekcją 3.3, < 1,2 s, raz na sesję, brak przy reduced-motion.
  - [ ] Nagranie wideo Playwright (`docs/shots/s1.webm`) z wejścia na stronę.

### CC10 — Tryb 3D "Arkusze"
- **Efekt:** przełącznik "3D": gminy unoszą się proporcjonalnie do wartości wskaźnika, matowy papier, światło z góry-lewej.
- **Referencje:** deck.gl `examples/website/geojson/app.tsx`, `lighting-effect.md`.
- **Warunki odbioru:**
  - [ ] Przejście 2D <-> 3D animowane (pitch 0 -> 50°, 800 ms), etykiety podkładu wygaszone w 3D.
  - [ ] Domyślnie wyłączone, gdy `navigator.hardwareConcurrency < 4` lub reduced-motion.
  - [ ] Zrzuty 3D desktop i mobile.

### CC11 — Statystyki, prywatność, szlif
- **Efekt:** baner zgody, strona `/prywatnosc`, zdarzenia w PostHog po zgodzie; szybsza strona.
- **Paczki:** posthog-js.
- **Warunki odbioru:**
  - [ ] PostHog ładowany dynamicznie dopiero po kliknięciu "zgoda"; bez autocapture i nagrywania sesji.
  - [ ] Zdarzenia: `search` (tekst ≤ 64 znaki), `select_unit` (teryt), `select_indicator`, `compare`.
  - [ ] Lighthouse mobile ≥ 90 (wydajność, dostępność); deck.gl ładowany leniwie.
  - [ ] Test axe bez naruszeń na stronie głównej.

### CC12+ — Generator karuzel (tylko lokalnie)
- **Efekt:** `/studio` działa tylko w `pnpm dev` (w buildzie produkcyjnym nie istnieje); 7 szablonów: okładka, duża liczba, mapa, ranking, trend, porównanie, źródło; `pnpm karuzela` zapisuje PNG 1080×1350 i 1080×1920.
- **Warunki odbioru:**
  - [ ] Build produkcyjny nie zawiera kodu studio (test: brak frazy "studio" w dist/assets).
  - [ ] Eksport odmawia zapisu slajdu, na którym jakikolwiek tekst wystaje poza swoje pole lub strefę bezpieczną, i wypisuje, co poprawić.
  - [ ] Przykładowa karuzela z prawdziwymi danymi w `docs/shots/karuzela-przyklad/`.
