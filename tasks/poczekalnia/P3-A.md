# P3-A – Nocny pobór: PR i auto-merge
Cel: Zielone dane trafiają na main bez ręcznej pracy; brak zmian = brak commitu.
Zmieniaj: .github/workflows/fetch-data.yml
Wymagane: .github/workflows/fetch-data.yml
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, .github/workflows/fetch-data.yml, docs/STAN.md (opis problemu z PR)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P3-A`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P3-A] Nocny pobór: PR i auto-merge`, `git push -u origin task/P3-A`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Wolno zmienić .github/workflows/fetch-data.yml (wymieniony wprost). Ustawienia GitHub (tworzenie PR przez Actions) są już włączone.
1. permissions: contents: write, pull-requests: write, issues: write. concurrency: group fetch-data, cancel-in-progress: false.
2. Wykrywanie zmian: porównaj dane ignorując pole fetchedAt (np. jq 'del(..|.fetchedAt?)'); brak zmian merytorycznych = koniec sukcesem bez commitu i PR.
3. Po zielonym teście kontraktu: gh pr create (base main, head data/nightly, tytuł „Dane GUS: odświeżenie RRRR-MM-DD”) i gh pr merge --auto --squash. Błąd tworzenia PR → krok zakładający issue z linkiem do przebiegu.
4. Nie zmieniaj harmonogramu 01:10 UTC ani obsługi sekretu BDL_CLIENT_ID.

## Gotowe, gdy
- actionlint (lub yamllint) bez błędów
- w raporcie opis 4 scenariuszy: brak zmian, zmiana, błąd kontraktu, błąd sieci
- po scaleniu właściciel uruchomi workflow ręcznie (workflow_dispatch)

## Nie ruszaj
Harmonogramu, innych workflowów, scripts/data.
