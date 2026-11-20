# QU07 – Badanie: wskaźnik z biblioteki ma mieć wszystkie funkcje mapy
Cel: wykaz brakujących funkcji dla wskaźnika z biblioteki (mapa, legenda, rok, poziom, ranking, wykres lat, udostępnianie) i plan ich włączenia.
Zmieniaj: docs/research/q2-biblioteka-pelna-mapa.md
Wymagane: docs/research/q2-biblioteka-pelna-mapa.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PRODUKT.md (§4d „Zmiana 17.11.2026”), src/view/pages/LibraryVariable.tsx, src/core/indicators/registry.ts, src/core/data/load-any-values.ts, src/view/map/AtlasMap.tsx (tylko czytasz), docs/research/q2-podstawowe-na-start.md
Zadanie: Zgłoszenie 19.11: „w bibliotece chyba powinna włączać się normalnie mapa i wszystkie funkcje po wybraniu wskaźnika – przemyśl to”. (1) Wejdź w 3 wskaźniki z biblioteki (pobrany powiatowy, pobrany gminny, niepobrany) na /biblioteka/<id> i na /?i=b<id>; zapisz, które funkcje działają na każdym z adresów (mapa, legenda, klasy, suwak roku, zmiana poziomu, tooltip, kliknięcie → profil, panel, ranking, udostępnianie, kopiuj link). (2) Zmapuj braki na zadania W3-QC606, W5-QC608, W6-QC804, W6-QC806 (czy QU12 jest już pokryte, a czy dubluje). (3) Zaproponuj wariant „jedna ścieżka”: kliknięcie wskaźnika w bibliotece = nawigacja do `/?i=b<id>` i wczytanie mapy, a strona /biblioteka/<id> zostaje tylko dla niepobranych („Zamów”). (4) Wskaż ograniczenia: profil miejsca nie obejmuje wskaźników biblioteki (PRODUKT §4d), poziomy tylko powiat/gmina, jednostki brakujące.
Gotowe, gdy:
- raport ma tabelę „funkcja × adres” dla 3 wskaźników
- raport wskazuje powielenia z zadaniami QC606/QC608/QC804/QC806
- raport zawiera zalecenie wariantu i listę zadań dla QU12
