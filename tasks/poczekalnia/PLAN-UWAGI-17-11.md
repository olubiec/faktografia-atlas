# Plan: uwagi właściciela z 17.11.2026 (fala Q)

Źródło: wiadomość właściciela 17.11.2026 + odpowiedzi na pytania doprecyzowujące (ta sama rozmowa).
Plik w `tasks/poczekalnia/` – pętla go ignoruje. Zadania Q*-* wypuszczamy dopiero po akceptacji decyzji z §2.
Zastępuje: **P1-A** (Rankingi), **P1-B** (Porównaj), **P3-C** (Biblioteka) – przy wypuszczaniu fali Q tamte pliki pomijamy.

---

## 1. Co jest zepsute i dlaczego (diagnoza z kodu, stan `main` 17.11)

| # | Uwaga właściciela | Co jest w kodzie | Waga |
|---|---|---|---|
| 1 | Rankingi nie działają | `src/view/pages/Rankings.tsx` to atrapa: listy wyboru bez opcji, wskaźnik na sztywno „gęstość”, tylko województwa, mediana wpisana na sztywno (`median: 50 // Mocked`), lista pokazuje kody TERYT zamiast nazw, pole „Szukaj” nic nie robi, „Mapa” to pusty prostokąt. | wysoka |
| 2 | Porównaj: nie da się wybrać miasta ani wyszukać | `src/view/pages/ComparePage.tsx`: brak wyszukiwarki i wyboru miejsc – działa tylko 6 „gotowych pojedynków”; nagłówki pokazują kody („Miejsce A: 14”). | wysoka |
| 3 | Czerwone obrysy nie znikają po oddaleniu | Obrys wybranego/porównywanego miejsca zależy tylko od adresu (`?u=`, `?c=`), nie od przybliżenia. Oddalasz do całej Polski – obrys gminy zostaje. | średnia |
| 4 | Brak powolnych przybliżeń/oddaleń i animacji | Kod ruchu kamery istnieje (`useMapViewState.ts`, 600/400 ms), ale działa tylko przy wyborze z listy/kliknięciu. Mapa jest „sterowana” (`{...currentViewState}` + `onMove`), co najpewniej gasi płynne przybliżanie kółkiem i palcami; dodatkowo `onMove` ignoruje ruchy w trakcie animacji. **Do potwierdzenia pomiarem na podglądzie (Q4-A), zanim cokolwiek zmienimy.** | średnia |
| 5 | Eksport: brak edycji, brak stron | `ShareDialog.tsx`: 4 stałe karty (Mapa/Ranking/Profil/Porównanie), jedna naraz, treść niezmienna, brak numeracji, brak dodawania i usuwania. | wysoka (największa praca) |
| 6 | Biblioteka: tylko pobrane | Spis ma 63 960 zmiennych, wartości ma ok. 101. Lista domyślnie pokazuje wszystko; pobrane nie dają się użyć na mapie, w rankingu ani w eksporcie. | średnia |
| 7 | Każda strona do udostępniania | Link + „Pobierz i udostępnij” są tylko na mapie, w profilu i w zakładce porównania. Brak na `/rankingi`, `/porownaj`, `/biblioteka/<id>`. | średnia |

---

## 2. Decyzje (domyślne – zmień, jeśli chcesz inaczej)

- **D-Q1 Obrysy:** czerwony obrys miejsca **wygasza się (300 ms)**, gdy oddalisz mapę tak, że jednostka jest mniejsza niż ok. 2% szerokości mapy (praktycznie: gmina przy widoku kraju, powiat przy widoku kraju). Wybór zostaje w adresie; przybliżenie z powrotem pokazuje obrys. Przy `prefers-reduced-motion` – bez wygaszania, od razu.
- **D-Q2 Eksport = zestaw stron.** Okno „Pobierz i udostępnij” staje się edytorem zestawu: kilka stron domyślnie, każda z numerem „n/N”, „×” usuwa stronę, „+” dodaje stronę wybranego rodzaju. Jest to funkcja dla każdego użytkownika (rozszerzenie PRODUKT §4b „Zestaw”), **nie** prywatny generator slajdów Faktografii – tamten zakaz zostaje.
- **D-Q3 Dodawanie danych w eksporcie pobiera pliki.** Dodanie wskaźnika, którego nie ma w pamięci = jedno żądanie `values/<id>.json` na wskaźnik. Zmienia regułę §4b „zero nowych pobrań” na „jedno pobranie na dodany wskaźnik”.
- **D-Q4 Pobierz wszystko na komputerze = kolejne pliki PNG** (jak dziś „zestaw”), bez ZIP – ZIP wymaga nowego pakietu (osobna decyzja, jeśli zechcesz).
- **D-Q5 Biblioteka pokazuje tylko wskaźniki z danymi.** Niepobrane ukryte. Nad listą: „Pokazujemy <m> wskaźników z danymi. Kolejne dane GUS dochodzą co noc.” i przycisk **„Zamów dane na temat…”** (istniejący formularz zgłoszenia na GitHubie, tekst wpisuje użytkownik). Wyszukiwanie bez wyników → ten sam przycisk z wpisanym tematem.
- **D-Q6 Pobrane wskaźniki biblioteki „do map itp.”** wymagają zmiany architektury (mapa, ranking i eksport znają dziś tylko 20 wskaźników z `config/indicators.json`). Najpierw zwiad Q6-A (tylko raport), potem decyzja i zadania. Do tego czasu strona `/biblioteka/<id>` ma ranking, CSV i udostępnianie.
- **D-Q7 Udostępnianie wszędzie:** każda podstrona z danymi ma stan w adresie i pasek „Kopiuj link · Pobierz i udostępnij” (wspólny komponent).

---

## 3. Jak ma działać (specyfikacja dla zadań)

### 3.1 Rankingi (`/rankingi`)
- Wybór wskaźnika tym samym oknem co na mapie (`IndicatorPicker` – grupy + wyszukiwanie), poziom (Woj/Pow/Gmi, gminy tylko gdy wskaźnik je ma), rok (lata wskaźnika), opcjonalnie obszar (województwo).
- Stan w adresie: `?i=&l=&y=&w=&q=` – link otwiera ten sam ranking.
- Podsumowanie zdaniami: „Najwyżej: Warszawa, 3 465 os./km²”, „Najniżej: …”, „Mediana Polski: …” – liczone z danych.
- Lista: miejsce, nazwa z rodzajem gminy, wartość z jednostką, słupek; 50 + „Pokaż więcej”; pole „Szukaj jednostki” filtruje listę (bez polskich znaków i wielkości liter) i podświetla miejsce.
- Klik w jednostkę → mapa z profilem (`/?u=<teryt>&i=…`).
- Bez pustego prostokąta „Mapa” (albo prawdziwa mapka SVG z `CompareMaps`/`map-shapes`, albo nic).

### 3.2 Porównaj (`/porownaj`)
- Dwa pola „Miejsce A”, „Miejsce B” z wyszukiwarką jednostek i miejscowości (ta sama co w nagłówku, `core/search`), przycisk „Zamień”, „×” czyści pole.
- Nagłówki z nazwami („Województwo wielkopolskie”), nie kodami. „Gotowe pojedynki” zostają pod spodem.
- Stan w `?c=a,b`; jedno miejsce wybrane → wynik czeka z podpowiedzią „Wybierz drugie miejsce”.
- Różne poziomy → dopisek „różne poziomy – porównuj ostrożnie” (jak w profilu).

### 3.3 Mapa: obrysy i ruch
- Obrysy wg D-Q1.
- Przybliżanie kółkiem, palcami, „+/−” i klawiszami płynne (łagodne wyhamowanie jak w MapLibre), gest przerywa animację kamery.
- Animacje z PRODUKT §5a (600 ms w głąb, 400 ms wstecz, kafelki, przelewanie kolorów 300 ms) **widoczne na podglądzie** – Q4-A mierzy, które z nich naprawdę zachodzą.

### 3.4 Eksport – edytor zestawu
```
┌ Pobierz i udostępnij ──────────────────────────────── × ┐
│ [1/5 Mapa ×] [2/5 Ranking ×] [3/5 Tabela ×] … [ + ]      │  ← pasek stron (przewijany w poziomie na telefonie)
│ ┌ podgląd bieżącej strony ┐  Dane na tej stronie:        │
│ │                         │  • Gęstość zaludnienia   ×   │
│ │        3/5              │  • Stopa bezrobocia      ×   │
│ └─────────────────────────┘  [ + Dodaj dane ]            │
│ Format: Post · Kwadrat · Story · Poziomy   Motyw: J · C  │
│ [Pobierz tę stronę] [Pobierz wszystkie] [Udostępnij zestaw] [CSV] │
└──────────────────────────────────────────────────────────┘
```
- **Zestaw domyślny** zależy od miejsca otwarcia:
  - mapa: Mapa · Ranking (10 najwyżej) · Ranking (10 najniżej) · Tabela 5 podstawowych wskaźników dla wybranego obszaru; z wybranym miejscem dochodzi Profil;
  - profil: Profil · Duża liczba · Wykres lat · Tabela;
  - porównanie / `/porownaj`: Porównanie (mapki) · Tabela porównania · po jednej stronie „Duża liczba A vs B” dla bieżącego wskaźnika;
  - `/rankingi`: Ranking · Mapa · Rozkład.
- **Numer „n/N”** na każdej karcie (w stopce karty, obok źródła) i na pasku stron; po usunięciu/dodaniu numeracja się przelicza.
- **„×” na stronie** usuwa ją (ostatniej nie da się usunąć). Kolejność: strzałki ‹ › przy stronie (przeciąganie – później).
- **„+” dodaje stronę** – menu rodzajów: Mapa · Ranking (słupki) · Tabela · Duża liczba · Wykres lat · Porównanie dwóch miejsc · Rozkład (ile jednostek w każdej z 5 klas) · **Podziel stronę** (np. tabela 10 wierszy → 2 strony po 5; ranking → osobno „najwyżej” i „najniżej”; profil z 10 wskaźnikami → 2 strony).
- **„Dane na tej stronie”:** domyślnie kilka podstawowych wskaźników (ludność, gęstość, bezrobocie, wynagrodzenie, przyrost naturalny – lista w jednej stałej), „×” usuwa, „+ Dodaj dane” otwiera wyszukiwarkę wskaźników albo przeglądanie po kategoriach (ten sam `IndicatorPickerContent`). Strony jednowskaźnikowe (Mapa, Duża liczba, Wykres lat) mają „Zmień wskaźnik” zamiast listy.
- Limity, by napisy mieściły się w polach: Tabela ≤ 8 wierszy na stronę (Story ≤ 10), przy przekroczeniu podpowiedź „Podziel stronę”. Najdłuższa nazwa („Powiat kędzierzyńsko-kozielski”) mieści się w każdym formacie.
- Każda karta nadal: logo z `public/brand/`, „Źródło: GUS, Bank Danych Lokalnych, <rok>”, adres strony.
- CSV: dane wszystkich stron zestawu w jednym pliku (sekcja na stronę) albo bieżąca strona – dwa przyciski.
- Kod okna nadal ładowany dopiero po kliknięciu.

### 3.5 Biblioteka
- Wg D-Q5. Filtr „tylko pobrane” znika (zawsze włączony). Licznik w nagłówku: „<m> wskaźników z danymi (z <n> w spisie GUS)”.
- Kafelki działów pokazują tylko działy z co najmniej jednym pobranym wskaźnikiem, z liczbą.
- Strona wskaźnika: „Kopiuj link”, „Pobierz i udostępnij” (karta rankingu), CSV.

### 3.6 Udostępnianie na każdej stronie
Wspólny `ShareBar` (Kopiuj link → „Skopiowano”, Pobierz i udostępnij → edytor z §3.4 z zestawem właściwym dla strony). Strony: `/rankingi`, `/porownaj`, `/biblioteka/<id>`; mapa i profil już mają.

---

## 4. Zadania (1 zadanie = 1 zachowanie, 1–4 pliki)

Fala **Q1** – naprawy (niezależne, równolegle):
- **Q1-A Rankingi: logika** – `src/core/ranking/rankings-page.ts` (+ test): odczyt/zapis `?i=&l=&y=&w=&q=`, wybór domyślnych, zdania podsumowania z nazwą i jednostką, filtr wyszukiwania. Gotowe, gdy: testy na `tests/fixtures` – nazwa zamiast kodu, mediana liczona, adres ↔ stan w obie strony.
- **Q1-B Porównaj: wybór miejsc** – `src/view/pages/ComparePage.tsx`, `src/view/compare/PlacePicker.tsx`, test e2e `@Q1`. Gotowe, gdy: wpisanie „Kraków” i „Wrocław” daje `?c=1261,0264` i tabelę; „Zamień” zamienia; nagłówki z nazwami.
- **Q1-C Obrysy po oddaleniu** – `src/core/map/outline-visibility.ts` (+ test) i warstwa obrysu w `src/view/map/layers/` (prompt wymieni plik). Gotowe, gdy: test jednostkowy progu 2%; e2e przez `window.__atlas` – po oddaleniu do kraju obrys gminy ma przezroczystość 0.
- **Q4-A Pomiar animacji (tylko raport)** – skrypt Playwright poza repo na buildzie podglądu: czy kamera porusza się klatkami przy kliknięciu, kółku, pinch, okruszkach; czy kafelki i przelewanie kolorów zachodzą. Wynik → treść Q2-C.

Fala **Q2** (po Q1):
- **Q2-A Rankingi: ekran** – `src/view/pages/Rankings.tsx` (+ test widoku) na logice Q1-A; telefon 390 px bez poziomego przewijania, pola ≥ 44 px.
- **Q2-B ShareBar** – `src/view/share/ShareBar.tsx` (+ test) i wpięcie w `Rankings.tsx`, `ComparePage.tsx`, `LibraryVariable.tsx`.
- **Q2-C Płynny zoom i animacje** – `src/view/map/hooks/useMapViewState.ts`, `src/view/map/AtlasMap.tsx` (pliki ekranu – zgoda w prompcie) wg wyniku Q4-A.
- **Q2-D Biblioteka tylko z danymi** – `src/core/library/query.ts`, `src/view/pages/Library.tsx`, `src/view/library/LibraryFilters.tsx`, test. Gotowe, gdy: żaden wynik bez wartości; licznik; „Zamów dane na temat…” przy braku wyników z wpisanym tematem.

Fala **Q3** – eksport, logika (niezależne):
- **Q3-A Model zestawu** – `src/core/share/deck.ts` (+ test): lista stron, dodaj/usuń/przesuń, numeracja n/N, zestawy domyślne dla 5 miejsc otwarcia, „nie da się usunąć ostatniej”.
- **Q3-B Podział strony** – `src/core/share/deck-split.ts` (+ test): tabela, ranking, profil → kilka stron wg limitów §3.4.
- **Q3-C Karty: Tabela i Duża liczba** – `src/core/share/card-table.ts`, `card-bignumber.ts` (+ test mieszczenia napisów).
- **Q3-D Karty: Wykres lat i Rozkład** – `src/core/share/card-trend.ts`, `card-histogram.ts` (+ test).
- **Q3-E Numer strony na karcie** – `src/core/share/card.ts` (stopka „n/N”) + test.

Fala **Q4** – eksport, ekran (po Q3):
- **Q4-B Pasek stron z ×, + i strzałkami** – `src/view/share/DeckStrip.tsx`, `src/view/share/AddPageMenu.tsx`, test.
- **Q4-C „Dane na tej stronie”** – `src/view/share/PageDataEditor.tsx` (używa `IndicatorPickerContent`), test; jedno żądanie na dodany wskaźnik.

Fala **Q5** (po Q4):
- **Q5-A Edytor w oknie** – `src/view/share/ShareDialog.tsx`, `src/view/share/useShareData.ts`: wpięcie zestawu, „Pobierz tę stronę / wszystkie / Udostępnij zestaw / CSV”, e2e `@Q5` (dodaj stronę, usuń, numeracja 1/4 → 1/3).

Osobno:
- **Q6-A Zwiad: wskaźnik z biblioteki na mapie, w rankingu i eksporcie (tylko raport)** – format plików wartości biblioteki vs `values/<id>.json`, jak zarejestrować wskaźnik spoza `config/indicators.json`, wpływ na adres `?i=` i progi §7. Potem decyzja i zadania.
- **Q0 (Claude, przed falą Q1):** aktualizacja `docs/PRODUKT.md` §4b (zestaw stron, D-Q2–D-Q4), §4d (D-Q5), §5a (D-Q1), nowe §4e Rankingi; usunięcie zastąpionych P1-A, P1-B, P3-C z planu publikacji.

Kolejność i zależności: Q1 ∥ Q4-A → Q2 → (Q3 może iść równolegle z Q2) → Q4 → Q5. Q6-A w dowolnym momencie.
Ty sprawdzasz na podglądzie: po Q2 – rankingi, porównanie, obrysy, płynność (telefon + komputer); po Q5 – eksport (dodaj tabelę, podziel ranking, usuń stronę, pobierz zestaw na telefonie).

---

## 5. Otwarte (nie blokuje fali Q1)
- Czy „Podziel stronę” ma też dzielić mapę (np. województwa na dwie strony)? Domyślnie: nie.
- ZIP przy „Pobierz wszystkie” (nowy pakiet) – domyślnie nie (D-Q4).
- Przeciąganie stron w pasku – domyślnie później, na start strzałki.
