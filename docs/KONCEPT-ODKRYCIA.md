# Odkrycia – koncepcja (propozycja v0 · 22.11.2026)

Status: **propozycja do decyzji właściciela** (§13). Do czasu decyzji obowiązuje `docs/PRODUKT.md` §3.1 („Przykłady: 6 miejsc i 6 par”).
Zakres: miejsce pod przyciskiem „Otwórz mapę” na stronie startowej + to, co z tego wynika dla stron miejsc, SEO i robota danych.

## 0. Werdykt (5 zdań)
1. Problem jest realny: strona odpowiada dobrze na pytanie, które użytkownik już ma, a nie daje mu pytania. Mapa i wybór wskaźnika wymagają wiedzy „czego szukam”, a „Przykłady” to nazwy miejsc bez obietnicy treści (nic nie mówi, *co* zobaczę po kliknięciu).
2. Rozwiązanie: **silnik faktów** – robot liczy dla każdej z 2 859 jednostek (380 powiatów + 2 479 gmin) krótkie, sprawdzalne fakty (skrajności, zmiany, odchylenia od sąsiadów, przełomy), a strona pokazuje je jako karty „jedno zdanie + jedna liczba + jedno kliknięcie do mapy”.
3. Prototyp na danych z repo: przy samych skrajnościach krajowych ciekawy fakt ma tylko ~25% jednostek (przeciętna gmina jest przeciętna); po dodaniu ram „województwo”, „sąsiedzi” i „własna historia” – **≥ 3 fakty ma 93,5% jednostek, ≥ 1 fakt – 99,5%** (pomiar §2).
4. „Artykuły” i „newsy” – tak, ale **bez AI i bez cudzych tekstów**: zdania ze stałych szablonów i liczb GUS, wpięte w strony miejsc (fala SEO S-2), plus ok. 25 stałych „zestawień” i strona „Nowe dane GUS” przy każdej aktualizacji robota. Masowe generowanie tysięcy osobnych „artykułów” odrzucam (ryzyko kary Google za „scaled content”, §8).
5. Lokalizacja: bez IP i bez serwera. Użytkownik wybiera miejsce szukajką albo przyciskiem „Użyj mojej lokalizacji” (liczone w przeglądarce, współrzędne nigdzie nie wychodzą); wybór zapamiętany lokalnie. Kolejność budowy: po fali SEO S-2 (§12).

## 1. Diagnoza
- **Wysoki próg wejścia.** Ścieżka dziś: Otwórz mapę → wybierz dane (20 wskaźników w 7 grupach) → dotknij miejsca → profil. Użytkownik musi wiedzieć, *który* wskaźnik jest ciekawy dla *jego* miejsca. Nie wie – a my wiemy (mamy wszystkie liczby i rankingi).
- **Brak „zapachu informacji”.** Kafel „Wałcz” nie mówi, po co klikać. Kafel „Wałcz: najwięcej samochodów na 1000 osób w województwie” – mówi.
- **Brak powodu do powrotu.** Treść startu jest stała. Dane GUS zmieniają się kilka razy w roku – to jest naturalny „news”, którego dziś nie pokazujemy.
- **SEO:** strony miejsc z fali S-2 będą miały tabele liczb – to samo, co ma konkurencja (Polska w liczbach, BDL, Wikipedia). Fakty porównawcze (sąsiedzi, przełomy, „podobna gmina”) to treść, której tam nie ma.

## 2. Co mówią dane (pomiar na `public/data` z 22.11.2026)
Skrypt-prototyp (poza repo) przeszedł po `profiles/*.json`, `units.json`, `admin.topo.json`. Wyniki:

| Rama faktu | Ile jednostek ma ≥ 1 taki fakt | Uwagi |
|---|---|---|
| Skrajność w Polsce (1% górny/dolny w swoim poziomie) | ~25% (≥ 2 fakty: 14%) | 45% jednostek nie ma żadnej skrajności krajowej |
| Miejsce 1–3 lub ostatnie 3 w województwie (≥ 15 jednostek) | 4 129 faktów | |
| Najwyżej/najniżej spośród siebie i sąsiadów (≥ 4 sąsiadów) | 83% jednostek; ≥ 3 fakty: 57% | sąsiedzi z `admin.topo.json` (wspólna granica), mediana 6 sąsiadów |
| Rekord *względny* (najdalej od mediany kraju w całej serii, odchylenie > 15%) | 7 705 faktów | rekord *bezwzględny* jest bezwartościowy: 15 199 „rekordów”, bo płace i auta rosną wszędzie |
| Razem (kraj + województwo + rekord względny) | ≥ 3 fakty: 71% | |
| Razem + sąsiedzi (przy < 4 sąsiadach – sąsiedzi sąsiadów) | **≥ 3 fakty: 93,5%; ≥ 1: 99,5%** | 14 jednostek bez faktu → F9 „typowość” |

Pułapki wykryte w prototypie (muszą być w regułach, inaczej powstaną fałszywe „sensacje”):
1. **Zmiany granic.** 166 skoków powierzchni (ludność ÷ gęstość) > 3% rok do roku, np. Opole +54% (2017, przyłączenie sołectw), Dobrzeń Wielki −30% (2017), Zielona Góra (2015, połączenie z gminą), Supraśl −34% (2025). Naiwny detektor podaje „Supraśl stracił 44% mieszkańców w 10 lat” – to nieprawda o ludziach, to zmiana granic. Reguła: okno z takim skokiem wyklucza fakty o zmianie liczby osób i wskaźników bezwzględnych; zamiast tego można pokazać fakt „zmiana granic w roku X” (tylko jeśli właściciel zechce, §13).
2. **Błędy pojedynczych lat** (np. Hel: skok powierzchni +316% w 2023 – artefakt w danych). Ta sama reguła je łapie.
3. **Małe gminy i wskaźniki „na 1000”.** W gminie z 1 883 mieszkańcami (Przytuły) 5 nowych mieszkań zmienia wskaźnik dramatycznie. Reguła: dla jednostek < 5 000 mieszkańców wskaźniki „na 1000/na 10 tys.” liczone ze średniej 3 lat albo pomijane w skrajnościach.
4. **Obwarzanki.** Miasto Wałcz ma jednego sąsiada: gminę wiejską Wałcz. Reguła: przy < 4 sąsiadach rama „sąsiedzi” bierze sąsiadów sąsiadów; nazwy zawsze z rodzajem („miasto Wałcz”, „gmina wiejska Wałcz”).
5. **Trywialne rekordy** (patrz tabela) – tylko rekordy względem kraju.

Przykłady faktów z prototypu (prawdziwe liczby, rok 2025):
- Kleszczów: najwyższe w Polsce dochody budżetu gminy na mieszkańca – 35 169 zł (1. z 2 479); u 7 sąsiadów od 9 696 do 22 981 zł.
- Kleszczów: najmniejszy udział osób 65+ wśród sąsiadów – 12,5% (sąsiedzi: 16–23,3%).
- Przytuły: 0% ludności korzysta z sieci kanalizacyjnej; u 5 sąsiadów od 25% do 46%.
- Stawiguda: ludność +97% w 10 lat – najszybszy wzrost wśród gmin w Polsce (bez zmian granic w tym okresie).

## 3. Fakt – definicja i katalog
**Fakt** = rekord danych (nie tekst): `{ typ, teryt, wskaźnik, rok, wartość, rama, porównanie, siła }`. Tekst powstaje w kodzie ze **stałego szablonu** (ten sam w aplikacji i na stronach statycznych). Każdy fakt ma liczbę i rok. Zero przyczyn („bo zbudowano fabrykę”) – dane GUS ich nie zawierają.

| Typ | Reguła (domyślna, do strojenia testem) | Szablon (przykład) |
|---|---|---|
| F1 Skrajność w Polsce | 1% górny/dolny w swoim poziomie (gminy z gminami, powiaty z powiatami) | „Najwyższe w Polsce dochody budżetu na mieszkańca: 35 169 zł (2025).” |
| F2 Skrajność w województwie | miejsce 1–3 lub 3 ostatnie, gdy ≥ 15 jednostek | „3. miejsce w małopolskim pod względem nowych mieszkań na 1000 osób.” |
| F3 Na tle sąsiadów | wartość poza zakresem wszystkich sąsiadów (≥ 4) | „Najmniej osób 65+ spośród 8 gmin dookoła: 12,5% (u sąsiadów 16–23,3%).” |
| F4 Wyjątkowa zmiana 10 lat | zmiana w 2% górnych/dolnych w poziomie, okno bez zmiany granic | „Ludność +97% od 2015 r. – najszybszy wzrost w Polsce.” |
| F5 Rekord względny | wartość najdalej od mediany kraju w całej serii, odchylenie > 15% | „Bezrobocie najniższe względem średniej kraju od początku danych (2004).” |
| F6 Odwrócenie trendu | ≥ 5 lat spadku, potem ≥ 3 lata wzrostu (lub odwrotnie), na średniej kroczącej | „Po 9 latach spadku liczba mieszkańców rośnie od 2022 r.” |
| F7 Przegonienie | w roku X jednostka przekroczyła średnią województwa/kraju albo sąsiada-stolicę powiatu | „Od 2021 r. przeciętna płaca wyższa niż średnia województwa.” |
| F8 Bliźniak | najbliższa jednostka w innym województwie wg wektora ~10 wskaźników (standaryzowanych) | „Najbardziej podobna gmina w Polsce: X (woj. Y). Porównaj →” |
| F9 Typowość | brak F1–F8 → wskaźniki najbliżej mediany kraju | „Pod względem płac, wieku i bezrobocia – blisko środka Polski.” |

F1–F5 są zmierzone w §2. F6–F9 są projektowe – pierwszy PR silnika mierzy ich liczność tak jak w §2, zanim zostaną włączone.

Zasady tekstu: słowa „najwyższy/najniższy”, nie „najlepszy/najgorszy”, nawet przy `higherIsBetter`; bez wykrzykników i ocen; zaokrąglenia formatem z `src/core/format`; miejsce w rankingu zawsze „z N”; przy remisach „ex aequo”.

## 4. Który fakt pokazać – ranking ciekawości
`siła = rzadkość × waga ramy × waga wskaźnika × świeżość`, potem dobór z różnorodnością.
- **Rzadkość:** −log(percentyl skrajności) (1 z 2 479 ≫ 3 z 20).
- **Waga ramy:** kraj 1,0 · zmiana 10 lat 0,9 · województwo 0,7 · sąsiedzi 0,7 · przełom/przegonienie 0,6 · rekord względny 0,5 · typowość 0,2.
- **Waga wskaźnika** (rozpoznawalność tematu): ludność, płace, bezrobocie, mieszkania, dochody gminy – 1,0; wiek, migracje, przedszkola – 0,8; pozostałe – 0,6. Wagi w `config/facts.json` (zmienialne bez kodu).
- **Świeżość:** fakt o ostatnim roku 1,0; starszy 0,7.
- **Różnorodność:** najwyżej 1 fakt na wskaźnik i 2 na grupę wśród pokazanych 3.
- **Gwarancja:** każda jednostka ma ≥ 3 fakty (F9 jako ostatnia deska); test sprawdza to dla wszystkich 2 859.

## 5. Lokalizacja – co rozważyłem
| Sposób | Ocena |
|---|---|
| Lokalizacja z IP (nagłówki Vercel) | **Nie.** Wymaga funkcji serwerowej (zmiana architektury), w Polsce sieci komórkowe często dają „Warszawa” – fakt o złym miejscu jest gorszy niż brak faktu. |
| `navigator.geolocation` w przeglądarce, na przycisk | **Tak.** Współrzędne zostają w telefonie; gminę znajduje sprawdzenie punktu w granicach z `admin.topo.json` (i tak pobierany jako rozgrzewka mapy). Potwierdzenie: „Twoja gmina: X. Zmień”. |
| Szukajka miejscowości (już istnieje, 5,5 MB `localities.json` ładowane leniwie) | **Tak, główna droga.** Miejscowość → jej gmina. |
| Zapamiętanie wyboru (`localStorage`, sam TERYT) | **Tak.** To funkcja na życzenie użytkownika, nie śledzenie; zapis w polityce prywatności. Wymaga zgody właściciela (§13), bo dotyka zasad zgody. |

## 6. Strona startowa – nowy układ miejsca „Przykłady”
Zostaje: obrys Polski, „Sprawdź swoją miejscowość i okolicę.”, trzy kroki, „Otwórz mapę”. Zmienia się sekcja pod spodem (na zrzucie właściciela).

**Stan A – nie wiemy, gdzie jesteś (pierwsza wizyta):**
1. **„Twoje miejsce”** – pole „Wpisz miejscowość” + przycisk „Użyj mojej lokalizacji” (≥ 44 px).
2. **„Odkrycie dnia”** – 1 duża karta z faktem krajowym (F1/F4, rotacja deterministyczna po dacie z puli ~700 najsilniejszych; ta sama karta dla wszystkich danego dnia → można się nią dzielić). Przycisk „Zobacz na mapie” otwiera mapę z tym wskaźnikiem, rokiem i jednostką.
3. **„Zestawienia”** – 4 karty z listami (np. „Gminy, które urosły najbardziej w 10 lat”, „Najmłodsze gminy”, „Gdzie najwięcej nowych mieszkań”, „Najwyższe dochody gmin”). Każda karta = 3 pierwsze pozycje + link do strony rankingu (S10).
4. Dotychczasowe pary do porównania – zostają jako jedna zwinięta linia „Porównaj: Warszawa vs Kraków · …” albo znikają (decyzja §13).

**Stan B – znamy miejsce (wybrane teraz lub zapamiętane):**
1. **„Gmina X – 3 rzeczy, których mogłeś nie wiedzieć”** – 3 karty faktów (§4). Karta: zdanie, duża liczba, mały pasek porównania (ty vs sąsiedzi / kraj), „Zobacz na mapie →”. Jedno kliknięcie = mapa z właściwym wskaźnikiem i zaznaczoną gminą.
2. **„Twoja okolica”** – 1 fakt F3 + link „Porównaj z sąsiadem” (gotowy widok porównania).
3. **„Twój bliźniak”** – F8, link do porównania.
4. Niżej „Odkrycie dnia” i „Zestawienia” jak w stanie A. Link „Zmień miejsce”.

Klikalność: każdy fakt to dokładnie 1 kliknięcie do mapy (wymóg odbioru B15: zadanie f = 1 kliknięcie – ten układ go spełnia także dla treści, nie tylko nawigacji).
Bez JavaScriptu i przy `prefers-reduced-motion`: karty statyczne, „Odkrycie dnia” z ostatniego budowania.

## 7. „Artykuły” i „newsy” – zimna ocena
| Pomysł | Werdykt | Dlaczego |
|---|---|---|
| Zbieranie lokalnych newsów z portali (RSS, scraping) | **Nie** | Prawo wydawców prasy (nowelizacja prawa autorskiego, w mocy od 20.09.2024) – fragmenty tekstów wymagają licencji; poza tym cudza treść nie buduje pozycji naszej domeny i wymaga moderacji. |
| Artykuły pisane przez AI | **Nie** | Zakazane w `PRODUKT.md` („liczby wpisywane przez AI”); Google karze masową treść generowaną dla rankingu (polityka „scaled content abuse” od 03.2024). |
| Osobny „artykuł” dla każdej gminy | **Nie** | 2 479 szablonowych artykułów + 2 479 stron miejsc = duplikacja i ryzyko kary. Fakty idą **do strony miejsca** (S06 `lead`), jedna strona na miejsce. |
| **Zestawienia** (ok. 25 stron, np. „Najszybciej rosnące gminy w Polsce 2025”) | **Tak** | Odpowiadają na realne zapytania („najbogatsze gminy”, „wyludniające się gminy”) i są cytowane przez media – zestawienia to najlepszy magnes na linki z zewnątrz (`SEO.md` §6). Tworzone szablonem, tekst wstępu ze stałych zdań, aktualizacja raz w roku. |
| **„Nowe dane GUS”** – strona przy każdej aktualizacji robota | **Tak, z akceptacją człowieka** | Robot wykrywa nowy rok wskaźnika i tworzy PR ze stroną: „GUS opublikował dane o płacach za 2025: największe wzrosty, spadki, rekordy”. Właściciel scala po obejrzeniu podglądu → zero ryzyka błędnej „sensacji”. Ok. 15–25 stron rocznie. |
| „Gorące tematy okolicy” | **Tak, jako kalendarz tematów** | Bez zewnętrznych źródeł nie wiemy, o czym mówi okolica. Wiemy, co jest gorące w Polsce cyklicznie: styczeń – płace, wiosna – budżety gmin, czerwiec–sierpień – turystyka (noclegi), wrzesień – przedszkola, cały rok – mieszkania i wyludnianie. `config/facts.json` ma kalendarz: w danym miesiącu fakty z tematu miesiąca dostają mnożnik 1,5. Właściciel może dopisać temat ręcznie (np. po głośnej sprawie w mediach) – bez kodu. |
| Quiz „Zgadnij” (np. „gdzie wyższe bezrobocie: A czy B?”, „narysuj, jak zmieniała się ludność Twojej gminy”) | **Później, warunkowo** | Wzorzec o wysokim zaangażowaniu w mediach, ale to nowa funkcja wbrew zasadzie prostoty. Budować tylko, jeśli pomiar po F-1/F-2 (§11) pokaże, że ludzie klikają fakty. |

## 8. SEO (Polska, 2026)
- **Odpowiedzi AI w Google (AI Overviews, tryb AI) i czatboty** cytują krótkie zdania z liczbą, rokiem i źródłem. Szablon faktu ma dokładnie tę formę – to bezpośrednio zwiększa szansę cytowania stron miejsc. Ruch z samych wyników „10 niebieskich linków” będzie spadał; cytowania i linki z mediów – nie.
- **Unikalność treści:** konkurencja (Polska w liczbach, BDL, Wikipedia) ma tabele. Zdania porównawcze („najwięcej w okolicy”, „bliźniak”, „po 9 latach spadku rośnie”) są nasze i różne dla każdej gminy – to odpowiedź na ryzyko „cienkich stron szablonowych”.
- **Linki wewnętrzne:** fakt F3 linkuje do sąsiadów, F8 do bliźniaka, zestawienia do stron miejsc – gęsta, sensowna sieć linków bez sztucznych bloków „zobacz też”.
- **Świeżość:** strony „Nowe dane GUS” + `lastmod` z daty danych (S07) dają sygnał aktualizacji uczciwie (tylko gdy dane się zmieniły).
- **Ryzyko:** gdy fakty na 2 000 stronach gmin będą zbyt podobne („3. miejsce w województwie…” × 2 000), Google je zignoruje. Dlatego: różnorodność typów (§4), gminy dalej `noindex` do decyzji D7, audyt S08 rozszerzony o test „ten sam szablon zdania na > 30% stron = ostrzeżenie”.

## 9. Architektura i budżety (zgodnie z `ARCHITEKTURA.md`)
- **Robot (GitHub Actions)**, nowy krok po `build-profiles`: `scripts/data/build-facts.mjs` → `public/data/facts/<WW>.json` (fakty jednostek województwa; szacunek 60–80 KB surowo, ~15 KB gzip) i `public/data/facts-start.json` (Odkrycie dnia na 30 dni + 4 zestawienia, ≤ 4 KB).
- **Logika** w `src/core/facts/` (czysta, Vitest): wykrywanie (F1–F9), siła, dobór, szablony zdań. Te same funkcje używa generator stron statycznych (S07) – jeden kod, dwa wyjścia.
- **Widok** w `src/view/start/` (nowe komponenty sekcji); `StartPage.tsx` – jedna podmiana sekcji. Pliki ekranu mapy bez zmian (deep link przez istniejący format `/mapa?u=…&i=…&y=…`).
- **Budżety startu (PRODUKT §3.1):** w pierwszych 3 s tylko `facts-start.json` (nowy próg ≤ 4 KB – wymaga dopisania do §7); `facts/<WW>.json` dopiero po wyborze miejsca lub z pamięci podręcznej przy zapamiętanym miejscu (jedno województwo = jeden plik, nie wszystkie).
- **Bezpieczeństwo:** fakty to dane, tekst składa React (bez `dangerouslySetInnerHTML`); strony statyczne przez `escapeHtml` (S07).
- **Zgoda/prywatność:** `localStorage` z jednym TERYT, geolokalizacja tylko na przycisk, nic nie wychodzi z urządzenia; kliknięcia faktów mierzone w PostHog tylko po zgodzie (jak dziś).

## 10. Ryzyka
| Ryzyko | Skutek | Zabezpieczenie |
|---|---|---|
| Fałszywa sensacja (zmiana granic, błąd GUS) | Utrata wiarygodności, sprostowania | Detektor skoków powierzchni (§2), średnie 3-letnie dla małych gmin, „Nowe dane GUS” z akceptacją człowieka, test na znanych przypadkach (Opole 2017, Zielona Góra 2015, Supraśl 2025). |
| Fakt odbierany jako ocena gminy („najgorsza”) | Skargi samorządów | Słownik neutralny (§3), test zakazanych słów. |
| Trywialność („płace rosną”) | Nuda – to, co właściciel chce usunąć | Tylko rekordy względne, waga ramy, przegląd 50 losowych gmin przez właściciela przed włączeniem (odbiór). |
| Zła gmina z geolokalizacji przy granicy | Fakt o sąsiedniej gminie | Sprawdzenie w granicach (nie najbliższy środek), potwierdzenie „To Twoja gmina?”. |
| Waga startu | Wolniejsza strona startowa | Próg 4 KB w teście CI; fakty jednostki leniwie. |
| Komplikacja produktu | Sprzeczne z „prostotą” | Zastępuje istniejącą sekcję (nie dodaje ekranu); każda karta ma jedno zadanie – jedno kliknięcie do mapy. |

## 11. Jak zmierzymy, czy działa
Punkt wyjścia mierzony przed zmianą (2 tygodnie): odsetek wejść na `/`, które przechodzą na `/mapa`; kliknięcia „Przykładów”. Po wdrożeniu (PostHog, tylko po zgodzie): kliknięcia kart faktów, wybór miejsca (szukajka vs lokalizacja), powroty w 7 dni, udostępnienia. W Search Console: wyświetlenia stron miejsc i zestawień, zapytania typu „najbogatsze gminy”. Próg sukcesu do ustalenia przez właściciela; propozycja: przejście start → mapa +30% względem „Przykładów”.

## 12. Plan fal (po fali SEO S-2, bo korzysta z modelu strony miejsca S06)
- **F-1 Silnik faktów (bez zmian na stronie):** `src/core/facts` (F1–F5 + F9, siła, dobór, szablony), `build-facts.mjs` w robocie, testy na fixture (w tym znane zmiany granic i obwarzanek), raport liczności jak w §2 w opisie PR. Odbiór: właściciel czyta 50 losowych zestawów faktów (lista w PR) i zaznacza nudne/błędne.
- **F-2 Start – stan A i B:** sekcje „Twoje miejsce”, „Odkrycie dnia”, „Zestawienia”; szukajka + zapamiętanie; deep linki; e2e „1 kliknięcie od faktu do mapy”; budżet 4 KB. Wymaga zmiany `PRODUKT.md` §3.1.
- **F-3 Fakty na stronach miejsc + zestawienia:** `lead` S06 bierze 3 najsilniejsze fakty; ~25 stron zestawień (rozszerzenie S10); F3 sąsiedzi i F8 bliźniak (potrzebują sąsiedztwa z `admin.topo.json` w robocie).
- **F-4 Nowe dane GUS + kalendarz tematów + geolokalizacja:** robot otwiera PR ze stroną zmian; `config/facts.json` z kalendarzem; przycisk „Użyj mojej lokalizacji”.
- **Później, warunkowo:** quiz „Zgadnij”, F6/F7 jeśli pomiar liczności je uzasadni.

## 13. Decyzje właściciela (domyślne w nawiasie)
1. Zmiana `PRODUKT.md` §3.1: „Przykłady” → „Odkrycia” (tak).
2. Pary do porównania na starcie: zostają zwinięte / znikają (znikają – zastępuje je „bliźniak” i „porównaj z sąsiadem”).
3. Zapamiętywanie miejsca w przeglądarce (tak, tylko TERYT).
4. Przycisk „Użyj mojej lokalizacji” (tak, w F-4).
5. Strony „Nowe dane GUS” tylko po Twojej akceptacji w PR (tak).
6. Fakt „zmiana granic w roku X” pokazywany jako ciekawostka (nie – tylko wykluczenie z faktów).
7. Lista ~25 zestawień – proponuje sesja F-3, Ty wybierasz (tak).
8. Kolejność: po S-2, przed S-3/S-4 (tak – zestawienia i fakty wzmacniają S10).

## 14. Czego nie robimy
Newsów z cudzych portali, tekstów i liczb z AI, lokalizacji z IP, kont i powiadomień, osobnego artykułu dla każdej gminy, ocen „najlepsza/najgorsza gmina”, przyczyn zjawisk, których nie ma w danych.
