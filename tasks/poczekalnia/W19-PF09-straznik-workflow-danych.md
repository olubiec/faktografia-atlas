# PF09 – Strażnik workflowów danych: harmonogram, wspólna kolejka, brak zapisu na main
Cel: Test jednostkowy czyta pliki workflowów (tylko odczyt) i pada, gdy ktoś usunie harmonogram, wspólną grupę kolejki, ochronę przed zapisem na `main` albo zgłoszenie błędu nocnego pobierania.
Zmieniaj: tests/unit/workflows-guard.test.ts
Wymagane: tests/unit/workflows-guard.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: .github/workflows/fetch-data.yml, .github/workflows/fetch-library.yml, .github/workflows/ci.yml (tylko czytasz; **workflowów nie zmieniasz**), tests/unit/security.test.ts (jak testy czytają pliki repo), docs/ARCHITEKTURA.md §5.2

## Kontekst
Nocny automat jest „niemy”: właściciel zgłasza, że nowe dane nie wpadają, i nie ma jak szybko sprawdzić, czy robot jest w ogóle poprawnie ustawiony. Audyt przebiegów robi zadanie FIX5; to zadanie zamienia wnioski o **konfiguracji** w trwały test. Brakujące zabezpieczenia (np. zgłoszenie błędu dla `fetch-library.yml`) nie są tu dodawane – to PD02 (fala 3, za zgodą D5). Test opisuje tylko to, co jest prawdą na `main`.

## Research (10 min, bez nowych pakietów)
Nie dodawaj parsera YAML. Sprawdź w `package.json`, czy parser YAML jest już zależnością (tylko czytasz); jeśli nie – asercje na tekście pliku (regexp), z komentarzem po polsku, dlaczego.

## Zadanie
Nowy test odczytuje trzy pliki workflowów jako tekst i sprawdza niezmienniki, które dziś zachodzą:
- `fetch-data.yml`: ma `schedule:` z `cron`; `concurrency.group: fetch-data`; krok odmawiający zapisu na `main`; zmienna `BDL_CLIENT_ID` tylko z `secrets.`; zgłoszenie błędu nocnego (`failure() && github.event_name != 'workflow_dispatch'`); PR otwierany z gałęzi `data/nightly`, nigdy push na `main`.
- `fetch-library.yml`: `schedule:` z `cron`; ta sama `concurrency.group: fetch-data`; zapis tylko na gałąź `data/library` (brak `git push` do `main`); krok `library-available.mjs`.
- Oba: brak literalnego klucza lub tokenu (wzorce `ghp_`, `BDL_CLIENT_ID: [A-Za-z0-9]{8,}`).
- Opis `cron` dla nocnego robota zawiera godzinę 1 UTC (zamierzenie z komentarza w pliku; GitHub opóźnia uruchomienia nawet o kilka godzin – komentarz w teście).

## Testy (`tests/unit/workflows-guard.test.ts`)
1. `fetch-data.yml` ma harmonogram i grupę `fetch-data`.
2. `fetch-library.yml` ma harmonogram i **tę samą** grupę.
3. Żaden z dwóch workflowów nie wypycha na `main` (brak `HEAD:refs/heads/main`, brak `push origin main`).
4. Zgłoszenie błędu w `fetch-data.yml` istnieje.
5. Sekret tylko z `secrets.`; brak stałych tokenów.
6. Test wypisuje czytelny komunikat po polsku przy porażce (nazwa pliku + brakujący niezmiennik).

## Gotowe, gdy
- 6 testów zielonych na obecnym `main`; `git diff --name-only` zawiera tylko jeden plik.
Nie ruszaj: `.github/workflows/*`, `scripts/data/*`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
