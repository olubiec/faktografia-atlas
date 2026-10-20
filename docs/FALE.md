# Fale 7–10: kolejka i gotowe prompty (od 20.10 wieczorem: fala 9 = naprawa wg docs/PRODUKT.md)

Napisane 19.10.2026 przez Opusa. Na ich podstawie Haiku (albo właściciel) wysyła zadania bez pisania czegokolwiek od nowa.
Zasady pracy, role modeli i procedury: `docs/OPERACJE.md`. Wspólny blok promptów i zasady twarde: `docs/PROMPTY.md` §2 i §5.

**Najważniejsza zmiana względem PROMPTY.md:** prompty kolejnych fal są napisane z góry, bo każde zadanie wcześniejszej fali **dostaje w prompcie dokładne nazwy plików i eksportów**, z których korzystają późniejsze. Linia `Wymaga na main:` w każdym prompcie wymienia te pliki i eksporty; `scripts/ops/new-task.sh` sam sprawdza, czy są już na main, i nie wyśle zadania za wcześnie.

## 1. Kolejka (stan 20.10.2026 wieczór; czytaj od góry)

**Zmiana kursu 20.10:** test właściciela pokazał, że strona po falach 1–8 nie działa jako produkt (zamula, mapa bez kolorów, profil zasłania mapę, brak zestawień i objaśnień). Przyczyny i nowe założenia: **`docs/PRODUKT.md`** (ma pierwszeństwo). Fala 9 = „działa i wygląda jak makieta 02–04”. Stare prompty CC8.W i CC4.4 są **zastąpione** (nie wysyłać).

Fale 1–8b i P są scalone (#1–#157). Zasady pracy po zmianie: `docs/OPERACJE.md` §0.

**Nowy podział pracy w fali 9:** Jules robi tylko **osobne klocki** (nowe pliki, logika, komponenty na danych syntetycznych). **Ekran składa Sonnet** (zadania CC13.A–M) w swojej sesji, oglądając działającą stronę (PRODUKT.md §8). Jules nie dotyka `AtlasMap.tsx`, `Home.tsx`, `ProfileSheet*.tsx`, hooków mapy.

Tory fali 9 (rozłączne pliki): **D2** dane profili, **E** objaśnienia, **W** wykres, **U** ranking, **S** wyszukiwarka (okno wyszukiwania), **P** przypisy, **N** nazwy jednostek, **M** ekran (tylko Sonnet).

| Fala | Zadanie | Kto | Tor | Rusza, gdy | Kto sprawdza PR |
|---|---|---|---|---|---|
| 9 | CC13.1 – pliki profili per województwo + odczyt | J | D2 | teraz | Sonnet (dane) |
| 9 | CC13.2 – objaśnienia: format, odczyt, przycisk (?) | J | E | teraz | Sonnet (config/dane) |
| 9 | CC13.3 – czytelny wykres lat (TrendChart) | J | W | teraz | Haiku |
| 9 | CC13.4 – ranking jednostek + słupki (RankingBars) | J | U | teraz | Haiku |
| 9 | CC13.5a – wyszukiwarka zamyka się krzyżykiem | J | S | teraz | Haiku |
| 9 | CC13.5b – przypisy: separator i „powiat powiat” | J | P | teraz | Haiku |
| 9 | CC13.6 – nazwy gmin z rodzajem („Wałcz (miasto)” / „Wałcz (gmina wiejska)”) | J | N | teraz | Haiku |
| 9 | CC13.A – szybkość: dane poza kodem, profil z jednego pliku, progi w CI | C (Sonnet) | M | od razu (część profilu po CC13.1) | Sonnet + zrzuty |
| 9 | CC13.B – ekran główny wg makiety 02 (panel wskaźnika, kolory na wejściu, dymek, najwyżej/najniżej) | C (Sonnet) | M | CC13.A, CC13.4 scalone | Sonnet + zrzuty + Ty |
| 9 | CC13.C – profil obok mapy wg makiety 03 (zakładki, ranking, rozwijane wskaźniki, „Pokaż na mapie”) | C (Sonnet) | M | CC13.B, CC13.2, CC13.3, CC13.5b scalone | Sonnet + zrzuty + Ty |
| 9 | CC13.M – telefon wg makiety 04 (pasek wskaźnika, arkusze) | C (Sonnet) | M | CC13.C scalone | Sonnet + zrzuty + Ty |
| 9 | CC13.T – treść objaśnień 20 wskaźników | Gemini → Sonnet → **Ty akceptujesz** | E | równolegle; publikacja po CC13.2 | Ty |
| 10 | CC8.5 porównanie, CC4.4 podkład, CC8.4 kreskowanie, CC9.1b scena wejścia, tryb ciemny mapy, `trackSearch`, mediana wieku „na styczeń” | Opus pisze prompty | — | bramka fali 9 + Twój test | — |
| 10 | CC12.R – reguły gałęzi `main`, `zasady-pr` wymagane | C (Sonnet) | G | teraz (repo publiczne) | Sonnet |
| 10 | CC12.M – odchudzenie `merge.sh` | C (Sonnet) | O | jedna czysta fala z `zasady-pr` | Sonnet |

### Bramki fal (komendy; wynik 0 = przechodzi)

Bramki uruchamia `new-task.sh` (CC12.B) przed pierwszym zadaniem kolejnej fali i zwraca `STOP`, jeśli bramka nie przechodzi; ręcznie: `scripts/gates/fala-8b.sh`, `scripts/gates/fala-9.sh`. Model nigdy nie „odhacza” bramki słowami.

- **Bramka fali 8b** (przed falą 9): spełniona 20.10 (dane, profil, test kontraktu, CI). Test właściciela wykazał problemy → fala 9 je naprawia.
- **Bramka fali 9** (przed falą 10): `scripts/gates/fala-9.sh` – na main są `public/data/profiles/12.json`, `public/data/explanations.json`, `tests/e2e/perf-budget.spec.ts`, `tests/e2e/main-screen.spec.ts`, `tests/e2e/profile-panel.spec.ts`, a CI na main jest zielone. **Ty:** test z `docs/OPERACJE.md` §4 („Test ekranu głównego”) na komputerze i telefonie – wynik jednym zdaniem.

### Dług (punkt · skąd · priorytet · proponowana fala)

Opus przy planowaniu każdej fali bierze stąd co najmniej 1 punkt albo pisze, dlaczego nie. Rzeczy wpływające na niezawodność i szybkość nie są długiem i idą od razu.

| Punkt | Skąd | Priorytet | Fala |
|---|---|---|---|
| `trackSearch` nie jest wywoływane w wyszukiwarce | przegląd #131 | średni | 10 |
| Mediana wieku to stan „na styczeń” (lata do 2026) – legenda i profil muszą to mówić | sprawdzenie danych #135 | średni | 9 (CC13.T: `howToRead`) |
| `getTooltip` w warstwach nic nie robi | przegląd #133 | wysoki | 9 (CC13.B: dymek) |
| Niestabilny test e2e w CI (ok. 1 na 3 przebiegi) | fala P | wysoki | 9 (Sonnet: nazwa z adnotacji → poprawka) |
| Adres strony (Vercel) nieznany w repo | 20.10 | wysoki | Ty: podaj adres; Sonnet wpisuje do README i OPERACJE §4 |
| Zbędna gałąź `jules-feat/cc5.4b-localities-map-…` | fala 6 | niski | Ty: Branches → kosz |
| `STAN_PROJEKTU.md` nieaktualny | koniec fali 8 | średni | 9 (Sonnet na końcu fali) |


## 2. Prompty – fala 7

### CC4.S – Rozbicie AtlasMap na hooki · K · tor M · fala 7

```markdown
Zadanie: CC4.S – rozbicie AtlasMap na hooki bez zmiany działania

Wymaga na main: src/view/map/AtlasMap.tsx, src/core/url/state.ts#readUrlState, src/view/map/layers/registry.ts#createMapLayers

Kontekst: `src/view/map/AtlasMap.tsx` ma ok. 340 linii i jest plikiem zapalnym: każde zadanie mapy go zmienia, co powodowało konflikty i zapętlenia. Kolejne zadania (kartogram, profil) dopiszą do mapy nowe dane, więc najpierw dzielimy komponent na hooki o stałych nazwach.

Cel dla użytkownika: brak widocznej zmiany. Mapa, przechodzenie w głąb, okruszki, `?u=`, miejscowości i wyszukiwarka działają jak dotąd.

Zakres (tylko te pliki):
- `src/view/map/AtlasMap.tsx` (tylko przeniesienie logiki do hooków; JSX bez zmian)
- `src/view/map/hooks/useMapSelection.ts` (nowy): stan `selectedTeryt`, `drillState`, obsługa `?u=`, `popstate`, zdarzenia `atlas:select-locality`, funkcje `selectUnit(teryt)`, `goBack()`
- `src/view/map/hooks/useMapViewState.ts` (nowy): `viewState`, `setViewState`, wymiary kontenera, dopasowanie do bbox, limity zoomu
- `src/view/map/hooks/useMapColors.ts` (nowy): kolory z CSS i motyw (`theme`) z obserwacją zmiany motywu
- `tests/unit/map-hooks.test.tsx` (nowy)
- `docs/sessions/CC4.S.md`

Warunki odbioru:
1. `AtlasMap.tsx` ma najwyżej 200 linii; trzy hooki eksportują dokładnie nazwy `useMapSelection`, `useMapViewState`, `useMapColors`.
2. Wszystkie istniejące testy e2e przechodzą BEZ ŻADNEJ zmiany w plikach testów (`map.spec.ts`, `drill.spec.ts`, `breadcrumbs.spec.ts`, `localities-map.spec.ts`, `localities-search.spec.ts`).
3. `window.__atlas` zwraca te same pola i wartości co przed zmianą.
4. Test jednostkowy `useMapSelection` (renderHook): `selectUnit('12')` ustawia `selectedTeryt` i `?u=12`; `goBack()` wraca do rodzica.
5. Zapasowy kolor `'rgb(238, 241, 239)'` w `mapStyle` zastąpiony wartością z `config/tokens.json` (jak w `layers/admin.ts`).

Poza zakresem: nowe funkcje, zmiany warstw, zmiany wyglądu.
```

### CC8.2a-1 – Logika kartogramu i ładowanie wartości · K · tor U + dane · fala 7

```markdown
Zadanie: CC8.2a-1 – logika kartogramu, ładowanie plików wartości i parametry ?i= ?y=

Wymaga na main: src/core/map/classes.ts#computeBreaks, src/core/profile/profile.ts#IndicatorValues, src/core/url/state.ts#readUrlState

Kontekst: klasy kolorów są w `src/core/map/classes.ts` (`computeBreaks`, `classify`, `classColorToken`). Typ pliku wartości to `IndicatorValues` z `src/core/profile/profile.ts` (`{ indicatorId, years, values: { [teryt]: (number|null)[] }, fetchedAt }`); pliki będą w `public/data/values/<id>.json` (serwowane jako `/data/values/<id>.json`). Wzór leniwego ładowania: `src/core/search/load-localities.ts`. Stan adresu: `src/core/url/state.ts` (`UrlState` ma już pola `i`, `y`, ale `readUrlState`/`writeUrlState` obsługują tylko `u`). To zadanie jest czystą logiką; mapę podłącza CC8.2a-2.

Cel dla użytkownika: brak widocznej zmiany.

Zakres (tylko te pliki):
- `src/core/url/state.ts` (tylko: obsługa `i` i `y` w `readUrlState` i `writeUrlState`)
- `src/core/data/load-values.ts` (nowy): `loadIndicatorValues(id, fetchImpl?)` → `Promise<IndicatorValues | null>`
- `src/core/map/choropleth.ts` (nowy): `buildChoropleth(...)` i `schemeFor(...)`
- `tests/unit/url-state.test.ts` (tylko dopisanie testów), `tests/unit/load-values.test.ts`, `tests/unit/choropleth.test.ts` (nowe)
- `docs/sessions/CC8.2a-1.md`

Warunki odbioru:
1. `readUrlState('?i=avg-wage&y=2023')` zwraca `{ i: 'avg-wage', y: 2023 }`; nieznane `i` (brak w `config/indicators.json`) i nieliczbowe `y` są pomijane; `writeUrlState({ i, y })` zachowuje inne parametry (`u`, `e2e`). Istniejące testy `url-state.test.ts` przechodzą bez zmian.
2. `loadIndicatorValues('population')` pobiera `/data/values/population.json` raz (pamięć podręczna, test z fałszywym fetch liczy wywołania); 404 lub błąd sieci zwraca `null` bez wyjątku.
3. `buildChoropleth({ values, units, level, year, n = 5, method = 'quantile' })` zwraca `{ year, breaks, scheme, classByTeryt }`: progi liczone ze WSZYSTKICH jednostek danego poziomu w kraju; `year` = podany, jeśli jest w `values.years`, inaczej ostatni rok z jakąkolwiek wartością na tym poziomie; brak wartości → `'no-data'`.
4. `schemeFor(numbers)` zwraca `'diverging'`, gdy są wartości ujemne i dodatnie, inaczej `'sequential'`.
5. Testy na `tests/fixtures/synthetic/values-sample.json` i fragmencie `public/data/units.json` (bez sieci).

Poza zakresem: warstwa na mapie, legenda, wybór wskaźnika.
```

### CC8.3a – Wybór wskaźnika (komponent) · K · tor K · fala 7

```markdown
Zadanie: CC8.3a – komponent wyboru wskaźnika, bez podpinania do mapy

Wymaga na main: config/indicators.json, src/core/profile/profile.ts#Indicator, src/components/ui/popover.tsx

Kontekst: lista 20 wskaźników jest w `config/indicators.json` (pola `id`, `name`, `unit`, `group`, `description`), typ `Indicator` w `src/core/profile/profile.ts`. Gotowe prymitywy UI: `src/components/ui/` (popover, button, tabs) i `src/view/ui/` (Icon, SearchField). Makieta: `docs/design/02-mapa-komputer.png` (panel wskaźnika). Podpięcie do mapy i adresu robi CC8.W.

Cel dla użytkownika: brak zmiany na stronie; gotowy komponent.

Zakres (tylko te pliki):
- `src/view/controls/IndicatorPicker.tsx` (nowy): props `{ indicators: Indicator[]; value: string | null; onChange: (id: string) => void }`
- `tests/unit/indicator-picker.test.tsx` (nowy)
- `docs/sessions/CC8.3a.md`

Warunki odbioru:
1. Lista pogrupowana według `group` (kolejność grup jak w pliku), przy każdym wskaźniku nazwa i jednostka; wybrany ma `aria-selected="true"`.
2. Pole filtrowania po nazwie (bez polskich znaków też działa: „ludnosc” znajduje „Ludność”); brak wyników → tekst „Brak wskaźnika o tej nazwie”.
3. Obsługa klawiatury: strzałki, Enter wybiera, Escape zamyka; `onChange` z `id` (test).
4. Pola dotykowe co najmniej 44 px (klasy), kolory i odstępy tylko z tokenów; najdłuższa nazwa wskaźnika zawija się (test po klasach).
5. NIE dodawaj sekcji do `/design` i NIE zmieniaj zrzutów wzorcowych.

Poza zakresem: podpięcie do mapy i `?i=` (CC8.W), suwak lat (CC8.3b).
```

### CC7.4a – Wykres lat w profilu · K · tor P · fala 7

```markdown
Zadanie: CC7.4a – mały wykres lat przy każdym wskaźniku w profilu

Wymaga na main: src/core/profile/profile.ts#buildProfile, src/view/profile/ProfileIndicatorRow.tsx

Kontekst: `buildProfile` (`src/core/profile/profile.ts`) zwraca dla wskaźnika tylko ostatnią wartość. Wiersz profilu: `src/view/profile/ProfileIndicatorRow.tsx`. Paczka `@observablehq/plot` jest w `package.json` (przeczytaj typy w `node_modules`). Dane testowe: `tests/fixtures/synthetic/profile-sample.json`, `values-sample.json`.

Cel dla użytkownika: w arkuszu profilu przy wartości widać mały wykres z kolejnych lat.

Zakres (tylko te pliki):
- `src/core/profile/profile.ts` (tylko: nowe pole `series: { year: number; value: number | null }[]` w `ProfileIndicatorItem`, z jednostki, z której pochodzi wartość)
- `src/view/profile/Sparkline.tsx` (nowy): props `{ series; unit; label }`, SVG z `@observablehq/plot`
- `src/view/profile/ProfileIndicatorRow.tsx` (tylko: wstawienie `Sparkline`)
- `tests/unit/profile.test.ts` (tylko dopisanie testów), `tests/unit/sparkline.test.tsx` (nowy)
- `docs/sessions/CC7.4a.md`

Warunki odbioru:
1. `series` ma wszystkie lata z pliku wartości w kolejności rosnącej; `null` zostaje `null` (przerwa w linii, nie zero).
2. `Sparkline` renderuje `<svg>` z `role="img"` i `aria-label` w rodzaju „Ludność ogółem, 2015–2024”; kolor linii przez `currentColor` lub `var(--tusz)`, bez hex.
3. Mniej niż 2 lata z wartością → brak wykresu i brak błędu.
4. Istniejące testy `profile.test.ts` i `profile-sheet.test.tsx` przechodzą bez zmian.
5. NIE zmieniaj `/design` ani zrzutów wzorcowych.

Poza zakresem: przypisy (CC7.4b), zakreślenie (CC7.4c).
```

### CC11.1a – Logika zgody · K · tor Z · fala 7

```markdown
Zadanie: CC11.1a – logika zgody na statystyki (bez wyglądu)

Wymaga na main: nic

Kontekst: plan (`docs/MASTER_PLAN.md`): statystyki wyszukiwań `posthog-js` (region EU) ładowane DOPIERO po zgodzie; bez zgody zero zdarzeń i ciasteczek. Tu powstaje tylko czysta logika; pasek i ładowanie biblioteki robi CC11.1b.

Cel dla użytkownika: brak widocznej zmiany.

Zakres (tylko te pliki):
- `src/core/consent/consent.ts` (nowy)
- `tests/unit/consent.test.ts` (nowy)
- `docs/sessions/CC11.1a.md`

Warunki odbioru:
1. Eksporty: `type Consent = 'granted' | 'denied'`, `readConsent(storage): Consent | null`, `writeConsent(storage, value)`, `clearConsent(storage)`, `shouldAskForConsent(storage): boolean`, `canLoadAnalytics(consent, key): boolean`, stała `CONSENT_KEY = 'fa-consent-v1'`.
2. Zapis zawiera datę (`{ value, at }` jako JSON); zgoda starsza niż 12 miesięcy traktowana jak brak (pytamy ponownie) – test na wstrzykniętym zegarze.
3. Uszkodzony wpis lub błąd `storage` (np. tryb prywatny, wyjątek przy `getItem`) → `null` bez wyjątku.
4. `canLoadAnalytics` zwraca `true` tylko dla `'granted'` i niepustego klucza.
5. Brak jakiegokolwiek importu `posthog-js` w tym pliku (test czyta źródło).

Poza zakresem: wygląd paska, ładowanie PostHog, strona prywatności.
```

### CC9.1a – Logika sceny wejścia · K · tor R · fala 7

```markdown
Zadanie: CC9.1a – oś czasu sceny „kreślenie” (czysta logika)

Wymaga na main: config/tokens.json

Kontekst: przy wejściu kontur Polski ma się narysować tuszem, potem wypełnienie, potem jedno zakreślenie. Czasy WYŁĄCZNIE z `config/tokens.json` → `motion` (`drawOutline` 1200, `base` 300, `slow` 600, `easing`). Przy `prefers-reduced-motion` brak animacji. Scenę na mapie zrobi CC9.1b.

Cel dla użytkownika: brak widocznej zmiany.

Zakres (tylko te pliki):
- `src/core/motion/timeline.ts` (nowy)
- `tests/unit/timeline.test.ts` (nowy)
- `docs/sessions/CC9.1a.md`

Warunki odbioru:
1. `buildIntroTimeline({ reducedMotion, motion })` zwraca etapy `[{ id: 'outline' | 'fill' | 'annotate', start, duration }]` po kolei, bez nakładania; czasy z przekazanego `motion` (test z `tokens.motion`).
2. `reducedMotion: true` → wszystkie `duration` = 0 i `start` = 0.
3. `stageAt(timeline, t)` zwraca `{ id, progress }` (0–1) dla czasu `t` w ms; przed startem `progress` 0, po końcu ostatni etap z `progress` 1.
4. `totalDuration(timeline)` zgodny z sumą etapów.
5. Brak liczb czasu wpisanych w kodzie (test: źródło nie zawiera `1200`, `300`, `600`).

Poza zakresem: rysowanie na mapie (CC9.1b).
```

### CC6.4c – Workflow „Fetch data” · C (Sonnet) + S · tor D · fala 7

Nie dla Julesa. Sonnet pisze `.github/workflows/fetch-data.yml` wg wzoru `bdl-record.yml`:
- ręczne uruchomienie (`workflow_dispatch`, pole `only`), sekret `BDL_CLIENT_ID`, gałąź docelowa `data/values` (nigdy main), `node scripts/data/fetch-values.mjs --skip-existing [--only=…]`;
- krok pobierania z limitem 135 min, zapis częściowy (`if: always()`), commit tylko `public/data/values/`; kolejne uruchomienie pobiera brakujące wskaźniki;
- podsumowanie w `GITHUB_STEP_SUMMARY`: raport skryptu (wskaźnik, rok, pokrycie).
Potem **Ty**: Actions → „Fetch data” → **Run workflow** (nie Re-run), aż raport pokaże 20/20. Sonnet otwiera PR z `data/values`, porównuje 3 liczby z bdl.stat.gov.pl (Polska, małopolskie, Zakopane – ludność i stopa bezrobocia) i scala.

## 3. Prompty – fala 8

### CC8.2a-2 – Warstwa kartogramu na mapie · K · tor M · fala 8

```markdown
Zadanie: CC8.2a-2 – mapa koloruje się wskaźnikiem z ?i= (i rokiem z ?y=)

Wymaga na main: src/view/map/hooks/useMapSelection.ts#useMapSelection, src/core/map/choropleth.ts#buildChoropleth, src/core/data/load-values.ts#loadIndicatorValues

Kontekst: logika kartogramu `buildChoropleth` (`src/core/map/choropleth.ts`), ładowanie `loadIndicatorValues` (`src/core/data/load-values.ts`), `?i=`/`?y=` w `readUrlState` (`src/core/url/state.ts`), tokeny kolorów klas `--seq-1…5`, `--div-1…5`, `--no-data` w `src/styles/tokens.css` (nazwę zwraca `classColorToken` z `src/core/map/classes.ts`). Mapa po CC4.S: `AtlasMap.tsx` + hooki w `src/view/map/hooks/`, warstwy przez rejestr `src/view/map/layers/registry.ts` (wzór: `layers/localities.ts`).

Cel dla użytkownika: wejście na `/?i=unemployment-rate` koloruje widoczne jednostki (województwa, po wejściu w głąb powiaty, gminy) według stopy bezrobocia; bez `?i=` mapa wygląda jak dotąd.

Zakres (tylko te pliki):
- `src/view/map/hooks/useChoropleth.ts` (nowy): wczytuje wartości dla `i`, liczy `buildChoropleth` dla poziomu z `drillState`
- `src/view/map/layers/choropleth.ts` (nowy; rejestracja `registerLayerFactory` w `AtlasMap.tsx`, jak `localitiesLayerFactory`)
- `src/view/map/layers/admin.ts` (tylko: pole `choropleth` w `LayerContext`)
- `src/core/map/test-seam.ts` (tylko: pole `choropleth: { indicatorId, year, level, classes } | null`)
- `src/view/map/AtlasMap.tsx` (tylko: rejestracja warstwy, wywołanie hooka i przekazanie do warstw)
- `tests/e2e/choropleth.spec.ts` (nowy; wartości syntetyczne zdefiniowane w samym pliku testu i podawane przez `page.route('/data/values/*.json')`)

Warunki odbioru:
1. `/?e2e&i=unemployment-rate` → `window.__atlas.choropleth` = `{ indicatorId: 'unemployment-rate', year: <ostatni rok z danych>, level: 'woj', classes: 5 }`, a w `layers` jest `choropleth-layer`.
2. Wejście w województwo → `level: 'pow'`; brak `?i=` → `choropleth: null` i brak `choropleth-layer`.
3. Kolory WYŁĄCZNIE z tokenów CSS przez `getComputedStyle` (nazwy z `classColorToken`), z zapasem z `config/tokens.json` → `data`; zmiana motywu przelicza kolory; aktualizacja koloru przez `updateTriggers` bez przebudowy geometrii.
4. Brak pliku wartości (404) → mapa jak bez `?i=`, bez błędu w konsoli.
5. Istniejące e2e przechodzą bez zmian. Opis sesji: `docs/sessions/CC8.2a-2.md`.

Poza zakresem: legenda i wybór wskaźnika na mapie (CC8.W), kreskowanie braków (CC8.4).
```

### CC8.3b – Suwak lat (komponent) · K · tor K · fala 8

```markdown
Zadanie: CC8.3b – komponent wyboru roku, bez podpinania do mapy

Wymaga na main: src/view/controls/IndicatorPicker.tsx#IndicatorPicker, src/components/ui/slider.tsx

Kontekst: wybór wskaźnika jest w `src/view/controls/IndicatorPicker.tsx` (wzór stylu i testów). Suwak bazowy: `src/components/ui/slider.tsx`. Podpięcie do mapy i `?y=` robi CC8.W.

Cel dla użytkownika: brak zmiany na stronie; gotowy komponent.

Zakres (tylko te pliki):
- `src/view/controls/YearSlider.tsx` (nowy): props `{ years: number[]; value: number; onChange: (year: number) => void }`
- `tests/unit/year-slider.test.tsx` (nowy)
- `docs/sessions/CC8.3b.md`

Warunki odbioru:
1. Suwak przyjmuje tylko lata z `years` (skoki po latach, nie co 1, gdy brakuje roku); bieżący rok widoczny jako tekst.
2. Klawiatura: strzałki zmieniają rok, Home/End pierwszy/ostatni; `aria-valuetext` = rok (test).
3. Jeden rok w `years` → sam tekst z rokiem, bez suwaka.
4. Pole dotykowe uchwytu co najmniej 44 px, tylko tokeny.
5. NIE zmieniaj `/design` ani zrzutów wzorcowych.

Poza zakresem: podpięcie (CC8.W).
```

### CC7.4b – Przypisy i źródła w profilu · K · tor P · fala 8

```markdown
Zadanie: CC7.4b – przypisy i źródła pod wskaźnikami w profilu

Wymaga na main: src/view/profile/Sparkline.tsx#Sparkline, src/core/format/number.ts#formatSource

Kontekst: profil: `src/view/profile/ProfileSheet.tsx` (wspólna treść `ProfileBody`), wiersze `ProfileIndicatorRow.tsx`. Wskaźniki mają opcjonalne pole `footnote` (`config/indicators.json`, typ `Indicator`), a `ProfileIndicatorItem.fromParent` mówi, że wartość pochodzi z jednostki wyższej. Źródło liczby: `formatSource(year)` z `src/core/format/number.ts`. Treść przypisów ogólnych: `docs/MASTER_PLAN.md` §4.2.

Cel dla użytkownika: pod wskaźnikami widać numerowane przypisy (np. „¹ dane dla powiatu tatrzańskiego”) i jedną listę przypisów na dole arkusza.

Zakres (tylko te pliki):
- `src/core/profile/footnotes.ts` (nowy): `collectFootnotes(items)` → numerowana lista bez powtórzeń
- `src/view/profile/Footnotes.tsx` (nowy)
- `src/view/profile/ProfileSheet.tsx` (tylko: `Footnotes` na końcu `ProfileBody`), `src/view/profile/ProfileIndicatorRow.tsx` (tylko: numer przypisu)
- `tests/unit/footnotes.test.ts`, `tests/unit/footnotes-view.test.tsx` (nowe)
- `docs/sessions/CC7.4b.md`

Warunki odbioru:
1. Te same treści przypisu dostają ten sam numer; numeracja w kolejności wystąpienia.
2. Wartość z `fromParent` ma przypis „dane dla <nazwa jednostki>” (nazwa z `units`).
3. Na dole arkusza: lista przypisów i jedno zdanie źródła „Źródło: GUS, Bank Danych Lokalnych…” (bez powtarzania przy każdym wierszu, jeśli rok wszędzie ten sam).
4. Numery przypisów jako `<sup>` z odnośnikiem do listy (dostępne z klawiatury).
5. Istniejące testy profilu przechodzą; bez zmian `/design` i zrzutów.

Poza zakresem: zakreślenie (CC7.4c).
```

### CC11.1b – Pasek zgody i ładowanie statystyk · K · tor Z · fala 8

```markdown
Zadanie: CC11.1b – pasek zgody i ładowanie PostHog dopiero po zgodzie

Wymaga na main: src/core/consent/consent.ts#readConsent, src/core/consent/consent.ts#canLoadAnalytics

Kontekst: logika zgody: `src/core/consent/consent.ts` (`readConsent`, `writeConsent`, `shouldAskForConsent`, `canLoadAnalytics`, `CONSENT_KEY`). Paczka `posthog-js` jest w `package.json`. Klucz projektu przychodzi ze zmiennej `VITE_POSTHOG_KEY` (ustawia właściciel w Vercel; w testach brak klucza). Region EU: `api_host: 'https://eu.i.posthog.com'`.

Cel dla użytkownika: przy pierwszej wizycie na dole ekranu pasek „Czy możemy liczyć anonimowo, czego szukasz?” z przyciskami „Zgadzam się” i „Nie”; wybór jest zapamiętany.

Zakres (tylko te pliki):
- `src/core/consent/analytics.ts` (nowy): `startAnalytics(key)` – dynamiczny `import('posthog-js')` tylko po zgodzie, `trackSearch(query)` bez danych osobowych
- `src/view/consent/ConsentBar.tsx` (nowy)
- `src/App.tsx` (tylko: jedna linia montująca `ConsentBar`)
- `tests/unit/consent-bar.test.tsx` (nowy), `tests/e2e/consent.spec.ts` (nowy)
- `docs/sessions/CC11.1b.md`

Warunki odbioru:
1. Bez zgody: ZERO żądań do `posthog.com` i zero ciasteczek (e2e: `page.on('request')` + `context.cookies()`), także po wyszukaniu w Ctrl+K.
2. `posthog-js` nie jest w paczce głównej (dynamiczny import; test e2e sprawdza, że skrypt nie ładuje się bez zgody).
3. „Nie” zamyka pasek na stałe; „Zgadzam się” zapisuje zgodę; pasek nie zasłania wyszukiwarki ani mapy na telefonie (390 px) – test po pozycji.
4. Przyciski min. 44 px, `role="region"` z `aria-label`, obsługa klawiatury; tylko tokeny.
5. Brak klucza `VITE_POSTHOG_KEY` → po zgodzie nic się nie ładuje, bez błędu.

Poza zakresem: strona /prywatnosc (CC11.2), zdarzenia inne niż wyszukiwanie.
```

### CC6.5b – Test kontraktu danych · K · tor D · fala 8

```markdown
Zadanie: CC6.5b – test kontraktu plików wartości

Wymaga na main: public/data/values/population.json, scripts/data/values.mjs#toIndicatorValues

Kontekst: pliki `public/data/values/<id>.json` tworzy `scripts/data/fetch-values.mjs` (CC6.4b) w workflow „Fetch data”. Kształt: typ `IndicatorValues` w `src/core/profile/profile.ts`. Lista wskaźników: `config/indicators.json`; jednostki: `public/data/units.json`. Test ma złapać zmianę formatu API albo zepsuty plik, zanim trafi na stronę.

Cel dla użytkownika: brak widocznej zmiany; zepsute dane zatrzymują CI.

Zakres (tylko te pliki):
- `scripts/data/contract.mjs` (nowy): `checkValuesFile(json, indicator, units)` → lista błędów
- `tests/unit/data-contract.test.ts` (nowy): sprawdza każdy plik w `public/data/values/`
- `docs/sessions/CC6.5b.md`

Warunki odbioru:
1. Dla każdego wskaźnika z `config/indicators.json` istnieje plik; `indicatorId` = nazwa pliku.
2. `years` rosnące, bez powtórzeń; każda tablica w `values` ma długość `years.length`; wartości to liczba albo `null`.
3. Klucze `values` to TERYT-y z `units.json`; co najmniej 95% jednostek poziomu `minLevel` ma wartość w ostatnim roku (inaczej błąd z nazwą wskaźnika i liczbą braków).
4. Brak wartości ujemnych dla wskaźników, które nie mogą być ujemne (wszystkie poza `natural-increase` i `migration-balance`).
5. Testy funkcji `checkValuesFile` na syntetycznych danych z błędami (każdy warunek osobno).

Poza zakresem: poprawianie danych, workflow.
```

### CC6.5a – Workflow nocny · C (Sonnet) · tor D · fala 8

Nie dla Julesa. `.github/workflows/nightly-data.yml`: codziennie ok. 03:10 czasu PL, `fetch-values.mjs` (bez `--skip-existing`), test kontraktu, przy zmianach PR z gałęzi `data/nightly` (nigdy push do main). Zgoda właściciela: 18.10.

### CC7.2b – Profil po kliknięciu w mapę · K · tor M · fala 8

```markdown
Zadanie: CC7.2b – wybranie jednostki na mapie otwiera profil

Wymaga na main: src/view/map/hooks/useChoropleth.ts#useChoropleth, src/view/profile/ProfileSheet.tsx#ProfileSheet, src/view/profile/ProfileSheetMobile.tsx#ProfileSheetMobile, src/core/data/load-values.ts#loadIndicatorValues

Kontekst: arkusze profilu są gotowe: `ProfileSheet` (komputer, props `{ profile, units, onClose }`) i `ProfileSheetMobile` (telefon, props `{ profile, units, isOpen, onClose }`) w `src/view/profile/`. Profil liczy `buildProfile(teryt, indicators, valuesById, units)` z `src/core/profile/profile.ts`; wartości wczytuje `loadIndicatorValues` (`src/core/data/load-values.ts`). Wybór jednostki: `useMapSelection` (`src/view/map/hooks/`). W `src/view/Home.tsx` jest pusty kontener `<div data-slot="side" />` na arkusz. Próg telefonu: `breakpoints.tablet` = 768 px w `config/tokens.json`.

Cel dla użytkownika: kliknięcie gminy (albo wybór w Ctrl+K) otwiera po prawej arkusz z jej wskaźnikami; na telefonie arkusz wysuwa się od dołu. Zamknięcie arkusza nie zmienia wyboru na mapie.

Zakres (tylko te pliki):
- `src/view/map/hooks/useProfile.ts` (nowy): wczytuje wartości wszystkich 20 wskaźników równolegle po pierwszym wyborze, liczy `buildProfile`
- `src/view/map/ProfilePortal.tsx` (nowy): `createPortal` do `[data-slot="side"]`, wybór wersji wg szerokości ekranu
- `src/view/map/AtlasMap.tsx` (tylko: render `ProfilePortal`)
- `src/core/map/test-seam.ts` (tylko: pole `profileOpen: boolean`)
- `tests/e2e/profile.spec.ts` (nowy; wartości syntetyczne w samym pliku testu, podawane przez `page.route('/data/values/*.json')`)
- `docs/sessions/CC7.2b.md`

Warunki odbioru:
1. `/?e2e&u=1217011` → widoczny arkusz z nazwą „Zakopane” i `window.__atlas.profileOpen === true`.
2. Przycisk zamknięcia i Escape zamykają arkusz (`profileOpen false`), `?u=` zostaje.
3. Szerokość 390 px → wersja telefonu (`ProfileSheetMobile`), 1440 px → komputer (test e2e na obu rozmiarach).
4. Brak plików wartości → arkusz z komunikatem o braku danych, bez błędu w konsoli.
5. Istniejące e2e przechodzą bez zmian.

Poza zakresem: legenda i wybór wskaźnika (CC8.W).
```

## 4. Prompty – stara fala 9 (ZASTĄPIONE 20.10 przez §6; nie wysyłać)

### CC8.W – Legenda, wybór wskaźnika i roku na mapie · K · tor M · fala 9

```markdown
Zadanie (ZASTĄPIONE przez CC13.B): CC8.W – podpięcie legendy, wyboru wskaźnika i roku do mapy

Wymaga na main: src/view/map/ProfilePortal.tsx#ProfilePortal, src/view/legend/Legend.tsx#Legend, src/view/controls/IndicatorPicker.tsx#IndicatorPicker, src/view/controls/YearSlider.tsx#YearSlider, src/core/legend/legend.ts#buildLegend

Kontekst: gotowe komponenty: `Legend` (`src/view/legend/Legend.tsx`, dane z `buildLegend` w `src/core/legend/legend.ts`), `IndicatorPicker` i `YearSlider` (`src/view/controls/`). Kartogram: `useChoropleth` (`src/view/map/hooks/useChoropleth.ts`) zwraca `year`, `breaks`, `scheme`. Stan adresu: `readUrlState`/`writeUrlState` z polami `i`, `y`. Kontener: `<div data-slot="overlay" />` w `src/view/Home.tsx`. Makieta: `docs/design/02-mapa-komputer.png`.

Cel dla użytkownika: na mapie jest panel „Wskaźnik” (wybór z listy), suwak lat i legenda; wybór zmienia kolory mapy i adres (`?i=`, `?y=`), który można wysłać komuś.

Zakres (tylko te pliki):
- `src/view/map/MapControls.tsx` (nowy): panel z `IndicatorPicker`, `YearSlider`, `Legend`, render przez portal do `[data-slot="overlay"]`
- `src/view/map/hooks/useChoropleth.ts` (tylko: zwracanie listy lat i funkcji zmiany `i`/`y` z zapisem do adresu)
- `src/view/map/AtlasMap.tsx` (tylko: render `MapControls`)
- `tests/e2e/map-controls.spec.ts` (nowy)
- `docs/sessions/CC8.W.md`

Warunki odbioru:
1. Wybór wskaźnika w panelu ustawia `?i=` i `window.__atlas.choropleth.indicatorId`; zmiana roku ustawia `?y=` i `choropleth.year`.
2. Wejście z adresem `/?i=avg-wage&y=2022` odtwarza wybór (panel pokazuje wskaźnik i rok).
3. Legenda pokazuje klasy bieżącego kartogramu i „brak danych”.
4. Na telefonie (390 px) panel jest zwinięty do jednego przycisku „Wskaźnik” i nie zasłania arkusza profilu (test po pozycji).
5. Istniejące e2e przechodzą; zrzuty /design bez zmian.

Poza zakresem: kreskowanie (CC8.4), porównanie (CC8.5).
```

### CC7.4c – Zakreślenie w profilu · K · tor P · fala 9

```markdown
Zadanie: CC7.4c – jedno zakreślenie najlepszego miejsca w rankingu w profilu

Wymaga na main: src/core/profile/footnotes.ts#collectFootnotes, src/view/annotation/Annotate.tsx

Kontekst: zakreślenia „czerwonym ołówkiem”: `Annotate` (`src/view/annotation/Annotate.tsx`) w `AnnotationProvider`; zasada STYL.md: najwyżej JEDNO zakreślenie na ekranie. Profil ma `rankNational`, `rankVoivodeship`, `neutral` (`src/core/profile/profile.ts`).

Cel dla użytkownika: w profilu jedna wyróżniona rzecz: wskaźnik, w którym jednostka wypada najlepiej w województwie (np. „1. miejsce w małopolskim”), jest zakreślona.

Zakres (tylko te pliki):
- `src/core/profile/highlight.ts` (nowy): `pickHighlight(items)` → `indicatorId | null`
- `src/view/profile/ProfileIndicatorRow.tsx` (tylko: zakreślenie dla wybranego)
- `src/view/profile/ProfileSheet.tsx` (tylko: przekazanie wyniku `pickHighlight`)
- `tests/unit/highlight.test.ts` (nowy)
- `docs/sessions/CC7.4c.md`

Warunki odbioru:
1. Wybierany wskaźnik nie-neutralny z najlepszym `rankVoivodeship` (remis → mniejszy `rankNational`, dalej kolejność w pliku); wskaźniki neutralne nigdy.
2. Brak rankingów → `null`, brak zakreślenia.
3. Test DOM: w profilu jest dokładnie jedno zakreślenie.
4. Przy `prefers-reduced-motion` zakreślenie bez animacji (jak w `Annotate`).
5. Bez zmian `/design` i zrzutów.

Poza zakresem: zakreślenia na mapie.
```

### CC11.2 – Strona /prywatnosc · K · tor Z · fala 9

```markdown
Zadanie: CC11.2 – strona „Prywatność”

Wymaga na main: src/view/consent/ConsentBar.tsx#ConsentBar, src/view/pages/About.tsx

Kontekst: strony statyczne: `src/view/pages/About.tsx`, `Sources.tsx` (wzór układu), trasy w `src/App.tsx`. Zgoda: `src/core/consent/consent.ts` (`clearConsent`, `readConsent`).

Cel dla użytkownika: pod adresem `/prywatnosc` prosty tekst: co liczymy (tylko anonimowe wyszukiwania, po zgodzie), gdzie (PostHog, serwery w UE), czego nie zbieramy, jak cofnąć zgodę; przycisk „Cofnij zgodę”.

Zakres (tylko te pliki):
- `src/view/pages/Privacy.tsx` (nowy)
- `src/App.tsx` (tylko: trasa `/prywatnosc`)
- `src/view/consent/ConsentBar.tsx` (tylko: odnośnik „Więcej” do `/prywatnosc`)
- `tests/e2e/privacy.spec.ts` (nowy)
- `docs/sessions/CC11.2.md`

Warunki odbioru:
1. `/prywatnosc` ma nagłówek h1 „Prywatność” i przechodzi axe bez błędów.
2. „Cofnij zgodę” usuwa zapis (`clearConsent`) i pokazuje komunikat; po odświeżeniu pasek zgody wraca.
3. Tekst prostym językiem, bez prawniczych formułek; daty i nazwy usług zgodne z `docs/MASTER_PLAN.md`.
4. Odnośnik w stopce/pasku działa z klawiatury.
5. Tylko tokeny; bez zmian zrzutów /design.

Poza zakresem: polityka cookies dla innych usług (nie ma innych).
```

### CC4.4 – Blady podkład przy dużym zbliżeniu · K · tor M · fala 9

```markdown
Zadanie (DO PRZEPISANIA w fali 10): CC4.4 – podkład OpenFreeMap (positron) od zoomu 9, bardzo blady

Wymaga na main: src/view/map/MapControls.tsx#MapControls, src/view/map/hooks/useMapColors.ts#useMapColors

Kontekst: styl mapy (`mapStyle`) jest w `src/view/map/AtlasMap.tsx` (tło `kalka`). Podkład wg `docs/MASTER_PLAN.md` §6: `https://tiles.openfreemap.org/styles/positron`, dane OSM (ODbL), atrybucja na mapie. W testach ŻADNYCH żądań do serwerów kafelków (`page.route('**/tiles.openfreemap.org/**', r => r.abort())`).

Cel dla użytkownika: po dużym zbliżeniu (od zoomu 9) pod granicami widać bardzo blade ulice i nazwy, żeby łatwiej się zorientować; przy mniejszym zbliżeniu mapa jak dotąd.

Zakres (tylko te pliki):
- `src/view/map/layers/basemap.ts` (nowy): budowa stylu z warstwą podkładu, przezroczystość z tokenów
- `src/view/map/AtlasMap.tsx` (tylko: użycie stylu z `basemap.ts`)
- `src/core/map/test-seam.ts` (tylko: pole `basemap: boolean`)
- `tests/e2e/basemap.spec.ts` (nowy)
- `docs/sessions/CC4.4.md`

Warunki odbioru:
1. `window.__atlas.basemap` = `false` przy zoomie < 9, `true` przy ≥ 9.
2. Widoczna atrybucja „© OpenStreetMap” przy włączonym podkładzie (tekst w DOM).
3. Testy nie wysyłają żądań do kafelków (blokada i licznik żądań = 0 przy zoomie < 9).
4. Brak sieci/kafelków → mapa działa jak bez podkładu, bez błędów w konsoli.
5. Istniejące e2e przechodzą bez zmian.

Poza zakresem: tryb ciemny podkładu (później).
```

## 5. Prompty – fala 8b (jakość: reguły w CI)

### CC12.1 – Test: kolory tylko z tokenów · K · tor T · fala 8b

```markdown
Zadanie: CC12.1 – test, który blokuje kolory wpisane na sztywno

Wymaga na main: config/tokens.json, src/styles/tokens.css, src/view/annotation/roughEllipse.ts

Kontekst: ten sam błąd wrócił 3 razy (#109, #122, #133): kolor wpisany w kodzie zamiast tokenu. Łapał go dopiero lokalny skrypt przy scalaniu, a poprawiał przeglądający. Teraz łapie go test w CI, a komunikat mówi, jak poprawić. Kolory wolno zapisać tylko w `config/tokens.json`, `src/styles/tokens.css` (generowany przez `scripts/tokens.mjs`) i `scripts/tokens.mjs`. W `src/` kolory idą z tokenów: klasy Tailwind z `@theme`, `var(--nazwa)` w CSS, w JS `tokensJson.color.<motyw>.<nazwa>` + `parseCssColor` (wzór: `src/view/map/AtlasMap.tsx`, `src/view/map/layers/choropleth.ts`). Jedyne obecne naruszenie: zapasowy `'#E3242B'` w `src/view/annotation/roughEllipse.ts`.

Cel dla użytkownika: brak widocznej zmiany; kolor spoza tokenów zatrzymuje CI z czytelnym komunikatem.

Zakres (tylko te pliki):
- `scripts/ci/color-rules.mjs` (nowy): `findHardcodedColors(path, text)` → `{ line, match }[]`
- `tests/unit/color-rules.test.ts` (nowy): przypadki wykrywane i niewykrywane
- `tests/unit/no-hardcoded-colors.test.ts` (nowy): przechodzi po wszystkich `src/**/*.{ts,tsx,css}` poza dozwolonymi plikami
- `src/view/annotation/roughEllipse.ts` (tylko: zapasowy kolor z `config/tokens.json` zamiast `'#E3242B'`)
- `docs/sessions/CC12.1.md`

Warunki odbioru:
1. Wykrywa: `#abc`, `#aabbcc`, `#aabbccdd` w kodzie; `rgb(`, `rgba(`, `hsl(`, `hsla(` z liczbą w środku; klasy Tailwind `-[#…]` i `-[rgb…]`; tablicę 3–4 liczb we właściwości o nazwie kończącej się na `Color`/`color` (np. `getFillColor: [200, 10, 10]`, `getLineColor: () => [0, 0, 0, 255]`).
2. Nie wykrywa: `rgb(${c[0]}, ${c[1]}, ${c[2]})` (szablon z tokenów), `var(--kalka)`, tekstu w komentarzach, kotwic i selektorów typu `'#main'`, `#u=1217011`, plików dozwolonych i katalogu `tests/`.
3. Obecny kod przechodzi (po poprawce `roughEllipse.ts`); zakreślenie dalej ma kolor `korekta` (test).
4. Komunikat błędu: `Kolor wpisany na sztywno: <plik>:<linia> (<wartość>). Użyj tokenu: klasa Tailwind z @theme, var(--nazwa) albo tokensJson.color.light.<nazwa> + parseCssColor. Zobacz AGENTS.md, sekcja „Zawsze”.`
5. Test, w którym do danych testowych wstawiony jest kolor w trzech formach (klasa, CSS, `getFillColor`), dostaje 3 trafienia.

Poza zakresem: konfiguracja oxlint, package.json (bez nowych zależności), inne pliki w `src/`.
```

### CC12.2 – Logika reguł PR · K · tor Q · fala 8b

```markdown
Zadanie: CC12.2 – logika reguł PR: ID zadania, zakres, pliki zapalne, nowe zależności

Wymaga na main: scripts/ops/merge.sh, AGENTS.md

Kontekst: dziś zakres PR sprawdza tylko lokalny `scripts/ops/merge.sh` (wyrażenie `Zakres[^\n]*\n(.*?)\n\s*\n` na treści issue) i bierze ID zadania wyłącznie z początku tytułu PR. Dlatego 4 PR (#119, #121, #130, #133) przeszły bez kontroli. PR-y Julesa mają w opisie `Fixes #<nr issue>`, a tytuł issue zaczyna się od ID (np. `CC7.4b – …`); gałęzie Julesa (`jules-<liczby>-<hash>`) ID nie zawierają. To zadanie to czysta logika i polecenie czytające plik JSON. Workflow, który zbiera dane z GitHuba i uruchamia polecenie, dopisze Sonnet (CC12.2w).

Cel dla użytkownika: brak widocznej zmiany; za chwilę każdy PR z plikiem spoza zakresu albo bez ID dostanie czerwone CI z komunikatem, co poprawić.

Zakres (tylko te pliki):
- `scripts/ci/pr-rules.mjs` (nowy): `findTaskId(input)`, `parseScope(issueBody)`, `matchGlob(pattern, path)`, `checkPr(input)` → `{ ok, taskId, errors: string[], warnings: string[] }`
- `scripts/ci/pr-rules-cli.mjs` (nowy): `node scripts/ci/pr-rules-cli.mjs <wejście.json>`; wypisuje błędy i ostrzeżenia po polsku, kod wyjścia 0 albo 1
- `tests/unit/pr-rules.test.ts` (nowy)
- `tests/fixtures/pr-rules/cc7.4b.json` (nowy): prawdziwy przypadek – treść promptu CC7.4b z `docs/FALE.md` jako treść issue + lista plików #132 (w tym `src/view/design/DesignPage.tsx`)
- `docs/sessions/CC12.2.md`

Wejście (`input`): `{ title, body, branch, labels: string[], files: { filename, status }[], linkedIssue: { number, title, body } | null, zapalne: string[], packageJson: { base, head } | null }`. Wzorce w `zapalne` i w zakresie: `**` = dowolne katalogi, `*` = dowolny fragment nazwy, ścieżka z `/` na końcu = cały katalog. Bez nowych zależności (własne dopasowanie wzorców).

Warunki odbioru:
1. ID zadania (`CC<liczba>(.<część>)*`): najpierw z tytułu `linkedIssue` (gdy treść PR ma `Fixes|Closes|Resolves|Zamyka #N`), potem z linii `Zadanie: <ID>` w treści, potem z dowolnego miejsca tytułu PR. Brak ID i brak etykiety `sprawdzone` → błąd: „Brak ID zadania. Dodaj w opisie PR linię `Fixes #<numer issue>` albo `Zadanie: CCx.y` (AGENTS.md, sekcja „Pull request”).”
2. Zakres = ścieżki w odwrotnych apostrofach z listy pod nagłówkiem `Zakres` w treści issue (dopiski typu „(nowy)”, „(tylko: …)” są pomijane). Zawsze dozwolone: `docs/sessions/<ID>.md`. Pliki zrzutów (`*-snapshots/`) dozwolone, ale z ostrzeżeniem. Plik spoza zakresu albo plik usunięty (`status: removed`) → błąd z listą plików, chyba że PR ma etykietę `sprawdzone`.
3. Plik pasujący do wzorca z `zapalne` bez etykiety `sprawdzone` → błąd: „PR zmienia plik zapalny <plik>. Potrzebny przegląd Sonneta; po przeglądzie dostanie etykietę `sprawdzone`.”
4. Nowy klucz w `dependencies` albo `devDependencies` (`head` względem `base`) bez etykiety `nowa-zaleznosc` → błąd z nazwą pakietu; sama zmiana wersji nie jest błędem.
5. Testy na każdy przypadek: ID z `Fixes`, z `Zadanie:`, ze środka tytułu (`feat(view): add YearSlider (CC8.3b)`), brak ID; plik w zakresie / poza / usunięty / katalog z `/`; zapalny z etykietą i bez; zależność nowa i zmiana wersji. Przypadek `cc7.4b.json` daje dokładnie jeden błąd: `src/view/design/DesignPage.tsx` poza zakresem.

Poza zakresem: `.github/` (workflow i lista zapalnych pisze Sonnet), zmiany w `scripts/ops/`.
```

### CC12.3 – Limit czasu zapytań BDL, zwarte pliki, raport danych · K · tor D2 · fala 8b

```markdown
Zadanie: CC12.3 – limit czasu zapytań do BDL, zapis plików bez wcięć i raport danych z plików

Wymaga na main: scripts/data/fetch-values.mjs#fetchWithRetry, public/data/values/population.json

Kontekst: `fetchWithRetry` w `scripts/data/fetch-values.mjs` ponawia odpowiedzi 429 i 5xx, ale nie ma limitu czasu, więc zawieszone połączenie trzyma workflow „Fetch data” aż do limitu 135 min. Pliki `public/data/values/<id>.json` są zapisywane z wcięciami (`JSON.stringify(result, null, 2)`, razem ok. 15 MB); strona pobiera plik przy wyborze wskaźnika. `docs/data-report.md` jest ręczny i nieaktualny (opisuje odkrywanie zmiennych z CC6.3). Kształt plików: typ `IndicatorValues` w `src/core/profile/profile.ts`; pliki mają też pola `fetchedAt` i `report`.

Cel dla użytkownika: wskaźniki ładują się szybciej (mniejsze pliki); zawieszone API kończy się czytelnym błędem po kilku minutach, a nie po dwóch godzinach; raport danych zawsze zgodny z plikami.

Zakres (tylko te pliki):
- `scripts/data/fetch-values.mjs` (tylko: opcja `timeoutMs` w `fetchWithRetry`, domyślnie 30000, przez `AbortSignal.timeout`; zapis bez wcięć)
- `scripts/data/values-report.mjs` (nowy): `buildValuesReport(files, indicators, units)` → tekst Markdown; uruchomiony bez argumentów zapisuje `docs/data-report.md` z plików `public/data/values/`
- `tests/unit/fetch-values-timeout.test.ts` (nowy)
- `tests/unit/values-report.test.ts` (nowy)
- `docs/data-report.md` (tylko: wynik `node scripts/data/values-report.mjs` na plikach z main)
- `docs/sessions/CC12.3.md`

Warunki odbioru:
1. Zapytanie bez odpowiedzi (atrapa `fetch`, która czeka w nieskończoność i reaguje na `signal`) kończy się po `timeoutMs` i jest ponawiane jak błąd 5xx; po ostatniej próbie błąd „Przekroczono limit czasu zapytania (<ms> ms, próby: <n>): <adres bez klucza>”. W teście `timeoutMs: 50` i krótkie odstępy, bez prawdziwej sieci.
2. Istniejące testy `tests/unit/fetch-values.test.ts` przechodzą bez zmian.
3. Nowe pliki wartości są zapisywane jako `JSON.stringify(result) + '\n'`; `loadIndicatorValues` czyta taki plik (test na danych syntetycznych).
4. Raport: tabela „wskaźnik → poziomy (woj./pow./gmi), lata od–do, % jednostek z wartością w ostatnim roku na najniższym poziomie, data pobrania (`fetchedAt`)” + nagłówek z informacją, że plik generuje skrypt. Test na danych syntetycznych; `docs/data-report.md` wygenerowany z plików na main.
5. Bez sieci w testach; klucz `BDL_CLIENT_ID` nie pojawia się w żadnym komunikacie (test).

Poza zakresem: przepisywanie istniejących plików wartości (zrobi to następne pobranie), workflow.
```

### Zadania Sonneta (C) – fala P

- **CC12.R – reguły gałęzi** (po upublicznieniu repo): ruleset na `main` przez API: wymagany PR, zakaz force-push i usuwania, scalanie tylko squash (w ustawieniach repo wyłączyć merge commit i rebase), wymagane sprawdzenia `verify` i `security`; tryb strict wyłączony. `zasady-pr` dochodzi jako wymagane po jednej fali obserwacji. Włączyć skanowanie sekretów z blokadą pushu i CodeQL (domyślna konfiguracja).
- **CC12.2w – workflow „Zasady PR”** (`.github/workflows/pr-rules.yml`, job `zasady-pr`): `pull_request` typy `opened, edited, synchronize, reopened, labeled, unlabeled`; zbiera przez `gh api` tytuł, treść, etykiety, pliki, powiązane issue i oba `package.json`, uruchamia `pr-rules-cli.mjs`. Przy `synchronize` zdejmuje etykietę `sprawdzone` (przegląd dotyczy tylko obejrzanych commitów). Do tego `.github/zapalne.txt` (`.github/**`, `scripts/ops/**`, `scripts/ci/**`, `scripts/data/**`, `src/view/map/AtlasMap.tsx`, `src/view/map/hooks/**`, `src/core/consent/**`, `src/view/consent/**`, `config/**`, `public/data/**`, `.oxlintrc.json`, `playwright.config.ts`, `vitest.config.ts`, `vercel.json`, `AGENTS.md`), `.github/pull_request_template.md` (pierwsza linia `Fixes #<nr issue>`, druga `Zadanie: CCx.y`), etykiety `sprawdzone`, `nowa-zaleznosc`, `aktualizuj-zrzuty`, dopiski do AGENTS.md (UZUPELNIENIE_WORKFLOW §4).
- **CC12.Z – zrzuty na etykietę**: `update-snapshots.yml` uruchamiany także etykietą `aktualizuj-zrzuty` na PR; odmowa dla `main`; po commicie zdejmuje etykietę i uruchamia CI przez `workflow_dispatch` (commity robota same CI nie uruchamiają, a `workflow_dispatch` – tak). `ci.yml` dostaje `workflow_dispatch`. Bez automatycznego scalania. Po wdrożeniu `snapshots.sh` i `kick-ci.sh` tylko wołają te workflowy.
- **CC12.D – dane same**: `fetch-data.yml` dostaje `schedule` (ok. 03:10 czasu PL, bez `--skip-existing`), `push` na `main` ze ścieżkami `scripts/data/**`, `config/indicators.json`; po pobraniu test kontraktu (CC6.5b) i liczby kontrolne (suma ludności województw 36–39 mln, 16 województw, ≥ 2 470 gmin); przy zmianach sam otwiera PR z `data/values` i uruchamia CI przez `workflow_dispatch`. Wymaga ustawienia „Allow GitHub Actions to create and approve pull requests”. Zastępuje CC6.5a.
- **CC12.B – bramki fal**: `scripts/gates/fala-<N>.sh` z komend w §1; `new-task.sh` przed zadaniem fali N uruchamia bramkę fali poprzedniej (kolumna „Fala” w §1) i zwraca `STOP: bramka fali … niespełniona: …`.
- **CC12.O – obieg i pomiar**: `.claude/agents/obieg.md` (`model: haiku`, narzędzia Bash i Read, treść = OPERACJE §3) i `.claude/agents/recenzent.md` (`model: sonnet`, przegląd wg PROMPTY.md §8, przy SCAL nadaje `sprawdzone`); OPERACJE §1/§3: obieg w nowej sesji albo jako podagent; raport fali z liczbami: `/usage` na start i koniec, wizyty Sonneta planowane/nieplanowane, liczba `STOP` i ich przyczyny.

## 6. Prompty – fala 9 (naprawa wg docs/PRODUKT.md) – zadania Julesa

Wszystkie: tylko **nowe pliki** albo wskazane fragmenty; **bez zmian** w `AtlasMap.tsx`, `Home.tsx`, `ProfileSheet*.tsx`, `src/view/map/hooks/*`, `/design` i zrzutach wzorcowych. Integrację w ekran robi Sonnet (§7).

### CC13.1 – Pliki profili per województwo + odczyt · K · tor D2 · fala 9

```markdown
Zadanie: CC13.1 – gotowe pliki profili dla każdego województwa i ich odczyt

Wymaga na main: src/core/profile/profile.ts#buildProfile, public/data/values/population.json, public/data/units.json, scripts/data/values-report.mjs

Kontekst: dziś wybór miejsca pobiera wszystkie 20 plików `public/data/values/*.json` (14 MB) i liczy profil w przeglądarce funkcją `buildProfile` (`src/core/profile/profile.ts`), co zacina stronę. Liczymy profile z góry: jeden plik na województwo zawiera gotowe wiersze profilu (wartość, rok, miejsca w rankingach, seria lat, `fromParent`) dla wszystkich jednostek tego województwa (samo województwo, jego powiaty i gminy). Strona pobiera jeden plik (ok. 100–250 kB po kompresji). Wzór skryptu z odczytem plików i testem: `scripts/data/values-report.mjs`.

Cel dla użytkownika: po wyborze miejsca profil pojawia się bez zacięcia (podłączy to Sonnet w CC13.A).

Zakres (tylko te pliki):
- `scripts/data/build-profiles.mjs` (nowy): `buildProfileShards(indicators, valuesById, units)` → `{ [wojTeryt]: Shard }`; uruchomiony bez argumentów czyta `config/indicators.json`, `public/data/units.json`, `public/data/values/*.json` i zapisuje `public/data/profiles/<woj>.json` (bez wcięć)
- `public/data/profiles/` (nowy katalog: 16 plików wygenerowanych skryptem z danych na main)
- `src/core/data/load-profile.ts` (nowy): `loadProfileShard(wojTeryt)` (jedno żądanie na województwo, pamięć podręczna, błąd sieci → `null`) i `profileFromShard(teryt, shard, indicators, units)` → `UnitProfile` (ten sam typ co `buildProfile`)
- `tests/unit/build-profiles.test.ts` (nowy)
- `tests/unit/load-profile.test.ts` (nowy)
- `docs/sessions/CC13.1.md`

Kształt `Shard`: `{ woj: string, generatedAt: string, units: { [teryt]: Array<{ indicatorId, year, value, rankNational, rankVoivodeship, totalNational, totalVoivodeship, neutral, fromParent?, years: number[], series: (number|null)[] }> } }`.

Warunki odbioru:
1. **Zgodność z `buildProfile`:** dla co najmniej 30 jednostek z danych na main (wszystkie 16 województw, 7 powiatów, 7 gmin, w tym gmina z `fromParent`) `profileFromShard(...)` daje to samo co `buildProfile(...)` (porównanie `toEqual` na `indicators`).
2. Każda jednostka z `units.json` jest w dokładnie jednym pliku (test zliczający 2875); plik zawiera tylko jednostki swojego województwa (prefiks TERYT).
3. Pliki zapisane bez wcięć; największy plik ≤ 2,5 MB przed kompresją (test).
4. `loadProfileShard` wykonuje jedno żądanie na województwo także przy dwóch równoczesnych wywołaniach; 404 albo błąd sieci → `null` bez wyjątku.
5. Bez sieci w testach; skrypt nie wywołuje API GUS.

Poza zakresem: podłączenie do mapy i profilu (CC13.A), workflow „Fetch data” (CC13.A).
```

### CC13.2 – Objaśnienia wskaźników: format, odczyt, przycisk (?) · K · tor E · fala 9

```markdown
Zadanie: CC13.2 – objaśnienia wskaźników: format danych, odczyt i przycisk (?)

Wymaga na main: src/components/ui/popover.tsx, src/core/profile/profile.ts#buildProfile, src/view/ui/Icon.tsx#Icon

Kontekst: użytkownik nie wie, co znaczą wskaźniki. Każdy wskaźnik dostanie krótkie objaśnienie w pliku `public/data/explanations.json` (treść przygotuje Sonnet z researchem, CC13.T; w tym zadaniu tylko format, odczyt i komponent). Opis pól: `docs/PRODUKT.md` §6. Popover: `src/components/ui/popover.tsx` (Radix). Walidacja: `zod` (jest w zależnościach, wzór w `src/core/bdl/schemas.ts`). Ikony tylko przez `Icon` z `src/view/ui/Icon.tsx` (iconoir-react).

Cel dla użytkownika: przy nazwie wskaźnika jest przycisk (?), który pokazuje prostą definicję, jak czytać liczbę, porównanie ze światem, ciekawostkę i źródła z linkami.

Zakres (tylko te pliki):
- `src/core/explain/explanations.ts` (nowy): `ExplanationSchema` (zod), typ `Explanation`, `loadExplanations()` – leniwie pobiera `/data/explanations.json` raz, waliduje, zwraca `Map<indicatorId, Explanation>`; brak pliku, błąd sieci albo zły wpis → pomija (pusta mapa / bez tego wpisu), bez wyjątku
- `src/view/explain/IndicatorInfo.tsx` (nowy): `<IndicatorInfo indicatorId name explanation? variant="popover"|"inline" />`; `popover` = przycisk (?) 44×44 px z `aria-label="Co to znaczy: <nazwa>"` otwierający popover; `inline` = ta sama treść w bloku (do rozwiniętego wiersza profilu); brak objaśnienia → nic nie renderuje
- `tests/fixtures/explanations.sample.json` (nowy): 2 poprawne wpisy + 1 błędny
- `tests/unit/explanations.test.ts` (nowy)
- `tests/unit/indicator-info.test.tsx` (nowy)
- `docs/sessions/CC13.2.md`

Format wpisu: `{ "indicatorId": string, "short": string ≤160, "howToRead": string ≤240, "world": { "text": string ≤240, "source": string, "url": string (https), "year": number } | null, "funFact": { "text": string ≤200, "source": string, "url": string (https) } | null, "definitionUrl": string (https) }`; plik = `{ "version": 1, "items": Entry[] }`.

Warunki odbioru:
1. Walidacja: przekroczony limit znaków, adres nie-https albo brak `short` → wpis odrzucony (test na pliku z fixtures: 2 poprawne, 1 odrzucony).
2. `loadExplanations` pobiera plik tylko raz przy wielu wywołaniach; 404 → pusta mapa bez błędu w konsoli.
3. `IndicatorInfo` (popover): klawiatura (Enter otwiera, Escape zamyka i oddaje fokus na przycisk), linki źródeł z `target="_blank" rel="noopener noreferrer"`, tekst wyłącznie jako tekst (bez HTML z danych).
4. `variant="inline"` pokazuje te same sekcje z nagłówkami „Co to jest”, „Jak czytać”, „Polska i świat”, „Ciekawostka”, „Źródła”; sekcje `null` są pomijane.
5. Tylko tokeny (kolory, odstępy), przycisk min. 44 px, axe bez błędów w teście DOM; bez zmian /design i zrzutów.

Poza zakresem: treść objaśnień (CC13.T), umieszczenie przycisku w panelu i profilu (CC13.B, CC13.C).
```

### CC13.3 – Czytelny wykres lat (TrendChart) · K · tor W · fala 9

```markdown
Zadanie: CC13.3 – czytelny wykres lat dla wskaźnika

Wymaga na main: src/view/profile/Sparkline.tsx#Sparkline, src/core/format/number.ts#formatValue

Kontekst: obecny `Sparkline` (`src/view/profile/Sparkline.tsx`, @observablehq/plot) jest za mały i bez lat, więc nic z niego nie widać. Potrzebny większy wykres do rozwiniętego wiersza profilu (podłączy go Sonnet w CC13.C). Liczby formatuje `formatValue(value, unit)` z `src/core/format/number.ts`. Seria: `{ year: number; value: number | null }[]` (pole `series` w `ProfileIndicatorItem`).

Cel dla użytkownika: po rozwinięciu wskaźnika widać, jak zmieniał się przez lata: oś lat, najniższa i najwyższa wartość, ostatnia wartość wyróżniona, wartość dowolnego roku po najechaniu albo dotknięciu.

Zakres (tylko te pliki):
- `src/view/profile/TrendChart.tsx` (nowy): `<TrendChart series unit label compareSeries? compareLabel? />`; szerokość 100% kontenera (ResizeObserver), wysokość z tokenów
- `tests/unit/trend-chart.test.tsx` (nowy)
- `docs/sessions/CC13.3.md`

Warunki odbioru:
1. Oś X z latami: zawsze pierwszy i ostatni rok, pomiędzy najwyżej 4 etykiety; oś Y z wartością minimalną i maksymalną sformatowaną przez `formatValue` (z jednostką).
2. Ostatnia wartość: punkt i podpis; lata z `null` są przerwą w linii (nie zerem).
3. Najechanie myszą albo dotknięcie pokazuje „<rok>: <wartość>” (tekst w DOM, `aria-live="polite"`); klawiatura: strzałki lewo/prawo przesuwają wskazany rok, gdy wykres ma fokus.
4. Opcjonalna seria porównawcza (`compareSeries`, np. średnia dla Polski) rysowana cieńszą linią z podpisem w legendzie; bez niej brak legendy.
5. Mniej niż 2 lata z wartością → tekst „Za mało danych do wykresu”; kolory z tokenów (`currentColor`/zmienne CSS), `aria-label` „<nazwa>, <rok od>–<rok do>”; bez zmian /design i zrzutów.

Poza zakresem: wstawienie wykresu do profilu (CC13.C), zmiana `Sparkline`.
```

### CC13.4 – Ranking jednostek + słupki (RankingBars) · K · tor U · fala 9

```markdown
Zadanie: CC13.4 – ranking jednostek dla wskaźnika i lista słupków

Wymaga na main: src/core/profile/profile.ts#buildProfile, src/core/units/units.ts#buildIndex, src/core/format/number.ts#formatValue

Kontekst: użytkownik chce zobaczyć jeden wskaźnik jako zestawienie miejsc (makieta `docs/design/03-profil-komputer.png`: słupki dla wszystkich województw, wybrane wyróżnione). Dane wskaźnika: typ `IndicatorValues` (`src/core/profile/profile.ts`, `values[teryt][indeks roku]`); jednostki: `Unit` z polami `teryt`, `name`, `level`, `parent` (`src/core/units/types.ts`); kierunek: `Indicator.higherIsBetter` (`true`/`false`/`null`). Remisy liczyć tak samo jak w `buildProfile`.

Cel dla użytkownika: lista „najwyżej / najniżej” w panelu mapy i słupki wszystkich jednostek w profilu; klik w nazwę wybiera jednostkę.

Zakres (tylko te pliki):
- `src/core/ranking/ranking.ts` (nowy): `rankUnits({ values, units, level, year, parentTeryt?, higherIsBetter })` → `{ teryt, name, value, rank, total }[]` od najlepszego (dla `null` od największej wartości); `topBottom(list, n)` → `{ top, bottom }`
- `src/view/ranking/RankingBars.tsx` (nowy): `<RankingBars items unit selectedTeryt? limit? onSelect? title? />`
- `tests/unit/ranking.test.ts` (nowy)
- `tests/unit/ranking-bars.test.tsx` (nowy)
- `docs/sessions/CC13.4.md`

Warunki odbioru:
1. `rankUnits`: jednostki bez wartości w danym roku pominięte (osobno liczba „brak danych”); remisy mają to samo miejsce; `parentTeryt` zawęża do jednostek danego województwa/powiatu; `higherIsBetter: false` odwraca kolejność. Zgodność miejsc z `rankNational` z `buildProfile` dla 5 wskaźników na danych z main (test).
2. `RankingBars`: nazwa, poziomy słupek proporcjonalny do wartości (wartości ujemne rysowane w lewo od linii zera), wartość przez `formatValue` czcionką mono; wybrana jednostka wyróżniona kolorem tokenu `korekta` i pogrubieniem (jak na makiecie 03).
3. `limit` (domyślnie 10): pokazuje pierwsze `limit` + wybraną jednostkę (jeśli dalej) + przycisk „Pokaż wszystkie (n)”.
4. Wiersze z `onSelect` są przyciskami (min. 44 px wysokości na dotyk, klawiatura), `aria-label` „<nazwa>: <wartość>, <miejsce>. miejsce”.
5. Tylko tokeny; bez zmian /design i zrzutów.

Poza zakresem: umieszczenie w panelu mapy i profilu (CC13.B, CC13.C).
```

### CC13.5a – Wyszukiwarka zamyka się krzyżykiem · K · tor S · fala 9

```markdown
Zadanie: CC13.5a – wyszukiwarka zamyka się krzyżykiem i Escape na stronie głównej

Wymaga na main: src/view/Header.tsx, src/view/search/SearchDialog.tsx#SearchDialog, src/view/ui/SearchField.tsx

Kontekst: na stronie głównej pole `#home-search-field` (`src/view/ui/SearchField.tsx`, tylko do odczytu) otwiera okno wyszukiwarki przy kliknięciu **i przy fokusie** (`src/view/Header.tsx`, nasłuch `focus`). Po zamknięciu okna (krzyżyk „Zamknij wyszukiwarkę” albo Escape) Radix oddaje fokus do tego pola, a fokus od razu otwiera okno ponownie – użytkownik widzi, że krzyżyk „nie działa”.

Cel dla użytkownika: krzyżyk i Escape zamykają wyszukiwarkę; pole na stronie dalej otwiera ją kliknięciem, Enterem i Ctrl+K.

Zakres (tylko te pliki):
- `src/view/Header.tsx` (tylko: otwieranie z pola strony głównej na kliknięcie oraz Enter/Spację, nie na sam fokus)
- `tests/e2e/search-close.spec.ts` (nowy)
- `docs/sessions/CC13.5a.md`

Warunki odbioru:
1. Strona główna: klik w pole → okno otwarte; klik w krzyżyk → okno zamknięte i **nadal zamknięte po 1 s**; fokus wraca na pole.
2. To samo dla Escape i dla kliknięcia w tło.
3. Tab na pole + Enter otwiera okno; Ctrl+K otwiera i zamyka jak dotąd.
4. Na telefonie (390 px) krzyżyk zamyka okno pełnoekranowe.
5. Istniejące testy `search.spec.ts` przechodzą bez zmian.

Poza zakresem: wygląd wyszukiwarki, wyniki.
```

### CC13.5b – Przypisy: separator i „powiat powiat” · K · tor P · fala 9

```markdown
Zadanie: CC13.5b – przypisy w profilu: rozdzielone numery i nazwa bez powtórzeń

Wymaga na main: src/core/profile/footnotes.ts#formatParentFootnoteText, src/view/profile/ProfileIndicatorRow.tsx#ProfileIndicatorRow

Kontekst: w profilu przypisy wyglądają źle: dwa numery przy jednym wskaźniku sklejają się w „¹³” (wygląda jak 13), a przypis o danych z jednostki wyższej brzmi „dane dla powiatu powiat chodzieski”, bo nazwy w `public/data/units.json` mają już słowo „powiat”/„gmina”. Funkcja: `formatParentFootnoteText` w `src/core/profile/footnotes.ts`; numery rysuje `ProfileIndicatorRow` (`src/view/profile/ProfileIndicatorRow.tsx`).

Cel dla użytkownika: „ludności¹˒³” i „dane dla: powiat chodzieski”.

Zakres (tylko te pliki):
- `src/core/profile/footnotes.ts` (tylko: `formatParentFootnoteText` – gdy nazwa zaczyna się od „powiat ”, „gmina ”, „miasto ” albo „województwo ”, tekst `dane dla: <nazwa>`; w pozostałych przypadkach jak dotąd)
- `src/view/profile/ProfileIndicatorRow.tsx` (tylko: między numerami przypisów separator „,” w indeksie górnym)
- `tests/unit/footnotes-format.test.ts` (nowy)
- `docs/sessions/CC13.5b.md`

Warunki odbioru:
1. Nazwa „powiat chodzieski” → „dane dla: powiat chodzieski”; nazwa „bolesławiecki” (bez słowa poziomu) → bez zmian: „dane dla powiatu bolesławiecki” (istniejące testy przechodzą bez zmian).
2. Dwa przypisy przy wskaźniku → w DOM dwa linki z numerami i separator „,” między nimi; jeden przypis → bez separatora.
3. Każdy numer to osobny link do `#footnote-<n>` z `title` = treść przypisu (jak dotąd).
4. Istniejące testy `footnotes*.test.ts*` i `profile-sheet*.test.tsx` przechodzą bez zmian.
5. Bez zmian /design i zrzutów.

Poza zakresem: nowy układ profilu (CC13.C).
```

### CC13.6 – Nazwy gmin z rodzajem · K · tor N · fala 9

```markdown
Zadanie: CC13.6 – nazwy gmin z rodzajem, żeby gminy o tej samej nazwie się nie myliły

Wymaga na main: src/core/units/units.ts#levelOf, src/view/map/Breadcrumbs.tsx#Breadcrumbs, src/view/search/SearchDialog.tsx#SearchDialog

Kontekst: w Polsce 143 pary gmin mają tę samą nazwę w jednym powiecie, np. „Wałcz” (TERYT 3217011, gmina miejska – samo miasto) i „Wałcz” (3217052, gmina wiejska – tereny wokół miasta). W `public/data/units.json` obie mają `name: "Wałcz"`, więc w wyszukiwarce, okruszkach i profilu wyglądają jak duplikat z różnymi liczbami. Rodzaj gminy jest w ostatniej cyfrze 7-cyfrowego TERYT: 1 – gmina miejska, 2 – gmina wiejska, 3 – gmina miejsko-wiejska. Nazwy powiatów mają już słowo „powiat”, województw – nie mają słowa „województwo”.

Cel dla użytkownika: wszędzie, gdzie widać nazwę gminy, widać też jej rodzaj: „Wałcz (miasto)”, „Wałcz (gmina wiejska)”, „Zakopane (miasto)”, „Krynica-Zdrój (gmina miejsko-wiejska)”.

Zakres (tylko te pliki):
- `src/core/units/label.ts` (nowy): `gminaKind(teryt)` → `'miasto' | 'gmina wiejska' | 'gmina miejsko-wiejska' | null`; `unitLabel(unit, { short? })` → nazwa do wyświetlenia (gminy z rodzajem w nawiasie; `short: true` – bez nawiasu, gdy w tym samym powiecie nie ma drugiej gminy o tej nazwie); `unitTitle(unit)` → nagłówek profilu: „Gmina miejska Wałcz”, „Gmina wiejska Wałcz”, „Powiat wałecki”, „Województwo zachodniopomorskie”
- `src/view/search/SearchDialog.tsx` (tylko: wyświetlana nazwa wyników jednostek przez `unitLabel`)
- `src/view/map/Breadcrumbs.tsx` (tylko: nazwa przez `unitLabel`)
- `tests/unit/unit-label.test.ts` (nowy)
- `docs/sessions/CC13.6.md`

Warunki odbioru:
1. Na danych z `public/data/units.json`: żadne dwie gminy w tym samym powiecie nie mają tej samej etykiety `unitLabel` (test na wszystkich 2479 gminach).
2. Wałcz 3217011 → „Wałcz (miasto)”, 3217052 → „Wałcz (gmina wiejska)”; `unitTitle` jak w Zakresie; powiat i województwo bez zmian w `unitLabel`.
3. Wyszukiwarka: „wałcz” pokazuje dwa wyniki z różnymi etykietami (test DOM albo e2e).
4. Okruszki pokazują etykietę z rodzajem; istniejące testy przechodzą bez zmian (jeśli któryś sprawdza dokładną nazwę gminy w okruszkach lub wynikach – napisz w PR i zatrzymaj się).
5. Bez zmian /design i zrzutów.

Poza zakresem: profil, panel mapy, ranking (Sonnet użyje `unitLabel`/`unitTitle` w CC13.B–C), dane `units.json`.
```

## 7. Zadania Sonneta – fala 9 (składanie ekranu; nie dla Julesa)

Każde: jedna gałąź, jeden PR, **przed scaleniem** Sonnet uruchamia stronę (`pnpm build && pnpm exec vite preview`, Playwright z przeglądarką z `/opt/pw-browsers`), przechodzi ścieżkę z PRODUKT.md §3–§5 na 1440×900 i 390×844, ogląda zrzuty i porównuje z makietą; w PR opisuje różnice. Testy e2e piszą się na `window.__atlas` i DOM (AGENTS.md).

- **CC13.A – szybkość** (tor M; część „profil” po CC13.1):
  1. `units.json` i `admin.topo.json` poza kodem: osobne pliki pobierane `fetch` przy starcie mapy (z pamięcią podręczną), nie `import` w `AtlasMap.tsx` i `useMapViewState.ts`; wyszukiwarka i okruszki korzystają z tej samej pamięci.
  2. `useProfile` korzysta z `loadProfileShard` + `profileFromShard` (CC13.1) zamiast 20 plików.
  3. `public/data/values/*.json` przepisane bez wcięć (jednorazowo skryptem albo „Fetch data” z `refresh=true`); „Fetch data” po pobraniu uruchamia też `build-profiles.mjs` i dołącza `public/data/profiles/` do PR.
  4. `tests/e2e/perf-budget.spec.ts`: na wejściu brak żądań `values/*` poza wskaźnikiem domyślnym i brak `profiles/*`; wybór jednostki = dokładnie 1 żądanie `profiles/*`; żaden plik JS > 2,5 MB przed kompresją; zmiana wskaźnika = najwyżej 1 żądanie.
  5. Nazwa niestabilnego testu e2e z adnotacji (od #155) → poprawka albo zgłoszenie.
- **CC13.B – ekran główny wg makiety 02 i PRODUKT.md §3** (tor M): układ (bez dużego nagłówka obok mapy; panel ≈ 400 px po lewej, mapa resztą szerokości), domyślny wskaźnik gęstość zaludnienia + poziom województwa, `IndicatorPicker` pod nazwą wskaźnika, przełącznik poziomu, `Legend`/`buildLegend` z opisem słownym, `YearSlider`, „Najwyżej / najniżej” (`rankUnits`/`topBottom` + `RankingBars`), dymek po najechaniu (zwykły tekst, „Otwórz profil”), (?) z `IndicatorInfo`; okruszki na mapie zamiast listy powiatów nachodzącej na mapę; wszystkie nazwy przez `unitLabel` (CC13.6). Test `tests/e2e/main-screen.spec.ts`: na wejściu `__atlas.choropleth.indicatorId === 'density'`; zmiana wskaźnika i roku zmienia `?i=`/`?y=`; najechanie pokazuje dymek; brak nachodzenia (prostokąty panelu, mapy i nagłówka się nie przecinają). Zrzuty /design odświeżone etykietą.
- **CC13.C – profil obok mapy wg makiety 03 i PRODUKT.md §4** (tor M): panel 440 px w układzie (mapa się zwęża, nic na mapie), zakładki Przegląd / Powiaty|Gminy / Porównaj (nieaktywna, „wkrótce”), bieżący wskaźnik z dużą liczbą i jednym zakreśleniem, `RankingBars` jednostek tego poziomu, grupy wskaźników jako rozwijane wiersze (`TrendChart` + `IndicatorInfo variant="inline"` + „Pokaż na mapie”), „Kopiuj link”; nagłówek przez `unitTitle`, nazwy w rankingu przez `unitLabel` (CC13.6). Test `tests/e2e/profile-panel.spec.ts`: otwarcie nie zmienia przybliżenia; „Pokaż na mapie” zmienia `__atlas.choropleth.indicatorId`; zamknięcie przywraca pełną szerokość; brak nachodzenia.
- **CC13.M – telefon wg makiety 04 i PRODUKT.md §5** (tor M): pasek wskaźnika na dole, arkusz z panelem wskaźnika, profil 40% wysokości z przeciąganiem; test 390×844 (brak poziomego przewijania, pola ≥ 44 px, arkusze się nie nakładają).
- **CC13.T – treść objaśnień** (tor E): polecenie dla Gemini z OPERACJE §7 dla 20 wskaźników → Sonnet otwiera każde źródło, poprawia, pilnuje limitów i uczciwych porównań (np. bezrobocie rejestrowane ≠ BAEL) → **właściciel akceptuje** listę w PR (tabela: wskaźnik → `short`) → `public/data/explanations.json`.
- **Na koniec fali (Sonnet):** `scripts/gates/fala-9.sh` przechodzi, `STAN_PROJEKTU.md` zaktualizowany, tabela pomiaru (OPERACJE §11), prośba do właściciela o test z OPERACJE §4.
