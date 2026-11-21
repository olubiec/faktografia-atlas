# PD02 – [CZEKA NA ZGODĘ D5] Workflowy danych: zapis statusu przy każdym przebiegu i zgłoszenie błędu także dla biblioteki
Cel: Po każdym przebiegu robota (nawet gdy nie ma zmian danych) powstaje świeży `status.json`, a awaria robota biblioteki zgłasza się tak samo jak awaria nocnego pobierania.
STATUS: **Nie puszczać bez zgody właściciela (decyzja D5 w docs/PLAN-POPRAWEK.md).** Zadanie zmienia `.github/workflows/` (AGENTS.md: tylko na prośbę w zadaniu – to jest ta prośba, po zgodzie).
Zmieniaj: .github/workflows/fetch-data.yml, .github/workflows/fetch-library.yml, tests/unit/workflows-status-guard.test.ts
Wymagane: tests/unit/workflows-status-guard.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: raport audytu FIX5 (które przebiegi i dlaczego nie zostawiają śladu), scripts/data/status.mjs (PD01: wywołanie `--values … --library … --out …`), .github/workflows/fetch-data.yml (całość), .github/workflows/fetch-library.yml (całość), tests/unit/workflows-guard.test.ts (PF09 – istniejący, nie zmieniaj), docs/ARCHITEKTURA.md §5.2, docs/research/R6-magazyn-wynik.md (raw.githubusercontent jako magazyn)

## Kontekst
Nocny „Fetch data” commituje tylko realne zmiany liczb i otwiera PR (dziś #451 czeka od 15.11). Gdy zmian nie ma albo PR czeka, nic nie mówi stronie ani właścicielowi, że robot działa. „Fetch library” zapisuje na gałąź `data/library` (czytaną przez stronę z `raw.githubusercontent.com`) i **nie ma** zgłoszenia błędu. Rozwiązanie: oba roboty po przebiegu zapisują `library/status.json` na gałęzi `data/library` (osobna historia, bez PR, bez wpływu na `main`) – strona czyta go z tego samego adresu co resztę biblioteki (PU01).

## Research (15 min)
1. Z FIX5 przejmij: czy zapis na `data/library` z workflowu „Fetch data” jest wykonalny z istniejącymi uprawnieniami (`contents: write`) i czy kolejka `concurrency.group: fetch-data` chroni przed równoczesnym pushem. Jeśli nie – zatrzymaj się i opisz w PR.
2. Zaplanuj odporność na wyścig: dwa roboty piszą na tę samą gałąź → `git pull --rebase` przed pushem albo osobne pliki (`status.json` pisze tylko jeden z nich, drugi dopisuje własne pole przez osobny plik `status-values.json`); wybierz prostsze i uzasadnij w PR.
3. Sprawdź wersje akcji w obu plikach (bez zmian wersji).

## Zadanie
1. `fetch-data.yml`: krok końcowy `if: always()` – checkout gałęzi `data/library` do osobnego katalogu roboczego (jak w `fetch-library.yml`), `node scripts/data/status.mjs --values public/data/values --library <katalog>/library --out <katalog>/library/status.json`, commit i push **tylko jeśli plik się zmienił** (zmienia się zawsze `checkedAt` – to zamierzone), komunikat „data: status robota”.
2. `fetch-library.yml`: po kroku `available.json` dodaj ten sam wpis statusu (`--library lib-wt/library`), przed krokiem „Zapisz na gałęzi data/library”.
3. `fetch-library.yml`: krok „Zgłoszenie błędu” analogiczny do `fetch-data.yml` (`if: failure() && github.event_name != 'workflow_dispatch'`, jedno otwarte zgłoszenie o tytule „Pobieranie biblioteki (Fetch library) nie powiodło się”, bez duplikatów).
4. Nowy test `tests/unit/workflows-status-guard.test.ts` (obok PF09) pilnuje: oba workflowy wołają `status.mjs`; `fetch-library.yml` ma zgłoszenie błędu; zapis statusu nie dotyka `main`.

## Testy
1. Test strażnika (jak wyżej) zielony; `workflows-guard.test.ts` (PF09) nadal zielony bez zmian.
2. `node scripts/data/status.mjs` uruchomiony lokalnie na kopii `public/data/values` + katalogu testowego daje poprawny plik < 8 KB.
3. Przebieg ręczny „Fetch library” na gałęzi PR (budżet 50 zapytań): w logu krok statusu wykonany, na gałęzi `data/library` pojawia się `library/status.json` (opisz w PR link do przebiegu).
4. Przebieg „Fetch data” (ręczny, `only=population`): status zapisany także gdy `Brak zmian w danych`.

## Gotowe, gdy
- Testy zielone; w opisie PR: link do dwóch przebiegów, zrzut zawartości `status.json`, jedno zdanie dla właściciela „po tej zmianie na stronie zobaczysz, że automat sprawdzał dane wczoraj/dziś”.
- `git diff --name-only` ⊂ „Zmieniaj”; brak sekretów w plikach.
Nie ruszaj: `ci.yml`, `update-snapshots.yml`, `scripts/data/*` (poza wywołaniem), `package.json`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
