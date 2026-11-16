# Koncepty rozwoju – Faktografia Atlas (propozycja product-strategist, 16.11.2026)

Podstawa: `docs/PRODUKT.md` (v3), `docs/ARCHITEKTURA.md` §3–§4 i „Później”, `docs/STAN.md` (28.10), `tasks/poczekalnia/PLAN-PUBLIKACJA.md`.
Pliki w `tasks/poczekalnia/` pętla Jules Loop ignoruje – to materiał do decyzji właściciela, nie kolejka.

**Zasady wspólne dla wszystkich konceptów** (z PRODUKT i AGENTS): tylko dane z `public/data` (bez API GUS z przeglądarki, bez liczb od AI), zero kont i śledzenia osób, progi szybkości z PRODUKT §7 (jedno żądanie na widok), licencja danych GUS CC BY 4.0 = źródło na każdym wyniku, nowy pakiet/usługa = wpis w `docs/ELEMENTY.md` i decyzja w prompcie.

Nakład: **S** = 1–2 zadania (jedna fala), **M** = 3–6 zadań, **L** = sesja (≥ 7 zadań, punkt kontrolny).

| # | Koncept | Dla kogo najbardziej | Nakład | Ryzyko prawne | Gotowe zadanie |
|---|---|---|---|---|---|
| 1 | „Co się zmieniło” – narracje z danych | mieszkaniec, dziennikarz | M | niskie | N-40 (logika) |
| 2 | Porównanie w czasie i wielu miejsc | samorządowiec, dziennikarz | M–L | niskie | – |
| 3 | „Nowe dane” – sygnał świeżości bez kont | wracający użytkownik | S–M | niskie / średnie (kanał RSS) | – |
| 4 | Tryb edukacyjny „Zgadnij, gdzie” | uczeń, nauczyciel | M | niskie | – |
| 5 | Osadzanie mapy i wykresu na stronach | lokalne media, gminy, blogi | M | średnie | N-42 (logika) |
| 6 | Karta „zmiana w czasie” do social | dziennikarz, samorządowiec | S | niskie | – |
| 7 | Offline / PWA „Atlas w kieszeni” | telefon, słaby zasięg | M | niskie | – |
| 8 | Wyszukiwanie naturalne (reguły, bez AI) | każdy | M | niskie | N-41 (logika) |

Proponowana kolejność: **8 → 1 → 6 → 5 → 3 → 2 → 4 → 7** (najpierw to, co skraca drogę do odpowiedzi z §2 PRODUKT; PWA na końcu, bo dotyka konfiguracji Vite i pamięci podręcznej).

---

## 1. „Co się zmieniło” – narracje z danych
**Cel użytkownika:** „Powiedz mi w trzech zdaniach, co ciekawego dzieje się w moim powiecie / w Polsce” – bez czytania tabel. Odpowiada na §2 pkt 1 i 3 PRODUKT.
**Szkic ekranu:**
- Profil → Przegląd, pod dużą liczbą: blok „Co się zmieniło” – 3 zdania generowane szablonem z danych, np. „Od 2015 r. liczba mieszkańców spadła o 6,2% – szybciej niż w 80% powiatów województwa.” Każde zdanie ma „Pokaż na mapie”.
- Panel wskaźnika (komputer) / arkusz (telefon): sekcja „Największe zmiany” – 5 jednostek z największym wzrostem i 5 ze spadkiem między pierwszym a ostatnim rokiem suwaka (obok istniejącego „Najwyżej / najniżej”).
- Teksty wyłącznie z szablonów w kodzie (bez AI, PRODUKT „Czego nie robimy”), liczby w formacie polskim, kolory neutralne.
**Dane:** `public/data/values/<id>.json` (`years`, `values` per TERYT) – już w pamięci po wyborze wskaźnika; w profilu `public/data/profiles/<woj>.json`. Zero nowych żądań.
**Ryzyka prawne/licencje:** dane CC BY 4.0 – zdania pokazujemy ze źródłem „GUS, BDL, lata X–Y”. Ryzyko merytoryczne: zmiana definicji/podziału terytorialnego (np. nowe gminy) → pomijamy jednostki z lukami w szeregu; zdanie zawsze z latami.
**Nakład:** M (logika – N-40; blok w panelu; blok w profilu – plik ekranu, wymaga zgody; test ścieżki).
**Testy akceptacyjne:**
1. Dla `density` i lat 2015→2025 lista „Największe zmiany” zawiera dokładnie 5 wzrostów i 5 spadków, posortowanych po zmianie procentowej; jednostki bez wartości w którymś z lat są pominięte (test jednostkowy na fixture).
2. Klik w pozycję listy wybiera jednostkę (ten sam stan co klik w „Najwyżej / najniżej”: `?u=` w adresie), bez nowego żądania `values/*`.
3. Zdanie w profilu zawiera oba lata, wartość procentową z przecinkiem dziesiętnym i nie wychodzi poza pole przy 360 px dla „Powiat kędzierzyńsko-kozielski”.

## 2. Porównanie w czasie i wielu miejsc
**Cel użytkownika:** „Jak mój powiat zmieniał się na tle sąsiadów i średniej województwa?” – rozszerzenie §4a (w „Później”: więcej niż dwa miejsca, dwa lata).
**Szkic ekranu:**
- Zakładka „Porównaj”: przełącznik „Dwa miejsca | W czasie”. „W czasie”: jeden wykres liniowy (SVG, istniejący TrendChart jako baza) z linią wybranego miejsca, mediany województwa i mediany Polski; do 4 dodatkowych miejsc (chipy z „×”).
- Mapa: tryb „Rok A vs rok B” – kolory = zmiana w p.p./% zamiast wartości; legenda rozbieżna (neutralna paleta z tokenów, bez zieleni/czerwieni).
- Adres: `?c=` przyjmuje do 5 TERYT; `?y2=` drugi rok.
**Dane:** `values/<id>.json` (całe szeregi) + `profiles/<woj>.json` (gdy miejsca z różnych województw – nadal ≤ 1 żądanie na nowe województwo, do opisania jako wyjątek od §7).
**Ryzyka prawne/licencje:** brak nowych elementów zewnętrznych. Zmiana `src/core/url/state.ts` = zmiana struktury adresu → decyzja właściciela (stare linki `?c=a,b` muszą działać).
**Nakład:** M–L (logika median, adres, wykres, tryb mapy, zrzuty SVG).
**Testy akceptacyjne:**
1. Link `?c=0201,0202` (stary format) otwiera to samo porównanie co dziś (test regresji e2e).
2. `?c=` z 5 TERYT pokazuje 5 linii + mediany; szósty TERYT jest ignorowany z komunikatem „najwyżej 5 miejsc”.
3. Tryb „Rok A vs rok B” dla `population` 2015/2025: jednostka bez wartości w 2015 ma kolor „brak danych”, legenda ma opis słowny klas.

## 3. „Nowe dane” – sygnał świeżości bez kont
**Cel użytkownika:** „Czy od mojej ostatniej wizyty GUS dodał nowy rok?” – bez maili i kont (PRODUKT: brak kont, brak danych osób).
**Szkic ekranu:**
- Przy nazwie wskaźnika w pickerze kropka „nowe” i dopisek „dane za 2025 dodane 12.11”. Działa na podstawie ostatniego roku widzianego w tej przeglądarce (`localStorage`, wygoda per-urządzenie, z `try/catch`; bez wysyłania gdziekolwiek).
- Strona „Skąd są dane”: lista „Ostatnie aktualizacje” (wskaźnik, rok, data).
- Opcjonalnie (osobna decyzja): statyczny kanał Atom `/data/feed.xml` generowany przez robota → kto chce, subskrybuje w czytniku RSS. To jest „alert” bez naszego serwera i bez adresów e-mail.
**Dane:** istniejący moduł `src/core/freshness/` i daty z `public/data` (lata w `values/*.json`); kanał Atom wymagałby zmiany w `scripts/data` (strefa „najpierw zapytaj”).
**Ryzyka prawne/licencje:** `localStorage` z samym numerem roku per wskaźnik nie jest daną osobową, ale jest zapisem na urządzeniu – sprawdzić z polityką prywatności (art. 173 Prawa telekomunikacyjnego / PKE: niezbędne do usługi → bez zgody; opisać w Prywatności). E-mail/push = poza zakresem (dane osób, RODO).
**Nakład:** S (kropka „nowe”) / M (z kanałem Atom i listą aktualizacji).
**Testy akceptacyjne:**
1. Pierwsza wizyta (pusty `localStorage`) – żadnej kropki „nowe”; zapisany rok 2024 przy danych do 2025 – kropka przy tym wskaźniku.
2. `localStorage` rzucający wyjątek (tryb prywatny) – strona działa, brak kropek, brak błędów w konsoli.
3. Wejście na stronę nie dodaje żadnego żądania danych ponad próg §7 (test liczy żądania).

## 4. Tryb edukacyjny „Zgadnij, gdzie”
**Cel użytkownika:** uczeń/nauczyciel: nauka geografii Polski na prawdziwych danych; 5 minut na lekcji, z telefonu lub tablicy.
**Szkic ekranu:**
- `/zgadnij` (link w menu „Dla szkół”): pytanie „Które województwo ma największą gęstość zaludnienia?” – użytkownik klika na mapie (lub wybiera z listy – dostępność). Po odpowiedzi: zakreślenie `korekta` na właściwej jednostce, wynik, jedno zdanie z objaśnienia (`short` z `explanations.json`), „Następne pytanie”.
- 10 pytań w rundzie, wynik na końcu + karta PNG „Mój wynik” (istniejący mechanizm §4b).
- Pytania z szablonów: „najwyżej/najniżej”, „wyżej czy niżej niż średnia kraju”, „który z dwóch powiatów…”. Ziarno losowania w adresie (`?seed=`) – nauczyciel daje klasie ten sam zestaw.
**Dane:** `values/<id>.json` dla 1–3 wskaźników rundy (pobierane po kolei, nie naraz), `explanations.json`, `units.json`.
**Ryzyka prawne/licencje:** brak zbierania wyników (nie ma kont, nie ma rankingów uczniów – ochrona dzieci). Teksty pytań mogą wymagać akceptacji właściciela jak objaśnienia (W1.9).
**Nakład:** M (logika pytań, strona, test ścieżki).
**Testy akceptacyjne:**
1. To samo `?seed=` daje tę samą listę 10 pytań (test jednostkowy, deterministyczny PRNG z `tests/fixtures/prng`).
2. Odpowiedź z listy (klawiatura) i kliknięcie mapy dają ten sam wynik; pole wyboru ≥ 44 px.
3. Pytanie nigdy nie dotyczy wskaźnika/poziomu bez danych dla ≥ 90% jednostek w danym roku.

## 5. Osadzanie mapy i wykresu na zewnętrznych stronach
**Cel użytkownika:** lokalny portal, gmina, bloger chce wstawić „żywą” mapę lub wykres do artykułu zamiast zrzutu.
**Szkic ekranu:**
- W oknie „Pobierz i udostępnij” nowa karta „Osadź”: wybór „Mapa | Ranking | Wykres miejsca”, rozmiar (szerokość responsywna, wysokość 400/600), podgląd i pole z kodem `<iframe>` + „Kopiuj kod”.
- `/osadz?w=map&i=density&l=pow&u=12&y=2025&theme=light`: wersja bez nagłówka, menu i zgody; na dole stała stopka „Faktografia Atlas · dane GUS, BDL · CC BY 4.0 · Otwórz pełną mapę ↗”.
- Brak analityki w osadzeniu (zgoda nie może być zbierana w cudzym kontekście).
**Dane:** te same pliki co widok główny (jedno żądanie wartości), bez profili dla wariantu „Mapa”.
**Ryzyka prawne/licencje:** (a) nagłówki `frame-ancestors` / `X-Frame-Options` w `vercel.json` – zmiana konfiguracji = decyzja właściciela; osadzanie tylko ścieżki `/osadz`, reszta strony nadal chroniona przed clickjackingiem; (b) Vercel Hobby jest „non-commercial” – ruch z cudzych stron komercyjnych może naruszać warunki → limit lub zmiana hostingu (PRODUKT: komercjalizacja = zmiana hostingu); (c) podkład mapy – jeśli kiedyś OpenFreeMap/OSM, wymagana atrybucja ODbL w osadzeniu; (d) stopka ze źródłem nie może być wyłączana parametrem.
**Nakład:** M (logika parametrów – N-42, trasa `/osadz`, karta w oknie, nagłówki – osobno za zgodą).
**Testy akceptacyjne:**
1. `/osadz?w=map&i=density&l=pow` renderuje mapę bez nagłówka i paska zgody, ze stopką źródła i linkiem do pełnego widoku z tymi samymi parametrami.
2. Nieznany `w`, `i` lub `theme` → bezpieczne wartości domyślne (bez białego ekranu), parametr `hideSource=1` jest ignorowany.
3. Strona osadzenia nie wysyła żadnego zdarzenia analityki i nie zapisuje zgody (test liczy żądania do hosta PostHog = 0).

## 6. Karta „zmiana w czasie” do social
**Cel użytkownika:** dziennikarz/samorządowiec chce jednym obrazkiem pokazać trend („bezrobocie w moim powiecie 2010–2025”) – dziś karty pokazują jeden rok.
**Szkic ekranu:** w oknie „Pobierz i udostępnij” (profil) nowy typ karty „Trend”: nazwa miejsca, wskaźnik, wykres lat (SVG, ta sama geometria co TrendChart), wartość pierwsza i ostatnia, słowna zmiana („spadek o 7,1 p.p.”), mediana Polski jako cienka linia, logo i źródło. Wszystkie 4 formaty, jasny/ciemny. To nadal **pojedyncza karta** – nie generator serii slajdów (zakaz z AGENTS).
**Dane:** szereg z `profiles/<woj>.json` już w pamięci (zero nowych pobrań, §4b).
**Ryzyka prawne/licencje:** CC BY 4.0 – źródło i lata na karcie bez wyjątku; brak nowych pakietów (canvas/SVG).
**Nakład:** S (logika karty `src/core/share/card-trend.ts` + przycisk w istniejącym oknie).
**Testy akceptacyjne:**
1. Karta „Trend” w formacie Story ma treść w środkowym pasie 1080×1610 (test geometrii jak dla istniejących kart).
2. Szereg z lukami (brak lat) rysuje przerwę w linii, a nie zero.
3. Najdłuższa nazwa jednostki i wskaźnika mieści się w polu tytułu we wszystkich 4 formatach (`text-fit`).

## 7. Offline / PWA „Atlas w kieszeni”
**Cel użytkownika:** ktoś na wsi ze słabym zasięgiem albo w terenie (radny na spotkaniu) chce otworzyć mapę i swój profil bez sieci; ikona na ekranie telefonu.
**Szkic ekranu:** w menu „Zainstaluj aplikację” (tylko gdy przeglądarka to umie); w profilu przełącznik „Zachowaj na urządzeniu” (zapisuje plik profilu województwa i bieżący wskaźnik). Bez sieci: pasek „Jesteś offline – dane z 12.11.2026”, niedostępne wskaźniki wyszarzone z dopiskiem „wymaga internetu”.
**Dane:** granice, `units.json`, wybrane `values/<id>.json` i `profiles/<woj>.json` – w pamięci Service Workera, nic nowego w `public/data`. Nie wolno pobierać wszystkich wskaźników naraz (AGENTS: zakaz masowego pobierania).
**Ryzyka prawne/licencje:** nowy pakiet (np. `vite-plugin-pwa`, MIT – sprawdzić w rejestrze i wpisać do ELEMENTY) + zmiana `vite.config.ts` (strefa „najpierw zapytaj”). Service Worker może serwować stare dane po aktualizacji GUS – obowiązkowy znacznik daty i strategia „sieć najpierw”. Brak problemu RODO (pamięć urządzenia, nic nie wysyłamy).
**Nakład:** M (konfiguracja, manifest z logo z `public/brand/`, pasek offline, testy e2e z `context.setOffline`).
**Testy akceptacyjne:**
1. Po jednej wizycie i przejściu offline (`context.setOffline(true)`) przeładowanie strony pokazuje mapę w kolorach domyślnego wskaźnika i pasek „offline” z datą danych.
2. Wybór wskaźnika niezapisanego offline pokazuje komunikat, a nie biały ekran ani nieskończone ładowanie.
3. Po powrocie sieci i nowej wersji `values/<id>.json` strona pokazuje nowe dane najpóźniej po przeładowaniu (strategia sieć-najpierw).

## 8. Wyszukiwanie naturalne (reguły, bez AI)
**Cel użytkownika:** wpisać w lupę to, co ma w głowie: „bezrobocie kraków”, „gęstość gminy małopolskie”, „najbiedniejsze powiaty 2020” – i od razu zobaczyć odpowiedni widok.
**Szkic ekranu:** istniejąca wyszukiwarka (Ctrl K / lupa) – nad wynikami miejscowości nowy pierwszy wiersz „Pokaż: Stopa bezrobocia · powiaty · małopolskie · 2020 →”. Enter ustawia wskaźnik, poziom, rok i jednostkę (ten sam stan co ręczny wybór, przez `useMainView`/`useMapSelection`). Gdy nic nie rozpoznano – zachowanie jak dziś.
Parser to słownik synonimów w kodzie („bezrobocie”, „bez pracy” → `unemployment-rate`; „gminy” → `gmi`; „najbiedniejsze” → najniżej w dochodach) i dopasowanie nazw jednostek bez polskich znaków. **Bez modelu AI i bez usług zewnętrznych** (PRODUKT: brak liczb od AI; brak wysyłania zapytań).
**Dane:** `units.json` (nazwy), lista wskaźników z `config/indicators.json` (już w kodzie), dane wskaźnika = jedno żądanie `values/<id>.json` po zatwierdzeniu.
**Ryzyka prawne/licencje:** brak. Statystyki wyszukiwań tylko po zgodzie (istniejący mechanizm), treść zapytań nie trafia do analityki bez zgody. Ryzyko UX: fałszywe dopasowania („Wola” = dzielnica vs gmina) – pokazujemy rozpoznanie przed wykonaniem.
**Nakład:** M (logika – N-41, wiersz w wyszukiwarce, test ścieżki).
**Testy akceptacyjne:**
1. „bezrobocie krakow 2020” → `{indicator: 'unemployment-rate', unit: '1261', year: 2020}` (z fixture jednostek), także z wielkimi literami i polskimi znakami.
2. Rok spoza danych wskaźnika lub poziom poniżej `minLevel` jest pomijany z widocznym dopiskiem („GUS podaje te dane tylko do powiatów”).
3. Zapytanie bez rozpoznanego wskaźnika („Wałcz”) nie dodaje wiersza „Pokaż:” – wyniki jak dziś (istniejące testy wyszukiwarki zielone bez zmian).

---

## Gotowe zadania (logika w `src/core`, bez plików ekranu)
- `N-40-logika-najwiekszych-zmian.md` – koncept 1.
- `N-41-logika-wyszukiwania-naturalnego.md` – koncept 8.
- `N-42-logika-parametrow-osadzania.md` – koncept 5.

Każde jest czystą logiką z testami (warstwa W1 – podzespół robiony wcześniej, równolegle; brak kolizji plików, można puścić w jednej fali). Podpięcie do ekranu = osobne zadania po decyzji właściciela (pliki ekranu wymagają wymienienia wprost).

## Decyzje dla właściciela
1. Które koncepty wchodzą do planu (proponuję 8, 1, 6 jako pierwszą falę „S24 – odpowiedzi szybciej”).
2. Osadzanie (5): zgoda na zmianę nagłówków w `vercel.json` tylko dla `/osadz` i ocena warunków Vercel Hobby.
3. Kanał Atom (3) i PWA (7): zgoda na zmiany w `scripts/data` / `vite.config.ts` i nowy pakiet.
4. Tryb edukacyjny (4): kto akceptuje teksty pytań (jak W1.9).
