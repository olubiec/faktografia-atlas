# RESEARCH-1 – porównanie Atlasu z podobnymi serwisami
Data: 16.11.2026 · Autor: Claude (research, zero zmian w kodzie) · Status: poczekalnia (do decyzji Planisty/właściciela)

Punkt odniesienia: `docs/PRODUKT.md` v3 (mapa w kolorach wskaźnika, profil miejsca z rankingiem, porównanie dwóch miejsc, link do każdego widoku, karty PNG i CSV, telefon jako główne urządzenie) i `docs/INSPIRACJE.md` (strony bez wolnej licencji = tylko inspiracja układu, zasada 6).

**Metoda i zastrzeżenie.** Krótki przegląd (limit czasu ok. 15 min): wyszukiwarka + opisy producentów (Eurostat, GUS) oraz znajomość serwisów z wcześniejszego użytkowania. Funkcje oznaczone „(do potwierdzenia)” trzeba sprawdzić na żywej stronie przed zamienieniem w zadanie. Nie mierzono wydajności narzędziami (Lighthouse) – oceny wydajności są jakościowe.

## 1. Tabela porównawcza

| Serwis | Co robi lepiej od nas | Co my mamy lepiej |
|---|---|---|
| **GUS – Portal Geostatystyczny** (geo.stat.gov.pl) i **BDL** (bdl.stat.gov.pl) | Pełny zakres wskaźników i lat, poziom do gminy/obrębu, oficjalność, metadane (definicje, przypisy), eksport XLSX/CSV, API | Szybkość pierwszego wyświetlenia, mapa w kolorach od wejścia, telefon, prosty język (§6), link do widoku, ranking „najwyżej/najniżej”, karty do udostępnienia |
| **GUS – Portret samorządowy / SVS** (statystykaregionalna.stat.gov.pl) | Gotowe „portrety” JST z tabelami i wykresami w jednym miejscu, rankingi statystyczne wg grup gmin (miejskie/wiejskie) | Mapa jako punkt wejścia, porównanie dwóch miejsc na jednym ekranie, płynne wejście w głąb (§5a), czytelność na telefonie |
| **Polska w liczbach** (polskawliczbach.pl, projekt niezależny) | Bardzo dobre SEO: osobna strona dla każdej miejscowości/gminy, ruch z Google na frazy „<gmina> liczba ludności”; dużo tekstu opisowego | Interaktywna mapa i ranking zamiast długich stron, brak reklam, spójny wygląd, dane wprost z robota GUS, objaśnienia |
| **Eurostat – Regions and Cities Illustrated** + aplikacja **My Region** | Mapa + 4 widoki obok (rozkład, wykres punktowy, słupki, tabela); animowana oś czasu; osobna lekka aplikacja mobilna do porównania 3 regionów | Szczegółowość do gminy (Eurostat kończy na NUTS3 ≈ podregiony), polski język, karty PNG, prostszy interfejs na telefonie |
| **Our World in Data** (grapher) | Każdy wykres ma zakładki Mapa / Wykres / Tabela / Źródła, pobieranie PNG/SVG/CSV, link z całym stanem, osadzanie (`embed`), animacja w czasie, wybór wielu jednostek do linii, sekcja „Źródła i przetwarzanie” | Lokalność (gminy), profil miejsca, wejście z mapy, polskie objaśnienia; OWID nie ma poziomu poniżej kraju dla Polski |
| **US Census – data.census.gov / Census Business Builder / „Explore Census Data”** | Profil każdej jednostki z porównaniem do stanu i kraju, „margin of error” przy wartościach, wyszukiwanie po adresie/kodzie pocztowym, eksport tabel | Prostota (Census jest przeładowany i słaby na telefonie), szybkość, mapa w kolorach od wejścia |
| **Data USA** (datausa.io) | Profil jako opowieść: zdania generowane z danych („Gmina X ma medianę wieku 41 lat, więcej niż 80% gmin w województwie”), sekcje tematyczne z kotwicami, przyciski „udostępnij/osadź/pobierz” przy każdym wykresie, wyszukiwarka jako główne wejście | Mapa wyboru jako centrum, szybsze ładowanie (Data USA jest ciężkie), porównanie dwóch miejsc, dostosowanie do PL |
| **Datawrapper** (narzędzie, nie atlas) | Dostępność: opis alternatywny wykresu, tabela danych pod mapą dla czytników ekranu, wzorce zamiast samego koloru, kontrola kontrastu palet, wersja statyczna dla RSS/PDF; responsywne mapy z legendą nad mapą na telefonie | Nie jest narzędziem dla odbiorcy – nie ma eksploracji, profilu, rankingów; my mamy cały ekran eksploracji |

Wspólne obserwacje:
- **Wyszukiwanie** jest głównym wejściem w Data USA, Census i Polsce w liczbach (tolerancja literówek, wyniki z typem jednostki i województwem). U nas jest `Ctrl K`; warto sprawdzić tolerancję polskich znaków („lodz” → „Łódź”) i rozróżnienie gmina miejska/wiejska o tej samej nazwie.
- **Udostępnianie** u liderów (OWID, Data USA) to: link ze stanem + PNG + CSV + osadzenie (`iframe`). My mamy trzy pierwsze w planie (§4b); osadzenia nie mamy.
- **Dostępność** u liderów: tabela danych jako alternatywa mapy, opis słowny klas legendy, obsługa klawiatury mapy. My mamy opis słowny legendy (§3) i pola 44 px; tabeli alternatywnej i opisu mapy dla czytnika nie widać w PRODUKT.md.
- **Wydajność**: serwisy GUS i Census ładują się wolno i ciężko działają na telefonie; to nasza główna przewaga i warto jej pilnować progami z §7.

## 2. Dziesięć najlepszych pomysłów

Priorytet: P1 = zrobić w najbliższej fali, P2 = następna, P3 = później. Nakład: S (do 1 dnia pracy agenta), M (2–3 zadania), L (sesja). Ryzyko: co może pójść źle.

| # | Pomysł | Wzór | Priorytet | Nakład | Ryzyko |
|---|---|---|---|---|---|
| 1 | **Zdania z danych w profilu** – 2–3 zdania generowane w `src/core` z gotowych liczb („Gęstość w gminie X: 112 os./km², 3. miejsce w powiecie, wyżej niż 74% gmin w Polsce”). Szablony, bez AI. | Data USA | P1 | M | Błędna odmiana nazw/liczebników po polsku; trzeba testów na fixture'ach. Zgodne z zakazem „liczb przez AI”, bo to tylko szablony. |
| 2 | **Tabela jako alternatywa mapy** – przycisk „Pokaż jako tabelę” (sortowalna lista jednostek bieżącego poziomu z wartością i miejscem); dla czytników ekranu i dla telefonu. | OWID, Datawrapper | P1 | M | Długa lista gmin (~2500) – wymaga wirtualizacji (`@tanstack/react-virtual` już zweryfikowany w INSPIRACJE). |
| 3 | **Odniesienie „na tle”** – przy wartości w dymku i profilu pokazać medianę województwa i Polski (mały pasek z kropką). | Census profiles, Data USA | P1 | S | Mediana musi pochodzić z `public/data` (robot), nie liczona inaczej na stronie; ustalić, gdzie liczona. |
| 4 | **Wyszukiwarka odporna na polskie znaki i dwuznaczności** – „lodz”, „zielona gora”; wynik z typem i województwem („Brzeg – gmina miejska, opolskie”); ostatnio oglądane. | Polska w liczbach, Data USA | P1 | S | Zmiana zachowania istniejących testów wyszukiwania – sprawdzić, czy nie trzeba ich ruszać (zasada AGENTS). |
| 5 | **Osadzanie widoku (`embed`)** – adres `/embed?...` z samą mapą/kartą i linkiem „Zobacz w Atlasie”; kod `iframe` do skopiowania. Dla dziennikarzy i samorządów. | OWID, Datawrapper | P2 | M | Nagłówki `frame-ancestors` w `vercel.json` (zmiana konfiguracji = decyzja właściciela); obciążenie Vercel Hobby. |
| 6 | **Statyczne podstrony gmin pod SEO** – generowane przy budowaniu (nazwa, 5 kluczowych liczb, link do mapy), `sitemap.xml`, karty OG. | Polska w liczbach | P2 | L | Czas budowania i limit plików na Vercel; INSPIRACJE ma `satori` (MPL-2.0) i odrzucony `vite-plugin-sitemap` – potrzebny nowy sprawdzony element. |
| 7 | **Odtwarzanie lat („play”)** przy suwaku roku – animacja zmian kolorów rok po roku, z pauzą; wyłączona przy `prefers-reduced-motion`. | Eurostat RCI, OWID | P2 | S | Pobieranie wielu plików naraz łamie progi §7 – odtwarzać tylko lata już w jednym pliku wskaźnika. |
| 8 | **Wykres punktowy dwóch wskaźników** – „czy gęstsze gminy mają wyższe dochody?”, kropka = jednostka, klik = profil. | Eurostat RCI (scatter) | P3 | L | Drugi plik danych na raz (próg §7); ryzyko mylenia korelacji z przyczyną – potrzebny dopisek w objaśnieniu. |
| 9 | **Zakładka „Źródło i metoda”** przy wskaźniku – kod zmiennej BDL, data pobrania przez robota, link do tabeli BDL, zmiany granic/definicji. | OWID („Sources and processing”) | P2 | S | Treść musi być w pliku objaśnień (§6), nie wpisana w kod; ryzyko nieaktualnych opisów. |
| 10 | **Wejście „Moja okolica”** – przycisk lokalizacji (za zgodą przeglądarki, bez zapisu) zaznacza gminę użytkownika na telefonie. | Census (szukaj po adresie), aplikacje mobilne Eurostatu | P3 | M | Prywatność i zgoda (dotyka zasad `consent`); geolokalizacja niedokładna na granicach gmin; wymaga lokalnego sprawdzenia punktu w poligonie bez usług zewnętrznych. |

## 3. Czego NIE przenosić
- Długich stron tekstu z reklamami (Polska w liczbach) – sprzeczne ze stylem i wydajnością.
- Przeładowanych formularzy filtrów (data.census.gov, BDL) – nasz odbiorca to „minuta z telefonu” (§2).
- Generowania tekstów przez AI w stylu „AI summary” – zakaz w PRODUKT.md; pomysł 1 tylko jako szablony.

## 4. Proponowane następne kroki
1. Planista: wybrać pomysły P1 (1–4) i rozpisać jako zadania `tasks/W<fala>-*.md` z warunkami „Gotowe, gdy”.
2. Przed pomysłami 5, 6, 10 – decyzja właściciela (konfiguracja, nowe elementy, zgoda).
3. Dopisać do `docs/INSPIRACJE.md` (wiersz „strony, nie kod”, status `do przejrzenia`): OWID grapher, Data USA, Eurostat RCI, Datawrapper – tylko jako inspiracja układu (zasada 6). OWID ma kod na licencji MIT (do weryfikacji w trybie WERYFIKACJA).

## Źródła
- [Polska w liczbach](https://polskawliczbach.pl/)
- [GUS – Portret samorządowy (Statystyka regionalna)](https://statystykaregionalna.new.stat.gov.pl/en/portret-samorzadowy)
- [GUS – inne opracowania zbiorcze (BDL, Portal Geostatystyczny)](https://stat.gov.pl/obszary-tematyczne/inne-opracowania/inne-opracowania-zbiorcze)
- [data.europa.eu – Eurostat Regions and Cities Illustrated (use case)](https://data.europa.eu/en/publications/use-cases/eurostat-regions-and-cities-illustrated-rci)
- [Eurostat – Compare regions and cities easily (2019)](https://ec.europa.eu/eurostat/web/products-eurostat-news/-/edn-20191008-2)
- [Eurostat – Regions visualisations](https://ec.europa.eu/eurostat/web/regions/visualisations)
- [ESPON – prezentacja narzędzi Eurostatu (My Region)](https://archive.espon.eu/sites/default/files/attachments/Muller_Oliver_-_EUROSTAT_Tools_1.pdf)
- Our World in Data, data.census.gov, datausa.io, datawrapper.de – opis z wcześniejszego użytkowania (do potwierdzenia na żywych stronach).
