# Plan uproszczenia – Faktografia (20.11.2026)
Ten plan idzie **przed wszystkimi** zadaniami z `tasks/poczekalnia/`. Powód: przebudowa wyklucza dużą część starych zadań. Najpierw badania i analizy (etap R), potem jedna synteza z krótką listą decyzji (etap D), na końcu krótka budowa (etap B).

## 0. Decyzje zatwierdzone przez właściciela (20.11.2026)
| # | Decyzja | Gdzie działa |
|---|---|---|
| D1 | Dwie mapy na telefonie: start od „jedna pod drugą”, rozstrzygnie praktyka na prototypie (U06 pokazuje oba układy). | U06, B09 |
| D2 | Niepobrane wskaźniki są ukryte w wyborze danych. Robot pobiera wg popularności i codziennie do limitu API (podstawowe i najczęściej potrzebne najpierw). | U04, **U11**, B05 |
| D3 | Strona Porównaj znika. Porównanie dwóch miejsc zostaje w profilu miejsca; dwa wskaźniki = druga mapa. | U01, B09, B11 |
| D4 | Stare linki (`/?u=…`, `/rankingi`, `/biblioteka`, `/porownaj`) działają dalej i przekierowują na `/mapa`. | B02, U08 |
| D5 | Skracamy `docs/STAN.md` do 110 linii (starsze wpisy do `STAN-ARCHIWUM.md`), testu nie zmieniamy. | U00 |
| D6 | Właściciel sam gubi się na stronie, więc jest testerem nr 0 (ma swoją sekcję w U02). Test z innymi osobami jest opcjonalny. | U02, B12 |
| D7 | Najpierw plan (ten dokument), potem start fali W22. | – |
| D8 | Tło strony startowej: badamy oba warianty: zmieniające się wskaźniki z animacją powiązaną z przybliżaniem albo jeden stały (np. liczba ludności). | U07 |
| D9 | „Pobierz i udostępnij” znika ze strony od razu (zostaje „Kopiuj link”); kod wraca z `?share=1`. | **U10** |

## 1. Cel w słowach właściciela
- **Prosto, bardzo prosto.** Dziś jest bałagan: za dużo ekranów, przycisków i funkcji, które robią to samo.
- **Strona startowa** na `/` tłumaczy koncept i daje krótką instrukcję. W tle jest animowana mapa Polski. Gdy nikt nic nie robi, rusza się losowo. Gdy rusza się mysz (lub palec), reaguje na nią. Animacja opiera się na aktualnych danych. Dopiero kliknięcie otwiera działającą mapę.
- **Nazwa:** samo „Faktografia”.
- **Jedno miejsce na dane = mapa.** Osobne Rankingi i Biblioteka dublują to, co jest w mapie, więc znikają jako osobne strony.
- **Bez „Moich wskaźników”.** Zamiast nich jest jeden wybór danych w stylu menu Biblioteki: pełny podział na kategorie i wyszukiwanie. Klikasz kategorię i wchodzisz w dane.
- **Dwie mapy obok siebie:** dwa różne wskaźniki zestawione ze sobą.
- **Zmiana widoku:** mapa ↔ wykres ↔ tabela ↔ ranking (różne sposoby pokazania tych samych danych), na jednej prostej bibliotece wykresów.
- **„Pobierz i udostępnij” na razie wycofane.** Nie poświęcamy na to czasu.

## 2. Jak może wyglądać strona po przebudowie (hipoteza do sprawdzenia w etapie R)
```
/            Strona startowa: animowana mapa w tle, 1 zdanie „co to jest”, 3 kroki „jak używać”, przycisk „Otwórz mapę”
/mapa        Jeden ekran pracy:
             [ Wybierz dane ▾ ]  (kategorie › wskaźnik + szukaj)
             [ Mapa | Wykres | Tabela | Ranking ]   [ + Druga mapa ]
             Poziom: Woj / Pow / Gmi · Rok
             Klik w miejsce → krótki profil miejsca
Stopka       O projekcie · Źródła · Prywatność
```
Menu ma 2 pozycje (Start, Mapa) i szukajkę miejsca. Tyle.

Do weryfikacji w badaniach (kierunek zatwierdzony, sprawdzamy koszt i szczegóły):
- `/rankingi` → `/mapa?v=ranking`;
- `/biblioteka` → `/mapa` z otwartym wyborem danych;
- `/porownaj` → `/mapa` z drugą mapą (decyzja D3: porównanie dwóch miejsc zostaje w profilu miejsca);
- stare linki `/?u=…&i=…` przekierowują na `/mapa?…`.

## 3. Co zatrzymujemy od razu
- **Wstrzymane (przeniesione do `tasks/wstrzymane/`):** wszystko z „Pobierz i udostępnij”: W4-QU01, W4-QU02, W5-QU10, W5-QC915, W6-QC804, W6-QC917, W7-QC918, W7-QC919, W7-QC920, W18-P05. Przycisk znika ze strony od razu (zadanie U10, jedna krótka sesja); kod okna zostaje i wraca z `?share=1`. Ostateczny los kodu rozstrzyga etap D.
- **Zamrożone do syntezy (U09):** wszystkie pozostałe pliki w `tasks/poczekalnia/`. Po etapie R każdy plik dostaje werdykt „zostaje / zmienić / skreślić”. Przewidywane skreślenia to zadania o Rankingach jako stronie, Bibliotece jako stronie i „Moich wskaźnikach”. Przykłady: QU11, QU12, QU14, QU15, QU16, QC205, QC507, QC509, QC608, QC609, QC611, QC806. Część W17, W18, W20 i W21 też może wypaść.
- **Wyjątek: zdrowie `main`.** Czerwone testy po W4 i niedokończone FIX7 trzeba zamknąć, żeby badania i budowa nie dziedziczyły błędów (zadanie U00).

## 4. Etap R – badania, analizy, testy i dwie małe zmiany (11 sesji, równolegle)
Każda sesja kończy się raportem w `docs/research/u/U<nn>.md`. Na ekranach nic się nie zmienia, z jednym wyjątkiem: prototypy idą tylko pod `/__test/proto/<nazwa>` (jeden plik w `src/view/test/proto/`, trasa powstaje sama). Każdy raport kończy się sekcjami **„Rekomendacja”** i **„Pytania do właściciela”** (najwyżej 3, z gotowymi odpowiedziami do wyboru). Pliki zadań: `tasks/poczekalnia/W22-U*.md`. Wspólne zasady wszystkich sesji: `docs/research/u/WYTYCZNE.md`; prompt startowy: `docs/prompty/START-W22.md`.

| Sesja | Co bada | Co właściciel dostaje | Czy coś widać na stronie |
|---|---|---|---|
| **U00** Zdrowie main | CI na `main` po W4: 3 czerwone e2e z QC403, zrzuty, FIX7 (#503). Naprawa albo jasna lista przyczyn. | Zielone `main` albo lista „co i dlaczego czerwone”. | Jeśli FIX7 wejdzie: na telefonie widać całą Polskę od startu. |
| **U01** Inwentarz funkcji | Lista wszystkich ekranów, okien, przycisków i tras: co robi, ile ma kodu i testów, co dubluje co (ranking w panelu i `/rankingi`, picker i Biblioteka, Porównaj, profil i `CompareMaps`, Moje wskaźniki). | Tabela „zostaje / scalamy / usuwamy” i koszt każdej zmiany (pliki, testy do zmiany). | Nie |
| **U02** Ścieżki użytkownika dziś | Aplikacja uruchomiona (Playwright, 390 px i 1280 px). 6 zadań typowej osoby, np. „jak wypada moja gmina w bezrobociu”, „porównaj dwa powiaty”, „znajdź dane o szkołach”. Mierzy liczbę kliknięć, ślepe zaułki i czas, robi zrzuty. Do tego scenariusz 5-minutowego testu z 3–5 znajomymi właściciela. | Liczby „przed” (punkt odniesienia) i kartka z zadaniami do testu z ludźmi. | Nie |
| **U03** Wzorce z innych serwisów | Our World in Data (przełącznik Mapa/Wykres/Tabela), Datawrapper, Eurostat Regions, Gapminder, portale GUS, USAFacts i strony startowe z animowanym tłem. Bierzemy pomysły, nie kod. | 3 wzorce do przejęcia i 3 błędy do uniknięcia, ze zrzutami lub opisami. | Nie |
| **U04** Jeden wybór danych | Katalog wskaźników (wbudowane i 2 377 pobranych z biblioteki): drzewo Dział › Grupa › Wskaźnik, ile poziomów, jak szukać (pakiet czy własne), co z niepobranymi (ukryć?). Test: 15 haseł, które wpisałby zwykły człowiek. | Proponowane drzewo kategorii, wynik testu haseł, szkic menu (telefon i komputer). | Prototyp pod `/__test/proto/wybor-danych` |
| **U05** Widoki danych i biblioteka wykresów | Porównanie: Observable Plot, visx, uPlot, Recharts, ECharts, własny SVG. Kryteria: rozmiar, licencja, telefon, dostępność, tokeny kolorów, data wydania i pobrania. Model adresu `?v=mapa\|wykres\|tabela\|ranking`. Co pokazuje każdy widok przy jednym wskaźniku, a co przy dwóch. | Rekomendacja jednej biblioteki (wpis do `ELEMENTY.md` po decyzji) i szkic 4 widoków. | Prototyp pod `/__test/proto/widoki` |
| **U06** Dwie mapy | Technika: dwie instancje MapLibre/deck.gl czy jedna z dwoma widokami, synchronizacja kamery, pamięć i klatki na telefonie. UX: wspólny rok i poziom? Klik w jedno miejsce zaznacza je na obu? Na telefonie góra/dół czy przełącznik? Alternatywa: wykres punktowy „wskaźnik A × wskaźnik B”. | Rekomendacja, pomiar wydajności, szkic układu. | Prototyp pod `/__test/proto/dwie-mapy` |
| **U07** Strona startowa | Bazuje na `docs/KONCEPT-STRONA-STARTOWA.md`. Wariant A (`/` startowa, `/mapa` mapa) wynika z decyzji właściciela. Bada lekką animację (SVG lub canvas, bez pełnej mapy WebGL): tryb losowy, gdy nic się nie dzieje, reakcja na kursor, kolory z aktualnych danych, telefon bez kursora, reduced-motion, wydajność. Treść: 1 zdanie o koncepcie i 3 kroki instrukcji. Przejście kliknięciem do `/mapa`. | Specyfikacja, budżety (rozmiar, klatki) i lista testów do zmiany przy przeniesieniu mapy na `/mapa`. | Prototyp pod `/__test/proto/start` |
| **U08** Testy i sprzątanie | Audyt 89 e2e i 221 testów jednostkowych: które są przywiązane do funkcji przewidzianych do usunięcia. Strategia: 6–8 nowych „testów ścieżek” jako strażnik przebudowy. Kolejność wycinania starych testów razem z funkcją. Lista zgód potrzebnych od właściciela. | Mapa testów „zostaje / do usunięcia z funkcją / do zmiany” i projekt testów ścieżek. | Nie |

| **U10** Ukryj udostępnianie | Jeden przełącznik `isShareEnabled()` (domyślnie wyłączony, włącza go `?share=1`) w 5 plikach z przyciskiem. Testy udostępniania: zmiana tylko sposobu włączenia. | Na stronie nie ma „Pobierz i udostępnij”; „Kopiuj link” zostaje. | **Tak**, w całej aplikacji |
| **U11** Robot biblioteki: priorytet i limit | Katalog: 172 740 zmiennych, 63 960 z powiatami lub gminami, pobrane 2 436 (3,8%), kolejność po numerze id. Nowa kolejka wg popularności (wagi działów, słowa kluczowe, płytkie rozbicia, gminy), limit udziału jednego działu w przebiegu, 2 × 3 000 zapytań na dobę (≈ 95% limitu 7-dniowego razem z nocnym robotem) i test przesuwnych okien limitu. | Raport z kolejnością i prognozą „ile wskaźników po 7 / 30 / 90 dniach”; w Actions tabela „co pobrano wg działów”. | Pośrednio: z dnia na dzień więcej podstawowych wskaźników w wyborze danych |

Kolejność: U00–U08, U10 i U11 idą równolegle (nie dzielą plików). Istniejące testy mogą zmieniać tylko U00 (miejsce kliknięcia w testach dotykowych, FIX7) i U10 (sposób włączania przycisku udostępniania); w obu przypadkach asercji nie wolno zmieniać, a zgoda właściciela jest zapisana w pliku zadania. U10 i U11 są małymi zmianami w kodzie lub robocie, a nie badaniami.

## 5. Etap D – synteza i decyzje (1 sesja + właściciel)
- **U09 Synteza** (`tasks/poczekalnia/W23-U09-synteza-plan-docelowy.md`), po scaleniu raportów U01–U08. Pisze `docs/PLAN-DOCELOWY.md`, który zawiera:
  - docelowy wygląd każdego ekranu, maksymalnie 1 strona na ekran;
  - **listę decyzji dla właściciela** (najwyżej 8 pytań, każde z rekomendacją);
  - werdykt dla każdego pliku z `tasks/poczekalnia/` i `tasks/wstrzymane/` (zostaje / zmienić / skreślić);
  - plan budowy: zadania etapu B z plikami, kolejnością i fal.
- Po odpowiedziach właściciela U09 (albo następna sesja) zapisuje pliki zadań etapu B. Nowa wersja `docs/PRODUKT.md` (v4) wchodzi w tym samym kroku.

## 6. Etap B – budowa (szacunek przed badaniami: ok. 12 sesji)
Liczby i kolejność potwierdzi U09. Każde zadanie kończy się czymś, co widać na podglądzie.

| Zadanie | Efekt na stronie |
|---|---|
| B01 Nazwa „Faktografia” | Wszędzie samo „Faktografia” (karta przeglądarki, stopka, podgląd linku). |
| B02 Nowe menu i trasy | Menu: Start, Mapa i szukajka. Stare adresy przekierowują w nowe miejsca. |
| B03 Strona startowa: animowane tło | `/` z animowaną mapą: rusza się losowo, reaguje na kursor. |
| B04 Strona startowa: treść i wejście | Koncept, 3 kroki, „Otwórz mapę” i płynne przejście do `/mapa`. |
| B05 Jeden wybór danych | Jedno menu: kategorie › wskaźnik i szukaj. Zastępuje picker, Bibliotekę i „Moje wskaźniki”. |
| B06 Przełącznik widoków + wykres | Nad mapą „Mapa / Wykres / Tabela / Ranking”. Działa wykres. |
| B07 Tabela | Widok tabeli z sortowaniem. |
| B08 Ranking | Widok rankingu w miejscu mapy (zastępuje stronę `/rankingi`). |
| B09 Druga mapa | Przycisk „+ Druga mapa”: dwa wskaźniki obok siebie (na telefonie wg U06). |
| B10 Profil miejsca uproszczony | Krótki profil po kliknięciu, bez zbędnych sekcji. |
| B11 Sprzątanie | Usunięte stare ekrany (Rankingi, Biblioteka, Porównaj, Moje wskaźniki) razem z ich testami, za zgodą właściciela. Przycisk udostępniania ukryty (wg decyzji D). |
| B12 Testy ścieżek i odbiór | 6–8 testów e2e całych ścieżek, porównanie liczb z U02 (przed/po), test z ludźmi. |

**Razem: 11 (R, razem z U10 i U11) + 1 (D) + ok. 12 (B) = ok. 24 sesje**, zamiast ok. 44 ze starego planu. Zadania wydajności (PM12, PM13, PM20, PM14) i strażniki (QC406, PC01) mogą zostać, jeśli synteza uzna, że nadal mają sens. Wtedy dochodzi kilka sesji.

## 7. Zasady prostoty (obowiązują w etapie B)
1. Jeden ekran pracy (`/mapa`). Nowa funkcja nie dostaje własnej strony.
2. Każdy element ma jedno zadanie. Jeśli dwa przyciski robią to samo, jeden znika.
3. Najwyżej 2 pozycje w menu i 4 widoki danych.
4. Nowa funkcja wchodzi tylko z testem ścieżki użytkownika, nie tylko „czy się renderuje”.
5. Usunięcie funkcji = usunięcie jej kodu i testów w tym samym PR, za zgodą właściciela zapisaną w zadaniu.
