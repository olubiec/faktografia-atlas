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

## Stan fal na 18.11.2026
| Status | Fala | Zadania | PR / uwagi |
|---|---|---|---|
| ✅ | F1–F13 (stary plan S14–S21) | – | zamknięte do 28.10.2026 (szczegóły: `docs/STAN.md`) |
| ✅ | Q1 = W1-QC* | 22 pliki w `tasks/`, wszystkie scalone | #453–#472, #474–#476 (+ QC601 #459); zadania W16-M01–M06 z `tasks/` to starsza fala Orkiestry (M02–M05 w historii main; M01, M06 – do weryfikacji) |
| ✅ | Poprawki: FIX, FIX2, FIX3, FIX4, FIX5, PLAN | – | #477, #478, #479, #485, #481, #480 |
| ✅ | P1 = W19 (PF01–PF09) | 9/9 | #482–#491 |
| ✅ | FIX6 (A–I) | 10/10 | #493–#502 (plan: `tasks/poczekalnia/FIX6-KOLEJNOSC.md`) |
| 🔶 | FIX7 | startowy widok mapy | PR #503, CI czerwone (testy dotykowe) |
| ⬜ | Q2 = W2 | 19 zadań w `tasks/poczekalnia/` (6 nowych + 13 z `Q/`; QC402 i QC502 pominięte) | na „start Q2”, po sprawdzeniu kolizji plików z FIX4/FIX6/FIX7 |
| ⬜ | Q3–Q7 = W3–W7 | 12 · 11 · 10 · 5 · 3 | po kolei; PM10 jedyne na plikach kamery w W3 – po FIX6 jego zakres do weryfikacji (kamera bez stanu Reacta zrobiona w FIX6H2) |
Uwaga: zadania W17/W18 w poczekalni nadal czekają; W17-T04 i W17-T05 są zastąpione przez PF08 i PF07 (zrobione). Pełny plan: `docs/PLAN-POPRAWEK.md`; otwarte sprawy: `docs/STATUS-PRZERWANE.md`.
