# P4-B – Intro mapy: krótkie i pomijalne
Cel: Intro krótsze na telefonie, jednorazowe w sesji, przerywane dotknięciem.
Zmieniaj: src/view/map/IntroOverlay.tsx, src/core/motion/timeline.ts, tests/unit/intro-session.test.tsx
Wymagane: tests/unit/intro-session.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, IntroOverlay.tsx, timeline.ts

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P4-B`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P4-B] Intro mapy: krótkie i pomijalne`, `git push -u origin task/P4-B`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Istniejących testów nie zmieniaj. Pomiń intro przy ponownej wizycie w sesji (sessionStorage w try/catch). Dotknięcie kończy intro. Telefon: czas całkowity <= 0,6 × desktop (nazwana stała w timeline.ts). Reduced-motion: mapa od razu.

## Gotowe, gdy
- test czystej logiki: czas telefon <= 0,6 × desktop
- test komponentu: drugi render w sesji nie pokazuje intra
- istniejące testy timeline zielone

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
