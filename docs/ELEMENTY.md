# Elementy z zewnątrz
Rejestr wg WORKFLOW v5.3 §10.3a. Wersje i licencje odczytane z zainstalowanych pakietów 22.10.2026; data wyboru pakietów z dawnego katalogu: 2026-10-16.
Zasady: wpis powstaje razem z elementem (prompt „Element z zewnątrz”); element bez licencji nie wchodzi; usunięty element – wpis skreślony z datą. Nowy element → najpierw `TRYB: WYBÓR` / `TRYB: BAZA`, decyzja właściciela, wpis tutaj i 1 linia w „Decyzjach” w STAN.md.
Kodu z cudzych repozytoriów nie kopiujemy (poziom E tylko z licencją i atrybucją – obecnie brak takich fragmentów).

## Pakiety używane przez stronę
| Element | Typ | Źródło | Wersja | Licencja | Do czego | Atrybucja? | Data |
|---|---|---|---|---|---|---|---|
| react, react-dom | pakiet | https://www.npmjs.com/package/react | 19.3.1 | MIT | interfejs | nie | 2026-10-16 |
| react-router | pakiet | https://www.npmjs.com/package/react-router | 8.4.0 | MIT | strony (`/`, `/o-projekcie`…) | nie | 2026-10-16 |
| maplibre-gl | pakiet | https://www.npmjs.com/package/maplibre-gl | 6.14.0 | BSD-3-Clause | silnik mapy | licencja w paczce | 2026-10-16 |
| react-map-gl | pakiet | https://www.npmjs.com/package/react-map-gl | 8.1.3 | MIT | MapLibre w React | nie | 2026-10-16 |
| @deck.gl/core, /layers, /mapbox, /extensions | pakiet | https://www.npmjs.com/package/@deck.gl/core | 9.4.0 | MIT | warstwy mapy (kolory, obrysy, miejscowości; S16 – kafelki) | nie | 2026-10-16 |
| topojson-client | pakiet | https://www.npmjs.com/package/topojson-client | 3.1.0 | ISC | odczyt granic | nie | 2026-10-16 |
| @observablehq/plot | pakiet | https://www.npmjs.com/package/@observablehq/plot | 0.6.17 | ISC | wykresy lat w profilu | nie | 2026-10-16 |
| radix-ui | pakiet | https://www.npmjs.com/package/radix-ui | 1.8.1 | MIT | prymitywy UI (zakładki, okna, suwak) | nie | 2026-10-16 |
| class-variance-authority, clsx, tailwind-merge | pakiet | https://ui.shadcn.com | 0.7.1 / 2.1.1 / 3.7.0 | Apache-2.0 / MIT / MIT | warianty klas komponentów shadcn/ui | nie | 2026-10-16 |
| react-modal-sheet | pakiet | https://www.npmjs.com/package/react-modal-sheet | 5.6.0 | MIT | dolny arkusz (telefon) | nie | 2026-10-16 |
| cmdk | pakiet | https://www.npmjs.com/package/cmdk | 1.1.1 | MIT | okno wyszukiwarki | nie | 2026-10-16 |
| minisearch | pakiet | https://www.npmjs.com/package/minisearch | 7.2.0 | MIT | wyszukiwanie jednostek i miejscowości | nie | 2026-10-16 |
| rough-notation, roughjs | pakiet | https://www.npmjs.com/package/rough-notation | 0.5.1 / 4.6.6 | MIT | ręczne zakreślenia | nie | 2026-10-16 |
| iconoir-react | pakiet | https://www.npmjs.com/package/iconoir-react | 7.12.1 | MIT | ikony | nie | 2026-10-16 |
| zod | pakiet | https://www.npmjs.com/package/zod | 4.6.7 | MIT | sprawdzanie plików danych | nie | 2026-10-16 |
| p-throttle | pakiet | https://www.npmjs.com/package/p-throttle | 8.1.1 | MIT | limit zapytań do BDL (robot) | nie | 2026-10-16 |
| tweakpane | pakiet | https://www.npmjs.com/package/tweakpane | 4.0.5 | MIT | panel `?tune` | nie | 2026-10-16 |
| posthog-js | pakiet | https://www.npmjs.com/package/posthog-js | 1.438.12 | Apache-2.0 AND MIT | statystyki po zgodzie (region EU) | nie | 2026-10-16 |
| @fontsource/atkinson-hyperlegible-next, -mono | zasób (czcionka) | https://fontsource.org | 5.3.0 | OFL-1.1 | kroje strony | licencja w paczce | 2026-10-16 |

## Pakiety nieużywane – do usunięcia (zadanie W0.1, fala F1)
| Element | Wersja | Licencja | Powód |
|---|---|---|---|
| ~~nuqs~~ | ~~2.10.2~~ | ~~MIT~~ | ~~stan adresu robi `src/core/url/state.ts`~~ (usunięty 24.10.2026) |
| ~~motion~~ | ~~14.3.0~~ | ~~MIT~~ | ~~brak importów; animacje mapy idą przez deck.gl/MapLibre~~ (usunięty 24.10.2026) |
| ~~tw-animate-css~~ | ~~1.4.0~~ | ~~MIT~~ | ~~brak importów~~ (usunięty 24.10.2026) |
| ~~d3-array, d3-scale~~ | ~~3.2.4 / 4.0.2~~ | ~~ISC~~ | ~~brak importów (Plot ma własne)~~ (usunięty 24.10.2026) |

## Narzędzia (tylko budowanie i testy, nie trafiają na stronę)
| Element | Typ | Wersja | Licencja | Do czego |
|---|---|---|---|---|
| vite, @vitejs/plugin-react | pakiet | 8.3.4 / 6.1.2 | MIT | budowanie |
| typescript | pakiet | 6.0.3 | Apache-2.0 | typy |
| tailwindcss, @tailwindcss/vite | pakiet | 4.3.3 | MIT | style |
| vitest | pakiet | 5.0.5 | MIT | testy jednostkowe |
| @playwright/test, playwright | pakiet | 1.64.1 | Apache-2.0 | testy w przeglądarce |
| @axe-core/playwright | pakiet | 4.14.0 | MPL-2.0 | testy dostępności |
| oxlint | pakiet | 1.88.0 | MIT | lint |
| mapshaper, topojson-server | pakiet | 0.7.87 / 3.0.1 | MPL-2.0 / ISC | budowanie granic (`pnpm geo`) |
| @types/* | pakiet | – | MIT | typy |
| gitleaks-action | narzędzie CI | v2 | MIT | skan sekretów w CI |

## Dane i zasoby
| Element | Typ | Źródło | Licencja | Do czego | Atrybucja? |
|---|---|---|---|---|---|
| GUS Bank Danych Lokalnych | dane (API) | https://bdl.stat.gov.pl/api/v1 | CC BY 4.0 | wszystkie liczby (`public/data/values`, `profiles`) | **tak**: „Źródło: GUS, Bank Danych Lokalnych, <rok>” przy liczbach |
| Granice województw, powiatów, gmin | zasób (dane) | https://github.com/waszkiewiczja/GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy | public domain (sprawdzone 2026-10-16) | `public/geo/admin.topo.json` | nie |
| TERYT SIMC (nazwy miejscowości) | dane | https://eteryt.stat.gov.pl | otwarte dane GUS | `public/data/localities.json` | tak – strona „Źródła” |
| GUGiK PRNG (współrzędne miejscowości) | dane (API) | https://ogcapi.geoportal.gov.pl/res/ims/maps/PRNG/apiFeatures | otwarte dane GUGiK | `public/data/localities.json` | tak – strona „Źródła” |
| Logo i znak Faktografia | zasób | `public/brand/` (własne) | własność marki | logo, favicon | – |

## Usługi
| Element | Do czego | Uwagi |
|---|---|---|
| GitHub (repo publiczne, Actions) | kod, CI, roboty danych | Secret scanning i push protection włączone |
| Vercel (Hobby) | hosting i podgląd PR | tylko użycie niekomercyjne |
| PostHog (EU) | statystyki wyszukiwań po zgodzie | klucz projektu publiczny z założenia; jeszcze niepodłączony |
| Jules | wykonawca zadań | – |
| CodeRabbit | komentarze do PR | darmowy dla repo publicznego |
