# Plan docelowy – Faktografia (synteza U00–U11, 20.11.2026)
Powstał z raportów `docs/research/u/U00–U08, U11` (U10 jest już na `main`: przycisk „Pobierz i udostępnij” schowany za `?share=1`). Decyzje D1–D9 (`docs/PLAN-UPROSZCZENIE.md` §0) i odpowiedzi właściciela na pytania z raportów są **zatwierdzone** i nie wracają jako pytania.

**Liczba sesji etapu B: 15** (osobno, przed nią: 1 krótka sesja po Twoich odpowiedziach, która zapisuje pliki zadań i `docs/PRODUKT.md` v4).

## Co już wiemy (odpowiedzi właściciela, w skrócie)
| Temat | Ustalone |
|---|---|
| Nawigacja | Menu: Start, Mapa, szukajka miejsca. Motyw dzień/noc zostaje w nagłówku. Sekcje pod mapą znikają, przykłady (miejsca, pojedynki) idą na stronę startową. |
| Funkcje, które znikają | „Zamów wskaźnik” (cel: jak najszybciej zapełnić Bibliotekę danymi, a nie zamawiać), pobieranie CSV, „Moje wskaźniki”, strony Rankingi, Biblioteka, Porównaj. |
| Wybór danych | Dział › Grupa › Wskaźnik, 3 poziomy; szukajka na `minisearch` (bez nowego pakietu); tylko pobrane; **bez danych archiwalnych**; brak wyniku: „Nie mamy jeszcze tych danych”; robot ma uzupełnić lekki spis o 375 brakujących wskaźników. |
| Robot biblioteki | Jedzie codziennie aż do wyczerpania limitu (2 × 3 000 zapytań na dobę, wagi działów z `config/library-priority.json`); zbieranie wyborów do `popularIds` po tygodniu. |
| Widoki | Mapa · Wykres · Tabela · Ranking, własny SVG (bez pakietu), Observable Plot do usunięcia. Wykres bez wybranego miejsca pokazuje największą jednostkę poziomu. Dwa wskaźniki w wykresie: **jeden wykres z dwiema skalami**. Ranking także w obrębie województwa. |
| Dwie mapy | Dwie instancje ze wspólną kamerą, wspólny poziom i rok; telefon: jedna pod drugą (D1). Wykres punktowy A × B: później. |
| Strona startowa | Tło A (cykl 4 wskaźników, pierwszy kadr = ludność), jednorazowa migracja testów `/` → `/mapa` (253 wywołania), `start.json` odświeżany przez robota. |
| Testy | Podpisana zgoda na mechaniczną zmianę adresów (Z1); stare funkcje znikają razem z testami w PR ich zamiennika. |
| Punkt odniesienia | Test nr 0 na telefonie właściciela (kartka `docs/research/u/U02-test-z-ludzmi.md`). |

**Uwaga o stanie strony.** Na `/` dziś nadal jest zwykła mapa: W22 to badania i prototypy (`/__test/proto/*`). Plan budowy poniżej jest ułożony tak, żeby **pierwsza widoczna zmiana (ekran startowy i `/mapa`) wchodziła w fali 2**, a nie na końcu.

---

## 1. Docelowy wygląd ekranów
Skróty: [ ] przycisk, ▾ lista, ● zaznaczone.

### 1.1 `/` – strona startowa (telefon i komputer ten sam układ)
```
┌ Faktografia                    [Szukaj] [Motyw] ┐   menu: Start · Mapa
│                                                  │
│   (w tle animowany obrys Polski, 16 woj.;        │   Tło: cykl 4 wskaźników co 5 s
│    kolory = aktualne dane; sam rusza się         │   (ludność, bezrobocie, wynagrodzenie,
│    losowo, a gdy rusza się mysz/palec – reaguje) │   gęstość); pierwszy kadr = ludność
│                                                  │
│   Zobacz, jak wypada Twoja gmina na tle całej    │   1 zdanie
│   Polski, na danych GUS.                         │
│   1. Wybierz dane, np. bezrobocie albo ludność.  │   3 kroki
│   2. Dotknij miejsca na mapie.                   │
│   3. Zobacz profil i porównaj z innym miejscem.  │
│                                                  │
│            [ Otwórz mapę ]  (≥ 44 px)            │   jedyny przycisk główny
│   Przykłady: [Wadowice] [Kraków vs Wieliczka] …  │   6 miejsc + 6 par (z dawnych sekcji)
│   Podpis: „Stopa bezrobocia, 2025 · mazowieckie” │   tylko gdy animacja reaguje
└ O projekcie · Źródła · Prywatność ───────────────┘
```
Budżety (U07): obrys ≤ 25 KB (≤ 10 KB gzip), `start.json` ≤ 5 KB, 0 pobrań wartości wskaźników, p95 klatki ≤ 33 ms (SwiftShader ×4), pętla pauzuje przy ukrytej karcie. `prefers-reduced-motion`: kadr statyczny (ludność), bez cyklu.

### 1.2 `/mapa` – jedyny ekran pracy (komputer)
```
┌ Faktografia ───────────────── [Szukaj miejsca Ctrl K] [Kopiuj link] [Motyw] ┐
│┌ Panel ───────────┐  Polska / małopolskie                                   │
││[Wybierz dane ▾]  │  [ Mapa | Wykres | Tabela | Ranking ]  [+ Druga mapa]   │
││Ludność ogółem (?)│                                                         │
││Poziom [Woj][Pow]  │         MAPA (lub wykres / tabela / ranking)            │
││       [Gmi]      │         w tym samym miejscu, ten sam wskaźnik,          │
││Legenda 5 klas    │         rok, poziom i wybrane miejsce                   │
││Rok ───────■ 2025 │                                                         │
││Najwyżej/najniżej │                              ┌ dymek: nazwa, wartość,   │
││ (5+5)            │                              │ miejsce, Otwórz profil → │
││Źródło: GUS, BDL  │                              └──────────────────────────┘
│└──────────────────┘                                                         │
└ O projekcie · Źródła · Prywatność ──────────────────────────────────────────┘
```
- „Kopiuj link” stale w nagłówku (jedno kliknięcie bez profilu, wynik U02 zad. f). „Pobierz i udostępnij” niewidoczne (`?share=1`).
- Adres: `?v=mapa|wykres|tabela|ranking` (domyślnie mapa, pomijana), `i`, `i2`, `y`, `l`, `u`, `c`. Zmiana widoku nie czyści pozostałych.
- Telefon: panel to dolny pasek (nazwa wskaźnika, rok, legenda); dotknięcie otwiera wybór danych; zakładki widoków w jednym rzędzie (4 × ≥ 90 px, pola ≥ 44 px); profil jako dolny arkusz.

### 1.3 Wybór danych (okno / arkusz, jedno miejsce zamiast siedmiu)
```
TELEFON: jeden widok naraz            KOMPUTER: dwie kolumny
[ Szukaj wskaźnika…            ]       [ Szukaj wskaźnika…               ]
Wszystkie › Ludność › Stan ludności    Działy        │ Wszystkie › Ludność
 ★ Najważniejsze          6 ›          Ludność    88 │ ★ Najważniejsze   6 ›
 Stan ludności           69 ›          Rynek pracy 11│ Stan ludności    69 ›
Lista: nagłówek tematu, nazwa,         …             │ (po kliknięciu grupy: lista, 50 + „Pokaż więcej”)
poziomy (woj/pow/gmi), „Pokaż więcej”
Brak wyniku: „Nie mamy jeszcze tych danych o … Najbliższy dział: …”   (bez „Zamów”)
```
Tylko pobrane, bez grupy „Dane archiwalne”; w dziale najpierw „★ Najważniejsze”. Kolejność działów z `config/library-priority.json`. Synonimy (zarobki → wynagrodzenie) w jednym pliku `config/`.

### 1.4 Widoki jednego wskaźnika (zawsze ten sam rok, poziom, miejsce)
```
Wykres: linia lat dla miejsca + przerywana mediana poziomu. Bez miejsca: największa jednostka poziomu.
        Dwa wskaźniki: jeden wykres, dwie skale (lewa A, prawa B, różne kolory i podpisy osi).
Tabela: [Szukaj…]  Miejsce | Wartość (rok) | Miejsce w rankingu   sortowanie po nazwie i wartości;
        dwa wskaźniki = dwie kolumny wartości; klik wiersza ustawia `u` i zostaje w widoku.
Ranking: poziome słupki poziomu i roku; filtr „Województwo ▾” (ranking w obrębie województwa);
        wybrane miejsce wyróżnione i zawsze widoczne; dwa wskaźniki = dwa rankingi pod sobą.
```

### 1.5 Dwie mapy
```
KOMPUTER                                   TELEFON (D1: jedna pod drugą)
[A: Bezrobocie ▾] [B: Wynagrodzenia ▾] [×]   [A: Bezrobocie ▾]   ┌────────┐
┌──────────────┐  ┌──────────────┐           ┌────────────────┐  │ mapa A │ ~40% ekranu
│    mapa A    │  │    mapa B    │           │ [B: Wynagr. ▾] │  ├────────┤
└─ legenda A ──┘  └─ legenda B ──┘           │   mapa B       │  │ mapa B │
Wspólne: rok, poziom, kamera, zaznaczenie. Pod mapami wartości A i B dla zaznaczonego miejsca.
Zapas na telefon: przełącznik A / B (druga mapa odmontowana). Lista wskaźników wyłącza te bez danych na poziomie.
```

### 1.6 Profil miejsca (kolumna 440 px / arkusz na telefonie)
```
Gmina miejsko-wiejska Wadowice (TERYT 1218…)                [×]
Zakładki: Przegląd · Gminy (n) · Porównaj z innym miejscem
Bieżący wskaźnik: nazwa, rok, DUŻA LICZBA, „149. z 380” (jedno zakreślenie)
Ranking jednostek w województwie (słupki, wybrane wyróżnione)
Wskaźniki podstawowe (stały zestaw 7; klik rozwija wykres lat)
Porównaj: tabela dwóch miejsc + 2 mapki (jak dziś), bez „Moich wskaźników”
```
Zostaje wszystko, co działa; znikają lista użytkownika, okno „Dodaj wskaźnik” i przyciski udostępniania.

### 1.7 Stopka i strony tekstowe
Stopka (ok. 6 linków): Mapa · O projekcie · Skąd są dane · Prywatność i zgoda · GitHub · CC BY 4.0. `/o-projekcie`, `/zrodla` (linki „Otwórz na mapie” → `/mapa?i=…`), `/prywatnosc` (bez akapitu o „Moich wskaźnikach”), 404 – bez zmian wyglądu. Strony techniczne (`/design`, `/__test/*`, `?tune`) zostają, prototypy `/__test/proto/*` znikają po etapie B.

---

## 2. Decyzje dla właściciela (tylko realnie otwarte: 7)
**P1. Od czego zaczynamy budowę?** A) od ekranu startowego i `/mapa` (pierwsza widoczna zmiana w fali 2; wybór danych w tej samej fali) B) najpierw wybór danych, start na końcu. **Zalecam A**, bo na `/` nadal widzisz zwykłą mapę i to ma się zmienić jako pierwsze.
**P2. Podpisujesz zgody Z2–Z4 z raportu U08 jednym podpisem?** (Z1 już podpisana.) Z2: przepisanie testów strony startowej i nazwy (6 plików); Z3: usunięcie testów Biblioteki, Rankingów, Porównaj i pickera (37 plików) razem z funkcją; Z4: usunięcie testów „Moich wskaźników” (21 plików) i martwych sekcji pod mapą. A) tak, jeden podpis B) zgoda osobno przy każdym PR. **Zalecam A**, bo każde usunięcie idzie w PR zamiennika, więc jest małe i sprawdzalne.
**P3. Co pokazuje profil miejsca bez „Moich wskaźników”?** A) stały zestaw 7 podstawowych + wskaźnik wybrany na mapie B) wszystkie pobrane wskaźniki miejsca w grupach (długa lista). **Zalecam A**, bo to dzisiejszy stan „na start tylko podstawowe”; reszta jest na mapie przez wybór danych.
**P4. Szukanie „szkoły” i „lekarze” (U04: pierwszy wynik zły, drugie hasło bez danych) – co robimy?** A) tylko poprawiamy szukajkę (synonimy, wagi) i czekamy, aż robot pobierze zdrowie B) dodatkowo wbudowujemy 3–4 ręczne wskaźniki dla szkół i zdrowia (nowe liczby w `public/data`, osobna sesja). **Zalecam A**, bo B wymaga nowych danych i audytu, a robot i tak je dołoży (po 30 dniach ok. 5 460 wskaźników w wyborze).
**P5. „Kopiuj link”: gdzie?** A) w nagłówku `/mapa`, zawsze widoczny (i w profilu) B) tylko w profilu. **Zalecam A**, bo w teście U02 osoba bez otwartego profilu nie miała tego przycisku wcale.
**P6. Teksty strony startowej** (U07 §3.3): „Zobacz, jak wypada Twoja gmina na tle całej Polski, na danych GUS.” + 3 kroki z §1.1 + przycisk „Otwórz mapę”. A) tak, tak zostaje B) chcę zmienić (napisz brzmienie). **Zalecam A**; łatwo zmienić później, to jeden plik.
**P7. Kto przenosi pliki zadań po werdyktach (sekcja 3)?** A) sesja po Twoich odpowiedziach przenosi „skreślone” do `tasks/skreslone/` i zapisuje zadania B w `tasks/` B) robisz to sam. **Zalecam A**, bo to ok. 150 plików.

**Do zrobienia przez Ciebie (nie pytania):**
- Test nr 0 na telefonie **przed scaleniem B03** (po zmianie tras punkt odniesienia „przed” przepada); kartka: `docs/research/u/U02-test-z-ludzmi.md`.
- Dopuszczenie hostów do powtórki U03 (ourworldindata.org, datawrapper.de, ec.europa.eu, gapminder.org, stat.gov.pl, usafacts.org); to osobna krótka sesja badawcza poza liczbą 15.
- Po 7 dniach od startu B01: obejrzeć w Actions „Fetch library” tabelę „Pobrano wg działów” i ocenić wagi.
- W teście na telefonie sprawdzić też gubienie liter w polu szukania (U02, wątpliwość `[?]`).

**Sprzeczności z rekomendacjami raportów (uwaga):** (1) U05 zalecał dwa wykresy pod sobą; wybrałeś jeden z dwiema skalami – zadanie B09 ma ostrzec o ryzyku mylnego odczytu (różne kolory, podpisy osi, test czytelności na 390 px). (2) U02: ukrycie danych archiwalnych odcina 960 z 2 061 wskaźników (47%, głównie Szkolnictwo) – to zamierzone. (3) Robot nie napełni Biblioteki szybciej niż limit GUS: prognoza U11 to ok. 2 850 wskaźników w wyborze po 7 dniach, 5 460 po 30, 12 260 po 90.

---

## 3. Werdykty dla plików w `tasks/poczekalnia/` i `tasks/wstrzymane/`
Zasada: **skreślić** = zrobione na `main` albo zastąpione albo funkcja znika; **zmienić** = zostaje z nowym zakresem; **zostaje** = czeka poza etapem B. Dowody „zrobione”: `git log` (tagi PR), istniejące pliki w `src/` i `tests/`; `[?]` = nie sprawdziłem do końca.

### 3.1 Katalog `tasks/poczekalnia/` (pliki w głównym katalogu)
| Plik(i) | Werdykt | Dlaczego (jedno zdanie) |
|---|---|---|
| FIX6-KOLEJNOSC, W20-KOLEJNOSC, W21-KOLEJNOSC | skreślić | Spisy kolejności fal, które są zamknięte. |
| PLAN-PUBLIKACJA, PLAN-UWAGI-17-11 | skreślić | Plany historyczne zastąpione tym dokumentem. |
| P1-A, P1-B, P3-C | skreślić | Same oznaczone jako „ZASTĄPIONE” planem Q. |
| P1-C | skreślić | Pasek wskaźnika na telefonie przepisuje B06; wymóg „widać nazwę, rok i legendę nad paskiem zgody” trafia do kryteriów B06. |
| P1-D | skreślić | Zakreślenie w arkuszu profilu: wymóg do kryteriów B13 (profil). |
| P1-E | skreślić | Sekcje „działy pod mapą” znikają. |
| P1-F | skreślić | Stopka ma ok. 6 linków, zwijanie niepotrzebne. |
| P1-G | skreślić | Menu ma 2 pozycje (Start, Mapa). |
| P2-A | zmienić | Meta, robots, sitemap i manifest zostają, ale dla `/` i `/mapa` oraz nazwy „Faktografia”; po B03 (poza 15). |
| P2-B | skreślić | `/prywatnosc` i zgoda działają (testy `privacy*`). |
| P2-C, P2-E | skreślić | Osobne strony Kontakt i Zastrzeżenie łamią zasadę prostoty; kontakt to zdanie w „O projekcie” (dopisek w B14). |
| P2-D | skreślić | 404 istnieje, leniwe trasy robi B03. |
| P2-F | skreślić | Przy aplikacji jednostronicowej prawdziwy status 404 nie jest możliwy; `vercel.json` bez zmian (U07). |
| P2-G | skreślić | Analityka po zgodzie z jednym zdarzeniem „search” działa (`src/core/consent/analytics.ts`). |
| P3-A | zostaje | Dotyczy robota danych, nie ekranów; poza etapem B `[?]`. |
| P3-B | skreślić | Audyt zrobiony (`docs/AUDYT-DANYCH.md`). |
| P3-D, W2-PD01, W2-PU01, W3-PD02, W3-PU02 | skreślić | „Dane z dnia…” jest w stopce (`DataFreshness`), Q2 zamknięte (#553). |
| P3-E | skreślić | Mniejszą wagę startu załatwiają leniwe trasy (B03) i budżety (B07). |
| P4-A | skreślić | Przejście start → mapa robi B07 własnym ruchem kamery. |
| P4-B | skreślić | `IntroOverlay` zastępuje strona startowa (usunięcie w B14). |
| P4-C | zostaje | Punkty zatrzymania arkusza na telefonie nadal przydadzą się profilowi; po B13 `[?]`. |
| P4-D | skreślić | Decyzja zapadła w U07: własny SVG/canvas, bez biblioteki animacji. |
| P4-E | skreślić | Reduced-motion pilnują testy ścieżek S1 i S8. |
| W17-T01, T02, T03, T06 | skreślić | Zrobione: `mobile-ux-geometry`, `a11y-matrix`, `style-guard`, `core-contracts-and-fuzz`. |
| W17-T04, W17-T05 | skreślić | Zastąpione (PF08, PF07), `network-resilience` i `navigation-and-budgets` istnieją. |
| W18-P01 | skreślić | Objaśnienia wskaźników są (`explanations*`). |
| W18-P02 | zostaje | Motyw nocny zostaje; ciemna mapa po etapie B, bo rusza `AtlasMap.tsx`. |
| W18-P03 | skreślić | Scenę wejścia zastępuje strona startowa. |
| W18-P04 | zmienić | OpenGraph i tytuły dla `/` i `/mapa`; pliki `LibraryVariable`, `Rankings` znikają; po B03. |
| W18-P06 | zostaje | Skróty klawiszowe, niski priorytet; po etapie B. |
| W19-PF01, PF02, PF03, PF04, PF05, PF06, PF07, PF08, PF09 | skreślić | Wszystkie scalone (#482–#491). |
| W2-FIX6A, FIX6B, FIX6C, FIX6D, FIX6E, FIX6F, FIX6G, FIX6H1, FIX6H2, FIX6I, W20-CN03, W4-PM12, W3-PM10, W2-PM02 | skreślić | FIX6 scalone (#492–#502); nie ma już odpytywania adresu (`setInterval` brak w `src`); kamera bez stanu Reacta zrobiona w FIX6H. |
| W2-PM01, W2-PX01, W2-PX02 | skreślić | Zrobione w Q2 (#553). |
| W20-CN01, CN02, CN04, CN05, CN06 | skreślić | Zrobione (`diag.ts`, `fill-transition.ts`, test `s20-*`). |
| W20-CN10-ZAPAS | skreślić | Zapas; wraca tylko, jeśli telefon pokaże artefakty. |
| W21-AN01, AN02, AN03, AN04, AN05, AN06 | skreślić | Zrobione (`fill-blend.ts`, `choropleth-color.ts`, test `s21-animacja-poziomow`). |
| W21-AN07-ZAPAS, W21-AN08-ZAPAS | skreślić | Zapasy niepotrzebne, dopóki artefaktów nie widać na iPhonie. |
| W4-QU03, QU04, QU05, QU06, QU07 | skreślić | Badania zrobione (`docs/research/qu`); wnioski przejęły U04 i U05. |
| W5-QU11, W5-QU12, W5-QU14, W5-QU15, W6-QU16 | skreślić | Dotyczą Biblioteki i Rankingów jako stron oraz porządków, które robią B03, B06, B08, B12. |
| W5-QU13 | zmienić | Przesuwany wykres lat przejmuje B09 (widok Wykres). |
| W5-PC01 | skreślić | Zastępuje go test ścieżki S2 (wybór danych); strażnik PF02 zostaje. |
| W6-QU17 | zmienić | Zamiast „aktualizacji po decyzjach” powstaje `docs/PRODUKT.md` v4 w sesji po Twoich odpowiedziach. |
| W5-PM13 | zostaje | Warunkowe: tylko gdy telefon właściciela pokaże zacinanie przy miejscowościach `[?]`. |
| W5-PM20, W6-PM14 | zostaje | Warunkowe jak wyżej; pomiar „po” robi odbiór B15, a tryb oszczędny tylko przy złym wyniku. |
| W23-U09 | skreślić | To jest to zadanie (po scaleniu PR). |

### 3.2 Katalog `tasks/poczekalnia/Q/`
| Plik(i) | Werdykt | Dlaczego |
|---|---|---|
| README, QC601-CLAUDE, W1-QC101, QC102, QC103, QC105, QC201, QC202, QC301, QC401, QC501, QC510, QC602, QC604, QC605, QC701, QC704, QC801, QC901, QC905, QC906, QC907, QC908, QC909 | skreślić | Fala Q1 scalona (#453–#476); część funkcji (rankingi, „Moje”, „Zamów”) znika w B. |
| W2-QC402 | skreślić | Nie puszczone; zastąpione FIX6C/D. |
| W2-QC405, W2-QC502 | skreślić | Zrobione w Q2 `[?]` pełny zakres QC405; „Moje” znikają. |
| W3-QC106, W3-QC503, W3-QC705 | skreślić | Strona Rankingi i „Moje wskaźniki” znikają; QC705 scalone. |
| W3-QC204, W3-QC606, W3-QC903, W3-QC904, W3-QC912, W3-QC916 | skreślić | Scalone (Q4) lub dotyczą udostępniania ukrytego za `?share=1`. |
| W3-QC303 | zostaje | Mały test „obrys gaśnie po oddaleniu”; po B03 adresy `/mapa`. |
| W4-QC403, W4-QC404, W4-QC504, W4-QC505, W4-QC506, W4-QC508, W4-QC607, W4-QC802, W4-QC803 | skreślić | Scalone w W4 (#556–#570); „Moje”, picker i paski udostępniania znikają w B. |
| W5-QC205, W5-QC507, W5-QC509, W5-QC608, W5-QC609 | skreślić | „Moje wskaźniki”, Biblioteka i Rankingi jako strony znikają. |
| W5-QC406 | zostaje | Strażnik reduced-motion dla ruchu mapy, niezależny od ekranów. |
| W6-QC611 | zmienić | Budżet „wejście = granice + jednostki + 1 plik” przejmują B07 (start) i B15 (mapa). |
| W6-QC806 | skreślić | „Kopiuj link” w Bibliotece: strona znika. |

### 3.3 Katalog `tasks/wstrzymane/` (udostępnianie; kod zostaje za `?share=1`)
| Plik | Werdykt | Dlaczego |
|---|---|---|
| W4-QU01, W4-QU02, W5-QU10, W6-QC917, W7-QC919, W7-QC920, W18-P05 | zostaje | Wstrzymane razem z „Pobierz i udostępnij” (D9); wracają dopiero po osobnej decyzji. |
| W7-QC918 | zmienić | Po powrocie eksport otwiera się tylko z mapy i profilu (pozostałe trzy miejsca znikają). |
| W5-QC915 | skreślić | Panel „Dane na tej stronie” opiera się na „Moich wskaźnikach”. |
| W6-QC804 | skreślić | Strona wskaźnika z biblioteki znika. |
| README | zostaje | Opis folderu. |

---

## 4. Plan budowy (etap B): 15 sesji
Zasady: każde zadanie = jedna sesja, jeden PR `[W<fala>-B<nn>]`; nowa funkcja i jej test ścieżki wchodzą pierwsze, stara funkcja wychodzi z testami w PR zamiennika (PLAN-UPROSZCZENIE §7.5). Pliki „Zmieniaj” poniżej są propozycją; dokładne ścieżki (w tym pliki ekranów chronionych: `Home.tsx`, `AtlasMap.tsx`, `ProfileSheet*.tsx`, `map/hooks/*`) wpisuje sesja zapisu zadań, na podstawie tej listy.

| # | Zadanie | Zmieniaj (propozycja) | Fala | Zależy od | Efekt widoczny na stronie |
|---|---|---|---|---|---|
| B01 | Robot: spis wyboru bez luki 375 i codzienny przebieg | `scripts/data/library-available.mjs`, `.github/workflows/fetch-library.yml`, nowy test w `tests/unit/` | 1 | – | Po nocy w wyborze danych 2 436 zamiast 2 061 wskaźników; w Actions tabela „wg działów”. |
| B02 | Strażnicy ścieżek i `openMap()` (zgoda Z1) | `tests/e2e/helpers/open-map.ts`, 70 plików `tests/e2e/*.spec.ts` (tylko adres), nowe `path-*.spec.ts` (S3, S6, R4 na dzisiejszych trasach) | 1 | – | Nic na stronie; CI zaczyna pilnować ścieżek przed przebudową. |
| B03 | Trasy, menu, nazwa „Faktografia”, przekierowania, prosty ekran startowy | `src/App.tsx`, `Header.tsx`, `SiteFooter.tsx`, `core/url/home.ts`, `index.html`, nowe `src/view/start/StartPage.tsx`, hooki adresu mapy, testy Z2, `path-redirects.spec.ts` (R1–R6) | 2 | B02 | **`/` to ekran startowy** (tytuł, zdanie, 3 kroki, „Otwórz mapę”, przykłady), mapa pod `/mapa`, menu Start/Mapa, stare linki działają, karta przeglądarki „Faktografia”, trasy ładowane leniwie. |
| B04 | Dane strony startowej | nowe `scripts/geo/start-outline.mjs`, `scripts/data/start.mjs`, workflow danych, `public/geo/start-outline.json`, `public/data/start.json`, test na fixture | 2 | – | Nic (gotowe pliki ≤ 25 KB i ≤ 5 KB, odświeżane przez robota). |
| B05 | Wybór danych na komputerze | `src/core/catalog/*` (z prototypu), `src/view/data-menu/*`, `config/synonyms.json`, `IndicatorPanel.tsx`, testy + `path-s2` | 2 | B01 | W panelu jedno menu Dział › Grupa › Wskaźnik z szukajką; tylko pobrane, bez archiwalnych; „Nie mamy jeszcze tych danych”. |
| B06 | Wybór danych na telefonie i koniec Biblioteki | `MobileIndicatorBar.tsx`, `SheetIndicatorPicker`, usunięcie `pages/Library*`, `view/library/*`, `LibraryVariable`, `OrderButton`, `DownloadCsv`, `App.tsx` (przekierowania), testy Z3 (E1, U4, U6), R2 | 3 | B03, B05 | Na telefonie to samo menu; `/biblioteka` i `/biblioteka/101` przenoszą na mapę (`/mapa?i=b101`); znikają „Zamów” i CSV. |
| B07 | Tło animowane i wejście do mapy | nowe `src/view/start/StartBackground.tsx`, `StartPage.tsx`, `core/start/idle-motion.ts` (bez zmian), usunięcie `PortalSections`/`FeaturedComparisons` (przykłady na start), `path-s1`, budżety | 3 | B03, B04 | Na `/` animowany obrys Polski (losowo i za myszą/palcem), płynne przejście kamery do `/mapa`. |
| B08 | Przełącznik widoków i Ranking | `core/url/state.ts` (`v`, `i2`), nowe `view/map/ViewSwitch.tsx`, `view/data/RankingView.tsx`, `AtlasMap.tsx`/`Home.tsx`, usunięcie `pages/Rankings*` i testów Z3 (E3, U1), `path-s4`, R1 | 4 | B06 | Nad mapą cztery zakładki; działa Ranking z filtrem „Województwo”; `/rankingi` → `/mapa?v=ranking`. |
| B09 | Widok Wykres | nowe `core/charts/year-series.ts`, `view/charts/YearLineChart.tsx` (jedna linia, dwie skale przy dwóch wskaźnikach) | 5 | B08 | Zakładka Wykres: lata dla miejsca (bez miejsca: największa jednostka) i mediana poziomu. |
| B10 | Widok Tabela | nowe `view/data/DataTable.tsx`, `core/data/table-rows.ts` | 5 | B08 | Zakładka Tabela z szukaniem i sortowaniem; klik wiersza wybiera miejsce. |
| B11 | Druga mapa (komputer) | nowe `core/map/camera-sync.ts`, `view/map/ComparePanes.tsx`, `AtlasMap.tsx`, `core/url/state.ts` (`i2`) | 5 | B08 | Przycisk „+ Druga mapa”: dwa wskaźniki obok siebie, wspólna kamera, rok i poziom, zaznaczenie na obu. |
| B12 | Druga mapa (telefon) i koniec Porównaj | `ComparePanes.tsx` (układ), usunięcie `ComparePage`, `CompareShare`, `PlacePicker`, `compare-url`, testy Z3 (E2, U3), `path-s5`, R3 | 6 | B11 | Telefon: mapy jedna pod drugą (zapas: A/B); `/porownaj` → `/mapa`; test na telefonie właściciela. |
| B13 | Profil uproszczony i koniec „Moich wskaźników” | `ProfileSheet*.tsx`, `ProfileIndicatorList`, `ProfileCompare`, `useShareData`, `Privacy.tsx`, usunięcie `core/my-indicators`, `useMyIndicators`, `MyIndicators*`, testy Z4, „Kopiuj link” w nagłówku mapy | 5 | B06 | Krótki profil ze stałym zestawem; brak list użytkownika; „Kopiuj link” zawsze widoczny; zapisany klucz „Moich” usuwany po cichu. |
| B14 | Sprzątanie | usunięcie `IntroOverlay`, prototypów `/__test/proto*`, działów w stopce, napisu „Rekordy Polski”, `@observablehq/plot` (`package.json`, `ELEMENTY.md`, za zgodą P2), dopisek o kontakcie w „O projekcie” | 7 | B07, B09, B10, B12, B13 | Nic nowego na ekranie; mniej kodu (ok. 3 800 linii z U01) i zielone CI. |
| B15 | Odbiór | `path-s7`, `path-s8`, pomiar liczby kliknięć (skrypt U02), PRODUKT v4 uzupełnienia | 8 | B14 | Wynik „przed/po” wg limitów U02 (a ≤ 3, b ≤ 3, c ≤ 4, d ≤ 3, e ≤ 3, f = 1 kliknięcie), test na telefonie właściciela, zrzuty przez „Update snapshots”. |

**Kolejność fal:** 1 (B01, B02) → 2 (B03, B04, B05) → 3 (B06, B07) → 4 (B08) → 5 (B09, B10, B11, B13) → 6 (B12) → 7 (B14) → 8 (B15). Zadania jednej fali nie dzielą plików. **Pierwsza widoczna zmiana: fala 2 (B03).**

**Poza liczbą 15 (osobne, krótkie):**
- Sesja zapisu zadań B i `docs/PRODUKT.md` v4 (po Twoich odpowiedziach z sekcji 2; przenosi pliki wg sekcji 3).
- U03b: przegląd serwisów na żywo (po dopuszczeniu hostów), jedna sesja, tylko raport.
- U11b: zbieranie wyborów wskaźników do `popularIds` (zdarzenie analityki po zgodzie; dotyka `src/core/consent`, więc osobna zgoda w zadaniu), po tygodniu od B01.
- Zadania warunkowe po odbiorze: PM13, PM14, W18-P02, W18-P04, P2-A, P4-C, W18-P06 (zob. sekcja 3).

**Ryzyka i zabezpieczenia:** (1) najdroższy krok to zmiana adresu `/` → `/mapa` w 70 plikach e2e; dlatego B02 poprzedza B03 i niczego nie zmienia na stronie. (2) „Moje wskaźniki” podpierają profil i porównanie, więc znikają dopiero w B13, po wyborze danych. (3) Dwie mapy to 4 konteksty WebGL i drogi rysunek na powiatach (U06, SwiftShader); werdykt o płynności daje Twój telefon przed zamknięciem B12. (4) Wydajność wyboru danych: szukajka na lekkim `available.json` (34 kB po kompresji), nigdy na pełnym `index.json` (7,9 MB). (5) Wzorce zrzutów odświeża tylko workflow „Update snapshots” po B03, B08 i B15.
