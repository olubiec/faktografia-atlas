# P3-E – Mniejsza waga startowa
Cel: Panel strojenia i indeks biblioteki nie obciążają zwykłego wejścia.
Zmieniaj: plik importujący tweakpane (grep -rn tweakpane src), loader indeksu biblioteki (grep -rn libraryBase src), tests/unit/startup-weight.test.ts
Wymagane: tests/unit/startup-weight.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, wskazane pliki

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P3-E`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P3-E] Mniejsza waga startowa`, `git push -u origin task/P3-E`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Bez zmian w vite.config.ts i package.json.
1. tweakpane tylko przez dynamiczny import() i tylko przy ?tune.
2. Indeks biblioteki (7,9 MB) pobierany tylko po wejściu na /biblioteka*, nigdy z Home.
3. Zmierz przed/po: pnpm build (rozmiary chunków), liczba żądań i bajtów na Home (Playwright page.on('response')).

## Gotowe, gdy
- raport z liczbami przed/po
- test: Home nie wysyła żądania o index.json; tweakpane nie jest statycznie importowany

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
