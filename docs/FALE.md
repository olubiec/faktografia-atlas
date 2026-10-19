# Fale 7–9: kolejka i gotowe prompty

Napisane 19.10.2026 przez Opusa. Na ich podstawie Haiku (albo właściciel) wysyła zadania bez pisania czegokolwiek od nowa.
Zasady pracy, role modeli i procedury: `docs/OPERACJE.md`. Wspólny blok promptów i zasady twarde: `docs/PROMPTY.md` §2 i §5.

**Najważniejsza zmiana względem PROMPTY.md:** prompty kolejnych fal są napisane z góry, bo każde zadanie wcześniejszej fali **dostaje w prompcie dokładne nazwy plików i eksportów**, z których korzystają późniejsze. Linia `Wymaga na main:` w każdym prompcie wymienia te pliki i eksporty; `scripts/ops/new-task.sh` sam sprawdza, czy są już na main, i nie wyśle zadania za wcześnie.

## 1. Kolejka (czytaj od góry; w każdym torze naraz najwyżej jedno zadanie)

Tor = grupa katalogów (PROMPTY.md §4.1). Limit 6 plików (§2.2) sprawdzony dla każdego promptu. Wyjątek od „logika i widok osobno”: w CC7.4a, CC7.4b i CC11.1b część logiki ma mniej niż 50 linii, więc idzie razem z widokiem. Nowe tory: **R** (`src/core/motion/`, czysta logika ruchu) i **Z** obejmuje teraz także `src/App.tsx`.

| Fala | Zadanie | Kto | Tor | Rusza, gdy | Kto sprawdza PR |
|---|---|---|---|---|---|
| 7 | CC4.S – rozbicie AtlasMap na hooki | J | M | teraz | Sonnet (plik zapalny) |
| 7 | CC8.2a-1 – logika kartogramu i ładowanie wartości | J | U + dane | teraz | Haiku (merge.sh) |
| 7 | CC8.3a – wybór wskaźnika (komponent) | J | K | teraz | Haiku |
| 7 | CC7.4a – wykres lat w profilu | J | P | teraz | Haiku |
| 7 | CC11.1a – logika zgody | J | Z | teraz | Haiku |
| 7 | CC9.1a – logika sceny wejścia | J | R | teraz | Haiku |
| 7 | CC6.4c – workflow „Fetch data” (wartości z GUS do PR) | C (Sonnet) + Ty klikasz | D | teraz | Sonnet sprawdza liczby |
| 8 | CC8.2a-2 – warstwa kartogramu na mapie | J | M | CC4.S i CC8.2a-1 scalone | Sonnet |
| 8 | CC8.3b – suwak lat (komponent) | J | K | CC8.3a scalone | Haiku |
| 8 | CC7.4b – przypisy i źródła w profilu | J | P | CC7.4a scalone | Haiku |
| 8 | CC11.1b – pasek zgody i ładowanie statystyk | J | Z | CC11.1a scalone | Sonnet (prywatność) |
| 8 | CC6.5b – test kontraktu danych | J | D | dane z CC6.4c na main | Haiku |
| 8 | CC6.5a – workflow nocny | C (Sonnet) | D | dane z CC6.4c na main | Sonnet |
| 8 | CC7.2b – profil po kliknięciu w mapę | J | M | CC8.2a-2 scalone | Sonnet |
| 9 | CC8.W – legenda, wybór wskaźnika i roku na mapie | J | M | CC7.2b, CC8.3b scalone | Sonnet |
| 9 | CC7.4c – zakreślenie w profilu | J | P | CC7.4b scalone | Haiku |
| 9 | CC11.2 – strona /prywatnosc | J | Z | CC11.1b scalone | Haiku |
| 9 | CC4.4 – blady podkład przy dużym zbliżeniu | J | M | CC8.W scalone | Sonnet |
| 10 | CC9.1b, CC8.4, CC8.5a/b, CC10.x | Opus pisze prompty | — | koniec fali 9 | — |

Bramki fali (sprawdza Sonnet albo Ty z listy w OPERACJE.md §4):
- **po fali 7:** `?i=` i `?y=` czytane z adresu (test), dane wartości na main, AtlasMap poniżej 200 linii;
- **po fali 8:** `/?i=unemployment-rate` koloruje mapę na podglądzie Vercel, kliknięcie gminy otwiera profil; **Ty: test na telefonie**;
- **po fali 9:** legenda, wybór wskaźnika i suwak działają na telefonie; zrzuty /design odświeżone.

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

## 4. Prompty – fala 9

### CC8.W – Legenda, wybór wskaźnika i roku na mapie · K · tor M · fala 9

```markdown
Zadanie: CC8.W – podpięcie legendy, wyboru wskaźnika i roku do mapy

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
Zadanie: CC4.4 – podkład OpenFreeMap (positron) od zoomu 9, bardzo blady

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
