# P1-B – Porównaj: stan pusty i wynik na telefonie
Cel: /porownaj ma sensowny stan pusty i czytelny wynik na 390 px.
Zmieniaj: plik strony Porównaj (znajdź: grep -rl "Porównaj" src/view/pages), tests/unit/compare-view.test.tsx
Wymagane: tests/unit/compare-view.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, plik strony Porównaj, src/core/compare/compare.ts

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P1-B`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P1-B] Porównaj: stan pusty i wynik na telefonie`, `git push -u origin task/P1-B`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
1. Stan pusty: jedno zdanie opisu, dwa duże pola wyboru jednostki (min. 44 px) i 3 gotowe pary do kliknięcia (np. trzy pary województw z istniejących danych) zamiast pięciu linków.
2. Wynik poniżej breakpointu tablet: karty wierszy zamiast szerokiej tabeli (wskaźnik, wartość A, wartość B, tekst różnicy). Od md: bez zmian.
3. Teksty różnicy (diffText) zawijają się, nie są ucinane.
Nie zmieniaj src/core/compare/compare.ts.

## Gotowe, gdy
- test: po wybraniu pary pojawia się >= 1 wiersz z diffText
- test: stan pusty ma 3 linki par o wysokości >= 44 px
- scrollWidth <= 390 na stanie pustym i z wynikiem (Playwright, skrypt tymczasowy)

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
