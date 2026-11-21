# P4-E – Test reduced-motion na głównych trasach
Cel: Automatyczna gwarancja, że bez ruchu nic się nie animuje.
Zmieniaj: tests/e2e/reduced-motion.spec.ts
Wymagane: tests/e2e/reduced-motion.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, tests/e2e (istniejące specyfikacje jako wzór)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P4-E`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P4-E] Test reduced-motion na głównych trasach`, `git push -u origin task/P4-E`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Trasy: /, /rankingi, /porownaj, /biblioteka, /o-projekcie. emulateMedia({reducedMotion:'reduce'}); po 1 s document.getAnimations() bez trwających animacji skończonych; stan mapy przez window.__atlas. Nazwa testu z @S99. Animacje łamiące regułę wypisz w raporcie, nie naprawiaj.

## Gotowe, gdy
- test przechodzi na 5 trasach albo raport wymienia konkretne łamiące animacje

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
