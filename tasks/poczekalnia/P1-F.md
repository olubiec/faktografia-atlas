# P1-F – Stopka zwijana na telefonie
Cel: Stopka na telefonie nie ma ~25 linków w jednej kolumnie.
Zmieniaj: src/view/layout/SiteFooter.tsx, tests/unit/site-footer-mobile.test.tsx
Wymagane: tests/unit/site-footer-mobile.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/view/layout/SiteFooter.tsx

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P1-F`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P1-F] Stopka zwijana na telefonie`, `git push -u origin task/P1-F`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
1. Poniżej breakpointu tablet: grupy linków jako <details>/<summary> (3 grupy, domyślnie zwinięte), summary min. 44 px. Od md: układ bez zmian.
2. Zachowaj wszystkie obecne linki i ich kolejność. Nie dodawaj nowych (robi to P2-E).

## Gotowe, gdy
- test: liczba linków w stopce przed = po (policz w teście na stałej liście)
- Playwright 390 px: wysokość zwiniętej stopki <= 320 px, scrollWidth <= 390

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
