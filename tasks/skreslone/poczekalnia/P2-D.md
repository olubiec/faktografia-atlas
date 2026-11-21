# P2-D – Trasy, 404, ErrorBoundary, lazy loading
Cel: Prawdziwy 404, brak tras testowych w produkcji, odporność na błędy, mniejszy start.
Zmieniaj: src/App.tsx, src/view/layout/ErrorBoundary.tsx, src/view/pages/NotFound.tsx, tests/unit/app-routes.test.tsx
Wymagane: tests/unit/app-routes.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/App.tsx, tests/e2e (jak e2e włączają trasy /__test/)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P2-D`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P2-D] Trasy, 404, ErrorBoundary, lazy loading`, `git push -u origin task/P2-D`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
1. Dodaj trasy /kontakt (Contact) i /zastrzezenie (DataDisclaimer) z plików z P2-C (jeśli ich jeszcze nie ma w gałęzi, scal task/P2-C najpierw).
2. Trasa * → NotFound (komunikat po polsku, link do mapy, noindex przez PageMeta).
3. Trasy /__test/* tylko gdy import.meta.env.DEV lub VITE_E2E === 'true'; sprawdź, jak dziś robią to testy e2e i nie psuj ich.
4. /design tylko poza produkcją.
5. React.lazy + Suspense dla stron innych niż Home (fallback o stałej minimalnej wysokości).
6. ErrorBoundary wokół Routes: komunikat po polsku + przycisk „Wczytaj ponownie” (44 px), błąd do console.error.
7. Dodaj do raportu rozmiar głównego chunku z pnpm build przed i po.

## Gotowe, gdy
- test: nieznana ścieżka renderuje NotFound
- test: z vi.stubEnv produkcyjnym /__test/x renderuje NotFound
- test: komponent rzucający błąd daje komunikat zamiast pustej strony
- pnpm build przechodzi; pnpm test:e2e --trace off nie psuje istniejących e2e

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
