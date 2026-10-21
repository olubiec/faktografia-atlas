# Technika – dane, architektura, pakiety
Źródło prawdy o tym, **z czego** zbudowana jest strona. Co ma widzieć użytkownik: `docs/PRODUKT.md`. Wygląd: `docs/STYL.md`. Gdzie jesteśmy: `docs/STAN.md`.
Zmiany w tym pliku: tylko na prośbę właściciela (prompt od Planisty). Nowy pakiet = najpierw `TRYB: WYBÓR` (WORKFLOW v5.1 §3b), potem wpis w tabeli §3 i w „Decyzjach” w STAN.md.

---

## 1. Dane

### 1.1 GUS BDL (jedyne źródło liczb)
- API `https://bdl.stat.gov.pl/api/v1`, nagłówek `X-ClientId` z sekretu `BDL_CLIENT_ID` (tylko w GitHub Actions), `format=json`, `lang=pl`, `page-size=100`.
- Limity z kluczem: 10/s, 500/15 min, 5000/12 h. Klient: kolejka `p-throttle` (8/s) + ponawianie przy 429 i 5xx (wykładniczo, maks. 5 prób).
- Pobieramy całe poziomy naraz: `data/by-variable/{varId}?unit-level=N&year=…` – nigdy jednostka po jednostce.
- Licencja danych CC BY 4.0. Przy każdej liczbie: „Źródło: GUS, Bank Danych Lokalnych, <rok>”.
- **Strona nigdy nie woła API GUS.** Dane pobiera robot do `public/data`.

### 1.2 Roboty danych (GitHub Actions)
| Workflow | Kiedy | Co robi |
|---|---|---|
| `fetch-data.yml` | co noc ok. 3:10 (cron `10 1 * * *`) i ręcznie | `pnpm data:fetch` → `public/data/values/*.json`, test kontraktu, przebudowa `public/data/profiles/*.json`; PR z gałęzi `data/nightly` tylko gdy dane się zmieniły; przy błędzie zgłoszenie |
| `fetch-localities.yml` | ręcznie (raz na jakiś czas) | `public/data/localities.json` z rejestru PRNG |
| `bdl-record.yml` | ręcznie | nagrania odpowiedzi BDL do `tests/fixtures/bdl/recorded/` (dane do testów) |
| `update-snapshots.yml` | ręcznie przez właściciela (etykieta `aktualizuj-zrzuty` na PR) | odświeża wzorce zrzutów Playwright na gałęzi PR |

### 1.3 Wskaźniki
- Katalog: `config/indicators.json` (20 wskaźników; pola: `id`, `bdlVarId`, `name`, `unit`, `description`, `group`, `higherIsBetter`, `minLevel`).
- Wskaźnik z poziomu wyższego niż jednostka → w profilu dopisek „dane dla powiatu X”. Wynagrodzenia: przypis „bez firm do 9 pracowników”. Samochody: „rejestracje flot leasingowych zawyżają niektóre miasta”.
- Domyślny wskaźnik ekranu głównego: gęstość zaludnienia (`DEFAULT_INDICATOR_ID` w `src/core/map/main-view.ts`).

### 1.4 Geometria i miejscowości
- Granice: `public/geo/admin.topo.json` (TopoJSON ≤ 3 MB, warstwy woj/pow/gmi, właściwości `{teryt, name}`), budowane ręcznie `pnpm geo` (źródło: repo waszkiewiczja/GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy, public domain; uproszczenie mapshaper – tylko narzędzie budowania).
- Miejscowości: TERYT SIMC + współrzędne z GUGiK PRNG, skrypt `pnpm localities`. Brak punktu → centroid gminy i `approx: true`.

### 1.5 Kontrakty plików
```ts
// public/data/units.json – lista jednostek
type Unit = { teryt: string; bdlId: string | null; name: string;
  level: "woj" | "pow" | "gmi"; parent: string | null;
  bbox: [number, number, number, number]; centroid: [number, number] };

// public/data/values/<indicatorId>.json – wartości jednego wskaźnika dla wszystkich jednostek
type IndicatorValues = { indicatorId: string; years: number[];
  values: Record<string /* teryt */, (number | null)[]>; fetchedAt: string; report?: unknown };

// public/data/profiles/<teryt województwa>.json – gotowe profile jednostek jednego województwa
// (typ ProfileShard w src/core/data/load-profile.ts; budowane przez scripts/data/build-profiles.mjs)

// public/data/localities.json
type Locality = { simc: string; name: string; gminaTeryt: string;
  lon: number; lat: number; approx?: boolean };

// public/data/explanations.json – (S17) opcjonalne objaśnienia, jeden wpis na wskaźnik
// { [indicatorId]: { short, howToRead, definitionUrl, funFact?, source?, url? } }
```
Pliki danych bez wcięć. Progi pobierania (ile plików w jakiej sytuacji): `docs/PRODUKT.md` §7.

---

## 2. Architektura
- **Stos:** Vite + React + TypeScript (strict), pnpm, statyczne SPA na Vercel (podgląd każdego PR).
- **Podział:** `src/core` – czysta logika bez DOM (Vitest); `src/view` – React. `src/components/ui` – komponenty shadcn/ui przerobione na nasz styl.
- **Stan w adresie:** `?u=<teryt>&i=<wskaźnik>&y=<rok>&l=<poziom>` (później `&c=<teryt,teryt>`), czytany i zapisywany przez `src/core/url/state.ts`. Na ekranie jedno źródło stanu: `useMainView` (wskaźnik, rok, poziom, wartości) i `useMapSelection` (wybrana jednostka) w `AtlasMap` – inne komponenty dostają je propsami.
- **Mapa:** MapLibre (`react-map-gl/maplibre`) + deck.gl (`MapboxOverlay`), bez podkładu ulic – sama kalka z granicami. Testy mapy przez stan `window.__atlas` (tylko w trybie testowym, `src/core/map/test-seam.ts`), nie przez piksele.
- **Style:** Tailwind v4 (`@theme`), tokeny `config/tokens.json` → `scripts/tokens.mjs` → `src/styles/tokens.css`. Zero wartości wpisanych na sztywno (test `no-hardcoded-colors`).
- **Zrzuty:** `pnpm shots` zapisuje `docs/shots/*.jpg` (1440×900 i 390×844, widoki z `scripts/shots.config.json`); wzorce testów wizualnych tylko przez workflow „Update snapshots”.
- **Analityka:** PostHog (region EU) ładowany dopiero po zgodzie; klucz projektu publiczny z założenia.

---

## 3. Pakiety w użyciu (sprawdzone 16.10.2026; nowe – przez TRYB: WYBÓR)
| Obszar | Pakiet | Licencja |
|---|---|---|
| Rdzeń | react, react-dom, vite, typescript | MIT |
| Routing | react-router | MIT |
| Style | tailwindcss, @tailwindcss/vite; class-variance-authority, clsx, tailwind-merge (shadcn/ui) | MIT |
| Fonty | @fontsource/atkinson-hyperlegible-next, -mono | OFL-1.1 |
| Testy | vitest, @playwright/test, @axe-core/playwright | MIT / Apache-2.0 / MPL-2.0 (tylko dev) |
| Prymitywy UI | radix-ui | MIT |
| Arkusz dolny | react-modal-sheet | MIT |
| Wyszukiwarka | cmdk, minisearch | MIT |
| Mapa | maplibre-gl, react-map-gl | BSD-3 / MIT |
| Warstwy mapy | @deck.gl/core, /layers, /mapbox, /extensions | MIT |
| Geometria | topojson-client (strona); mapshaper, topojson-server (tylko skrypty) | ISC / MPL-2.0 |
| Wykresy i skale | @observablehq/plot, d3-scale, d3-array | ISC |
| Zakreślenia | rough-notation, roughjs | MIT |
| Ikony | iconoir-react | MIT |
| Ruch | motion | MIT |
| Dane | zod, p-throttle | MIT |
| Strojenie | tweakpane (panel `?tune`) | MIT |
| Statystyki | posthog-js | MIT |

Zasady (WORKFLOW v5.1 §3b): nie kopiujemy kodu z cudzych repozytoriów – potrzebne rzeczy bierzemy jako pakiet; nowe pakiety starsze niż 3 dni (`minimumReleaseAge` w `pnpm-workspace.yaml`); pakiet nieużywany → usuwamy z wpisem w „Decyzjach”.

---

## 4. Czego nie robimy (nigdy)
Konta użytkowników · wołanie API GUS z przeglądarki · liczby wpisane ręcznie albo przez AI · śledzenie osób (IP, fingerprint) · Google Maps jako mapa główna · pobieranie całego BDL · generator karuzel w tym repo (osobne, prywatne repo).
