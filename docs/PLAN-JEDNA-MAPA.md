# Plan „Jedna mapa” – tło strony startowej staje się mapą (21.11.2026)
Polecenie właściciela: „żeby to była jedna mapa, nie dwie różne; na tło nałożona animacja, a po otwarciu zmienia się w zwykłą mapę”. Właściciel wybrał wariant A: **jedna mapa pod stronami `/` i `/mapa`**. Plan zastępuje okładkę z PR #603 (`src/view/start/mapCover.ts`).

## 1. Cel (co ma widzieć właściciel)
- `/`: w tle Polska w tym samym miejscu, wielkości i kolorach, w jakich za chwilę pokaże ją mapa. Obrys nadal się animuje, a cztery wskaźniki zmieniają się co 5 s.
- „Otwórz mapę” albo stuknięcie w Polskę w tle: tekst startu płynnie znika, ta sama Polska lekko się przybliża do kadru `/mapa`, a panele mapy płynnie się pojawiają. Bez pustego ekranu, bez drugiej Polski i bez przeładowania.
- Wstecz z `/mapa` na `/`: ten sam ruch w drugą stronę.
- Na mapie od razu widać wskaźnik, który był w tle w chwili kliknięcia (np. bezrobocie). Nie przeskakuje na gęstość.
- „Ogranicz ruch” (`prefers-reduced-motion`): zamiana natychmiast, bez przybliżenia.

## 2. Jak to działa (architektura)
```
App
└─ <Route element={<MapStage/>}>            ← NOWE: wspólny układ dla `/` i `/mapa`
     ├─ warstwa mapy (fixed, pod treścią)    ← AtlasMap montowany RAZ, nie znika przy zmianie adresu
     │    ├─ tryb "poster" na `/`: bez paneli, bez dotyku, dane z start.json, nie pisze adresu
     │    └─ tryb "live" na `/mapa`: pełna mapa jak dziś
     ├─ plakat SVG (obrys w tym samym odwzorowaniu i kadrze co mapa; widać go, zanim WebGL jest gotowy)
     └─ <Outlet/>: treść `/` (StartPage) albo nakładki `/mapa` (Header, IntroOverlay)
```
- **Jedno odwzorowanie.** Obrys startowy jest liczony w Web Mercator, w granicach `countryBounds`. Kadr dla obrysu i dla kamery mapy liczy ta sama funkcja z `src/core/map/fit.ts`, więc plakat i mapa pokrywają się co do piksela.
- **Jedne kolory.** Klasy kolorów `start.json` (5 klas, `--seq-1…5`) i klasy mapy na poziomie województw dla czterech wskaźników startu pochodzą z tego samego podziału (`src/core`).
- **Plakat → mapa.** Gdy mapa daje sygnał „gotowa” (zdarzenie MapLibre `idle` po narysowaniu warstwy kolorów), wypełnienia plakatu robią się przezroczyste. Kolory daje wtedy WebGL, a SVG zostaje tylko jako animowane kreski obrysu na wierzchu. Podmiany nie widać, bo oba obrazy są takie same.
- **Przejście.** Klik zmienia adres (`navigate('/mapa?i=<wskaźnik z tła>')`). MapStage widzi zmianę trasy i robi trzy rzeczy naraz:
  - treść startu: `opacity → 0` (`--motion-slow`);
  - kamera: `easeTo` z kadru plakatu do kadru `/mapa` (z miejscem na panel wskaźnika i dolny pasek);
  - panele mapy: `opacity 0 → 1`, a dotyk włącza się po zakończeniu ruchu.

## 3. Decyzje (stan: właściciel zgodził się na D1–D4, 21.11.2026)
| # | Decyzja | Rekomendacja | Co zmienia |
|---|---|---|---|
| D1 | Czy `/` może pobierać dane mapy (granice `admin.topo.json` 1,3 MB i lista `units.json` 456 KB)? Dziś PRODUKT §7 i testy B07 oraz PATH-1a tego zabraniają. | **Tak, ale dopiero po wyświetleniu strony startowej i w wolnej chwili.** Przy oszczędzaniu danych (Save-Data, sieć 2G) dopiero po kliknięciu, a do tego czasu animuje się sam plakat. Wartości wskaźników na `/` nadal z `start.json` (0 plików `values/`). | PRODUKT §3.1 i §7, testy `b07-start-budget`, `path-s1a-ekran-startowy` (warunek „zero pobrań”: „zero przed pierwszą klatką tła” + nowy test oszczędzania danych) |
| D2 | Zgoda na zmianę plików ekranu i układu | Tak: `src/App.tsx`, `src/view/Home.tsx`, `src/view/map/AtlasMap.tsx`, `src/view/map/hooks/useMapViewState.ts`, `useMainView.ts`, `useMapSelection.ts` | AGENTS.md: pliki ekranu i zmiana architektury |
| D3 | Zgoda na zmianę generatora obrysu (`scripts/data`) | Tak: obrys w Web Mercator z zapisanymi granicami (`bbox`) | `public/geo/start-outline.json` (budżet ≤ 25 KB zostaje) |
| D4 | Zmiana istniejących testów przejścia | Tak: `c02-enter-map.spec.ts` (sprawdza kopię obrysu na okładce, której już nie będzie) zastępuje test „jedna mapa” | Test C02 |

Bez D1 wariant A działa tylko w połowie. Mapa ładowałaby się dopiero po kliknięciu, więc na wolnym telefonie przejście trwałoby tyle, ile pobranie 1,8 MB. Plakat wciąż ukryje podmianę, ale samo czekanie zostanie.

## 4. Kroki (każdy = jeden PR, scalany od razu, żeby był podgląd)
### M1 – Wspólny kadr i kolory (bez zmiany układu)
- **Zmieniaj:**
  - `scripts/data/*start-outline*` i `public/geo/start-outline.json`: obrys w Mercatorze z polem `bbox`;
  - `src/core/start/outline.ts`;
  - nowy plik `src/core/start/poster-frame.ts`: prostokąt obrysu dla danego ekranu, liczony przez `fitViewState`;
  - `src/view/start/StartBackground.tsx`;
  - `src/view/start/mapCover.ts`: okładka od razu w pełni widoczna, bez przenikania na wejściu;
  - generator `start.json` i `src/core/start/start-data.ts`, jeśli klasy różnią się od mapy.
- **Gotowe, gdy:**
  - dla 390×844 i 1440×900 prostokąt Polski na plakacie różni się od kadru mapy (`fitViewState(countryBounds)`) o ≤ 2 px (test jednostkowy);
  - kolor każdego województwa dla czterech wskaźników startu jest taki sam w `start.json` i w klasach mapy (test jednostkowy);
  - okładka ma `opacity: 1` w pierwszej klatce po kliknięciu (e2e).
- **Efekt na podglądzie:** już przy obecnej okładce znika druga Polska, bo kopia leży dokładnie tam, gdzie wyrysuje się mapa.

### M2 – Prawdziwy sygnał „mapa gotowa”
- **Zmieniaj:**
  - `src/view/map/AtlasMap.tsx`: po `idle` z narysowaną warstwą kolorów ustawia `__atlas.ready = true` (tryb testowy) i wysyła zdarzenie `atlas:ready`;
  - `src/core/map/test-seam.ts`;
  - `src/view/start/mapCover.ts`: czeka na `atlas:ready` zamiast „płótno + 500 ms”; limit 6 s zostaje.
- **Gotowe, gdy:**
  - `atlas:ready` przychodzi dopiero po narysowaniu kolorów (e2e: piksel środka mapy ≠ kolor tła, odczytany przez `__atlas`);
  - okładka znika najwcześniej po `atlas:ready`.

### M3 – Jedna mapa pod stronami (MapStage)
- **Zmieniaj:**
  - `src/App.tsx`: trasa-układ dla `/` i `/mapa`;
  - nowy plik `src/view/map/MapStage.tsx`;
  - `src/view/Home.tsx`: tylko nakładki, bez własnej mapy;
  - `src/view/start/StartPage.tsx`: tło przechodzi do MapStage;
  - `src/view/map/AtlasMap.tsx` i hooki: prop `mode: 'poster' | 'live'`. W trybie `poster` nie ma paneli, dotyku, zapisu adresu ani nasłuchu `popstate`, a kadr jest kadrem plakatu;
  - nowy plik `src/core/start/poster-values.ts`: wartości z `start.json` w formacie wartości mapy, dla województw;
  - `src/view/start/preloadMap.ts`: ładowanie danych według D1.
- **Gotowe, gdy:**
  - na `/` jest dokładnie jedno płótno mapy, a mapa ma `aria-hidden` i nie łapie dotyku: przewijanie strony działa na telefonie;
  - po przejściu `/` → `/mapa` to jest to samo płótno (`__atlas.instanceId` się nie zmienia), bez ponownego pobrania `admin.topo.json` i `units.json`;
  - wejście wprost na `/mapa` działa jak dziś (progi §7 „Wejście na `/mapa`”);
  - progi `/` zgodne z decyzją D1 (testy B07 i PATH-1a po zmianie);
  - na `/` adres się nie zmienia (`replaceState` nie jest wołane).

### M4 – Przejście
- **Zmieniaj:**
  - `src/view/map/MapStage.tsx`;
  - nowy plik `src/core/map/stage-transition.ts`: plan ruchu, czysta logika z kadrem start → mapa, czasami z tokenów i wersją bez ruchu;
  - `src/view/start/StartPage.tsx`;
  - usunięcie `src/view/start/mapCover.ts` (zgoda w tym planie).
- **Gotowe, gdy:**
  - klik: adres `/mapa?i=<wskaźnik z tła>` w < 300 ms, kamera porusza się płynnie (≥ 10 pośrednich kadrów w `__atlas`, zoom rośnie monotonicznie), a panele pojawiają się po ruchu;
  - w żadnej klatce przejścia nie widać pustego tła: piksel środka Polski nigdy nie ma koloru `--kalka`;
  - Wstecz odwraca ruch, a `/` wygląda jak przed kliknięciem;
  - stuknięcie w Polskę otwiera mapę, a przeciągnięcie (> 10 px) przewija stronę i niczego nie otwiera;
  - `prefers-reduced-motion`: zmiana bez ruchu kamery, w ≤ 1 klatce;
  - dotyk lub mysz w trakcie ruchu kamery (~1 s) przerywa animację i oddaje sterowanie użytkownikowi (dotyk nie czeka na koniec ruchu).

### M4b – Reakcja animacji startu na dotyk i mysz
- Warstwa strony nad mapą (nie samo płótno) nasłuchuje zdarzeń wskaźnika (`touch-action: pan-y`, pasywnie), więc przewijanie na telefonie działa.
- Efekty: fala od punktu dotyku; podświetlenie województwa pod palcem lub kursorem (granice z obrysu startowego, który już ma osobne ścieżki województw); stuknięcie otwiera mapę przybliżoną do tego województwa; przeciągnięcie > 10 px przewija stronę.
- Lekko: maks. kilka efektów naraz; wyłączone przy `prefers-reduced-motion`.
- **Gotowe, gdy:** test e2e dotyku na 390×844 (stuknięcie otwiera mapę na województwie, przeciągnięcie przewija), test myszy na 1440×900, brak efektów przy reduced motion.

### M5 – Strażnicy i sprzątanie
- Nowy test ścieżki `tests/e2e/path-s1b-jedna-mapa.spec.ts` (`@PATH-1b`) obejmuje cały scenariusz z §1 na 390×844 i 1440×900.
- Pomiar p95 klatki tła na `/` z mapą pod spodem (orientacyjnie ≤ 33 ms).
- Aktualizacja `docs/PRODUKT.md` §3.1 i §7 oraz `docs/ARCHITEKTURA.md` (MapStage). Po scaleniu właściciel uruchamia „Update snapshots”.

## 5. Ryzyka i jak je łagodzimy
- **iPhone: pamięć i bateria (WebGL na stronie startowej).** Mapa w trybie `poster` nie rysuje się w pętli: rysuje jedną klatkę na zmianę wskaźnika, a animację kresek robi lekki SVG. Gdy karta jest ukryta albo mapa poza ekranem, rysowanie stoi.
- **Safari i przewijanie nad płótnem.** Płótno jest `position: fixed` z `pointer-events: none`. Gdyby przewijanie zacinało się na telefonie właściciela, plakat SVG zostaje jedynym tłem do kliknięcia, a mapa montuje się pod spodem dopiero przy kliknięciu. Wtedy wciąż jest to ta sama mapa po otwarciu.
- **Brak WebGL lub błąd danych.** Plakat zostaje tłem, a klik działa jak zwykły link do `/mapa`.
- **Stare linki `/?u=…`.** Przekierowanie bez zmian (`legacyRedirect`).
- **Okno zgody (ConsentBar) i IntroOverlay.** Zostają nad MapStage, kolejność warstw sprawdza test `@PATH-1b`.

## 6. Co sprawdzasz po każdym kroku (po ludzku)
| Krok | Gdzie | Co ma być widać |
|---|---|---|
| M1 | `/` → „Otwórz mapę” | Jedna Polska, w tym samym miejscu przed i po. Kolory tła i mapy zgodne. |
| M2 | `/` → „Otwórz mapę” | Okładka znika dopiero, gdy mapa jest w kolorach. Nie ma przeskoku kolorów po wejściu. |
| M3 | `/` na telefonie; potem `/mapa` | Tło startu wygląda jak dziś, strona przewija się normalnie. Wejście na mapę bez ładowania. |
| M4 | `/` → klik w przycisk albo w Polskę; potem Wstecz | Lekkie przybliżenie tej samej mapy, panele pojawiają się płynnie. Wstecz to samo w drugą stronę. |
| M5 | całość, jasny i ciemny motyw | Jak po M4. W PR wyniki pomiarów. |
