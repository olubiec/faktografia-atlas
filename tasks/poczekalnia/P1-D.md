# P1-D – Profil w arkuszu: zakreślenie mieści się w kolumnie
Cel: Odręczne zakreślenie dużej liczby w profilu na telefonie nie wychodzi poza kolumnę.
Zmieniaj: src/view/profile/ProfileSheetMobile.tsx, tests/unit/profile-annotation.test.tsx
Wymagane: tests/unit/profile-annotation.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/view/profile/ProfileSheetMobile.tsx, importowany komponent adnotacji (rough-notation)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P1-D`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P1-D] Profil w arkuszu: zakreślenie mieści się w kolumnie`, `git push -u origin task/P1-D`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Wolno zmienić src/view/profile/ProfileSheetMobile.tsx (wymieniony wprost). Jeśli adnotacja jest w osobnym komponencie, wolno zmienić jeden ten plik; wpisz go w raporcie.
1. Zakreślenie dopasowane do rozmiaru liczby (padding z tokenów), kolumna z overflow: clip.
2. Rozmiar liczby przez klasy z tokenów, bez łamania i bez wychodzenia poza kolumnę.
3. prefers-reduced-motion: zakreślenie rysowane od razu (animate: false).

## Gotowe, gdy
- test: dla liczby „4 451,0” bounding box zakreślenia mieści się w boxie kolumny przy 390 px
- test: przy reduced-motion opcja animate = false

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
