# F01 – przegląd faktów (raport robota)

Wygenerowane przez `node scripts/data/build-facts.mjs --report docs/research/F01-przeglad-faktow.md` z `public/data` (dane z 2026-11-17). Jednostek: 2875.

## Liczność kandydatów (przed doborem)

| Rama | Faktów | Jednostek z ≥ 1 | Udział jednostek |
|---|---:|---:|---:|
| F1 skrajność w Polsce (1% górny/dolny w poziomie) | 929 | 594 | 20,7% |
| F2 miejsce 1–3 / 3 ostatnie w województwie (≥ 15 jednostek) | 2911 | 1156 | 40,2% |
| F4 zmiana 10 lat (2% górne/dolne, bez zmian granic) | 1506 | 969 | 33,7% |
| F5 rekord względem mediany kraju (> 15%) | 3046 | 1862 | 64,8% |
| F9 typowość (pozycja wobec mediany) | 47488 | 2875 | 100,0% |

## Pokrycie po doborze (3 fakty, ≤ 1 na wskaźnik, ≤ 2 na grupę)

| Poziom | Jednostek | ≥ 3 kandydatów F1–F5 | ≥ 3 fakty | 3 fakty bez F9 | ≥ 1 fakt F1/F2/F4/F5 | tylko F9 |
|---|---:|---:|---:|---:|---:|---:|
| woj | 16 | 68,8% | 100,0% | 62,5% | 100,0% | 0,0% |
| pow | 380 | 75,8% | 100,0% | 72,1% | 95,5% | 4,5% |
| gmi | 2479 | 35,3% | 100,0% | 27,8% | 80,2% | 19,8% |
| razem | 2875 | 40,8% | 100,0% | 33,8% | 82,3% | 17,7% |

Pokazane fakty wg ramy: F1 765 · F2 1115 · F4 1198 · F5 1889 · F9 3658.

Uwagi do liczb (różnice wobec prototypu z §2 koncepcji):
- Rekord względny (F5) liczy się tylko wtedy, gdy rekordem jest **ostatni** rok – fakt mówi o teraz, nie o 2009 r. Prototyp liczył rekord w dowolnym roku, stąd u niego więcej F5.
- Skrajność (F1, F2, F4) wymaga, by cała grupa remisu zmieściła się w progu (100 gmin z 0% kanalizacji to nie skrajność).
- Gminy < 5 tys. mieszkańców: wskaźniki „na 1000” i „na 10 tys.” jako średnia 3 lat (zdanie mówi „średnio … w latach …”).
- Rama „sąsiedzi” (F3) i F6–F8 nie są w tym PR (zadanie F01: F1, F2, F4, F5, F9). F3 podniosłaby udział gmin z 3 faktami bez F9 (prototyp: 93,5%).
- F9 (typowość) to ostatnia deska: pozycja wobec mediany kraju, zawsze z liczbą i rokiem.

## Zmiany granic (powierzchnia = ludność ÷ gęstość, skok > 3% r/r)

166 skoków w 131 jednostkach. Okno 10 lat z takim rokiem nie daje faktu F4; rekord F5 dla ludności i gęstości też nie.

- Opole: 1661011 (2017)
- Dobrzeń Wielki: 1609032 (2017)
- Zielona Góra: 0862011 (2015)
- Supraśl: 2002093 (2025)
- Hel: 2211011 (2018, 2023)

## Rozmiary plików

| Plik | Jednostek | Bajtów |
|---|---:|---:|
| facts/10.json | 202 | 34875 |
| facts/12.json | 206 | 35608 |
| facts/14.json | 357 | 61649 |
| facts/16.json | 84 | 14349 |
| facts/18.json | 186 | 31488 |
| facts/20.json | 137 | 23911 |
| facts/22.json | 144 | 25138 |
| facts/24.json | 204 | 34471 |
| facts/26.json | 117 | 20136 |
| facts/28.json | 138 | 24109 |
| facts/30.json | 262 | 44987 |
| facts/32.json | 135 | 23317 |
| facts/02.json | 200 | 35240 |
| facts/04.json | 168 | 28659 |
| facts/06.json | 238 | 41384 |
| facts/08.json | 97 | 17044 |
| facts-start.json | – | 3453 |

## 50 losowych gmin – po 3 fakty (do przeglądu)

### Gmina Osiecznica (0201052, dolnośląskie)

- [F1] Lesistość: 84,2 % w 2025 r. – 3. najwyższa wartość z 2 479 gmin w Polsce.
- [F2] Gęstość zaludnienia: 16,4 os./km² w 2025 r. – najniższa wartość z 169 gmin w województwie dolnośląskim.
- [F9] Ludność ogółem: 7 146 osób w 2025 r. – blisko mediany gmin w Polsce (7 226 osób).

### Gmina Bierutów (0214023, dolnośląskie)

- [F5] Ludność korzystająca z kanalizacji: 43,2 % w 2025 r. – najdalej poniżej mediany gmin w Polsce (53,5 %) od początku danych (2002 r.).
- [F9] Przeciętna pow. użytkowa mieszkania na osobę: 31,0 m² w 2025 r.; mediana gmin w Polsce: 32,1 m².
- [F9] Ludność ogółem: 9 108 osób w 2025 r.; mediana gmin w Polsce: 7 226 osób.

### Gmina Oborniki Śląskie (0220013, dolnośląskie)

- [F4] Ludność korzystająca z kanalizacji: −3,1 pkt proc. od 2015 r. (41,4 % w 2025 r.) – 26. największy spadek z 2 329 gmin w Polsce.
- [F5] Ludność ogółem: 21 213 osób w 2025 r. – najdalej powyżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).
- [F9] Czytelnicy bibliotek publicznych na 1000 ludności: 109,0 na 1000 w 2025 r. – blisko mediany gmin w Polsce (105,0 na 1000).

### Gmina Pielgrzymka (0226032, dolnośląskie)

- [F2] Saldo migracji na 1000 ludności: średnio −7,7 na 1000 w latach 2023–2025 – 2. najniższa wartość z 169 gmin w województwie dolnośląskim.
- [F5] Ludność ogółem: 4 079 osób w 2025 r. – najdalej poniżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).
- [F5] Dochody budżetu gminy na mieszkańca: 14 235 zł w 2025 r. – najdalej powyżej mediany gmin w Polsce (8 962 zł) od początku danych (2002 r.).

### Gmina Raciążek (0401072, kujawsko-pomorskie)

- [F2] Przyrost naturalny na 1000 ludności: średnio −11,8 na 1000 w latach 2023–2025 – 3. najniższa wartość z 142 gmin w województwie kujawsko-pomorskim.
- [F9] Przeciętna pow. użytkowa mieszkania na osobę: 33,3 m² w 2025 r.; mediana gmin w Polsce: 32,1 m².
- [F9] Udział ludności 65+: 20,8 % w 2025 r. – blisko mediany gmin w Polsce (20,2 %).

### Gmina Dobrcz (0403032, kujawsko-pomorskie)

- [F2] Udział bezrobotnych w ludności w wieku produkcyjnym: 1,7 % w 2025 r. – 3. najniższa wartość z 144 gmin w województwie kujawsko-pomorskim.
- [F2] Saldo migracji na 1000 ludności: 16,1 na 1000 w 2025 r. – 3. najwyższa wartość z 142 gmin w województwie kujawsko-pomorskim.
- [F5] Ludność ogółem: 13 100 osób w 2025 r. – najdalej powyżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).

### Gmina Osięciny (0411042, kujawsko-pomorskie)

- [F5] Wychowanie przedszkolne, dzieci 3–6 lat: 116,1 % w 2025 r. – najdalej powyżej mediany gmin w Polsce (87,9 %) od początku danych (2003 r.).
- [F9] Ludność ogółem: 6 987 osób w 2025 r. – blisko mediany gmin w Polsce (7 226 osób).
- [F9] Przeciętna pow. użytkowa mieszkania na osobę: 31,3 m² w 2025 r. – blisko mediany gmin w Polsce (32,1 m²).

### Gmina Łęczna (0610033, lubelskie)

- [F4] Udział ludności 65+: +10,9 pkt proc. od 2015 r. (19,4 % w 2025 r.) – 16. największy wzrost z 2 329 gmin w Polsce.
- [F4] Ludność korzystająca z kanalizacji: −2,2 pkt proc. od 2015 r. (81,4 % w 2025 r.) – 41. największy spadek z 2 329 gmin w Polsce.
- [F9] Saldo migracji na 1000 ludności: −2,2 na 1000 w 2025 r. – blisko mediany gmin w Polsce (−1,8 na 1000).

### Gmina Wojcieszków (0611102, lubelskie)

- [F4] Przeciętna pow. użytkowa mieszkania na osobę: +40,3% od 2015 r. (33,4 m² w 2025 r.) – 9. największy wzrost z 2 329 gmin w Polsce.
- [F9] Mieszkania oddane do użytku na 1000 ludności: 2,8 na 1000 w 2025 r. – blisko mediany gmin w Polsce (2,8 na 1000).
- [F9] Ludność ogółem: 6 402 osób w 2025 r. – blisko mediany gmin w Polsce (7 226 osób).

### Gmina Sosnowica (0613072, lubelskie)

- [F2] Gęstość zaludnienia: 13,0 os./km² w 2025 r. – 2. najniższa wartość z 213 gmin w województwie lubelskim.
- [F5] Wydatki budżetu gminy na mieszkańca: 13 326 zł w 2025 r. – najdalej powyżej mediany gmin w Polsce (8 868 zł) od początku danych (2002 r.).
- [F9] Saldo migracji na 1000 ludności: średnio −2,3 na 1000 w latach 2023–2025 – blisko mediany gmin w Polsce (−1,8 na 1000).

### Gmina Żychlin (1002113, łódzkie)

- [F4] Czytelnicy bibliotek publicznych na 1000 ludności: −154,0 na 1000 od 2015 r. (60,0 na 1000 w 2025 r.) – 21. największy spadek z 2 326 gmin w Polsce.
- [F9] Ludność ogółem: 10 563 osób w 2025 r.; mediana gmin w Polsce: 7 226 osób.
- [F9] Dochody budżetu gminy na mieszkańca: 8 098 zł w 2025 r.; mediana gmin w Polsce: 8 962 zł.

### Gmina Bielawy (1005022, łódzkie)

- [F5] Ludność ogółem: 4 864 osób w 2025 r. – najdalej poniżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).
- [F2] Przyrost naturalny na 1000 ludności: średnio −12,7 na 1000 w latach 2023–2025 – 3. najniższa wartość z 173 gmin w województwie łódzkim.
- [F9] Dochody budżetu gminy na mieszkańca: 9 344 zł w 2025 r. – blisko mediany gmin w Polsce (8 962 zł).

### Gmina Ksawerów (1008052, łódzkie)

- [F4] Podmioty REGON na 10 tys. ludności: +509,0 na 10 tys. od 2015 r. (1 949,0 na 10 tys. w 2025 r.) – 36. największy wzrost z 2 326 gmin w Polsce.
- [F2] Lesistość: 0,1 % w 2025 r. – 2. najniższa wartość z 177 gmin w województwie łódzkim.
- [F5] Dochody budżetu gminy na mieszkańca: 12 988 zł w 2025 r. – najdalej powyżej mediany gmin w Polsce (8 962 zł) od początku danych (2002 r.).

### Gmina wiejska Rawa Mazowiecka (1013042, łódzkie)

- [F9] Przeciętna pow. użytkowa mieszkania na osobę: 32,4 m² w 2025 r. – blisko mediany gmin w Polsce (32,1 m²).
- [F9] Ludność ogółem: 8 565 osób w 2025 r. – blisko mediany gmin w Polsce (7 226 osób).
- [F9] Mieszkania oddane do użytku na 1000 ludności: 4,2 na 1000 w 2025 r.; mediana gmin w Polsce: 2,8 na 1000.

### Gmina wiejska Gostynin (1404022, mazowieckie)

- [F9] Przeciętna pow. użytkowa mieszkania na osobę: 31,8 m² w 2025 r. – blisko mediany gmin w Polsce (32,1 m²).
- [F9] Dochody budżetu gminy na mieszkańca: 8 500 zł w 2025 r.; mediana gmin w Polsce: 8 962 zł.
- [F9] Mediana wieku: 43,0 lat w 2026 r. – blisko mediany gmin w Polsce (43,0 lat).

### Gmina Maków Mazowiecki (1411011, mazowieckie)

- [F1] Wychowanie przedszkolne, dzieci 3–6 lat: 145,9 % w 2025 r. – 14. najwyższa wartość z 2 479 gmin w Polsce.
- [F2] Mieszkania oddane do użytku na 1000 ludności: 0,5 na 1000 w 2025 r. – 3. najniższa wartość z 310 gmin w województwie mazowieckim.
- [F4] Udział ludności 65+: +10,0 pkt proc. od 2015 r. (25,7 % w 2025 r.) – 42. największy wzrost z 2 329 gmin w Polsce.

### Gmina Lipowiec Kościelny (1413032, mazowieckie)

- [F5] Wychowanie przedszkolne, dzieci 3–6 lat: 117,6 % w 2025 r. – najdalej powyżej mediany gmin w Polsce (87,9 %) od początku danych (2003 r.).
- [F9] Udział bezrobotnych w ludności w wieku produkcyjnym: 4,6 % w 2025 r. – blisko mediany gmin w Polsce (4,4 %).
- [F9] Dochody budżetu gminy na mieszkańca: 8 581 zł w 2025 r. – blisko mediany gmin w Polsce (8 962 zł).

### Gmina Nasielsk (1414043, mazowieckie)

- [F5] Ludność korzystająca z kanalizacji: 38,9 % w 2025 r. – najdalej poniżej mediany gmin w Polsce (53,5 %) od początku danych (2002 r.).
- [F9] Przeciętna pow. użytkowa mieszkania na osobę: 32,4 m² w 2025 r. – blisko mediany gmin w Polsce (32,1 m²).
- [F9] Udział bezrobotnych w ludności w wieku produkcyjnym: 5,1 % w 2025 r.; mediana gmin w Polsce: 4,4 %.

### Gmina Skórzec (1426092, mazowieckie)

- [F9] Dochody budżetu gminy na mieszkańca: 8 802 zł w 2025 r. – blisko mediany gmin w Polsce (8 962 zł).
- [F9] Ludność ogółem: 8 280 osób w 2025 r. – blisko mediany gmin w Polsce (7 226 osób).
- [F9] Przeciętna pow. użytkowa mieszkania na osobę: 31,0 m² w 2025 r.; mediana gmin w Polsce: 32,1 m².

### Gmina Tczów (1436042, mazowieckie)

- [F9] Mieszkania oddane do użytku na 1000 ludności: średnio 2,3 na 1000 w latach 2023–2025 – blisko mediany gmin w Polsce (2,8 na 1000).
- [F9] Saldo migracji na 1000 ludności: średnio −2,1 na 1000 w latach 2023–2025 – blisko mediany gmin w Polsce (−1,8 na 1000).
- [F9] Wychowanie przedszkolne, dzieci 3–6 lat: 87,3 % w 2025 r. – blisko mediany gmin w Polsce (87,9 %).

### Gmina Kuczbork-Osada (1437022, mazowieckie)

- [F1] Podmioty REGON na 10 tys. ludności: średnio 541,7 na 10 tys. w latach 2023–2025 – 15. najniższa wartość z 2 461 gmin w Polsce.
- [F5] Ludność ogółem: 4 166 osób w 2025 r. – najdalej poniżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).
- [F9] Dochody budżetu gminy na mieszkańca: 9 500 zł w 2025 r.; mediana gmin w Polsce: 8 962 zł.

### Gmina Popielów (1609092, opolskie)

- [F9] Ludność ogółem: 7 552 osób w 2025 r. – blisko mediany gmin w Polsce (7 226 osób).
- [F9] Dochody budżetu gminy na mieszkańca: 8 592 zł w 2025 r. – blisko mediany gmin w Polsce (8 962 zł).
- [F9] Saldo migracji na 1000 ludności: −2,9 na 1000 w 2025 r.; mediana gmin w Polsce: −1,8 na 1000.

### Gmina Osiek Jasielski (1805082, podkarpackie)

- [F9] Mediana wieku: 43,0 lat w 2026 r. – blisko mediany gmin w Polsce (43,0 lat).
- [F9] Saldo migracji na 1000 ludności: −0,8 na 1000 w 2025 r. – blisko mediany gmin w Polsce (−1,8 na 1000).
- [F9] Dochody budżetu gminy na mieszkańca: 9 964 zł w 2025 r.; mediana gmin w Polsce: 8 962 zł.

### Gmina Ostrów (1815022, podkarpackie)

- [F9] Ludność ogółem: 7 517 osób w 2025 r. – blisko mediany gmin w Polsce (7 226 osób).
- [F9] Saldo migracji na 1000 ludności: −0,5 na 1000 w 2025 r.; mediana gmin w Polsce: −1,8 na 1000.
- [F9] Wychowanie przedszkolne, dzieci 3–6 lat: 83,4 % w 2025 r.; mediana gmin w Polsce: 87,9 %.

### Gmina Bukowsko (1817032, podkarpackie)

- [F5] Mieszkania oddane do użytku na 1000 ludności: 0,6 na 1000 w 2025 r. – najdalej poniżej mediany gmin w Polsce (2,8 na 1000) od początku danych (2002 r.).
- [F9] Mediana wieku: 43,0 lat w 2026 r. – blisko mediany gmin w Polsce (43,0 lat).
- [F9] Ludność ogółem: 5 254 osób w 2025 r.; mediana gmin w Polsce: 7 226 osób.

### Gmina Dubicze Cerkiewne (2005052, podlaskie)

- [F1] Ludność ogółem: 1 261 osób w 2025 r. – 2. najniższa wartość z 2 479 gmin w Polsce.
- [F1] Przeciętna pow. użytkowa mieszkania na osobę: 66,7 m² w 2025 r. – 4. najwyższa wartość z 2 479 gmin w Polsce.
- [F1] Udział ludności 65+: 36,2 % w 2025 r. – najwyższa wartość z 2 479 gmin w Polsce.

### Gmina Zbójna (2007092, podlaskie)

- [F4] Dochody budżetu gminy na mieszkańca: +76,6% od 2015 r. (8 401 zł w 2025 r.) – 17. najmniejszy wzrost z 2 329 gmin w Polsce.
- [F4] Wydatki budżetu gminy na mieszkańca: +68,6% od 2015 r. (8 654 zł w 2025 r.) – 19. najmniejszy wzrost z 2 329 gmin w Polsce.
- [F5] Lesistość: 48,1 % w 2025 r. – najdalej powyżej mediany gmin w Polsce (22,0 %) od początku danych (2002 r.).

### Gmina Goniądz (2008013, podlaskie)

- [F4] Lesistość: +6,4 pkt proc. od 2015 r. (38,0 % w 2025 r.) – 4. największy wzrost z 2 329 gmin w Polsce.
- [F1] Gęstość zaludnienia: 11,8 os./km² w 2025 r. – 22. najniższa wartość z 2 479 gmin w Polsce.
- [F5] Ludność ogółem: 4 448 osób w 2025 r. – najdalej poniżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).

### Gmina Kuźnica (2011052, podlaskie)

- [F5] Ludność ogółem: 3 519 osób w 2025 r. – najdalej poniżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).
- [F9] Dochody budżetu gminy na mieszkańca: 9 932 zł w 2025 r.; mediana gmin w Polsce: 8 962 zł.
- [F9] Lesistość: 25,5 % w 2025 r. – blisko mediany gmin w Polsce (22,0 %).

### Gmina Filipów (2012022, podlaskie)

- [F9] Mieszkania oddane do użytku na 1000 ludności: średnio 2,7 na 1000 w latach 2023–2025 – blisko mediany gmin w Polsce (2,8 na 1000).
- [F9] Udział bezrobotnych w ludności w wieku produkcyjnym: 4,5 % w 2025 r. – blisko mediany gmin w Polsce (4,4 %).
- [F9] Udział ludności 65+: 20,5 % w 2025 r. – blisko mediany gmin w Polsce (20,2 %).

### Gmina Czersk (2202043, pomorskie)

- [F2] Udział bezrobotnych w ludności w wieku produkcyjnym: 8,7 % w 2025 r. – 2. najwyższa wartość z 123 gmin w województwie pomorskim.
- [F5] Ludność ogółem: 21 140 osób w 2025 r. – najdalej powyżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).
- [F9] Saldo migracji na 1000 ludności: −1,1 na 1000 w 2025 r. – blisko mediany gmin w Polsce (−1,8 na 1000).

### Gmina miejska Ustka (2212011, pomorskie)

- [F1] Udział ludności 65+: 30,2 % w 2025 r. – 12. najwyższa wartość z 2 479 gmin w Polsce.
- [F2] Wychowanie przedszkolne, dzieci 3–6 lat: 129,4 % w 2025 r. – 2. najwyższa wartość z 123 gmin w województwie pomorskim.
- [F2] Przyrost naturalny na 1000 ludności: −10,4 na 1000 w 2025 r. – 3. najniższa wartość z 123 gmin w województwie pomorskim.

### Gmina wiejska Osiek (pow. starogardzki) (2213082, pomorskie)

- [F4] Dochody budżetu gminy na mieszkańca: +330,9% od 2015 r. (12 861 zł w 2025 r.) – 21. największy wzrost z 2 329 gmin w Polsce.
- [F2] Ludność ogółem: 2 220 osób w 2025 r. – 2. najniższa wartość z 123 gmin w województwie pomorskim.
- [F4] Wydatki budżetu gminy na mieszkańca: +388,5% od 2015 r. (13 078 zł w 2025 r.) – 12. największy wzrost z 2 329 gmin w Polsce.

### Gmina Rudziniec (2405052, śląskie)

- [F9] Mediana wieku: 43,0 lat w 2026 r. – blisko mediany gmin w Polsce (43,0 lat).
- [F9] Mieszkania oddane do użytku na 1000 ludności: 3,8 na 1000 w 2025 r.; mediana gmin w Polsce: 2,8 na 1000.
- [F9] Ludność ogółem: 10 834 osób w 2025 r.; mediana gmin w Polsce: 7 226 osób.

### Gmina Woźniki (2407083, śląskie)

- [F9] Udział ludności 65+: 20,1 % w 2025 r. – blisko mediany gmin w Polsce (20,2 %).
- [F9] Ludność ogółem: 9 230 osób w 2025 r.; mediana gmin w Polsce: 7 226 osób.
- [F9] Mieszkania oddane do użytku na 1000 ludności: 2,1 na 1000 w 2025 r.; mediana gmin w Polsce: 2,8 na 1000.

### Gmina Kornowac (2411022, śląskie)

- [F4] Ludność korzystająca z kanalizacji: +40,8 pkt proc. od 2015 r. (50,8 % w 2025 r.) – 8. największy wzrost z 2 329 gmin w Polsce.
- [F9] Mieszkania oddane do użytku na 1000 ludności: 2,9 na 1000 w 2025 r. – blisko mediany gmin w Polsce (2,8 na 1000).
- [F9] Saldo migracji na 1000 ludności: −0,8 na 1000 w 2025 r. – blisko mediany gmin w Polsce (−1,8 na 1000).

### Gmina Czerwionka-Leszczyny (2412013, śląskie)

- [F5] Podmioty REGON na 10 tys. ludności: 824,0 na 10 tys. w 2025 r. – najdalej poniżej mediany gmin w Polsce (1 008,0 na 10 tys.) od początku danych (2002 r.).
- [F5] Ludność korzystająca z kanalizacji: 43,3 % w 2025 r. – najdalej poniżej mediany gmin w Polsce (53,5 %) od początku danych (2002 r.).
- [F9] Wychowanie przedszkolne, dzieci 3–6 lat: 88,9 % w 2025 r. – blisko mediany gmin w Polsce (87,9 %).

### Gmina Węgierska Górka (2417152, śląskie)

- [F9] Udział bezrobotnych w ludności w wieku produkcyjnym: 4,1 % w 2025 r. – blisko mediany gmin w Polsce (4,4 %).
- [F9] Przeciętna pow. użytkowa mieszkania na osobę: 32,7 m² w 2025 r. – blisko mediany gmin w Polsce (32,1 m²).
- [F9] Mieszkania oddane do użytku na 1000 ludności: 2,3 na 1000 w 2025 r. – blisko mediany gmin w Polsce (2,8 na 1000).

### Gmina wiejska Działdowo (2803022, warmińsko-mazurskie)

- [F5] Dochody budżetu gminy na mieszkańca: 7 529 zł w 2025 r. – najdalej poniżej mediany gmin w Polsce (8 962 zł) od początku danych (2002 r.).
- [F2] Wydatki budżetu gminy na mieszkańca: 6 842 zł w 2025 r. – 3. najniższa wartość z 116 gmin w województwie warmińsko-mazurskim.
- [F9] Ludność ogółem: 9 540 osób w 2025 r.; mediana gmin w Polsce: 7 226 osób.

### Gmina Kalinowo (2805032, warmińsko-mazurskie)

- [F4] Ludność korzystająca z kanalizacji: −4,3 pkt proc. od 2015 r. (55,9 % w 2025 r.) – 20. największy spadek z 2 329 gmin w Polsce.
- [F5] Ludność ogółem: 6 019 osób w 2025 r. – najdalej poniżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).
- [F2] Podmioty REGON na 10 tys. ludności: 625,0 na 10 tys. w 2025 r. – 3. najniższa wartość z 116 gmin w województwie warmińsko-mazurskim.

### Gmina Prostki (2805042, warmińsko-mazurskie)

- [F5] Ludność korzystająca z kanalizacji: 33,4 % w 2025 r. – najdalej poniżej mediany gmin w Polsce (53,5 %) od początku danych (2002 r.).
- [F9] Dochody budżetu gminy na mieszkańca: 9 003 zł w 2025 r. – blisko mediany gmin w Polsce (8 962 zł).
- [F9] Ludność ogółem: 6 576 osób w 2025 r. – blisko mediany gmin w Polsce (7 226 osób).

### Gmina Barciany (2808022, warmińsko-mazurskie)

- [F1] Mieszkania oddane do użytku na 1000 ludności: 0,2 na 1000 w 2025 r. – 4. najniższa wartość (ex aequo) z 2 461 gmin w Polsce.
- [F4] Saldo migracji na 1000 ludności: −8,4 na 1000 od 2015 r. (−8,4 na 1000 w 2025 r.) – 40. największy spadek z 2 326 gmin w Polsce.
- [F5] Ludność ogółem: 5 437 osób w 2025 r. – najdalej poniżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).

### Gmina Korsze (2808043, warmińsko-mazurskie)

- [F1] Mieszkania oddane do użytku na 1000 ludności: 0,2 na 1000 w 2025 r. – 4. najniższa wartość (ex aequo) z 2 461 gmin w Polsce.
- [F1] Przeciętna pow. użytkowa mieszkania na osobę: 24,4 m² w 2025 r. – 13. najniższa wartość (ex aequo) z 2 479 gmin w Polsce.
- [F9] Dochody budżetu gminy na mieszkańca: 9 318 zł w 2025 r. – blisko mediany gmin w Polsce (8 962 zł).

### Gmina Grodziczno (2812032, warmińsko-mazurskie)

- [F2] Ludność korzystająca z kanalizacji: 0,0 % w 2025 r. – najniższa wartość z 116 gmin w województwie warmińsko-mazurskim.
- [F5] Ludność ogółem: 5 747 osób w 2025 r. – najdalej poniżej mediany gmin w Polsce (7 226 osób) od początku danych (1995 r.).
- [F9] Dochody budżetu gminy na mieszkańca: 9 558 zł w 2025 r.; mediana gmin w Polsce: 8 962 zł.

### Gmina Miłakowo (2815063, warmińsko-mazurskie)

- [F5] Ludność ogółem: 4 817 osób w 2025 r. – najdalej poniżej mediany gmin w Polsce (7 226 osób) od początku danych (1998 r.).
- [F5] Czytelnicy bibliotek publicznych na 1000 ludności: średnio 164,7 na 1000 w latach 2023–2025 – najdalej powyżej mediany gmin w Polsce (105,0 na 1000) od początku danych (2004 r.).
- [F9] Dochody budżetu gminy na mieszkańca: 9 689 zł w 2025 r.; mediana gmin w Polsce: 8 962 zł.

### Gmina Biała Piska (2816013, warmińsko-mazurskie)

- [F1] Przeciętna pow. użytkowa mieszkania na osobę: 24,6 m² w 2025 r. – 18. najniższa wartość (ex aequo) z 2 479 gmin w Polsce.
- [F4] Udział bezrobotnych w ludności w wieku produkcyjnym: −8,1 pkt proc. od 2015 r. (6,7 % w 2025 r.) – 10. największy spadek z 2 329 gmin w Polsce.
- [F4] Saldo migracji na 1000 ludności: −8,9 na 1000 od 2015 r. (−8,9 na 1000 w 2025 r.) – 28. największy spadek z 2 326 gmin w Polsce.

### Gmina Wielbark (2817083, warmińsko-mazurskie)

- [F1] Przeciętna pow. użytkowa mieszkania na osobę: 24,5 m² w 2025 r. – 17. najniższa wartość z 2 479 gmin w Polsce.
- [F9] Dochody budżetu gminy na mieszkańca: 8 697 zł w 2025 r. – blisko mediany gmin w Polsce (8 962 zł).
- [F9] Ludność ogółem: 6 140 osób w 2025 r. – blisko mediany gmin w Polsce (7 226 osób).

### Gmina Krobia (3004033, wielkopolskie)

- [F9] Mieszkania oddane do użytku na 1000 ludności: 2,7 na 1000 w 2025 r. – blisko mediany gmin w Polsce (2,8 na 1000).
- [F9] Przeciętna pow. użytkowa mieszkania na osobę: 31,2 m² w 2025 r. – blisko mediany gmin w Polsce (32,1 m²).
- [F9] Wychowanie przedszkolne, dzieci 3–6 lat: 93,0 % w 2025 r.; mediana gmin w Polsce: 87,9 %.

### Gmina miejska Stargard (3214011, zachodniopomorskie)

- [F2] Ludność ogółem: 65 699 osób w 2025 r. – 3. najwyższa wartość z 113 gmin w województwie zachodniopomorskim.
- [F2] Gęstość zaludnienia: 1 366,5 os./km² w 2025 r. – 2. najwyższa wartość z 113 gmin w województwie zachodniopomorskim.
- [F2] Lesistość: 1,4 % w 2025 r. – 3. najniższa wartość z 113 gmin w województwie zachodniopomorskim.

### Gmina miejska Szczecinek (3215011, zachodniopomorskie)

- [F2] Dochody budżetu gminy na mieszkańca: 6 884 zł w 2025 r. – 2. najniższa wartość z 113 gmin w województwie zachodniopomorskim.
- [F5] Czytelnicy bibliotek publicznych na 1000 ludności: 84,0 na 1000 w 2025 r. – najdalej poniżej mediany gmin w Polsce (105,0 na 1000) od początku danych (2002 r.).
- [F9] Mieszkania oddane do użytku na 1000 ludności: 2,8 na 1000 w 2025 r. – blisko mediany gmin w Polsce (2,8 na 1000).
