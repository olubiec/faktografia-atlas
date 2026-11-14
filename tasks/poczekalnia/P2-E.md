# P2-E – Linki Kontakt i Zastrzeżenie w stopce i menu
Cel: Kontakt i Zastrzeżenie dostępne ze stopki i menu.
Zmieniaj: src/view/layout/SiteFooter.tsx, plik menu z P1-G, tests/unit/footer-menu-new-links.test.tsx
Wymagane: tests/unit/footer-menu-new-links.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, SiteFooter.tsx, plik menu

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P2-E`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P2-E] Linki Kontakt i Zastrzeżenie w stopce i menu`, `git push -u origin task/P2-E`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Dopisz po jednym linku: Kontakt (/kontakt) i Zastrzeżenie o danych (/zastrzezenie) w stopce (w odpowiedniej zwijanej grupie) i w menu (po „Prywatność”). Nie zmieniaj istniejących testów.

## Gotowe, gdy
- test: stopka i menu zawierają href /kontakt i /zastrzezenie
- testy z P1-F i P1-G nadal zielone

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
