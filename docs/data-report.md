# Raport odkrywania wskaźników GUS BDL (CC6.3)

Raport proponuje kandydatów na zmienne BDL dla 20 wskaźników z `docs/MASTER_PLAN.md §4.2`.
Wszystkie metadane, liczby, jednostki i przykładowe wartości pochodzą z odpowiedzi API GUS BDL zarchiwizowanych w `tests/fixtures/bdl/discover-cache.json`.
Uwaga dotycząca gmin miejsko-wiejskich: API BDL na poziomie 6 zwraca do 3934 rekordów, ponieważ rozdziela gminy miejsko-wiejskie na część miejską i wiejską. W niniejszym raporcie pokrycie dla gmin (poziom 6) jest liczone wyłącznie dla 2479 całościowych jednostek gminnych mających odpowiednik w `public/data/units.json` (bdlId), pomijając podrzędne części gmin.

---

## Ludność — Ludność ogółem
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** neutralny

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 72305
- **Nazwa w BDL:** `ogółem -> ogółem`
- **Uzasadnienie wyboru:** Ludność ogółem na koniec roku (stan w dniu 31 XII)
- **Jednostka miary:** osoba
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 1995–2025 (31 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 3429342 (2025)
  - Zakopane (gmina 1217011): 24921 (2025)

## Ludność — Gęstość zaludnienia (os./km²)
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** neutralny

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 60559
- **Nazwa w BDL:** `ludność na 1 km2`
- **Uzasadnienie wyboru:** Gęstość zaludnienia - ludność na 1 km²
- **Jednostka miary:** osoba
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 225.9 (2025)
  - Zakopane (gmina 1217011): 295.8 (2025)

## Ludność — Przyrost naturalny na 1000 ludności
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 450551
- **Nazwa w BDL:** `przyrost naturalny na 1000 ludności`
- **Uzasadnienie wyboru:** Przyrost naturalny na 1000 ludności (poziom gminy)
- **Jednostka miary:** -
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): -1.97 (2025)
  - Zakopane (gmina 1217011): -4.68 (2025)

#### Kandydat 2: Zmienna BDL ID 1616456
- **Nazwa w BDL:** `przyrost naturalny na 1000 ludności -> ogółem`
- **Uzasadnienie wyboru:** Przyrost naturalny na 1000 ludności (poziom powiatu)
- **Jednostka miary:** -
- **Najniższy poziom z danymi:** powiat (poziom 5)
- **Dostępne lata:** 1999–2025 (27 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 0 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): -1.97 (2025)
  - Zakopane (dane dla Powiatu Tatrzańskiego 1217): -1.59 (2025)

## Ludność — Saldo migracji na 1000 ludności
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 453193
- **Nazwa w BDL:** `saldo migracji na 1000 ludności -> ogółem`
- **Uzasadnienie wyboru:** Saldo migracji na 1000 ludności -> ogółem (poziom gminy)
- **Jednostka miary:** osoba
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2003–2025 (23 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 1.8 (2025)
  - Zakopane (gmina 1217011): -1.9 (2025)

#### Kandydat 2: Zmienna BDL ID 1365234
- **Nazwa w BDL:** `saldo migracji ogółem -> ogółem`
- **Uzasadnienie wyboru:** Saldo migracji ogółem (liczba bezwzględna)
- **Jednostka miary:** osoba
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 1995–2025 (31 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 6164 (2025)
  - Zakopane (gmina 1217011): -47 (2025)

## Ludność — Udział ludności 65+ (%)
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** neutralny

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 634989
- **Nazwa w BDL:** `odsetek osób w wieku 65 lat i więcej w populacji ogółem`
- **Uzasadnienie wyboru:** Odsetek osób w wieku 65 lat i więcej w populacji ogółem (%)
- **Jednostka miary:** osoba
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2003–2025 (23 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 19.2 (2025)
  - Zakopane (gmina 1217011): 25.1 (2025)

#### Kandydat 2: Zmienna BDL ID 155
- **Nazwa w BDL:** `w wieku poprodukcyjnym -> ogółem`
- **Uzasadnienie wyboru:** Ludność w wieku poprodukcyjnym (ogółem)
- **Jednostka miary:** osoba
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 1995–2025 (31 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 759335 (2025)
  - Zakopane (gmina 1217011): 7157 (2025)

## Ludność — Mediana wieku
- **Oczekiwany najniższy poziom:** gmina (jeśli brak: powiat)
- **Kierunek ("więcej = lepiej?"):** neutralny

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 1650633
- **Nazwa w BDL:** `styczeń -> mediana wieku -> ogółem`
- **Uzasadnienie wyboru:** Mediana wieku ludności -> ogółem (lata)
- **Jednostka miary:** lata
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2023–2026 (4 lat/a)
- **Pokrycie w ostatnim roku (2026):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2026):**
  - Małopolska (województwo 12): 42 (2026)
  - Zakopane (gmina 1217011): 45 (2026)

## Praca — Stopa bezrobocia rejestrowanego (%)
- **Oczekiwany najniższy poziom:** powiat
- **Kierunek ("więcej = lepiej?"):** nie

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 461691
- **Nazwa w BDL:** `grudzień -> stopa bezrobocia rejestrowanego`
- **Uzasadnienie wyboru:** Stopa bezrobocia rejestrowanego - grudzień (%)
- **Jednostka miary:** %
- **Najniższy poziom z danymi:** powiat (poziom 5)
- **Dostępne lata:** 2011–2025 (15 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 0 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 4.7 (2025)
  - Zakopane (dane dla Powiatu Tatrzańskiego 1217): 9 (2025)

#### Kandydat 2: Zmienna BDL ID 461685
- **Nazwa w BDL:** `czerwiec -> stopa bezrobocia rejestrowanego`
- **Uzasadnienie wyboru:** Stopa bezrobocia rejestrowanego - czerwiec (%)
- **Jednostka miary:** %
- **Najniższy poziom z danymi:** powiat (poziom 5)
- **Dostępne lata:** 2011–2026 (16 lat/a)
- **Pokrycie w ostatnim roku (2026):**
  - Gminy (poziom 6 z units.json): 0 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2026):**
  - Małopolska (województwo 12): 4.9 (2026)
  - Zakopane (dane dla Powiatu Tatrzańskiego 1217): 9.4 (2026)

## Praca — Udział bezrobotnych w ludności w wieku produkcyjnym (%)
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** nie

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 1613094
- **Nazwa w BDL:** `bezrobotni w liczbie ludności w wieku produkcyjnym`
- **Uzasadnienie wyboru:** Udział bezrobotnych zarejestrowanych w liczbie ludności w wieku produkcyjnym (%)
- **Jednostka miary:** %
- **Najniższy poziom z danymi:** powiat (poziom 5)
- **Dostępne lata:** 2014–2025 (12 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 0 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 1.2 (2025)
  - Zakopane (dane dla Powiatu Tatrzańskiego 1217): 3.2 (2025)

## Pieniądze — Przeciętne wynagrodzenie brutto (zł)
- **Oczekiwany najniższy poziom:** powiat
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 64428
- **Nazwa w BDL:** `ogółem`
- **Uzasadnienie wyboru:** Przeciętne miesięczne wynagrodzenia brutto (zł) (powiat, bez firm do 9 prac.)
- **Jednostka miary:** zł
- **Najniższy poziom z danymi:** powiat (poziom 5)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 0 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 9613.68 (2025)
  - Zakopane (dane dla Powiatu Tatrzańskiego 1217): 8152.25 (2025)

## Pieniądze — Dochody budżetu gminy na mieszkańca (zł)
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 76973
- **Nazwa w BDL:** `gminy łącznie z miastami na prawach powiatu -> ogółem`
- **Uzasadnienie wyboru:** Dochody ogółem na 1 mieszkańca w budżetach gmin (zł)
- **Jednostka miary:** zł
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 9245.19 (2025)
  - Zakopane (gmina 1217011): 10906.2 (2025)

## Pieniądze — Wydatki budżetu gminy na mieszkańca (zł)
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** neutralny

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 76964
- **Nazwa w BDL:** `gminy łącznie z miastami na prawach powiatu -> ogółem`
- **Uzasadnienie wyboru:** Wydatki ogółem na 1 mieszkańca w budżetach gmin (zł)
- **Jednostka miary:** zł
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 9468.74 (2025)
  - Zakopane (gmina 1217011): 10416.2 (2025)

## Pieniądze — Podmioty REGON na 10 tys. ludności
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 60530
- **Nazwa w BDL:** `podmioty wpisane do rejestru REGON na 10 tys. ludności`
- **Uzasadnienie wyboru:** Podmioty wpisane do rejestru REGON na 10 tys. ludności
- **Jednostka miary:** -
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 1506 (2025)
  - Zakopane (gmina 1217011): 2713 (2025)

## Mieszkania — Mieszkania oddane do użytku na 1000 ludności
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 747060
- **Nazwa w BDL:** `mieszkania oddane do użytkowania na 1000 ludności`
- **Uzasadnienie wyboru:** Mieszkania oddane do użytkowania na 1000 ludności (gmina)
- **Jednostka miary:** -
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 5.9 (2025)
  - Zakopane (gmina 1217011): 6.9 (2025)

## Mieszkania — Przeciętna pow. użytkowa mieszkania na osobę (m²)
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 60573
- **Nazwa w BDL:** `przeciętna powierzchnia użytkowa mieszkania na 1 osobę`
- **Uzasadnienie wyboru:** Przeciętna powierzchnia użytkowa mieszkania na 1 osobę (m²)
- **Jednostka miary:** m2
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 32.5 (2025)
  - Zakopane (gmina 1217011): 41.9 (2025)

## Środowisko — Lesistość (%)
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 194828
- **Nazwa w BDL:** `lesistość w %`
- **Uzasadnienie wyboru:** Lesistość w %
- **Jednostka miary:** %
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 28.6 (2025)
  - Zakopane (gmina 1217011): 51.6 (2025)

## Środowisko — Ludność korzystająca z kanalizacji (%)
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 79130
- **Nazwa w BDL:** `ogółem -> kanalizacja`
- **Uzasadnienie wyboru:** Korzystający z instalacji w % ogółu ludności – kanalizacja (gmina, %)
- **Jednostka miary:** %
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 67.5 (2025)
  - Zakopane (gmina 1217011): 85 (2025)

## Życie — Wychowanie przedszkolne, dzieci 3–6 lat (%)
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 1617169
- **Nazwa w BDL:** `odsetek dzieci objętych wychowaniem przedszkolnym -> ogółem -> dzieci w wieku 3 - 6 lat`
- **Uzasadnienie wyboru:** Dzieci objęte wychowaniem przedszkolnym w % dzieci w wieku 3–6 lat (gmina, %)
- **Jednostka miary:** %
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2003–2025 (22 lat/a)
- **Pokrycie w ostatnim roku (2024):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2024):**
  - Małopolska (województwo 12): 97 (2024)
  - Zakopane (gmina 1217011): 115.2 (2024)

## Życie — Czytelnicy bibliotek publicznych na 1000 ludności
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** tak

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 60191
- **Nazwa w BDL:** `czytelnicy bibliotek publicznych na 1000 ludności`
- **Uzasadnienie wyboru:** Czytelnicy bibliotek publicznych na 1000 ludności
- **Jednostka miary:** osoba
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 193 (2025)
  - Zakopane (gmina 1217011): 183 (2025)

#### Kandydat 2: Zmienna BDL ID 1234
- **Nazwa w BDL:** `czytelnicy w ciągu roku`
- **Uzasadnienie wyboru:** Czytelnicy w ciągu roku (ogółem)
- **Jednostka miary:** osoba
- **Najniższy poziom z danymi:** gmina (poziom 6)
- **Dostępne lata:** 1995–2025 (31 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 2479 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 661473 (2025)
  - Zakopane (gmina 1217011): 4570 (2025)

## Życie — Noclegi udzielone turystom na 1000 ludności
- **Oczekiwany najniższy poziom:** gmina
- **Kierunek ("więcej = lepiej?"):** neutralny

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 60298
- **Nazwa w BDL:** `udzielone noclegi na 1000 ludności -> ogółem`
- **Uzasadnienie wyboru:** Udzielone noclegi na 1000 ludności (poziom powiatu)
- **Jednostka miary:** -
- **Najniższy poziom z danymi:** powiat (poziom 5)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 0 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 4947.56 (2025)
  - Zakopane (dane dla Powiatu Tatrzańskiego 1217): 63739.08 (2025)

#### Kandydat 2: Zmienna BDL ID 40921
- **Nazwa w BDL:** `ogółem -> udzielone noclegi ogółem styczeń-grudzień`
- **Uzasadnienie wyboru:** Udzielone noclegi ogółem styczeń-grudzień (poziom miejscowości / gminy)
- **Jednostka miary:** -
- **Najniższy poziom z danymi:** miejscowość / gmina (poziom 7)
- **Dostępne lata:** 1995–2025 (31 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 0 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 16958537 (2025)
  - Zakopane (gmina 1217011): 1369379 (2014)

## Transport — Samochody osobowe na 1000 ludności
- **Oczekiwany najniższy poziom:** powiat
- **Kierunek ("więcej = lepiej?"):** neutralny

### Proponowani kandydaci

#### Kandydat 1: Zmienna BDL ID 60533
- **Nazwa w BDL:** `samochody osobowe na 1000 ludności`
- **Uzasadnienie wyboru:** Samochody osobowe na 1000 ludności (poziom powiatu)
- **Jednostka miary:** szt.
- **Najniższy poziom z danymi:** powiat (poziom 5)
- **Dostępne lata:** 2002–2025 (24 lat/a)
- **Pokrycie w ostatnim roku (2025):**
  - Gminy (poziom 6 z units.json): 0 / 2479
  - Powiaty (poziom 5 z units.json): 380 / 380
- **Przykładowe wartości (2025):**
  - Małopolska (województwo 12): 606.8 (2025)
  - Zakopane (dane dla Powiatu Tatrzańskiego 1217): 547.4 (2025)
