# Plan fal etapu B – budowa po uproszczeniu (21.11.2026)
> **Odchudzenie planu (21.11.2026, decyzja właściciela).** Z etapu B zostają do zrobienia tylko **B13** (profil bez „Moich wskaźników” + „Kopiuj link”) i **B14** w zakresie zmniejszonym (martwy kod, prototypy, wstęp, stopka, Observable Plot). B01–B07 są scalone (pliki w `tasks/zrobione/`). **Odłożone** do `tasks/odlozone/`: B08 (widoki + Ranking), B09 (Wykres), B10 (Tabela), B11–B12 (druga mapa, koniec Porównaj), B15 (odbiór), U03b, U11b – lista i powody: `tasks/odlozone/README.md`. Tabele i opisy niżej dotyczą pełnego planu docelowego, nie bieżącej kolejki. Dalsze zmiany właściciel poda osobno.

Powstał w sesji „po odpowiedziach właściciela” (W23-U12) z `docs/PLAN-DOCELOWY.md` (§4), odpowiedzi P1–P7 i decyzji D1–D9. Pliki zadań: `tasks/W23-B01…B15` oraz `tasks/W23-U03b`, `tasks/W23-U11b`. Opis ekranów: `docs/PRODUKT.md` v4.

## 1. Odpowiedzi właściciela, które wpisano w zadania
| Pytanie | Odpowiedź | Gdzie widać |
|---|---|---|
| P1 Od czego zaczynamy | A: ekran startowy i `/mapa` pierwsze (fala 2) | B03 w fali 2, wybór danych (B05) w tej samej fali |
| P2 Zgody Z2–Z4 | A: jeden podpis (Z1 już był) | sekcja „Zgody” w B03, B05, B06, B07, B08, B12, B13, B14 |
| P3 Profil bez „Moich” | **to samo menu wyboru wskaźnika co Biblioteka** (jedno menu kategorii), nie osobna lista | B05 buduje `DataMenu` do ponownego użycia; B13: przycisk „Zmień wskaźnik” w profilu otwiera to menu; stały zestaw 7 wierszy zostaje |
| P4 „szkoły”, „lekarze” | A: tylko szukajka (synonimy, wagi); bez ręcznych wskaźników | B05 (`config/synonyms.json`); B15 akceptuje „Nie mamy jeszcze tych danych” dla zadania d |
| P5 „Kopiuj link” | A: stale w nagłówku `/mapa` | B13 |
| P6 Teksty strony startowej | A: bez zmian | B03 |
| P7 Kto przenosi pliki | A: ta sesja | 141 plików w `tasks/skreslone/` |

## 2. Tabela fal
Zadania jednej fali nie dzielą plików i nie zależą od siebie, więc idą równolegle (jedna sesja zadania na plik, PR `[W23-Bnn]`). Następną falę puszcza się dopiero po scaleniu poprzedniej i oglądzie przez właściciela. „Plik fali” w nazwie to zawsze W23; numer fali budowy (kolumna 1) jest w pliku zadania.

| Fala | Zadania | Zależą od | Równolegle | Pierwsza widoczna zmiana |
|---|---|---|---|---|
| 1 | **B01** robot: spis bez luki 375 · **B02** strażnicy ścieżek i `openMap()` (Z1) | – | B01 ∥ B02 | Nic na stronie; CI pilnuje ścieżek, robot przestaje gubić wskaźniki |
| 2 | **B03** trasy, menu, nazwa, przekierowania, ekran startowy · **B04** dane strony startowej · **B05** wybór danych (komputer) | B03←B02, B05←B01 | B03 ∥ B04 ∥ B05 | **B03: `/` to ekran startowy, mapa pod `/mapa`** · B05: jedno menu danych |
| 3 | **B06** wybór danych na telefonie i koniec Biblioteki · **B07** animowane tło i wejście do mapy | B06←B03,B05; B07←B03,B04 | B06 ∥ B07 | Telefon: to samo menu; `/` z animowanym obrysem |
| 4 | **B08** przełącznik widoków i Ranking | B06 | sama | Zakładki Mapa/Ranking; koniec strony Rankingi |
| 5 | **B09** Wykres · **B10** Tabela · **B11** druga mapa (komputer) · **B13** profil uproszczony i „Kopiuj link” | B09,B10,B11←B08; B13←B06 | wszystkie cztery | Zakładki Wykres i Tabela; „+ Druga mapa”; krótki profil |
| 6 | **B12** druga mapa na telefonie i koniec Porównaj | B11 | sama | Telefon: dwie mapy; koniec `/porownaj` |
| 7 | **B14** sprzątanie | B07,B09,B10,B12,B13 | sama | Nic nowego (mniej kodu, ok. 3 800 linii) |
| 8 | **B15** odbiór (S4, S7, S8, kliknięcia, raport przed/po) | B14 | sama | Raport `docs/research/u/B15-odbior.md` |
| poza | **U03b** przegląd serwisów na żywo (po dopuszczeniu hostów) · **U11b** zbieranie wyborów do `popularIds` (po B13 i ≥ 7 dniach od B01) | U11b←B05,B13 | z dowolną falą (osobne pliki) | U11b: nowe zdanie w `/prywatnosc` |

Uzasadnienie kolejności: najpierw testy (B02) i trasy (B03), bo zmiana adresu `/` → `/mapa` jest najdroższym krokiem; nowa funkcja i jej test ścieżki wchodzą przed usunięciem starej (stare znika w PR zamiennika: Biblioteka w B06, Rankingi w B08, Porównaj w B12, „Moje wskaźniki” w B13 i B14).
Uwaga o plikach: B13 nie usuwa `core/my-indicators` (ComparePage używa go do B12); robi to B14.

## 3. Jak puszczać falę (prompt startowy, wklej w nowej sesji)
```
Jesteś sesją startową fali budowy <N> (zadania: <lista id, np. B03, B04, B05>) w repozytorium olubiec/faktografia-atlas. Nie wykonujesz zadań, tylko startujesz sesje.
1) Przeczytaj AGENTS.md, docs/FALE.md i docs/PLAN-FALE-B.md. Sprawdź na aktualnym main (git fetch origin && git checkout main && git pull), że zależności tych zadań (kolumna „Zależą od”) są scalone; jeśli nie, zatrzymaj się i napisz, których brakuje.
2) Sprawdź, że żadne dwa zadania z listy nie mają wspólnego pliku w linii „Zmieniaj” (wyjątek: nowe pliki testów o różnych nazwach). Konflikt: zatrzymaj się i opisz.
3) Dla każdego pliku tasks/W23-<id>-*.md uruchom osobną sesję (create_session, to samo repozytorium, tytuł „[W23-<id>]”) z promptem z sekcji „PROMPT startowy dla podagenta” z tego pliku. Niczego nie scalaj, nic nie pushuj na main.
4) Na końcu wypisz tabelę: id, tytuł, id sesji. Zakończ.
```
Każdy plik zadania ma gotowy PROMPT startowy także dla podagenta w tej samej sesji (sekcja na końcu pliku). Pliki B-zadań leżą w `tasks/` od scalenia tego PR, ale **nic nie startuje samo**: fale puszcza właściciel (wybierając prompt wyżej). Uwaga: B-zadania czytają `docs/PLAN-DOCELOWY.md`, więc najpierw scal PR #587 (W23-U09).

## 4. Kto co sprawdza na stronie (po ludzku)
Po każdej fali oglądasz podgląd Vercel (komputer i telefon) i scalasz zielone PR-y. „Update snapshots” uruchamiasz po falach 2, 4 i 8 (zmieniają się wzorce zrzutów).

| Zadanie | Gdzie patrzeć | Co ma być widać / co sprawdzić |
|---|---|---|
| B01 | GitHub → Actions → „Fetch library” → Summary (po najbliższym przebiegu) | Linia „Pobrane … w spisie … brakuje 0” |
| B02 | CI na PR | Zielone; strona wygląda jak wcześniej |
| B03 | `/` oraz `/mapa`; stary link `/?u=1217&i=density`; karta przeglądarki | Ekran startowy z tytułem „Faktografia”, zdaniem, 3 krokami, przykładami i „Otwórz mapę”; mapa pod `/mapa`; menu tylko Start i Mapa; stary link otwiera mapę z tym samym wyborem |
| B04 | `/geo/start-outline.json`, `/data/start.json` na podglądzie; Actions → „Fetch data” | Pliki są; krok „start” zielony |
| B05 | `/mapa`, nazwa wskaźnika w panelu | Menu Dział › Grupa › Wskaźnik z szukajką; „zarobki”, „bezrobocie”; „szkoły” może jeszcze nie mieć danych |
| B06 | Telefon: pasek wskaźnika; adresy `/biblioteka`, `/biblioteka?q=ludnosc`, `/biblioteka/101` | To samo menu na telefonie; stare linki przenoszą na mapę |
| B07 | `/` na telefonie i komputerze | Tło rusza się samo i reaguje na mysz/palec; strona nadal się przewija; „Otwórz mapę” płynnie wchodzi; pod mapą nie ma sekcji |
| B08 | `/mapa` zakładka „Ranking”; `/rankingi?i=unemployment-rate&l=pow` | Ranking z filtrem „Województwo”, wybrane miejsce zawsze widoczne; stary adres przenosi na ranking |
| B09 | `/mapa` zakładka „Wykres” (telefon z dwoma wskaźnikami) | Linia lat + przerywana mediana; przy dwóch wskaźnikach jasne, która linia której |
| B10 | `/mapa` zakładka „Tabela” | Szukanie, sortowanie, klik wiersza wybiera miejsce; nic nie wychodzi poza ekran |
| B11 | Komputer: „+ Druga mapa” | Dwie mapy ze wspólnym zoomem, rokiem, poziomem; zaznaczenie na obu |
| B12 | **Telefon właściciela**: „+ Druga mapa”; `/porownaj?c=…` | Dwie mapy jedna pod drugą, płynne szczypanie i przewijanie; stary adres przenosi na mapę |
| B13 | Profil miejsca; nagłówek `/mapa`; `/prywatnosc` | „Zmień wskaźnik” otwiera to samo menu; 7 podstawowych wierszy; „Kopiuj link” w nagłówku bez otwierania profilu; brak „Moich wskaźników” |
| B14 | Cały serwis | Wszystko działa jak przed PR; stopka krótsza |
| B15 | `docs/research/u/B15-odbior.md` | Tabela „przed/po”; limity kliknięć (a ≤ 3, b ≤ 3, c ≤ 4, d ≤ 3, e ≤ 3, f = 1) |
| U03b | raport `docs/research/u/U03b.md` | 3 wzorce i 3 błędy z sześciu serwisów |
| U11b | `/prywatnosc`; instrukcja w `docs/research/u/U11b.md` | Nowe zdanie o zliczaniu wyborów (po zgodzie) |

## 5. Lista dla właściciela (nie pytania)
1. **Test nr 0 – PRZED scaleniem B03** (po zmianie tras punkt odniesienia „przed” przepada). Na swoim telefonie, kartka `docs/research/u/U02-test-z-ludzmi.md`: 6 zadań (Wadowice w bezrobociu; najludniejsza gmina w małopolskim; powiat krakowski vs wielicki; dane o szkołach; zmiana ludności w powiecie wadowickim; wysłanie linku). Nagraj ekran, wpisz do tabelki: znalazł (T/N), czas, kliknięcia nie tam, gdzie się zgubiłeś. Przy okazji sprawdź, czy w polu szukania giną litery (wątpliwość `[?]` z U02).
2. Test nr 0 „po” – po B15, ta sama kartka; porównaj z „przed”.
3. **Dopuść hosty dla U03b** (Settings środowiska sesji): ourworldindata.org, datawrapper.de, ec.europa.eu, gapminder.org, stat.gov.pl, usafacts.org. Potem puść `W23-U03b` (osobna, krótka sesja badawcza).
4. **Po 7 dniach od startu B01** obejrzyj w Actions „Fetch library” tabelę „Pobrano wg działów” i oceń wagi (`config/library-priority.json`); wtedy ma sens U11b.
5. Przed zamknięciem B12 przetestuj dwie mapy na swoim telefonie (szczypanie, przewijanie strony, przełączanie układu A/B); werdykt o płynności jest Twój, pomiary w PR są orientacyjne.
6. Uruchom workflow „Update snapshots” po falach 2, 4 i 8 (wzorce zrzutów powstają tylko w CI).
7. Sprawdź interpretacje w sekcji 6 (jedno kliknięcie odpowiedzi „ok” albo „zmień”).

## 6. Interpretacje i założenia (sprawdź)
- **P3:** „to samo menu co Biblioteka” = komponent `DataMenu` (B05) otwierany z profilu przyciskiem „Zmień wskaźnik”; wybór ustawia ten sam wskaźnik co na mapie (wspólny stan). Profil dalej pokazuje stały zestaw 7 wierszy (wskaźniki z biblioteki są tylko na mapie i w widokach, bo profil to jeden plik na województwo).
- **Wykres bez wybranego miejsca (B09):** „największa jednostka poziomu” = jednostka o najwyższej wartości wskaźnika w wybranym roku (bez dodatkowego pobierania danych o ludności). Jeśli chodziło o największą liczbę ludności, napisz.
- **Adres wyboru danych (B05/B06):** `?menu=dane` otwiera menu, `?q=` wpisuje frazę (dla przekierowania starej Biblioteki).
- **Nazwa „Faktografia” (B03):** zmiana obejmuje nagłówek, tytuł karty, stopkę i strony tekstowe; okno udostępniania i `/design` zostają (wstrzymane / techniczne).
- **Przekierowania** wchodzą razem z usunięciem strony (R2 w B06, R1 w B08, R3 w B12); w B03 tylko stare adresy `/?…`.
- **Zgody Z2 w B03** obejmują też dwa testy Biblioteki z tytułem „Faktografia Atlas” (znikną w B06) i `rankings-list.test.tsx` (adresy `/mapa?…`).
- **Liczba testów e2e z adresem `/`:** w kodzie 255 wywołań w 71 plikach (raport U07: 253 w 70).
- **Błąd w tabeli werdyktów:** „W3-QC912” to w rzeczywistości plik `W4-QC912-zestaw-stan-react` (przeniesiony).

## 7. Zadania warunkowe po odbiorze (zostają w `tasks/poczekalnia/`, nie ruszane tym PR)
`W5-PM13` (tylko gdy telefon zacina przy miejscowościach), `W5-PM20` i `W6-PM14` (pomiar „po” robi B15; tryb oszczędny tylko przy złym wyniku), `W18-P02` (ciemna mapa), `W18-P04` (OpenGraph i tytuły dla `/` i `/mapa`), `W18-P06` (skróty klawiszowe), `P2-A` (meta, robots, sitemap, manifest), `P3-A` (robot danych), `P4-C` (punkty zatrzymania arkusza), `W3-QC303`, `W5-QC406`, `W5-QU13` (przesuwany wykres lat: przejmuje B09), `W6-QC611` (budżet: przejmują B07 i B15), `W6-QU17` (zastąpione przez `docs/PRODUKT.md` v4). Do wyjaśnienia (`[?]` w werdykcie): `W2-QC405`, `W2-QC502` – zostawione bez ruchu.

## 8. Co przeniesiono do `tasks/skreslone/`
141 plików z `tasks/poczekalnia/`, `tasks/poczekalnia/Q/` i `tasks/wstrzymane/` (`git mv`, nic nie skasowano; struktura podkatalogów zachowana) wg werdyktów `docs/PLAN-DOCELOWY.md` §3: zrobione na `main`, zastąpione albo funkcja znika. Wstrzymane zostają: W4-QU01, W4-QU02, W5-QU10, W6-QC917, W7-QC918, W7-QC919, W7-QC920, W18-P05 oraz README.
