# U04 – Jeden wybór danych (kategorie + szukaj) zamiast pickera, Biblioteki i „Moich wskaźników”
Cel: zaprojektować i sprawdzić na prototypie jedno menu wyboru danych.
Zmieniaj: docs/research/u/U04.md, src/view/test/proto/wybor-danych.tsx, src/core/catalog/prototype-tree.ts, tests/unit/u04-prototype-tree.test.ts
Wymagane: docs/research/u/U04.md, tests/unit/u04-prototype-tree.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, docs/research/qu/QU06*.md, docs/research/biblioteka-gus.md, src/view/library/*, src/view/main/IndicatorPanel.tsx, docs/research/u/WYTYCZNE.md, docs/PLAN-UPROSZCZENIE.md §0 (decyzje zatwierdzone)
Zadanie:
1. Zbadaj katalog: wskaźniki wbudowane i pobrane z biblioteki (public/data, wczytywane przez istniejące loadery, bez importu JSON). Ile działów i grup, ile wskaźników w grupie, ile ma dane gmin/powiatów/województw.
2. Zaproponuj drzewo Dział › Grupa › Wskaźnik (2 lub 3 poziomy, uzasadnij). Wyszukiwanie: istniejący indeks czy pakiet (porównaj z rejestrem npm, bez instalacji). Niepobrane wskaźniki: ukryte (decyzja D2); sprawdź, czy dziś strona już pokazuje tylko pobrane (testy library-only-fetched, library-page-fetched) i opisz luki. Kolejność działów i wskaźników w drzewie: najpierw podstawowe i najpowszechniejsze (kryteria ustala niezależnie zadanie U11 w config/library-priority.json; jeśli pliku jeszcze nie ma, zaproponuj własną kolejność i napisz, że trzeba ją zgrać z U11).
3. Test 15 haseł zwykłego człowieka (np. „bezrobocie”, „szkoły”, „ludność”, „mieszkania”, „lekarze”): czy właściwy wskaźnik jest w pierwszej trójce.
4. Prototyp pod /__test/proto/wybor-danych (plik z eksportem domyślnym; trasa powstaje sama, App.tsx nie zmieniasz). Kategorie, wejście w kategorię, szukajka, telefon i komputer. Bez podpinania do mapy.
Gotowe, gdy:
- Test jednostkowy sprawdza, że każdy wskaźnik z katalogu trafia dokładnie do jednej grupy drzewa.
- U04.md ma wynik testu 15 haseł i szkic menu.
- Prototyp otwiera się na podglądzie Vercel pod /__test/proto/wybor-danych.
Raport kończy się sekcjami „Rekomendacja” i „Pytania do właściciela” (najwyżej 3, każde z odpowiedziami do wyboru i zaleceniem). Pisz po ludzku: właściciel nie czyta kodu.
Nie ruszaj: src/App.tsx, plików ekranu (src/view/Home.tsx, src/view/map/AtlasMap.tsx, src/view/profile/ProfileSheet*.tsx, src/view/map/hooks/*), istniejących testów, docs/STAN.md, package.json, pnpm-lock.yaml.
Tytuł PR zaczyna się od `[W22-<id>]`; opis ma „Po ludzku”.
