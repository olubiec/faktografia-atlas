# Fale zadań – jak je prowadzi Claude (od 17.11.2026)
Pętla Jules Loop i Orkiestra zostały usunięte. Zadania wykonują sesje Claude, a scala właściciel.

## Układ
- Zadanie = plik `tasks/W<fala>-<id>-<nazwa>.md` (wzór: `tasks/SZABLON.md`). Numer fali jest w nazwie pliku, osobnej listy fal nie ma.
- Zadania jednej fali nie dzielą plików i nie zależą od siebie, więc idą równolegle. Pliki z `tasks/poczekalnia/` czekają na start.
- Start fali = pliki `W<N>-*.md` w `tasks/` na `main` (robi go sesja startowa z promptu startowego).

## Przebieg fali
1. **Sesja startowa** (prompt startowy): wrzuca pliki fali na `main`, potem dla każdego `tasks/W<N>-*.md` uruchamia osobną sesję Claude (`create_session`) i kończy. Nie wykonuje zadań sama.
2. **Sesja zadania**: czyta swój jeden plik, pracuje na gałęzi `claude/<id>` od `origin/main`, zgodnie z `AGENTS.md`, otwiera PR `[W<N>-<id>]` z „Po ludzku”. Nie scala.
3. **Właściciel**: ogląda podgląd Vercel, scala zielone PR-y (lub odsyła z uwagą), potem puszcza następną falę.
4. **Po fali** Claude aktualizuje `docs/STAN.md` i podaje listę do kontroli właściciela.

## Kontrola, którą wcześniej robiła pętla (teraz robi sesja zadania)
- Zakres: `git diff --name-only origin/main...HEAD` tylko z „Zmieniaj” i „Wymagane”.
- Usunięcia: `git diff --name-status --diff-filter=D origin/main...HEAD` puste.
- Aktualizacja gałęzi: tylko `git merge origin/main`.
- Zielone `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, e2e z `@S<n>` w nazwie, jeśli zadanie je ma.
