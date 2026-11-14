# P4-C – Arkusz: punkty zatrzymania
Cel: Arkusz profilu ma 3 punkty zatrzymania i nie zasłania mapy.
Zmieniaj: src/view/ui/BottomSheet.tsx, tests/unit/bottom-sheet-snap.test.tsx
Wymagane: tests/unit/bottom-sheet-snap.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/view/ui/BottomSheet.tsx, node_modules/react-modal-sheet/README.md

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P4-C`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P4-C] Arkusz: punkty zatrzymania`, `git push -u origin task/P4-C`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Użyj wyłącznie udokumentowanych opcji react-modal-sheet: snapPoints (ok. 0,25 / 0,6 / 0,95), start na niskim, bezpieczny obszar dolny, aria-label, brak sprężystości przy reduced-motion.

## Gotowe, gdy
- test: otwarcie na pierwszym punkcie; reduced-motion wyłącza animacje
- Playwright 390x844: po otwarciu widać >= 35% mapy

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
