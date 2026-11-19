# QU05 – Badanie: przesuwane wykresy liniowe na przestrzeni lat
Cel: ustalić, jakie dane lat mamy, gdzie wykres powinien być i jaką biblioteką go zrobić.
Zmieniaj: docs/research/q2-wykres-lat.md
Wymagane: docs/research/q2-wykres-lat.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PRODUKT.md (§4, §4d), src/core/share/card-trend.ts, src/view/profile/*, src/core/data/load-values.ts, src/core/library/load-library.ts, docs/ELEMENTY.md, docs/INSPIRACJE.md
Zadanie: Zgłoszenie 19.11: „nie widzę fajnie przesuwanych wykresów liniowych na przestrzeni lat, a powinny być”. Ustal: (1) gdzie dziś jest wykres lat (profil? karta „Wykres lat”?) i jak wygląda; (2) ile lat mają wskaźniki główne i biblioteczne (policz z danych, histogram liczby lat) i czy dla wskaźnika biblioteki wszystkie lata są w jednym pliku; (3) gdzie wykres ma być: panel wskaźnika na mapie, strona wskaźnika z biblioteki, profil, okno udostępniania; (4) interakcja: przesuwanie suwaka roku zmienia kolor mapy i punkt na linii (jeden stan roku z `useMainView`), przeciągnięcie po linii, wskazanie jednostki (linia wybranej jednostki + mediana kraju), dotyk 44 px; (5) bibliotekę wykresów: sprawdź w rejestrze npm (nazwa, wersja, data, pobrania, licencja, rozmiar) 2–3 kandydatów oraz wariant własnego SVG; wpis do ELEMENTY.md zaproponuj w raporcie, nie dopisuj. Wynik: rekomendacja z kosztem i listą zadań dla QU13.
Gotowe, gdy:
- raport zawiera histogram liczby lat wskaźników (liczby z public/data, nie z pamięci)
- raport porównuje co najmniej 3 opcje z danymi z rejestru npm
- raport ma listę miejsc wstawienia i specyfikację interakcji dla 390 i 1280 px
