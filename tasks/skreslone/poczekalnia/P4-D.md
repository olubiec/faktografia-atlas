# P4-D – Badanie biblioteki animacji (tylko raport)
Cel: Decyzja, czy dodawać pakiet `motion`. NIC nie instaluj.
Zmieniaj: (brak zmian w plikach)
Wymagane: (brak)
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, docs/ELEMENTY.md, docs/INSPIRACJE.md

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P4-D`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P4-D] Badanie biblioteki animacji (tylko raport)`, `git push -u origin task/P4-D`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Sprawdź w rejestrze npm (npm view motion version time license dist.unpacked-size; pobrania z api.npmjs.org), repozytorium, licencję, rozmiar, zgodność z React 19, useReducedMotion. Porównaj z opcją „CSS + View Transitions + to co mamy”. Dla intra, arkuszy, list i zakreśleń napisz, czy da się bez nowego pakietu. Wynik: tabela + gotowy wpis do docs/ELEMENTY.md (tekstem w raporcie, nie zapisuj) + rekomendacja w 3 zdaniach.

## Gotowe, gdy
- każda liczba ze źródłem (polecenie lub URL)

## Nie ruszaj
Niczego w repozytorium.
