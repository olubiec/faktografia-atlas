# P4-A – Przejścia między stronami (View Transitions)
Cel: Płynne przejście tras bez nowego pakietu.
Zmieniaj: src/styles/view-transitions.css, pliki z <Link>/navigate w nagłówku i menu, plik głównego CSS importujący style, tests/unit/view-transitions.test.ts
Wymagane: tests/unit/view-transitions.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/styles/, package.json (wersja react-router, tylko czytać)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P4-A`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P4-A] Przejścia między stronami (View Transitions)`, `git push -u origin task/P4-A`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Dodaj prop viewTransition tam, gdzie wspiera to używana wersja react-router. Czasy i krzywe z tokenów. ::view-transition-old/new: fade. @media (prefers-reduced-motion: reduce) → animation: none. Brak wsparcia przeglądarki = zwykła nawigacja.

## Gotowe, gdy
- test: plik css nie zawiera wartości ms ani hex wpisanych na sztywno i ma blok reduced-motion
- Playwright z reducedMotion: po nawigacji document.getAnimations() puste

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
