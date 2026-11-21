# Faktografia – co budujemy (v4)
**Dla kogo:** osoba ciekawa swojej okolicy (mieszkaniec, dziennikarz, uczeń, samorządowiec), najczęściej z telefonu (§5).
**Problem:** dane GUS o gminach i powiatach są w tabelach Banku Danych Lokalnych; nie da się ich szybko zobaczyć na mapie ani porównać.
**Jak ma być:** prosto, bardzo prosto. Dwa ekrany: strona startowa `/` i jedyny ekran pracy `/mapa`. Jedno miejsce wyboru danych. Cztery widoki tych samych danych. Dwie mapy obok siebie. Profil miejsca.
**Czego NIE robimy:** kont użytkowników, liczb wpisywanych ręcznie lub przez AI, śledzenia osób, Google Maps, generatora serii slajdów pod konta Faktografii w tym repo (pełna lista: `docs/ARCHITEKTURA.md` §7). „Pobierz i udostępnij” jest wstrzymane (§4b).
**Zarabia:** nie. **Dane osób:** nie – tylko anonimowe statystyki po zgodzie.
**Technologia:** Vite + React + TypeScript, MapLibre + deck.gl, dane statyczne z robota GUS (`docs/ARCHITEKTURA.md`, elementy: `docs/ELEMENTY.md`). **Hosting:** Vercel (podgląd każdego PR).
**Gdzie jesteśmy:** `docs/STAN.md` · plan przebudowy: `docs/PLAN-DOCELOWY.md`, fale: `docs/PLAN-FALE-B.md` · wygląd: `docs/STYL.md` + makiety `docs/design/`.

Wersja 4 · 21.11.2026 (v3: 24.10.2026). Zmiany v4: plan uproszczenia (`docs/PLAN-UPROSZCZENIE.md`): strona startowa, `/mapa`, jedno menu wyboru danych, cztery widoki, dwie mapy, profil bez „Moich wskaźników”; znikają strony Rankingi, Biblioteka, Porównaj, „Moje wskaźniki”, „Zamów wskaźnik” i CSV. Numery sekcji §6–§9 bez zmian (powołują się na nie inne dokumenty).
Opisy ekranów niżej są wymaganiami – mają pierwszeństwo przed starymi promptami i kodem. Stan budowy: zadania `tasks/W23-B*.md`.

---

## 1. Zasady
1. **Prostota** (`docs/PLAN-UPROSZCZENIE.md` §7): jeden ekran pracy; element ma jedno zadanie; w menu najwyżej 2 pozycje; 4 widoki danych; nowa funkcja tylko z testem ścieżki użytkownika; usunięcie funkcji = usunięcie jej kodu i testów w tym samym PR.
2. Budujemy **ekran jako całość** i oglądamy go na podglądzie (komputer i telefon) przed scaleniem.
3. Szybkość i wygląd mają **mierzalne progi** (§7) i testy na prawdziwych danych.
4. **Dane archiwalne i niepobrane wskaźniki nie są pokazywane**; brak wyniku to „Nie mamy jeszcze tych danych”.

## 2. Dla kogo i po co
Osoba chce w minutę: (1) zobaczyć, jak jej gmina lub powiat wypada na tle innych w jednej sprawie; (2) zobaczyć „wszystko o moim miejscu”; (3) zrozumieć, co znaczy liczba; (4) wysłać komuś link do tego samego widoku (przycisk „Kopiuj link”, §3.2).

## 3. Ekrany

### 3.1 `/` – strona startowa (telefon i komputer ten sam układ)
- Nagłówek: „Faktografia”, szukajka miejsca, motyw dzień/noc; menu: **Start · Mapa**.
- W tle animowany obrys Polski (16 województw, własny SVG), w kolorach aktualnych danych (`public/data/start.json`). Gdy nikt nic nie robi, rusza się losowo; gdy rusza się mysz lub palec, reaguje (podświetlenie województwa pod palcem lub kursorem i fala); stuknięcie albo kliknięcie w województwo otwiera mapę na nim, a przeciągnięcie palcem po obrysie przewija stronę. Cykl czterech wskaźników co 5 s (ludność, bezrobocie, wynagrodzenie, gęstość); **pierwszy kadr, `prefers-reduced-motion` i stan bez JS = ludność**. Podpis „Stopa bezrobocia, 2025 · mazowieckie: 3,1 %” tylko gdy animacja reaguje.
- Treść (zatwierdzona): „Zobacz, jak wypada Twoja gmina na tle całej Polski, na danych GUS.” + trzy kroki: „1. Wybierz dane, np. bezrobocie albo ludność. 2. Dotknij miejsca na mapie. 3. Zobacz profil i porównaj z innym miejscem.” + jedyny przycisk główny **„Otwórz mapę”** (≥ 44 px). Pod spodem „Przykłady”: 6 miejsc i 6 par (linki `/mapa?…`).
- Stopka: ok. 6 linków (Mapa · O projekcie · Skąd są dane · Prywatność i zgoda · GitHub · CC BY 4.0).
- Budżety: obrys ≤ 25 KB (≤ 10 KB gzip), `start.json` ≤ 5 KB, 0 pobrań wartości wskaźników i `units.json` w pierwszych 3 s (potem, w wolnej chwili, rozgrzewka danych mapy: lista jednostek i granice, ale nie przy oszczędzaniu danych ani wolnej sieci; od razu przy najechaniu, dotknięciu lub fokusie na „Otwórz mapę”), p95 klatki ≤ 33 ms (SwiftShader ×4 CPU, orientacyjnie), jedna pętla animacji, pauza przy ukrytej karcie.
- Stare linki `/?u=…&i=…&y=…&l=…&c=…&sheet=…` przekierowują (replace) na `/mapa` z tym samym zapisem; `/` bez parametrów i `/?logo=znak` zostają stroną startową.

### 3.2 `/mapa` – jedyny ekran pracy (komputer, ≥ 1024 px)
```
┌ Faktografia ───────────── [Szukaj miejsca Ctrl K] [Kopiuj link] [Motyw] ┐
│┌ Panel ───────────┐  Polska / małopolskie                                │
││[Wybierz dane ▾]  │  [ Mapa | Wykres | Tabela | Ranking ] [+ Druga mapa] │
││Poziom [Woj][Pow] │       MAPA (lub wykres / tabela / ranking)           │
││       [Gmi]      │       ten sam wskaźnik, rok, poziom i miejsce        │
││Legenda 5 klas    │                           ┌ dymek: nazwa, wartość,   │
││Rok ───────■ 2025 │                           │ miejsce, Otwórz profil → │
││Najwyżej/najniżej │                           └──────────────────────────┘
│└──────────────────┘                                                      │
└ O projekcie · Źródła · Prywatność ───────────────────────────────────────┘
```
- Domyślnie mapa w kolorach (domyślny wskaźnik: gęstość zaludnienia), poziom: województwa. Panel: nazwa wskaźnika jest przyciskiem otwierającym wybór danych (§3.3), poziom Woj/Pow/Gmi (gminy tylko dla wskaźników, które je mają), legenda z opisem klas i „brak danych”, rok suwakiem, najwyżej/najniżej (5+5), źródło, (?) z objaśnieniem (§6).
- **„Kopiuj link”** stale w nagłówku `/mapa` (i w profilu): jedno kliknięcie, „Skopiowano”. „Pobierz i udostępnij” niewidoczne (`?share=1`, §4b).
- Adres: `?v=mapa|wykres|tabela|ranking` (domyślnie mapa, pomijana), `i`, `i2` (drugi wskaźnik), `y`, `l`, `u`, `c`, `w` (województwo w rankingu), `menu=dane` (otwiera wybór danych), `q` (fraza). Zmiana widoku nie czyści pozostałych.
- Dymek po najechaniu (komputer) lub pierwszym dotknięciu (telefon): nazwa, wartość z jednostką, miejsce, „Otwórz profil”. Zwykły tekst, bez HTML.

### 3.3 Wybór danych – jedno menu zamiast siedmiu miejsc
- **Dział › Grupa › Wskaźnik** (3 poziomy) + szukajka po całym spisie (`minisearch`, synonimy w `config/synonyms.json`: zarobki → wynagrodzenie). Tylko pobrane wskaźniki, bez grupy „Dane archiwalne”. W dziale najpierw „★ Najważniejsze”. Kolejność działów z `config/library-priority.json`. Pozycje bez danych na bieżącym poziomie są wyłączone.
- Komputer: okno z dwiema kolumnami (działy | grupy i lista, po 50 + „Pokaż więcej”). Telefon: arkusz, jeden widok naraz z okruszkami „Wszystkie › Dział › Grupa”.
- Brak wyniku: „Nie mamy jeszcze tych danych o „…”. Najbliższy dział: …” (bez „Zamów”).
- To **ten sam komponent** w panelu mapy, na telefonie, w drugiej mapie i w profilu miejsca. Źródło: lekki `library/available.json` (jedno żądanie, nigdy pełny `index.json`). Robot dokłada kolejne wskaźniki codziennie (2 × 3 000 zapytań na dobę wg wag działów).

### 3.4 Widoki jednego wskaźnika (zawsze ten sam rok, poziom, miejsce)
- **Mapa** – jak w §3.2.
- **Wykres** – własny SVG: linia lat dla wybranego miejsca + przerywana mediana poziomu. Bez wybranego miejsca: jednostka o najwyższej wartości na poziomie, z napisem „Wybierz miejsce na mapie”. Dwa wskaźniki: **jeden wykres z dwiema skalami** (lewa A, prawa B, różne kolory i style linii, podpisane osie); ryzyko mylnego odczytu pilnuje test czytelności na 390 px.
- **Tabela** – szukaj, sortowanie po nazwie i wartości, kolumny Miejsce | Wartość (rok) | Miejsce w rankingu; dwa wskaźniki = dwie kolumny; klik wiersza ustawia `u` i zostaje w widoku.
- **Ranking** – poziome słupki poziomu i roku; filtr „Województwo ▾” (ranking w obrębie województwa); wybrane miejsce wyróżnione i zawsze widoczne; dwa wskaźniki = dwa rankingi pod sobą.
- Telefon: zakładki widoków w jednym rzędzie (4 × ≥ 90 px, pola ≥ 44 px).

### 3.5 Dwie mapy
- Przycisk „+ Druga mapa”: dwa wskaźniki obok siebie, **wspólna kamera, rok i poziom**, osobna legenda pod każdą mapą, klik zaznacza miejsce na obu, pod mapami wartości A i B dla zaznaczonego miejsca, × zamyka drugą.
- Telefon: jedna pod drugą (po ok. 40% ekranu); zapas: przełącznik A/B (druga instancja odmontowana). Wykres punktowy A × B – później.

## 4. Profil miejsca (komputer: kolumna 440 px obok mapy; telefon: dolny arkusz)
- Nagłówek: rodzaj i nazwa („Gmina miejsko-wiejska Wadowice”), TERYT (jako tekst), ×. Zakładki: **Przegląd** · **Gminy (n)** / **Powiaty (n)** · **Porównaj z innym miejscem**. Nic nie jest nałożone na mapę; na telefonie mapa nad arkuszem pozostaje dotykalna (40% → pełna wysokość).
- **Przegląd:** blok bieżącego wskaźnika (nazwa, rok, DUŻA liczba, „149. z 380” w jednym zakreśleniu) z przyciskiem **„Zmień wskaźnik”**, który otwiera to samo menu danych (§3.3), nie osobną listę; ranking jednostek w województwie (słupki, wybrane wyróżnione); **stały zestaw 7 podstawowych wskaźników** (Ludność ogółem · Gęstość zaludnienia · Przyrost naturalny · Saldo migracji · Udział ludności 65+ · Stopa bezrobocia · Przeciętne wynagrodzenie), klik w wiersz rozwija wykres lat, objaśnienie i „Pokaż na mapie”.
- „Kopiuj link”, źródło. Nie ma listy użytkownika, „+ Dodaj wskaźnik” ani „Moich wskaźników”.
- Zapisany w przeglądarce klucz dawnych „Moich wskaźników” jest usuwany po cichu.

### 4a. Porównanie dwóch miejsc (w profilu)
Zakładka „Porównaj”: tabela dwóch miejsc (wiersze stałego zestawu + wskaźnik wybrany menu danych; wartości, miejsca w rankingu, słowna różnica, kolory neutralne) i dwie małe mapki SVG z obrysem miejsc. Link `?u=A&c=A,B`. Dowolne dwa miejsca, także różnych poziomów (dopisek „różne poziomy – porównuj ostrożnie”). **Osobna strona `/porownaj` znika**; dwa wskaźniki dla jednego obszaru = druga mapa (§3.5).

### 4b. Pobierz i udostępnij – WSTRZYMANE (decyzja D9, 20.11.2026)
Przycisk, okno z kartami PNG i CSV są niewidoczne; kod żyje za przełącznikiem `?share=1` (`src/core/share/share-flag.ts`) i zostaje bez zmian. Zadania w `tasks/wstrzymane/`. Wrócą po osobnej decyzji; wtedy eksport otwiera się tylko z mapy i profilu. Zasady (licencja CC BY 4.0, źródło GUS na każdej karcie, logo z `public/brand/`) są w historii tej sekcji (v3) i w `tasks/wstrzymane/`.

### 4c. Miasto i obszar wiejski w gminach miejsko-wiejskich (bez zmian względem v3)
Dotyczy tylko gmin miejsko-wiejskich (TERYT 7 cyfr kończy się na 3). W profilu zwijany blok „Miasto i obszar wiejski”; rozwinięcie pobiera **jeden** plik `public/data/parts/<teryt województwa>.json`; 14 wskaźników z `config/parts.json`; kolumny Gmina · Miasto · Obszar wiejski; brak wartości → „brak danych”; telefon: karta na wskaźnik. Nie pokazujemy dochodów i wydatków na mieszkańca dla części ani osobnych obrysów miasta i wsi.

### 4d. Dawna Biblioteka GUS – zastąpiona wyborem danych
Strony `/biblioteka` i `/biblioteka/<id>` znikają. Stary adres `/biblioteka` → `/mapa?menu=dane` (z `q=` przy frazie), `/biblioteka/101` → `/mapa?i=b101`. Wskaźnik z biblioteki ma id `b<id>` i działa na mapie, w widokach, w drugiej mapie; **nie** w stałym zestawie profilu (profil = jeden plik na województwo). Znikają „Zamów wskaźnik” i „Pobierz CSV”.

### 4e. Rankingi, „Moje wskaźniki”
Strona `/rankingi` zastąpiona widokiem Ranking (§3.4): stary adres → `/mapa?…&v=ranking`. „Moje wskaźniki” usunięte (§4).

## 5. Telefon (< 768 px)
- Nagłówek ≤ 56 px: logo, lupa, menu (Start, Mapa, motyw). Mapa na cały ekran pod nagłówkiem (≥ 75% wysokości, `dvh`, `safe-area`).
- **Dolny pasek wskaźnika** (nazwa, rok, legenda; ≥ 48 px); dotknięcie otwiera wybór danych (arkusz). Widok nazwy, roku i legendy zostaje widoczny nad paskiem zgody.
- Dymek po pierwszym dotknięciu jednostki, drugie dotknięcie otwiera profil. Profil: dolny arkusz (40% → pełny), mapa nad nim dotykalna, wybrane miejsce widoczne.
- Zakładki widoków w jednym rzędzie; dwie mapy jedna pod drugą. Naraz otwarty najwyżej jeden arkusz. Okruszki w jednej linii, „‹” jak „Wróć”.
- Pasek zgody ≤ 15% wysokości, znika po wyborze. Pola dotykowe ≥ 44 px, brak poziomego przewijania przy 360 i 390 px. Tablet (≥ 768 px) = układ komputera.

## 5a. Wejście w głąb mapy (komputer i telefon; bez zmian względem v3)
Wybór województwa lub powiatu: kamera płynnie podjeżdża (ok. 600 ms), jednostki niższego poziomu pojawiają się kafelek po kafelku (cała fala < 1 s), reszta Polski zostaje wyblakła. „Wróć” i okruszki: ruch odwrotny (ok. 400 ms). Zmiana wskaźnika lub roku: kolory przelewają się w 300 ms. Przybliżanie kółkiem, dwoma palcami i „+ / −” jest płynne. Obrys wybranej jednostki gaśnie, gdy zajmuje < ok. 2% szerokości mapy. Otwarcie linku z `?u=` i zmiana rozmiaru okna – bez animacji. `prefers-reduced-motion` – wszystko od razu.

## 6. Objaśnienia wskaźników
Dla wskaźnika (opcjonalnie) wpis w `public/data/explanations.json`: `short` (≤ 160 znaków), `howToRead` (≤ 240), `world` (≤ 240 + `source`, `url`, `year`; jeśli definicje się różnią, napisać to wprost), `funFact` (≤ 200 + `source`, `url`), `definitionUrl`. Każda liczba i ciekawostka ma źródło z linkiem; **akceptuje właściciel** przed publikacją. Brak wpisu = brak przycisku (?). Blok „Na tle kraju” (miejsce, mediana, najmniej–najwięcej) liczy się sam z danych.

## 7. Szybkość (progi sprawdzane testem w CI)

| Sytuacja | Próg |
|---|---|
| Strona startowa `/` | obrys ≤ 25 KB, `start.json` ≤ 5 KB; zero pobrań wartości wskaźników, `units.json`, `localities` w pierwszych 3 s (potem rozgrzewka danych mapy, patrz §3.1); JS wejścia ≤ 150 KB po kompresji `[?]` (trasy ładowane leniwie) |
| Wejście na `/mapa` | granice + lista jednostek + **jeden** plik wskaźnika domyślnego; żadnego `profiles/*` ani pełnego `index.json` |
| Wybór miejsca | **dokładnie jedno** żądanie danych profilu (`profiles/<województwo>.json`) |
| Zmiana wskaźnika | jedno żądanie `values/<id>.json` (jeśli nie było w pamięci); dla `b<id>` jedno żądanie pliku wartości biblioteki |
| Otwarcie wyboru danych | jedno żądanie `library/available.json` (< 50 KB po kompresji); nigdy pełny `index.json` (7,9 MB) |
| Druga mapa | jedno dodatkowe żądanie pliku wartości drugiego wskaźnika; p95 klatki na województwach ≤ 33 ms (SwiftShader ×4, orientacyjnie) |
| Profil gminy miejsko-wiejskiej | bez dodatkowych żądań; dopiero rozwinięcie „Miasto i obszar wiejski” = jedno żądanie `parts/<województwo>.json` |
| Pliki danych | bez wcięć (`JSON.stringify` bez spacji) |
| Odczuwalnie (właściciel na podglądzie, także na telefonie) | mapa w kolorach ≤ 3 s na zwykłym laptopie; otwarcie profilu bez widocznego zacięcia; tło strony startowej płynne |

## 8. Definicja „gotowe” dla zadań z UI (dodatkowo do AGENTS.md)
1. Zgodne z opisem ekranu w tym dokumencie na 1440×900 i 390×844; różnice wypisane w PR.
2. Działa **na prawdziwych danych** z `public/data` (nie tylko na danych syntetycznych w teście).
3. Nowa funkcja ma **test ścieżki użytkownika** (`tests/e2e/path-*.spec.ts`, znacznik `@PATH-n`), nie tylko „czy się renderuje”.
4. Właściciel przed scaleniem ogląda podgląd Vercel na komputerze i telefonie według sekcji „Po ludzku” w PR (lista kontroli: `docs/PLAN-FALE-B.md`).
5. Progi z §7 przechodzą.

## 9. Kolejność
**Od 21.11.2026 plan odchudzony:** w kolejce tylko B13 i B14 (zmniejszone); widoki Wykres/Tabela/Ranking w mapie, druga mapa i koniec stron Rankingi/Porównaj są odłożone (`tasks/odlozone/README.md`) – opisy tych ekranów wyżej to cel na później, nie wymaganie na start. Plan budowy etapu B (15 zadań, 8 fal budowy) i kto co sprawdza: `docs/PLAN-FALE-B.md`; pliki zadań: `tasks/W23-B01…B15` (+ `W23-U03b`, `W23-U11b`). Zadania wstrzymane: `tasks/wstrzymane/`; zadania warunkowe po odbiorze: `tasks/poczekalnia/`. Odbiór (B15): liczba kliknięć sześciu typowych zadań w limitach z badania U02 (a ≤ 3, b ≤ 3, c ≤ 4, d ≤ 3, e ≤ 3, f = 1 kliknięcie) i test nr 0 na telefonie właściciela.
