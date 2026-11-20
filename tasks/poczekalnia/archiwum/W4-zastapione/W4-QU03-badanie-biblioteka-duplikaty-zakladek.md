# QU03 – Badanie: co w nawigacji powiela mapę (Biblioteka, Rankingi, Porównaj) i co zostawić
Cel: macierz „funkcja × strona” i rekomendacja, które strony scalić lub usunąć, żeby nie było kilku miejsc pokazujących to samo co mapa.
Zmieniaj: docs/research/q2-nawigacja-duplikaty.md
Wymagane: docs/research/q2-nawigacja-duplikaty.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PRODUKT.md (§3, §4, §4a, §4d, §4e), src/App.tsx, src/view/Header.tsx, src/view/pages/Library.tsx, src/view/pages/LibraryVariable.tsx, src/view/pages/Rankings.tsx, src/view/pages/ComparePage.tsx, docs/research/q2-podstawowe-na-start.md
Zadanie: Zgłoszenie właściciela 19.11: „część zakładek można wyrzucić, jeśli powielają sens i działanie; nie ma być kilku stron pokazujących to samo co mapa; stanie się tak z biblioteką”. Zbuduj macierz: wiersze = funkcje (wybór wskaźnika, mapa kolorów, ranking top/bottom, pełny ranking, wykres lat, wybór roku, porównanie A/B, CSV, udostępnianie, wybór poziomu, wyszukiwanie wskaźnika, kategorie), kolumny = Mapa (`/`), Biblioteka (`/biblioteka`, `/biblioteka/<id>`), Rankingi, Porównaj, panel wskaźnika. Zaznacz, gdzie funkcja jest zduplikowana, gdzie jest unikatowa i co się psuje na każdej stronie osobno (np. mapa się nie ładuje). Rekomendacja w 2–3 wariantach: A) Biblioteka = katalog, który zawsze kończy się wczytaniem wskaźnika na mapie (`/?i=b<id>`), a `/biblioteka/<id>` znika; B) Rankingi wchodzą jako tryb panelu mapy; C) zostaje jak jest. Dla każdego: co znika, co przechodzi, jakie przekierowania adresów (stare linki muszą działać), ryzyko, koszt w zadaniach. Zasada przewodnia: usunięcie funkcji to decyzja właściciela (AGENTS.md) – raport tylko rekomenduje.
Gotowe, gdy:
- macierz obejmuje wszystkie wymienione funkcje i 5 kolumn
- każdy wariant ma listę przekierowań starych adresów
- raport kończy się pytaniami do właściciela (tak/nie) i rekomendacją z uzasadnieniem
