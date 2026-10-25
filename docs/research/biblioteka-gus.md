# Cała biblioteka GUS (BDL) – limity, pojemność i plan (25.10.2026)

## Limity API BDL (oficjalny „Opis metod API BDL v1” i portal api.stat.gov.pl, sprawdzone 25.10.2026)
| Okno | Bez klucza | Z kluczem (`X-ClientId`, rejestracja e-mailem) |
|---|---|---|
| 1 s | 5 | 10 |
| 15 min | 100 | 500 |
| 12 h | 1 000 | 5 000 |
| 7 dni | 10 000 | 50 000 |
- Dokumentacja **nie podaje**: maksymalnego `page-size`, kodu błędu po przekroczeniu, czy limit liczy się na klucz czy na adres IP, czy zapytania o metadane i o dane mają wspólną pulę. U nas: `page-size=100`, ponawianie po 429 (już w `fetch-values.mjs`).
- Licencja danych CC BY 4.0. Portal nie zakazuje masowego pobierania, a jedyną drogą do wyższych limitów jest rejestracja klucza. Zbiorczych plików do pobrania portal nie wymienia.
- **Nie** rejestrujemy wielu kluczy, żeby obejść limit.

## Co z tego wynika (liczone na naszych nagraniach)
- Jeden wskaźnik na poziomach powiaty + gminy = ok. **38 zapytań** (nagrania: 756 zapytań na 20 wskaźników; lata w jednym zapytaniu). Wąskim gardłem jest limit **7 dni (50 000)**, czyli ok. 7 100 zapytań na dobę, ok. **1 000 wskaźników tygodniowo** przy 80% wykorzystania.
- Nocne odświeżenie naszych 20 wskaźników zużywa ok. 750 zapytań na dobę (ok. 10% dobowego budżetu).
- Rozmiar: 20 wskaźników = 5,8 MB (ok. 0,3 MB na wskaźnik, wiele lat, powiaty + gminy). 10 000 wskaźników ≈ 3 GB, 40 000 ≈ 12 GB. **Liczba wszystkich zmiennych BDL: niezweryfikowana** (pierwszy krok robota ma ją policzyć; samo hasło „ludność” daje 671 zmiennych).

## Pobieranie „na żywo” dla odwiedzających
- Nie przez klucz: wspólny budżet ok. 7 100 zapytań na dobę wystarczyłby dla kilku tysięcy wyświetleń profilu dziennie, bez zapasu, a klucz musiałby siedzieć na serwerze (dziś go nie ma) i łamie zasadę „strona nie woła API GUS”.
- Z przeglądarki bez klucza: nie wiadomo, czy limit jest na IP (niezweryfikowane), CORS niesprawdzony. Nie robimy.
- Zamiast tego: **kolejka życzeń** – odwiedzający prosi o wskaźnik, którego nie ma, robot pobiera go w nocy z budżetu i publikuje.

## Plan (sesja S21 „Biblioteka GUS”, po K5; research przed startem)
1. R6 – magazyn danych: repozytorium i hosting statyczny nie udźwigną gigabajtów (limity niesprawdzone) → `TRYB: RESEARCH` [C] + `TRYB: WYBÓR` (np. magazyn obiektów); nowy element = wpis w ELEMENTY.md.
2. Katalog: robot pobiera listę tematów i zmiennych (z poziomem danych), liczy je i zapisuje katalog.
3. Pobieranie z budżetem: workflow co 12 h, najwyżej ok. 70% limitu 12-godzinnego, wznawialna kolejka z priorytetami (wskaźniki z gminami najpierw), stan w pliku, zero ponownego pobierania gotowych.
4. Aktualizacje: tylko gdy GUS dopisze rok (tani test przez listę lat), nie co noc.
5. Wyszukiwarka wskaźników na stronie z katalogu + „zamów wskaźnik”.
6. Zapytać GUS (kontakt przy API BDL) o zbiorczy eksport lub wyższe limity – tańsze niż kilka miesięcy pobierania.
