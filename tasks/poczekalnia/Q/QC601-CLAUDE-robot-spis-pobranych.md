# QC601 – Robot zapisuje mały spis pobranych wskaźników `library/available.json`
Wykonawca: **Claude (nie pętla)** – zadanie dotyka `scripts/data` i `.github/workflows/`, ma zgodę właściciela z 17.11.2026.
Cel: Po każdym przebiegu robota biblioteki powstaje `library/available.json` (< 50 KB dla ~100 wskaźników), czytany przez stronę zamiast 7,9 MB indeksu.
Zmieniaj: scripts/data/library-available.mjs, scripts/data/library.mjs, tests/unit/library-available-script.test.ts, .github/workflows/fetch-library.yml
Wymagane: tests/unit/library-available-script.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: scripts/data/library.mjs, library-lib.mjs, library-index.mjs, .github/workflows/fetch-library.yml, docs/research/biblioteka-gus.md, tests/fixtures/library/available.json (format docelowy), tests/unit/library-index.test.ts, docs/ARCHITEKTURA.md (gałąź `data/library`)

## Kontekst
Strona główna musi wiedzieć, które wskaźniki biblioteki są pobrane (żeby pokazać je na mapie i w „+ Dodaj wskaźnik”), ale nie może ładować pełnego `index.json` (PRODUKT §7). Robot, który i tak buduje indeks i pliki wartości, zapisze obok mały spis.

## Format
Dokładnie jak fixture: `{"version":1,"generatedAt":"<ISO>","variables":[{"id","n","u","s","c","lv","y"}]}`:
- tylko zmienne **z plikiem wartości** (pobrane);
- `u` = nazwa jednostki miary (tekst, nie numer słownika);
- `c` = ścieżka działu „Dział > Poddział” z nazw (nie id);
- `lv` = poziomy, dla których plik wartości ma dane (`l3`→`woj`, `l5`→`pow`, `l6`→`gmi`);
- `y` = suma lat z poziomów, posortowana rosnąco, bez duplikatów;
- JSON bez wcięć (PRODUKT §7).

## Research
1. Przeczytaj, jak robot zapisuje plik wartości (`v`, `l5/l6/l3: {y, d}`) i skąd bierze `has`. Napisz funkcję `buildAvailable(indexFile, valuesFiles)` czystą (bez I/O), a I/O (czytanie katalogu, zapis) w cienkiej nakładce.
2. Zmiany w workflow: tylko dopisanie kroku wywołującego skrypt i dodanie `library/available.json` do `git add` tego samego commita na gałąź `data/library`. **Nie** zmieniaj harmonogramu, uprawnień ani sekretów.

## Zadanie
- `scripts/data/library-available.mjs` – eksportuje `buildAvailable`; uruchamiany z CLI: `node scripts/data/library-available.mjs <katalog-library>`.
- Wywołanie z `library.mjs` po zapisie wartości lub osobnym krokiem workflow (wybierz prostsze; opisz w PR).
- Test na nagranym katalogu: `tests/fixtures/library/` (index + values-sample + variable-60614) – wynik zgodny ze schematem.

## Testy (`tests/unit/library-available-script.test.ts`)
1. Dla fixture’a wynik zawiera wyłącznie zmienne z plikiem wartości; liczba = liczba plików.
2. Poziomy `lv` i lata `y` zgodne z zawartością pliku (101: `pow`, 2022–2024).
3. `u` to tekst jednostki, `c` to ścieżka z nazw.
4. Rozmiar: wygeneruj 101 syntetycznych wpisów → `JSON.stringify(...).length < 50_000`.
5. Wynik bez wcięć (`!/\n\s/.test(text)`).
6. Zmienna bez danych (puste `d`) pominięta.
7. Brak katalogu/pliku → czytelny błąd, kod wyjścia ≠ 0 (nie zapisuje pustego spisu).
8. Walidacja schematem: `version === 1`, każdy wpis ma `id`, `n`, `lv.length ≥ 1`.

## Gotowe, gdy
- Test skryptu na nagranym katalogu zielony; plik < 50 KB dla 101 wskaźników; workflow zmieniony minimalnie (diff pokazuje tylko nowy krok/dodanie pliku do commita).
Nie ruszaj: harmonogramu, sekretów, uprawnień workflow; `docs/STAN.md`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
