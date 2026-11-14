# P3-C – Biblioteka: domyślnie to, co działa
Cel: /biblioteka domyślnie pokazuje zmienne z pobranymi wartościami; reszta po wyszukaniu lub przełączniku.
Zmieniaj: plik(i) strony Biblioteki (znajdź: grep -rln "Biblioteka" src/view), tests/unit/library-view.test.tsx
Wymagane: tests/unit/library-view.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, strona Biblioteki, tests/fixtures

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P3-C`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P3-C] Biblioteka: domyślnie to, co działa`, `git push -u origin task/P3-C`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
1. Domyślny filtr „tylko z danymi”; przełącznik „Pokaż wszystkie” z liczbą (format pl-PL).
2. Paginacja: 20 wyników, przycisk „Pokaż więcej” (44 px). Bez nowych pakietów.
3. Karta: tytuł max 2 linie, okruszki skrócone do 2 ostatnich poziomów (pełne w title/aria-label), znacznik „dane gotowe”.
4. Wyszukiwanie zachowuje filtr; pusty wynik podpowiada „Pokaż wszystkie”.
5. Pozycja „jeszcze niepobrane”: zrozumiały opis, że zamówienie to zgłoszenie w repozytorium (link zostaje), bez wymagania wiedzy o GitHubie.

## Gotowe, gdy
- test na fikturach: domyślnie tylko pozycje z danymi; po przełączniku więcej
- test: pierwsza strona = 20 kart
- Playwright 390 px: wysokość strony <= 6000 px, scrollWidth <= 390

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
