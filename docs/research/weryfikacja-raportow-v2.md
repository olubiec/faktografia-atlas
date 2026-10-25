# Weryfikacja raportów Gemini R1–R5 (25.10.2026)
`TRYB: WERYFIKACJA` wykonany przez Claude. Raporty porównane z kodem w repo (`main` po W2.23) i ze źródłami: rejestr npm (istnienie, licencja, data wydania), dokumentacja React Router, MapLibre, Vercel; cennik Cloudflare R2 przez stronę trzecią (Filebase cytujący cennik – oficjalnej strony nie dało się otworzyć).
Oznaczenia: **POTWIERDZONE** (źródło otwarte) · **BŁĄD** · **NIEPOTWIERDZONE** · **NIE DA SIĘ SPRAWDZIĆ** (GitHub API dla cudzych repo i część stron poza dozwoloną listą).

## 0. Wniosek w pięciu zdaniach
1. Raporty są użyteczne jako lista kandydatów, ale kilka ich głównych rekomendacji **nie pasuje do tego, co już jest w repo** (prerender RR8, wymiana wykresów na Plot, wymiana kamery, „1 GB danych”).
2. Z 12 audytowanych elementów własnego kodu **wymieniamy 0 na pakiet teraz**; 3 mają sens później (S21: `nuqs`, `@tanstack/react-virtual`, magazyn obiektów).
3. Największy zysk dają poprawki, których raporty nie wskazały: **wspólny układ podstron, metadane/SEO, strona główna wg makiety 01, obsługa utraty kontekstu WebGL, podział plików > 200 linii**.
4. `@observablehq/plot` jest w `package.json` i w `ELEMENTY.md` („wykresy lat w profilu”), ale **nic go nie importuje** (`TrendChart` rysuje SVG ręcznie) – wpis i pakiet są nieprawdziwe.
5. Wszystkie decyzje wymagające Ciebie: `docs/research/zadania-fala-8.md`, sekcja „Decyzje właściciela”.

## 1. R1 – szablon, strona główna, SEO
| Twierdzenie raportu | Werdykt | Dowód / uwaga |
|---|---|---|
| Launch UI (`launch-ui/launch-ui`, „v2.0”) jako szablon | **NIEPOTWIERDZONE** | pakiet `launch-ui` nie istnieje w npm (404); repo nie do sprawdzenia; wersja „2.0” z raportu bez źródła |
| shadcnstore, ChatDeck, Shadcnblocks: zgodne z R19/TW4, MIT | **NIE DA SIĘ SPRAWDZIĆ** | ChatDeck wg samego raportu to Next.js; szablonów nie bierzemy |
| Prerender przez `prerender` w `react-router.config.ts` jest „wbudowany w RR8” i prosty | **BŁĄD dla naszego repo** | dokumentacja RR 8.2: `[MODES: framework]`. My mamy `BrowserRouter` (tryb biblioteki, `src/App.tsx`), brak `react-router.config.ts`. Prerender = migracja do trybu framework (`routes.ts`, `@react-router/dev`) – zbyt duża zmiana dla 4 stron |
| React 19 przenosi `<title>`/`<meta>` do `<head>` | **POTWIERDZONE** (dokumentacja React 19) | działa w SPA, ale boty społecznościowe nie wykonują JS, więc same znaczniki z JS nie wystarczą |
| `vite-plugin-sitemap` | **BŁĄD formalny** | pakiet istnieje (0.8.2, 2025-05), ale w npm **nie ma pola licencji** → wg AGENTS „bez sprawdzonej licencji nic nie wchodzi”. Zastępujemy własnym skryptem (4 adresy) |
| Wariant hybrydowy strony głównej | **zgodny z makietą 01** | makieta 01: tekst + wyszukiwarka + zakładki wskaźników po lewej, mapa po prawej – to już „hybryda”; ukrywanie mapy do przewinięcia kłóci się z progiem §7 (mapa w kolorach ≤ 3 s) |
| „Prywatność: serwis nie uruchamia żadnych narzędzi śledzących ani ciasteczek” | **BŁĄD** | repo ma `posthog-js` i `ConsentBar`; analityka po zgodzie (Privacy.tsx). Tekst z raportu byłby nieprawdziwy |
| Źródła z-dykty.pl, znajdzschronienie.pl, BDL, geoportal itd. i opisy ich pierwszego ekranu | **NIEPOTWIERDZONE** | raport sam oznaczył część „niezweryfikowane”; używamy wyłącznie jako inspiracji wyglądu po Twoim obejrzeniu |
| Ryzyko: utrata kontekstu WebGL na Androidzie | **POTWIERDZONE jako realne**; w kodzie brak obsługi | zadanie N4 |
| Ryzyko axe po usunięciu cieni | już pokryte | testy axe w CI, styl „Kalka i korekta” z liniami |
| Satori / `@vercel/og` do kart OG | **doprecyzowanie** | `satori` 0.63.2 ma licencję **MPL-2.0** (raport jej nie podał); potrzebne dopiero przy podstronach gmin („Później”) |
| Sitemap/SSG dla tysięcy gmin w darmowym progu | zgodne | już w „Później” (decyzja po W3.6) |

## 2. R2 – animacje, kamera
| Twierdzenie | Werdykt | Uwaga |
|---|---|---|
| `fitBounds`/`flyTo` z `padding` zastępują własną pętlę rAF | **technicznie prawdziwe, ale zadanie już zrobione i przetestowane** | W3.2 (`useMapViewState.ts`, 351 linii, e2e `camera.spec.ts`) jest na `main`; zamiana to refaktor z ryzykiem, nie naprawa błędu → N7 warunkowe, po Twojej ocenie na telefonie |
| `essential:true` wyłącza wpływ `prefers-reduced-motion` | **POTWIERDZONE** (dokumentacja MapLibre, `AnimationOptions`) | dla zwykłych przejść zostawiamy `essential:false`; wtedy MapLibre samo ucina animację |
| Tryb `interleaved:true` ignoruje `viewState` deck.gl | prawdziwe, **nieistotne** | `AtlasMap.tsx` używa `MapboxOverlay` bez `interleaved` (domyślnie wyłączony); kamerą steruje `react-map-gl` |
| `transitions: { getFillColor }` zamiast ręcznego przeliczania kolorów | **już zrobione** (W3.4); `useChoropleth.ts` ma jeszcze własny rAF | ewentualne uproszczenie w N7 |
| `DataFilterExtension` do „kafelków po kolei” | **już zrobione** (W3.3) | |
| `PathStyleExtension` `dashMode:'path'` | **NIEPOTWIERDZONE** | nazwa opcji nie pasuje do znanego API (`getDashArray`, `dashJustified`); i tak scena „kreślenie” (W3.5) ma być w SVG (`stroke-dashoffset`, standard) |
| Pomiar: `PerformanceObserver('longtask')`, CDP `Performance.getMetrics` | poprawne techniki | pomiar S16 już jest (W3.6) |
| Sekcje „kreślenie konturu”, „rekomendacje”, „ryzyka” | **PUSTE w raporcie** | tabele wycięte przy eksporcie; nie bierzemy ich pod uwagę |

## 3. R3 – audyt 12 własnych elementów
Raport podał „niezweryfikowane” dla większości pobrań, rozmiarów i dat; poniżej nasza weryfikacja i werdykt.
| Element | Raport | Werdykt Claude | Powód |
|---|---|---|---|
| TrendChart (427) | wymień na Plot | **ZOSTAW rysowanie, ROZBIJ plik** | Plot jest w `package.json`, ale **nigdzie nie importowany**; waży 1,5 MB (unpacked) + `d3`; wykres ma `aria-live`, najechanie i dotyk po roku – Plot tego nie da bez dopisywania; AGENTS: pliki ≤ ~200 linii → N5 |
| ShareDialog + render-png | wymień na `modern-screenshot` | **ZOSTAW** | karty w `canvas` są celowe (PRODUKT §4b: zero nowych pakietów, test e2e @S19 przechodzi); `modern-screenshot` 4.7.0 (MIT, 2026-04) istnieje, ale rasteryzacja DOM bywa kapryśna na Safari – brak dowodu zysku |
| csv.ts | zostaw | **ZOSTAW** | zgoda (BOM, przecinek dziesiętny); `papaparse` 5.7.0 MIT istnieje |
| RankingBars | wymień na Plot | **ZOSTAW** | j.w.; to paski DOM, nie wykres |
| classes.ts | `d3-scale` | **ZOSTAW** | `d3-scale`/`d3-array` usunięto 24.10 jako nieużywane (ELEMENTY.md); kod ma też metodę „równe przedziały” i testy |
| url/state.ts | `react-zod-url-state` | **ZOSTAW; nie ten pakiet** | `react-zod-url-state` 0.1.3, jeden autor, wydanie 2025-08 → za młody i nieprzetestowany. Dla NOWYCH filtrów biblioteki (S21) bierzemy `nuqs` (MIT, 2.10.2, wydanie 2026-10-08, adaptery `react-router`, `react-router/v6`, `v7`; zgodność z RR 8 do sprawdzenia testem w N10) |
| search/index.ts | zostaw | **ZOSTAW** | zgoda; normalizacja diakrytyków jest w `src/core/search/normalize.ts` |
| Annotate | `@turahe/react-rough-notation` | **ZOSTAW** | pakiet istnieje (2.0.2, MIT, 2025-08), ale to cienki wrapper; nasz kod ma menedżera „jedno zakreślenie na ekran” i obsługę reduced-motion |
| format/number.ts | zostaw | **ZOSTAW** | zgoda |
| Breadcrumbs | blok shadcn | **ZOSTAW** | zysk znikomy; po `shadcn add` i tak trzeba usuwać `rounded-*`/`shadow-*` |
| YearSlider | zostaw | **ZOSTAW** | zgoda (Radix Slider w `radix-ui`) |
| IndicatorPicker (299) | `modern-cmdk` | **NIE; ZOSTAW `cmdk`, nową listę zbuduj z `react-virtual` (S21)** | `modern-cmdk` 1.2.2: jeden autor, wydanie 2026-08, wymaga React ≥ 19 – nieprzetestowany. `cmdk` 1.1.1 ostatnie wydanie 2025-08-27 (~14 mies., na granicy kryterium „żyje”), nie wirtualizuje listy – dla ≥ 1000 pozycji potrzebna wirtualizacja |
Przy okazji: pliki > 200 linii (AGENTS): `card.ts` 908, `DesignPage.tsx` 612, `TrendChart` 427, `ShareDialog` 404, `AtlasMap` 392, `useMapViewState` 351, `ProfileOverview` 309, `TunePanel` 304, `IndicatorPicker` 299 i inne. Rozbijamy tylko te, które i tak będą zmieniane (N5, N7, S21).

## 4. R4 – biblioteka: kategorie, filtry, wyszukiwanie
| Twierdzenie | Werdykt |
|---|---|
| `@tanstack/react-virtual` 3.14.22, MIT, aktywny | **POTWIERDZONE** (npm, wydanie 2026-10-22; React 19 w peer) |
| `virtua` jako alternatywa | istnieje (0.53.6, MIT) – raport podał „v0.x”, ok; nie potrzebujemy drugiej |
| `nuqs` MIT, „v2.x”, ~2 kB | **POTWIERDZONE** licencja i wersja 2.10.2; rozmiar niezweryfikowany |
| `lazy-tree-view` „v2.x” | **BŁĄD**: jest 1.0.2 (MIT, 2026-02); i tak niepotrzebne (kategorie płytkie: kafelki + akordeon z `radix-ui`) |
| `@radix-ui/react-accordion` v1.3.1 | **POTWIERDZONE**; mamy `radix-ui` 1.8.1, więc osobny pakiet zbędny |
| `useFlushSync:false` dla React 19 w react-virtual | **NIEPOTWIERDZONE** – Jules sprawdza w dokumentacji TanStack przed użyciem |
| MiniSearch: wymaga normalizacji znaków, indeks da się zbudować wcześniej | zgodne z naszym kodem; **prekompilowany indeks (`toJSON`/`loadJSON`) budowany przez robota** – dobra praktyka, wdrażamy w N10 |
| Tally.so: UE (Belgia), DPA, bez limitu zgłoszeń, Turnstile | **NIE DA SIĘ SPRAWDZIĆ** (strony Tally poza listą). Dodatkowo: osadzenie `<iframe>` wymaga zmiany CSP w `vercel.json` (dziś `default-src 'self'` blokuje ramki) i wpisu w Prywatności → rekomendujemy **zwykły odnośnik** do formularza, nie osadzanie; decyzja D3 |
| Webhook Tally → kolejka w GitHub | **BŁĄD architektoniczny**: brak backendu, webhook potrzebuje odbiorcy z sekretem. Na start: właściciel czyta zgłoszenia ręcznie |
| Wzorce UX (BDL, dane.gov.pl, World Bank, Eurostat, SVS, SMUP, Badam Poznań) | **NIEPOTWIERDZONE opisy**; to strony, nie kod – wolno oglądać jako inspirację wyglądu (INSPIRACJE zasada 6) |

## 5. R5 – magazyn danych i hosting
| Twierdzenie | Werdykt |
|---|---|
| „Gałąź `data/library` ma ~1 GB” | **BŁĄD**: 1 GB to próg z decyzji w STAN.md, nie stan. Dziś gałąź ma ~13 MB (robot ruszył 25.10). Pilność wzięta z błędnego założenia |
| Rozmiar docelowy: 0,3 MB/wskaźnik; 10 tys. ≈ 3 GB | zgodne z `biblioteka-gus.md` |
| GitHub: zalecane ≤ 1 GB repo, plik ≤ 100 MB | zgodne z dokumentacją GitHub (cytowaną w raporcie) |
| Vercel Hobby = tylko użytek niekomercyjny; reklamy, płatności, afiliacje zabronione; prośba o darowiznę dozwolona | **POTWIERDZONE** (Fair Use Guidelines, aktualizacja 2026-09-14). Zgodne z PRODUKT.md („Zarabia: nie… przy komercjalizacji – zmiana hostingu”) |
| Vercel Hobby: 100 GB transferu | **POTWIERDZONE** (ta sama strona; raport podawał „10 GB” dla Blob – to inny produkt) |
| R2: 10 GB, 1 mln zapisów (A), 10 mln odczytów (B) gratis; $0,015/GB; B $0,36/mln; egress $0 | **POTWIERDZONE** (przez Filebase cytujące cennik Cloudflare); Class A po limicie wg tego źródła $4,50/mln (raport tego nie podał) |
| Brak OIDC/WIF z GitHub do R2 | **NIEPOTWIERDZONE**; rozsądny wzorzec i tak: token tylko do jednego bucketa + sekret w GitHub **Environment** ograniczonym do `main` |
| Purge cache „by prefix” w darmowym planie | **NIEPOTWIERDZONE** – unikamy: ścieżki z wersją (`/v/<data>/…`) + `manifest.json`, wtedy nie trzeba czyścić CDN |
| Tabele scenariuszy ruchu (100 tys., 1 mln odsłon) | **PUSTE w raporcie** |
| Przenosimy hosting na Cloudflare Pages | **NIE TERAZ** – brak monetyzacji; podgląd Vercel na telefonie to Twój podstawowy sposób pracy. Magazyn danych (R2) jest niezależny od hostingu strony |
| Limity BDL z kluczem 10/s, 5000/12 h | zgodne z `ARCHITEKTURA.md` §5.1 (robot ma kolejkę `p-throttle`) |

## 6. Co trafia do rejestrów
- `docs/INSPIRACJE.md`: wpisy ze statusem `zweryfikowane` (licencja z npm) – MapLibre camera, deck.gl transitions, nuqs, react-virtual, shadcn/ui jako wzorzec układu; `odrzucone` – launch-ui i pozostałe szablony, modern-cmdk, react-zod-url-state, vite-plugin-sitemap, satori (na razie).
- Rozbieżność w `docs/ELEMENTY.md` (Plot) naprawia zadanie N6 po Twojej decyzji D2 (plik jest „najpierw zapytaj” dla Julesa – nie edytujemy go w tym PR).
