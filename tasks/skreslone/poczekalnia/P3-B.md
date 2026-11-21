# P3-B – Audyt stanu gałęzi danych (tylko odczyt)
Cel: Ustalić faktyczny stan poboru danych. NIC nie zmieniaj.
Zmieniaj: (brak zmian w plikach)
Wymagane: (brak)
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, docs/STAN.md

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P3-B`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P3-B] Audyt stanu gałęzi danych (tylko odczyt)`, `git push -u origin task/P3-B`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Narzędzia GitHub MCP (repo olubiec/faktografia-atlas): list_branches (data/nightly, data/library), ostatnie commity każdej, ostatnie przebiegi workflow „Fetch data” i „Fetch library” (actions_list), otwarte PR z tych gałęzi, data ostatniego udanego przebiegu, rozmiar public/data/library/index.json na gałęzi data/library.
Wynik: tabela element | stan | data | wniosek (max 20 wierszy), każdy wiersz ze źródłem (numer przebiegu/commit). Bez commitu.

## Gotowe, gdy
- tabela kompletna, każdy wiersz ze źródłem

## Nie ruszaj
Niczego w repozytorium. Nie twórz gałęzi.
