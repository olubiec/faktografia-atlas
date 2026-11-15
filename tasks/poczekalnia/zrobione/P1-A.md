# P1-A – Rankingi czytelne na telefonie
Cel: /rankingi na 390 px bez przewijania w poziomie i bez kodów zamiast nazw.
Zmieniaj: src/view/pages/Rankings.tsx, tests/unit/rankings-view.test.tsx
Wymagane: tests/unit/rankings-view.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/view/pages/Rankings.tsx (oraz komponenty, które importuje z src/view/ranking/)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P1-A`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P1-A] Rankingi czytelne na telefonie`, `git push -u origin task/P1-A`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
1. Znajdź, skąd bierze się „24 - 345.5” i zamień kod jednostki na jej nazwę (użyj tych samych danych jednostek co reszta aplikacji; nie importuj public/data).
2. Filtr „Rok” i selecty: w-full, min-w-0, w kolumnie; nic nie może wystawać poza 390 px (dziś 407 px).
3. „Podsumowanie”: zamień „Mediana: 50, Najwyżej: 24” na zdania z nazwą i jednostką miary, np. „Najwyżej: Warszawa, 4 451 os./km²”.
4. Sekcja „Mapa” (pusty kwadrat z czarną ramką): usuń; jeśli istnieje gotowy komponent miniatury mapy, użyj go.
5. Liczby przez Intl.NumberFormat('pl-PL').
Jeśli lista/podsumowanie są w osobnym pliku w src/view/ranking/, wolno zmienić tylko ten jeden plik, wpisz go w raporcie.

## Gotowe, gdy
- test: żadna pozycja listy nie jest samym kodem liczbowym; podsumowanie zawiera nazwę jednostki
- Playwright (skrypt tymczasowy poza repo, 390x844, executablePath /opt/pw-browsers/chromium): scrollWidth <= 390; wszystkie przyciski i selecty >= 44 px wysokości

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
