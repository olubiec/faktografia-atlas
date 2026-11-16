# AUDYT-DANYCH – kontrakty danych (public/data, scripts/data, tests/unit)

Data audytu: 16.11.2026. Tylko odczyt: żadnego pliku danych ani kodu nie zmieniono. Dane wskaźników pobrane 19.10.2026 (`fetchedAt`), czyli ok. 4 tygodnie temu.

## Co jest w porządku (sprawdzone skryptem na pełnych plikach)
- `units.json`: 2875 jednostek (16 woj. + 380 pow. + 2479 gmin). Wszystkie kody TERYT to stringi o właściwej długości (2/4/7), z zerami wiodącymi (`"02"`, `"0201011"`), bez duplikatów i bez osieroconych rodziców; każda jednostka ma `bdlId`.
- `localities.json`: 54 265 miejscowości, `id` zawsze string, `gminaTeryt` zawsze wskazuje istniejącą gminę, brak duplikatów `id`.
- `values/*.json` (20 plików): klucze to stringi 2/4/7-znakowe, żadnego klucza spoza `units.json`, długość każdej serii = liczba lat, brak wartości tekstowych, brak ujemnych tam, gdzie nie powinny być (ujemne tylko przyrost naturalny i saldo migracji), brak wartości >100 % poza przedszkolami (patrz niżej).
- Formatowanie: `src/core/format/number.ts` używa `pl-PL`, przecinka dziesiętnego, spacji niełamiącej jako separatora tysięcy i przed jednostką; „brak danych” dla null.

## Niespójności – priorytety

### P1 (wysoki) – widoczne dla czytelnika
1. **Przedszkola powyżej 100 %.** `preschool-3-6`: m.in. gmina `2417052` w 2014 = **203,6 %**, powiat `1006` 2023 = 100,4 %, 2024 = 102,5 %; `1013` 2024 = 102,4 %; `1061` 2022 = 104,5 %. Wskaźnik „odsetek dzieci objętych wychowaniem” nie może przekraczać 100 % (przyczyna: dzieci z sąsiednich gmin w licznikach). Brak przypisu ani ograniczenia w `config/indicators.json` (`footnote` mają tylko `avg-wage` i `cars-per-1000`). Legenda i „najwyżej” pokażą liczby >100 % bez wyjaśnienia.
2. **Mediana wieku: rok 2026 i dziura w ostatnim roku.** `median-age` ma lata 2023–2026 (jedyny wskaźnik z rokiem 2026; reszta kończy się na 2025, przedszkola na 2024), a **6 gmin ma `null` w 2026**, np. `1412142` Stanisławów, `1416052` Małkinia Górna, `1419142` Staroźreby. Domyślny rok wskaźnika (ostatni) zostawi te gminy na szaro, a suwak lat pokaże „2026” przy wskaźnikach, które nie mają go w ogóle. Sprawdzić, czy 2026 to prognoza BDL i czy etykieta to mówi.
3. **Niejednolity „ostatni rok” między wskaźnikami.** population/density/… 2025, preschool 2024, median-age 2026. Porównanie dwóch wskaźników na jednym roku i wiersze profilu bez zaznaczenia, że rok jest inny, mogą wprowadzać w błąd. Świeżość strony (`loadFreshnessLabel`) liczy się **tylko z `density.json`** (komentarz w `freshness-label.ts` sam to przyznaje), więc stopka mówi o jednej dacie (19.10.2026) dla wszystkich 20 plików. Dziś wszystkie mają tę samą datę, ale przy częściowej aktualizacji stopka skłamie.
4. **Dziewięć wskaźników bez właściwego hasła GUS.** W `explanations.json` aż 9 z 20 pozycji (`unemployed-share-working-age`, `income-per-capita`, `spending-per-capita`, `regon-per-10k`, `dwellings-per-1000`, `dwelling-area-per-person`, `sewerage-share`, `preschool-3-6`, plus `population`) ma `definitionUrl` = ogólny adres słownika `.../pojecia-stosowane-w-statystyce-publicznej/` bez numeru hasła (reszta ma `/NNNN,pojecie.html`). Link „Co to znaczy w GUS” prowadzi więc na stronę ogólną. Znane z STAN.md (R9.6), ale nadal otwarte. Dodatkowo `world` i `funFact` są `null` we wszystkich 20 pozycjach.

### P2 (średni)
5. **Gminy bez miejscowości (6)**: `0601052` Janów Podlaski, `1412142` Stanisławów, `1416052` Małkinia Górna, `1419142` Staroźreby, `1602022` Branice, `2404032` Janów – brak ich w `localities.json`. Wyszukiwarka nie znajdzie ich miejscowości; trzy z nich to te same gminy, które mają dziurę w median-age 2026 (`1412142`, `1416052`, `1419142`) – podejrzenie wspólnej przyczyny: zmiana kodu/rodzaju gminy (końcówka kodu `2`, gmina wiejska, ale współistnieje miasto) w TERYT/BDL.
6. **Dziewięć gmin bez pliku w `preschool-3-6`** (2866 kluczy zamiast 2875): `0614053`, `0614063`, `0614103`, `1207132`, `1436013`, `2002162`, `2212063`, `2602083`, `3025053`. Pozostałe 19 plików gmin pokrywa 100 %. Raport `docs/data-report.md` pokazuje 99,6 % – zgadza się, ale nic nie tłumaczy użytkownikowi, dlaczego na mapie te gminy są puste.
7. **Wskaźniki tylko do powiatu** (`avg-wage`, `tourist-nights-per-1000`, `cars-per-1000`, `unemployment-rate`): pliki mają 396 kluczy, brakuje 2479 gmin (zgodnie z `minLevel: "pow"`). Poprawne, ale po przełączeniu poziomu na „gminy” mapa i ranking dla tych czterech wskaźników muszą pokazać komunikat, a nie same szare pola. Sprawdzić na stronie.
8. **Etykiety wskaźników: jednostka dwa razy lub różne formy.**
   - W nazwie jest jednostka w nawiasie *i* osobne pole `unit`: „Udział ludności 65+ (%)”, „Lesistość (%)”, „Gęstość zaludnienia (os./km²)”, „Przeciętne wynagrodzenie brutto (zł)”, „Dochody budżetu gminy na mieszkańca (zł)”. Wartość sformatowana to „12,3 % ” obok nazwy z „(%)” – dubel; pozostałe nazwy (np. „Mediana wieku”, „Ludność ogółem”) nie mają nawiasu. Jedna konwencja.
   - Skrót „Przeciętna pow. użytkowa mieszkania na osobę (m²)” – „pow.” to skrót od „powierzchnia”, a przy powiatach (`pow` jako poziom) wprowadza w błąd.
   - Jednostki „na 1000” i „na 10 tys.” – cyfra bez spacji tysięcy w jednym, słowo „tys.” w drugim; wystarczy zdecydować: „na 1000 mieszk.” / „na 10 000 mieszk.”.
   - „os./km²” (skrót) vs „osoba” (słowo) – w `UNIT_FRACTION_DIGITS` jest też `'osoby'`, którego żaden wskaźnik nie używa (martwy wpis).
   - `description` w `indicators.json` i `short` w `explanations.json` to dwa różne opisy tego samego; użytkownik może zobaczyć oba z różną treścią (np. „Różnica między zameldowaniami a wymeldowaniami” vs treść objaśnienia). Dopilnować jednego źródła.
9. **Liczba miejsc po przecinku vs dane.** `natural-increase` i `migration-balance` mają w danych do 2 miejsc po przecinku (np. −36,59), a format pokazuje 1 (`na 1000` → 1). To zaokrąglenie (−36,6) jest w porządku, ale **ranking i „najniżej” mogą pokazać remis dla różnych wartości** (np. −36,59 i −36,55 → oba −36,6, a kolejność wynika z drugiego miejsca). Do sprawdzenia w tabeli rankingu.
10. **`higherIsBetter` dla przyrostu naturalnego i salda migracji = true**, a dla `spending-per-capita`, `density`, `median-age`, `share-65plus` = `null` (neutralne). Wydatki gminy i mediana wieku są neutralne, ale wyższy udział 65+ w kolorach legendy nie powinien być ani „dobry”, ani „zły” – sprawdzić na legendzie, czy neutralne wskaźniki mają paletę neutralną, a przyrost/migracja – kierunkową z wyjaśnieniem.

### P3 (niski)
11. **Nazwy gmin się powtarzają**: 236 par (nazwa, poziom) występuje więcej niż raz (226 gmin, 10 powiatów), np. „Bolesławiec” (2 gminy: miejska i wiejska), „Dzierżoniów”, „Głogów”, „Wąsosz”, „Kamienna Góra”. Rodzaj gminy rozróżnia ostatnia cyfra TERYT (1 = miejska 302, 2 = wiejska 1459, 3 = miejsko-wiejska 718), a wyszukiwarka dopisuje „(miasto)”. Sprawdzić okruszki, nagłówek profilu, kartę PNG i nazwę pliku CSV – tam rodzaj może zniknąć i dwie różne gminy wyglądają jednakowo.
12. **Seria `population` zaczyna się w 1995, reszta w 2002/2003/2011** (`unemployment-rate` od 2011). Suwak lat w tabeli porównawczej zaczyna się od różnych lat – poprawne, ale oznaczyć na wykresie „dane od 2011”.
13. **Źródło/przypisy.** `formatSource` zwraca „Źródło: GUS, BDL, <rok>” – bez daty pobrania, bez numeru zmiennej BDL (jest w `bdlVarId`, nie w interfejsie) i bez linku do tej zmiennej. Przypisy (`footnote`) istnieją tylko dla 2 z 20 wskaźników; wskaźniki z potencjalnym zniekształceniem (przedszkola >100 %, liczba REGON w dużych miastach, dochody budżetu z jednorazowych dotacji) bez uwag.
14. **Testy kontraktu** (`tests/unit/data-contract.test.ts`, `scripts/data/contract.mjs`) sprawdzają kształt plików, ale nie łapią: wartości >100 % dla wskaźników procentowych, roku późniejszego niż `fetchedAt`, serii z `null` w ostatnim roku dla >0 gmin, rozbieżności `units.json` ↔ `localities.json` (gminy bez miejscowości), spójności `explanations.json` z `definitionUrl` pustym (bez numeru hasła). Proponowane nowe testy w osobnym zadaniu (nie zmieniać istniejących).

## Propozycje zadań (każde = jeden PR, według AGENTS.md)
- Z1: Test kontraktu: wskaźniki z jednostką „%” ≤ 100 (z listą wyjątków i przypisem dla przedszkoli) + przypis dla `preschool-3-6`.
- Z2: Rok 2026 w `median-age`: potwierdzić źródło, w razie prognozy – oznaczyć etykietą lub odciąć.
- Z3: Świeżość ze wszystkich plików wartości (najstarszy `fetchedAt`), nie tylko z `density`.
- Z4: Uzupełnić 9 `definitionUrl` w `explanations.json` (po akceptacji tekstów właściciela, W1.9/R9.6).
- Z5: Ujednolicić nazwy i jednostki wskaźników (bez „(%)” w nazwie, bez „pow.”) – zmiana `config/indicators.json` wymaga zgody właściciela.
- Z6: Zbadać 6 gmin bez miejscowości i 9 gmin bez przedszkoli (zmiana TERYT?).

## Co sprawdzić na stronie (z telefonu, kolejność ważności)
1. Mapa → wskaźnik „Wychowanie przedszkolne” → ostatni rok → „Najwyżej”: czy któryś powiat/gmina pokazuje powyżej 100 %; czy jest wyjaśnienie? W profilu gminy `2417052` (wyszukaj w Wyszukiwarce, powiat/gmina wg TERYT) obejrzyj wykres lat (2014 = 203,6 %).
2. Mapa → „Mediana wieku” → suwak lat: czy dochodzi rok 2026 i czy gminy Stanisławów, Małkinia Górna, Staroźreby na nim są szare; porównaj z „Gęstość zaludnienia”, która kończy się na 2025.
3. Stopka na dowolnej stronie: data świeżości – czy zgadza się z 19.10.2026 i czy jest jedna dla wszystkich wskaźników.
4. Panel wskaźnika → „Co to znaczy”: dla Dochody, Wydatki, REGON, Mieszkania, Kanalizacja, Przedszkola, Bezrobotni (udział) kliknij link do GUS – czy trafia na konkretne hasło, czy na ogólny słownik.
5. Przełącznik poziomu → „Gminy” przy „Przeciętne wynagrodzenie”, „Noclegi”, „Samochody”, „Stopa bezrobocia”: czy jest komunikat, że dane są tylko dla powiatów.
6. Wyszukiwarka: „Bolesławiec”, „Wąsosz”, „Janów” – czy da się odróżnić gminy (miasto/wieś) w wynikach, okruszkach i profilu; „Janów Podlaski”, „Stanisławów”, „Branice” – czy znajdą się miejscowości.
7. Liczby: „Ludność ogółem” gminy ≥ 1 000 – separator tysięcy (spacja) i brak łamania liczby od jednostki w wąskiej kolumnie telefonu; przyrost naturalny – przecinek i znak minus (−, nie dywiz).
8. Lista nazw wskaźników (panel + profil + karta PNG): czy „(%)” w nazwie nie dubluje „%” przy liczbie.
