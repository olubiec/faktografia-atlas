---
To issue to JEDNO zadanie: {ID}. Rób tylko je. Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
Wolno zmienić wyłącznie: {PLIKI}. Musisz zmienić inny plik → NIE zmieniaj go, napisz w PR dlaczego i zatrzymaj się.
Twój PR sprawdza automat (scripts/ops/check-pr.mjs) – PR z czymkolwiek spoza tej listy nie zostanie scalony.

Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie):
- Tytuł PR zaczyna się od `{ID} –`, opis zawiera `Closes #<numer tego issue>` i sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego).
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, .github/** (chyba że lista plików wyżej je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione wyżej, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: żadnych gołych `return` w teście, `skip`, `only`, `fixme`, usuwania asercji, `@ts-ignore`, `oxlint-disable`. Gdy CI jest czerwone – napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*).
- NIE twórz drugiej wersji czegoś, co już jest na main.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy” zadania.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi automatu przychodzą jako komentarze `@jules` w PR – popraw je w tej samej gałęzi.
