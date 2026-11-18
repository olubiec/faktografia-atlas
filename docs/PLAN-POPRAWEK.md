# Plan poprawek – 18.11.2026

Dokument planisty. Nie zmienia kodu strony. Źródła: stan `main` (0021a6e, po [FIX3] #479), raport `docs/research/q-c401-ruch-mapy.md`, plan Q (`tasks/poczekalnia/PLAN-UWAGI-17-11.md`, prompty w `tasks/poczekalnia/Q/`), przebiegi GitHub Actions i gałęzie `data/nightly`, `data/library` sprawdzone 18.11.2026 (05:30 UTC). Zadania nowe: `tasks/poczekalnia/W<N>-<ID>-*.md` (23 pliki). Zadania planu Q zostają w `tasks/poczekalnia/Q/` (kilka ma dopisaną „KOREKTĘ”, patrz §9).

## 0. Status wykonania (18.11.2026, `main` = f22ee8c)
| Status | Pozycja | Szczegóły |
|---|---|---|
| ✅ | PLAN #480, FIX3 #479, FIX4 #485, FIX5 #481 | scalone; założenia §2 o zakresie FIX4/FIX5 sprawdzone przy starcie Q2 (do weryfikacji) |
| ✅ | P1 = W19 PF01–PF09 | #489 (PF01), #487 (PF02), #488 (PF03), #482 (PF04), #483 (PF05), #484 (PF06), #486 (PF07), #490 (PF08), #491 (PF09) |
| ✅ | Dane #451 | wartości BDL na main (40c3f27); czerwony gitleaks i wynik „Fetch data” #31 – do weryfikacji |
| ✅ | FIX6 (A–I) | #493–#502 – zrealizowało większość celu PM02/PM10 (kamera imperatywna, bez stanu Reacta); zakres PM02, PM10, QC402, QC403–QC405 i PM13 przed startem fal W2–W5 **do weryfikacji** pod kątem duplikacji |
| 🔶 | FIX7 (#503) | startowy widok mapy; CI czerwone (testy dotykowe) |
| ⬜ | Q2–Q7, PX02 (D3), reduced motion `scrollZoom`/`dragPan`, wskaźniki biblioteki w UI, skrypt GUS, 155 + 375, odświeżenie STAN.md (D10) | patrz `docs/STATUS-PRZERWANE.md` |
| ⬜ | PM20 (pomiar „po”) | częściowo zastąpiony tabelą „po” z FIX6G (SwiftShader); pomiar na telefonie właściciela nadal potrzebny |
Odnośniki w tekście poniżej do „w toku: FIX4/FIX5” i „PF01 jako przyszłe” są historyczne – obowiązuje ta tabela.

## 1. Diagnoza

### 1.1 „Nie wszystkie pobrane wskaźniki są widoczne” i „automat nic nie przyniósł”
Ustalone z repozytorium i GitHuba (do potwierdzenia raportem FIX5):
1. **Dane główne czekają na scalenie.** Nocny „Fetch data” działa (ostatnie 8 przebiegów zielone, ostatni 17.11 09:10 UTC), ale zgodnie z projektem nie wrzuca danych na `main`: zapisuje je na `data/nightly` i trzyma w **PR #451** (otwarty od 15.11, 47 plików: `public/data/parts` ×16, `data/parts` ×14, profile ×16, 1 plik wartości; „mergeable”, status CI „unstable”). Dopóki nikt go nie scali, produkcja nie ma katalogu `public/data/parts` (blok „Miasto i obszar wiejski” pokazuje komunikat „po najbliższej aktualizacji”).
2. **Nocne przebiegi często nic nie zmieniają.** `nightly-checks.mjs revert-noise` cofa zmiany samych znaczników czasu, więc `fetchedAt` we wszystkich 20 plikach wartości na `main` to 19.10.2026. Strona nie pokazuje ani tej daty, ani informacji „automat sprawdzał wczoraj”, więc wygląda jak martwy.
3. **GitHub opóźnia harmonogram.** Cron jest ustawiony na 01:10 UTC, a przebiegi startują ok. 07:30–09:10 UTC. Przebieg „z dzisiejszej nocy” (18.11) w chwili sprawdzania jeszcze się nie odbył.
4. **Biblioteka jest pobrana, ale niewidoczna na stronie.** Gałąź `data/library` (aktualizowana 18.11 01:34 UTC) ma `library/available.json` z **1773** wskaźnikami (538 KB po rozpakowaniu, ok. 27 KB po gzip; poziomy tylko powiat/gmina). Mamy rejestr (`src/core/indicators/registry.ts`) i loader wartości (`load-any-values.ts`), ale **żaden ekran z nich nie korzysta**: mapa czyta `INDICATORS` z `config/indicators.json` (20), a ładowanie spisu (QC603), picker (QC607), mapa (QC606) i lista biblioteki (QC702) to zadania fal Q2–Q4. To główna przyczyna odczucia „nie wszystko widać”.
5. Brakuje strażnika: nic nie sprawdza automatycznie, że wskaźnik z danymi da się znaleźć i wybrać (PF02, PC01).

### 1.2 Zoom i kamera na telefonie
Raport QC401 (pomiar na SwiftShader bez dławienia) i czytanie kodu po FIX3 wskazują te same przyczyny:
- Każda klatka animacji to `setCurrentViewState` w `useMapViewState` (stan żyje w `AtlasMap`), więc przy 60 klatkach/s renderuje się całe drzewo ekranu, a `viewStateForLayers` w `AtlasMap.tsx` jest nowym obiektem w każdej klatce → przebudowa warstw deck.gl.
- `onMove` odrzuca kółko i klawisze w trakcie animacji (`isAnimatingRef && !isDragging`), kontrolowany `viewState` nadpisuje kamerę MapLibre.
- `+`/`−` i wejście w miejscowość to skok (brak animacji); `setInterval` co 100 ms w `useChoropleth.ts` budzi stronę także w ruchu; pobranie `localities.json` startuje w środku przybliżania.
- Brakuje liczb z urządzenia podobnego do telefonu (dławienie CPU, p95 klatki). Bez nich każda „poprawka płynności” jest zgadywaniem – stąd PF01 i PM20.

### 1.3 Testy czerwone/niestabilne na `main`
| Test | Przyczyna (z kodu) | Rozwiązanie |
|---|---|---|
| `navigation-and-budgets` (desktop+mobile) | krok 8 robi `page.goto` dwa razy = pełne przeładowanie; pamięć sesji znika, a `vite preview` wysyła `no-cache`. Aplikacja gwarantuje jedno pobranie na wybór miejsca, nie zero po przeładowaniu. | PF07 (zmiana testu – **zgoda D1**) |
| `network-resilience:58` („404 na parts”) | test czeka na przycisk „Miasto i obszar wiejski”; `ProfileOverview.tsx` celowo pokazuje ramkę z komunikatem bez przycisku, gdy plik części nie istnieje. | PF08 (zmiana testu – **zgoda D2**) |
| `library-only-fetched:103` (< 200 ms na 64 000) | mierzone jest pierwsze wywołanie, w którym `getPreparedIndex` normalizuje wszystkie 64 000 nazw. | PF04 (leniwa normalizacja; test bez zmian) |
| `library-search:99` (1 żądanie `index.json`) | niewyjaśnione; podejrzane: `.catch`/`!res.ok` zapisują trwały `null` w `load-library.ts`. Wymaga odtworzenia. | PF05 (diagnoza + poprawka w kodzie; jeśli to wina testu – raport i zgoda) |
| `picker-scroll:25` | selektor `[role="dialog"], [data-slot="popover-content"]` łączy dwa elementy (na telefonie otwarty jest arkusz i okno listy). FIX4 przebudowuje picker. | PX02 po FIX4 (**zgoda D3**) |

## 2. Co jest w toku i jak to uwzględniamy
- **FIX4** (`claude/fix4-picker-zoom`): okno dodawania wskaźników po kategoriach + dalsze wygładzenie zoomu. Zakładamy, że dotyka `IndicatorPicker.tsx`, okna dodawania (prawdopodobnie `ProfileIndicatorList.tsx`) oraz `AtlasMap.tsx`/`useMapViewState.ts`.
- **FIX5** (`claude/fix5-data-audit`): audyt automatu i pokrycia. Zakładamy, że dotyka `scripts/data/*`, `.github/workflows/*` i dokumentacji danych.
- Dlatego: **P1 (W19) używa wyłącznie nowych plików i plików spoza tych zakresów** i może ruszyć od razu. Wszystko, co zależy od wyniku FIX4/FIX5 (picker, kamera, status robota), jest w falach po ich scaleniu. Każde zadanie zależne ma w „Przeczytaj najpierw” wymóg przeczytania wyniku FIX4/FIX5 i zatrzymania się, jeśli go brakuje.
- Plik zadań fali Q2 **istnieje** (nie trzeba go pisać od zera): `tasks/poczekalnia/Q/W2-*.md` (15 zadań). Ten plan je przeorganizowuje (§4) i dokłada zadania poprawek.

## 3. Fale: kolejność i zależności

```
teraz ──► FIX4, FIX5 (w toku)            ──► [właściciel: scal PR #451 danych – D6]
teraz ──► P1 = W19 (poprawki, 9 zadań, bez konfliktów z FIX4/FIX5)
po FIX4+FIX5+P1 ──► Q2 = W2 ──► Q3 = W3 ──► Q4 = W4 ──► Q5 = W5 ──► Q6 = W6 ──► Q7 = W7
```
Zadania w jednej fali nie dzielą plików (sprawdzone skryptem na plikach „Zmieniaj” – brak konfliktów w W2–W7 i W19). Numery fal to numery w nazwach plików; „P1” to fala poprawek o numerze technicznym 19 (liczby 8–15 są zajęte historycznie).

| Fala | Zadań | Cel | Punkt kontrolny właściciela |
|---|---|---|---|
| **P1 = W19** | 9 | pomiar kamery, strażnicy danych i workflowów, stabilizacja testów, 2 zmiany testów za zgodą | scal PR #451 (dane), decyzje D1–D3 |
| **Q2 = W2** | 19 | wskaźniki z biblioteki: spis, rejestr, lista biblioteki; Rankingi/Porównaj: części; eksport: logika i pasek; narzędzia ruchu mapy; status danych (logika) | – |
| **Q3 = W3** | 12 | Rankingi i Porównaj złożone; mapa na wskaźniku z biblioteki; **kamera bez stanu Reacta (PM10)**; status danych w workflowach i stopce | **K-P3: telefon – zoom/dojazd, „Dane z dnia…”** |
| **Q4 = W4** | 11 | „Moje wskaźniki” w panelu/bibliotece/pickerze; przyciski „+/−”, wejście w głąb; udostępnianie; koniec odpytywania adresu | K-Q2: Rankingi, Porównaj, ruch |
| **Q5 = W5** | 10 | tabela Porównaj z „moich”, arkusz telefonu, ranking i „Pokaż na mapie” z biblioteki, strażnik reduced-motion, pomiar „po” | – |
| **Q6 = W6** | 5 | budżety szybkości, udostępnianie biblioteki, okno eksportu jako edytor zestawu; tryb oszczędny (warunkowy) | K-Q3: wskaźniki z biblioteki wszędzie |
| **Q7 = W7** | 3 | eksport: punkty otwarcia, telefon, cała ścieżka | K-Q4: eksport |

### 3.1 Tabele zadań – fala P1 = W19 (nowe pliki, start od razu)
| ID | Tytuł | Zmieniaj | Zależy od | Rozm. | Ryzyko | Co zobaczy właściciel / gdzie |
|---|---|---|---|---|---|---|
| PF01 | Pomiar klatek kamery (telefon emulowany) | `src/core/map/frame-stats.ts`, `tests/unit/frame-stats.test.ts`, `tests/e2e/perf-camera-frames.spec.ts`, `docs/research/p-kamera-pomiar-telefon.md` | – | M | niskie | raport z liczbami „przed” w PR; nic na stronie |
| PF02 | Strażnik: każdy pobrany wskaźnik osiągalny (dane ↔ rejestr ↔ wyszukiwanie ↔ profile) | `src/core/indicators/reachability.ts`, `tests/unit/indicator-reachability.test.ts` | – | M | niskie | nic na stronie; czerwony test, gdy wskaźnik „wypadnie” |
| PF03 | Logika „Dane z dnia…” | `src/core/data/freshness.ts`, `tests/unit/data-freshness.test.ts` | – | S | niskie | nic na stronie (PU02 pokaże) |
| PF04 | Stabilizacja `library-only-fetched` (leniwa normalizacja nazw) | `src/core/library/query.ts`, `tests/unit/library-prepare-cost.test.ts` | – | S | niskie | `/biblioteka` działa jak dotąd, szybciej przy 1. wejściu |
| PF05 | Stabilizacja `library-search` „1 żądanie index.json” | `src/core/library/load-library.ts`, `tests/unit/library-load-dedupe.test.ts` | – | S | średnie (diagnoza) | `/biblioteka` – przy błędzie sieci „spróbuj ponownie” działa |
| PF06 | Test klucza prywatności (brakujący test 3 z QC510) | `tests/unit/privacy-key-sync.test.tsx` | – | S | niskie | nic |
| PF07 | **[D1]** Test budżetu profili: pamięć sesji zamiast przeładowania | `tests/e2e/navigation-and-budgets.spec.ts` | zgoda D1 | S | niskie | zielony e2e |
| PF08 | **[D2]** Test „404 na parts”: komunikat zamiast przycisku | `tests/e2e/network-resilience.spec.ts` | zgoda D2 | S | niskie | zielony e2e |
| PF09 | Strażnik workflowów danych (tylko odczyt) | `tests/unit/workflows-guard.test.ts` | – | S | niskie | nic; test pada, gdy ktoś zepsuje robota |

### 3.2 Fala Q2 = W2 (19 zadań, po FIX4 + FIX5 + W19)
| ID | Tytuł (skrót) | Zmieniaj | Zależy od | Rozm. | Ryzyko | Efekt na podglądzie |
|---|---|---|---|---|---|---|
| **PM01** | Budżet klatek + kolejka odroczeń (logika) | `src/core/map/frame-budget.ts`, `defer-queue.ts`, 2 testy | PF01 | M | niskie | nic (logika) |
| **PM02** | Kamera sterowana wprost (matematyka + hook) | `src/core/map/camera-step.ts`, `src/view/map/hooks/useImperativeCamera.ts`, 2 testy | – | M | średnie | nic (dodatek, niepodłączony) |
| **PD01** | Skrypt `status.json` (daty pobrań, liczby) | `scripts/data/status.mjs`, test | FIX5 | M | niskie | nic |
| **PU01** | Loader statusu + komponent „Dane z dnia…” | `src/core/data/load-status.ts`, `src/view/layout/DataFreshness.tsx`, 2 testy | PF03, PD01 | M | niskie | nic (PU02 wstawi) |
| **PX01** | Profil: przesuwanie wskaźników wyżej/niżej, kolejność z listy | `src/view/hooks/useMyIndicators.ts`, `src/view/profile/ProfileIndicatorList.tsx`, 2 testy | FIX4 | M | średnie | profil miejsca → lista wskaźników: strzałki, kolejność zostaje po odświeżeniu |
| **PX02** | **[D3]** Test `picker-scroll` – jednoznaczny selektor | `tests/e2e/picker-scroll.spec.ts` | FIX4, D3 | S | niskie | zielony e2e |
| QC104 | Pasek wyboru rankingu | `src/view/ranking/RankingsFilters.tsx` + test | QC101,103 | M | niskie | (część strony Rankingi) |
| QC203 | Porównaj: dwa pola, „Zamień” | `src/view/pages/ComparePage.tsx` + e2e | QC201,202 | M | średnie | `/porownaj` na podglądzie |
| QC302 | Obrys gaśnie (warstwa) | `src/view/map/layers/choropleth.ts` + test | QC301 | M | średnie | mapa: obrys znika po oddaleniu |
| QC405 | Kafelki i kolory 300 ms **[D4]** | `src/view/map/hooks/useChoropleth.ts` + e2e | PF01 | M | średnie | mapa: zmiana wskaźnika, wejście w powiaty |
| QC603 | Ładowanie `available.json` | `src/core/indicators/load-available.ts` + test | QC602 | M | niskie | nic |
| QC610 | Porównanie: wiersze z biblioteki (logika) | `src/core/compare/compare-extra.ts` + test | QC604 | M | niskie | nic |
| QC702 | Biblioteka tylko pobrane + „m z n” | `Library.tsx`, `LibraryFilters.tsx` + test | QC701 | M | średnie | `/biblioteka`: licznik, brak niepobranych |
| QC703 | Kafelki działów tylko z pobranymi | `CategoryTiles.tsx` + test | QC701 | S | niskie | `/biblioteka` |
| QC902, QC910, QC911, QC913, QC914 | eksport: dane strony, karta A vs B, CSV zestawu, pasek stron, menu „+ Dodaj stronę” | pliki `src/core/share/*`, `src/view/share/*` | QC901 | S–M | niskie | nic (części edytora) |
Pominięte: **QC402** (→ PM10) i **QC502** (zrobione w FIX3).

### 3.3 Fala Q3 = W3 (12 zadań)
| ID | Tytuł | Zmieniaj | Zależy od | Rozm. | Ryzyko | Na podglądzie |
|---|---|---|---|---|---|---|
| **PM10** | **[D4]** Kamera bez stanu Reacta (zastępuje QC402) | `AtlasMap.tsx`, `useMapViewState.ts`, `tests/e2e/p-camera-smooth.spec.ts` | PM02, PF01, FIX4 | **L** | **wysokie** | **telefon: klik w województwo, „Wróć”, kółko, dwa palce – płynnie** |
| **PD02** | **[D5]** Workflowy: status po każdym przebiegu + zgłoszenie błędu biblioteki | `fetch-data.yml`, `fetch-library.yml`, test | PD01, FIX5, PF09 | M | średnie | na GitHubie: przebieg zostawia `status.json` |
| **PU02** | „Dane z dnia…” w stopce | `SiteFooter.tsx` + test | PU01 | S | niskie | stopka każdej strony |
| QC106 | Rankingi: złożenie strony | `Rankings.tsx` + e2e | QC104 | M | średnie | `/rankingi` |
| QC204 | Porównaj na telefonie | `ComparePage.tsx` + e2e | QC203 | S | niskie | `/porownaj` 390 px |
| QC303 | `outlineOpacity` w szwie testowym | `test-seam.ts` + e2e | QC302 | S | niskie | – |
| QC503 | Wspólny stan „Moich wskaźników” (**ścieżka skorygowana**) | `src/view/hooks/useMyIndicators.ts` + test | PX01 | M | średnie | dwie części strony widzą tę samą listę |
| QC606 | Mapa na wskaźniku z biblioteki | `useMainView.ts`, `useIndicatorRegistry.ts`, e2e | QC603 | **L** | średnie | `/?i=b60614` – kolory, legenda |
| QC705 | Pusty wynik biblioteki + zamówienie | `LibraryResults.tsx`, `Library.tsx` + test | QC702 | S | niskie | `/biblioteka?q=…` bez wyników |
| QC903, QC904, QC916 | eksport: zestawy domyślne, podział strony, podgląd 9 kart | `src/core/share/*`, `CardSvg.tsx` | QC901–914 | M | niskie | nic |
Przeniesione do W4: QC403, QC404 (te same pliki ekranu co PM10).

### 3.4 Fala Q4 = W4 (11)
QC403 (przyciski „+/−”, `ZoomButtons.tsx`+`AtlasMap.tsx`) · QC404 (wejście w głąb/powrót, `useMapViewState.ts`, `camera.ts`) · QC504 (lista „Moje wskaźniki”) · QC505 (okno dodawania – **dopasować do wyniku FIX4**) · QC506 (panel mapy) · QC508 (przycisk w bibliotece) · QC607 (picker: biblioteka, **limit 50 wyników**) · QC802, QC803 (udostępnianie Rankingi/Porównaj) · QC912 (stan edytora zestawu) · **PM12** (zdarzenie zmiany adresu zamiast `setInterval` co 100 ms: `src/core/url/state.ts`, `useChoropleth.ts`, test; M, ryzyko niskie–średnie; efekt: mniej „budzenia” strony w ruchu).

### 3.5 Fala Q5 = W5 (10)
QC205 · QC507 · QC509 · QC608 · QC609 · QC915 · QC406 (strażnik reduced-motion, przeniesione z W4) · **PM13** (miejscowości doczytują się po zatrzymaniu kamery, `useMapViewState.ts`) · **PM20** (pomiar „po”, raport `docs/research/p-kamera-pomiar-po.md`) · **PC01** (strażnik interfejsu: każdy wskaźnik z biblioteki da się znaleźć i wybrać w pickerze).

### 3.6 Fala Q6 = W6 (5) i Q7 = W7 (3)
W6: QC611 (budżety; próg `available.json` po kompresji – **D7**) · QC804 · QC806 · QC917 · **PM14** (tryb oszczędny na słabych telefonach; **warunkowo**: tylko gdy PM20 zaleca i właściciel potwierdzi, **D6**).
W7: QC918 · QC919 · QC920.

### 3.7 Macierz konfliktów plików między falami (te same pliki, różne fale – zawsze po kolei)
| Plik | Kolejność zadań |
|---|---|
| `src/view/map/AtlasMap.tsx` | PM10 (W3) → QC403 (W4) → PM14 (W6, warunkowo) |
| `src/view/map/hooks/useMapViewState.ts` | PM10 (W3) → QC404 (W4) → PM13 (W5) |
| `src/view/map/hooks/useChoropleth.ts` | QC405 (W2) → PM12 (W4) |
| `src/view/map/layers/choropleth.ts` | QC302 (W2) → PM14 (W6) |
| `src/view/hooks/useMyIndicators.ts` | PX01 (W2) → QC503 (W3) |
| `src/view/pages/Library.tsx` | QC702 (W2) → QC705 (W3) → QC509 (W5) → QC806 (W6) |
| `src/view/pages/Rankings.tsx` | QC106 (W3) → QC802 (W4) → QC609 (W5) |
| `src/view/pages/ComparePage.tsx` | QC203 (W2) → QC204 (W3) → QC803 (W4) → QC205 (W5) |
| `src/view/pages/LibraryVariable.tsx` | QC508 (W4) → QC608 (W5) → QC804 (W6) |
| `src/core/map/test-seam.ts` | tylko QC303 (W3); PM10 nie dotyka szwu |
Wszystkie pozostałe zadania mają pliki rozłączne w obrębie fali (kontrola skryptem 18.11).

## 4. Analizy i researche do wykonania przed kodem
| Gdzie | Co zmierzyć / sprawdzić | Narzędzia | Czego NIE dodawać |
|---|---|---|---|
| PF01 | Klatki kamery (p50/p95/max/`droppedShare`, długie zadania) przy dławieniu CPU ×4, 390×844, DPR 3; scenariusze: dojazd, „+”, kółko, pinch, „Wróć”, wskaźnik, poziom | Playwright 1.64 + CDP (`Emulation.setCPUThrottlingRate`, `Input.dispatchTouchEvent`), `PerformanceObserver('longtask')`, rAF | żadnych pakietów do statystyk/FPS |
| PF04 | czas pierwszego `filterFetched` na 64 000, liczba wywołań `normalize` | Vitest, `--repeat` | – |
| PF05 | powtórzenie flaky 20×, adresy żądań `index.json` | Playwright `--repeat-each` | – |
| PM02 | sygnatura `jumpTo` w `react-map-gl` 8.1.3 / `maplibre-gl` 6.15.0 (wersje z `ELEMENTY.md`), zachowanie deck.gl interleaved bez Reacta | czytanie `node_modules` | bibliotek animacji (`motion` został usunięty 24.10) |
| PM10 | czytelnicy `currentViewState` (które potrzebują każdej klatki) | Grep | drugiego stanu widoku (AGENTS.md) |
| PD02 | uprawnienia i wyścig zapisu na `data/library` z dwóch workflowów | dokumentacja GitHub Actions | zewnętrznych usług monitoringu |
| QC607 / FIX4 | czy 1773 pozycji wymaga wirtualizacji | pomiar liczby elementów DOM | `@tanstack/react-virtual` – jest w `INSPIRACJE.md` jako zweryfikowana, ale **nie w `ELEMENTY.md` ani w `package.json`**: wejdzie dopiero po decyzji, z opisem PR (npm, repo, data, pobrania, po co) i wpisem w `ELEMENTY.md`. Rekomendacja: nie jest potrzebna (wyniki ograniczone do 50 + kategorie). |
| D7 | rozmiar `available.json` po kompresji przy 5 000 i 20 000 wskaźników | `gzip -9`, `curl --compressed` do `raw.githubusercontent.com` | podziału pliku, dopóki ≤ 100 KB po kompresji |

## 5. Strategia testów
- **Jednostkowe (Vitest)**: logika w `src/core` (statystyki klatek, budżet, kolejka, krok kamery, świeżość, status, audyt wskaźników) – na `tests/fixtures` i na prawdziwych plikach repo tylko tam, gdzie to strażnik (PF02 czyta `public/data` i `config/indicators.json`). Zero sieci.
- **E2E (Playwright)**: nowe testy w nazwach z tagiem fali (`@P1`, `@P2`, `@P6`) zgodnie z regułą „@S<n>” z AGENTS.md. Stan mapy tylko przez `window.__atlas` (bez pikseli WebGL); zrzutów pikselowych **nie dodajemy ani nie zmieniamy** – wzorce `*-snapshots/` zostają; żadne zadanie z tego planu nie zmienia wyglądu statycznego.
- **Pomiary wydajności**: PF01 (narzędzie, tylko `PERF=1`, pominięte w zwykłym CI z komentarzem) → PM10 (test porównawczy „przed/po”, próg do potwierdzenia) → PM20 (raport po fali). Liczby z SwiftShader traktujemy jako względne; ostateczna ocena: właściciel na telefonie (punkt K-P3).
- **Strażnik pokrycia danych**: PF02 (dane ↔ rejestr ↔ wyszukiwanie ↔ profile, 16 plików), PC01 (interfejs ↔ biblioteka), PF09 i test z PD02 (konfiguracja robotów), PD01 (kształt `status.json`).
- **Stabilizacja**: każde zadanie naprawiające flaky wymaga serii powtórzeń (`--repeat-each` 10–20) i dowodu przyczyny w opisie PR.
- **Reguła zgodności**: istniejące testy nie są zmieniane; wyjątki to tylko PF07, PF08, PX02 i tylko po zgodzie D1–D3.
- Przed każdym PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` puste.

## 6. Decyzje wymagające zgody właściciela (każda z rekomendacją)
| # | Decyzja | Rekomendacja | Status |
|---|---|---|---|
| **D1** | Zmienić istniejący test `navigation-and-budgets` (PF07): mierzyć pamięć w obrębie sesji zamiast „0 pobrań po przeładowaniu”. | **TAK.** Obecny test wymaga czegoś, czego żadna strona nie robi po przeładowaniu; alternatywa (nagłówki cache na `/data/*` albo pamięć w przeglądarce ponad sesję) ryzykuje stare dane po nocnej aktualizacji. | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): TAK |
| **D2** | Zmienić `network-resilience:58` (PF08): oczekiwać komunikatu zamiast przycisku. | **TAK.** To komponent jest zaprojektowany celowo; test jest błędny. (Komunikat zniknie, gdy scalisz PR #451 z danymi.) | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): TAK |
| **D3** | Zmienić selektor w `picker-scroll:25` (PX02), po FIX4. | **TAK**, ale dopiero po sprawdzeniu przyczyny na kodzie po FIX4; jeśli przyczyna jest inna, zadanie kończy się raportem. | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): TAK, dopiero po FIX4 |
| **D4** | Zgoda na przebudowę kamery w plikach ekranu `AtlasMap.tsx` i `useMapViewState.ts` (PM10, potem QC403/QC404/PM13) oraz na grupę animacji QC403–QC405; QC402 zastąpione przez PM10. | **TAK, jeden PR naraz**, każdy z liczbami „przed/po”; PM10 puszczamy dopiero po PF01 i PM02. Plan awaryjny: cofnięcie PM10 jednym revertem (zachowane eksporty i szew testowy). | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): TAK, jeden PR naraz, każdy z liczbami przed/po i sprawdzeniem zoomu na telefonie |
| **D5** | Zmiany w `.github/workflows/` (PD02): zapis `status.json` po każdym przebiegu na gałąź `data/library` + zgłoszenie błędu dla „Fetch library”. | **TAK.** Daje stronie „Dane z dnia…” i „Sprawdzone przez automat…” bez dodatkowych PR-ów; bez zmian na `main`. | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): TAK |
| **D6** | (a) Scalić dziś PR #451 z danymi (po obejrzeniu zielonego CI). (b) PM14 „tryb oszczędny” uruchomić tylko, jeśli PM20 pokaże p95 > 33 ms. | (a) **TAK** – to jedyny sposób, by nowe dane i „Miasto i obszar wiejski” trafiły na produkcję; sprawdź kilka liczb na bdl.stat.gov.pl (jak w opisie PR). (b) **TAK, warunkowo.** | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): TAK: #451 scalić dopiero po zielonym CI; PM14 tylko jeśli PM20 pokaże p95 klatki > 33 ms |
| **D7** | Zmienić próg w `docs/PRODUKT.md` §7: `available.json` ≤ 100 KB **po kompresji** (dziś 27 KB przy 1773 wskaźnikach; 538 KB po rozpakowaniu) zamiast „< 50 KB”. | **TAK.** Próg 50 KB dotyczył ok. 100 wskaźników; przy dalszym przyroście biblioteki trzeba będzie podzielić plik wg działów – osobne zadanie, gdy przekroczymy 100 KB. | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): TAK |
| **D8** | Wskaźniki z biblioteki w profilu miejsca (PRODUKT §4d/§7 mówi: nie). | **Zostaje „nie”** (profil = jeden plik na województwo). Lista „Moje wskaźniki” może je zawierać; profil pokazuje przecięcie z wskaźnikami, które ma. Wpis do „Później”. | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): NIE – biblioteka nie trafia do profilu miejsca |
| **D9** | Odstępstwo od litery PRODUKT §4f: w pionowej liście profilu przesuwanie strzałkami góra/dół, nie „‹ ›”. | **TAK** (w poziomych chipach panelu mapy zostają „‹ ›”). | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): TAK, strzałki góra/dół |
| **D10** | Zakres STAN.md/PRODUKT: po fali P1 Claude aktualizuje `docs/STAN.md` (po 28.10 nie był aktualizowany; opis „Co działa” jest nieaktualny). | **TAK**, jako osobna praca Claude po fali (agenci STAN.md nie ruszają). | **ZATWIERDZONA** (2026-11-18, „decyzja oddana Claude przez właściciela”): TAK, STAN.md odświeża Claude po fali P1 |

### Kolejność startu (zatwierdzona 2026-11-18)
1. Scalić PR #480 (ten plan, tylko dokumentacja).
2. P1 (W19) startuje równolegle z FIX4/FIX5. Po ich scaleniu sprawdzić kolizje plików (`git diff --name-only origin/main...origin/claude/fix4-picker-zoom` i fix5, albo po scaleniu różnicę względem poprzedniego `main`) i dostosować pliki „Zmieniaj” w zadaniach poczekalni; kolizja = zadanie przesuwa się.
3. Scalić PR #451 (dane) po zielonym CI.
4. Q2 (W2) po P1 (i po FIX4 + FIX5).
5. Dalej po kolei: Q3, Q4 (PM10 jako jedyne zadanie na plikach kamery; PM14 tylko warunkowo wg D6), Q5, Q6, Q7. Dependabot #450 nie w trakcie W3–W5.
6. Po fali P1: Claude odświeża `docs/STAN.md` (D10).
7. Ścieżki zadań w poczekalni zostają bez zmian; przeniesienie do `tasks/` robi osobna sesja startowa fali.

## 7. Ryzyka i kolejność scalania
1. **PM10 (L, wysokie)** – dotyka kamery, adresu, układu profilu i szwu testowego. Mitygacja: PF01/PM02 wcześniej; PM10 w fali, gdzie jest jedynym zadaniem na tych dwóch plikach; zachowane eksporty (`shiftForLayout`, `getCameraState`); lista istniejących testów kamery w „Weryfikacji”; revert jednym PR.
2. **FIX4/FIX5 jeszcze nie scalone** – nasze założenia o ich zakresie mogą być błędne. Mitygacja: P1 tylko nowe pliki + `query.ts`/`load-library.ts` (mało prawdopodobne w FIX4/5); przed startem Q2 sesja startowa porównuje `git diff --name-only origin/main...origin/claude/fix4-picker-zoom` (i fix5) z plikami fali; kolizja → zadanie przesuwa się.
3. **Rozmiar `available.json` rośnie z biblioteką** (1773 dziś, robot dokłada co 12 h): wpływ na wejście strony. Mitygacja: D7, PF01-style pomiar w QC611, osobne zadanie na podział, gdy > 100 KB po kompresji.
4. **Wskaźniki biblioteki mają tylko poziomy powiat/gmina** (brak `woj`): mapa domyślnie startuje na województwach → przy `?i=b…` poziom musi się przełączyć (`clampLevel` + `minLevel`). Sprawdza QC606; dodaj przypadek w teście.
5. **Dependabot #450** (20 aktualizacji, w tym MapLibre/deck.gl możliwe) może zmienić zachowanie kamery w trakcie prac – nie scalać w trakcie W3–W5; scalić przed P1 albo po W5.
6. **Dane**: PR #451 jest otwarty od 3 dni, a nocne przebiegi go nadpisują (`checkout -B` + `--force`). Scalaj go regularnie (D6) – w przeciwnym razie „Miasto i obszar wiejski” dalej pokazuje komunikat.
7. **Kolejność scalania w obrębie fali**: najpierw zadania `src/core` (logika), potem `src/view`, na końcu e2e; zadania z `[D…]` dopiero po zgodzie. Po każdej fali: lista kontrolna dla właściciela (§3) i aktualizacja STAN.md (D10).
8. **Zadania W17/W18 w `tasks/poczekalnia/`** (T01–T06, P01–P06) pozostają w poczekalni; W17-T04 i W17-T05 są **zastąpione** przez PF08 i PF07 (te same pliki testów) – nie puszczać równolegle.

## 8. Co robi sesja startowa fali (przypomnienie dla `docs/FALE.md`)
1. Sprawdza, że poprzednia fala jest scalona i `main` zielony.
2. Kopiuje do `tasks/` pliki fali: z `tasks/poczekalnia/Q/W<N>-*.md` **oraz** `tasks/poczekalnia/W<N>-*.md` (nowe zadania poprawek). Pomija **QC402, QC502** i zadania z oznaczeniem `[CZEKA NA ZGODĘ …]`, dopóki właściciel nie zatwierdzi odpowiedniej decyzji w rozmowie z Claude (zgoda nie jest w repo – sesja startowa pyta Claude/właściciela).
3. Dla każdego pliku uruchamia osobną sesję; sama niczego nie wykonuje.

## 9. Korekty istniejących promptów Q (dopisane 18.11.2026 jako blok „KOREKTA” pod tytułem)
QC402 (nie puszczać; → PM10) · QC502 (nie puszczać; zrobione w FIX3) · QC405 (zgoda D4) · QC603 (nowe liczby `available.json`) · QC503 (istniejący `src/view/hooks/useMyIndicators.ts`) · QC403/QC404 (przeniesione z W3 do W4, po PM10) · QC406 (z W4 do W5) · QC505 (sprawdzić wynik FIX4) · QC607 (limit 1773 pozycji, wspólne `searchIndicators`) · QC611 (próg po kompresji). Pliki QC403, QC404, QC406 przeniesiono poleceniem `git mv` (zmiana nazwy, nie usunięcie).
