# P1-C – Dolny pasek wskaźnika nad paskiem zgody
Cel: Na telefonie zawsze widać nazwę wskaźnika, rok i legendę, także gdy pasek zgody jest otwarty.
Zmieniaj: src/view/main/MobileIndicatorBar.tsx, tests/unit/mobile-indicator-bar.test.tsx
Wymagane: tests/unit/mobile-indicator-bar.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/view/main/MobileIndicatorBar.tsx, src/view/consent/ (tylko do czytania)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P1-C`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P1-C] Dolny pasek wskaźnika nad paskiem zgody`, `git push -u origin task/P1-C`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
1. Wykryj element paska zgody w DOM (ResizeObserver) i podnieś pasek wskaźnika o jego wysokość (zmienna CSS ustawiana w komponencie).
   Jeśli to niemożliwe bez zmiany src/view/consent (zmiana zabroniona w tym zadaniu), zatrzymaj się i opisz dokładnie co trzeba tam zmienić.
2. Pasek pokazuje: nazwę wskaźnika, rok, zakres legendy (min–max z jednostką); tekst max 2 linie, bez ucięć.
3. Uwzględnij env(safe-area-inset-bottom).

## Gotowe, gdy
- test: przy atrapie paska zgody 110 px bounding boxy obu elementów się nie przecinają
- test: nazwa i rok są w DOM
- Playwright 390x844, pierwsza wizyta (bez zgody): oba paski widoczne, bez nakładania

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
