# Architektura – warstwy, zadania, fale
Wg WORKFLOW UNIWERSALNY v5.3 §3c (`TRYB: WARSTWY`) i §3a (`TRYB: FALA`). Jedno źródło prawdy o tym, **z czego** zbudowana jest strona, **jakie zadania zostały** i **w jakich falach** je robimy.
Co ma widzieć użytkownik: `docs/PRODUKT.md` · gdzie jesteśmy: `docs/STAN.md` · elementy z zewnątrz i licencje: `docs/ELEMENTY.md` · wygląd: `docs/STYL.md`.
Plan przebudowany 22.10.2026, **v3 24.10.2026**: pomysły właściciela (porównanie z dwiema mapkami, pobieranie i udostępnianie – S19), fale przeliczone od stanu `main`, **v4 24.10.2026: 7 fal F1–F7 zamiast 13** (F1–F7), prowadzenie przez automat (`docs/AUTOMAT.md`). **v5 25.10.2026:** F1–F7 zrobione (33 zadania scalone, Twoja akceptacja K1–K5 z 25.10); dodane **S20** (miasto i wieś) i **S21** (biblioteka GUS): 24 małe zadania w falach F8–F12; fale puszcza Claude, Ty scalasz. **Plan fal (§4) jest orientacyjny:** prompty do fali N pisze się dopiero po bramce fali N−1. Jeśli coś wyjdzie inaczej → `TRYB: ODŚWIEŻ`, a Planista poprawia kolejne fale tutaj.

**Jak z tego korzystać:**
- Prompt dla Julesa = **jedno zadanie z §3** (format v5.3 §9.1). Linie „Pliki”, „Gotowe, gdy”, „Nie ruszaj” przepisujesz z zadania; „Przeczytaj najpierw” zawsze zawiera `docs/PRODUKT.md` (sekcja ekranu) i tę sekcję zadania.
- Fala = zestaw zadań z §4, które idą do Julesa **naraz** (rozłączne pliki, zamknięte zależności).
- **`docs/STAN.md`** aktualizuje automat na punktach kontrolnych (blok „Postęp” między znacznikami) – nie po każdej fali (decyzja 24.10.2026). Przy ręcznej pracy bez automatu: ostatni prompt fali jak dotąd.
- **Bramka fali:** zielone CI na `main` po scaleniu wszystkich PR fali. Od 24.10.2026 (automat) Twoja ocena „Ty sprawdzasz” **nie blokuje** fali – oglądasz zbiorczo na końcu każdej sesji (punkty kontrolne w §4); poprawki idą jako nowe zadania.
- **Wyjątki od „istniejących testów nie zmieniasz”** są tylko tam, gdzie zadanie wymienia konkretny plik i test (W2.4, W2.5) – to decyzja właściciela, nie furtka.

---

## 1. Warstwy i podzespoły (stan 22.10.2026)
Baza: **od zera** (bez cudzej bazy – `docs/BAZA.md` nie dotyczy). Projekt jest w **W2 – funkcje**. Podzespoły W1 potrzebne dla późniejszych funkcji robimy wcześniej, równolegle (nowe pliki, bez kolizji).

| Warstwa | Podzespół | Co robi (po ludzku) | Gdzie w kodzie | Stan |
|---|---|---|---|---|
| W0 | Fundament | szkielet Vite/React, CI (`testy`, `bezpieczenstwo`), tokeny, rejestr elementów | `package.json`, `.github/workflows/ci.yml`, `config/tokens.json`, `docs/ELEMENTY.md` | gotowe; sprzątanie pakietów – W0.1; zaostrzenie pnpm – W0.2 (poza falami) |
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
| W2 | Porównanie | dwa miejsca obok siebie, `?c=`, dwa obrysy, dwie mapki | `src/view/profile/ProfileCompare*.tsx`, `CompareMaps.tsx`, `layers/choropleth.ts` | W2.14–W2.17, W2.22 |
| W1 | Karty i dane do pobrania (logika) | formaty obrazków, CSV, mapa jako rysunek SVG, układ kart | `src/core/share/` | W1.12–W1.14 |
| W2 | Pobierz i udostępnij | okno z podglądem, PNG, CSV, systemowe udostępnianie | `src/view/share/`, przyciski w panelu, profilu i porównaniu | W2.18–W2.21, W2.23 |
| W3 | Ruch | płynna kamera, kafelki, przelewanie kolorów, scena wejścia | `useMapViewState.ts`, `layers/choropleth.ts`, `useChoropleth.ts` | W3.2–W3.5 |
| W3 | Szlif | sprzątanie zakreśleń, pomiar szybkości i płynności | całość | gotowe (W3.1, W3.6) |
| W1 | Miasto i wieś gmin m-w (dane) | lista 14 wskaźników, wyciąganie części miasto/wieś z odpowiedzi GUS, zapis przy nocnym pobieraniu, pliki na województwa, wczytywanie, wiersze tabeli | `config/parts.json`, `scripts/data/parts.mjs`, `scripts/data/build-parts.mjs`, `src/core/parts/`, `src/core/data/load-parts.ts` | W1.15–W1.20 |
| W2 | Miasto i wieś (ekran) | zwijany blok w profilu gminy miejsko-wiejskiej | `src/view/profile/ProfileParts.tsx` | W2.24–W2.26 |
| W1 | Biblioteka GUS (logika i dane) | spis z katalogu robota, wyszukiwanie i filtry, wczytywanie spisu i wartości z jednego adresu, link „zamów wskaźnik” | `scripts/data/library-index.mjs`, `src/core/library/` | W1.21–W1.24 |
| W2 | Biblioteka GUS (ekran) | strona `/biblioteka`: kategorie, szukanie, filtry, lista; strona wskaźnika z rankingiem, CSV i zamówieniem; odnośnik w nagłówku | `src/view/pages/Library*.tsx`, `src/view/library/` | W2.27–W2.38 |

## 2. Zależności i pliki-węzły
**Zależności (→ = „potrzebuje”):**
- Profil W2.1 → W1 ranking/sekcje (gotowe). W2.2 → W2.1. W2.3 → W2.1, W2.2, W1.1.
- Telefon W2.4 → W1.2. W2.5 → W2.4, W1.3. W2.6 → W1.2, W1.3, W2.2. W2.7 → W2.6. W2.8 → W2.4. W2.9 → W2.4. W2.10 → –. W2.11 → W2.4–W2.10.
- Objaśnienia W2.12 → W1.6, W1.9 (opcjonalnie: bez W1.9 blok działa bez tekstów). W2.13 → –.
- Porównanie W2.14 → W1.7, W1.8, W2.2. W2.15 → W2.14. W2.16 → W1.8. W2.17 → W2.14–W2.16, W2.6.
- Ruch W3.2 → W1.4, W2.7 (kamera musi znać arkusz na telefonie). W3.3 → W1.5. W3.4 → W3.3. W3.5 → W3.2 (opcjonalne). W3.6 → W3.2–W3.4.
- Sprzątanie W3.1 → W2.1 (przegląd przejął jedyne zakreślenie).
- Udostępnianie W1.14 → W1.12, W1.13. W2.18 → W1.14. W2.19 → W2.18. W2.20 → W2.18, W2.1. W2.22 → W1.13, W2.14. W2.21 → W2.18, W2.15, W2.22. W2.23 → W2.19–W2.22.
- Miasto i wieś (S20) W1.15, W1.16 → –. W1.17 → W1.15, W1.16. W1.18 → W1.16. W1.19 → W1.16. W1.20 → W1.15, W1.16. W2.24 → W1.20. W2.25 → W2.24, W1.19. W2.26 → W2.25.
- Biblioteka (S21) W1.21–W1.24 → – (poprawki po researchu: W1.25 → W1.21; W1.26 → W1.22; W1.27 → W1.24; W2.28–W2.33 → W1.25, W1.26) (kształt plików w §5.5, zadania niezależne). W2.27 → W1.22, W1.23. W2.34 → W1.23. W2.35 → W1.24, W1.27. W2.28–W2.31 → W2.27, W1.22. W2.33 → W1.23, W2.27, W2.34, W2.35. W2.32 → W2.27–W2.31. W2.36 → W2.27. W2.37 → W2.32, W2.33, W2.36. W2.38 → W2.6.

**Pliki-węzły** (w jednej fali najwyżej jedno zadanie na węzeł; tabela kolizji w każdej fali §4):
`src/view/map/AtlasMap.tsx` · `src/view/profile/ProfileSheet.tsx` · `src/view/profile/ProfileSheetMobile.tsx` · `src/view/map/ProfilePortal.tsx` · `src/view/Home.tsx` · `src/view/main/IndicatorPanel.tsx` · `src/view/profile/ProfileIndicatorRow.tsx` · `src/view/map/hooks/useMapViewState.ts` · `src/view/map/layers/choropleth.ts` · `src/core/map/test-seam.ts` · `src/core/url/state.ts` · `config/tokens.json` · `package.json` / `pnpm-lock.yaml` · `src/view/profile/ProfileCompare.tsx` (od W2.14) · `src/view/profile/ProfileOverview.tsx` (od W2.1).

**Nowe węzły S21:** `src/App.tsx` (trasy – tylko W2.27 w F9 i W2.33 w F10), `src/view/pages/Library.tsx` (W2.27 w F9, W2.32 w F11), `src/view/pages/LibraryVariable.tsx` (W2.33 w F10). Szkielety czterech komponentów biblioteki (W2.27) są właśnie „miejscami podpięcia”: W2.28–W2.31 wypełniają je równolegle, nie dotykając strony.

**Jak je omijamy:** nowa rzecz dostaje własny plik (np. `ProfileOverview.tsx`, `MobileIndicatorBar.tsx`, `reveal.ts`). Gdy kilka zadań musi się podpiąć do tego samego węzła, pierwsze robi **przygotowanie** (puste miejsca podpięcia), a kolejne wypełniają swoje pliki bez dotykania węzła. Przykład: W2.4 tworzy pusty `MobileIndicatorBar.tsx` i podpina go w `AtlasMap.tsx`, więc W2.5 zmienia już tylko swój plik.

---

## 3. Zadania (wszystkie, wg warstw)
Każde zadanie = jeden prompt i jeden PR. Testy e2e mają w nazwie `@S<sesja>`. Rzutnie w testach UI: **1440×900** (komputer), **390×844** i **360×740** (telefon).
Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

### W0 – Fundament

#### W0.1 – Usunięcie nieużywanych pakietów · fala F1
- **Zgoda właściciela (24.10.2026):** wolno zmienić wyłącznie `tests/unit/dependencies.test.ts` – usunąć z listy wymaganych pakietów te, które zadanie usuwa (`nuqs`, `motion`, `tw-animate-css`, `d3-array`, `d3-scale`, `@types/d3-array`, `@types/d3-scale`). Żaden inny test nie.
- **Po ludzku:** mniej zbędnych bibliotek = mniej ryzyka i szybsza instalacja.
- **Pliki:** `package.json`, `pnpm-lock.yaml`, `docs/ELEMENTY.md` (wolno je zmienić).
- **Zadanie:** sprawdź grepem w `src/`, `scripts/`, `tests/` i CSS, że `nuqs`, `motion`, `tw-animate-css`, `d3-array`, `d3-scale` nie są importowane; usuń je `pnpm remove` (razem z `@types/d3-array`, `@types/d3-scale`); w `docs/ELEMENTY.md` skreśl wpisy z datą. Pakiet jednak używany → zostaw i napisz w PR gdzie.
- **Gotowe, gdy:** `pnpm install --frozen-lockfile` i pełny zestaw testów przechodzą; usuniętych pakietów nie ma w `package.json` ani w importach.
- **Ty sprawdzasz:** ✅ w PR; strona bez zmian.
- **Nie ruszaj:** kodu w `src/`, innych pakietów.

#### W0.2 – Zaostrzenie pnpm: `trustPolicy` · zrobione 26.10.2026 (Claude, razem z PR #359; sprawdzone: `pnpm install --frozen-lockfile` i ponowne rozwiązanie lockfile bez błędów i bez zmian)
- **Po ludzku:** pnpm odmówi instalacji pakietu, którego nowa wersja ma słabsze zabezpieczenia publikacji niż poprzednia. Dodatkowa ochrona przed podmienionymi pakietami.
- **Co sprawdzono (R10, 26.10.2026):** pnpm 10.30.3 zna `trustPolicy: no-downgrade`, a `pnpm install --frozen-lockfile` z tym kluczem przechodzi. Akcja `pnpm/action-setup@v6` jest już we wszystkich workflow – tego kroku nie robimy. README akcji: obsługuje pnpm 12 i starsze.
- **Kroki:** (1) dopisać `trustPolicy: no-downgrade` do `pnpm-workspace.yaml` (obok `minimumReleaseAge`); (2) sprawdzić, że wszystkie workflow używają `--frozen-lockfile`; (3) w `pnpm-workspace.yaml` tylko klucze, które pnpm zna (`pnpm config get` / dokumentacja). Zmiana `packageManager` na 11.28.x albo 12.15.x to **osobna decyzja D1** i osobne zadanie.
- **Pliki:** `pnpm-workspace.yaml` (+ ewentualnie `package.json` pole `packageManager`, `pnpm-lock.yaml`, `docs/ELEMENTY.md` dopiero po D1).
- **Gotowe, gdy:** `pnpm install --frozen-lockfile` i pełny zestaw testów przechodzą lokalnie i w CI.
- **Nie łącz** z falą, która zmienia `package.json` albo `pnpm-lock.yaml`. Pakiety z pominiętymi skryptami budowania (better-sqlite3, core-js, msgpackr-extract) – tylko odnotować w PR.

### W1 – Podzespoły

#### W1.1 – Trend w latach zamiast malutkiego wykresu (PR #198, S14.10) · zrobione (#198)
- **Stan:** PR gotowy, testy zielone. Bez promptu – tylko obejrzeć i scalić.
- **Ty sprawdzasz:** profil powiatu → w zwiniętym wierszu „Ludność ogółem” tekst typu „↗ +1,2% od 2020”, przy wskaźniku w % – „p.p.”; po kliknięciu wiersza pełny wykres.

#### W1.2 – Wykrywanie telefonu w jednym miejscu · fala F1
- **Po ludzku:** jedno źródło odpowiedzi „czy to telefon”, żeby wszystkie części strony przełączały się tak samo.
- **Pliki:** `src/view/hooks/useIsMobile.ts` (nowy), `tests/unit/use-is-mobile.test.tsx` (nowy).
- **Zadanie:** hook `useIsMobile()` oparty na `window.matchMedia('(max-width: <tablet−1>px)')`, próg z `config/tokens.json` `breakpoints.tablet` (768); reaguje na zmianę rozmiaru; bez `window` (SSR/test) zwraca `false`.
- **Gotowe, gdy:** testy: szerokość 390 → `true`, 1024 → `false`, zmiana zdarzenia `change` przełącza wynik; próg nie jest wpisany na sztywno.
- **Ty sprawdzasz:** ✅ (bez widocznej zmiany).
- **Nie ruszaj:** `ProfilePortal.tsx` (podpięcie w W2.6) i innych plików.

#### W1.3 – Wspólny dolny arkusz · zrobione (#207)
- **Po ludzku:** jeden porządny „wysuwany od dołu” element dla telefonu – użyją go arkusz wskaźnika i profil.
- **Pliki:** `src/view/ui/BottomSheet.tsx` (nowy), `src/view/test/UiTestPage.tsx` (dodanie przykładu), `tests/e2e/bottom-sheet.spec.ts` (nowy).
- **Zadanie:** komponent na istniejącym `react-modal-sheet` (bez nowych pakietów): propsy `isOpen`, `onClose`, `snapPoints` (np. `[0.4, 1]`), `initialSnap`, `title` (dla czytników), `children`; uchwyt do przeciągania, przycisk ×, Escape zamyka, odstęp `env(safe-area-inset-bottom)`, wysokość liczona od `dvh`, rola `dialog` z etykietą; styl z tokenów (bez cieni i zaokrągleń); opcja „bez tła” (mapa nad arkuszem pozostaje klikalna).
- **Gotowe, gdy (e2e na `/__test/ui`, 390×844):** otwarcie → wysokość 35–45% okna; przeciągnięcie uchwytu w górę → ≥ 90%; w dół z 40% → zamknięcie; × i Escape zamykają; w trybie „bez tła” klik w obszar nad arkuszem trafia w element pod spodem.
- **Ty sprawdzasz:** ✅; opcjonalnie `/__test/ui` na telefonie.
- **Nie ruszaj:** `ProfileSheetMobile.tsx` (przejście na nowy arkusz w W2.6), `src/view/ui/Sheet.tsx`.

#### W1.4 – Kamera: parametry płynnego przejścia · zrobione (#219)
- **Po ludzku:** obliczenia, jak kamera ma płynnie podjechać do miejsca (bez podpinania do mapy).
- **Pliki:** `src/core/map/camera.ts` (nowy), `tests/unit/camera.test.ts` (nowy), `config/tokens.json` (nowe czasy w `motion`: `cameraIn: 600`, `cameraOut: 400`, `revealTotal: 900`), `src/styles/tokens.css` (jeśli generuje go skrypt – tylko przez `pnpm tokens`).
- **Zadanie:** czysta funkcja `cameraTransition(from, to, kind: 'in'|'out'|'instant', reducedMotion)` → `{ duration, easing }` (krzywa z tokenów `motion.easing`); `instant` (wejście z linku, zmiana rozmiaru) i `reducedMotion` → `duration 0`.
- **Gotowe, gdy:** testy: `in` → 600, `out` → 400, `instant` → 0, `reducedMotion` → 0; czasy czytane z tokenów; test `tokens.test.ts` przechodzi.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `useMapViewState.ts` (podpięcie w W3.2).

#### W1.5 – Kolejność „kafelek po kafelku” · zrobione (#209)
- **Po ludzku:** obliczenie, w jakiej kolejności i z jakim opóźnieniem pojawiają się powiaty/gminy przy wejściu w głąb.
- **Pliki:** `src/core/map/reveal.ts` (nowy), `tests/unit/reveal.test.ts` (nowy).
- **Zadanie:** `revealPlan(units, origin, { total, minTile, reducedMotion })` → lista `{ teryt, order, delay, duration }`; kolejność od jednostki najbliższej `origin` (środek jednostki nadrzędnej) na zewnątrz wg odległości środków; deterministyczna (remis → TERYT); czasy przychodzą parametrem (bez importu tokenów).
- **Gotowe, gdy:** testy dla 12, 22 i 200 jednostek: ostatni kafelek kończy się ≤ `total` (900); każdy `duration` ≥ `minTile` (150); pierwszy = najbliższy środka; ta sama kolejność przy ponownym wywołaniu; `reducedMotion` → wszystkie `delay` i `duration` = 0.
- **Ty sprawdzasz:** ✅.

#### W1.6 – „Na tle kraju”: obliczenia · zrobione (#211)
- **Po ludzku:** z samych danych liczymy, czy wartość to dużo czy mało – działa też dla nowych wskaźników z nocnego robota.
- **Pliki:** `src/core/explain/context.ts` (nowy), `tests/unit/context.test.ts` (nowy).
- **Zadanie:** `context(values, units, teryt, year, higherIsBetter)` → `{ rank, total, percentBelow, medianPoland, min, max, position0to1, sameInVoivodeship: {…} | null }`; jednostki tego samego poziomu; braki danych pomijane; `higherIsBetter = null` → bez oceny, tylko położenie.
- **Gotowe, gdy:** testy na `tests/fixtures`: powiat → `total` = liczba powiatów z danymi; mediana policzona poprawnie dla parzystej i nieparzystej liczby; jednostka bez wartości → `null`; województwo → `sameInVoivodeship = null`.
- **Ty sprawdzasz:** ✅.

#### W1.7 – Porównanie dwóch miejsc: obliczenia · zrobione (#212)
- **Pliki:** `src/core/compare/compare.ts` (nowy), `tests/unit/compare.test.ts` (nowy).
- **Zadanie:** `compare(profileA, profileB)` → wiersze `{ indicatorId, a, b, diffText }`: jednostka `%` → różnica w p.p. („wyżej o 1,2 p.p.”), inne → procentowo względem B; brak wartości → „brak danych”; różne poziomy → flaga `differentLevels`; kolejność wskaźników jak w profilu.
- **Gotowe, gdy:** testy: %, wartości bezwzględne, zero w mianowniku (sam kierunek), braki, różne poziomy.
- **Ty sprawdzasz:** ✅.

#### W1.8 – Adres porównania `?c=` · zrobione (#214)
- **Pliki:** `src/core/url/state.ts`, `tests/unit/url-state.test.ts` (dopisanie nowych przypadków – istniejących nie zmieniasz).
- **Zadanie:** `readUrlState` / `writeUrlState` obsługują `c` = dokładnie dwa TERYT-y po przecinku (stringi, istniejące w indeksie jednostek); niepoprawne → `null`; `writeUrlState({ c: null })` usuwa parametr.
- **Gotowe, gdy:** testy: poprawna para, jeden TERYT, trzy, nieistniejący, usunięcie; pozostałe parametry bez zmian.
- **Ty sprawdzasz:** ✅.

#### W1.9 – Plik objaśnień wskaźników · poza automatem (po Twojej akceptacji tekstów)
- **Decyzja 24.10.2026:** automat tego nie zleca. Wraca jako zadanie, gdy zaakceptujesz teksty; W2.12 działa bez niego.
- **Warunek:** przed falą akceptujesz teksty ze szkicu `docs/data/explanations-szkic.json` (Planista daje listę do przeczytania; ciekawostki tylko po `TRYB: RESEARCH` + `TRYB: WERYFIKACJA`).
- **Prawa do tekstów (R9, zweryfikowane 26.10.2026):** GUS pozwala kopiować treści „pod warunkiem podania źródła” (stat.gov.pl/copyright), ale nie podaje nazwanej licencji, a część haseł słownika to cytaty z prac osób trzecich (np. hasło „Gęstość zaludnienia” – Rosset 1975, „Wskaźnik lesistości” – SGGW 1996). Dlatego: **objaśnienia piszemy własnymi słowami** (`short`, `howToRead`), a `definitionUrl` prowadzi do hasła GUS (`https://stat.gov.pl/metainformacje/slownik-pojec/pojecia-stosowane-w-statystyce-publicznej/<nr>,pojecie.html`). Cytatów z haseł nie kopiujemy.
- **Numery haseł (sprawdzone):** przyrost naturalny 3956 · gęstość zaludnienia 3915 · stopa bezrobocia rejestrowanego 2390 · saldo migracji na 1000 osób 2259 · lesistość 1706. **Pozostałe ~15 wskaźników:** zlecenie R9.5 (haiku-zlecenia.md).
- **Pliki:** `public/data/explanations.json` (nowy), `tests/unit/explanations-data.test.ts` (nowy).
- **Zadanie:** wgrać zaakceptowane wpisy (`short`, `howToRead`, `definitionUrl`, opcjonalnie `funFact` + `source` + `url`).
- **Gotowe, gdy:** test schematu: każdy klucz to istniejący `id` z `config/indicators.json`; `short` ≤ 160, `howToRead` ≤ 240, `funFact` ≤ 200 znaków; `funFact` zawsze ze `source` i `url`; plik bez wcięć.
- **Ty sprawdzasz:** w profilu rozwinięty wiersz „Gęstość zaludnienia” pokazuje prostą definicję i link „Definicja GUS”.

#### W1.10 – Raport „wskaźniki bez objaśnienia” · fala F1
- **Pliki:** `scripts/data/nightly-checks.mjs` (wolno zmienić w tym zadaniu), `tests/unit/nightly-checks.test.ts` (dopisanie przypadków).
- **Zadanie:** nocne sprawdzenia dopisują do raportu listę wskaźników z `config/indicators.json`, które nie mają wpisu w `public/data/explanations.json` (brak pliku = wszystkie).
- **Gotowe, gdy:** testy: plik brak / pełny / częściowy → poprawna lista; brak wpisów nie jest błędem (robot nie staje).
- **Ty sprawdzasz:** ✅.

#### W1.11 – Zwiad: dane „miasto / obszar wiejski” gmin miejsko-wiejskich · zrobione 24.10.2026 (wynik: `docs/research/W1.11-wynik.md`)
- **Kto:** Ty + Gemini Deep Research (`TRYB: RESEARCH`, rodzaj [C]) → `TRYB: WERYFIKACJA` w Claude.
- **Pytanie:** czy BDL podaje dane dla części miejskiej i wiejskiej gmin miejsko-wiejskich (TERYT z końcówką 4 i 5) i dla których z 20 wskaźników.
- **Wynik:** 1 linia w „Decyzjach” w STAN.md + ewentualne nowe zadanie w §3 (W1/W2) dodane przez Planistę.

#### W1.12 – Formaty kart i dane CSV: logika (S19) · fala F1
- **Po ludzku:** rozmiary obrazków pod Instagram, X i komentarze oraz zamiana tabelek na plik CSV, który otwiera się wprost w polskim Excelu.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4b, `src/core/format/number.ts`.
- **Pliki:** `src/core/share/formats.ts` (nowy), `src/core/share/csv.ts` (nowy), `tests/unit/share-formats.test.ts` (nowy), `tests/unit/share-csv.test.ts` (nowy).
- **Zadanie:**
  1. `SHARE_FORMATS`: `post` 1080×1350 („Post 4:5 – Instagram, Facebook, Threads”), `square` 1080×1080 („Kwadrat – komentarze, X”), `story` 1080×1920 („Story 9:16”), `wide` 1600×900 („Poziomy 16:9 – X, LinkedIn”); każdy z polem `safe` (margines treści; `story`: 155 px od góry i od dołu; pozostałe: ≥ 64 px) liczonym ze skali `space` w tokenach.
  2. `toCsv(columns, rows)`: BOM UTF-8, separator `;`, przecinek dziesiętny, pola z `;`, `"` lub nową linią w cudzysłowie (podwojone `"`), `null` → puste pole, liczby bez spacji tysięcy, TERYT jako tekst bez zmian, koniec linii `\r\n`.
  3. Gotowe tabele: `indicatorTableCsv(units, values, indicator, year)` (kolumny: TERYT; Nazwa; Poziom; „<nazwa> (<jednostka>)”; Rok; Miejsce; Źródło), `profileCsv(profile)` (wiersz na wskaźnik), `compareCsv(rows, a, b)` (wynik `compare()` z W1.7). Źródło: „GUS, Bank Danych Lokalnych (CC BY 4.0)”.
  4. `shareFileName(kind, parts, ext)` → ASCII bez polskich znaków i spacji, np. `faktografia-gestosc-zaludnienia-powiaty-2024.csv`.
- **Gotowe, gdy:** testy: 4 formaty z dokładnymi wymiarami i `safe` w obrębie obrazka; CSV zaczyna się od BOM; 1234,5 → „1234,5”; nazwa ze średnikiem w cudzysłowie; `null` → puste; „02” zostaje „02”; profil i porównanie mają wiersz na wskaźnik (dane z `tests/fixtures`); `shareFileName` usuwa „ąćęłńóśźż” i spacje.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `src/core/format/number.ts` (tylko używasz), `src/view/`.

#### W1.13 – Mapa jako rysunek SVG: logika (S18–S19) · fala F1
- **Po ludzku:** z granic, które strona już ma w pamięci, liczymy rysunek mapy do obrazka i do małych mapek porównania – bez drugiej mapy WebGL.
- **Pliki:** `src/core/share/projection.ts` (nowy), `src/core/share/map-shapes.ts` (nowy), `tests/unit/share-map-shapes.test.ts` (nowy), `tests/fixtures/geo/malopolskie.topo.json` (nowy – wycinek województwa 12 z powiatami i gminami z `public/geo/admin.topo.json`; jak wycięty – w PR).
- **Zadanie:** `fitProjection(bbox, box, padding)` – Web Mercator (jak mapa) dopasowany do prostokąta z zachowaniem proporcji; `mapShapes(features, { box, classOf, selected })` → `{ shapes: { teryt, d, fill: 0–4 | 'noData', selected }[], outline: d }`; `d` = ścieżka SVG ze współrzędnymi zaokrąglonymi do 0,1; jednostka bez wartości → `'noData'`. Bez DOM i bez nowych pakietów (geometria przez istniejący `topojson-client`).
- **Gotowe, gdy:** testy na wycinku: każdy punkt w prostokącie; proporcje zachowane (bbox szeroki → rysunek wyśrodkowany w pionie); liczba kształtów = liczba jednostek; `selected` tylko przy wybranej; brak `NaN` w `d`; ścieżki 22 powiatów < 200 kB łącznie.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `src/view/map/`, `public/geo/`.

#### W1.14 – Układ kart: logika (S19) · fala F2
- **Po ludzku:** gdzie na obrazku stoją tytuł, mapa, legenda, liczby, logo i źródło – tak, żeby w żadnym formacie nic nie wychodziło poza pole.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4b, `docs/STYL.md` §2–§4, §7, §10.
- **Pliki:** `src/core/share/card.ts` (nowy), `src/core/share/text-fit.ts` (nowy), `tests/unit/share-card.test.ts` (nowy).
- **Zadanie:** `cardScene(kind: 'map' | 'ranking' | 'profile' | 'compare', data, format, theme, { measure, siteUrl })` → `{ width, height, background, items }`; elementy: `text` (x, y, maxWidth, rozmiar ze skali `font.scale`, waga, token koloru, wyrównanie, linie), `rect`, `path` (z W1.13), `image` (logo z `public/brand/` wg motywu), `annotation` (kółko korekty wokół dużej liczby – najwyżej jedno). `measure(text, size, weight)` przychodzi parametrem. `fitText`: zawija do zadanej liczby linii, potem zmniejsza o stopień skali (najmniej `font.scale.sm` przy szerokości 1080), na końcu skraca z „…”. Każda karta: logo, tytuł, „Źródło: GUS, Bank Danych Lokalnych, <rok>”, `siteUrl`. Ranking: 10 + 10 (≤ 20 → wszystkie). Profil: duża liczba, miejsce, 5 wskaźników. Porównanie: 2 mapki, do 8 wierszy. Kolory, kroje, rozmiary i odstępy tylko z `config/tokens.json` (jasny i ciemny).
- **Gotowe, gdy:** testy 4 rodzaje × 4 formaty × 2 motywy (przybliżony `measure` = 0,55 × rozmiar na znak): każdy `text` i `image` w polu `safe`; elementy (poza tłem i mapą) nie nachodzą na siebie; dokładnie jedno logo i jedno źródło; najwyżej jedno `annotation`; „Powiat kędzierzyńsko-kozielski” i nazwa 45-znakowa mieszczą się (zawinięte lub mniejsze; „…” tylko gdy inaczej się nie da); kolory = wartości z tokenów.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `src/view/`, `src/core/share/formats.ts`, `csv.ts`, `map-shapes.ts` (tylko używasz).

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
- **Zgoda właściciela (24.10.2026):** wolno zmienić istniejące testy e2e, bo nowy nagłówek i „Kopiuj link” zmieniają ich stare oczekiwania: `tests/e2e/annotation-scroll.spec.ts`, `tests/e2e/breadcrumbs.spec.ts`, `tests/e2e/design.spec.ts` (zrzut – sam obraz odświeża właściciel etykietą `aktualizuj-zrzuty`), `tests/e2e/profile-row.spec.ts`, `tests/e2e/profile-trend.spec.ts`, `tests/e2e/profile.spec.ts` (tylko oczekiwania układu nagłówka profilu na telefonie i komputerze). Zmieniać tylko oczekiwania dotyczące nagłówka, rankingu i zakreślenia; nie osłabiać asercji ani nie pomijać testów.
- **Nie ruszaj:** `RankingBars.tsx`, `ranking.ts`, `sections.ts`, `load-profile.ts`, pozostałych testów, zrzutów (poza etykietą); zakładek (W2.2); telefonu.

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

#### W2.4 – Telefon: układ – cienki nagłówek, mapa na cały ekran, miejsca podpięcia (S15, przygotowanie) · fala F2
- **Po ludzku:** na telefonie mapa zajmuje prawie cały ekran; przygotowujemy miejsca, w które kolejne zadania wstawią pasek wskaźnika i okruszki.
- **Pliki:** `src/view/Header.tsx`, `src/view/Home.tsx`, `src/view/map/AtlasMap.tsx`, `src/view/main/MobileIndicatorBar.tsx` (nowy – na razie sam pasek z nazwą wskaźnika i rokiem, bez arkusza), `src/view/map/Breadcrumbs.tsx` (tylko nowy opcjonalny prop `onBack`), `tests/e2e/mobile-layout.spec.ts` (nowy), `tests/e2e/home.spec.ts` i `tests/e2e/picker-scroll.spec.ts` (tylko zmiany opisane niżej).
- **Zadanie:** na `useIsMobile()`: nagłówek ≤ 56 px (logo, lupa, menu; „Motyw”, „O projekcie”, „Skąd są dane” w menu); `IndicatorPanel` nie jest renderowany nad mapą; mapa wypełnia resztę (`dvh`); na dole `MobileIndicatorBar` (≥ 48 px, `safe-area`); `AtlasMap` przekazuje do paska `view` i treść panelu (children) – W2.5 zrobi z tego arkusz; na telefonie nie renderuj osobnego `BackButton`, przekaż `onBack={goBack}` do `Breadcrumbs`. Komputer bez zmian.
- **Gotowe, gdy (`@S15`):** 390×844 i 360×740: mapa ≥ 75% wysokości okna, nagłówek ≤ 56 px, pasek pokazuje nazwę bieżącego wskaźnika i rok; na 1440×900 istniejące testy ekranu głównego bez zmian.
- **Ty sprawdzasz (telefon):** u góry tylko logo, lupa, menu; mapa prawie na cały ekran, od razu w kolorach; na dole pasek „Gęstość zaludnienia ▾ · 2025”.
- **Istniejące testy (decyzja właściciela 24.10.2026 – jedyny wyjątek):** panel wskaźnika znika z telefonu z założenia planu, więc wolno zmienić dokładnie:
  1. `tests/e2e/home.spec.ts`, test „na telefonie panel i mapa nie wychodzą poza ekran”: na 390 px sprawdza, że mapa mieści się w ekranie i panel wskaźnika **nie** jest widoczny nad mapą (zamiast ramki panelu);
  2. `tests/e2e/picker-scroll.spec.ts`: przypadek „390x844 (mobile)” z pętli i test „no horizontal scroll at 390px…” dostają `test.fixme` z komentarzem `// W2.5: wybór wskaźnika na telefonie przechodzi do arkusza`.
  Żadnych innych zmian w istniejących testach. Pada inny stary test → opisz w PR i stop.
- **Nie ruszaj:** `ProfilePortal.tsx`, `ProfileSheetMobile.tsx`, `ConsentBar.tsx`, `IndicatorPanel.tsx`.

#### W2.5 – Telefon: arkusz wskaźnika · fala F3
- **Pliki:** `src/view/main/MobileIndicatorBar.tsx`, `src/view/main/IndicatorPanel.tsx` (tylko wariant wyglądu „w arkuszu”), `tests/e2e/mobile-indicator-sheet.spec.ts` (nowy), `tests/e2e/picker-scroll.spec.ts` (tylko zdjęcie `fixme` z W2.4).
- **Zadanie:** dotknięcie paska otwiera `BottomSheet` (do ~85% wysokości) z treścią panelu (wybór wskaźnika, poziom, legenda, rok, najwyżej/najniżej); przewija się w środku, pole szukania wskaźnika zostaje widoczne; zmiana wskaźnika przekolorowuje mapę i zmienia `?i=`, arkusz zostaje otwarty; zamykanie: ×, przeciągnięcie w dół, dotknięcie mapy. Naraz najwyżej jeden arkusz (otwarcie profilu zamyka arkusz wskaźnika – zdarzenie/prop, bez zmian w `AtlasMap`).
- **Gotowe, gdy (`@S15`):** dotknięcie paska → arkusz; inny wskaźnik → `?i=` i `window.__atlas`; trzy sposoby zamknięcia (3 testy); ostatnią pozycję „najwyżej/najniżej” da się przewinąć i kliknąć; w `tests/e2e/picker-scroll.spec.ts` usunięte oba `test.fixme` z W2.4, a przypadki 390 px najpierw dotykają paska, potem sprawdzają to samo co wcześniej (jedyna dozwolona zmiana istniejącego testu).
- **Ty sprawdzasz:** dotknięcie paska wysuwa arkusz z wyborem wskaźnika, poziomem, legendą, rokiem i rankingiem; zamyka się przeciągnięciem w dół, × i dotknięciem mapy.
- **Nie ruszaj:** `AtlasMap.tsx`, `BottomSheet.tsx`.

#### W2.6 – Telefon: profil w arkuszu 40% → 100% · fala F3
- **Pliki:** `src/view/map/ProfilePortal.tsx`, `src/view/profile/ProfileSheetMobile.tsx`, `tests/e2e/profile-mobile.spec.ts` (nowy).
- **Zadanie:** najpierw ustal i opisz w PR, dlaczego dziś profil na telefonie trafia do kolumny pod mapą (`data-slot="side"`, `max-h-[45vh]`) zamiast pływać nad mapą; potem: `ProfilePortal` używa `useIsMobile()`; `ProfileSheetMobile` na `BottomSheet` (punkty 40% i 100%, tryb „bez tła”, treść `ProfileBody` bez zmian).
- **Gotowe, gdy (`@S15`):** po wyborze jednostki arkusz ma 35–45% okna; uchwyt w górę → ≥ 90%, widać zakładki; × zamyka, `?u=` znika, przybliżenie mapy bez zmian (`window.__atlas`); mapa nad arkuszem reaguje na dotyk.
- **Ty sprawdzasz:** wybór miejsca → profil od dołu na ~40% ekranu, nad nim mapa; przeciągnięcie w górę – cały ekran, w dół – 40%, dalej w dół lub × – zamyka.
- **Nie ruszaj:** `ProfileSheet.tsx`, `AtlasMap.tsx`, `useMapViewState.ts`.

#### W2.7 – Telefon: mapa pokazuje wybrane miejsce nad arkuszem · fala F4
- **Pliki:** `src/view/map/sheetInset.ts` (nowy – mały wspólny stan „ile ekranu zasłania arkusz”), `src/view/profile/ProfileSheetMobile.tsx` (zgłasza wysokość), `src/view/map/hooks/useMapViewState.ts` (dolny margines dopasowania = wysokość arkusza), `tests/e2e/profile-mobile-inset.spec.ts` (nowy).
- **Gotowe, gdy (`@S15`):** po wyborze powiatu na 390×844 bbox jednostki (z `window.__atlas`) mieści się nad górną krawędzią arkusza 40%; po zamknięciu arkusza widok nie skacze; komputer bez zmian.
- **Ty sprawdzasz:** wybrane miejsce widać nad profilem, nie chowa się pod nim.
- **Nie ruszaj:** `AtlasMap.tsx`, `ProfilePortal.tsx`.

#### W2.8 – Telefon: okruszki w jednej linii z „‹” · fala F3
- **Pliki:** `src/view/map/Breadcrumbs.tsx`, `src/view/map/BackButton.tsx` (jeśli zostaje nieużywany na telefonie – bez zmian), `tests/e2e/mobile-breadcrumbs.spec.ts` (nowy).
- **Zadanie:** na telefonie okruszki to jedna linia „‹ Polska / małopolskie” (długie nazwy skracane z końca środkowych elementów); „‹” = `onBack`.
- **Gotowe, gdy (`@S15`):** wysokość ≤ 48 px przy „powiat kędzierzyńsko-kozielski”; „‹” wraca poziom wyżej; klik w „Polska” wraca do kraju; komputer bez zmian.
- **Ty sprawdzasz:** u góry mapy krótka linia okruszków, strzałka „‹” cofa.
- **Nie ruszaj:** `AtlasMap.tsx`.

#### W2.9 – Telefon: dymek po pierwszym dotknięciu · fala F3
- **Pliki:** `src/view/map/AtlasMap.tsx` (obsługa dotknięcia), `src/view/main/UnitTooltip.tsx`, `tests/e2e/mobile-tooltip.spec.ts` (nowy).
- **Zadanie:** na telefonie pierwsze dotknięcie jednostki pokazuje dymek nad dolnym paskiem (nazwa, wartość, miejsce, przycisk „Otwórz profil” ≥ 44 px); drugie dotknięcie tej samej jednostki albo przycisk otwiera profil; dotknięcie pustego miejsca chowa dymek. Komputer bez zmian (najechanie).
- **Gotowe, gdy (`@S15`):** 1. dotknięcie → dymek, `?u=` bez zmian; 2. → profil; dymek mieści się w ekranie dla jednostki przy lewej i prawej krawędzi; zwykły tekst (bez HTML).
- **Ty sprawdzasz:** dotknięcie województwa → dymek z „Otwórz profil”; drugie dotknięcie otwiera profil.
- **Nie ruszaj:** `useMapViewState.ts`, `ProfilePortal.tsx`.

#### W2.10 – Telefon: mały pasek zgody · zrobione (#213)
- **Pliki:** `src/view/consent/ConsentBar.tsx` (tylko wygląd – logika zgody bez zmian; wolno w tym zadaniu), `tests/e2e/consent-mobile.spec.ts` (nowy).
- **Gotowe, gdy:** na 390×844 pasek ≤ 15% wysokości okna, przyciski w jednej linii; znika po wyborze; istniejące `consent.spec.ts` i `consent-bar.test.tsx` bez zmian.
- **Ty sprawdzasz:** pasek zgody nie zasłania mapy, najwyżej 2 linijki.
- **Nie ruszaj:** `src/core/consent/`.

#### W2.11 – Test całej ścieżki na telefonie (S15) · fala F5
- **Pliki:** `tests/e2e/s15-mobile.spec.ts` (nowy). Kodu nie zmieniasz.
- **Gotowe, gdy:** 390×844 i 360×740: start → pasek → zmiana wskaźnika → zamknięcie → dotknięcie województwa → dymek → profil 40% → pełna wysokość → „Powiaty (n)” → klik w powiat → ×; w całej ścieżce brak poziomego przewijania, 1 żądanie `profiles/*` na wybór, brak „undefined/NaN”; 3× z rzędu.
- **Ty sprawdzasz:** ✅; na swoim telefonie przejdź tę samą ścieżkę.

#### W2.12 – „Na tle kraju” w profilu i panelu (S17) · fala F5
- **Pliki:** `src/view/explain/ContextBlock.tsx` (nowy), `src/view/profile/ProfileIndicatorRow.tsx` (wstawienie bloku w rozwiniętym wierszu), `src/view/main/IndicatorPanel.tsx` (wstawienie bloku dla wybranej jednostki), `tests/e2e/context-block.spec.ts` (nowy).
- **Zadanie:** blok z `context()`: miejsce, „wyżej niż X% powiatów”, mediana Polski, najmniej–najwięcej, pozioma skala z kropką „tu jesteś” i kreską „mediana”; to samo w województwie (dla powiatów i gmin); pod spodem definicja z `explanations.json`, jeśli jest; „najwyżej/najniżej” w bloku klikalne (`onSelectUnit`). Źródło: „GUS, BDL, <rok>”.
- **Gotowe, gdy (`@S17`):** powiat → tekst „wyżej niż … % powiatów” z liczbą zgodną z `context()`; wskaźnik bez objaśnienia → sam blok, bez błędów; klik w „najwyżej” wybiera tę jednostkę; zero nowych żądań poza `explanations.json` (raz).
- **Ty sprawdzasz:** rozwinięty wiersz w profilu: czy to dużo czy mało, mediana Polski, skala z kropką.
- **Nie ruszaj:** `ProfileSheet.tsx`, `AtlasMap.tsx`.

#### W2.13 – Legenda w trybie ciemnym (S17) · fala F1
- **Pliki:** `src/core/legend/legend.ts`, `src/view/legend/Legend.tsx`, `src/view/main/IndicatorPanel.tsx` (tylko zdanie opisu legendy), `tests/unit/legend.test.ts` (dopisanie przypadków).
- **Zadanie:** legenda ma podpis kierunku „mniej → więcej”; zdanie „Ciemniej znaczy więcej” zależy od motywu (w ciemnym jest odwrotnie) albo jest zastąpione neutralnym.
- **Gotowe, gdy:** testy: w motywie ciemnym żaden opis nie mówi „ciemniej znaczy więcej”; w obu motywach jest „mniej → więcej”.
- **Ty sprawdzasz:** przełącz motyw na ciemny – legenda mówi „mniej → więcej”, opis się zgadza z kolorami.

#### W2.14 – Porównanie: wybór drugiego miejsca (S18) · fala F3
- **Pliki:** `src/view/profile/ProfileCompare.tsx` (nowy), `src/view/profile/ProfileSheet.tsx` (włączenie zakładki „Porównaj” i przycisku „Porównaj z innym miejscem”), `tests/e2e/compare-pick.spec.ts` (nowy).
- **Zadanie:** w zakładce pole wyszukiwania (istniejący mechanizm wyszukiwarki, bez nowego indeksu); wybór ustawia `?c=<bieżący>,<wybrany>` (W1.8); „×” przy drugim miejscu czyści `?c=`.
- **Gotowe, gdy (`@S18`):** wybór „Kraków” w profilu małopolskiego → `?c=12,1261`; odświeżenie strony przywraca porównanie; najwyżej 1 dodatkowe żądanie `profiles/*` (drugie województwo).
- **Ty sprawdzasz:** zakładka „Porównaj” działa, wpisujesz drugie miejsce.

#### W2.15 – Porównanie: tabela obok siebie (S18) · fala F4
- **Pliki:** `src/view/profile/ProfileCompareTable.tsx` (nowy), `src/view/profile/ProfileCompare.tsx` (wstawienie tabeli), `tests/e2e/compare-table.spec.ts` (nowy).
- **Zadanie:** wiersz na wskaźnik: wartości obu miejsc, miejsca w rankingu, `diffText` z `compare()`; kolor neutralny (bez zieleni/czerwieni); przy różnych poziomach dopisek „różne poziomy – porównuj ostrożnie”.
- **Gotowe, gdy (`@S18`):** liczba wierszy = liczba wskaźników z danymi w obu profilach; teksty różnic zgodne z `compare()`; zero dodatkowych żądań.
- **Ty sprawdzasz:** dwie kolumny i słowne „wyżej o …” w każdym wierszu.

#### W2.16 – Porównanie: dwa obrysy na mapie (S18) · fala F4
- **Pliki:** `src/view/map/layers/choropleth.ts` (warstwa obrysu dla dwóch jednostek), `src/view/map/AtlasMap.tsx` (przekazanie `c` z adresu), `tests/e2e/compare-map.spec.ts` (nowy).
- **Gotowe, gdy (`@S18`):** przy `?c=` `window.__atlas` pokazuje dwie obrysowane jednostki; bez `?c=` jak dotąd jedna; `drill.spec.ts`, `map.spec.ts` bez zmian.
- **Ty sprawdzasz:** oba porównywane miejsca obrysowane na mapie.

#### W2.17 – Porównanie na telefonie + test ścieżki (S18) · fala F5
- **Pliki:** `src/view/profile/ProfileCompareTable.tsx` (układ < 768 px), `tests/e2e/s18-compare.spec.ts` (nowy).
- **Gotowe, gdy:** na 360×740 tabela mieści się bez poziomego przewijania; „@S18” ścieżka komputer i telefon: profil → Porównaj → wybór → tabela → dwa obrysy → „Kopiuj link” zawiera `c=`; 3× z rzędu.
- **Ty sprawdzasz:** porównanie na telefonie, link otwiera to samo porównanie.

#### W2.18 – Pobierz i udostępnij: okno, podgląd, PNG, CSV (S19) · fala F3
- **Po ludzku:** okno z podglądem karty, wyborem formatu i przyciskami „Pobierz obraz”, „Udostępnij”, „Pobierz dane” – na razie dostępne na stronie testowej; przyciski na stronie dochodzą w W2.19–W2.21.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4b, `docs/STYL.md`.
- **Pliki:** `src/view/share/CardSvg.tsx`, `src/view/share/render-png.ts`, `src/view/share/share-file.ts` (jedyny plik z `navigator.share` i pobieraniem), `src/view/share/ShareDialog.tsx`, `src/view/share/LazyShareDialog.tsx` (`React.lazy` – kod okna w osobnym pliku JS) (wszystkie nowe), `src/view/test/UiTestPage.tsx` (dodanie przykładu), `tests/e2e/share-dialog.spec.ts` (nowy).
- **Zadanie:** `CardSvg` rysuje `cardScene` (W1.14) zwykłymi elementami SVG (tekst jako `<text>`, bez wstawiania HTML); `renderPng(scene)` rysuje tę samą scenę na `canvas` (`Path2D`, `fillText` po `document.fonts.ready`, kółko przez istniejący `roughjs`) → `Blob` PNG w dokładnych wymiarach formatu; `measure` z `canvas.measureText`; `shareFiles(files, title)`: `navigator.canShare({ files })` → `navigator.share`, inaczej pobranie (kolejno dla wielu plików). `ShareDialog` (okno z `src/components/ui`; na < 768 px pełny ekran): wybór karty (tylko dostępne), formatu (4), motywu, podgląd SVG dopasowany do szerokości, „Pobierz obraz”, „Udostępnij” (tylko gdy przeglądarka umie), „Udostępnij zestaw”, „Pobierz dane (CSV)”, zdanie o prawach z PRODUKT §4b. Dane wyłącznie z propsów i istniejących pamięci (`loadUnits`, `loadAdminTopo`, wczytane `values`) – zero nowych pobrań. Strona testowa: przykład na prawdziwych danych przez istniejące loadery.
- **Gotowe, gdy (`@S19`, `/__test/ui`):** okno → podgląd SVG z tytułem i „Źródło: GUS”; „Story” → `viewBox` 0 0 1080 1920; „Pobierz obraz” → zdarzenie `download` z plikiem `.png`, wymiary 1080×1350 (odczyt nagłówka IHDR w teście); „Pobierz dane” → `.csv` z BOM i „;”; od otwarcia okna zero żądań `/data/*` i `/geo/*`; na 390×844 bez poziomego przewijania, przyciski ≥ 44 px; axe bez błędów; Escape zamyka; kod okna nie jest w pliku JS ładowanym na wejściu (`perf-budget.spec.ts` bez zmian).
- **Ty sprawdzasz:** ✅ (widoczne dopiero po W2.19).
- **Nie ruszaj:** `IndicatorPanel.tsx`, `src/view/profile/`, `AtlasMap.tsx`, `src/core/share/`.

#### W2.19 – Przycisk w panelu wskaźnika: karta mapy i rankingu (S19) · fala F4
- **Pliki:** `src/view/main/IndicatorPanel.tsx` (przycisk i otwarcie okna), `src/view/share/useShareData.ts` (nowy – zbiera dane kart: wskaźnik, rok, poziom, obszar, wartości, wybrana jednostka), `tests/e2e/share-map.spec.ts` (nowy).
- **Zadanie:** przycisk „Pobierz i udostępnij” pod „najwyżej/najniżej” (na telefonie w arkuszu wskaźnika); karty „Mapa” i „Ranking” dla bieżącego widoku (po wejściu w województwo – to województwo); CSV bieżącego wskaźnika dla jednostek widoku; „Udostępnij zestaw” = mapa + ranking (+ profil, gdy wybrane miejsce).
- **Gotowe, gdy (`@S19`):** `?i=<wskaźnik>&l=pow` → karta mapy ma tytuł z nazwą wskaźnika, rokiem i „powiaty”; CSV ma tyle wierszy danych, ile powiatów; po wejściu w małopolskie – 22 kształty w scenie mapy (stan w `data-*` podglądu) i CSV z 22 wierszami; zero nowych żądań danych; telefon 390×844: przycisk w arkuszu, okno pełnoekranowe.
- **Ty sprawdzasz:** w panelu „Pobierz i udostępnij” → podgląd mapy z legendą; pobierz post na Instagram i CSV, otwórz CSV w Excelu.
- **Nie ruszaj:** `AtlasMap.tsx`, `src/view/share/ShareDialog.tsx` (tylko używasz).

#### W2.20 – Przycisk w profilu: karta profilu (S19) · fala F4
- **Pliki:** `src/view/profile/ProfileOverview.tsx` (przycisk obok „Kopiuj link”), `tests/e2e/share-profile.spec.ts` (nowy).
- **Zadanie:** „Pobierz i udostępnij” w stopce przeglądu profilu; karta „Profil” (nazwa, duża liczba, miejsce, 5 wskaźników) i „Ranking”; CSV całego profilu.
- **Gotowe, gdy (`@S19`):** profil powiatu 3217 → karta z „Powiat wałecki” i liczbą równą tej w przeglądzie; CSV z wierszem na każdy wskaźnik profilu; zero nowych żądań; „Kopiuj link” działa jak przed zmianą.
- **Ty sprawdzasz:** profil → „Pobierz i udostępnij” → karta profilu wygląda czysto w 4 formatach.
- **Nie ruszaj:** `ProfileSheet.tsx`, `ProfileSheetMobile.tsx`, `src/view/share/` (tylko używasz).

#### W2.21 – Przycisk w porównaniu: karta porównania (S19) · fala F6
- **Pliki:** `src/view/profile/ProfileCompare.tsx` (przycisk), `tests/e2e/share-compare.spec.ts` (nowy).
- **Zadanie:** „Pobierz i udostępnij” w zakładce „Porównaj”; karta „Porównanie” (dwa miejsca, dwie mapki z W1.13, do 8 wierszy ze słowną różnicą z `compare()`); CSV tabeli porównania.
- **Gotowe, gdy (`@S19`):** `?u=12&c=12,24` → karta z nazwami obu województw i dwiema mapkami; teksty różnic zgodne z tabelą; CSV z wierszem na wskaźnik; zero nowych żądań.
- **Ty sprawdzasz:** porównanie → pobierz kwadrat do komentarza.
- **Nie ruszaj:** `ProfileCompareTable.tsx`, `CompareMaps.tsx` (tylko używasz).

#### W2.22 – Porównanie: dwie mapki nad tabelą (S18) · fala F5
- **Po ludzku:** pomysł właściciela „dwie mapy” – nad tabelą porównania dwie małe mapki, każda z województwem w kolorach i obrysowanym miejscem.
- **Pliki:** `src/view/profile/CompareMaps.tsx` (nowy), `src/view/profile/ProfileCompare.tsx` (wstawienie nad tabelą), `tests/e2e/compare-maps.spec.ts` (nowy).
- **Zadanie:** dwa rysunki SVG z `mapShapes()` (W1.13) – obszar = województwo danego miejsca (województwo → cała Polska z województwami), kolory bieżącego wskaźnika i roku, obrys `korekta` wokół miejsca, podpis nazwy; obok siebie na komputerze, jedna pod drugą na < 768 px; klik w mapkę = wybór tego miejsca.
- **Gotowe, gdy (`@S18`):** `?u=1261&c=1261,1465` → dwie mapki z `data-selected` przy właściwych TERYT-ach; kolory z tych samych klas co duża mapa; zero nowych żądań; 360×740 bez poziomego przewijania; zmiana wskaźnika przekolorowuje mapki.
- **Ty sprawdzasz:** porównanie dwóch powiatów → dwie mapki z zaznaczonymi miejscami.
- **Nie ruszaj:** `ProfileCompareTable.tsx`, `choropleth.ts`, `src/core/share/`.

#### W2.23 – Test całej ścieżki „Pobierz i udostępnij” (S19) · fala F7
- **Pliki:** `tests/e2e/s19-share.spec.ts` (nowy). Kodu nie zmieniasz; błąd strony → opisz w PR i stop.
- **Gotowe, gdy:** komputer i 390×844: mapa → okno → 4 formaty → PNG o dokładnych wymiarach; profil → karta profilu → CSV; porównanie → karta porównania; w całej ścieżce zero żądań danych po otwarciu okna, brak „undefined/NaN” w podglądzie; 3× z rzędu.
- **Ty sprawdzasz:** na telefonie „Udostępnij” otwiera systemowe okno; wrzuć jedną kartę na Instagram (podgląd, nie musisz publikować).

### W3 – Szlif

#### W3.1 – Sprzątanie zakreśleń w profilu · fala F2
- **Pliki:** `src/view/profile/ProfileIndicatorRow.tsx` (usunięcie nieużywanej ścieżki zakreślenia `highlight`), `src/core/profile/highlight.ts` i `tests/unit/highlight.test.ts` (usunięcie, jeśli po W2.1 nic ich nie używa – sprawdź grepem; prompt na to pozwala).
- **Gotowe, gdy:** w kodzie nie ma zakreśleń typu `highlight`; pozostałe testy zakreśleń przechodzą bez zmian.
- **Ty sprawdzasz:** w profilu nie ma grubego czerwonego markera zasłaniającego tekst.

#### W3.2 – Płynna kamera przy wejściu w głąb (S16) · fala F5
- **Pliki:** `src/view/map/hooks/useMapViewState.ts`, `src/view/map/AtlasMap.tsx` (przekazanie parametrów przejścia do mapy), `tests/e2e/camera.spec.ts` (nowy).
- **Zadanie:** zamiast natychmiastowego `setCurrentViewState` – przejście z `cameraTransition()` (wejście 600 ms, powrót 400 ms); wejście z linku i zmiana rozmiaru – bez animacji; gest użytkownika przerywa ruch; uwzględnia margines arkusza z W2.7.
- **Gotowe, gdy (`@S16`):** po kliknięciu województwa `window.__atlas.zoom` przyjmuje ≥ 3 wartości pośrednie, końcowy widok = dopasowanie do bbox; przeciągnięcie w trakcie zatrzymuje animację; `?u=12` z linku → od razu widok końcowy; `drill.spec.ts`, `map.spec.ts`, `map-zoom-out.spec.ts` bez zmian.
- **Ty sprawdzasz:** klik w województwo – kamera płynnie podjeżdża (~0,6 s), bez skoku; „Wróć” – szybciej odjeżdża; przeciągnięcie w trakcie przejmuje sterowanie.
- **Nie ruszaj:** `layers/choropleth.ts`.

#### W3.3 – Kafelki po kolei i wyblakła reszta kraju (S16) · fala F1
- **Pliki:** `src/view/map/layers/choropleth.ts`, `src/view/map/hooks/useChoropleth.ts`, `src/core/map/test-seam.ts` (stan `reveal: { running, progress }`), `tests/e2e/reveal.spec.ts` (nowy).
- **Zadanie:** przy wejściu w głąb jednostki niższego poziomu pojawiają się wg `revealPlan()` (podpowiedź: `DataFilterExtension` z `@deck.gl/extensions` – numer kolejności jako `getFilterValue`, animowany tylko `filterRange` / `filterSoftRange`; nie sprawdzi się → opisz w PR alternatywę przed zrobieniem); reszta kraju nadal rysowana, wyblakła (kolor/krycie z tokenów), bez interakcji; wejście z linku – od razu całość.
- **Gotowe, gdy (`@S16`):** w trakcie wejścia `window.__atlas.reveal.progress` rośnie 0 → 1 w ≤ 1 s; pierwszy widoczny = najbliższy środka; po wejściu w małopolskie jednostki spoza województwa są rysowane i nie reagują na najechanie; `prefers-reduced-motion` → progress od razu 1.
- **Ty sprawdzasz:** powiaty wypełniają się kolorem po kolei od środka; reszta Polski blednie, nie znika.
- **Nie ruszaj:** `useMapViewState.ts`, `AtlasMap.tsx`.

#### W3.4 – Przelewanie kolorów przy zmianie wskaźnika, roku, poziomu (S16) · fala F2
- **Pliki:** `src/view/map/layers/choropleth.ts` (przejście koloru wypełnienia 300 ms – `motion.base`), `tests/e2e/color-transition.spec.ts` (nowy).
- **Gotowe, gdy (`@S16`):** po zmianie wskaźnika `window.__atlas` raportuje trwające przejście, po ≤ 400 ms – nowe kolory; reduced motion → od razu.
- **Ty sprawdzasz:** zmiana wskaźnika lub roku – kolory łagodnie przechodzą.

#### W3.5 – Scena wejścia „kreślenie” (S16, opcjonalnie) · przeniesione do „Później”
- **Decyzja 24.10.2026:** warunku „płynne na Twoim telefonie” automat nie oceni, a scena jest opcjonalna – wraca po Twojej ocenie S16.
- **Warunek:** W3.2 i W3.3 są płynne na Twoim telefonie (inaczej odkładamy do „Później”).
- **Pliki:** `src/view/map/IntroOverlay.tsx` (nowy, nakładka SVG), `src/view/Home.tsx` (podpięcie), `tests/e2e/intro.spec.ts` (nowy).
- **Zadanie:** raz na wizytę (pamięć w `sessionStorage` w try/catch): kontur Polski rysuje się w 1,2 s (`motion.drawOutline`), potem wypełnienie; oś czasu z istniejącego `src/core/motion/timeline.ts`; nie blokuje klikania; reduced motion → bez sceny.
- **Gotowe, gdy:** pierwsze wejście → scena trwa ≤ 2 s, drugie w tej samej sesji → brak; klik w trakcie działa.
- **Ty sprawdzasz:** pierwsze wejście – kontur Polski rysuje się tuszem.

#### W3.6 – Pomiar szybkości i płynności + test ścieżki (S16) · fala F6
- **Pliki:** `tests/e2e/s16-motion.spec.ts` (nowy), raport w opisie PR. Kodu nie zmieniasz.
- **Gotowe, gdy:** ścieżka z animacjami (wejście, powrót, zmiana wskaźnika) przechodzi 3×; progi żądań z `PRODUKT.md` §7 bez zmian; w PR: czas do kolorowej mapy i rozmiar JS na wejściu vs przed S16 (wzrost ≤ 5%).
- **Ty sprawdzasz:** na swoim telefonie animacje bez szarpania; jeśli szarpie → `TRYB: POMOC`.

### S20 i S21 – nowe zadania (plan z 25.10.2026, fale F8–F12)
Wszystkie zadania małe (1–3 pliki kodu + test), bez nowych pakietów. Decyzje produktowe: `docs/PRODUKT.md` §4c (miasto i wieś) i §4d (biblioteka GUS); kontrakty plików: §5.5. W2: dopisz wspólne „Gotowe, gdy” z początku §3.

#### W1.15 – Lista wskaźników z podziałem na miasto i wieś (S20) · fala F8
- **Po ludzku:** jeden plik mówi, dla których 14 wskaźników pokazujemy osobno miasto i wieś gminy miejsko-wiejskiej (bez dochodów i wydatków, bo tam GUS daje fałszywe zera).
- **Przeczytaj najpierw:** `docs/research/W1.11-wynik.md`, `config/indicators.json`.
- **Pliki:** `config/parts.json` (nowy), `src/core/parts/allowed.ts` (nowy), `tests/unit/parts-allowed.test.ts` (nowy).
- **Zadanie:** `config/parts.json` = tablica identyfikatorów (bez wcięć): `population`, `density`, `median-age`, `share-65plus`, `natural-increase`, `migration-balance`, `regon-per-10k`, `dwellings-per-1000`, `dwelling-area-per-person`, `sewerage-share`, `forest-cover`, `library-readers-per-1000`, `preschool-3-6`, `unemployed-share-working-age`. `partsIndicatorIds()` i `isPartsIndicator(id)` w `allowed.ts` (import JSON jak w innych plikach `src/core`).
- **Gotowe, gdy:** testy: dokładnie 14 id, bez duplikatów; każdy istnieje w `config/indicators.json` i ma `minLevel` `gmi`; `income-per-capita` i `spending-per-capita` nie ma na liście; `isPartsIndicator('population')` prawda, `isPartsIndicator('avg-wage')` fałsz; plik bez wcięć.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `config/indicators.json`, `src/view/`.

#### W1.16 – Części miasto i wieś z odpowiedzi BDL: logika (S20) · fala F8
- **Po ludzku:** funkcja, która z odpowiedzi GUS wyciąga osobne liczby dla miasta i obszaru wiejskiego (dziś robot je wyrzuca).
- **Przeczytaj najpierw:** `docs/research/W1.11-wynik.md`, `scripts/data/map-units.mjs` (funkcja `getTerytFromBdlId` – kody 4 i 5 są dziś pomijane), `scripts/data/values.mjs`.
- **Pliki:** `scripts/data/parts.mjs` (nowy), `tests/unit/parts-build.test.ts` (nowy).
- **Zadanie:** `toPartsValues(indicator, pages, units, allowedIds)` → `PartsValues` z §5.5 albo `null` (wskaźnik spoza `allowedIds`). Rekord poziomu 6 (`level` 6) o 12-cyfrowym id z końcówką `4` (miasto) lub `5` (obszar wiejski) → klucz 7-cyfrowy `id.slice(2,4) + id.slice(7,12)`; zachowuj tylko części, których gmina-matka (ten sam kod z końcówką `3`) jest w `units.json`; wartości jak w BDL (zero zostaje zerem, brak = `null`); `years` posortowane rosnąco; bez znaczników czasu w wyniku.
- **Gotowe, gdy:** testy na nagraniach z `tests/fixtures/bdl/recorded/` (np. 72305, 1617169) i `public/data/units.json`: liczba gmin m-w = liczbie z `units.json`; każda ma dokładnie dwie części; ludność: miasto + wieś = gmina; `null` zostaje `null`; zero zostaje zerem; wskaźnik spoza listy → `null`; wynik bez wcięć po serializacji; brak sieci.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `scripts/data/values.mjs`, `scripts/data/map-units.mjs`, `scripts/data/fetch-values.mjs` (tylko czytasz).

#### W1.17 – Nocny robot zapisuje części miasto i wieś (S20) · fala F9
- **Po ludzku:** przy zwykłym nocnym pobieraniu robot od razu zapisuje też miasto i wieś – bez ani jednego dodatkowego zapytania do GUS.
- **Przeczytaj najpierw:** `scripts/data/fetch-values.mjs` (`fetchIndicatorValues`, `main`), `scripts/data/parts.mjs` (W1.16), `config/parts.json` (W1.15).
- **Pliki:** `scripts/data/fetch-values.mjs` (częściowy, do 40 linii), `tests/unit/parts-nightly.test.ts` (nowy).
- **Zadanie:** do `fetchIndicatorValues` dodaj opcję `onPages(pages)` wołaną raz z wszystkimi pobranymi stronami (zachowanie bez opcji bez zmian). W `main` dla wskaźnika z `config/parts.json` zbuduj `toPartsValues(...)` ze stron i zapisz bez wcięć do `data/parts/<indicatorId>.json` (katalog w korzeniu repo, **nie** w `public/`; tworzony przy zapisie). Przy `--out-dir` zapis obok (`<out-dir>/../parts-src`).
- **Gotowe, gdy:** istniejące testy `fetch-values*.test.ts` bez zmian; test w trybie nagrań (`offlineFixture`): liczba żądań z `onPages` = bez `onPages`; wskaźnik z listy daje plik z częściami gmin m-w, spoza listy – brak pliku; plik bez wcięć i bez `fetchedAt`.
- **Ty sprawdzasz:** ✅ (dane pojawią się po pierwszym nocnym przebiegu po scaleniu W1.17 i W1.18).
- **Nie ruszaj:** `.github/workflows/` (workflow dopisuje Claude po scaleniu), `scripts/data/values.mjs`.

#### W1.18 – Części miasto i wieś w plikach na województwa (S20) · fala F9
- **Po ludzku:** z czternastu plików (po jednym na wskaźnik) robimy szesnaście małych (po jednym na województwo), żeby profil pobierał jeden plik zamiast czternastu.
- **Przeczytaj najpierw:** `scripts/data/build-profiles.mjs` (jak składa pliki województw), §5.5 (`PartsShard`).
- **Pliki:** `scripts/data/build-parts.mjs` (nowy), `tests/unit/parts-shards.test.ts` (nowy).
- **Zadanie:** `buildPartsShards(partsByIndicator, units)` → mapa `teryt województwa → PartsShard` (§5.5; klucz części = 7 cyfr; województwo z `units.json`); uruchomienie bez argumentów czyta `data/parts/*.json` i zapisuje `public/data/parts/<WW>.json` bez wcięć (województwo bez gmin m-w – brak pliku). Bez znaczników czasu; zapis tylko gdy treść się zmieniła.
- **Gotowe, gdy:** testy na małych danych w teście (2 województwa, 3 wskaźniki): każda część trafia do pliku swojego województwa; lata osobno dla wskaźnika; brak pliku dla województwa bez części; ponowne uruchomienie nie zmienia plików; wynik bez wcięć.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `scripts/data/build-profiles.mjs`, `public/data/profiles/`.

#### W1.19 – Wczytywanie części miasto i wieś (S20) · fala F9
- **Po ludzku:** strona umie pobrać plik województwa z miastem i wsią – dopiero wtedy, gdy ktoś rozwinie blok.
- **Przeczytaj najpierw:** `src/core/data/load-values.ts` (wzorzec: pamięć podręczna, 404 → `null`), §5.5.
- **Pliki:** `src/core/data/load-parts.ts` (nowy), `tests/unit/load-parts.test.ts` (nowy).
- **Zadanie:** `loadPartsShard(voivodeship, fetchImpl?)` → `PartsShard | null`: adres `/data/parts/<WW>.json`, pamięć podręczna i wspólne wczytywanie jednego żądania, 404 i zły kształt → `null` (bez wyjątków).
- **Gotowe, gdy:** testy: dwa wywołania = jedno żądanie; 404 → `null`; zły JSON → `null`; poprawny kształt przechodzi; różne województwa = różne żądania.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `src/core/data/load-values.ts` (tylko wzorzec).

#### W1.20 – Wiersze „Gmina · Miasto · Obszar wiejski”: logika (S20) · fala F9
- **Po ludzku:** z danych składamy gotowe wiersze tabeli dla jednej gminy miejsko-wiejskiej.
- **Przeczytaj najpierw:** `src/core/units/label.ts` (`gminaKind`), `src/core/format/number.ts`, `config/parts.json`.
- **Pliki:** `src/core/parts/rows.ts` (nowy), `tests/unit/parts-rows.test.ts` (nowy).
- **Zadanie:** `partsRows({ gminaTeryt, shard, values, indicators })` → `{ year: number | null, rows: { indicatorId, name, unit, gmina, city, rural }[] }`; tylko dla gminy z końcówką `3` (inne → `rows: []`); rok = najnowszy, w którym jest wartość miasta lub wsi któregokolwiek wskaźnika; `gmina` z `values` (`IndicatorValues`, ten sam rok); `null` zostaje `null`; kolejność wskaźników jak w `config/parts.json`.
- **Gotowe, gdy:** testy na małych danych w teście: gmina m-w → 14 wierszy; gmina miejska i wiejska → pusto; miasto + wieś = gmina dla ludności; rok pierwszy z wartością; brak shardu → `rows: []`.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `src/view/`.

#### W2.24 – Blok „Miasto i obszar wiejski”: komponent (S20) · fala F10
- **Po ludzku:** zwijany blok z tabelą miasto/wieś (na telefonie karty), jeszcze niepodpięty do profilu.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4c, `docs/STYL.md` §2–§4, `src/view/hooks/useIsMobile.ts`.
- **Pliki:** `src/view/profile/ProfileParts.tsx` (nowy), `tests/unit/profile-parts.test.tsx` (nowy).
- **Zadanie:** `ProfileParts({ rows, year, onFirstExpand })`: przycisk „Miasto i obszar wiejski” (`aria-expanded`, domyślnie zwinięty); `onFirstExpand` wołane raz przy pierwszym rozwinięciu; komputer: tabela „Wskaźnik · Gmina · Miasto · Obszar wiejski”; telefon (< 768 px): karta na wskaźnik; `null` → „brak danych”; podpis z §4c; kolory, odstępy i rozmiary tylko z tokenów.
- **Gotowe, gdy (`@S20`):** testy: domyślnie zwinięty; po kliknięciu widać 14 wierszy; `onFirstExpand` dokładnie raz; `null` → „brak danych”; widok telefonu to karty; przycisk ≥ 44 px wysokości; axe bez błędów.
- **Ty sprawdzasz:** ✅ (widoczne dopiero po W2.25).
- **Nie ruszaj:** `ProfileSheet*.tsx`, `ProfileOverview.tsx`.

#### W2.25 – Blok „Miasto i obszar wiejski” w profilu gminy (S20) · fala F11
- **Po ludzku:** w profilu gminy miejsko-wiejskiej pojawia się blok z miastem i wsią.
- **Przeczytaj najpierw:** `src/view/profile/ProfileOverview.tsx`, `src/view/profile/ProfileParts.tsx` (W2.24), `src/core/data/load-parts.ts` (W1.19), `src/core/parts/rows.ts` (W1.20).
- **Pliki:** `src/view/profile/ProfileOverview.tsx` (częściowy, do 25 linii), `tests/e2e/profile-parts.spec.ts` (nowy), `tests/fixtures/parts/shard-12.json` (nowy – krótki plik województwa 12 z dwiema gminami m-w z `units.json` i trzema wskaźnikami).
- **Zadanie:** dla gminy z końcówką `3` pod przeglądem pokaż `ProfileParts`; `onFirstExpand` → `loadPartsShard` (W1.19) → `partsRows` (W1.20); brak pliku (404) → blok z komunikatem „Dane o mieście i wsi pojawią się po najbliższej aktualizacji”; w innych gminach i jednostkach bloku nie ma.
- **Gotowe, gdy (`@S20`):** test e2e z podmienionym żądaniem `/data/parts/12.json` (fixture): w profilu gminy m-w blok jest zwinięty, otwarcie profilu = 0 żądań do `parts`, rozwinięcie = dokładnie 1, widać liczby miasta i wsi; 404 → komunikat; w profilu gminy miejskiej i powiatu bloku nie ma; telefon 390 px bez poziomego przewijania; istniejące testy bez zmian.
- **Ty sprawdzasz:** w profilu gminy miejsko-wiejskiej (np. po wyszukaniu „Wałcz”) pod przeglądem jest blok „Miasto i obszar wiejski”; po rozwinięciu widać trzy kolumny (liczby pojawią się po pierwszym nocnym pobraniu).
- **Nie ruszaj:** `ProfileSheet*.tsx`, `ProfileIndicatorRow.tsx`.

#### W2.26 – Test całej ścieżki „Miasto i wieś” (S20) · fala F12
- **Po ludzku:** jeden test przechodzi całą ścieżkę: wyszukanie gminy, profil, rozwinięcie bloku.
- **Pliki:** `tests/e2e/s20-parts.spec.ts` (nowy). Kodu nie zmieniasz.
- **Gotowe, gdy (`@S20`):** ścieżka (wyszukaj gminę m-w → profil → rozwiń blok, dane z `tests/fixtures/parts/shard-12.json`) przechodzi 3×, na komputerze i 390 px; progi §7: otwarcie profilu bez żądań do `parts`, rozwinięcie jedno.
- **Ty sprawdzasz:** na telefonie gmina miejsko-wiejska pokazuje blok z kartami (po pierwszym nocnym pobraniu – z liczbami).

#### W1.21 – Indeks biblioteki GUS: budowanie (S21) · fala F8
- **Po ludzku:** z katalogu zebranego przez robota powstaje mały plik-spis, z którego strona biblioteki zbuduje kategorie i wyszukiwarkę.
- **Przeczytaj najpierw:** `scripts/data/library-lib.mjs` (kształt `catalog` i `state`), §5.5 (`LibraryIndex`).
- **Pliki:** `scripts/data/library-index.mjs` (nowy), `tests/unit/library-index.test.ts` (nowy).
- **Zadanie:** `buildIndex(catalog, state)` → `LibraryIndex` (§5.5): kategorie z `catalog.subjects` (`n` = nazwa, `p` = rodzic albo `null`), zmienne tylko z poziomem ≥ 5 (`level` 6 → 6, inaczej 5), nazwa = niepuste `n1`, `n2`, `n3` złączone przez „ – ”, jednostki w słowniku `units`, `has` = 1 gdy `state.done[id]`; zmienne posortowane po id. Uruchomienie bezpośrednie (`node scripts/data/library-index.mjs`): czyta `${LIBRARY_DIR:-library}/catalog.json` i `state.json`, zapisuje `index.json` bez wcięć.
- **Gotowe, gdy:** testy na małym katalogu w teście (4 działy w dwóch gałęziach, 6 zmiennych w tym jedna z poziomem 3 i jedna bez `n2`): zmienna z poziomem < 5 pominięta; nazwy złączone bez pustych części; `has` zgodne ze `state`; słownik jednostek bez duplikatów; wynik bez wcięć; ten sam wynik przy ponownym budowaniu.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `scripts/data/library.mjs`, `scripts/data/library-lib.mjs`, `.github/workflows/`.

#### W1.22 – Wyszukiwanie i filtry biblioteki: logika (S21) · fala F8
- **Po ludzku:** czysta logika: szukanie po nazwie bez względu na polskie znaki, filtrowanie po kategorii, poziomie i jednostce, zliczanie wyników w kategoriach.
- **Przeczytaj najpierw:** `src/core/search/normalize.ts` (użyj, nie kopiuj), §5.5 (`LibraryIndex`).
- **Pliki:** `src/core/library/query.ts` (nowy), `tests/unit/library-query.test.ts` (nowy).
- **Zadanie:** typ `LibraryQuery` `{ cat: string | null; text: string; level: 5 | 6 | null; unit: string | null; onlyReady: boolean }`; `filterVars(index, query)` (kategoria obejmuje podkategorie; tekst: wszystkie słowa muszą wystąpić w nazwie, bez względu na wielkość liter i polskie znaki; wyniki wg trafności: początek nazwy, potem alfabetycznie po nazwie); `childCategories(index, parent)`; `categoryPath(index, id)`; `countByCategory(index, query)` (liczba wyników w każdej kategorii z podkategoriami); `emptyQuery()`.
- **Gotowe, gdy:** testy na małym indeksie w teście (nie na prawdziwym): „ludnosc” znajduje „Ludność”; kategoria nadrzędna obejmuje zmienne podkategorii; `onlyReady` zostawia `has` = 1; `level` 5 nie zwraca zmiennych tylko gminnych; liczniki kategorii zgodne z wynikami; 20 000 zmiennych filtrowanych w < 100 ms (test wydajności z progiem 500 ms).
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `src/core/search/` (tylko używasz), `src/view/`.

#### W1.23 – Wczytywanie biblioteki: indeks i wartości wskaźnika (S21) · fala F8
- **Po ludzku:** strona umie pobrać spis biblioteki (raz) i wartości jednego wskaźnika (na żądanie), z jednego, łatwo zmienianego adresu.
- **Przeczytaj najpierw:** `src/core/data/load-values.ts` (wzorzec), §5.5, `docs/research/biblioteka-gus.md`.
- **Pliki:** `src/core/library/config.ts` (nowy), `src/core/library/load-library.ts` (nowy), `tests/unit/load-library.test.ts` (nowy).
- **Zadanie:** `config.ts`: `libraryBase()` = `import.meta.env.VITE_LIBRARY_BASE` albo domyślnie `https://raw.githubusercontent.com/olubiec/faktografia-atlas/data/library/library` (bez końcowego `/`). `loadLibraryIndex()` → `LibraryIndex | null` (jedno żądanie `<base>/index.json`, pamięć podręczna); `loadLibraryValues(id)` → `LibraryValues | null` (`<base>/values/<id>.json`, pamięć podręczna, 404 → `null`); `valuesByTeryt(values, level, units)` zamienia klucze (12-znakowe identyfikatory BDL) na TERYT przez `bdlId` z `units.json`, pomijając części gmin i nieznane id.
- **Gotowe, gdy:** testy z podmienionym `fetch`: dwa wywołania `loadLibraryIndex` = jedno żądanie na adres z `libraryBase()`; 404 → `null`; zły kształt → `null`; `valuesByTeryt` mapuje znane `bdlId` i pomija nieznane; zmiana `VITE_LIBRARY_BASE` zmienia adres; bez żadnego wywołania sieci przy imporcie.
- **Ty sprawdzasz:** ✅.
- **Nie ruszaj:** `src/core/data/` (tylko wzorzec), `vercel.json`.

#### W1.24 – „Zamów wskaźnik”: odnośnik do zgłoszenia (S21) · fala F8 · zrobione, do poprawki w W1.27
- **Po ludzku:** z wskaźnika, którego jeszcze nie mamy, robimy gotowy link do zgłoszenia na GitHubie – nic nie wysyłamy sami.
- **Pliki (F8, zrobione):** `src/core/library/order.ts`, `tests/unit/library-order.test.ts`.
- **Stan:** `order.ts` zbudowany w F8 z parametrami `title`, `labels`, `body`. R8 (zweryfikowane 26.10) pokazało, że `labels=` w adresie działa tylko dla osób z uprawnieniami (inni dostają 404), więc ta wersja jest do poprawki – zob. W1.27.

#### W1.25 – Robot biblioteki: pełne nazwy zmiennych (n1–n5) i tytuły w spisie (S21) · fala F8b
- **Po ludzku:** dziś robot zapamiętuje tylko trzy z pięciu członów nazwy zmiennej BDL, więc co czwarta zmienna (ok. 15,7 tys. z 64 tys.) wygląda w spisie identycznie jak inna (np. „mężczyźni” i „kobiety” znikają). Naprawa: zapisać wszystkie człony.
- **Dowód (26.10.2026, prawdziwy katalog):** 172 740 zmiennych, 63 960 na poziomie powiatu lub gminy; w 2 595 grupach (15 753 zmiennych) dział i tytuł są identyczne. BDL zwraca `n1`–`n5` (np. zmienna 60614 ma `n4` = „mężczyźni”); `library.mjs` odczytuje tylko `n1`–`n3`.
- **Przeczytaj najpierw:** `scripts/data/library.mjs`, `scripts/data/library-index.mjs`, `src/core/library/index-contract.ts` (po scaleniu naprawy kontraktu), `docs/research/haiku/R7.1-R7.4.md`.
- **Pliki:** `scripts/data/library.mjs`, `scripts/data/library-index.mjs`, `tests/unit/library.test.ts` (dopisanie przypadków), `tests/unit/library-index.test.ts` (dopisanie przypadków), `tests/fixtures/library/variable-60614.json` (nagrana odpowiedź BDL z `n4`; zmienna 60614: n4 = „mężczyźni”).
- **Zadanie:** (1) robot zapisuje `n1`–`n5` (puste pomijane); (2) `buildIndex` składa tytuł z wszystkich niepustych członów (w tej samej kolejności, rozdzielone „ – ” jak dotąd), pole `n` zawiera pełny tytuł; (3) stary katalog bez `n4`/`n5` nadal się wczytuje (brak = pusty).
- **Gotowe, gdy:** testy: zmienna z `n4` ma w spisie tytuł z czterema członami; dwie zmienne różniące się tylko `n4` mają różne tytuły; stary katalog działa; rozmiar spisu dla fixture nie rośnie więcej niż o 15%.
- **Ty robisz po scaleniu:** jedno ręczne uruchomienie „Fetch library” (pełny ponowny przegląd katalogu – ok. 2000 zapytań, budżet 2500 na uruchomienie); dopiero wtedy spis ma pełne tytuły. **Przed W2.28–W2.33 (F10).**
- **Nie ruszaj:** `.github/workflows/`, `src/view/`.

#### W1.26 – Wyszukiwanie w bibliotece: wydajność na 64 tys. zmiennych (S21) · fala F8b
- **Po ludzku:** wyszukiwanie ma być natychmiastowe także przy prawdziwym spisie (64 tys. zmiennych), nie tylko na przykładzie 20 tys.
- **Dowód (26.10.2026, pomiar na prawdziwym spisie):** filtr po tekście 170–850 ms, po poziomie ~740 ms, `countByCategory` ~1,6 s (sandbox, telefon będzie wolniejszy). Warunek W1.22 sprawdzał tylko 20 tys.
- **Pliki:** `src/core/library/query.ts`, `src/core/library/index-contract.ts` (przygotowanie pól pomocniczych w `prepare`), `tests/unit/library-query-perf.test.ts` (nowy). Istniejącego `library-query.test.ts` nie zmieniasz.
- **Zadanie:** raz przy wczytaniu liczyć znormalizowane nazwy (małe litery, bez polskich znaków) i indeksy kategorii; filtry i `countByCategory` używają ich zamiast liczyć za każdym razem; wynik funkcji bez zmian.
- **Gotowe, gdy:** wszystkie istniejące testy przechodzą bez zmian; test wydajności na wygenerowanych 64 000 zmiennych: filtr tekstowy, filtr poziomu i `countByCategory` każdy < 100 ms (w CI z zapasem, np. próg 150 ms); wyniki identyczne jak przed zmianą na tych samych danych.
- **Nie ruszaj:** `src/view/`, `load-library.ts`.

#### W1.27 – „Zamów wskaźnik”: adres przez formularz zgłoszeń (S21) · fala F8b (po zgodzie na zmianę istniejącego testu)
- **Po ludzku:** przycisk otwiera gotowy formularz zgłoszenia z wypełnionymi polami; bez ryzyka 404 dla zwykłych użytkowników.
- **Co potwierdziło R8 (26.10.2026, dokumentacja GitHuba):** pola formularza (`id`) wypełnia się parametrami w adresie; dotyczy sprawdzonych pól tekstowych (`input`, `textarea`), pola wyboru i listy rozwijane nie są gwarantowane; `labels=` w adresie wymaga uprawnień (inaczej 404); etykieta z pliku formularza jest dodawana automatycznie, o ile istnieje w repo; zbyt długi adres daje 414 (zmierzone: 8189 znaków → 302, 8199 → 414).
- **Przeczytaj najpierw:** `src/core/library/order.ts`, `tests/unit/library-order.test.ts`, `.github/ISSUE_TEMPLATE/zamowienie-wskaznika.yml` (Claude dodaje przed tą falą).
- **Pliki:** `src/core/library/order.ts`, `tests/unit/library-order.test.ts` (**zgoda właściciela potrzebna**: test dziś sprawdza parametr `labels`; zmieniamy go na `template` i pola).
- **Zadanie:** `orderIssueUrl` buduje `…/issues/new?template=zamowienie-wskaznika.yml&title=…&<id pola>=…` (pola: `id`, `nazwa`, `dzial`, `poziom`; tylko `input`/`textarea`); bez `labels`; długość ≤ 1800 znaków; nazwa skracana z „…”.
- **Gotowe, gdy:** testy: adres zaczyna się od `…/issues/new?template=zamowienie-wskaznika.yml&`; brak `labels=`; 400-znakowa nazwa mieści się w 1800; polskie znaki zachowane; `id` wskaźnika w polu.
- **Poza zadaniem (Claude, przed falą):** plik formularza `.github/ISSUE_TEMPLATE/zamowienie-wskaznika.yml` z polami o tych `id` i `labels: ["zamowienie-wskaznika"]` oraz etykieta w repo (Jules nie rusza `.github/`).
- **Nie ruszaj:** `src/view/`.

#### W2.27 – Strona `/biblioteka`: szkielet i miejsca podpięcia (S21) · fala F9
- **Po ludzku:** pusta strona biblioteki z czterema miejscami na kategorie, wyszukiwarkę, filtry i wyniki – kolejne zadania wypełniają każde miejsce osobno.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4d, §7, `src/App.tsx`, `src/view/pages/` (jak zbudowane są strony „O projekcie” i „Źródła”), `src/core/library/` (W1.22, W1.23).
- **Pliki:** `src/view/pages/Library.tsx` (nowy), `src/view/library/CategoryTiles.tsx` (nowy, szkielet), `src/view/library/LibrarySearchBar.tsx` (nowy, szkielet), `src/view/library/LibraryFilters.tsx` (nowy, szkielet), `src/view/library/LibraryResults.tsx` (nowy, szkielet), `src/App.tsx` (częściowy, do 6 linii), `tests/e2e/library-page.spec.ts` (nowy), `tests/fixtures/library/index.json` (nowy – spis w kształcie `LibraryIndex`: 3 działy z jednym podziałem, 12 zmiennych, część z `has` = 1).
- **Zadanie:** trasa `/biblioteka` → `Library`. Strona: nagłówek i licznik z §4d, stany: ładowanie, błąd z „Spróbuj ponownie”, brak spisu („Biblioteka dopiero się buduje – pierwsze wskaźniki pojawią się wkrótce”), gotowe. Stan `LibraryQuery` (W1.22) w `useState` strony, przekazywany czterem szkieletom propsami (`index`, `query`, `onQueryChange`); każdy szkielet renderuje pusty kontener z `data-testid` i sam nic nie liczy.
- **Gotowe, gdy (`@S21`):** e2e z podmienionym żądaniem spisu (fixture): `/biblioteka` pokazuje licznik zgodny z fixture; 404 spisu → komunikat „dopiero się buduje”; błąd sieci → „Spróbuj ponownie” i ponowienie działa; wejście na stronę = dokładnie 1 żądanie spisu i 0 żądań do `values/` lub `profiles/`; telefon 390 px bez poziomego przewijania; istniejące testy bez zmian.
- **Ty sprawdzasz:** pod adresem `/biblioteka` strona z nagłówkiem i licznikiem (listy jeszcze puste).
- **Nie ruszaj:** `AtlasMap.tsx`, `Home.tsx`, `Header.tsx`.

#### W2.28 – Biblioteka: kafelki kategorii i okruszki (S21) · fala F10
- **Po ludzku:** działy GUS jako kafelki z liczbą wskaźników; po wejściu – podkategorie i ścieżka powrotu.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4d, `src/view/library/CategoryTiles.tsx` (szkielet z W2.27), `src/core/library/query.ts`.
- **Pliki:** `src/view/library/CategoryTiles.tsx`, `tests/unit/library-categories.test.tsx` (nowy).
- **Zadanie:** bez wybranej kategorii: kafelki działów głównych z liczbą wyników (`countByCategory`); z wybraną: kafelki podkategorii (albo nic, gdy to liść) i okruszki „Wszystkie › Dział › Podkategoria” jako przyciski; kliknięcie woła `onQueryChange({ ...query, cat })`; „Wszystkie” czyści kategorię.
- **Gotowe, gdy (`@S21`):** testy komponentu: kafelki głównych działów z liczbami; wejście w dział pokazuje podkategorie i okruszki; „Wszystkie” czyści; liść bez kafelków; przyciski ≥ 44 px; axe bez błędów; kafelki w siatce bez poziomego przewijania przy 360 px.
- **Ty sprawdzasz:** ✅ (widoczne po W2.32).
- **Nie ruszaj:** `Library.tsx`, pozostałych plików `src/view/library/`.

#### W2.29 – Biblioteka: wyszukiwarka wskaźników (S21) · fala F10
- **Po ludzku:** pole „Szukaj wskaźnika” z podpowiedziami.
- **Przeczytaj najpierw:** `src/view/library/LibrarySearchBar.tsx` (szkielet), `src/core/library/query.ts`, `src/view/search/` (istniejąca wyszukiwarka jednostek – wzorzec dostępności).
- **Pliki:** `src/view/library/LibrarySearchBar.tsx`, `tests/unit/library-search-bar.test.tsx` (nowy).
- **Zadanie:** pole z etykietą „Szukaj wskaźnika”, przycisk czyszczenia; wpisywanie woła `onQueryChange({ ...query, text })`; lista do 5 podpowiedzi (nazwa + ścieżka kategorii) jako `listbox` obsługiwany strzałkami; wybór podpowiedzi woła `onPick(id)`; Enter bez wybranej podpowiedzi tylko zatwierdza tekst.
- **Gotowe, gdy (`@S21`):** testy: wpisanie „ludnosc” pokazuje podpowiedź z „Ludność”; strzałki i Enter wybierają; `onPick` dostaje id; czyszczenie zeruje tekst; pole z etykietą; ≥ 44 px; axe bez błędów.
- **Ty sprawdzasz:** ✅ (widoczne po W2.32).
- **Nie ruszaj:** `Library.tsx`, `src/view/search/`.

#### W2.30 – Biblioteka: filtry (S21) · fala F10
- **Po ludzku:** przełączniki: powiaty/gminy, jednostka miary, „tylko już pobrane”.
- **Przeczytaj najpierw:** `src/view/library/LibraryFilters.tsx` (szkielet), `src/core/library/query.ts`, `src/view/controls/` (istniejące kontrolki).
- **Pliki:** `src/view/library/LibraryFilters.tsx`, `tests/unit/library-filters.test.tsx` (nowy).
- **Zadanie:** trzy kontrolki zmieniające `level`, `unit`, `onlyReady` przez `onQueryChange`; lista jednostek tylko te, które występują w bieżących wynikach; przycisk „Wyczyść filtry”; stan aktywnych filtrów widoczny (nie tylko kolorem).
- **Gotowe, gdy (`@S21`):** testy: zmiana każdej kontrolki woła `onQueryChange` z właściwym polem; „Wyczyść filtry” zeruje trzy pola, nie dotyka `cat` i `text`; lista jednostek zgodna z wynikami; ≥ 44 px; axe bez błędów.
- **Ty sprawdzasz:** ✅ (widoczne po W2.32).
- **Nie ruszaj:** `Library.tsx`, `src/view/controls/` (tylko używasz).

#### W2.31 – Biblioteka: lista wyników (S21) · fala F10
- **Po ludzku:** lista wskaźników pasujących do wyszukiwania, po 50, z „Pokaż więcej”.
- **Przeczytaj najpierw:** `src/view/library/LibraryResults.tsx` (szkielet), `src/core/library/query.ts`.
- **Pliki:** `src/view/library/LibraryResults.tsx`, `tests/unit/library-results.test.tsx` (nowy).
- **Zadanie:** z `filterVars(index, query)` wyświetl wiersze: nazwa, ścieżka kategorii, jednostka, poziom („powiaty” / „gminy i powiaty”), znacznik „można przeglądać” albo „jeszcze niepobrane” (tekst, nie tylko kolor); wiersz to odnośnik do `/biblioteka/<id>`; pierwsze 50 wyników i przycisk „Pokaż więcej” (+50); brak wyników → „Brak wyników. Spróbuj innego słowa albo zdejmij filtry.”
- **Gotowe, gdy (`@S21`):** testy z `MemoryRouter`: 120 wyników → 50 widocznych; „Pokaż więcej” → 100; odnośnik prowadzi do `/biblioteka/<id>`; stan „jeszcze niepobrane” z tekstem; brak wyników → komunikat; axe bez błędów; długa nazwa zawija się, bez poziomego przewijania przy 360 px.
- **Ty sprawdzasz:** ✅ (widoczne po W2.32).
- **Nie ruszaj:** `Library.tsx`.

#### W2.32 – Biblioteka: złożenie strony i adres (S21) · fala F11
- **Po ludzku:** kafelki, wyszukiwarka, filtry i wyniki działają razem, a stan jest w adresie (można wkleić link).
- **Przeczytaj najpierw:** `src/view/pages/Library.tsx` (W2.27), pliki `src/view/library/` (W2.28–W2.31), `src/core/url/state.ts` (wzorzec czytania adresu).
- **Pliki:** `src/view/pages/Library.tsx`, `tests/e2e/library-search.spec.ts` (nowy).
- **Zadanie:** stan `LibraryQuery` czytany z adresu i zapisywany do adresu (`?k=` dział, `?q=` tekst, `?l=` poziom 5 lub 6, `?j=` jednostka, `?p=1` tylko pobrane); `onPick(id)` z wyszukiwarki → nawigacja do `/biblioteka/<id>`; zmiana zapytania nie przeładowuje strony; przycisk „wstecz” w przeglądarce wraca do poprzedniego stanu.
- **Gotowe, gdy (`@S21`):** e2e (spis z fixture): wpisanie „ludnosc” zawęża listę i zapisuje `?q=`; wejście w dział zapisuje `?k=`; wklejenie adresu z `?k=…&q=…` odtwarza ten sam widok; „wstecz” cofa; telefon 390 px bez poziomego przewijania; w całej ścieżce 1 żądanie spisu.
- **Ty sprawdzasz:** na `/biblioteka` kategorie, szukanie i filtry działają razem; link do wyszukiwania da się skopiować.
- **Nie ruszaj:** komponentów `src/view/library/` (tylko używasz).

#### W2.33 – Strona wskaźnika `/biblioteka/<id>` (S21) · fala F10
- **Po ludzku:** po wybraniu wskaźnika widać ranking najwyżej i najniżej, można wybrać rok i poziom, pobrać CSV albo zamówić wskaźnik, którego jeszcze nie ma.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4d, `src/core/ranking/ranking.ts`, `src/view/ranking/RankingBars.tsx`, `src/core/data/load-atlas-data.ts`, `src/view/library/DownloadCsv.tsx` i `OrderButton.tsx` (W2.34, W2.35).
- **Pliki:** `src/view/pages/LibraryVariable.tsx` (nowy), `src/App.tsx` (częściowy, do 4 linii), `tests/e2e/library-variable.spec.ts` (nowy), `tests/fixtures/library/values-sample.json` (nowy – wartości w kształcie `LibraryValues` dla 3 powiatów i 3 lat z `units.json`).
- **Zadanie:** trasa `/biblioteka/:id`. Metadane ze spisu (`loadLibraryIndex`), wartości z `loadLibraryValues` + `valuesByTeryt` (W1.23). Wskaźnik z wartościami: nazwa, ścieżka kategorii, jednostka, wybór roku (domyślnie najnowszy) i poziomu (gdy są oba), dwa rankingi (10 najwyżej, 10 najniżej) przez `src/core/ranking` i `RankingBars` z nazwami jednostek, `DownloadCsv`, źródło „GUS, Bank Danych Lokalnych (CC BY 4.0)”. Wskaźnik bez wartości (`has` = 0 lub 404): komunikat „Ten wskaźnik jeszcze nie został pobrany” i `OrderButton`. Nieistniejące id: komunikat i odnośnik do `/biblioteka`.
- **Gotowe, gdy (`@S21`):** e2e z podmienionymi żądaniami (fixture): strona pokazuje ranking z poprawną kolejnością, zmiana roku zmienia ranking bez nowego żądania, wejście = 1 żądanie spisu + 1 żądanie wartości; wskaźnik niepobrany → komunikat i przycisk „Zamów ten wskaźnik”; nieistniejące id → komunikat; telefon 390 px bez poziomego przewijania; istniejące testy bez zmian.
- **Ty sprawdzasz:** wybrany z listy wskaźnik pokazuje rankingi; niepobrany – przycisk zamówienia.
- **Nie ruszaj:** `AtlasMap.tsx`, `src/core/ranking/` (tylko używasz).

#### W2.34 – Biblioteka: przycisk „Pobierz CSV” (S21) · fala F9
- **Po ludzku:** przycisk, który zamienia ranking wskaźnika w plik CSV otwierający się w polskim Excelu.
- **Przeczytaj najpierw:** `src/core/share/csv.ts` (`toCsv`, `shareFileName` – użyj), `src/view/share/` (jak robimy pobieranie pliku), `src/core/library/load-library.ts`.
- **Pliki:** `src/view/library/DownloadCsv.tsx` (nowy), `tests/unit/library-download-csv.test.tsx` (nowy).
- **Zadanie:** `DownloadCsv({ name, unit, level, year, rows })`, gdzie `rows` to `{ teryt, name, value }[]`; kolumny: TERYT; Nazwa; Poziom; „<nazwa> (<jednostka>)”; Rok; Źródło („GUS, Bank Danych Lokalnych (CC BY 4.0)”); plik tworzony w przeglądarce (Blob), nazwa przez `shareFileName`. Logika tworzenia treści CSV w czystej funkcji w tym samym pliku (eksport do testu).
- **Gotowe, gdy (`@S21`):** testy: treść zaczyna się od BOM, separator `;`, przecinek dziesiętny, TERYT „02” zostaje „02”, `null` → puste pole; nazwa pliku bez polskich znaków i spacji; kliknięcie tworzy plik; przycisk ≥ 44 px; axe bez błędów.
- **Ty sprawdzasz:** ✅ (widoczne po W2.33).
- **Nie ruszaj:** `src/core/share/` (tylko używasz).

#### W2.35 – Biblioteka: przycisk „Zamów ten wskaźnik” (S21) · fala F9
- **Po ludzku:** przycisk otwierający gotowe zgłoszenie na GitHubie, z jasną informacją, że otwiera zewnętrzną stronę.
- **Przeczytaj najpierw:** `src/core/library/order.ts` (po poprawce W1.27), `docs/PRODUKT.md` §4d.
- **Warunek:** W1.27 scalone i formularz `zamowienie-wskaznika.yml` w repo (R8: bez formularza i etykiety link otwiera zwykły pusty formularz).
- **Pliki:** `src/view/library/OrderButton.tsx` (nowy), `tests/unit/library-order-button.test.tsx` (nowy).
- **Zadanie:** `OrderButton({ variable })` → odnośnik `target="_blank"` `rel="noopener noreferrer"` do `orderIssueUrl`; tekst „Zamów ten wskaźnik”; pod spodem jedno zdanie: „Otworzy się zgłoszenie na GitHubie (wymaga konta). Nic nie wysyłamy bez Twojej zgody. Zgłoszenie dostanie etykietę dopiero po sprawdzeniu przez nas (osoby bez uprawnień nie mogą jej ustawić).”
- **Gotowe, gdy (`@S21`):** testy: adres zgodny z `orderIssueUrl`; `rel` i `target` ustawione; tekst informacji widoczny; ≥ 44 px; axe bez błędów.
- **Ty sprawdzasz:** ✅ (widoczne po W2.33).
- **Nie ruszaj:** `src/core/library/order.ts` (tylko używasz).

#### W2.36 – Odnośnik „Biblioteka” w nagłówku (S21) · fala F11
- **Po ludzku:** w nagłówku pojawia się przejście do biblioteki (komputer i telefon).
- **Przeczytaj najpierw:** `src/view/Header.tsx`, `docs/STYL.md` §2–§4.
- **Pliki:** `src/view/Header.tsx` (częściowy, do 15 linii), `tests/e2e/header-library.spec.ts` (nowy).
- **Zadanie:** odnośnik „Biblioteka” do `/biblioteka` obok istniejących odnośników (na telefonie w tym samym miejscu co pozostałe, bez powiększania nagłówka); aktywny stan na `/biblioteka*`.
- **Gotowe, gdy (`@S21`):** e2e: odnośnik widoczny na `/` i `/biblioteka`; kliknięcie prowadzi do `/biblioteka`; na 390 px nagłówek bez poziomego przewijania i bez zmiany wysokości; pole dotykowe ≥ 44 px; istniejące testy bez zmian (wzorce zrzutów odświeża właściciel przez workflow).
- **Ty sprawdzasz:** w nagłówku widać „Biblioteka” i działa na telefonie.
- **Nie ruszaj:** `Home.tsx`, `AtlasMap.tsx`.

#### W2.37 – Test całej ścieżki „Biblioteka GUS” (S21) · fala F12
- **Po ludzku:** jeden test przechodzi całą ścieżkę: wejście z nagłówka, szukanie, wybór wskaźnika, ranking, CSV, zamówienie.
- **Pliki:** `tests/e2e/s21-library.spec.ts` (nowy). Kodu nie zmieniasz.
- **Gotowe, gdy (`@S21`):** ścieżka (nagłówek → `/biblioteka` → szukanie → wskaźnik pobrany: ranking i CSV; wskaźnik niepobrany: przycisk zamówienia; dane z `tests/fixtures/library/`) przechodzi 3×, na komputerze i 390 px; progi §7: wejście = 1 żądanie spisu, wskaźnik = 1 żądanie wartości, zero żądań do `values/*` i `profiles/*` z głównej mapy.
- **Ty sprawdzasz:** na telefonie: wejście w Bibliotekę, wyszukanie wskaźnika, ranking, „Pobierz CSV”.

#### W2.38 – Telefon: dolny arkusz – przewijanie w granicach ekranu i przycisk zamiast przeciągania (S15) · fala F10
- **Po ludzku:** przewijana zawartość arkusza kończy się przy dolnej krawędzi ekranu (dziś przy 40% jej dół leży pod ekranem, więc przyciski w środku są poza widocznym oknem), a arkusz da się rozwinąć i zwinąć także przyciskiem, nie tylko przeciąganiem.
- **Skąd (R13, 27.10.2026, `docs/research/weryfikacja-runda3.md`):** gotowego szablonu nie ma; `react-modal-sheet` 5.6.0 ma potrzebne opcje: w `Sheet.Content` `scrollRef`, `scrollClassName`, `disableDrag`/`disableScroll` jako funkcje stanu `{ scrollPosition: 'top' | 'bottom' | 'middle', currentSnap }`, w `Sheet` `prefersReducedMotion`, `avoidKeyboard`, a `Sheet.useContext().snapTo(index)`. WCAG 2.2 (kryterium 2.5.7): każda funkcja wymagająca przeciągania musi mieć alternatywę jednym dotknięciem. Apple HIG: niemodalny arkusz, gdy tło ma zostać aktywne. Wcześniejsza próba (PR #361) dodała `flex-1 min-h-0` na `Sheet.Content` i psuła `profile-tabs`, więc pierwsza zmiana ma być w tym, **jak** przewijana część jest podpięta, a nie w samym układzie flex.
- **Przeczytaj najpierw:** `src/view/ui/BottomSheet.tsx` (używany też przez arkusz wskaźnika, W2.5), `src/view/profile/ProfileSheetMobile.tsx` (parametr `?sheet=full` zostaje), `node_modules/react-modal-sheet/dist/index.d.ts`, `docs/PRODUKT.md` §5, `docs/STYL.md` §2–§4, `tests/e2e/profile-mobile.spec.ts`, `tests/e2e/share-profile.spec.ts`, `tests/e2e/profile-tabs.spec.ts`, `tests/e2e/mobile-indicator-sheet.spec.ts`.
- **Pliki:** `src/view/ui/BottomSheet.tsx` (zmiana), `src/view/profile/ProfileSheetMobile.tsx` (częściowy, do 30 linii), `tests/e2e/bottom-sheet-scroll.spec.ts` (nowy).
- **Zadanie:** (1) przewijanie zawartości w wewnętrznym kontenerze podpiętym przez opcje biblioteki (`scrollClassName`/`scrollRef`), którego wysokość to wysokość widocznego fragmentu arkusza (przy 40% – 40% okna; przy 100% – całe okno), tak by ostatni przycisk w środku był osiągalny przewijaniem przy każdym punkcie zatrzymania; (2) przeciąganie za zawartość zmienia punkt zatrzymania tylko wtedy, gdy zawartość jest przewinięta na górę (`disableDrag` jako funkcja stanu); (3) w nagłówku arkusza przyciski „Rozwiń”/„Zwiń” (≥ 44 px, nazwy dla czytnika ekranu, wołają `snapTo`) – alternatywa dla przeciągania; (4) `prefersReducedMotion` z `matchMedia`; (5) zamknięcie (×) i Esc bez zmian; baner zgody i mapa bez zmian.
- **Gotowe, gdy (`@S15`):** e2e na 390×800 i 360×740: przy 40% po przewinięciu zawartości ostatni przycisk w środku („Pobierz i udostępnij”) mieści się w oknie; „Rozwiń” daje ≥ 90% wysokości, „Zwiń” wraca do ok. 40% (bez myszy i bez przeciągania); przewinięcie zawartości w środku nie zmienia punktu zatrzymania; istniejące testy (`profile-mobile`, `profile-tabs`, `share-profile`, `mobile-indicator-sheet`, `picker-scroll`) przechodzą bez zmian; brak poziomego przewijania; pola dotykowe ≥ 44 px; axe bez błędów; test przechodzi 3×.
- **Ty sprawdzasz:** na telefonie: wybierz miejsce, przewiń profil do końca przy małym arkuszu i dotknij „Pobierz i udostępnij”; rozwiń i zwiń arkusz przyciskami.
- **Nie ruszaj:** `ProfileOverview.tsx` (W2.25), `Header.tsx`, `AtlasMap.tsx`, istniejących testów.

#### W3.7 – Spike: ciemny podkład mapy (Positron + tryb ciemny) · poza falami, po K7 (R2)
- **Po ludzku:** sprawdzamy, czy da się mieć mapę w trybie ciemnym bez płacenia za osobne kafelki.
- **Co sprawdzono (R2, 26.10.2026):** OpenFreeMap zwraca kafelki wektorowe (TileJSON `https://tiles.openfreemap.org/planet`) z polem `name:pl` zadeklarowanym m.in. w warstwach place, poi, water_name, boundary, mountain_peak (czy każdy obiekt je ma – nie sprawdzono). Styl Positron (`https://tiles.openfreemap.org/styles/positron`) ma 55 warstw: 19 napisów, 26 linii, 9 wypełnień, 1 tło i **0 warstw rastrowych** – więc `raster-saturation`/`raster-opacity` nie mają zastosowania; wyblakłe tło robimy przez krycie warstw wypełnień i linii oraz `visibility`. Etykiety używają `name_en`/`name:latin`/`name`, nie `name:pl`.
- **Zadanie (spike, jedna fala sama):** w osobnym pliku stylu zmodyfikować Positron: ukryć drogi i napisy (poza wybranymi), przełączyć napisy miejscowości na `name:pl` z awarią do `name`, wersja ciemna z tokenów; test Playwright przez `window.__atlas`.
- **Gotowe, gdy:** decyzja zapisana w STAN (tak/nie); jeśli tak – osobne zadania.
- **Pliki:** do rozpisania po K7 (węzły: `AtlasMap.tsx`).

#### W3.8 – Kreskowanie „brak danych” na kartogramie · poza falami, po K7 (R5)
- **Po ludzku:** jednostki bez danych dostają deseń (kreski) zamiast jednolitej szarości, żeby nie myliły się z „niska wartość”.
- **Co sprawdzono (R5, 26.10.2026, typy zainstalowanego `@deck.gl/extensions` 9.4.0):** `FillStyleExtension({ proceduralPattern: true })`, `fillPatternMapping`, `getFillPattern`, `getFillPatternScale`, `getFillPatternOffset`, `getFillPatternBackgroundColor`; wzory `hatch`, `cross-hatch`, `dots`. Dziś `src` nie używa `FillStyleExtension`.
- **Decyzja D5:** kreskowanie, jasna szarość, czy oba (kreski + legenda „brak danych”).
- **Pliki (orientacyjnie):** **`choropleth.ts`**, `legend.ts`, `Legend.tsx`, test e2e przez `window.__atlas`. Wąskie gardło – osobna fala.

### Później (bez fal; Planista dopisze zadania, gdy przyjdzie kolej)
- **Próba R2** (R11, 26.10.2026): gdy zdecydujesz o koncie Cloudflare – robot-test wgrywa 1 plik, sprawdza CORS i kompresję JSON z własnej domeny i mierzy czas. `r2.dev` to adres „nieprodukcyjny” z limitem żądań – na produkcję własna domena (D6). Plan darmowy (Standard): 10 GB, 1 mln zapisów klasy A, 10 mln odczytów klasy B miesięcznie, ruch wychodzący bez opłat.
Scena wejścia „kreślenie” (W3.5 – po Twojej ocenie S16) · dwie pełne, ruchome mapy obok siebie (np. dwa wskaźniki lub dwa lata) i porównanie więcej niż dwóch miejsc · podstrony gmin pod wyszukiwarki (SEO; decyzja 25.10.2026: odłożone, `docs/research/R3-seo-wynik.md`) · mapa dla wskaźnika z biblioteki (wymaga zmiany ekranu głównego) i karty PNG z biblioteki · automatyczna kolejka zamówień wskaźników (dziś zamówienia czytamy ręcznie) · przejście biblioteki na Cloudflare R2 (decyzja i kroki: `docs/research/R6-magazyn-wynik.md`) · blady podkład OpenFreeMap przy dużym zbliżeniu (nowy element → `TRYB: WYBÓR`, wpis w ELEMENTY) · kreskowanie „brak danych” · tryb ciemny mapy (makieta 05) · statystyki wyszukiwań po zgodzie (klucz PostHog) · tryb 3D „Arkusze” · wersja angielska.

---

## 4. Plan fal (v5, 25.10.2026 – od stanu `main`)
Kolumna „Dotykają” = tabela kolizji: w jednej fali żaden plik się nie powtarza (węzły z §2 **pogrubione**). Fale prowadzi automat (`docs/AUTOMAT.md`, kolejka: `scripts/ops/automat-kolejka.json` – musi się zgadzać z tą tabelą; test to pilnuje). **Punkt kontrolny** = koniec sesji: automat aktualizuje `STAN.md`, wysyła Ci listę „Ty sprawdzasz” i jedzie dalej.
**F1–F7 zrobione** (wszystkie 33 zadania scalone, K1–K5 zaakceptowane przez właściciela 25.10.2026; uwagi do poprawek właściciel poda osobno). Zrobione wcześniej (poza kolejnością): W1.1, W1.3–W1.8, W2.10. **F8 zamknięta (26.10.2026, 6/6)**, po niej **F8b** (poprawki po researchu R7/R8: W1.25–W1.27). **Od F8: nowe fale S20 i S21** (limit Julesa: 15 zadań naraz; plan trzyma ≤ 7 w fali).

| Fala | Sesja | Zadania naraz | Dotykają | Po fali |
|---|---|---|---|---|
| **F1** | S14 · S16–S17 · S15 | W2.1 Przegląd profilu: nagłówek, duża liczba, ranking, „Kopiuj link” · W1.2 Wykrywanie telefonu w jednym miejscu · W1.12 Formaty kart i dane CSV: logika · W1.13 Mapa jako rysunek SVG: logika · W3.3 Kafelki po kolei i wyblakła reszta kraju · W0.1 Usunięcie nieużywanych pakietów · W2.13 Legenda w trybie ciemnym · W1.10 Raport „wskaźniki bez objaśnienia” | W2.1: **`ProfileOverview.tsx`**, **`ProfileSheet.tsx`**, **`ProfileSheetMobile.tsx`**, **`ProfilePortal.tsx`**, **`AtlasMap.tsx`**, `profile-overview.spec.ts` · W1.2: `useIsMobile.ts`, `use-is-mobile.test.tsx` · W1.12: `formats.ts`, `csv.ts`, `share-formats.test.ts`, `share-csv.test.ts` · W1.13: `projection.ts`, `map-shapes.ts`, `share-map-shapes.test.ts`, `geo` · W3.3: **`choropleth.ts`**, `useChoropleth.ts`, **`test-seam.ts`**, `reveal.spec.ts` · W0.1: **`package.json`**, **`pnpm-lock.yaml`**, `ELEMENTY.md` · W2.13: `legend.ts`, `Legend.tsx`, **`IndicatorPanel.tsx`**, `legend.test.ts` · W1.10: `nightly-checks.mjs`, `nightly-checks.test.ts` | <br>W3.3 o niepewnym wyniku – problem z techniką → `wymaga-decyzji` |
| **F2** | S14 · S15 · S16–S17 | W2.2 Zakładki profilu: Przegląd · W1.14 Układ kart: logika · W2.4 Telefon: układ – cienki nagłówek, mapa na cały ekran, miejsca podpięcia · W3.4 Przelewanie kolorów przy zmianie wskaźnika, roku, poziomu · W3.1 Sprzątanie zakreśleń w profilu | W2.2: **`ProfileSheet.tsx`**, `ProfileChildren.tsx`, `profile-tabs.spec.ts` · W1.14: `card.ts`, `text-fit.ts`, `share-card.test.ts` · W2.4: `Header.tsx`, **`Home.tsx`**, **`AtlasMap.tsx`**, `MobileIndicatorBar.tsx`, `Breadcrumbs.tsx`, `mobile-layout.spec.ts`, `home.spec.ts`, `picker-scroll.spec.ts` · W3.4: **`choropleth.ts`**, `color-transition.spec.ts` · W3.1: **`ProfileIndicatorRow.tsx`**, `highlight.ts`, `highlight.test.ts` |  |
| **F3** | S15 · S16–S17 · S14 | W2.6 Telefon: profil w arkuszu 40% → 100% · W2.14 Porównanie: wybór drugiego miejsca · W2.18 Pobierz i udostępnij: okno, podgląd, PNG, CSV · W2.5 Telefon: arkusz wskaźnika · W2.8 Telefon: okruszki w jednej linii z „‹” · W2.9 Telefon: dymek po pierwszym dotknięciu · W2.3 Test całej ścieżki profilu na komputerze | W2.6: **`ProfilePortal.tsx`**, **`ProfileSheetMobile.tsx`**, `profile-mobile.spec.ts` · W2.14: **`ProfileCompare.tsx`**, **`ProfileSheet.tsx`**, `compare-pick.spec.ts` · W2.18: `share`, `UiTestPage.tsx`, `share-dialog.spec.ts` · W2.5: `MobileIndicatorBar.tsx`, **`IndicatorPanel.tsx`**, `mobile-indicator-sheet.spec.ts`, `picker-scroll.spec.ts` · W2.8: `Breadcrumbs.tsx`, `BackButton.tsx`, `mobile-breadcrumbs.spec.ts` · W2.9: **`AtlasMap.tsx`**, `UnitTooltip.tsx`, `mobile-tooltip.spec.ts` · W2.3: `s14-profile.spec.ts` | **punkt kontrolny K1** (S14 – profil na komputerze) |
| **F4** | S15 · S16–S17 | W2.7 Telefon: mapa pokazuje wybrane miejsce nad arkuszem · W2.15 Porównanie: tabela obok siebie · W2.20 Przycisk w profilu: karta profilu · W2.19 Przycisk w panelu wskaźnika: karta mapy i rankingu · W2.16 Porównanie: dwa obrysy na mapie | W2.7: `sheetInset.ts`, **`ProfileSheetMobile.tsx`**, **`useMapViewState.ts`**, `profile-mobile-inset.spec.ts` · W2.15: `ProfileCompareTable.tsx`, **`ProfileCompare.tsx`**, `compare-table.spec.ts` · W2.20: **`ProfileOverview.tsx`**, `share-profile.spec.ts` · W2.19: **`IndicatorPanel.tsx`**, `useShareData.ts`, `share-map.spec.ts` · W2.16: **`choropleth.ts`**, **`AtlasMap.tsx`**, `compare-map.spec.ts` |  |
| **F5** | S18 · S16–S17 · S15 | W2.22 Porównanie: dwie mapki nad tabelą · W3.2 Płynna kamera przy wejściu w głąb · W2.11 Test całej ścieżki na telefonie · W2.12 „Na tle kraju” w profilu i panelu · W2.17 Porównanie na telefonie + test ścieżki | W2.22: `CompareMaps.tsx`, **`ProfileCompare.tsx`**, `compare-maps.spec.ts` · W3.2: **`useMapViewState.ts`**, **`AtlasMap.tsx`**, `camera.spec.ts` · W2.11: `s15-mobile.spec.ts` · W2.12: `ContextBlock.tsx`, **`ProfileIndicatorRow.tsx`**, **`IndicatorPanel.tsx`**, `context-block.spec.ts` · W2.17: `ProfileCompareTable.tsx`, `s18-compare.spec.ts` | **punkt kontrolny K2** (S15 – telefon) + **punkt kontrolny K4** (S18 – porównanie dwóch miejsc) |
| **F6** | S19 · S16–S17 | W2.21 Przycisk w porównaniu: karta porównania · W3.6 Pomiar szybkości i płynności + test ścieżki | W2.21: **`ProfileCompare.tsx`**, `share-compare.spec.ts` · W3.6: `s16-motion.spec.ts` | **punkt kontrolny K3** (S16 + S17 – ruch na mapie i „Na tle kraju”) |
| **F7** | S19 | W2.23 Test całej ścieżki „Pobierz i udostępnij” | W2.23: `s19-share.spec.ts` | **punkt kontrolny K5** (S19 – pobierz i udostępnij; zaakceptowany 25.10.2026) · koniec F1–F7 |
| **F8** | S20 · S21 | W1.15 Lista wskaźników miasto/wieś · W1.16 Części miasto i wieś z odpowiedzi BDL: logika · W1.21 Indeks biblioteki: budowanie · W1.22 Wyszukiwanie i filtry biblioteki: logika · W1.23 Wczytywanie biblioteki · W1.24 „Zamów wskaźnik”: odnośnik | W1.15: `config/parts.json`, `allowed.ts`, `parts-allowed.test.ts` · W1.16: `parts.mjs`, `parts-build.test.ts` · W1.21: `library-index.mjs`, `library-index.test.ts` · W1.22: `query.ts`, `library-query.test.ts` · W1.23: `config.ts`, `load-library.ts`, `load-library.test.ts` · W1.24: `order.ts`, `library-order.test.ts` | – |
| **F8b** ✅ zamknięta 26.10 | S21 | W1.25 Robot biblioteki: pełne nazwy n1–n5 · W1.26 Wyszukiwanie: wydajność na 64 tys. zmiennych · W1.27 „Zamów wskaźnik”: adres przez formularz | W1.25: `library.mjs`, `library-index.mjs`, `library.test.ts`, `library-index.test.ts`, `fixtures/library` · W1.26: `query.ts`, `index-contract.ts`, `library-query-perf.test.ts` · W1.27: `order.ts`, `library-order.test.ts` | **po fali:** Ty uruchamiasz „Fetch library” (pełny przegląd). **Przed F8b** (poza automatem): scalona naprawa kontraktu spisu (osobny PR) i formularz `zamowienie-wskaznika.yml` + etykieta (Claude) |
| **F9** | S20 · S21 | W1.17 Nocny robot zapisuje części · W1.18 Części w plikach na województwa · W1.19 Wczytywanie części · W1.20 Wiersze miasto/wieś: logika · W2.27 Strona `/biblioteka`: szkielet · W2.34 „Pobierz CSV” · W2.35 „Zamów ten wskaźnik” | W1.17: **`fetch-values.mjs`**, `parts-nightly.test.ts` · W1.18: `build-parts.mjs`, `parts-shards.test.ts` · W1.19: `load-parts.ts`, `load-parts.test.ts` · W1.20: `rows.ts`, `parts-rows.test.ts` · W2.27: **`Library.tsx`**, 4 szkielety w `src/view/library/`, **`App.tsx`**, `library-page.spec.ts`, `fixtures/library/index.json` · W2.34: `DownloadCsv.tsx`, `library-download-csv.test.tsx` · W2.35: `OrderButton.tsx`, `library-order-button.test.tsx` | **warunek startu:** F8b zamknięta + naprawa kontraktu scalona; po fali: **Claude dopisuje do workflow „Fetch data” krok części** (poza automatem, `.github/` jest zabronione dla Julesa) |
| **F10** | S20 · S21 | W2.24 Blok „Miasto i obszar wiejski”: komponent · W2.28 Kafelki kategorii · W2.29 Wyszukiwarka wskaźników · W2.30 Filtry · W2.31 Lista wyników · W2.33 Strona wskaźnika · W2.38 Telefon: dolny arkusz – przewijanie i przycisk | W2.24: `ProfileParts.tsx`, `profile-parts.test.tsx` · W2.28: `CategoryTiles.tsx`, `library-categories.test.tsx` · W2.29: `LibrarySearchBar.tsx`, `library-search-bar.test.tsx` · W2.30: `LibraryFilters.tsx`, `library-filters.test.tsx` · W2.31: `LibraryResults.tsx`, `library-results.test.tsx` · W2.33: **`LibraryVariable.tsx`**, **`App.tsx`**, `library-variable.spec.ts`, `fixtures/library/values-sample.json` · W2.38: **`BottomSheet.tsx`**, **`ProfileSheetMobile.tsx`**, `bottom-sheet-scroll.spec.ts` | – |
| **F11** | S20 · S21 | W2.25 Blok miasto/wieś w profilu gminy · W2.32 Biblioteka: złożenie strony i adres · W2.36 Odnośnik „Biblioteka” w nagłówku | W2.25: **`ProfileOverview.tsx`**, `profile-parts.spec.ts`, `fixtures/parts/shard-12.json` · W2.32: **`Library.tsx`**, `library-search.spec.ts` · W2.36: `Header.tsx`, `header-library.spec.ts` | – |
| **F12** | S20 · S21 | W2.26 Test całej ścieżki „Miasto i wieś” · W2.37 Test całej ścieżki „Biblioteka GUS” | W2.26: `s20-parts.spec.ts` · W2.37: `s21-library.spec.ts` | **punkt kontrolny K6** (S20 – miasto i wieś) i **K7** (S21 – biblioteka GUS) · **koniec planu** |

**Podsumowanie:** F1–F7 zrobione (33 zadania). F8, F8b i F9 zamknięte (16 zadań); F10–F12: 12 zadań (po researchu rundy 3 doszło W2.38; przed F10: zielone CI na `main`). Poza kolejką zostają: W1.9 (teksty objaśnień – Twoja akceptacja), W3.5 i „Później”; kto co robi poza falami – tabela niżej.

### Poza falami – kiedy do czego wracamy (nie zapomnieć)
| Co | Kto | Kiedy | Co z tego wychodzi |
|---|---|---|---|
| ~~W1.11 zwiad „miasto / obszar wiejski”~~ | zrobione 24.10 | wynik: `docs/research/W1.11-wynik.md` | **S20** rozpisane na F8–F12 (W1.15–W1.20, W2.24–W2.26): 14 wskaźników, bez dochodów i wydatków |
| **W1.9 teksty objaśnień wskaźników** | Claude przygotowuje listę do przeczytania, Ty akceptujesz, potem zadanie dla Julesa | po scaleniu planu F8–F12 (W2.12 działa i bez tekstów) | plik objaśnień + bloki „Na tle kraju” z treścią |
| **Podgląd paska zgód z #213 na telefonie** | Ty | przy pierwszym wolnym podglądzie | scalony lub poprawka |
| **Ocena na telefonie** | Ty | na każdym punkcie kontrolnym (K1–K5) | poprawki idą jako nowe zadania |
| **W3.5 scena wejścia „kreślenie”** | Planista rozpisze | po K3, tylko jeśli ruch W3.2/W3.3 jest płynny | zadanie w nowej fali albo zostaje w „Później” |
| **Reszta „Później”** (SEO podstron gmin, dwie pełne mapy, tryb ciemny mapy, klucz PostHog, wersja angielska…) | Planista | po K5 – wspólny przegląd i wybór kolejnej sesji | nowy plan fal |
| ~~S20 – plan zadań~~ | zrobione 25.10 (PRODUKT §4c) | wygląd: zwijany blok w profilu, bez map; zakres lat bezrobocia pokaże pierwsze pobranie | W1.15–W1.20, W2.24–W2.26 |
| ~~S21 – plan zadań~~ | zrobione 25.10 (PRODUKT §4d) | v1 bez mapy dla wskaźnika z biblioteki | W1.21–W1.24, W2.27–W2.37 (+ W2.38 po researchu rundy 3) |
| ~~Workflow „Fetch data”: krok części miasto/wieś~~ | Claude (pliki `.github/` są zabronione dla Julesa) | ✅ PR #380 (27.10, po F9); zostaje jedno ręczne uruchomienie | `build-parts.mjs` po `build-profiles.mjs`; `git add data/parts/ public/data/parts/`; potem jedno ręczne uruchomienie „Fetch data” |
| **Workflow „Fetch library”: krok indeksu** | Claude | po scaleniu W1.21 (po F8) | `node scripts/data/library-index.mjs` przed zapisem na gałąź `data/library` |
| **Etykieta `zamowienie-wskaznika`** | Claude | przed W2.35 | etykieta w repo |
| **Magazyn biblioteki: Cloudflare R2** | Ty zakładasz konto i klucze, Claude dopisuje synchronizację | gdy gałąź `data/library` > ~1 GB albo raw.githubusercontent ogranicza ruch (`docs/research/R6-magazyn-wynik.md`) | zmienna `VITE_LIBRARY_BASE` na Vercel; wpis w `ELEMENTY.md` |
| **Pismo do GUS o zbiorczy eksport BDL** | Ty wysyłasz (formularz GUS), tekst gotowy | kiedy chcesz | `docs/research/biblioteka-bulk-wynik.md` |
| ~~**Krok `index.json` w workflow „Fetch library”**~~ zrobione 26.10 (PR #359; sprawdzone na prawdziwym katalogu: 63 960 zmiennych, 7,9 MB, 593 KB gzip, ładuje się schematem i wyszukiwarką) | Claude | – | po następnym przebiegu robota na gałęzi `data/library` będzie `index.json` |
| ~~**Naprawa kontraktu spisu biblioteki**~~ zrobione 26.10 (#350: `index-contract.ts`, test robot → szukanie) | Claude | – | spis z robota (`categories`, `variables`) czyta się w `query.ts`; test robot → szukanie |
| ~~**Formularz `.github/ISSUE_TEMPLATE/zamowienie-wskaznika.yml` + etykieta**~~ zrobione 26.10 (#351; etykieta `zamowienie-wskaznika` jest w repo) | Claude | – | link „Zamów” otwiera formularz z polami; etykieta w repo |
| **Test na drugim koncie GitHub** | Ty (5 min) | przed W2.35 | czy zwykła osoba z linkiem z `template=` + polami widzi wypełniony formularz i czy etykieta się ustawia (R8 tego nie rozstrzygnęło) |
| **Ponowny przegląd katalogu BDL** („Fetch library”, po W1.25) – uruchomiony 26.10 ok. 16:23 UTC, sprawdzić wynik | Ty | po F8b | pełne tytuły zmiennych (n1–n5) w spisie |
| **Zrzuty ekranu BDL (opcjonalnie)** | Ty | gdy będziesz chciał porównać listę z naszą | R7.1: jak bdl.stat.gov.pl pokazuje zmienną |
| **Konto Cloudflare + zasobnik R2 + klucz + domena** (R11) | Ty zakładasz, Claude dopisuje „próbę R2” | gdy gałąź `data/library` > ~1 GB (D6) | `r2.dev` nie na produkcję: potrzebna własna domena |
| **W0.2 – `trustPolicy`** (R10) | Claude | po decyzji D1 | `pnpm-workspace.yaml` |
| **Zlecenia drugiej rundy research** | Ty wklejasz Haiku | R9.5 przed W1.9, reszta po K7 | `docs/research/haiku-zlecenia-runda2.md` |
| **Ruleset na `main`** | Ty (GitHub → Settings → Rules, 2 min: wymagane `testy` i `bezpieczenstwo`) | jak najszybciej | druga blokada niezależna od skryptów |
| **Uwagi z oglądu K1–K5** | Ty podajesz listę, Claude rozbija na małe zadania | kiedy będziesz gotowy | nowa fala poprawek (F13+) |
| **Naprawiacz** (mocniejszy model raz dziennie) | Ty tworzysz | po F2, jeśli pojawią się zadania `wymaga-naprawy` | prompt w `docs/AUTOMAT.md` §6 |

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
| `fetch-library.yml` | co 12 h (cron `40 4,16 * * *`) i ręcznie (pole „budżet”) | robot „Biblioteka GUS”: katalog i wartości kolejnych zmiennych BDL na gałąź `data/library` (nie main); budżet 2500 zapytań na przebieg, wspólna kolejka z nocnym pobieraniem; pierwszy przebieg 25.10.2026 |
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

// data/parts/<indicatorId>.json – (S20, pośredni, poza public/) miasto i obszar wiejski gmin miejsko-wiejskich, jeden wskaźnik
// (z config/parts.json; zapisuje nocny robot; scripts/data/parts.mjs). Bez znaczników czasu.
type PartsValues = { indicatorId: string; years: number[];
  values: Record<string /* teryt części: 7 cyfr, końcówka 4 = miasto, 5 = obszar wiejski; gmina-matka ma końcówkę 3 */, (number | null)[]> };

// public/data/parts/<teryt województwa>.json – (S20) części gmin m-w jednego województwa, 14 wskaźników
// (scripts/data/build-parts.mjs z data/parts/*.json). Bez znaczników czasu.
type PartsShard = { voivodeship: string; years: Record<string /* indicatorId */, number[]>;
  values: Record<string /* teryt części */, Record<string /* indicatorId */, (number | null)[]>> };

// library/index.json – (S21, gałąź data/library, adres z src/core/library/config.ts) spis biblioteki GUS
// (scripts/data/library-index.mjs z catalog.json + state.json). Zmienne tylko z poziomem 5 lub 6.
// Schemat zod: src/core/library/index-contract.ts (LibraryIndexSchema); adapter `prepare` zamienia go na kształt zapytań (query.ts).
type LibraryIndex = { version: 1;
  categories: Record<string /* subjectId */, { n: string; p: string | null }>;
  units: string[]; // słownik jednostek miary
  variables: { id: number; s?: string /* subjectId */; n: string /* człony n1–n5 */; l: 5 | 6; u: number /* indeks w units */; has: 0 | 1 }[] };
// Tytuł wskaźnika w interfejsie = „<nazwa działu>: <człony n1–n5>” (titleOf).

// library/values/<id>.json – (S21, robot scripts/data/library.mjs; już istnieje) wartości jednej zmiennej
// klucz = 12-znakowy identyfikator jednostki BDL (nie TERYT; mapowanie przez `bdlId` z units.json), wartości po latach z `y`
type LibraryValues = { v: number; l5?: { y: string[]; d: Record<string, (number | null)[]> }; l6?: { y: string[]; d: Record<string, (number | null)[]> } };

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
Konta użytkowników · wołanie API GUS z przeglądarki · liczby wpisane ręcznie albo przez AI · śledzenie osób (IP, fingerprint) · Google Maps jako mapa główna · pobieranie całego BDL naraz lub z przeglądarki (robot „Biblioteka GUS” pobiera stopniowo, z budżetem zapytań – S21) · generator serii slajdów pod konta Faktografii w tym repo (osobne, prywatne repo; pojedyncze karty dla użytkowników – tak, S19).


### 4a. Kto czym szuka i sprawdza (narzędzia – żeby planować research i podzespoły)
| Do czego | Narzędzie | Ograniczenia |
|---|---|---|
| Szeroki research (bazy, pakiety, zasoby, wzorce, licencje) | Gemini Deep Research (`TRYB: RESEARCH`, workflow §8.18) albo Claude z narzędziami WWW | raport to wsparcie; **zawsze** weryfikacja (§8.19); raport z sesji bez dostępu do sieci (błędy rozwiązywania nazw) **odrzucamy w całości** (`docs/research/weryfikacja-runda3.md`) |
| Wąskie fakty: wersje, licencje, ustawienia, wzorce z innych serwisów | Claude Haiku – zlecenia `docs/research/haiku-zlecenia.md` (jedno pytanie, fakty z linkami) | zbiera, nie decyduje; zawsze weryfikacja (§8.19) przez mocniejszy model |
| Weryfikacja raportu | Claude (czat/sesja repo): liczby sprawdza na nagraniach w `tests/fixtures`, linki przez WebSearch | strony GUS (bdl.stat.gov.pl) i część stron spoza listy nie otwierają się z sesji; oficjalne PDF z api.stat.gov.pl – tak |
| Pytania do prawdziwego API GUS | robot w GitHub Actions (`bdl-record.yml`, `fetch-data.yml`; klucz w Secrets) | z sesji Claude API GUS nie jest dostępne; wynik wraca jako PR z nagraniami |
| Pakiet/usługa (poziomy B–D workflow §3b) | `TRYB: WYBÓR` (Gem Research); sprawdzenie nazwy w rejestrze npm | wpis w `docs/ELEMENTY.md` w tym samym PR |
| Kod, testy, PR | Jules (etykieta `jules`), kontrola `scripts/ops/check-pr.mjs` | tylko pliki z listy zadania |
| Ocena wyglądu | Ty na podglądzie Vercel (telefon); Gemini Argon na zrzutach | WebGL nie jest sprawdzane pikselami |

**Kolejka researchu i podzespołów (kto, kiedy):**
| # | Temat | Tryb | Kiedy |
|---|---|---|---|
| R1 | Miasto/wieś gmin m-w | zrobione (wynik wyżej) | – |
| R2 | Blady podkład mapy przy dużym zbliżeniu (OpenFreeMap) | **zweryfikowane 26.10**: Positron ma 0 warstw rastrowych (blado = krycie wypełnień i linii); `name:pl` zadeklarowane w kafelkach → W3.7; **R2.4 (27.10):** dokumentacja nie rozstrzyga, kiedy `name:pl` jest wypełniane – sprawdzić wprost na kafelkach w spike | po K7 |
| R3 | Podstrony gmin pod wyszukiwarki (SEO) | zrobione 25.10: raport zweryfikowany, decyzja **odłożone** (`docs/research/R3-seo-wynik.md`) | wrócić po K7, jeśli chcesz ruchu z wyszukiwarki |
| R4 | Dwie pełne mapy obok siebie (dwa wskaźniki/lata) | `TRYB: DECYZJA` (koszt wydajności na telefonie) | po K5 |
| R5 | Tryb ciemny mapy, kreskowanie „brak danych” | **zweryfikowane 26.10** (typy `@deck.gl/extensions` 9.4.0): kreskowanie możliwe → W3.8 (D5); tryb ciemny: **R5.4 (27.10)**: OpenFreeMap wymienia styl „Dark”, ta sama baza kafelków co Positron – NIEZWERYFIKOWANE (sprawdzić JSON stylu w spike W3.7); `setPaintProperty` – oficjalny przykład MapLibre | po K7 |
| R6 | Cała biblioteka GUS: magazyn danych, katalog, robot z budżetem limitów (`docs/research/biblioteka-gus.md`) | zrobione 25.10: magazyn **Cloudflare R2** docelowo, do tego czasu gałąź `data/library` (`docs/research/R6-magazyn-wynik.md`); zbiorczy eksport: pismo do GUS (`docs/research/biblioteka-bulk-wynik.md`) | strona biblioteki: S21 (F8–F12); robot uruchomiony 25.10 |
| R7 | Jak pokazać wskaźnik BDL, którego nazwa to same wymiary (lista, podpowiedzi, nagłówek) | **zweryfikowane 26.10** (częściowo): API potwierdzone na żywo; wniosek: lista płaska „dział: wymiary” po naprawie robota (W1.25) | **przed F10** – wymaga F8b |
| R8 | „Zamów ten wskaźnik” przez formularz zgłoszeń GitHuba (pola z linku, etykieta) | **zweryfikowane 26.10** (dokumentacja GitHuba; zachowanie etykiety dla obcych – test na drugim koncie): `template=` + `id`, bez `labels=` → W1.27 | **przed F9** (W2.35) |
| R9 | Definicje wskaźników z GUS: źródło, API, licencja tekstów | **zweryfikowane 26.10** (5 haseł na żywo): własne słowa + `definitionUrl`; **R9.5 (27.10): hasła GUS dla 11 z 20 wskaźników** (jest 6 nowych: 3958, 3925, 693, 49, 1233, 1125), 9 bez hasła – źródło tekstów: R9.6 (`weryfikacja-runda3.md`) | przed W1.9 |
| R10 | Przejście na pnpm 11 (`trustPolicy`, akcja CI, 11 czy 12) | **zweryfikowane 26.10**: `trustPolicy` działa na pnpm 10.30.3; akcja `@v6` już jest; 11 czy 12 – D1 | W0.2 po D1 |
| R11 | Biblioteka na Cloudflare R2: `aws s3 sync`, CORS, cennik | **zweryfikowane 26.10** (cennik: tak; CORS i kompresja: wymaga konta → „próba R2”); **R11.4 (27.10):** CORS na własnej domenie – polityka w zasobniku + wyczyszczenie cache; kompresja JSON niepotwierdzona; `aws s3 sync` w nowszym AWS CLI może wymagać `request_checksum_calculation = when_required` | przed przejściem z gałęzi `data/library` |
| R12 | Podział kolorów mapy: kwantyle czy naturalne przerwy (`simple-statistics`) | **zweryfikowane 26.10** (pakiet: 7.12.1, ISC, bez zależności); bez zmian w kodzie, spike w „Później” (PR #348) | opcjonalnie, po K7 |
| R13 | Gotowa formatka strony mobilnej (arkusz, układ, wzorce listy z filtrami) | **zweryfikowane 27.10** (częściowo): gotowego szablonu dla React 19 + Tailwind 4 + MapLibre nie ma; zostajemy przy `react-modal-sheet` 5.6.0 (MIT) i używamy jego opcji → **W2.38** | F10 |
| R14 | Gotowe animacje i zasady ruchu | **zweryfikowane 27.10** (częściowo, źródła wtórne oznaczone): brak gotowego zasobu z potwierdzoną licencją; deck.gl `transitions` i MapLibre `essential` opisane, opóźnienia między jednostkami brak; wersje i licencje bibliotek sprawdzone w npm; bez zmian w kodzie | opcjonalnie R14.4 przed W3.5 |
| R15 | Audyt brakujących elementów, dostępność map, funkcje telefonu | **zweryfikowane 27.10** (częściowo): lista kandydatów do decyzji w `weryfikacja-runda3.md`, nic nie dodano do planu; alternatywa dla przeciągania → W2.38 | po K7 – przegląd „Później” |

**Zlecenia dla Haiku:** `docs/research/haiku-zlecenia.md` – jedno wąskie pytanie na zlecenie, wspólny nagłówek (fakty z linkami, bez rekomendacji). Decyzję podejmuje Opus/Sonnet i Ty po `TRYB: WERYFIKACJA` (WORKFLOW §8.19).
