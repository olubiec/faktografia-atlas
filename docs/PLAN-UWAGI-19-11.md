# Uwagi właściciela 19.11.2026 – plan (kolejne Q: Q4–Q6, poza Q2)

Dokument planisty. Nie zmienia kodu strony. Zadania leżą w `tasks/poczekalnia/` (nic nie wystartowało). Właściciel rozbuduje i doprecyzuje; start fali = „start W4” itd.

## Uwagi (słowa właściciela, streszczone)
1. Okno „Pobierz i udostępnij”: po dodaniu dodatkowych kart przełączanie między stronami szwankuje. Każdy rodzaj karty ma być tylko raz, żeby informacje się nie powielały.
2. Biblioteka: po wybraniu wskaźnika powinna się normalnie włączać mapa i wszystkie funkcje. Brakuje przesuwanych wykresów liniowych na przestrzeni lat. Brakuje pełnego menu kategorii i wyszukiwania zamiast „wielkiej ilości danych”.
3. Rankingi: nielogiczne, nieczytelne, mapa się nie ładuje. Do rozpracowania i doprecyzowania.
4. Zakładki, które powielają sens i działanie mapy, można usunąć (ryzyko: Biblioteka). Usunięcie funkcji = decyzja właściciela.

5. (druga tura 19.11) Okno „Pobierz i udostępnij” ucina dłuższe teksty – **zrobione w Q2** (przyciski zawijają napis, „+ Dodaj stronę” przyklejone do prawej krawędzi paska).
6. (druga tura) Biblioteka: podstawowe wskaźniki da się usuwać, ale nie dodawać – **zrobione w Q2** (przycisk „Dodaj do Moich wskaźników” na liście i na stronie wskaźnika, tylko dla pobranych).
7. (druga tura) „Moje wskaźniki” w panelu mapy nie ma strzałki rozwijania – **zrobione w Q2** (strzałka w dół/w górę).
8. (druga tura) Czerwone kropki miejscowości na mapie „dają po oczach”: analiza, czy je usunąć, czy mają wartość (miejscowość nie ma własnych danych GUS; jest gmina miejska). Czy „gmina miejska” = „dane miasta”, żeby się nie powielało. → **QU20**.
9. (druga tura) Po wejściu w powiat trzeba klikać strzałkę „Wróć”; po oddaleniu scrollem nie da się kliknąć innej jednostki, dopiero po strzałce. → **QU21**.
10. (druga tura) „Dodaj wskaźnik” w wielu miejscach od razu pokazuje długą listę zamiast pełnego menu z kategoriami i szukajką (jedno wspólne menu wszędzie). → rozszerza **QU06/QU11**.
11. (druga tura) Porównanie: brak wykresów po przedziale czasu; mogą być wspólne, zestawiające miejsca. → rozszerza **QU05/QU13**.
12. (druga tura) Logika „Moje wskaźniki” a „Pobierz i udostępnij”: karta powiatu Chorzów pokazuje wskaźnik mapy (saldo migracji), a lista Moich wskaźników nie ma wpływu na udostępnianie. Trzeba spójnie rozdzielić: wskaźnik mapy / lista „Moje” / zestaw kart. → **QU22** (analiza przed wdrożeniem).
13. (druga tura) Pytanie: poziom administracyjny w Bibliotece tylko „powiaty / gminy / wszystkie”? Dziś etykieta wskaźnika to „powiaty” albo „gminy i powiaty”. → do decyzji w **QU06** (propozycja: filtr Województwa · Powiaty · Gminy · Wszystkie, zgodny z poziomami w danych).
14. (druga tura) Zakładka „Przewiń w dół: Działy tematyczne…” z Home.tsx nakłada się na okno udostępniania (z-index); wymaga tokenu w `config/tokens.json` – za zgodą właściciela. → **QU23**.

Wszystkie nowe zadania QU20–QU23 to najpierw analiza i raport (nic nie zmienia ekranów), wdrożenie dopiero po Twoich decyzjach, po dokładnym przemyśleniu.

## Podział na fale
| Fala | Zadania | Charakter |
|---|---|---|
| **W4** (start od razu, wszystko równolegle) | QU01 badanie przełączania kart · QU02 „każdy rodzaj raz” (core + menu) · QU03 duplikaty zakładek · QU04 diagnoza Rankingów · QU05 wykres lat · QU06 menu kategorii + szukajka · QU07 biblioteka → mapa | 6 raportów + 1 mała poprawka; nic nie zmienia ekranów |
| **W5** (po raportach i Twoich decyzjach) | QU10 naprawa okna udostępniania · QU11 menu kategorii w Bibliotece · QU12 wskaźnik z biblioteki otwiera mapę · QU13 wykres lat · QU14 Rankingi nowy układ · QU15 Rankingi mapa | wdrożenie; QU14 i QU15 na tym samym pliku – idą po kolei |
| **W4b** (analizy, druga tura) | QU20 kropki miejscowości i „gmina miejska” · QU21 nawigacja po powiecie (Wróć, oddalanie) · QU22 logika Moje wskaźniki / mapa / udostępnianie · QU23 warstwa z-index | tylko raporty |
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

## Zadania druga tura (w skrócie)
- **QU20** inwentarz: skąd kropki, ile ich, czy da się je kliknąć i co otwierają; czy miejscowość ma własne dane; relacja gmina miejska = miasto (TERYT), propozycja: ukryć kropki na domyślnym widoku, pokazać dopiero po przybliżeniu albo usunąć.
- **QU21** opis dzisiejszego zachowania (Wróć, kliknięcia po oddaleniu) i wariant: kliknięcie innej jednostki zawsze zmienia wybór, bez konieczności „Wróć”.
- **QU22** mapa stanów: wskaźnik mapy, lista „Moje”, zestaw kart; tabela „co wpływa na co” i jedna zasada (np. okno udostępniania zaczyna od wskaźnika mapy, a dodawanie kart bierze z „Moich”).
- **QU23** które elementy mają z-index nad oknem udostępniania i jaki token dodać.
