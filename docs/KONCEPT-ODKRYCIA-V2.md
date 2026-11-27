# Odkrycia v2 – „Twoje miejsce bez retuszu” (27.11.2026)

Status: **propozycja do decyzji właściciela** (§10). Makieta telefonu (Maszewo, prawdziwe liczby 2025): https://claude.ai/artifact/HE8DiLc2Fabhjnx71d1eyi Rozwija `docs/KONCEPT-ODKRYCIA.md` (v1) – silnik faktów, dane, zasady prywatności i SEO z v1 zostają. Zmienia się to, **co wybieramy, jak to mówimy i jak to wygląda** w panelu „Gmina X – 3 rzeczy…” na stronie startowej.
Cel właściciela: panel ma pokazywać plusy, minusy, dziwactwa i skrajności Twojego miejsca, zachęcać do sprawdzania kolejnych rzeczy i nadawać się do wysłania znajomym.

## 0. Werdykt (6 zdań)
1. Dzisiejszy panel jest **poprawny, ale obojętny**: trzy szare karty o tej samej wadze, długie zdania urzędowe, liczby bez skali („1 161,0 na 10 tys.”), wypełniacze („blisko mediany gmin”) i trzy identyczne przyciski „Zobacz na mapie”.
2. Najmocniejszy fakt często ginie: w Maszewie (zachodniopomorskie) czytelników bibliotek jest **3,3 razy mniej niż w typowej gminie – dolne 3% Polski**, a panel mówi tylko „mniej niż w każdej z 7 sąsiednich gmin”; obok stoi REGON z 69. percentyla opisany jako „najdalej powyżej mediany” i ludność „blisko mediany”.
3. Nowy panel to **5 kart o stałych rolach**: Powód do dumy · Słaby punkt · Dziwne, ale prawdziwe · Największa zmiana · Derby z sąsiadem – zawsze plus i minus razem (uczciwość = wiarygodność = chęć dzielenia się).
4. Każda liczba dostaje **ludzką skalę** („1 czytelnik na 31 mieszkańców”, „2/3 gminy to las”, „3,3× mniej niż typowa gmina”) i **pasek „Ty jesteś tu”** na tle wszystkich 2 479 gmin.
5. Wiralowość budują trzy mechanizmy, które da się zrobić bez AI i bez nowych danych: **zgadywanie przed odsłonięciem**, **derby z sąsiadem** (wynik meczu 4:3) i **wysyłanie pojedynczej karty** (tekst + link, a po decyzji D9 – obrazek).
6. Dane to udźwigną: przy obecnych 16 wskaźnikach gminnych „Powód do dumy” z górnych 25% ma **88% gmin**, „Słaby punkt” z dolnych 25% – **90%**, „Dziwne” (≥ 2× od typowej gminy) – **78%** (§2).

## 1. Diagnoza panelu ze zrzutu (Maszewo, 3204033)
| Co widać | Dlaczego nie działa |
|---|---|
| 3 karty tej samej wielkości, ten sam szary | Nic nie jest najważniejsze; oko nie wie, od czego zacząć. |
| „1 161,0 na 10 tys.” | Zero po przecinku i jednostka urzędowa – liczba nic nie mówi bez przeliczenia. |
| „najdalej powyżej mediany gmin w Polsce od początku danych (2002 r.)” | Fakt F5 dla wartości z 69. percentyla – formalnie prawda, w odbiorze przeciętność udająca rekord. |
| „Ludność… blisko mediany gmin” | F9 (typowość) jako 1 z 3 kart – wypełniacz, który zabiera miejsce mocnemu faktowi. |
| „mniej niż w każdej z 7 sąsiednich gmin” | Prawda, ale słabsza niż prawda krajowa (dolne 3% Polski). |
| Brak plusów i minusów | Wszystko jest „neutralne”, więc nic nie budzi emocji – ani dumy, ani „no co ty?!”. |
| 3× „Zobacz na mapie”, „Porównaj z sąsiadem”, „Porównaj z bliźniakiem” | Pięć przycisków o tej samej wadze; żaden nie prowadzi do „chcę zobaczyć więcej”. |
| Brak udostępniania | Najbardziej wiralowy moment („zobacz, co wyszło o naszej gminie”) nie ma przycisku. |

## 2. Co mówią dane (pomiar 27.11.2026, `public/data/values`, 2 479 gmin, 16 wskaźników gminnych)
| Rola karty | Reguła | Gminy z taką kartą |
|---|---|---|
| Powód do dumy | najlepszy percentyl w kierunku `higherIsBetter` ≥ 75 | **88%** (≥ 80: 81%, ≥ 90: 54%) |
| Słaby punkt | najgorszy percentyl ≤ 25 | **90%** (≤ 20: 84%, ≤ 10: 60%) |
| Plus i minus z 10% skrajnych naraz | | 30% |
| Dziwne, ale prawdziwe | wartość ≥ 2× albo ≤ ½ typowej gminy (mediana) | **78%** (≥ 1,5×: 97%, ≥ 3×: 41%) |
| Jakakolwiek skrajność kraju | 1% / 3% / 5% / 10% skrajnych | 21% / 48% / 67% / 90% |

Przykłady z danych (wartości 2025):
| Gmina | Duma | Słaby punkt | Dziwne |
|---|---|---|---|
| Maszewo (zach.-pom.) | przyrost naturalny −2,2‰ (mediana −5,2) – lepiej niż 80% gmin | 32 czytelników na 1000 – dolne 3% | 1 czytelnik na 31 osób, 3,3× mniej niż typowo |
| Maszewo (lubuskie) | lesistość 65% – górne 3% | dochody gminy 7 128 zł/os. – dolne 5% | 2/3 gminy to las, 3× więcej niż typowo |
| Karpacz | 9 518 firm na 10 tys. – 1. w Polsce | przyrost naturalny – dolne 7% | prawie 1 firma na 1 mieszkańca (9,4× więcej niż typowo) |
| Lesznowola | 36 nowych mieszkań na 1000 – 1. w Polsce | lesistość – dolne 24% | 13× więcej nowych mieszkań niż typowa gmina |
| Kleszczów | dochody gminy – 1. w Polsce | – | wydatki 34 963 zł na mieszkańca, 3,9× typowo |

**Pułapki** (oprócz tych z v1 §2: granice, małe gminy, obwarzanki):
- **Zera, które są brakiem sprawozdania.** „0 czytelników bibliotek” w Malborku czy Chodzieży to niemal na pewno brak danych, nie brak czytelników. Reguła: wartość 0 we wskaźniku „na 1000/na 10 tys./%” w gminie > 5 000 mieszkańców nie jest skrajnością, chyba że powtarza się ≥ 3 lata.
- **Kurorty i gminy z elektrownią** (Karpacz, Rewal, Kleszczów) wygrywają co roku. To dobre „Dziwne”, ale nie może zajmować Odkrycia dnia częściej niż raz w miesiącu (rotacja z v1 to już ogranicza).
- **Kierunek „lepiej/gorzej” jest sporny** dla części wskaźników (gęstość, udział 65+, mediana wieku, samochody, noclegi, wydatki). Te nigdy nie są „Dumą” ani „Słabym punktem” – mogą być tylko „Dziwne” albo „Zmiana”. Lista w `config/facts.json` (`valence`), nie w kodzie.

## 3. Nowy panel – 5 kart o stałych rolach
Nagłówek: **„Gmina Maszewo bez retuszu”** (podtytuł: „Co wychodzi z danych GUS – dobre, złe i dziwne”). Link „Zmień miejsce” zostaje.

| # | Karta | Skąd fakt | Etykieta i kolor (STYL) | Przykład (Maszewo, zach.-pom.) |
|---|---|---|---|---|
| 1 | **Dziwne, ale prawdziwe** (karta duża, zakreślona na czerwono – jedyne zakreślenie ekranu) | największy stosunek do mediany kraju, dowolny wskaźnik; przy remisie – rzadszy percentyl | ikona „błyskawica”, korekta | „Tylko **1 na 31** mieszkańców wypożycza książki w bibliotece. Typowa gmina: 1 na 10.” |
| 2 | **Powód do dumy** | najlepszy percentyl wśród wskaźników z `valence` | ikona „w górę”, granat | „Rodzi się tu relatywnie więcej dzieci niż w **80%** gmin w Polsce.” |
| 3 | **Słaby punkt** | najgorszy percentyl wśród wskaźników z `valence` (≠ wskaźnik z karty 1) | ikona „w dół”, ochra | najgorszy byłby czytelnictwo, ale to już karta 1, więc następny: „**81%** gmin ma więcej metrów mieszkania na osobę niż Wy” (29,1 m², typowo 32,1) |
| 4 | **Największa zmiana** | F4 (10 lat) albo F6 odwrócenie trendu; bez okien ze zmianą granic | ikona „wykres” | „Firm przybyło o 65% w 10 lat (704 → 1 161 na 10 tys.). Dziś 1 firma na 9 mieszkańców.” |
| 5 | **Derby z sąsiadem** | 11 wskaźników z `valence`; rywal domyślnie = sąsiad o najbardziej podobnej liczbie ludności (uczciwy mecz), przełącznik „Zagraj z: …” pokazuje pozostałych sąsiadów | wynik jak w meczu | z danych: „**Maszewo 1 : 10 Goleniów**. Wygrywacie: przyrost naturalny.” → „Zobacz cały mecz” |

Pod kartami: **„Twój bliźniak”** zostaje, ale z haczykiem: „Poniec (wielkopolskie) to Wasz bliźniak w 11 wskaźnikach. **Najbardziej różni was: …**” (wskaźnik o największej różnicy odchyleń).

Gdy karty brak (np. gmina bez wyraźnego plusa < 75. percentyla): karta mówi to wprost – „Bez wyraźnej mocnej strony: we wszystkich 16 wskaźnikach jesteście w środku Polski” – zamiast wypełniacza F9. Uczciwość jest tu treścią.

### Budowa jednej karty (od góry)
1. Etykieta roli (ikona + 1–3 słowa).
2. **Zdanie-haczyk ≤ 90 znaków** w ludzkiej skali (§4), duża liczba w zdaniu pogrubiona.
3. **Pasek „Ty jesteś tu”**: poziomy pasek z 2 479 kreskami/kropkami gmin (rozkład), mediana jako cienka linia, Twoja gmina jako znacznik z podpisem „Wy”. Zastępuje „na 10 tys.” – widać od razu, czy to skrajność. SVG, bez zrzutów pikselowych mapy.
4. Linia źródła drobnym drukiem: „GUS BDL, 2025 · 32 na 1000 mieszkańców” – urzędowa liczba zostaje, ale schodzi na dół.
5. Jeden przycisk: **„Kto ma najwięcej?”** / **„Kto ma najmniej?”** (otwiera mapę z tym wskaźnikiem, zaznaczonym miejscem i rankingiem) – ciekawość „a kto jest pierwszy?” jest silniejsza niż „zobacz na mapie”. Drugi, mały: ikona „Wyślij” (§6).

### Zgadywanie przed odsłonięciem (karta 1, opcjonalnie wszystkie)
Na telefonie karta „Dziwne” najpierw pyta: „Jak myślisz: ilu mieszkańców Maszewa korzysta z biblioteki?” – trzy przyciski („1 na 3”, „1 na 10”, „1 na 31”) albo suwak. Po wyborze odsłania odpowiedź i mówi „Trafiłeś” / „Większość zgaduje 1 na 10”. Jedno stuknięcie, zero kont, nic nie zapisujemy na serwerze (statystyka trafień tylko po zgodzie, PostHog). „Pomiń” zawsze widoczne; `prefers-reduced-motion` = odsłona bez animacji.
To najlepiej udokumentowany wzorzec zaangażowania w dziennikarstwie danych (NYT „You Draw It”, quizy „Zgadnij”) – w v1 odłożony „warunkowo”; v2 proponuje włączyć go od razu, ale tylko w jednej karcie.

## 4. Ludzka skala – przeliczenia (kod, nie AI)
Jeden moduł `src/core/facts/human-scale.ts` zamienia wartość na najczytelniejszą formę. Reguły (pierwsza pasująca):
| Jednostka / sytuacja | Forma | Przykład |
|---|---|---|
| „na 1000” / „na 10 tys.”, wartość < połowy podstawy | „1 na N osób” | 32 na 1000 → „1 na 31 mieszkańców” |
| „na 10 tys.” powyżej 1 000 | „N na 10 osób” / „prawie 1 na osobę” | 9 518 → „prawie 1 firma na każdego mieszkańca” |
| % w przedziale 10–90 | ułamek słowny, gdy różnica ≤ 2 pkt | 65,1% → „2/3 gminy to las”; 33% → „co trzecia osoba” |
| porównanie z typową gminą, stosunek ≥ 1,5 | „N× więcej/mniej niż typowa gmina” | 36,1 vs 2,8 → „13× więcej” |
| percentyl ≥ 90 / ≤ 10 | „górne N% / dolne N% gmin w Polsce” | 3. percentyl → „dolne 3%” |
| miejsce 1–3 bez remisu | „1. w Polsce” | |
| zł na mieszkańca | kwota zaokrąglona do 100 zł + porównanie | „ok. 35 000 zł na każdego mieszkańca – 4× więcej niż typowo” |
Zakazy: żadnych przyczyn („bo zamknięto bibliotekę”), żadnych porównań spoza danych („jak w Szwecji”), zaokrąglenia tylko w dół do bezpiecznej formy („prawie”, „ponad”). Każda karta ma pod spodem liczbę urzędową z rokiem – ludzka skala nigdy nie zastępuje źródła.

## 5. Ton – zmiana zasady z v1 §3
v1: „najwyższy/najniższy, nigdy najlepszy/najgorszy; bez ocen”. To zabezpieczało przed skargami samorządów, ale zabija emocje. v2 proponuje **ocenę roli, nie miejsca**:
- Wolno: „Powód do dumy”, „Słaby punkt”, „Dziwne, ale prawdziwe”, „Wygrywacie”, „górne 3%”.
- Nadal nie wolno: „najgorsza/najlepsza gmina”, „gmina-porażka”, wykrzykniki, emotikony w zdaniach, ironia o ludziach, przyczyny. Test zakazanych słów zostaje i dostaje nowe pozycje.
- „Duma” i „Słaby punkt” tylko dla wskaźników z jednoznacznym kierunkiem (`valence` w `config/facts.json`; właściciel zatwierdza listę: bezrobocie, wynagrodzenie, dochody gminy, kanalizacja, przedszkola, czytelnictwo, lesistość, przyrost naturalny, saldo migracji, nowe mieszkania, powierzchnia mieszkania, firmy REGON, apteki, żłobki).
- Zawsze **plus i minus razem**. Gmina, która widzi tylko minus, poczuje się zaatakowana; gmina, która widzi oba – czuje, że to uczciwe, i chętniej to wysyła.

## 6. Dlaczego ludzie mają to wysyłać – mechanizmy wiralowe
| Mechanizm | Jak u nas | Koszt |
|---|---|---|
| Tożsamość („to o mnie”) | nagłówek z nazwą gminy, „Wy”, karta Dumy | niski |
| Rywalizacja lokalna | **Derby z sąsiadem**: wynik meczu, link `?u=A&c=A,B` otwiera porównanie w profilu (już istnieje) | niski–średni |
| Zaskoczenie | „Dziwne, ale prawdziwe” + zgadywanie | średni |
| Pytanie zamiast odpowiedzi | przycisk „Kto ma najwięcej?”, „Sprawdź sąsiada”, „Losuj dziwną gminę” | niski |
| Łatwe wysyłanie | ikona „Wyślij” na każdej karcie: Web Share API (telefon) / „Kopiuj” (komputer) z tekstem „Maszewo: tylko 1 na 31 mieszkańców wypożycza książki. Typowa gmina: 1 na 10. Sprawdź swoją gminę: faktografia.eu/gmina/maszewo-…” | niski |
| Obrazek w podglądzie linku | strona miejsca `/gmina/…` dostaje własny obrazek OG z kartą „Dziwne” (generowany przy budowaniu, SVG→PNG) | średni; **wymaga decyzji D9** (udostępnianie wstrzymane) i sprawdzenia budżetu builda |
| Powód do powrotu | Odkrycie dnia (jest) + „Nowość” przy świeżych danych (jest) + karta „Co się zmieniło od Twojej ostatniej wizyty” (tylko z zapamiętanego TERYT i daty w `localStorage`) | niski |
| Ogólnopolskie „dziwactwa” | w stanie A (nie znamy miejsca) Odkrycie dnia losuje częściej z puli „Dziwne” (Karpacz: prawie 1 firma na mieszkańca; Lesznowola: 13× więcej nowych mieszkań) | niski (waga w `config/facts.json`) |

Uwaga z pomiaru: mecz z siedzibą powiatu bywa miażdżący (Maszewo – Goleniów 1 : 10 w danych 2025). To mocny, prawdziwy haczyk, ale domyślny rywal ma podobną liczbę ludności, a wynik zawsze wymienia, co gmina wygrywa.

Czego nie robimy mimo pokusy: rankingów „najgorszych gmin”, memów i obrazków z AI, komentarzy, kont, liczników „X osób to udostępniło”, powiadomień push, treści z portali.

## 7. Telefon (najczęstszy ekran właściciela i użytkowników)
- Karty jedna pod drugą, karta 1 na pełną szerokość, 2 i 3 obok siebie od 600 px, na 390 px jedna pod drugą.
- Opcja „Historia w 5 krokach” (jak relacje w aplikacjach): przycisk „Zobacz w 60 sekund” otwiera 5 kart na pełny ekran, przesuwanych palcem, z paskiem postępu u góry; ostatnia karta = „Wyślij znajomym” i „Sprawdź inną gminę”. Przy `prefers-reduced-motion` – zwykła lista. **Wariant do decyzji (§10.4)** – to najbardziej „trendowy” format, ale to drugi sposób pokazania tych samych kart.
- Pola ≥ 44 px, zdanie-haczyk w 2–3 liniach przy 360 px, pasek „Ty jesteś tu” ≥ 280 px szerokości.

## 8. Zmiany w silniku i plikach (zgodnie z ARCHITEKTURA)
- `src/core/facts/roles.ts` – wybór 5 ról z istniejących faktów + percentyle (nowe pole w faktach: percentyl kraju i stosunek do mediany).
- `src/core/facts/human-scale.ts` – przeliczenia z §4 (czysta logika, testy na przykładach z §2).
- `src/core/facts/derby.ts` – wynik meczu z sąsiadem (wskaźniki z `valence`, wartości z `profiles/<WW>.json` – bez nowych żądań).
- `config/facts.json`: `valence` (lista i kierunek), `roles` (progi 75/25, stosunek 2×, wagi Odkrycia dnia), `zeroGuard` (reguła zer).
- `scripts/data/build-facts.mjs`: do każdego faktu dopisuje percentyl i stosunek do mediany; do pliku województwa – histogram rozkładu każdego wskaźnika (20 przedziałów × 16 wskaźników ≈ 1 KB) dla paska „Ty jesteś tu”. Rozmiar `facts/<WW>.json` rośnie ok. 20–30% (~ +4 KB gzip) – mieści się w zasadzie „jeden plik województwa”.
- Widok: `src/view/start/PlaceFacts.tsx` → nowe komponenty `RoleCard.tsx`, `YouAreHere.tsx` (SVG), `DerbyCard.tsx`, `GuessReveal.tsx`, `ShareFact.tsx`. Tylko tokeny; jedno zakreślenie `korekta` na ekranie.
- Strony miejsc (`/gmina/…`, S06/S07): `lead` bierze kartę „Dziwne” i „Dumę” w ludzkiej skali – lepsze zdania do cytowania przez wyszukiwarki i czatboty; audyt „ten sam szablon > 30% stron” obejmuje nowe szablony.

## 9. Plan fal (propozycja; nic nie startuje bez decyzji)
| Fala | Zadania (równolegle, rozłączne pliki) |
|---|---|
| W31 | **O01** percentyl i stosunek do mediany w faktach + histogramy + `zeroGuard` (robot, `build-facts.mjs`, `codec.ts`) · **O02** `human-scale.ts` z testami (czysta logika) · **O03** `valence` i `roles` w `config/facts.json` + słownik zakazanych słów v2 |
| W32 | **O04** `roles.ts` – wybór 5 kart (zależy od O01, O03) · **O05** `derby.ts` – wynik meczu (zależy od O03) · **O06** `YouAreHere.tsx` (SVG paska rozkładu, zależy od O01) |
| W33 | **O07** nowy panel „bez retuszu” na starcie (RoleCard, DerbyCard, bliźniak z różnicą; e2e `@PATH` „od karty do mapy z rankingiem w 1 kliknięciu”) · **O08** „Wyślij” (Web Share / Kopiuj tekst + link) |
| W34 | **O09** zgadywanie w karcie „Dziwne” · **O10** „Co się zmieniło od ostatniej wizyty” · **O11** (po D9) obrazek OG strony miejsca z kartą · **O12** (wariant) „Historia w 5 krokach” |
Odbiór: właściciel przegląda 50 losowych gmin (lista z O04 w PR, jak w F01) i zaznacza karty nudne, nieuczciwe albo obraźliwe – przed włączeniem O07.

## 10. Decyzje właściciela (proponowane domyślne w nawiasie)
1. Zmiana tonu z v1 §3: role „Powód do dumy / Słaby punkt / Dziwne, ale prawdziwe” (tak).
2. Lista wskaźników z kierunkiem lepiej/gorzej (`valence`) – zatwierdzasz raz, §5 (tak, jak w §5).
3. Zgadywanie przed odsłonięciem w karcie „Dziwne” (tak, jedna karta, zawsze z „Pomiń”).
4. „Historia w 5 krokach” na telefonie (później – najpierw pomiar, czy ludzie klikają karty).
5. Przycisk „Wyślij” jako tekst + link (tak – nie wymaga cofnięcia D9).
6. Obrazek OG z kartą na stronach miejsc (później – wymaga zdjęcia wstrzymania D9).
7. Nagłówek panelu: „Gmina X bez retuszu” (tak) / „3 rzeczy, których mogłeś nie wiedzieć” (zostaje).
8. Zmiana `PRODUKT.md` §3.1 (stan B) według §3 tego dokumentu (tak, w zadaniu O07).

## 11. Jak zmierzymy (PostHog, tylko po zgodzie)
Kliknięcia „Kto ma najwięcej?” na kartę i rolę · udział zgadujących i trafień · „Wyślij” na kartę · wejścia z linków udostępnionych (`?ref=karta`, bez danych osoby) · „Zmień miejsce” po obejrzeniu panelu (= ludzie sprawdzają kolejne gminy). Próg sukcesu (propozycja): ≥ 25% osób, które zobaczyły panel, klika co najmniej jedną kartę; ≥ 3% wysyła.
