# O05 – „Na tle sąsiada”: w ilu wskaźnikach gmina wypada lepiej
Cel: porównanie z sąsiadem o najbardziej podobnej liczbie ludności daje zdanie „Maszewo wypada lepiej od Goleniowa w 1 z 11 wskaźników” i listę, w czym lepiej i gorzej.
Zmieniaj: src/core/facts/neighbour-compare.ts, tests/unit/w32-o05-neighbour-compare.test.ts, tests/fixtures/facts-neighbours/*
Wymagane: tests/unit/w32-o05-neighbour-compare.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (§3, §6), src/core/facts/neighbours.ts, src/core/facts/valence.ts (W31-O03)

Zadanie:
1. `compareWithNeighbour(profile, neighbourProfile)` liczy wskaźniki z `valence`, w których pierwsza gmina ma lepszą wartość; pomija wskaźniki, w których brak danych u którejś strony (mianownik = liczba porównanych).
2. Domyślny sąsiad = o najbliższej liczbie ludności; `others` = pozostali sąsiedzi (przełącznik „Porównaj z: …”).
3. Zdanie bez słownictwa meczowego (test z `findViolations`), plus „Lepiej: …” i „Gorzej: …” (maks. 3 nazwy, reszta „i N innych”).
4. Link „Pełne porównanie” = istniejący `?u=A&c=A,B`.

Gotowe, gdy:
- Test: fixture Maszewo/Goleniów → „lepiej w 1 z 11”, „Lepiej: przyrost naturalny”.
- Test: brak danych w jednym wskaźniku obniża mianownik; remis nie liczy się jako „lepiej”.
- Test: wybór sąsiada o najbliższej liczbie ludności i stabilny przy remisie (niższy TERYT).
Nie ruszaj: `src/view/*`, istniejącego `neighbours.ts`.
Tytuł PR zaczyna się od `[W32-O05]`; opis ma „Po ludzku”.
