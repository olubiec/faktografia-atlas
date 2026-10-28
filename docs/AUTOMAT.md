# Jules Loop – jak prowadzi projekt do końca
Wersja 2 · 28.10.2026. **Zastępuje** stary automat (issue z etykietą `jules`, „Posłaniec”, `automat.mjs`) i ręczną pętlę (`start-tasks.mjs`). Instalacja i ustawienia: `scripts/jules-loop/README.md`; ogólny opis: `docs/WORKFLOW.md` §3d. Plan zadań: `docs/ARCHITEKTURA.md` §3–§4, kolejka dla generatora: `scripts/ops/automat-kolejka.json` (test `ops-kolejka.test.ts` pilnuje zgodności z ARCHITEKTURA).

## 1. Po ludzku
Każde zadanie to plik `tasks/W<fala>-<id>-<nazwa>.md`. Gdy pliki fali trafią na `main`, workflow **Jules Loop** (GitHub Actions, bez tokenów AI) uruchamia Julesa, pilnuje, żeby PR robił tylko to, co zadanie, scala po zielonym CI, puszcza falę testów, sprawdza CI na `main`, zapisuje dziennik i startuje następną falę. Ty puszczasz fale i oglądasz efekt na punktach kontrolnych; pętla pinguje Cię tylko, gdy trzeba człowieka.

| Kto | Co robi |
|---|---|
| Claude (Planista) | pisze zadania w planie (ARCHITEKTURA), generuje pliki fali, po fali poprawia `STAN.md` z dziennika |
| Ty | pushujesz pliki fali (start), oglądasz podgląd Vercel, decydujesz przy `needs-human`, etykietą `hold` wstrzymujesz scalenie PR |
| Jules Loop | start sesji (do 12 naraz, 80 na dobę), strażnik zgodności, prośby o poprawki, scalanie, fala testów, naprawa integracji, dziennik |
| Jules | kod, testy, PR, poprawki |
| GitHub Actions (`CI`) | `testy`, `bezpieczenstwo`: jedyna twarda blokada |

## 2. Jak puścić falę
1. **Bramka:** CI na `main` zielone (pętla sprawdza je sama po każdej fali; przed pierwszą falą spójrz na Actions).
2. `node scripts/ops/wave-files.mjs F10` – z kolejki i sekcji ARCHITEKTURA powstają pliki w `tasks/poczekalnia/` (pętla ich nie widzi). Generator odrzuci falę z zależnością w tej samej fali albo kolizją plików. `--list` pokazuje fale.
3. **Start:** `git mv tasks/poczekalnia/W10-*.md tasks/` (albo od razu `... F10 --launch`), commit, push na `main`. Push `tasks/W*.md` budzi pętlę; CI go ignoruje.
4. Pętla robi resztę. Kolejne fale możesz wrzucić z góry (`W11`, `W12`): startują po bramce poprzedniej.
- **Gotowe pliki:** F10–F12 w `tasks/poczekalnia/` (generator już je zrobił), F13 (4 testy e2e) w `tasks/poczekalnia/W13-T13*`. Indeks: `docs/prompty/README.md`.
- **Zadania spoza kolejki** (poprawki z oglądu, stabilizacja testów, backlog): plik wg `tasks/SZABLON.md`, nazwa `W<n>-<id>-<nazwa>.md`, `n` = następny wolny numer fali. Przykład: `tasks/poczekalnia/W13-T13*.md` (stabilizacja czterech testów e2e; start po scaleniu #408).
- **Nazwy:** `W<n>` = numer fali pętli (F10 → `W10`), id bez kropek (`W2.24` → `W224`, `T13.1` → `T131`). Tytuł PR: `[W10-W224]`; tytuł scalenia: `W10-W224: W2.24 – …` (kropkowane id zostaje w tytule).

## 3. Co robi pętla (jeden „tick”)
Budzą ją: push `tasks/W*.md`, zakończony workflow `CI`, cron co 30 min (tylko gdy pętla aktywna), ręczne uruchomienie. Jeden tick naraz, stan w issue „🤖 Jules Loop: stan pętli”.
1. Fala: walidacja (każdy plik ma „Zmieniaj:”, zakresy rozłączne; inaczej odrzucona, bez zużycia sesji) → sesje Julesa dla wszystkich zadań.
2. PR: konflikt → prośba o rebase/merge; CI czerwone → 10 min na CI Fixer Julesa, potem prośba z logiem (2 próby); zielone → **strażnik zgodności**: pliki spoza „Zmieniaj/Wymagane”, brak plików „Wymagane”, usunięte asercje → prośba o poprawkę (2 próby) → scalenie (squash).
3. Po fali budowy: fala testów (zadania generowane ze zmienionych plików źródłowych, `LOOP_TEST_WAVE=off` wyłącza), potem CI na `main`; czerwone → naprawa integracyjna (2 próby).
4. Dziennik: `docs/PROJECT_STATE.md` (jeden commit `[skip ci]` na falę). Następna fala.
- **Nigdy sama:** PR zmieniający `.github/workflows/` albo `scripts/jules-loop/` → `needs-human`.
- **Stop:** Actions → Jules Loop → „Disable workflow” (cron wyłącza się sam, gdy nie ma fal). Pojedyncze zadanie: `skip <ID>`; falę: `skip-wave`.

## 4. Ustawienia (robisz raz)
1. Secret `JULES_API_KEY` (jules.google.com/settings; klucz nigdy w repo) i `LOOP_TOKEN` (PAT: contents, pull requests, issues, actions, variables). **Bez `JULES_API_KEY` pętla się pomija** (notatka w logu, zero czerwonych przebiegów); samo ustawienie sekretu ją uruchamia.
2. Aplikacja Jules na repo; w Julesie Reactive Mode włączony (reaguje tylko na `@jules`).
3. Ruleset na `main`: wymagane `testy` i `bezpieczenstwo`; PAT/właściciel z obejściem, żeby pętla mogła zapisać dziennik (bez tego wpisy czekają w issue pętli i dostajesz ping).
4. Opcjonalne zmienne: README pętli. Domyślne limity (12 naraz, 80/dobę) zostawiają zapas względem limitów Pro (15/100).
5. Zostaw etykietę `automat-stop` na #221 (stary automat ma stać); nie używaj `start-tasks.mjs` ani `automat.mjs` równolegle z pętlą (podwójne sesje Julesa).

## 5. Czego pętla nie robi
- **Zrzuty (`*-snapshots/`):** powstają tylko w workflow „Update snapshots”. Zadania ze zrzutami (W2.25, W2.36, W2.38) skończą jako `needs-human`, gdy czerwone są same zrzuty: uruchom „Update snapshots” na gałęzi PR i zdejmij etykietę.
- **Punkty kontrolne K6/K7:** oglądasz podgląd po fali; poprawki idą jako nowe pliki zadań.
- **Zadania spoza kolejki z decyzją człowieka** (W1.9 teksty objaśnień) – dopiero po akceptacji.
- **Zmiany workflow i skryptów pętli** – ręcznie, osobnym PR.

## 6. Starszy automat (zatrzymany)
`scripts/ops/automat.mjs`, `check-pr.mjs`, `start-tasks.mjs` i ich testy zostają w repo (historia, `plan.mjs` i kolejka są używane przez generator). Reguły `check-pr` (np. pakiety tylko z listy zadania, `@S<n>` w e2e) obowiązują dalej jako zasady z `AGENTS.md`; pętla sprawdza z nich zakres plików i asercje, resztę łapie CI i Twój przegląd.

## 7. Czego nie wiemy [?]
Czy CodeRabbit lub podgląd Vercel czerwone na PR blokują scalenie przez pętlę (liczy wszystkie checki PR) · czy Jules API v1alpha zmieni pola odpowiedzi · czy `sendMessage` do sesji po utworzeniu PR trafia do Julesa (wtedy pętla pisze komentarz `@jules`) · limit 100 sesji liczy też CI Fixera i odpowiedzi.
