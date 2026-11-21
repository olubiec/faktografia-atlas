# P1-G – Menu telefonu: Rankingi, Porównaj, Prywatność
Cel: Hamburger zawiera wszystkie podstrony.
Zmieniaj: plik menu nagłówka (znajdź: grep -rn "Skąd są dane" src/view), tests/unit/main-menu-links.test.tsx
Wymagane: tests/unit/main-menu-links.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, plik menu, src/App.tsx

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P1-G`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P1-G] Menu telefonu: Rankingi, Porównaj, Prywatność`, `git push -u origin task/P1-G`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Kolejność pozycji: Biblioteka, Rankingi, Porównaj, O projekcie, Skąd są dane, Prywatność. Pola min. 44 px. Nie dodawaj Kontaktu (robi to P2-E).

## Gotowe, gdy
- test: menu ma dokładnie 6 linków w tej kolejności
- test: każdy href jest trasą z src/App.tsx (test czyta routes)

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
