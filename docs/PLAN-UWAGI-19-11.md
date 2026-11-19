# Uwagi właściciela 19.11.2026 – plan (domknięcie Q2)

Dokument planisty. Nie zmienia kodu strony. Zadania leżą w `tasks/poczekalnia/` (nic nie wystartowało). Właściciel rozbuduje i doprecyzuje; start fali = „start W4” itd.

## Uwagi (słowa właściciela, streszczone)
1. Okno „Pobierz i udostępnij”: po dodaniu dodatkowych kart przełączanie między stronami szwankuje. Każdy rodzaj karty ma być tylko raz, żeby informacje się nie powielały.
2. Biblioteka: po wybraniu wskaźnika powinna się normalnie włączać mapa i wszystkie funkcje. Brakuje przesuwanych wykresów liniowych na przestrzeni lat. Brakuje pełnego menu kategorii i wyszukiwania zamiast „wielkiej ilości danych”.
3. Rankingi: nielogiczne, nieczytelne, mapa się nie ładuje. Do rozpracowania i doprecyzowania.
4. Zakładki, które powielają sens i działanie mapy, można usunąć (ryzyko: Biblioteka). Usunięcie funkcji = decyzja właściciela.

## Podział na fale
| Fala | Zadania | Charakter |
|---|---|---|
| **W4** (start od razu, wszystko równolegle) | QU01 badanie przełączania kart · QU02 „każdy rodzaj raz” (core + menu) · QU03 duplikaty zakładek · QU04 diagnoza Rankingów · QU05 wykres lat · QU06 menu kategorii + szukajka · QU07 biblioteka → mapa | 6 raportów + 1 mała poprawka; nic nie zmienia ekranów |
| **W5** (po raportach i Twoich decyzjach) | QU10 naprawa okna udostępniania · QU11 menu kategorii w Bibliotece · QU12 wskaźnik z biblioteki otwiera mapę · QU13 wykres lat · QU14 Rankingi nowy układ · QU15 Rankingi mapa | wdrożenie; QU14 i QU15 na tym samym pliku – idą po kolei |
| **W6** (po W5) | QU16 porządki w nawigacji · QU17 aktualizacja PRODUKT.md | usunięcia stron tylko za Twoją zgodą |

Uwaga: w `tasks/poczekalnia/Q/` są już zadania W4–W7 (QC4xx–QC9xx, ta sama numeracja fal). Pliki QU tylko je uzupełniają. Kolizje do sprawdzenia przed startem: QU12 z QC606/QC608, QU10 z QC915/QC917, QU11 z QC509, QU14 z QC609 (Rankingi), QU03 z QC611. Przy kolizji zostaje starsze zadanie QC, a QU się zawęża.

## Zadania w skrócie
- **QU01** odtwarza błąd okna udostępniania. Hipotezy: `availableKinds` w `ShareDialog.tsx` zna 5 rodzajów, a menu dodaje 10, więc dodane karty tabela/duża liczba/wykres/rozkład spadają na pierwszy rodzaj; `ShareControls` nadpisuje rodzaj bieżącej strony (duplikaty).
- **QU02** `hasKind` i blokada drugiej strony tego samego rodzaju; ranking „najwyżej” i „najniżej” to dwa rodzaje; w menu użyte pozycje szare z napisem „już w zestawie”.
- **QU03** macierz funkcja × strona (Mapa, Biblioteka, Rankingi, Porównaj, panel) i 3 warianty: A) Biblioteka = katalog prowadzący zawsze na mapę, B) Rankingi jako tryb panelu mapy, C) bez zmian. Z listą przekierowań starych adresów.
- **QU04** gdzie ma być „mapa” w Rankingach i dlaczego się nie ładuje; audyt czytelności kontrolek; szkic układu 390/1280 px.
- **QU05** ile lat mają dane (histogram z `public/data`), gdzie wstawić wykres, 3 opcje biblioteki (sprawdzone w rejestrze npm) lub własny SVG; interakcja jednego stanu roku.
- **QU06** pełne drzewo kategorii BDL z liczbami, projekt: start = „Moje wskaźniki” + szukajka + menu; lista dopiero po wyborze.
- **QU07** tabela „funkcja × adres” dla 3 wskaźników biblioteki i plan: pobrany wskaźnik otwiera `/?i=b<id>`.
- **QU10–QU17**: wdrożenie wg raportów (szczegóły w plikach zadań).

## Twoje decyzje przed W5
1. Czy usuwamy lub scalamy strony (QU03: A, B czy C)?
2. #531 (podpowiedzi tylko z pobranych): a) zmieniamy istniejący test, b) porzucamy.
3. Czy Rankingi zostają osobną stroną?
4. Biblioteka wykresów lat: własny SVG czy pakiet (wpis do ELEMENTY.md)?
