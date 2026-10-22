# Architektura – warstwy, zadania, fale
Wg WORKFLOW UNIWERSALNY v5.3 §3c (`TRYB: WARSTWY`) i §3a (`TRYB: FALA`). Jedno źródło prawdy o tym, **z czego** zbudowana jest strona, **jakie zadania zostały** i **w jakich falach** je robimy.
Co ma widzieć użytkownik: `docs/PRODUKT.md` · gdzie jesteśmy: `docs/STAN.md` · elementy z zewnątrz i licencje: `docs/ELEMENTY.md` · wygląd: `docs/STYL.md`.
Plan przebudowany 22.10.2026. **Plan fal (§4) jest orientacyjny:** prompty do fali N pisze się dopiero po bramce fali N−1. Jeśli coś wyjdzie inaczej → `TRYB: ODŚWIEŻ`, a Planista poprawia kolejne fale tutaj.

**Jak z tego korzystać:**
- Prompt dla Julesa = **jedno zadanie z §3** (format v5.3 §9.1). Linie „Pliki”, „Gotowe, gdy”, „Nie ruszaj” przepisujesz z zadania; „Przeczytaj najpierw” zawsze zawiera `docs/PRODUKT.md` (sekcja ekranu) i tę sekcję zadania.
- Fala = zestaw zadań z §4, które idą do Julesa **naraz** (rozłączne pliki, zamknięte zależności).
- **Ostatni prompt każdej fali:** aktualizacja `docs/STAN.md` (v5.3 §9.2 „Zastąp docs/STAN.md dokładnie poniższą treścią”; treść daje Planista po bramce). W tabelach fal nie powtarzam tego za każdym razem.
- **Bramka fali:** zielone CI na `main` po scaleniu wszystkich PR fali; przy zadaniach widocznych (W2, W3) także Twoja ocena na podglądzie wg „Ty sprawdzasz”.

---

## 1. Warstwy i podzespoły (stan 22.10.2026)
Baza: **od zera** (bez cudzej bazy – `docs/BAZA.md` nie dotyczy). Projekt jest w **W2 – funkcje**. Podzespoły W1 potrzebne dla późniejszych funkcji robimy wcześniej, równolegle (nowe pliki, bez kolizji).

| Warstwa | Podzespół | Co robi (po ludzku) | Gdzie w kodzie | Stan |
|---|---|---|---|---|
| W0 | Fundament | szkielet Vite/React, CI (`testy`, `bezpieczenstwo`), tokeny, rejestr elementów | `package.json`, `.github/workflows/ci.yml`, `config/tokens.json`, `docs/ELEMENTY.md` | gotowe; sprzątanie pakietów – W0.1 |
| W1 | Dane | robot GUS, pliki wartości i profili, ładowanie z pamięcią podręczną | `scripts/data/`, `public/data/`, `src/core/data/` | gotowe; objaśnienia – W1.9, W1.10 |
| W1 | Jednostki i adres | lista jednostek, nazwy, stan w adresie `?u= ?i= ?y= ?l=` | `src/core/units/`, `src/core/url/state.ts` | gotowe; `?c=` – W1.8 |
| W1 | Mapa – podstawa | MapLibre + deck.gl, warstwy kolorów i obrysu, limity przybliżenia | `src/view/map/`, `src/core/map/` | gotowe |
| W1 | Mapa – ruch (logika) | parametry przejścia kamery; kolejność „kafelek po kafelku”; oś czasu sceny wejścia | `src/core/map/camera.ts`, `src/core/map/reveal.ts`, `src/core/motion/timeline.ts` | timeline gotowy; reszta – W1.4, W1.5 |
| W1 | Ranking i profil (logika) | miejsca w rankingu, sekcje profilu, trend w latach | `src/core/ranking/`, `src/core/profile/` | gotowe; trend – W1.1 (PR #198) |
| W1 | Kontekst i porównanie (logika) | „na tle kraju” liczone z danych; porównanie dwóch jednostek | `src/core/explain/context.ts`, `src/core/compare/compare.ts` | W1.6, W1.7 |
| W1 | Komponenty UI | przyciski, zakładki, zakreślenia, ikony, wykresy | `src/components/ui/`, `src/view/ui/`, `src/view/annotation/` | gotowe; arkusz dolny – W1.3 |
| W1 | Telefon – podstawa | jedno miejsce, które mówi „to jest telefon” (< 768 px) | `src/view/hooks/useIsMobile.ts` | W1.2 |
| W1 | Zgoda i statystyki | zgoda, PostHog po zgodzie | `src/core/consent/`, `src/view/consent/` | gotowe (klucz – „Później”) |
| W2 | Ekran główny (komputer) | panel wskaźnika, legenda, rok, najwyżej/najniżej, dymek | `src/view/main/`, `AtlasMap.tsx` | gotowe |
| W2 | Profil miejsca (komputer) | nagłówek, przegląd z rankingiem, zakładki, wiersze wskaźników | `src/view/profile/` | w toku – W2.1–W2.3 |
| W2 | Telefon | układ < 768 px, pasek i arkusz wskaźnika, profil w arkuszu, dymek, okruszki, zgoda | `Home.tsx`, `Header.tsx`, `AtlasMap.tsx`, `ProfilePortal.tsx`, `ProfileSheetMobile.tsx` | W2.4–W2.11 |
| W2 | Objaśnienia i „Na tle kraju” | blok kontekstu w profilu i panelu, legenda w trybie ciemnym | `src/view/explain/`, `src/view/legend/` | W2.12, W2.13 |
| W2 | Porównanie | dwa miejsca obok siebie, `?c=`, dwa obrysy | `src/view/profile/ProfileCompare*.tsx`, `layers/choropleth.ts` | W2.14–W2.17 |
| W3 | Ruch | płynna kamera, kafelki, przelewanie kolorów, scena wejścia | `useMapViewState.ts`, `layers/choropleth.ts`, `useChoropleth.ts` | W3.2–W3.5 |
| W3 | Szlif | sprzątanie zakreśleń, pomiar szybkości i płynności | całość | W3.1, W3.6 |

## 2. Zależności i pliki-węzły
**Zależności (→ = „potrzebuje”):**
- Profil W2.1 → W1 ranking/sekcje (gotowe). W2.2 → W2.1. W2.3 → W2.1, W2.2, W1.1.
- Telefon W2.4 → W1.2. W2.5 → W2.4, W1.3. W2.6 → W1.2, W1.3, W2.2. W2.7 → W2.6. W2.8 → W2.4. W2.9 → W2.4. W2.10 → –. W2.11 → W2.4–W2.10.
- Objaśnienia W2.12 → W1.6, W1.9 (opcjonalnie: bez W1.9 blok działa bez tekstów). W2.13 → –.
- Porównanie W2.14 → W1.7, W1.8, W2.2. W2.15 → W2.14. W2.16 → W1.8. W2.17 → W2.14–W2.16, W2.6.
- Ruch W3.2 → W1.4, W2.7 (kamera musi znać arkusz na telefonie). W3.3 → W1.5. W3.4 → W3.3. W3.5 → W3.2 (opcjonalne). W3.6 → W3.2–W3.4.
- Sprzątanie W3.1 → W2.1 (przegląd przejął jedyne zakreślenie).

**Pliki-węzły** (w jednej fali najwyżej jedno zadanie na węzeł; tabela kolizji w każdej fali §4):
`src/view/map/AtlasMap.tsx` · `src/view/profile/ProfileSheet.tsx` · `src/view/profile/ProfileSheetMobile.tsx` · `src/view/map/ProfilePortal.tsx` · `src/view/Home.tsx` · `src/view/main/IndicatorPanel.tsx` · `src/view/profile/ProfileIndicatorRow.tsx` · `src/view/map/hooks/useMapViewState.ts` · `src/view/map/layers/choropleth.ts` · `src/core/map/test-seam.ts` · `src/core/url/state.ts` · `config/tokens.json` · `package.json` / `pnpm-lock.yaml`.

**Jak je omijamy:** nowa rzecz dostaje własny plik (np. `ProfileOverview.tsx`, `MobileIndicatorBar.tsx`, `reveal.ts`). Gdy kilka zadań musi się podpiąć do tego samego węzła, pierwsze robi **przygotowanie** (puste miejsca podpięcia), a kolejne wypełniają swoje pliki bez dotykania węzła. Przykład: W2.4 tworzy pusty `MobileIndicatorBar.tsx` i podpina go w `AtlasMap.tsx`, więc W2.5 zmienia już tylko swój plik.

---

## 3. Zadania (wszystkie, wg warstw)
Każde zadanie = jeden prompt i jeden PR. Testy e2e mają w nazwie `@S<sesja>`. Rzutnie w testach UI: **1440×900** (komputer), **390×844** i **360×740** (telefon).
Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

### W0 – Fundament

#### W0.1 – Usunięcie nieużywanych pakietów · fala F1
- **Po ludzku:** mniej zbędnych bibliotek = mniej ryzyka i szybsza instalacja.
- **Pliki:** `package.json`, `pnpm-lock.yaml`, `docs/ELEMENTY.md` (wolno je zmienić).
- **Zadanie:** sprawdź grepem w `src/`, `scripts/`, `tests/` i CSS, że `nuqs`, `motion`, `tw-animate-css`, `d3-array`, `d3-scale` nie są importowane; usuń je `pnpm remove`; w `docs/ELEMENTY.md` skreśl wpisy z datą. Pakiet jednak używany → zostaw i napisz w PR gdzie.
- **Gotowe, gdy:** `pnpm install --frozen-lockfile` i pełny zestaw testów przechodzą; usuniętych pakietów nie ma w `package.json` ani w importach.
- **Ty sprawdzasz:** ✅ w PR; strona bez zmian.
- **Nie ruszaj:** kodu w `src/`, innych pakietów.

### W1 – Podzespoły

#### W1.1 – Trend w latach zamiast malutkiego wykresu (PR #198, S14.10) · fala F1
- **Stan:** PR gotowy, testy zielone. Bez promptu – tylko obejrzeć i scalić.
- **Ty sprawdzasz:** profil powiatu → w zwiniętym wierszu „Ludność ogółem” tekst typu „↗ +1,2% od 2020”, przy wskaźniku w % – „p.p.”; po kliknięciu wiersza pełny wykres.

#### W1.2 – Wykrywanie telefonu w jednym miejscu · fala F1
- **Po ludzku:** jedno źródło odpowiedzi „czy to telefon”, żeby wszystkie części strony przełączały się tak samo.
- **Pliki:** `src/view/hooks/useIsMobile.ts` (nowy), `tests/unit/use-is-mobile.test.tsx` (nowy).
- **Zadanie:** hook `useIsMobile()` oparty na `window.matchMedia('(max-width: <tablet−1>px)')`, próg z `config/tokens.json` `breakpoints.tablet` (768); reaguje na zmianę rozmiaru; bez `window` (SSR/test) zwraca `false`.
- **Gotowe, gdy:** testy: szerokość 390 → `true`, 1024 → `false`, zmiana zdarzenia `change` przełącza wynik; próg nie jest wpisany na sztywno.
- **Ty sprawdzasz:** ✅ (bez widocznej zmiany).
- **Nie ruszaj:** `ProfilePortal.tsx` (podpięcie w W2.6) i innych plików.

#### W1.3 – Wspólny dolny arkusz · fala F2
- **Po ludzku:** jeden porządny „wysuwany od dołu” element dla telefonu – użyją go arkusz wskaźnika i profil.
- **Pliki:** `src/view/ui/BottomSheet.tsx` (nowy), `src/view/test/UiTestPage.tsx` (dodanie przykładu), `tests/e2e/bottom-sheet.spec.ts` (nowy).
- **Zadanie:** komponent na istniejącym `react-modal-sheet` (bez nowych pakietów): propsy `isOpen`, `onClose`, `snapPoints` (np. `[0.4, 1]`), `initialSnap`, `title` (dla czytników), `children`; uchwyt do przeciągania, przycisk ×, Escape zamyka, odstęp `env(safe-area-inset-bottom)`, wysokość liczona od `dvh`, rola `dialog` z etykietą; styl z tokenów (bez cieni i zaokrągleń); opcja „bez tła” (mapa nad arkuszem pozostaje klikalna).
- **Gotowe, gdy (e2e na `/__test/ui`, 390×844):** otwarcie → wysokość 35–45% okna; przeciągnięcie uchwytu w górę → ≥ 90%; w dół z 40% → zamknięcie; × i Escape zamykają; w trybie „bez tła” klik w obszar nad arkuszem trafia w element pod spodem.
- **Ty sprawdzasz:** ✅; opcjonalnie `/__test/ui` na telefonie.
- **Nie ruszaj:** `ProfileSheetMobile.tsx` (przejście na nowy arkusz w W2.6), `src/view/ui/Sheet.tsx`.

#### W1.4 – Kamera: parametry płynnego przejścia · fala F2
- **Po ludzku:** obliczenia, jak kamera ma płynnie podjechać do miejsca (bez podpinania do mapy).
- **Pliki:** `src/core/map/camera.ts` (nowy), `tests/unit/camera.test.ts` (nowy), `config/tokens.json` (nowe czasy w `motion`: `cameraIn: 600`, `cameraOut: 400`, `revealTotal: 900`), `src/styles/tokens.css` (jeśli generuje go skrypt – tylko przez `pnpm tokens`).
- **Zadanie:** czysta funkcja `cameraTransition(from, to, kind: 'in'|'out'|'instant', reducedMotion)` → `{ duration, easing }` (krzywa z tokenów `motion.easing`); `instant` (wejście z linku, zmiana rozmiaru) i `reducedMotion` → `duration 0`.
- **Gotowe, gdy:** testy: `in` → 600, `out` → 400, `instant` → 0, `reducedMotion` → 0; czasy czytane z tokenów; test `tokens.test.ts` przechodzi.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `useMapViewState.ts` (podpięcie w W3.2).

#### W1.5 – Kolejność „kafelek po kafelku” · fala F2
- **Po ludzku:** obliczenie, w jakiej kolejności i z jakim opóźnieniem pojawiają się powiaty/gminy przy wejściu w głąb.
- **Pliki:** `src/core/map/reveal.ts` (nowy), `tests/unit/reveal.test.ts` (nowy).
- **Zadanie:** `revealPlan(units, origin, { total, minTile, reducedMotion })` → lista `{ teryt, order, delay, duration }`; kolejność od jednostki najbliższej `origin` (środek jednostki nadrzędnej) na zewnątrz wg odległości środków; deterministyczna (remis → TERYT); czasy przychodzą parametrem (bez importu tokenów).
- **Gotowe, gdy:** testy dla 12, 22 i 200 jednostek: ostatni kafelek kończy się ≤ `total` (900); każdy `duration` ≥ `minTile` (150); pierwszy = najbliższy środka; ta sama kolejność przy ponownym wywołaniu; `reducedMotion` → wszystkie `delay` i `duration` = 0.
- **Ty sprawdzasz:** ✅.

#### W1.6 – „Na tle kraju”: obliczenia · fala F3
- **Po ludzku:** z samych danych liczymy, czy wartość to dużo czy mało – działa też dla nowych wskaźników z nocnego robota.
- **Pliki:** `src/core/explain/context.ts` (nowy), `tests/unit/context.test.ts` (nowy).
- **Zadanie:** `context(values, units, teryt, year, higherIsBetter)` → `{ rank, total, percentBelow, medianPoland, min, max, position0to1, sameInVoivodeship: {…} | null }`; jednostki tego samego poziomu; braki danych pomijane; `higherIsBetter = null` → bez oceny, tylko położenie.
- **Gotowe, gdy:** testy na `tests/fixtures`: powiat → `total` = liczba powiatów z danymi; mediana policzona poprawnie dla parzystej i nieparzystej liczby; jednostka bez wartości → `null`; województwo → `sameInVoivodeship = null`.
- **Ty sprawdzasz:** ✅.

#### W1.7 – Porównanie dwóch miejsc: obliczenia · fala F3
- **Pliki:** `src/core/compare/compare.ts` (nowy), `tests/unit/compare.test.ts` (nowy).
- **Zadanie:** `compare(profileA, profileB)` → wiersze `{ indicatorId, a, b, diffText }`: jednostka `%` → różnica w p.p. („wyżej o 1,2 p.p.”), inne → procentowo względem B; brak wartości → „brak danych”; różne poziomy → flaga `differentLevels`; kolejność wskaźników jak w profilu.
- **Gotowe, gdy:** testy: %, wartości bezwzględne, zero w mianowniku (sam kierunek), braki, różne poziomy.
- **Ty sprawdzasz:** ✅.

#### W1.8 – Adres porównania `?c=` · fala F4
- **Pliki:** `src/core/url/state.ts`, `tests/unit/url-state.test.ts` (dopisanie nowych przypadków – istniejących nie zmieniasz).
- **Zadanie:** `readUrlState` / `writeUrlState` obsługują `c` = dokładnie dwa TERYT-y po przecinku (stringi, istniejące w indeksie jednostek); niepoprawne → `null`; `writeUrlState({ c: null })` usuwa parametr.
- **Gotowe, gdy:** testy: poprawna para, jeden TERYT, trzy, nieistniejący, usunięcie; pozostałe parametry bez zmian.
- **Ty sprawdzasz:** ✅.

#### W1.9 – Plik objaśnień wskaźników · fala F7 (po Twojej akceptacji tekstów)
- **Warunek:** przed falą akceptujesz teksty ze szkicu `docs/data/explanations-szkic.json` (Planista daje listę do przeczytania; ciekawostki tylko po `TRYB: RESEARCH` + `TRYB: WERYFIKACJA`).
- **Pliki:** `public/data/explanations.json` (nowy), `tests/unit/explanations-data.test.ts` (nowy).
- **Zadanie:** wgrać zaakceptowane wpisy (`short`, `howToRead`, `definitionUrl`, opcjonalnie `funFact` + `source` + `url`).
- **Gotowe, gdy:** test schematu: każdy klucz to istniejący `id` z `config/indicators.json`; `short` ≤ 160, `howToRead` ≤ 240, `funFact` ≤ 200 znaków; `funFact` zawsze ze `source` i `url`; plik bez wcięć.
- **Ty sprawdzasz:** w profilu rozwinięty wiersz „Gęstość zaludnienia” pokazuje prostą definicję i link „Definicja GUS”.

#### W1.10 – Raport „wskaźniki bez objaśnienia” · fala F7
- **Pliki:** `scripts/data/nightly-checks.mjs` (wolno zmienić w tym zadaniu), `tests/unit/nightly-checks.test.ts` (dopisanie przypadków).
- **Zadanie:** nocne sprawdzenia dopisują do raportu listę wskaźników z `config/indicators.json`, które nie mają wpisu w `public/data/explanations.json` (brak pliku = wszystkie).
- **Gotowe, gdy:** testy: plik brak / pełny / częściowy → poprawna lista; brak wpisów nie jest błędem (robot nie staje).
- **Ty sprawdzasz:** ✅.

#### W1.11 – Zwiad: dane „miasto / obszar wiejski” gmin miejsko-wiejskich · poza Julesem (dowolnie od F4)
- **Kto:** Ty + Gemini Deep Research (`TRYB: RESEARCH`, rodzaj [C]) → `TRYB: WERYFIKACJA` w Claude.
- **Pytanie:** czy BDL podaje dane dla części miejskiej i wiejskiej gmin miejsko-wiejskich (TERYT z końcówką 4 i 5) i dla których z 20 wskaźników.
- **Wynik:** 1 linia w „Decyzjach” w STAN.md + ewentualne nowe zadanie w §3 (W1/W2) dodane przez Planistę.

### W2 – Funkcje

#### W2.1 – Przegląd profilu: nagłówek, duża liczba, ranking, „Kopiuj link” (S14.3) · fala F1
- **Po ludzku:** górna część profilu wygląda jak makieta 03.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4, `docs/STYL.md` §7, `docs/design/03-profil-komputer.png`, `src/core/profile/sections.ts`, `src/core/ranking/ranking.ts`, `src/view/map/hooks/useMainView.ts`.
- **Pliki:** `src/view/profile/ProfileOverview.tsx` (nowy), `src/view/profile/ProfileSheet.tsx` (tylko `ProfileBody` i propsy), `src/view/profile/ProfileSheetMobile.tsx` (tylko przekazanie propsów), `src/view/map/ProfilePortal.tsx`, `src/view/map/AtlasMap.tsx` (tylko linia `<ProfilePortal …>`), `tests/e2e/profile-overview.spec.ts` (nowy).
- **Zadanie:**
  1. Nagłówek: `unitTitle(unit)` („Województwo małopolskie”, „Powiat wałecki”, „Gmina miejska Wałcz”) + mały „TERYT <kod>”; bez osobnej etykiety poziomu.
  2. `ProfileOverview` nad listą: nazwa wskaźnika i rok, **duża liczba** z jednostką, miejsce („2. miejsce wśród 16 województw” / „3. miejsce w województwie małopolskim” – opis z `rankingScope`); **jedno** zakreślenie typu `circle` wokół liczby; wiersze listy nie dostają już zakreślenia (w `ProfileBody` przestań przekazywać `isHighlighted`).
  3. Ranking: nagłówek „<Wskaźnik> we wszystkich województwach / w powiatach województwa X / w gminach województwa X”; istniejący `RankingBars`, 10 pozycji + „Pokaż wszystkie”, wybrana wyróżniona, nazwy przez `unitLabel`; klik = wybór jednostki.
  4. **Stan z jednego źródła:** `AtlasMap` przekazuje propsami `view` z `useMainView` (wskaźnik, rok, wartości) i `selectUnit` z `useMapSelection`: AtlasMap → ProfilePortal → ProfileSheet/ProfileSheetMobile → ProfileBody → ProfileOverview. Ranking: `rankUnits` na `view.values` (plik już w pamięci). **Nie** czytaj adresu w profilu samodzielnie (bez własnego `popstate`), nie wywołuj sztucznego `popstate`.
  5. Lista pozostałych wskaźników nie powtarza bieżącego. Stopka: „Kopiuj link” (bieżący adres; „Skopiowano” ok. 2 s, ogłaszane przez `aria-live="polite"`), pod nim przypisy i źródło.
- **Gotowe, gdy (e2e `@S14`):** powiat 3217 → „Powiat wałecki”, nigdzie „powiat powiat” ani „Powiat •”; gmina 3217011 → „Gmina miejska Wałcz”; zmiana wskaźnika w panelu zmienia przegląd bez przeładowania; `?u=12` → 10 pozycji, po „Pokaż wszystkie” 16, małopolskie wyróżnione, posortowane; powiat małopolski → tyle pozycji, ile powiatów `12xx`; klik w ranking zmienia `?u=`, nagłówek i `window.__atlas`; dokładnie jeden `.rough-annotation`; „Kopiuj link” → schowek zawiera `u=`; otwarcie profilu = jedno żądanie `profiles/*`, ranking = zero dodatkowych `values/*`; na 1440×900 nic nie zachodzi na siebie.
- **Ty sprawdzasz:** klik w małopolskie → „Województwo małopolskie”, duża liczba w kółku, „2. miejsce wśród 16 województw”, słupki 16 województw; klik w inne województwo w rankingu przełącza profil i mapę; zmiana wskaźnika od razu zmienia liczbę i słupki; „Kopiuj link”; tylko jedno zakreślenie.
- **Nie ruszaj:** `RankingBars.tsx`, `ranking.ts`, `sections.ts`, `load-profile.ts`, istniejących testów (przeszkadza → opisz w PR i stop), zrzutów; zakładek (W2.2); telefonu.

#### W2.2 – Zakładki profilu: Przegląd · Powiaty/Gminy (n) · Porównaj (S14.4) · fala F2
- **Pliki:** `src/view/profile/ProfileSheet.tsx` (tylko `ProfileBody`), `src/view/profile/ProfileChildren.tsx` (nowy), `tests/e2e/profile-tabs.spec.ts` (nowy).
- **Zadanie:** zakładki z `src/components/ui/tabs.tsx`: „Przegląd” (domyślna) · „Powiaty (n)” / „Gminy (n)” (`childUnits`; wiersze: `unitLabel`, wartość bieżącego wskaźnika z rokiem z tych samych `values`, malejąco, „brak danych” na końcu, klik = `onSelectUnit`; dla gminy brak tej zakładki) · „Porównaj” wyłączona z dopiskiem „wkrótce” (włączy ją W2.14). Zmiana jednostki → powrót na „Przegląd”.
- **Gotowe, gdy (`@S14`):** małopolskie → „Powiaty (n)” z prawdziwą liczbą, „Porównaj” wyłączona z „wkrótce”; lista posortowana, braki na końcu; klik w powiat → `?u=`, „Powiat …”, zakładka „Przegląd”, etykieta „Gminy (m)”; gmina bez zakładki listy; klawiatura (strzałki, Enter), role tablist/tab/tabpanel; przełączanie = zero żądań `/data/*`.
- **Ty sprawdzasz:** małopolskie → zakładki, „Powiaty (22)” z listą od największej; klik w powiat otwiera jego profil.
- **Nie ruszaj:** `ProfileOverview.tsx`, `ProfileIndicatorRow.tsx`, `ProfileSheetMobile.tsx`, `tabs.tsx`.

#### W2.3 – Test całej ścieżki profilu na komputerze (S14.6) · fala F3
- **Pliki:** `tests/e2e/s14-profile.spec.ts` (nowy). Kodu strony nie zmieniasz; błąd strony → opisz w PR i stop.
- **Gotowe, gdy:** „@S14 profil – komputer” (1440×900): `/` → wyszukiwarka „małopolskie” → nagłówek → przegląd z liczbą i rankingiem 16 → rozwinięcie „Stopa bezrobocia rejestrowanego” → „Pokaż na mapie” zmienia `?i=` i `window.__atlas` → „Powiaty (n)” → klik w pierwszy → „Powiat …”, zakładka „Przegląd”; każdy wybór jednostki = 1 żądanie `profiles/*`, zmiana wskaźnika ≤ 1 `values/*`, zakładki i rozwijanie = 0; brak „powiat powiat”, „undefined”, „NaN”; bez `waitForTimeout`; 3× z rzędu (`--repeat-each=3`).
- **Ty sprawdzasz:** ✅ i zdanie w PR „przeszedł 3 razy”.

#### W2.4 – Telefon: układ – cienki nagłówek, mapa na cały ekran, miejsca podpięcia (S15, przygotowanie) · fala F4
- **Po ludzku:** na telefonie mapa zajmuje prawie cały ekran; przygotowujemy miejsca, w które kolejne zadania wstawią pasek wskaźnika i okruszki.
- **Pliki:** `src/view/Header.tsx`, `src/view/Home.tsx`, `src/view/map/AtlasMap.tsx`, `src/view/main/MobileIndicatorBar.tsx` (nowy – na razie sam pasek z nazwą wskaźnika i rokiem, bez arkusza), `src/view/map/Breadcrumbs.tsx` (tylko nowy opcjonalny prop `onBack`), `tests/e2e/mobile-layout.spec.ts` (nowy).
- **Zadanie:** na `useIsMobile()`: nagłówek ≤ 56 px (logo, lupa, menu; „Motyw”, „O projekcie”, „Skąd są dane” w menu); `IndicatorPanel` nie jest renderowany nad mapą; mapa wypełnia resztę (`dvh`); na dole `MobileIndicatorBar` (≥ 48 px, `safe-area`); `AtlasMap` przekazuje do paska `view` i treść panelu (children) – W2.5 zrobi z tego arkusz; na telefonie nie renderuj osobnego `BackButton`, przekaż `onBack={goBack}` do `Breadcrumbs`. Komputer bez zmian.
- **Gotowe, gdy (`@S15`):** 390×844 i 360×740: mapa ≥ 75% wysokości okna, nagłówek ≤ 56 px, pasek pokazuje nazwę bieżącego wskaźnika i rok; na 1440×900 istniejące testy ekranu głównego bez zmian.
- **Ty sprawdzasz (telefon):** u góry tylko logo, lupa, menu; mapa prawie na cały ekran, od razu w kolorach; na dole pasek „Gęstość zaludnienia ▾ · 2025”.
- **Nie ruszaj:** `ProfilePortal.tsx`, `ProfileSheetMobile.tsx`, `ConsentBar.tsx`, `IndicatorPanel.tsx`.

#### W2.5 – Telefon: arkusz wskaźnika · fala F5
- **Pliki:** `src/view/main/MobileIndicatorBar.tsx`, `src/view/main/IndicatorPanel.tsx` (tylko wariant wyglądu „w arkuszu”), `tests/e2e/mobile-indicator-sheet.spec.ts` (nowy).
- **Zadanie:** dotknięcie paska otwiera `BottomSheet` (do ~85% wysokości) z treścią panelu (wybór wskaźnika, poziom, legenda, rok, najwyżej/najniżej); przewija się w środku, pole szukania wskaźnika zostaje widoczne; zmiana wskaźnika przekolorowuje mapę i zmienia `?i=`, arkusz zostaje otwarty; zamykanie: ×, przeciągnięcie w dół, dotknięcie mapy. Naraz najwyżej jeden arkusz (otwarcie profilu zamyka arkusz wskaźnika – zdarzenie/prop, bez zmian w `AtlasMap`).
- **Gotowe, gdy (`@S15`):** dotknięcie paska → arkusz; inny wskaźnik → `?i=` i `window.__atlas`; trzy sposoby zamknięcia (3 testy); ostatnią pozycję „najwyżej/najniżej” da się przewinąć i kliknąć.
- **Ty sprawdzasz:** dotknięcie paska wysuwa arkusz z wyborem wskaźnika, poziomem, legendą, rokiem i rankingiem; zamyka się przeciągnięciem w dół, × i dotknięciem mapy.
- **Nie ruszaj:** `AtlasMap.tsx`, `BottomSheet.tsx`.

#### W2.6 – Telefon: profil w arkuszu 40% → 100% · fala F5
- **Pliki:** `src/view/map/ProfilePortal.tsx`, `src/view/profile/ProfileSheetMobile.tsx`, `tests/e2e/profile-mobile.spec.ts` (nowy).
- **Zadanie:** najpierw ustal i opisz w PR, dlaczego dziś profil na telefonie trafia do kolumny pod mapą (`data-slot="side"`, `max-h-[45vh]`) zamiast pływać nad mapą; potem: `ProfilePortal` używa `useIsMobile()`; `ProfileSheetMobile` na `BottomSheet` (punkty 40% i 100%, tryb „bez tła”, treść `ProfileBody` bez zmian).
- **Gotowe, gdy (`@S15`):** po wyborze jednostki arkusz ma 35–45% okna; uchwyt w górę → ≥ 90%, widać zakładki; × zamyka, `?u=` znika, przybliżenie mapy bez zmian (`window.__atlas`); mapa nad arkuszem reaguje na dotyk.
- **Ty sprawdzasz:** wybór miejsca → profil od dołu na ~40% ekranu, nad nim mapa; przeciągnięcie w górę – cały ekran, w dół – 40%, dalej w dół lub × – zamyka.
- **Nie ruszaj:** `ProfileSheet.tsx`, `AtlasMap.tsx`, `useMapViewState.ts`.

#### W2.7 – Telefon: mapa pokazuje wybrane miejsce nad arkuszem · fala F6
- **Pliki:** `src/view/map/sheetInset.ts` (nowy – mały wspólny stan „ile ekranu zasłania arkusz”), `src/view/profile/ProfileSheetMobile.tsx` (zgłasza wysokość), `src/view/map/hooks/useMapViewState.ts` (dolny margines dopasowania = wysokość arkusza), `tests/e2e/profile-mobile-inset.spec.ts` (nowy).
- **Gotowe, gdy (`@S15`):** po wyborze powiatu na 390×844 bbox jednostki (z `window.__atlas`) mieści się nad górną krawędzią arkusza 40%; po zamknięciu arkusza widok nie skacze; komputer bez zmian.
- **Ty sprawdzasz:** wybrane miejsce widać nad profilem, nie chowa się pod nim.
- **Nie ruszaj:** `AtlasMap.tsx`, `ProfilePortal.tsx`.

#### W2.8 – Telefon: okruszki w jednej linii z „‹” · fala F5
- **Pliki:** `src/view/map/Breadcrumbs.tsx`, `src/view/map/BackButton.tsx` (jeśli zostaje nieużywany na telefonie – bez zmian), `tests/e2e/mobile-breadcrumbs.spec.ts` (nowy).
- **Zadanie:** na telefonie okruszki to jedna linia „‹ Polska / małopolskie” (długie nazwy skracane z końca środkowych elementów); „‹” = `onBack`.
- **Gotowe, gdy (`@S15`):** wysokość ≤ 48 px przy „powiat kędzierzyńsko-kozielski”; „‹” wraca poziom wyżej; klik w „Polska” wraca do kraju; komputer bez zmian.
- **Ty sprawdzasz:** u góry mapy krótka linia okruszków, strzałka „‹” cofa.
- **Nie ruszaj:** `AtlasMap.tsx`.

#### W2.9 – Telefon: dymek po pierwszym dotknięciu · fala F6
- **Pliki:** `src/view/map/AtlasMap.tsx` (obsługa dotknięcia), `src/view/main/UnitTooltip.tsx`, `tests/e2e/mobile-tooltip.spec.ts` (nowy).
- **Zadanie:** na telefonie pierwsze dotknięcie jednostki pokazuje dymek nad dolnym paskiem (nazwa, wartość, miejsce, przycisk „Otwórz profil” ≥ 44 px); drugie dotknięcie tej samej jednostki albo przycisk otwiera profil; dotknięcie pustego miejsca chowa dymek. Komputer bez zmian (najechanie).
- **Gotowe, gdy (`@S15`):** 1. dotknięcie → dymek, `?u=` bez zmian; 2. → profil; dymek mieści się w ekranie dla jednostki przy lewej i prawej krawędzi; zwykły tekst (bez HTML).
- **Ty sprawdzasz:** dotknięcie województwa → dymek z „Otwórz profil”; drugie dotknięcie otwiera profil.
- **Nie ruszaj:** `useMapViewState.ts`, `ProfilePortal.tsx`.

#### W2.10 – Telefon: mały pasek zgody · fala F4
- **Pliki:** `src/view/consent/ConsentBar.tsx` (tylko wygląd – logika zgody bez zmian; wolno w tym zadaniu), `tests/e2e/consent-mobile.spec.ts` (nowy).
- **Gotowe, gdy:** na 390×844 pasek ≤ 15% wysokości okna, przyciski w jednej linii; znika po wyborze; istniejące `consent.spec.ts` i `consent-bar.test.tsx` bez zmian.
- **Ty sprawdzasz:** pasek zgody nie zasłania mapy, najwyżej 2 linijki.
- **Nie ruszaj:** `src/core/consent/`.

#### W2.11 – Test całej ścieżki na telefonie (S15) · fala F7
- **Pliki:** `tests/e2e/s15-mobile.spec.ts` (nowy). Kodu nie zmieniasz.
- **Gotowe, gdy:** 390×844 i 360×740: start → pasek → zmiana wskaźnika → zamknięcie → dotknięcie województwa → dymek → profil 40% → pełna wysokość → „Powiaty (n)” → klik w powiat → ×; w całej ścieżce brak poziomego przewijania, 1 żądanie `profiles/*` na wybór, brak „undefined/NaN”; 3× z rzędu.
- **Ty sprawdzasz:** ✅; na swoim telefonie przejdź tę samą ścieżkę.

#### W2.12 – „Na tle kraju” w profilu i panelu (S17) · fala F11
- **Pliki:** `src/view/explain/ContextBlock.tsx` (nowy), `src/view/profile/ProfileIndicatorRow.tsx` (wstawienie bloku w rozwiniętym wierszu), `src/view/main/IndicatorPanel.tsx` (wstawienie bloku dla wybranej jednostki), `tests/e2e/context-block.spec.ts` (nowy).
- **Zadanie:** blok z `context()`: miejsce, „wyżej niż X% powiatów”, mediana Polski, najmniej–najwięcej, pozioma skala z kropką „tu jesteś” i kreską „mediana”; to samo w województwie (dla powiatów i gmin); pod spodem definicja z `explanations.json`, jeśli jest; „najwyżej/najniżej” w bloku klikalne (`onSelectUnit`). Źródło: „GUS, BDL, <rok>”.
- **Gotowe, gdy (`@S17`):** powiat → tekst „wyżej niż … % powiatów” z liczbą zgodną z `context()`; wskaźnik bez objaśnienia → sam blok, bez błędów; klik w „najwyżej” wybiera tę jednostkę; zero nowych żądań poza `explanations.json` (raz).
- **Ty sprawdzasz:** rozwinięty wiersz w profilu: czy to dużo czy mało, mediana Polski, skala z kropką.
- **Nie ruszaj:** `ProfileSheet.tsx`, `AtlasMap.tsx`.

#### W2.13 – Legenda w trybie ciemnym (S17) · fala F7
- **Pliki:** `src/core/legend/legend.ts`, `src/view/legend/Legend.tsx`, `src/view/main/IndicatorPanel.tsx` (tylko zdanie opisu legendy), `tests/unit/legend.test.ts` (dopisanie przypadków).
- **Zadanie:** legenda ma podpis kierunku „mniej → więcej”; zdanie „Ciemniej znaczy więcej” zależy od motywu (w ciemnym jest odwrotnie) albo jest zastąpione neutralnym.
- **Gotowe, gdy:** testy: w motywie ciemnym żaden opis nie mówi „ciemniej znaczy więcej”; w obu motywach jest „mniej → więcej”.
- **Ty sprawdzasz:** przełącz motyw na ciemny – legenda mówi „mniej → więcej”, opis się zgadza z kolorami.

#### W2.14 – Porównanie: wybór drugiego miejsca (S18) · fala F12
- **Pliki:** `src/view/profile/ProfileCompare.tsx` (nowy), `src/view/profile/ProfileSheet.tsx` (włączenie zakładki „Porównaj” i przycisku „Porównaj z innym miejscem”), `tests/e2e/compare-pick.spec.ts` (nowy).
- **Zadanie:** w zakładce pole wyszukiwania (istniejący mechanizm wyszukiwarki, bez nowego indeksu); wybór ustawia `?c=<bieżący>,<wybrany>` (W1.8); „×” przy drugim miejscu czyści `?c=`.
- **Gotowe, gdy (`@S18`):** wybór „Kraków” w profilu małopolskiego → `?c=12,1261`; odświeżenie strony przywraca porównanie; najwyżej 1 dodatkowe żądanie `profiles/*` (drugie województwo).
- **Ty sprawdzasz:** zakładka „Porównaj” działa, wpisujesz drugie miejsce.

#### W2.15 – Porównanie: tabela obok siebie (S18) · fala F13
- **Pliki:** `src/view/profile/ProfileCompareTable.tsx` (nowy), `src/view/profile/ProfileCompare.tsx` (wstawienie tabeli), `tests/e2e/compare-table.spec.ts` (nowy).
- **Zadanie:** wiersz na wskaźnik: wartości obu miejsc, miejsca w rankingu, `diffText` z `compare()`; kolor neutralny (bez zieleni/czerwieni); przy różnych poziomach dopisek „różne poziomy – porównuj ostrożnie”.
- **Gotowe, gdy (`@S18`):** liczba wierszy = liczba wskaźników z danymi w obu profilach; teksty różnic zgodne z `compare()`; zero dodatkowych żądań.
- **Ty sprawdzasz:** dwie kolumny i słowne „wyżej o …” w każdym wierszu.

#### W2.16 – Porównanie: dwa obrysy na mapie (S18) · fala F12
- **Pliki:** `src/view/map/layers/choropleth.ts` (warstwa obrysu dla dwóch jednostek), `src/view/map/AtlasMap.tsx` (przekazanie `c` z adresu), `tests/e2e/compare-map.spec.ts` (nowy).
- **Gotowe, gdy (`@S18`):** przy `?c=` `window.__atlas` pokazuje dwie obrysowane jednostki; bez `?c=` jak dotąd jedna; `drill.spec.ts`, `map.spec.ts` bez zmian.
- **Ty sprawdzasz:** oba porównywane miejsca obrysowane na mapie.

#### W2.17 – Porównanie na telefonie + test ścieżki (S18) · fala F14
- **Pliki:** `src/view/profile/ProfileCompareTable.tsx` (układ < 768 px), `tests/e2e/s18-compare.spec.ts` (nowy).
- **Gotowe, gdy:** na 360×740 tabela mieści się bez poziomego przewijania; „@S18” ścieżka komputer i telefon: profil → Porównaj → wybór → tabela → dwa obrysy → „Kopiuj link” zawiera `c=`; 3× z rzędu.
- **Ty sprawdzasz:** porównanie na telefonie, link otwiera to samo porównanie.

### W3 – Szlif

#### W3.1 – Sprzątanie zakreśleń w profilu · fala F3
- **Pliki:** `src/view/profile/ProfileIndicatorRow.tsx` (usunięcie nieużywanej ścieżki zakreślenia `highlight`), `src/core/profile/highlight.ts` i `tests/unit/highlight.test.ts` (usunięcie, jeśli po W2.1 nic ich nie używa – sprawdź grepem; prompt na to pozwala).
- **Gotowe, gdy:** w kodzie nie ma zakreśleń typu `highlight`; pozostałe testy zakreśleń przechodzą bez zmian.
- **Ty sprawdzasz:** w profilu nie ma grubego czerwonego markera zasłaniającego tekst.

#### W3.2 – Płynna kamera przy wejściu w głąb (S16) · fala F8
- **Pliki:** `src/view/map/hooks/useMapViewState.ts`, `src/view/map/AtlasMap.tsx` (przekazanie parametrów przejścia do mapy), `tests/e2e/camera.spec.ts` (nowy).
- **Zadanie:** zamiast natychmiastowego `setCurrentViewState` – przejście z `cameraTransition()` (wejście 600 ms, powrót 400 ms); wejście z linku i zmiana rozmiaru – bez animacji; gest użytkownika przerywa ruch; uwzględnia margines arkusza z W2.7.
- **Gotowe, gdy (`@S16`):** po kliknięciu województwa `window.__atlas.zoom` przyjmuje ≥ 3 wartości pośrednie, końcowy widok = dopasowanie do bbox; przeciągnięcie w trakcie zatrzymuje animację; `?u=12` z linku → od razu widok końcowy; `drill.spec.ts`, `map.spec.ts`, `map-zoom-out.spec.ts` bez zmian.
- **Ty sprawdzasz:** klik w województwo – kamera płynnie podjeżdża (~0,6 s), bez skoku; „Wróć” – szybciej odjeżdża; przeciągnięcie w trakcie przejmuje sterowanie.
- **Nie ruszaj:** `layers/choropleth.ts`.

#### W3.3 – Kafelki po kolei i wyblakła reszta kraju (S16) · fala F8
- **Pliki:** `src/view/map/layers/choropleth.ts`, `src/view/map/hooks/useChoropleth.ts`, `src/core/map/test-seam.ts` (stan `reveal: { running, progress }`), `tests/e2e/reveal.spec.ts` (nowy).
- **Zadanie:** przy wejściu w głąb jednostki niższego poziomu pojawiają się wg `revealPlan()` (podpowiedź: `DataFilterExtension` z `@deck.gl/extensions` – numer kolejności jako `getFilterValue`, animowany tylko `filterRange` / `filterSoftRange`; nie sprawdzi się → opisz w PR alternatywę przed zrobieniem); reszta kraju nadal rysowana, wyblakła (kolor/krycie z tokenów), bez interakcji; wejście z linku – od razu całość.
- **Gotowe, gdy (`@S16`):** w trakcie wejścia `window.__atlas.reveal.progress` rośnie 0 → 1 w ≤ 1 s; pierwszy widoczny = najbliższy środka; po wejściu w małopolskie jednostki spoza województwa są rysowane i nie reagują na najechanie; `prefers-reduced-motion` → progress od razu 1.
- **Ty sprawdzasz:** powiaty wypełniają się kolorem po kolei od środka; reszta Polski blednie, nie znika.
- **Nie ruszaj:** `useMapViewState.ts`, `AtlasMap.tsx`.

#### W3.4 – Przelewanie kolorów przy zmianie wskaźnika, roku, poziomu (S16) · fala F9
- **Pliki:** `src/view/map/layers/choropleth.ts` (przejście koloru wypełnienia 300 ms – `motion.base`), `tests/e2e/color-transition.spec.ts` (nowy).
- **Gotowe, gdy (`@S16`):** po zmianie wskaźnika `window.__atlas` raportuje trwające przejście, po ≤ 400 ms – nowe kolory; reduced motion → od razu.
- **Ty sprawdzasz:** zmiana wskaźnika lub roku – kolory łagodnie przechodzą.

#### W3.5 – Scena wejścia „kreślenie” (S16, opcjonalnie) · fala F9
- **Warunek:** W3.2 i W3.3 są płynne na Twoim telefonie (inaczej odkładamy do „Później”).
- **Pliki:** `src/view/map/IntroOverlay.tsx` (nowy, nakładka SVG), `src/view/Home.tsx` (podpięcie), `tests/e2e/intro.spec.ts` (nowy).
- **Zadanie:** raz na wizytę (pamięć w `sessionStorage` w try/catch): kontur Polski rysuje się w 1,2 s (`motion.drawOutline`), potem wypełnienie; oś czasu z istniejącego `src/core/motion/timeline.ts`; nie blokuje klikania; reduced motion → bez sceny.
- **Gotowe, gdy:** pierwsze wejście → scena trwa ≤ 2 s, drugie w tej samej sesji → brak; klik w trakcie działa.
- **Ty sprawdzasz:** pierwsze wejście – kontur Polski rysuje się tuszem.

#### W3.6 – Pomiar szybkości i płynności + test ścieżki (S16) · fala F10
- **Pliki:** `tests/e2e/s16-motion.spec.ts` (nowy), raport w opisie PR. Kodu nie zmieniasz.
- **Gotowe, gdy:** ścieżka z animacjami (wejście, powrót, zmiana wskaźnika) przechodzi 3×; progi żądań z `PRODUKT.md` §7 bez zmian; w PR: czas do kolorowej mapy i rozmiar JS na wejściu vs przed S16 (wzrost ≤ 5%).
- **Ty sprawdzasz:** na swoim telefonie animacje bez szarpania; jeśli szarpie → `TRYB: POMOC`.

### Później (bez fal; Planista dopisze zadania, gdy przyjdzie kolej)
Podstrony gmin pod wyszukiwarki (SEO; decyzja po W3.6) · blady podkład OpenFreeMap przy dużym zbliżeniu (nowy element → `TRYB: WYBÓR`, wpis w ELEMENTY) · kreskowanie „brak danych” · tryb ciemny mapy (makieta 05) · statystyki wyszukiwań po zgodzie (klucz PostHog) · tryb 3D „Arkusze” · wersja angielska.

---

## 4. Plan fal (orientacyjny)
Kolumna „Dotykają” = tabela kolizji: w jednej fali żaden plik się nie powtarza (węzły z §2 **pogrubione**). Po każdej fali: prompt „aktualizacja STAN.md”. Fala zawiera zadania rozłącznych plików z zamkniętymi zależnościami (v5.3 §3a/§3c).

### S14 – Profil na komputerze (F1–F3)
| Fala | Warstwa | Zadania naraz | Dotykają | Bramka / Ty poza Julesem |
|---|---|---|---|---|
| **F1** | W0, W1, W2 | W1.1 (PR #198 – scalić) · W2.1 przegląd profilu · W0.1 nieużywane pakiety · W1.2 `useIsMobile` | W1.1: `ProfileIndicatorRow.tsx`, `trend.ts` · W2.1: `ProfileOverview.tsx`, **`ProfileSheet.tsx`**, **`ProfileSheetMobile.tsx`**, **`ProfilePortal.tsx`**, **`AtlasMap.tsx`** · W0.1: **`package.json`**, **`pnpm-lock.yaml`**, `ELEMENTY.md` · W1.2: `useIsMobile.ts` | CI + ocena przeglądu profilu |
| **F2** | W1, W2 | W2.2 zakładki · W1.3 arkusz dolny · W1.4 kamera (logika) · W1.5 kolejność kafelków | W2.2: **`ProfileSheet.tsx`**, `ProfileChildren.tsx` · W1.3: `BottomSheet.tsx`, `UiTestPage.tsx` · W1.4: `camera.ts`, **`tokens.json`** · W1.5: `reveal.ts` | CI + ocena zakładek |
| **F3** | W1, W2, W3 | W2.3 test ścieżki profilu · W3.1 sprzątanie zakreśleń · W1.6 `context()` · W1.7 `compare()` | W2.3: `s14-profile.spec.ts` · W3.1: **`ProfileIndicatorRow.tsx`**, `highlight.ts` · W1.6: `context.ts` · W1.7: `compare.ts` | CI → **S14 zakończona** |
Odkładam: nic z S14. Wcześniej robimy logikę dla S15–S18 (W1.2–W1.7), bo to nowe pliki bez kolizji.

### S15 – Telefon od nowa (F4–F7)
| Fala | Warstwa | Zadania naraz | Dotykają | Bramka / Ty poza Julesem |
|---|---|---|---|---|
| **F4** | W1, W2 | W2.4 układ telefonu (przygotowanie) · W2.10 pasek zgody · W1.8 adres `?c=` | W2.4: `Header.tsx`, **`Home.tsx`**, **`AtlasMap.tsx`**, `MobileIndicatorBar.tsx`, `Breadcrumbs.tsx` · W2.10: `ConsentBar.tsx` · W1.8: **`state.ts`** | CI + ocena na telefonie · od teraz możesz zlecić W1.11 (Deep Research) |
| **F5** | W2 | W2.5 arkusz wskaźnika · W2.6 profil w arkuszu · W2.8 okruszki | W2.5: `MobileIndicatorBar.tsx`, **`IndicatorPanel.tsx`** · W2.6: **`ProfilePortal.tsx`**, **`ProfileSheetMobile.tsx`** · W2.8: `Breadcrumbs.tsx`, `BackButton.tsx` | CI + ocena na telefonie |
| **F6** | W2 | W2.7 mapa nad arkuszem · W2.9 dymek na telefonie | W2.7: `sheetInset.ts`, **`ProfileSheetMobile.tsx`**, **`useMapViewState.ts`** · W2.9: **`AtlasMap.tsx`**, `UnitTooltip.tsx` | CI + ocena na telefonie · **przed F7 akceptujesz teksty objaśnień** (dla W1.9) |
| **F7** | W1, W2 | W2.11 test ścieżki telefonu · W2.13 legenda ciemna · W1.9 plik objaśnień · W1.10 raport bez objaśnień | W2.11: `s15-mobile.spec.ts` · W2.13: `legend.ts`, `Legend.tsx`, **`IndicatorPanel.tsx`** · W1.9: `explanations.json` · W1.10: `nightly-checks.mjs` | CI → **S15 zakończona**. Brak akceptacji tekstów → W1.9 przechodzi do F11 |

### S16 – Ruch na mapie (F8–F10)
| Fala | Warstwa | Zadania naraz | Dotykają | Bramka / Ty poza Julesem |
|---|---|---|---|---|
| **F8** | W3 | W3.2 płynna kamera · W3.3 kafelki po kolei | W3.2: **`useMapViewState.ts`**, **`AtlasMap.tsx`** · W3.3: **`choropleth.ts`**, `useChoropleth.ts`, **`test-seam.ts`** | CI + ocena na telefonie i komputerze. W3.3 to zadanie o niepewnym wyniku – jeśli PR wskaże problem z techniką, `TRYB: ODŚWIEŻ` przed F9 |
| **F9** | W3 | W3.4 przelewanie kolorów · W3.5 scena wejścia (opcjonalnie) | W3.4: **`choropleth.ts`** · W3.5: `IntroOverlay.tsx`, **`Home.tsx`** | CI + ocena |
| **F10** | W3 | W3.6 pomiar i test ścieżki | `s16-motion.spec.ts` | CI + Twój test na telefonie → **S16 zakończona** |

### S17 – Objaśnienia i „Na tle kraju” (F11)
| Fala | Warstwa | Zadania naraz | Dotykają | Bramka / Ty poza Julesem |
|---|---|---|---|---|
| **F11** | W2 | W2.12 blok „Na tle kraju” (+ W1.9, jeśli przeszło z F7) | W2.12: `ContextBlock.tsx`, **`ProfileIndicatorRow.tsx`**, **`IndicatorPanel.tsx`** · (W1.9: `explanations.json`) | CI + ocena → **S17 zakończona**; wynik W1.11 → decyzja, czy dodać zadania „miasto / obszar wiejski” |

### S18 – Porównanie dwóch miejsc (F12–F14)
| Fala | Warstwa | Zadania naraz | Dotykają | Bramka / Ty poza Julesem |
|---|---|---|---|---|
| **F12** | W2 | W2.14 wybór drugiego miejsca · W2.16 dwa obrysy | W2.14: `ProfileCompare.tsx`, **`ProfileSheet.tsx`** · W2.16: **`choropleth.ts`**, **`AtlasMap.tsx`** | CI + ocena |
| **F13** | W2 | W2.15 tabela porównania | `ProfileCompareTable.tsx`, `ProfileCompare.tsx` | CI + ocena |
| **F14** | W2 | W2.17 telefon + test ścieżki | `ProfileCompareTable.tsx`, `s18-compare.spec.ts` | CI → **S18 zakończona**; potem Planista układa „Później” (`TRYB: WARSTWY` dla nowych podzespołów) |

**Podsumowanie:** 14 fal, 33 zadania dla Julesa (+ PR #198 i 1 zwiad poza Julesem). Zadania testowe (W2.3, W2.11, W3.6, W2.17) zamykają każdą sesję.

---

## 5. Dane

### 5.1 GUS BDL (jedyne źródło liczb)
- API `https://bdl.stat.gov.pl/api/v1`, nagłówek `X-ClientId` z sekretu `BDL_CLIENT_ID` (tylko w GitHub Actions), `format=json`, `lang=pl`, `page-size=100`.
- Limity z kluczem: 10/s, 500/15 min, 5000/12 h. Klient: kolejka `p-throttle` (8/s) + ponawianie przy 429 i 5xx (wykładniczo, maks. 5 prób).
- Pobieramy całe poziomy naraz: `data/by-variable/{varId}?unit-level=N&year=…` – nigdy jednostka po jednostce.
- Licencja danych CC BY 4.0. Przy każdej liczbie: „Źródło: GUS, Bank Danych Lokalnych, <rok>”.
- **Strona nigdy nie woła API GUS.** Dane pobiera robot do `public/data`.

### 5.2 Roboty danych (GitHub Actions)
| Workflow | Kiedy | Co robi |
|---|---|---|
| `fetch-data.yml` | co noc ok. 3:10 (cron `10 1 * * *`) i ręcznie | `pnpm data:fetch` → `public/data/values/*.json`, test kontraktu, przebudowa `public/data/profiles/*.json`; PR z gałęzi `data/nightly` tylko gdy dane się zmieniły; przy błędzie zgłoszenie |
| `fetch-localities.yml` | ręcznie (raz na jakiś czas) | `public/data/localities.json` z rejestru PRNG |
| `bdl-record.yml` | ręcznie | nagrania odpowiedzi BDL do `tests/fixtures/bdl/recorded/` (dane do testów) |
| `update-snapshots.yml` | ręcznie przez właściciela (etykieta `aktualizuj-zrzuty` na PR) | odświeża wzorce zrzutów Playwright na gałęzi PR |

### 5.3 Wskaźniki
- Katalog: `config/indicators.json` (20 wskaźników; pola: `id`, `bdlVarId`, `name`, `unit`, `description`, `group`, `higherIsBetter`, `minLevel`).
- Wskaźnik z poziomu wyższego niż jednostka → w profilu dopisek „dane dla powiatu X”. Wynagrodzenia: przypis „bez firm do 9 pracowników”. Samochody: „rejestracje flot leasingowych zawyżają niektóre miasta”.
- Domyślny wskaźnik ekranu głównego: gęstość zaludnienia (`DEFAULT_INDICATOR_ID` w `src/core/map/main-view.ts`).

### 5.4 Geometria i miejscowości
- Granice: `public/geo/admin.topo.json` (TopoJSON ≤ 3 MB, warstwy woj/pow/gmi, właściwości `{teryt, name}`), budowane ręcznie `pnpm geo` (źródło: repo waszkiewiczja/GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy, public domain; uproszczenie mapshaper – tylko narzędzie budowania).
- Miejscowości: TERYT SIMC + współrzędne z GUGiK PRNG, skrypt `pnpm localities`. Brak punktu → centroid gminy i `approx: true`.

### 5.5 Kontrakty plików
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

## 6. Architektura (jak to jest zbudowane)
- **Stos:** Vite + React + TypeScript (strict), pnpm, statyczne SPA na Vercel (podgląd każdego PR).
- **Podział:** `src/core` – czysta logika bez DOM (Vitest); `src/view` – React. `src/components/ui` – komponenty shadcn/ui przerobione na nasz styl.
- **Stan w adresie:** `?u=<teryt>&i=<wskaźnik>&y=<rok>&l=<poziom>` (później `&c=<teryt,teryt>`), czytany i zapisywany przez `src/core/url/state.ts`. Na ekranie jedno źródło stanu: `useMainView` (wskaźnik, rok, poziom, wartości) i `useMapSelection` (wybrana jednostka) w `AtlasMap` – inne komponenty dostają je propsami.
- **Mapa:** MapLibre (`react-map-gl/maplibre`) + deck.gl (`MapboxOverlay`), bez podkładu ulic – sama kalka z granicami. Testy mapy przez stan `window.__atlas` (tylko w trybie testowym, `src/core/map/test-seam.ts`), nie przez piksele.
- **Style:** Tailwind v4 (`@theme`), tokeny `config/tokens.json` → `scripts/tokens.mjs` → `src/styles/tokens.css`. Zero wartości wpisanych na sztywno (test `no-hardcoded-colors`).
- **Zrzuty:** `pnpm shots` zapisuje `docs/shots/*.jpg` (1440×900 i 390×844, widoki z `scripts/shots.config.json`); wzorce testów wizualnych tylko przez workflow „Update snapshots”.
- **Analityka:** PostHog (region EU) ładowany dopiero po zgodzie; klucz projektu publiczny z założenia.

---

## 7. Czego nie robimy (nigdy)
Konta użytkowników · wołanie API GUS z przeglądarki · liczby wpisane ręcznie albo przez AI · śledzenie osób (IP, fingerprint) · Google Maps jako mapa główna · pobieranie całego BDL · generator karuzel w tym repo (osobne, prywatne repo).
