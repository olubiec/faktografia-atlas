# Plan Q: uwagi właściciela z 17.11.2026 – pełna lista zadań

Wersja 2 (17.11.2026). Źródło: dwie wiadomości właściciela z 17.11 + odpowiedzi na pytania doprecyzowujące.
Plik w `tasks/poczekalnia/` – pętla go ignoruje. **Prompty wszystkich zadań są napisane** w `tasks/poczekalnia/Q/` (`W<fala>-QC<cel><nn>-*.md`, wzór: `tasks/SZABLON.md`; opis: `Q/README.md`). Start fali = skopiowanie jej plików do `tasks/` + blok z `Q/waves-Q.fragment.yaml` do `waves.yaml` + push na `main`.
Zastępuje zadania: **P1-A** (Rankingi), **P1-B** (Porównaj), **P3-C** (Biblioteka) – przy puszczaniu fal pomijamy je.

Jak czytać: **10 celów (C1–C10)**, każdy rozbity na najmniejsze zadania (1 zachowanie, 1–3 pliki, ok. 50–150 linii, własny test).
Każde zadanie ma: co zrobić · `Zmieniaj:` · **Gotowe, gdy** (warunek = test). Zadania wewnątrz celu idą po kolei, chyba że przy zadaniu jest „∥” (można równolegle).
Fale i kolejność: §4. Punkty, w których Ty oglądasz podgląd: §5.

---

## 1. Diagnoza (skąd uwagi – stan `main` 17.11)

| Uwaga | Przyczyna w kodzie |
|---|---|
| Rankingi nie działają | `src/view/pages/Rankings.tsx` to atrapa: puste listy wyboru, wskaźnik na sztywno, mediana wpisana „50”, kody TERYT zamiast nazw, martwe „Szukaj”, pusty prostokąt „Mapa”. |
| Porównaj: nie da się wybrać ani wyszukać | `src/view/pages/ComparePage.tsx` ma tylko 6 gotowych par; brak wyszukiwarki; nagłówki z kodami. |
| Czerwone obrysy nie znikają po oddaleniu | `selected-outline-layer` (`layers/choropleth.ts`) zależy tylko od adresu, nie od przybliżenia. |
| Brak płynnego przybliżania i animacji | Ruch kamery działa tylko przy wyborze miejsca; mapa sterowana (`{...currentViewState}` + `onMove`) najpewniej gasi płynne przybliżanie kółkiem/palcami. Do potwierdzenia pomiarem (C4-1). |
| Eksport bez edycji | `ShareDialog.tsx`: 4 stałe karty, jedna naraz, bez numeracji, bez dodawania/usuwania. |
| Biblioteka: niepobrane zaśmiecają, pobranych nie da się użyć | Lista pokazuje 63 960 zmiennych, wartości ma ok. 101; mapa, rankingi i eksport znają tylko 20 wskaźników z `config/indicators.json`. Most już częściowo jest: `valuesByTeryt()` w `src/core/library/load-library.ts` zamienia dane biblioteki na format mapy. |
| Nie każda strona do udostępnienia | Link + „Pobierz i udostępnij” tylko na mapie, w profilu i w zakładce porównania. |

## 2. Decyzje (domyślne – zmień, jeśli chcesz inaczej)

- **D1 Moje wskaźniki.** Każdy użytkownik ma własną listę wskaźników. Na start lista podstawowa, ustawiona na sztywno w jednej stałej: Ludność ogółem · Gęstość zaludnienia · Przyrost naturalny · Saldo migracji · Udział ludności 65+ · Stopa bezrobocia · Przeciętne wynagrodzenie. Każdy da się usunąć (×), dowolny pobrany wskaźnik (z 20 głównych i z biblioteki) da się dodać (+: wyszukiwarka albo kategorie). „Przywróć podstawowe” wraca do startu. Lista zapisuje się w pamięci przeglądarki (bez kont – zgodnie z PRODUKT); w Prywatności dopisujemy jedno zdanie.
- **D2 Gdzie działa lista „Moje wskaźniki”:** panel mapy (na górze wyboru wskaźnika), arkusz wskaźnika na telefonie, Biblioteka (sekcja na górze + „Dodaj do moich” przy każdym wskaźniku), tabela w Porównaj, domyślne dane w eksporcie, wybór w Rankingach.
- **D3 Pobrane wskaźniki biblioteki działają jak główne:** na mapie, w rankingu, w porównaniu (tabela) i w eksporcie. Nie trafiają do profilu miejsca (profil = jeden plik na województwo, §7; dla wskaźników z biblioteki – „Później”).
- **D4 Mały spis pobranych.** Strona główna nie może ładować pełnego spisu biblioteki (7,9 MB). Robot zapisuje mały plik `available.json` (tylko pobrane: id, nazwa, jednostka, dział, poziomy, lata). Wymaga zmiany w `scripts/data` i workflow „Fetch library” – robi Claude za Twoją zgodą (to zadanie C6-1).
- **D5 Biblioteka pokazuje tylko pobrane.** Niepobrane ukryte; nad listą „<m> wskaźników z danymi (z <n> w spisie GUS). Kolejne dane dochodzą co noc.” + przycisk „Zamów dane na temat…”.
- **D6 Obrysy:** czerwony obrys gaśnie (300 ms), gdy jednostka zajmuje mniej niż ok. 2% szerokości mapy; po przybliżeniu wraca; wybór zostaje w adresie. Bez ruchu przy `prefers-reduced-motion`.
- **D7 Eksport = zestaw stron** (rozszerzenie PRODUKT §4b „Zestaw”, dla każdego użytkownika; zakaz prywatnego generatora slajdów Faktografii zostaje). Strony numerowane „n/N”, × usuwa, + dodaje rodzaj strony albo dzieli stronę, każda strona ma „Dane na tej stronie” z × i +.
- **D8 Dodanie wskaźnika w eksporcie = jedno pobranie** pliku wartości (zmiana reguły §4b „zero nowych pobrań”).
- **D9 „Pobierz wszystkie” = kolejne pliki PNG**, bez ZIP (ZIP = nowy pakiet, osobna decyzja).
- **D10 Każda strona z danymi** ma stan w adresie i pasek „Kopiuj link · Pobierz i udostępnij”.

---

## 3. Cele i najmniejsze zadania

### C0 Przygotowanie (Claude, przed pierwszą falą)
- [ ] **C0-1** Aktualizacja `docs/PRODUKT.md`: §4b (zestaw stron, D7–D9), §4d (D3–D5), §5a (D6), nowe §4e „Rankingi”, §4f „Moje wskaźniki” (D1–D2), §7 (próg: `available.json` na wejściu, 1 żądanie na dodany wskaźnik).
- [ ] **C0-2** Usunięcie P1-A, P1-B, P3-C z `PLAN-PUBLIKACJA.md`; dopisek o planie Q.
- [ ] **C0-3** Pliki zadań fali Q1 w `tasks/` wg `SZABLON.md` (kolejne fale – po scaleniu poprzedniej).
- [ ] **C0-4** Nagrane dane testowe: `tests/fixtures/library/available.json` (5 pobranych wskaźników, w tym 1 tylko powiatowy), zgodne z prawdziwym formatem z gałęzi `data/library`.

### C1 Rankingi działają (`/rankingi`)
- [ ] **C1-1** Adres ↔ stan rankingu. `Zmieniaj: src/core/ranking/rankings-url.ts, tests/unit/rankings-url.test.ts`. Odczyt/zapis `?i=&l=&y=&w=&q=`, wartości domyślne, nieznane parametry ignorowane. **Gotowe, gdy:** test „adres → stan → adres” daje to samo; nieznany wskaźnik → domyślny.
- [ ] **C1-2** ∥ Podsumowanie zdaniami. `Zmieniaj: src/core/ranking/rankings-summary.ts, tests/unit/rankings-summary.test.ts`. „Najwyżej: Warszawa, 3 465 os./km²”, „Najniżej: …”, „Mediana: …” (liczona, `Intl.NumberFormat('pl-PL')`). **Gotowe, gdy:** test na `tests/fixtures` – nazwa zamiast kodu, mediana policzona z danych.
- [ ] **C1-3** ∥ Filtr listy. `Zmieniaj: src/core/ranking/rankings-filter.ts, tests/unit/rankings-filter.test.ts`. Szukanie po nazwie bez polskich znaków i wielkości liter (`core/search/normalize`), zawężenie do województwa `w`. **Gotowe, gdy:** „lodz” znajduje „Łódź”; `w=12` zostawia tylko małopolskie.
- [ ] **C1-4** Pasek wyboru. `Zmieniaj: src/view/ranking/RankingsFilters.tsx, tests/unit/rankings-filters.test.tsx`. Wskaźnik (`IndicatorPicker`), poziom (Gminy wyłączone, gdy wskaźnik ich nie ma), rok (lata wskaźnika), województwo. **Gotowe, gdy:** wybór zmienia stan; „Gminy” wyłączone z podpowiedzią dla wskaźnika powiatowego.
- [ ] **C1-5** Lista. `Zmieniaj: src/view/ranking/RankingsList.tsx, tests/unit/rankings-list.test.tsx`. Miejsce, nazwa z rodzajem gminy, wartość z jednostką, słupek; 50 + „Pokaż więcej”; klik → `/?u=<teryt>&i=<id>`. **Gotowe, gdy:** żadna pozycja nie jest samym kodem; „Pokaż więcej” dokłada 50.
- [ ] **C1-6** Złożenie strony. `Zmieniaj: src/view/pages/Rankings.tsx, tests/e2e/q-rankings.spec.ts`. Bez pustego prostokąta; telefon 390 px bez poziomego przewijania, pola ≥ 44 px. **Gotowe, gdy:** e2e `@Q`: zmiana wskaźnika zmienia adres i listę; link otwiera ten sam ranking; `scrollWidth ≤ 390`.

### C2 Porównaj działa (`/porownaj`)
- [ ] **C2-1** Stan porównania. `Zmieniaj: src/core/compare/compare-url.ts, tests/unit/compare-url.test.ts`. Odczyt/zapis `?c=a,b`, ustaw A/B, zamień, wyczyść, flaga „różne poziomy”. **Gotowe, gdy:** testy każdej operacji; `?c=14` = tylko A.
- [ ] **C2-2** ∥ Pole wyboru miejsca. `Zmieniaj: src/view/compare/PlacePicker.tsx, tests/unit/place-picker.test.tsx`. Pole z podpowiedziami (`useSearch`: jednostki i miejscowości), × czyści, klawiatura (strzałki, Enter, Escape). **Gotowe, gdy:** wpisanie „Krak” pokazuje „Kraków”, Enter wybiera.
- [ ] **C2-3** Złożenie strony. `Zmieniaj: src/view/pages/ComparePage.tsx, tests/e2e/q-compare.spec.ts`. Dwa pola, „Zamień”, nazwy w nagłówkach, „Wybierz drugie miejsce”, ostrzeżenie o poziomach, gotowe pary pod spodem; reset profilu po wyczyszczeniu. **Gotowe, gdy:** e2e `@Q`: „Kraków” + „Wrocław” → `?c=1261,0264` i tabela; „Zamień” odwraca; nagłówki bez kodów.
- [ ] **C2-4** Telefon. `Zmieniaj: tests/e2e/q-compare-mobile.spec.ts` (+ poprawki układu w `ComparePage.tsx`, jeśli test padnie). **Gotowe, gdy:** 390 px: pola jedno pod drugim, `scrollWidth ≤ 390`, pola ≥ 44 px.
- [ ] **C2-5** Wiersze tabeli z „Moich wskaźników” (po C5-3). `Zmieniaj: src/view/pages/ComparePage.tsx, tests/unit/compare-rows-my.test.tsx`. **Gotowe, gdy:** usunięcie wskaźnika z moich znika z tabeli.

### C3 Obrysy gasną po oddaleniu
- [ ] **C3-1** Reguła widoczności. `Zmieniaj: src/core/map/outline-visibility.ts, tests/unit/outline-visibility.test.ts`. Przezroczystość 0–1 z szerokości jednostki na ekranie (próg 2%, płynne przejście). **Gotowe, gdy:** gmina przy widoku kraju = 0; ta sama gmina przybliżona = 1.
- [ ] **C3-2** Warstwa obrysu. `Zmieniaj: src/view/map/layers/choropleth.ts` (tylko `selected-outline-layer`), `tests/unit/outline-layer.test.ts`. Przejście 300 ms; 0 ms przy `prefers-reduced-motion`. **Gotowe, gdy:** test fabryki warstwy: przy małej skali kolor obrysu ma alfa 0.
- [ ] **C3-3** Wystawienie w trybie testowym. `Zmieniaj: src/core/map/test-seam.ts, tests/e2e/q-outline.spec.ts`. Pole `outlineOpacity` w `window.__atlas`. **Gotowe, gdy:** e2e `@Q`: wybór gminy → oddalenie do kraju → `outlineOpacity = 0`; przybliżenie → 1.

### C4 Płynny ruch mapy
- [ ] **C4-1** Pomiar (tylko raport, bez zmian w repo). Skrypt Playwright poza repo na buildzie: liczba klatek kamery przy kliknięciu, kółku, pinch, „+/−”, okruszkach, „Wróć”; czy zachodzą kafelki i przelewanie kolorów. **Gotowe, gdy:** raport w PR/rozmowie z tabelą „działa / nie działa / dlaczego”.
- [ ] **C4-2** Płynne przybliżanie kółkiem i palcami. `Zmieniaj: src/view/map/AtlasMap.tsx, src/view/map/hooks/useMapViewState.ts` (pliki ekranu – zgoda w tym zadaniu). Wg raportu C4-1 (np. nie przerywać łagodnego przybliżania MapLibre, nie ignorować `onMove` w trakcie animacji). **Gotowe, gdy:** e2e: jedno kółko = co najmniej 5 pośrednich wartości `zoom` w `window.__atlas`.
- [ ] **C4-3** ∥ Przyciski „+ / −” na mapie. `Zmieniaj: src/view/map/ZoomButtons.tsx, tests/unit/zoom-buttons.test.tsx` (+ jedna linia wpięcia w `AtlasMap.tsx`). Płynne przybliżenie ok. 300 ms, 44 px, etykiety „Przybliż”/„Oddal”. **Gotowe, gdy:** klik zmienia zoom o 1 przez kilka klatek; przy reduced-motion od razu.
- [ ] **C4-4** Wejście w głąb i powrót widoczne. `Zmieniaj: src/view/map/hooks/useMapViewState.ts, src/core/map/camera.ts` wg C4-1. **Gotowe, gdy:** e2e: klik województwa ≈ 600 ms ruchu (≥ 10 klatek), „Wróć” ≈ 400 ms.
- [ ] **C4-5** Kafelki i przelewanie kolorów. `Zmieniaj: src/view/map/hooks/useChoropleth.ts` wg C4-1. **Gotowe, gdy:** e2e przez `__atlas.reveal`: postęp rośnie od 0 do 1 w < 1 s; zmiana wskaźnika – kolory przechodzą 300 ms.
- [ ] **C4-6** Strażnik bez ruchu. `Zmieniaj: tests/e2e/q-reduced-motion-map.spec.ts`. **Gotowe, gdy:** przy `prefers-reduced-motion` każdy z ruchów C4-2–C4-5 kończy się w 1 klatce.

### C5 Moje wskaźniki (lista użytkownika)
- [ ] **C5-1** Model listy. `Zmieniaj: src/core/my-indicators/my-indicators.ts, tests/unit/my-indicators.test.ts`. Stała `BASIC_INDICATORS` (D1), dodaj (bez duplikatów), usuń, przesuń, przywróć podstawowe; lista może być pusta. **Gotowe, gdy:** test każdej operacji; dodanie istniejącego nic nie zmienia.
- [ ] **C5-2** Zapis w przeglądarce. `Zmieniaj: src/core/my-indicators/storage.ts, tests/unit/my-indicators-storage.test.ts`. Klucz `faktografia-my-indicators`, wersja, każdy odczyt/zapis w try/catch; brak pamięci → lista podstawowa; nieznane id odrzucane. **Gotowe, gdy:** test: zepsuty JSON → podstawowe; tryb prywatny (rzucający storage) → działa bez błędu.
- [ ] **C5-3** Wspólny stan. `Zmieniaj: src/view/my-indicators/useMyIndicators.ts, tests/unit/use-my-indicators.test.tsx`. Jeden stan dla całej strony; zmiana w innej karcie przeglądarki (zdarzenie `storage`) odświeża listę. **Gotowe, gdy:** dwa komponenty widzą tę samą zmianę.
- [ ] **C5-4** Lista z ×. `Zmieniaj: src/view/my-indicators/MyIndicatorsList.tsx, tests/unit/my-indicators-list.test.tsx`. Wiersz: nazwa, jednostka, ×, ‹ › (kolejność); „Przywróć podstawowe”; pusta lista → „Dodaj pierwszy wskaźnik”. **Gotowe, gdy:** × usuwa wiersz; „Przywróć” wraca do 7 podstawowych; pola ≥ 44 px.
- [ ] **C5-5** Okno „+ Dodaj wskaźnik”. `Zmieniaj: src/view/my-indicators/AddIndicatorDialog.tsx, tests/unit/add-indicator-dialog.test.tsx`. Dwie zakładki: „Szukaj” (pole, wyniki bez polskich znaków) i „Kategorie” (grupy głównych + działy biblioteki, okruszki); tylko pobrane; dodane oznaczone „✓ w moich”. Źródło listy: rejestr z C6-2. **Gotowe, gdy:** wpisanie „bezrob” pokazuje stopę bezrobocia; wybór kategorii pokazuje jej wskaźniki; dodanie zamyka okno i dopisuje na końcu listy.
- [ ] **C5-6** Panel mapy (komputer). `Zmieniaj: src/view/main/IndicatorPanel.tsx, tests/unit/indicator-panel-my.test.tsx`. Sekcja „Moje wskaźniki” (klik = wskaźnik na mapie, ×, +). **Gotowe, gdy:** klik w wiersz zmienia `?i=`; × usuwa; + otwiera okno C5-5.
- [ ] **C5-7** ∥ Arkusz wskaźnika (telefon). `Zmieniaj: src/view/main/MobileIndicatorBar.tsx, tests/unit/mobile-bar-my.test.tsx`. Ta sama sekcja na górze arkusza. **Gotowe, gdy:** jak C5-6, na 390 px bez poziomego przewijania.
- [ ] **C5-8** ∥ Przycisk w bibliotece. `Zmieniaj: src/view/my-indicators/MyToggleButton.tsx, src/view/pages/LibraryVariable.tsx, tests/unit/my-toggle-button.test.tsx`. „Dodaj do moich” / „Usuń z moich”. **Gotowe, gdy:** klik przełącza i lista w panelu mapy to widzi.
- [ ] **C5-9** ∥ Sekcja na górze Biblioteki. `Zmieniaj: src/view/pages/Library.tsx, tests/unit/library-my-section.test.tsx`. „Moje wskaźniki” (MyIndicatorsList) nad kafelkami. **Gotowe, gdy:** sekcja widoczna, × działa.
- [ ] **C5-10** ∥ Prywatność. `Zmieniaj: src/view/pages/Privacy.tsx, tests/unit/privacy-my-indicators.test.tsx`. Zdanie o kluczu `faktografia-my-indicators` (tylko lista wskaźników, zostaje w przeglądarce, nie trafia do nas). **Gotowe, gdy:** test znajduje nazwę klucza na stronie.

### C6 Pobrane wskaźniki biblioteki wszędzie
- [ ] **C6-1** (Claude, workflow – Twoja zgoda) Robot zapisuje `library/available.json`. `Zmieniaj: scripts/data/…` (skrypt indeksu), `.github/workflows/fetch-library.yml`. Bez wcięć; tylko zmienne z plikiem wartości. **Gotowe, gdy:** test skryptu na nagranym katalogu; plik < 50 KB dla 101 wskaźników.
- [ ] **C6-2** Wspólny rejestr wskaźników. `Zmieniaj: src/core/indicators/registry.ts, tests/unit/indicator-registry.test.ts`. 20 głównych z `config/indicators.json` + pobrane z `available.json` jako `Indicator` (id `b<varId>`, grupa = dział, `minLevel` z dostępnych poziomów, `higherIsBetter: null`). **Gotowe, gdy:** test na `tests/fixtures/library/available.json`: 25 pozycji, wskaźnik tylko powiatowy ma `minLevel: 'pow'`, brak duplikatów nazw.
- [ ] **C6-3** Ładowanie spisu pobranych. `Zmieniaj: src/core/indicators/load-available.ts, tests/unit/load-available.test.ts`. Jedno żądanie, pamięć podręczna, błąd sieci → tylko 20 głównych. **Gotowe, gdy:** test: dwa wywołania = jedno żądanie; 404 → pusta lista bez błędu.
- [ ] **C6-4** Jeden sposób pobierania wartości. `Zmieniaj: src/core/indicators/load-any-values.ts, tests/unit/load-any-values.test.ts`. Id główne → `values/<id>.json`; `b…` → `loadLibraryValues` + `valuesByTeryt`. **Gotowe, gdy:** test na `values-sample.json`: wynik ma kody TERYT i lata jak wskaźnik główny.
- [ ] **C6-5** Adres przyjmuje wskaźnik z biblioteki. `Zmieniaj: src/core/url/state.ts, tests/unit/url-library-indicator.test.ts`. `?i=b60614` przechodzi wstępnie; nieznany po wczytaniu spisu → domyślny. **Gotowe, gdy:** test obu przypadków; istniejące testy adresu bez zmian.
- [ ] **C6-6** Mapa na wskaźniku z biblioteki. `Zmieniaj: src/view/map/hooks/useMainView.ts` (plik ekranu – zgoda w zadaniu), `tests/e2e/q-library-on-map.spec.ts`. Rejestr + loader z C6-2/C6-4; legenda, rok, poziomy z danych. **Gotowe, gdy:** e2e `@Q`: `/?i=b<id>` → `__atlas.choropleth.indicatorId = 'b<id>'`, legenda ma 5 klas; dokładnie jedno żądanie wartości.
- [ ] **C6-7** ∥ Wybór wskaźnika z biblioteki w oknie wskaźników. `Zmieniaj: src/view/controls/IndicatorPicker.tsx, tests/unit/indicator-picker-library.test.tsx`. Grupa „Z biblioteki GUS” pod głównymi, wyszukiwanie obejmuje oba. **Gotowe, gdy:** szukanie znajduje wskaźnik z biblioteki; wybór ustawia `?i=b…`.
- [ ] **C6-8** ∥ „Pokaż na mapie” na stronie wskaźnika. `Zmieniaj: src/view/pages/LibraryVariable.tsx, tests/unit/library-show-on-map.test.tsx`. Tylko dla pobranych. **Gotowe, gdy:** link prowadzi do `/?i=b<id>&l=<poziom>`.
- [ ] **C6-9** Rankingi na rejestrze. `Zmieniaj: src/view/pages/Rankings.tsx, tests/unit/rankings-library.test.tsx` (po C1-6). **Gotowe, gdy:** ranking dla `?i=b<id>` pokazuje nazwy i wartości.
- [ ] **C6-10** Porównanie na rejestrze. `Zmieniaj: src/core/compare/compare-extra.ts, tests/unit/compare-extra.test.ts`. Wiersze dla wskaźników z biblioteki z moich (osobne pobranie wartości, jedno na wskaźnik). **Gotowe, gdy:** test: wiersz z wartościami obu miejsc i słowną różnicą.
- [ ] **C6-11** Próg szybkości. `Zmieniaj: tests/e2e/q-budgets-library.spec.ts`. **Gotowe, gdy:** wejście na mapę = granice + jednostki + 1 plik wskaźnika + `available.json`; nigdy pełny `index.json`.

### C7 Biblioteka: tylko pobrane
- [ ] **C7-1** Zapytanie tylko z danymi. `Zmieniaj: src/core/library/query.ts, tests/unit/library-only-fetched.test.ts`. Filtr „pobrane” zawsze włączony; liczniki `m` (z danymi) i `n` (w spisie). **Gotowe, gdy:** żaden wynik nie ma pustych wartości; liczniki zgodne z danymi testowymi.
- [ ] **C7-2** Strona listy. `Zmieniaj: src/view/pages/Library.tsx, src/view/library/LibraryFilters.tsx, tests/unit/library-page-fetched.test.tsx`. Bez przełącznika „tylko pobrane”; zdanie „<m> wskaźników z danymi (z <n> w spisie GUS). Kolejne dane dochodzą co noc.” **Gotowe, gdy:** test znajduje zdanie z liczbami; przełącznika nie ma.
- [ ] **C7-3** ∥ Kafelki działów. `Zmieniaj: src/view/library/CategoryTiles.tsx, tests/unit/category-tiles-fetched.test.tsx`. Tylko działy z ≥ 1 pobranym, z liczbą. **Gotowe, gdy:** dział bez pobranych nie ma kafelka.
- [ ] **C7-4** ∥ „Zamów dane na temat…”. `Zmieniaj: src/view/library/OrderTopicButton.tsx, tests/unit/order-topic-button.test.tsx`. Przycisk zawsze nad listą; przy braku wyników z wpisanym tematem w treści zgłoszenia (formularz GitHub, jak `OrderButton`). **Gotowe, gdy:** adres zgłoszenia zawiera wpisany temat (zakodowany).
- [ ] **C7-5** Wpięcie przycisku. `Zmieniaj: src/view/library/LibraryResults.tsx, tests/unit/library-empty-order.test.tsx`. **Gotowe, gdy:** pusty wynik pokazuje „Nie mamy jeszcze danych o „…”” + przycisk.

### C8 Udostępnianie na każdej stronie
- [ ] **C8-1** Pasek udostępniania. `Zmieniaj: src/view/share/ShareBar.tsx, tests/unit/share-bar.test.tsx`. „Kopiuj link” (→ „Skopiowano” 2 s), „Pobierz i udostępnij” (otwiera edytor z C9 z podanym miejscem otwarcia). **Gotowe, gdy:** klik kopiuje `location.href`; brak schowka → pole z linkiem do zaznaczenia.
- [ ] **C8-2** `/rankingi`. `Zmieniaj: src/view/pages/Rankings.tsx, tests/unit/rankings-share.test.tsx`. **Gotowe, gdy:** pasek widoczny, link zawiera bieżące `?i=&l=&y=`.
- [ ] **C8-3** ∥ `/porownaj`. `Zmieniaj: src/view/pages/ComparePage.tsx, tests/unit/compare-page-share.test.tsx`. **Gotowe, gdy:** pasek tylko przy dwóch miejscach, link z `?c=`.
- [ ] **C8-4** ∥ `/biblioteka/<id>`. `Zmieniaj: src/view/pages/LibraryVariable.tsx, tests/unit/library-variable-share.test.tsx`. Karta rankingu z danych biblioteki. **Gotowe, gdy:** okno otwiera się z kartą rankingu tego wskaźnika.
- [ ] **C8-5** ∥ `/biblioteka` (lista). `Zmieniaj: src/view/pages/Library.tsx, tests/unit/library-copy-link.test.tsx`. Tylko „Kopiuj link”. **Gotowe, gdy:** link zawiera `?k=&q=`.

### C9 Eksport: edytor zestawu stron
Logika (czysta, `src/core/share`):
- [ ] **C9-1** Model zestawu. `Zmieniaj: src/core/share/deck.ts, tests/unit/deck.test.ts`. Strony (rodzaj, dane), dodaj, usuń (ostatniej nie), przesuń, numeracja „n/N”. **Gotowe, gdy:** usunięcie strony 2 z 4 daje numery 1/3, 2/3, 3/3; ostatniej nie da się usunąć.
- [ ] **C9-2** ∥ Dane strony. `Zmieniaj: src/core/share/deck-page-data.ts, tests/unit/deck-page-data.test.ts`. Lista wskaźników strony (domyślnie z „Moich wskaźników”), dodaj, usuń, zmień wskaźnik (strony jednowskaźnikowe). **Gotowe, gdy:** testy operacji; strona „Mapa” przyjmuje dokładnie jeden wskaźnik.
- [ ] **C9-3** Zestawy domyślne. `Zmieniaj: src/core/share/deck-defaults.ts, tests/unit/deck-defaults.test.ts`. Mapa: Mapa · Ranking najwyżej · Ranking najniżej · Tabela (+ Profil przy wybranym miejscu); Profil: Profil · Duża liczba · Wykres lat · Tabela; Porównanie: Porównanie · Tabela · Duża liczba A vs B; Rankingi: Ranking · Mapa · Rozkład; Biblioteka: Ranking · Rozkład. **Gotowe, gdy:** test każdego z 5 miejsc otwarcia.
- [ ] **C9-4** Podział strony. `Zmieniaj: src/core/share/deck-split.ts, tests/unit/deck-split.test.ts`. Tabela > limitu → kilka stron; ranking → „najwyżej” i „najniżej”; profil z > 5 wskaźnikami → kilka. Limity: Tabela 8 wierszy (Story 10). **Gotowe, gdy:** tabela 10 wierszy w Post → 2 strony (8 + 2), numeracja przeliczona.
- [ ] **C9-5** Numer na karcie. `Zmieniaj: src/core/share/card.ts, tests/unit/card-page-number.test.ts`. „n/N” w stopce obok źródła, tylko gdy N > 1. **Gotowe, gdy:** scena karty zawiera tekst „3/5”; przy jednej stronie – brak.
- [ ] **C9-6** ∥ Karta Tabela. `Zmieniaj: src/core/share/card-table.ts, tests/unit/card-table.test.ts`. Wiersz: wskaźnik, wartość, miejsce. **Gotowe, gdy:** najdłuższa nazwa mieści się w 4 formatach (test `text-fit`).
- [ ] **C9-7** ∥ Karta Duża liczba. `Zmieniaj: src/core/share/card-bignumber.ts, tests/unit/card-bignumber.test.ts`. Liczba, jednostka, miejsce (jedno kółko korekty). **Gotowe, gdy:** jak C9-6; dokładnie jedno zakreślenie.
- [ ] **C9-8** ∥ Karta Wykres lat. `Zmieniaj: src/core/share/card-trend.ts, tests/unit/card-trend.test.ts` (geometria z `core/profile/trend-geometry.ts`). **Gotowe, gdy:** oś lat z min/max; brakujące lata = przerwa w linii.
- [ ] **C9-9** ∥ Karta Rozkład. `Zmieniaj: src/core/share/card-histogram.ts, tests/unit/card-histogram.test.ts`. Ile jednostek w każdej z 5 klas + „brak danych”. **Gotowe, gdy:** suma słupków = liczba jednostek poziomu.
- [ ] **C9-10** ∥ Karta Duża liczba A vs B. `Zmieniaj: src/core/share/card-versus.ts, tests/unit/card-versus.test.ts`. **Gotowe, gdy:** dwie nazwy i słowna różnica („wyżej o 1,2 p.p.”), kolory neutralne.
- [ ] **C9-11** ∥ CSV zestawu. `Zmieniaj: src/core/share/deck-csv.ts, tests/unit/deck-csv.test.ts`. Sekcja na stronę; UTF-8, „;”, przecinek dziesiętny. **Gotowe, gdy:** test: 3 strony → 3 sekcje z nagłówkami „Strona n/N”.

Ekran (`src/view/share`):
- [ ] **C9-12** Stan zestawu. `Zmieniaj: src/view/share/useDeck.ts, tests/unit/use-deck.test.tsx`. Trzyma zestaw, dociąga wartości dodanych wskaźników (C6-4, jedno żądanie na wskaźnik). **Gotowe, gdy:** dodanie wskaźnika = jedno żądanie; ponowne – zero.
- [ ] **C9-13** ∥ Pasek stron. `Zmieniaj: src/view/share/DeckStrip.tsx, tests/unit/deck-strip.test.tsx`. Miniatury „n/N Rodzaj”, ×, ‹ ›, + na końcu; na telefonie przewijany w poziomie wewnątrz paska. **Gotowe, gdy:** × usuwa, ‹ › zmienia kolejność, pola ≥ 44 px.
- [ ] **C9-14** ∥ Menu „+”. `Zmieniaj: src/view/share/AddPageMenu.tsx, tests/unit/add-page-menu.test.tsx`. Mapa · Ranking · Tabela · Duża liczba · Wykres lat · Rozkład · Porównanie (gdy są dwa miejsca) · Podziel tę stronę (gdy da się). **Gotowe, gdy:** wybór dodaje stronę za bieżącą; „Podziel” wyłączone dla mapy.
- [ ] **C9-15** ∥ „Dane na tej stronie”. `Zmieniaj: src/view/share/PageDataEditor.tsx, tests/unit/page-data-editor.test.tsx`. Lista z × i „+ Dodaj dane” (okno C5-5); „Zmień wskaźnik” dla stron jednowskaźnikowych; podpowiedź „Podziel stronę” po przekroczeniu limitu. **Gotowe, gdy:** × usuwa wiersz z podglądu; + dodaje.
- [ ] **C9-16** Podgląd nowych kart. `Zmieniaj: src/view/share/CardSvg.tsx, tests/unit/card-svg-kinds.test.tsx`. **Gotowe, gdy:** każdy z 9 rodzajów renderuje się bez błędu.
- [ ] **C9-17** Okno. `Zmieniaj: src/view/share/ShareDialog.tsx, src/view/share/ShareControls.tsx`. Pasek stron, podgląd bieżącej, dane strony, format i motyw dla całego zestawu, przyciski: Pobierz tę stronę · Pobierz wszystkie · Udostępnij zestaw · CSV (strona / zestaw). Kod nadal ładowany po kliknięciu. **Gotowe, gdy:** test jednostkowy przycisków; „Pobierz wszystkie” tworzy N plików.
- [ ] **C9-18** Miejsca otwarcia. `Zmieniaj: src/view/share/useShareData.ts, tests/unit/share-entry-points.test.ts`. Przekazuje miejsce (mapa/profil/porównanie/rankingi/biblioteka) do C9-3. **Gotowe, gdy:** z profilu zestaw zaczyna się od „Profil”.
- [ ] **C9-19** Telefon. `Zmieniaj: tests/e2e/q-share-deck-mobile.spec.ts`. **Gotowe, gdy:** 390 px: `scrollWidth ≤ 390`, przyciski ≥ 44 px, podgląd mieści się nad przyciskami.
- [ ] **C9-20** Cała ścieżka. `Zmieniaj: tests/e2e/q-share-deck.spec.ts`. **Gotowe, gdy:** e2e `@Q`: otwórz z mapy (4 strony) → usuń 2. (1/3…3/3) → + Tabela → + Dodaj dane „Stopa bezrobocia” → Podziel → pobierz wszystkie = liczba stron.

### C10 Odbiór i porządki (Claude)
- [ ] **C10-1** Po każdej fali: wpis w `docs/STAN.md` (co działa, co do obejrzenia).
- [ ] **C10-2** Prośba o odświeżenie zrzutów („Update snapshots”) po falach zmieniających wygląd (Q2, Q5, Q7).
- [ ] **C10-3** Po fali Q7: `docs/ARCHITEKTURA.md` – nowe pliki-węzły (`core/indicators`, `core/my-indicators`, `core/share/deck*`).

---

## 4. Fale (zadania w fali nie dzielą plików i nie zależą od siebie – idą równolegle; fala startuje po scaleniu poprzedniej)

Układ policzony z zależności (kto potrzebuje czyjego kodu) i z kolizji plików (np. `Library.tsx`, `Rankings.tsx`, `ComparePage.tsx`, `AtlasMap.tsx` – zmieniane po kolei w kolejnych falach). Skrypt sprawdził: w żadnej fali dwa zadania nie mają wspólnego pliku. QC601 (robot) robi Claude poza falami.

| Fala | Zadań | Zadania | Punkt kontrolny |
|---|---|---|---|
| **Q1** | 22 | C1-1 · C1-2 · C1-3 · C1-5 · C2-1 · C2-2 · C3-1 · C4-1 (raport) · C5-1 · C5-10 · C6-2 · C6-4 · C6-5 · C7-1 · C7-4 · C8-1 · C9-1 · C9-5 · C9-6 · C9-7 · C9-8 · C9-9 | – |
| **Q2** | 15 | C1-4 · C2-3 · C3-2 · C4-2 · C4-5 · C5-2 · C6-3 · C6-10 · C7-2 · C7-3 · C9-2 · C9-10 · C9-11 · C9-13 · C9-14 | – |
| **Q3** | 11 | C1-6 · C2-4 · C3-3 · C4-3 · C4-4 · C5-3 · C6-6 · C7-5 · C9-3 · C9-4 · C9-16 | **K-Q1** |
| **Q4** | 9 | C4-6 · C5-4 · C5-5 · C5-6 · C5-8 · C6-7 · C8-2 · C8-3 · C9-12 | **K-Q2** |
| **Q5** | 6 | C2-5 · C5-7 · C5-9 · C6-8 · C6-9 · C9-15 | – |
| **Q6** | 4 | C6-11 · C8-4 · C8-5 · C9-17 | **K-Q3** |
| **Q7** | 3 | C9-18 · C9-19 · C9-20 | **K-Q4** |

Numery C…-… odpowiadają `QC<cel><nn>` (C1-5 = QC105 itd.); lista zadań każdej fali jest też w `Q/waves-Q.fragment.yaml`.

**Zmiana 17.11 (druga):** zamiast 12 fal po ≤ 7 zadań jest 7 fal z szerokim równoległym frontem (22/15/11/9/6/4/3 zadań), bo właściciel chce, żeby zadania na różnych plikach szły jednocześnie. Zależności między zadaniami nadal wymuszają kolejność fal.

Razem: **78 zadań** (71 z promptami w `Q/`: 70 dla pętli + QC601 dla Claude; C0 i C10 to prace Claude bez pliku) (4 Claude w C0, 1 Claude w C6-1, 3 Claude w C10, reszta dla pętli).

## 5. Co Ty sprawdzasz na podglądzie (komputer i telefon)
- **K-Q1 (po Q3):** `/rankingi` – zmień wskaźnik, poziom, rok, wyszukaj gminę, skopiuj adres do nowej karty. `/porownaj` – wpisz dwa miasta, zamień, wyczyść. Mapa – wybierz gminę, oddal do Polski: obrys gaśnie. `/biblioteka` – tylko wskaźniki z danymi, licznik, „Zamów dane na temat…”.
- **K-Q2 (po Q5):** przybliżanie kółkiem/palcami i przyciskami jest płynne; klik w województwo – płynny dojazd; „Wróć” – płynny powrót. Rankingi i Porównaj mają „Kopiuj link” i „Pobierz i udostępnij”.
- **K-Q3 (po Q7):** panel mapy: „Moje wskaźniki” – usuń jeden, dodaj z biblioteki przez wyszukiwarkę i przez kategorie, „Przywróć podstawowe”; odśwież stronę – lista zostaje. Wskaźnik z biblioteki na mapie, w rankingu, w porównaniu.
- **K-Q4 (po Q11):** eksport z mapy, z profilu, z porównania: numeracja stron, × usuwa, + dodaje tabelę/wykres/rozkład, „Dane na tej stronie” × i +, „Podziel stronę”, pobierz wszystkie, udostępnij zestaw na telefonie.

## 6. Później (świadomie poza planem Q)
- Wskaźniki z biblioteki w profilu miejsca (wymaga zmiany plików profilu, §7).
- Link do własnej listy „Moje wskaźniki” (np. `?m=`), żeby wysłać ją komuś.
- Przeciąganie stron w pasku eksportu (na start strzałki ‹ ›); ZIP przy „Pobierz wszystkie”; dzielenie mapy na kilka stron.
