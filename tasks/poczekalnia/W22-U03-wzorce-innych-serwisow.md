# U03 – Wzorce z innych serwisów z danymi
Cel: przejąć sprawdzone pomysły na proste przeglądanie danych, przełącznik widoków i stronę startową.
Zmieniaj: docs/research/u/U03.md
Wymagane: docs/research/u/U03.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, docs/INSPIRACJE.md, docs/KONCEPT-STRONA-STARTOWA.md
Zadanie:
1. Przejrzyj (strony publiczne, bez logowania): Our World in Data (grapher: Mapa/Wykres/Tabela), Datawrapper (mapy i tabele), Eurostat Regions/Statistical Atlas, Gapminder Tools, GUS „Polska w liczbach” i Portal Geostatystyczny, USAFacts oraz 2–3 strony startowe z animowanym, interaktywnym tłem.
2. Dla każdego: jak wybiera się dane (kategorie, szukaj), jak przełącza się widok, jak zestawia się dwa wskaźniki, ile jest pozycji menu, co działa na telefonie.
3. Wybierz 3 wzorce do przejęcia (pomysł i struktura, nie kod) i 3 błędy do uniknięcia. Podaj linki.
Gotowe, gdy:
- U03.md ma tabelę porównawczą co najmniej 6 serwisów i sekcję „3 do przejęcia / 3 do uniknięcia” z linkami.
Raport kończy się sekcjami „Rekomendacja” i „Pytania do właściciela” (najwyżej 3, każde z odpowiedziami do wyboru i zaleceniem). Pisz po ludzku: właściciel nie czyta kodu.
Nie ruszaj: plików ekranu (src/view/Home.tsx, src/view/map/AtlasMap.tsx, src/view/profile/ProfileSheet*.tsx, src/view/map/hooks/*), istniejących testów, docs/STAN.md, package.json, pnpm-lock.yaml.
Tytuł PR zaczyna się od `[W22-<id>]`; opis ma „Po ludzku”.
