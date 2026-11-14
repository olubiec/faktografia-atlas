# P2-F – vercel.json: prawdziwy 404
Cel: Nieznana ścieżka zwraca HTTP 404 (z index.html), znane trasy 200.
Zmieniaj: vercel.json, tests/unit/vercel-routes.test.ts
Wymagane: tests/unit/vercel-routes.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, vercel.json, src/App.tsx (lista tras po scaleniu P2-D)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P2-F`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P2-F] vercel.json: prawdziwy 404`, `git push -u origin task/P2-F`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Wolno zmienić vercel.json (wymieniony wprost). Nagłówków bezpieczeństwa i CSP NIE ruszaj.
Zamień rewrite „wszystko → index.html” na rewrites tylko dla znanych tras SPA wczytanych z src/App.tsx (bez * i /__test/ i /design) oraz dla zasobów; pozostałe ścieżki → index.html ze statusem 404 (mechanizm Vercel: osobna reguła z kodem statusu, sprawdź w dokumentacji Vercel „rewrites/ status”; jeśli nie da się statusu 404 na rewrite, opisz alternatywę i zatrzymaj się).

## Gotowe, gdy
- test czyta vercel.json i App.tsx: każda publiczna trasa pasuje do wzorca rewrite; „/nie-ma” nie pasuje

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
