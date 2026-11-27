# Odkrycia v2 – „Gmina na tle Polski” (27.11.2026)

Status: **propozycja do decyzji właściciela** (§10). Wersja 2 po uwadze właściciela: ton redakcyjny zamiast clickbaitowego (§5). Makieta telefonu (Maszewo, prawdziwe liczby 2025): https://claude.ai/artifact/HE8DiLc2Fabhjnx71d1eyi Rozwija `docs/KONCEPT-ODKRYCIA.md` (v1) – silnik faktów, dane, zasady prywatności i SEO z v1 zostają. Zmienia się to, **co wybieramy, jak to mówimy i jak to wygląda** w panelu „Gmina X – 3 rzeczy…” na stronie startowej.
Cel właściciela: panel ma pokazywać mocne i słabe strony, rzeczy nietypowe i skrajności Twojego miejsca, zachęcać do sprawdzania kolejnych rzeczy i nadawać się do wysłania znajomym – **z klasą**: bez tonu portali z clickbaitem, tak jak reszta tekstów Faktografii.

## 0. Werdykt (6 zdań)
1. Dzisiejszy panel jest **poprawny, ale obojętny**: trzy szare karty o tej samej wadze, długie zdania urzędowe, liczby bez skali („1 161,0 na 10 tys.”), wypełniacze („blisko mediany gmin”) i trzy identyczne przyciski „Zobacz na mapie”.
2. Najmocniejszy fakt często ginie: w Maszewie (zachodniopomorskie) czytelników bibliotek jest **3,3 razy mniej niż w typowej gminie – dolne 3% Polski**, a panel mówi tylko „mniej niż w każdej z 7 sąsiednich gmin”; obok stoi REGON z 69. percentyla opisany jako „najdalej powyżej mediany” i ludność „blisko mediany”.
3. Nowy panel to **5 kart o stałych rolach**: Najbardziej nietypowe · Mocna strona · Słabsza strona · Największa zmiana w 10 lat · Na tle sąsiada – zawsze mocna i słabsza strona razem (uczciwość = wiarygodność = chęć dzielenia się).
4. Każda liczba dostaje **ludzką skalę** („1 czytelnik na 31 mieszkańców”, „dwie trzecie powierzchni to las”, „3,3 razy mniej niż w typowej gminie”) i **pasek „Na tle kraju”** na tle wszystkich 2 479 gmin.
5. Chęć sprawdzania i dzielenia się budują trzy mechanizmy bez AI i bez nowych danych: **pytanie przed pokazaniem wyniku**, **porównanie z sąsiadem** („lepiej w 4 z 11 wskaźników”) i **udostępnianie pojedynczej karty** (tekst + link, a po decyzji D9 – obrazek). Siłą jest liczba, nie przymiotnik (§5).
6. Dane to udźwigną: przy obecnych 16 wskaźnikach gminnych „Mocna strona” z górnych 25% ma **88% gmin**, „Słabsza strona” z dolnych 25% – **90%**, „Najbardziej nietypowe” (co najmniej 2 razy od typowej gminy) – **78%** (§2).

## 1. Diagnoza panelu ze zrzutu (Maszewo, 3204033)
| Co widać | Dlaczego nie działa |
|---|---|
| 3 karty tej samej wielkości, ten sam szary | Nic nie jest najważniejsze; oko nie wie, od czego zacząć. |
| „1 161,0 na 10 tys.” | Zero po przecinku i jednostka urzędowa – liczba nic nie mówi bez przeliczenia. |
| „najdalej powyżej mediany gmin w Polsce od początku danych (2002 r.)” | Fakt F5 dla wartości z 69. percentyla – formalnie prawda, w odbiorze przeciętność udająca rekord. |
| „Ludność… blisko mediany gmin” | F9 (typowość) jako 1 z 3 kart – wypełniacz, który zabiera miejsce mocnemu faktowi. |
| „mniej niż w każdej z 7 sąsiednich gmin” | Prawda, ale słabsza niż prawda krajowa (dolne 3% Polski). |
| Brak mocnych i słabych stron | Wszystko jest „neutralne”, więc nic nie zostaje w pamięci. |
| 3× „Zobacz na mapie”, „Porównaj z sąsiadem”, „Porównaj z bliźniakiem” | Pięć przycisków o tej samej wadze; żaden nie odpowiada na naturalne pytanie „a jak wypadają inni?”. |
| Brak udostępniania | Moment, w którym ktoś chce pokazać fakt znajomym, nie ma przycisku. |

## 2. Co mówią dane (pomiar 27.11.2026, `public/data/values`, 2 479 gmin, 16 wskaźników gminnych)
| Rola karty | Reguła | Gminy z taką kartą |
|---|---|---|
| Mocna strona | najlepszy percentyl w kierunku `higherIsBetter` ≥ 75 | **88%** (≥ 80: 81%, ≥ 90: 54%) |
| Słabsza strona | najgorszy percentyl ≤ 25 | **90%** (≤ 20: 84%, ≤ 10: 60%) |
| Plus i minus z 10% skrajnych naraz | | 30% |
| Najbardziej nietypowe | wartość ≥ 2× albo ≤ ½ typowej gminy (mediana) | **78%** (≥ 1,5×: 97%, ≥ 3×: 41%) |
| Jakakolwiek skrajność kraju | 1% / 3% / 5% / 10% skrajnych | 21% / 48% / 67% / 90% |

Przykłady z danych (wartości 2025):
| Gmina | Mocna strona | Słabsza strona | Nietypowe |
|---|---|---|---|
| Maszewo (zach.-pom.) | przyrost naturalny −2,2‰ (mediana −5,2) – lepiej niż 80% gmin | 32 czytelników na 1000 – dolne 3% | 1 czytelnik na 31 osób, 3,3 razy mniej niż w typowej gminie |
| Maszewo (lubuskie) | lesistość 65% – górne 3% | dochody gminy 7 128 zł/os. – dolne 5% | las na dwóch trzecich powierzchni, 3 razy więcej niż w typowej gminie |
| Karpacz | 9 518 firm na 10 tys. – 1. w Polsce | przyrost naturalny – dolne 7% | prawie 1 firma na mieszkańca, 9,4 razy więcej niż w typowej gminie |
| Lesznowola | 36 nowych mieszkań na 1000 – 1. w Polsce | lesistość – dolne 24% | 13 razy więcej nowych mieszkań niż w typowej gminie |
| Kleszczów | dochody gminy – 1. w Polsce | – | wydatki 34 963 zł na mieszkańca, 3,9 razy więcej niż w typowej gminie |

**Pułapki** (oprócz tych z v1 §2: granice, małe gminy, obwarzanki):
- **Zera, które są brakiem sprawozdania.** „0 czytelników bibliotek” w Malborku czy Chodzieży to niemal na pewno brak danych, nie brak czytelników. Reguła: wartość 0 we wskaźniku „na 1000/na 10 tys./%” w gminie > 5 000 mieszkańców nie jest skrajnością, chyba że powtarza się ≥ 3 lata.
- **Kurorty i gminy z elektrownią** (Karpacz, Rewal, Kleszczów) wygrywają co roku. To dobre „Nietypowe”, ale nie może zajmować Odkrycia dnia częściej niż raz w miesiącu (rotacja z v1 to już ogranicza).
- **Kierunek „lepiej/gorzej” jest sporny** dla części wskaźników (gęstość, udział 65+, mediana wieku, samochody, noclegi, wydatki). Te nigdy nie są „Mocną” ani „Słabszą stroną” – mogą być tylko „Nietypowe” albo „Zmiana”. Lista w `config/facts.json` (`valence`), nie w kodzie.

## 3. Nowy panel – 5 kart o stałych rolach
Nadtytuł „Gmina w liczbach”, nagłówek: **„Maszewo na tle Polski”**, podtytuł: „Co wyróżnia gminę w danych GUS za 2025 rok.” Link „Zmień miejsce” zostaje.

| # | Karta | Skąd fakt | Etykieta i kolor (STYL) | Przykład (Maszewo, zach.-pom.) |
|---|---|---|---|---|
| 1 | **Najbardziej nietypowe** (karta duża, zakreślona na czerwono – jedyne zakreślenie ekranu) | największy stosunek do mediany kraju, dowolny wskaźnik; przy remisie – rzadszy percentyl | ikona „kółko z wykrzyknikiem” (iconoir), korekta | „Z bibliotek publicznych korzysta **1 na 31** mieszkańców. W typowej gminie – 1 na 10.” · „Niższy wynik ma 3% gmin w Polsce.” |
| 2 | **Mocna strona** | najlepszy percentyl wśród wskaźników z `valence` | ikona „w górę”, granat | „Przyrost naturalny wyższy niż w **80% gmin**.” |
| 3 | **Słabsza strona** | najgorszy percentyl wśród wskaźników z `valence` (≠ wskaźnik z karty 1) | ikona „w dół”, ochra | najgorszy byłby czytelnictwo, ale to już karta 1, więc następny: „Mniej metrów mieszkania na osobę niż w **81% gmin**” (29,1 m², mediana 32,1) |
| 4 | **Największa zmiana w 10 lat** | F4 (10 lat) albo F6 odwrócenie trendu; bez okien ze zmianą granic | ikona „wykres” | „Firm na mieszkańca jest o 65% więcej niż w 2015 roku. Dziś jedna przypada na 9 osób.” (704 → 1 161 na 10 tys.) |
| 5 | **Na tle sąsiada** | 11 wskaźników z `valence`; domyślnie sąsiad o najbardziej podobnej liczbie ludności (uczciwe porównanie), przełącznik „Porównaj z: …” pokazuje pozostałych sąsiadów | zwykła karta, bez wyniku „meczowego” | z danych: „Maszewo wypada lepiej od Goleniowa **w 1 z 11** wskaźników. Lepiej: przyrost naturalny. Gorzej: firmy, lesistość, przedszkola…” → „Pełne porównanie” |

Pod kartami: **„Najbardziej podobna gmina”** (dawny „bliźniak”) z jednym konkretem: „Poniec (wielkopolskie) ma profil najbliższy Maszewu w 11 wskaźnikach. Największa różnica: …” (wskaźnik o największej różnicy odchyleń).

Gdy karty brak (np. gmina bez wyraźnej mocnej strony < 75. percentyla): karta mówi to wprost – „W żadnym z 16 wskaźników gmina nie odstaje wyraźnie od środka stawki” – zamiast wypełniacza F9. Uczciwość jest tu treścią.

### Budowa jednej karty (od góry)
1. Etykieta roli (ikona + 1–3 słowa).
2. **Zdanie główne ≤ 90 znaków** w ludzkiej skali (§4): pełne, oznajmujące, bez wzmacniaczy; liczba wyróżniona krojem, nie słowami.
3. **Pasek „Na tle kraju”**: poziomy pasek z 2 479 kreskami/kropkami gmin (rozkład), mediana jako cienka linia, Twoja gmina jako znacznik z jej nazwą. Zastępuje „na 10 tys.” – widać od razu, czy to skrajność. SVG, bez zrzutów pikselowych mapy.
4. Linia źródła drobnym drukiem: „GUS BDL, 2025 · 32 na 1000 mieszkańców” – urzędowa liczba zostaje, ale schodzi na dół.
5. Jeden przycisk: **„Ranking gmin”** (otwiera mapę z tym wskaźnikiem, zaznaczonym miejscem i rankingiem) – odpowiada na naturalne pytanie „a jak wypadają inni?”. Drugi, mały: ikona „Udostępnij” (§6).

### Pytanie przed wynikiem (tylko karta 1)
Karta „Najbardziej nietypowe” najpierw pyta spokojnie: „Zanim zobaczysz wynik: jaka część mieszkańców Maszewa wypożycza książki w bibliotece publicznej?” – trzy przyciski („1 na 3”, „1 na 10”, „1 na 31”). Po wyborze pokazuje wynik i krótko: „Twoja odpowiedź: 1 na 10. Wynik:” – bez „Brawo!”, „Trafiłeś!”, punktów i odznak. Jedno stuknięcie, zero kont, nic nie zapisujemy na serwerze (statystyka trafień tylko po zgodzie, PostHog). „Pokaż wynik” (bez zgadywania) zawsze widoczne; `prefers-reduced-motion` = odsłona bez animacji.
To najlepiej udokumentowany wzorzec zaangażowania w dziennikarstwie danych (NYT „You Draw It”) – w v1 odłożony „warunkowo”; v2 proponuje włączyć go od razu, ale tylko w jednej karcie i w formie pytania, nie quizu.

## 4. Ludzka skala – przeliczenia (kod, nie AI)
Jeden moduł `src/core/facts/human-scale.ts` zamienia wartość na najczytelniejszą formę. Reguły (pierwsza pasująca):
| Jednostka / sytuacja | Forma | Przykład |
|---|---|---|
| „na 1000” / „na 10 tys.”, wartość < połowy podstawy | „1 na N osób” | 32 na 1000 → „1 na 31 mieszkańców” |
| „na 10 tys.” powyżej 1 000 | „N na 10 osób” / „prawie 1 na osobę” | 9 518 → „prawie 1 firma na każdego mieszkańca” |
| % w przedziale 10–90 | ułamek słowny, gdy różnica ≤ 2 pkt | 65,1% → „las zajmuje dwie trzecie powierzchni”; 33% → „co trzecia osoba” |
| porównanie z typową gminą, stosunek ≥ 1,5 | „N razy więcej/mniej niż w typowej gminie” | 36,1 vs 2,8 → „13 razy więcej” |
| percentyl ≥ 90 / ≤ 10 | „górne N% / dolne N% gmin w Polsce” | 3. percentyl → „dolne 3%” |
| miejsce 1–3 bez remisu | „1. w Polsce” | |
| zł na mieszkańca | kwota zaokrąglona do 100 zł + porównanie | „ok. 35 000 zł na mieszkańca, 4 razy więcej niż w typowej gminie” |
Zakazy: żadnych przyczyn („bo zamknięto bibliotekę”), żadnych porównań spoza danych („jak w Szwecji”), zaokrąglenia tylko w dół do bezpiecznej formy („prawie”, „ponad”). Każda karta ma pod spodem liczbę urzędową z rokiem – ludzka skala nigdy nie zastępuje źródła.

## 5. Ton – redakcyjny, nie clickbaitowy (zmiana zasady z v1 §3)
Uwaga właściciela (27.11): treści mają mieć klasę, jak pozostałe teksty Faktografii – **bez tonu „nie uwierzysz”**. Zasada: **siłę daje liczba i porównanie, nie przymiotnik**. Piszemy jak dobry dział danych w gazecie (spokojne zdanie oznajmujące + kontekst + źródło), nie jak portal walczący o klik.

v1 mówiła „najwyższy/najniższy, bez ocen”. v2 dopuszcza tylko **rzeczową nazwę roli** karty, nigdy ocenę miejsca:
- Etykiety ról: „Najbardziej nietypowe”, „Mocna strona”, „Słabsza strona”, „Największa zmiana w 10 lat”, „Na tle sąsiada”, „Najbardziej podobna gmina”.
- Nie piszemy: wzmacniaczy („tylko”, „aż”, „zaledwie”, „szok”, „niesamowite”), pytań-przynęt („Zgadniesz…?”, „Wiesz, że…?”), wykrzykników, emotikonów, „bez retuszu”, „dziwne, ale prawdziwe”, słownictwa meczowego („derby”, „wygrywacie”, „1 : 10”), drugiej osoby liczby mnogiej („Wy”, „Wasza”) w zdaniach o danych, ironii, przyczyn, „najgorsza/najlepsza gmina”.
- Piszemy: pełne zdanie z nazwą miejsca, liczbą w ludzkiej skali, punktem odniesienia („w typowej gminie”, „mediana”) i rokiem; zapis „3,3 razy”, nie „3,3×”.
- Wyróżnienie robi typografia (krój, wielkość, jedno zakreślenie korekty), nie słowa.
- Test zakazanych słów zostaje i dostaje listę z tego punktu.

| Zamiast (v2 robocza) | Piszemy |
|---|---|
| Gmina Maszewo bez retuszu · „dobre, złe i dziwne” | Maszewo na tle Polski · „Co wyróżnia gminę w danych GUS za 2025 rok.” |
| Dziwne, ale prawdziwe | Najbardziej nietypowe |
| Tylko **1 na 31** mieszkańców wypożycza książki. | Z bibliotek publicznych korzysta **1 na 31** mieszkańców. W typowej gminie – 1 na 10. |
| 3,3× mniej – dolne 3% Polski. | Niższy wynik ma 3% gmin w Polsce. |
| Powód do dumy / Słaby punkt | Mocna strona / Słabsza strona |
| 80% gmin ma gorszy przyrost naturalny niż Wy. | Przyrost naturalny wyższy niż w 80% gmin. |
| Derby z sąsiadem · Maszewo 1 : 10 Goleniów · Wygrywacie… | Na tle sąsiada · Maszewo wypada lepiej od Goleniowa w 1 z 11 wskaźników. |
| Kto czyta najwięcej? | Ranking gmin |
| Jak myślisz? … Trafione! | Zanim zobaczysz wynik: … · Twoja odpowiedź: 1 na 10. Wynik: |
| Twój bliźniak · Najbardziej różni was… | Najbardziej podobna gmina · Największa różnica: … |
| Losuj dziwną gminę · Wyślij | Losowa gmina · Udostępnij |

- „Mocna/Słabsza strona” tylko dla wskaźników z jednoznacznym kierunkiem (`valence` w `config/facts.json`; właściciel zatwierdza listę: bezrobocie, wynagrodzenie, dochody gminy, kanalizacja, przedszkola, czytelnictwo, lesistość, przyrost naturalny, saldo migracji, nowe mieszkania, powierzchnia mieszkania, firmy REGON, apteki, żłobki).
- Zawsze **mocna i słabsza strona razem**. Gmina, która widzi tylko minus, poczuje się zaatakowana; gmina, która widzi oba – czuje, że to uczciwe, i chętniej to pokazuje.

## 6. Dlaczego ludzie mają to sprawdzać i udostępniać
| Mechanizm | Jak u nas | Koszt |
|---|---|---|
| Tożsamość („to o mnie”) | nagłówek z nazwą gminy, karta „Mocna strona” | niski |
| Porównanie lokalne | **Na tle sąsiada**: „lepiej w N z 11 wskaźników”, link `?u=A&c=A,B` otwiera porównanie w profilu (już istnieje) | niski–średni |
| Zaskoczenie | „Najbardziej nietypowe” + pytanie przed wynikiem | średni |
| Naturalny następny krok | „Ranking gmin”, „Gminy sąsiednie”, „Losowa gmina” | niski |
| Łatwe udostępnianie | ikona „Udostępnij” na każdej karcie: Web Share API (telefon) / „Kopiuj” (komputer) z tekstem „Maszewo: z bibliotek publicznych korzysta 1 na 31 mieszkańców (typowa gmina: 1 na 10). GUS, 2025. faktografia.eu/gmina/maszewo-…” – bez zachęt typu „Sprawdź swoją gminę!” | niski |
| Obrazek w podglądzie linku | strona miejsca `/gmina/…` dostaje własny obrazek OG z kartą „Najbardziej nietypowe” (generowany przy budowaniu, SVG→PNG) | średni; **wymaga decyzji D9** (udostępnianie wstrzymane) i sprawdzenia budżetu builda |
| Powód do powrotu | Odkrycie dnia (jest) + „Nowość” przy świeżych danych (jest) + karta „Co się zmieniło od Twojej ostatniej wizyty” (tylko z zapamiętanego TERYT i daty w `localStorage`) | niski |
| Ogólnopolskie skrajności | w stanie A (nie znamy miejsca) Odkrycie dnia losuje częściej z puli „Najbardziej nietypowe” (Karpacz: prawie 1 firma na mieszkańca; Lesznowola: 13 razy więcej nowych mieszkań niż w typowej gminie) | niski (waga w `config/facts.json`) |

Uwaga z pomiaru: porównanie z siedzibą powiatu bywa jednostronne (Maszewo lepiej od Goleniowa w 1 z 11 wskaźników, dane 2025). Dlatego domyślnie porównujemy z sąsiadem podobnej wielkości, a karta zawsze wymienia, w czym gmina wypada lepiej.

Czego nie robimy mimo pokusy: rankingów „najgorszych gmin”, nagłówków-przynęt, quizów z punktami i odznakami, memów i obrazków z AI, komentarzy, kont, liczników „X osób to udostępniło”, powiadomień push, treści z portali.

## 7. Telefon (najczęstszy ekran właściciela i użytkowników)
- Karty jedna pod drugą, karta 1 na pełną szerokość, 2 i 3 obok siebie od 600 px, na 390 px jedna pod drugą.
- Opcja „Karta po karcie”: przycisk „Przeglądaj karty” otwiera 5 kart na pełny ekran, przesuwanych palcem, z paskiem postępu u góry; ostatnia karta = „Udostępnij” i „Inna gmina”. Przy `prefers-reduced-motion` – zwykła lista. **Wariant do decyzji (§10.4)** – wygodny na telefonie, ale to drugi sposób pokazania tych samych kart.
- Pola ≥ 44 px, zdanie główne w 2–3 liniach przy 360 px, pasek „Na tle kraju” ≥ 280 px szerokości.

## 8. Zmiany w silniku i plikach (zgodnie z ARCHITEKTURA)
- `src/core/facts/roles.ts` – wybór 5 ról z istniejących faktów + percentyle (nowe pole w faktach: percentyl kraju i stosunek do mediany).
- `src/core/facts/human-scale.ts` – przeliczenia z §4 (czysta logika, testy na przykładach z §2).
- `src/core/facts/neighbour-compare.ts` – „lepiej w N z 11” na tle sąsiada (wskaźniki z `valence`, wartości z `profiles/<WW>.json` – bez nowych żądań).
- `config/facts.json`: `valence` (lista i kierunek), `roles` (progi 75/25, stosunek 2×, wagi Odkrycia dnia), `zeroGuard` (reguła zer).
- `scripts/data/build-facts.mjs`: do każdego faktu dopisuje percentyl i stosunek do mediany; do pliku województwa – histogram rozkładu każdego wskaźnika (20 przedziałów × 16 wskaźników ≈ 1 KB) dla paska „Na tle kraju”. Rozmiar `facts/<WW>.json` rośnie ok. 20–30% (~ +4 KB gzip) – mieści się w zasadzie „jeden plik województwa”.
- Widok: `src/view/start/PlaceFacts.tsx` → nowe komponenty `RoleCard.tsx`, `YouAreHere.tsx` (SVG), `NeighbourCard.tsx`, `GuessReveal.tsx`, `ShareFact.tsx`. Tylko tokeny; jedno zakreślenie `korekta` na ekranie.
- Strony miejsc (`/gmina/…`, S06/S07): `lead` bierze kartę „Najbardziej nietypowe” i „Mocną stronę” w ludzkiej skali – lepsze zdania do cytowania przez wyszukiwarki i czatboty; audyt „ten sam szablon > 30% stron” obejmuje nowe szablony.

## 9. Plan fal (propozycja; nic nie startuje bez decyzji)
| Fala | Zadania (równolegle, rozłączne pliki) |
|---|---|
| W31 | **O01** percentyl i stosunek do mediany w faktach + histogramy + `zeroGuard` (robot, `build-facts.mjs`, `codec.ts`) · **O02** `human-scale.ts` z testami (czysta logika) · **O03** `valence` i `roles` w `config/facts.json` + słownik zakazanych słów v2 |
| W32 | **O04** `roles.ts` – wybór 5 kart (zależy od O01, O03) · **O05** `neighbour-compare.ts` – porównanie z sąsiadem (zależy od O03) · **O06** `YouAreHere.tsx` (SVG paska rozkładu, zależy od O01) |
| W33 | **O07** nowy panel „na tle Polski” na starcie (RoleCard, NeighbourCard, podobna gmina z różnicą; e2e `@PATH` „od karty do mapy z rankingiem w 1 kliknięciu”) · **O08** „Udostępnij” (Web Share / Kopiuj tekst + link) |
| W34 | **O09** pytanie przed wynikiem w karcie „Najbardziej nietypowe” · **O10** „Co się zmieniło od ostatniej wizyty” · **O11** (po D9) obrazek OG strony miejsca z kartą · **O12** (wariant) „Karta po karcie” |
Odbiór: właściciel przegląda 50 losowych gmin (lista z O04 w PR, jak w F01) i zaznacza karty nudne, nieuczciwe, krzykliwe albo obraźliwe – przed włączeniem O07.

## 10. Decyzje właściciela (proponowane domyślne w nawiasie)
1. Ton redakcyjny z §5 i etykiety ról „Najbardziej nietypowe / Mocna strona / Słabsza strona / Na tle sąsiada” (tak).
2. Lista wskaźników z kierunkiem lepiej/gorzej (`valence`) – zatwierdzasz raz, §5 (tak, jak w §5).
3. Pytanie przed wynikiem w karcie „Najbardziej nietypowe” (tak, jedna karta, zawsze z „Pokaż wynik”).
4. „Karta po karcie” na telefonie (później – najpierw pomiar, czy ludzie klikają karty).
5. Przycisk „Udostępnij” jako tekst + link (tak – nie wymaga cofnięcia D9).
6. Obrazek OG z kartą na stronach miejsc (później – wymaga zdjęcia wstrzymania D9).
7. Nagłówek panelu: „X na tle Polski” (tak) / „3 rzeczy, których mogłeś nie wiedzieć” (zostaje – brzmi jak nagłówek-przynęta, więc odradzam).
8. Zmiana `PRODUKT.md` §3.1 (stan B) według §3 tego dokumentu (tak, w zadaniu O07).

## 11. Jak zmierzymy (PostHog, tylko po zgodzie)
Kliknięcia „Ranking gmin” na kartę i rolę · udział zgadujących i trafień · „Udostępnij” na kartę · wejścia z linków udostępnionych (`?ref=karta`, bez danych osoby) · „Zmień miejsce” po obejrzeniu panelu (= ludzie sprawdzają kolejne gminy). Próg sukcesu (propozycja): ≥ 25% osób, które zobaczyły panel, klika co najmniej jedną kartę; ≥ 3% wysyła.
