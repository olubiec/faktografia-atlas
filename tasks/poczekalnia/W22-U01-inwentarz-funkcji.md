# U01 – Inwentarz funkcji i duplikatów
Cel: jedna tabela wszystkiego, co jest na stronie, z oceną „zostaje / scalamy / usuwamy”.
Zmieniaj: docs/research/u/U01.md
Wymagane: docs/research/u/U01.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, src/App.tsx, src/view/Header.tsx, docs/research/qu/QU03*.md, docs/research/qu/QU07*.md
Zadanie:
1. Wypisz każdą trasę (src/App.tsx), każdą pozycję menu, każde okno lub arkusz i każdy przycisk akcji. Dla każdego: co robi dla użytkownika, pliki, liczba linii, testy (unit/e2e), od czego zależy.
2. Zaznacz duplikaty funkcji, czyli dwa miejsca robiące to samo dla użytkownika: ranking w panelu i /rankingi, picker i /biblioteka, /porownaj, porównanie w profilu i CompareMaps, „Moje wskaźniki” (Biblioteka, panel, okno dodawania, arkusz), udostępnianie w 6 miejscach.
3. Dla każdej pozycji podaj werdykt wg docs/PLAN-UPROSZCZENIE.md §2 i koszt: pliki do usunięcia lub zmiany, testy do usunięcia lub zmiany, ryzyko.
4. Na koniec liczby: dziś N tras, M przycisków; po uproszczeniu X i Y.
Gotowe, gdy:
- U01.md zawiera tabelę z każdą trasą z App.tsx i każdą pozycją menu z Header.tsx (sprawdź skryptem lub grep, że żadnej nie brakuje).
- Każdy duplikat ma werdykt i koszt.
Raport kończy się sekcjami „Rekomendacja” i „Pytania do właściciela” (najwyżej 3, każde z odpowiedziami do wyboru i zaleceniem). Pisz po ludzku: właściciel nie czyta kodu.
Nie ruszaj: plików ekranu (src/view/Home.tsx, src/view/map/AtlasMap.tsx, src/view/profile/ProfileSheet*.tsx, src/view/map/hooks/*), istniejących testów, docs/STAN.md, package.json, pnpm-lock.yaml.
Tytuł PR zaczyna się od `[W22-<id>]`; opis ma „Po ludzku”.
