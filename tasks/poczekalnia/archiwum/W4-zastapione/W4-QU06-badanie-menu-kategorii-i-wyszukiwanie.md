# QU06 – Badanie: pełne menu kategorii i wyszukiwanie zamiast długiej listy w Bibliotece
Cel: projekt menu kategorii (całe drzewo działów) połączonego z wyszukiwarką, który zastąpi „wielką ilość danych” na starcie.
Zmieniaj: docs/research/q2-biblioteka-menu-kategorii.md
Wymagane: docs/research/q2-biblioteka-menu-kategorii.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PRODUKT.md (§4d, §4a), src/view/pages/Library.tsx, src/view/library/CategoryTiles.tsx, src/view/library/LibrarySearchBar.tsx, src/core/library/query.ts, docs/research/biblioteka-gus.md, docs/research/q2-wydajnosc-biblioteki.md
Zadanie: Zgłoszenie 19.11: „brakuje mi pełnego menu kategorii i wyszukiwania zamiast wielkiej ilości danych”. (1) Z `public/library/index.json` (lub `available.json`) wyciągnij pełne drzewo kategorii BDL (poziomy, liczby wskaźników w każdej gałęzi, ile pobranych) – tabela w raporcie. (2) Co pokazuje dziś /biblioteka na starcie (lista 50, kafelki działów) i co jest za duże. (3) Projekt: start = sekcja „Moje wskaźniki” + pasek wyszukiwania + menu kategorii (na komputerze drzewo po lewej, na telefonie lista wejść z okruszkami „Dział › Grupa”); lista wyników dopiero po wyborze kategorii albo wpisaniu tekstu; licznik; stan w adresie. (4) Wyszukiwanie: tylko po nazwie czy też po kategorii; podpowiedzi (patrz QS04 – tylko pobrane, decyzja właściciela #531); co robimy z niepobranymi (zamów). (5) Wymagania wydajnościowe (DOM ≤ 1000, brak pełnego indeksu poza /biblioteka).
Gotowe, gdy:
- raport zawiera tabelę drzewa kategorii z liczbami z danych
- raport zawiera szkic ekranu dla 390 i 1280 px (lista bloków i stany: pusty, wynik, brak wyników)
- raport kończy się listą zadań dla QU11 z plikami
