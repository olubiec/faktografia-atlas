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

## Stan fal na 20.11.2026
| Status | Fala | Zadania | PR / uwagi |
|---|---|---|---|
| ✅ | F1–F13 (stary plan S14–S21) | – | zamknięte do 28.10.2026 (szczegóły: `docs/STAN.md`) |
| ✅ | Q1 = W1-QC* | 22 pliki w `tasks/`, wszystkie scalone | #453–#472, #474–#476 (+ QC601 #459); zadania W16-M01–M06 z `tasks/` to starsza fala Orkiestry (M02–M05 w historii main; M01, M06 – do weryfikacji) |
| ✅ | Poprawki: FIX, FIX2, FIX3, FIX4, FIX5, PLAN | – | #477, #478, #479, #485, #481, #480 |
| ✅ | P1 = W19 (PF01–PF09) | 9/9 | #482–#491 |
| ✅ | FIX6 (A–I) | 10/10 | #493–#502 (plan: `tasks/poczekalnia/FIX6-KOLEJNOSC.md`) |
| 🔶 | FIX7 | startowy widok mapy | PR #503, CI czerwone (testy dotykowe) |
| ✅ | Q2 = W2 | 19 zadań | zamknięta: #511–#520, #553 (+ [W2-UX] #554, #555) |
| ✅ | Q3 = W3 | 21 plików `tasks/W3-*` (20 scalonych) | #521–#548; otwarte tylko `W3-QS04` (szukajka biblioteki tylko pobrane). Z pierwotnego planu Q3 nie weszły: PM10 (czeka na D4), QC606, QC204, QC903/904/916 – do decyzji przy starcie Q4 |
| ⬜ | Q4–Q7 = W4–W7 | 11 · 10 · 5 · 3 | po kolei; Q4 nie ruszone |
| ⬜ | Uwagi 19.11 = W4-QU/W5-QU/W6-QU | 7 · 6 · 2 (`tasks/poczekalnia/`) | kolejne Q (Q4–Q6), nie Q2: okno udostępniania, Biblioteka, Rankingi, wykres lat; plan: `docs/PLAN-UWAGI-19-11.md` |
| ⬜ | Strona startowa (koncept 19.11) = QU32 (W4d) + QU33–QU38 (W6/W7) | 1 + 6 | czeka na decyzje A/B/C; plan: `docs/KONCEPT-STRONA-STARTOWA.md` |
Uwaga: zadania W17/W18 w poczekalni nadal czekają; W17-T04 i W17-T05 są zastąpione przez PF08 i PF07 (zrobione). Pełny plan: `docs/PLAN-POPRAWEK.md`; otwarte sprawy: `docs/STATUS-PRZERWANE.md`.
