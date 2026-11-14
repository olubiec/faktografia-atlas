# P1-E – Dojście do działów pod mapą na telefonie
Cel: Na telefonie wiadomo, że pod mapą są działy tematyczne, i da się do nich dojść.
Zmieniaj: src/view/Home.tsx, tests/e2e/mobile-scroll-hint.spec.ts
Wymagane: tests/e2e/mobile-scroll-hint.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/view/Home.tsx, docs/PRODUKT.md (sekcja ekranu głównego)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P1-E`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P1-E] Dojście do działów pod mapą na telefonie`, `git push -u origin task/P1-E`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Wolno zmienić src/view/Home.tsx (wymieniony wprost).
1. Najpierw SPRAWDŹ w Playwright (hasTouch, 390x844, executablePath /opt/pw-browsers/chromium), czy sekcje pod mapą są osiągalne dotykiem. Wynik opisz w raporcie.
2. Jeśli nieosiągalne: dodaj przycisk (min. 44 px) „Działy tematyczne ↓” przewijający do sekcji (scrollIntoView, behavior zależny od prefers-reduced-motion).
3. Jeśli osiągalne: pokaż istniejącą wskazówkę także na telefonie (dziś `hidden md:block`), krótszy tekst.

## Gotowe, gdy
- test e2e (nazwa z @S99): po kliknięciu/wskazówce sekcja „Działy tematyczne” jest w viewport
- istniejące testy Home nadal zielone (nie zmieniaj ich)

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
