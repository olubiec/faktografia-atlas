# PF02 – Strażnik: każdy pobrany wskaźnik jest osiągalny w interfejsie
Cel: Test, który pada, gdy wskaźnik z `config/indicators.json` lub z `available.json` ma plik danych, ale nie da się go znaleźć/wybrać (albo odwrotnie: plik bez wpisu).
Zmieniaj: src/core/indicators/reachability.ts, tests/unit/indicator-reachability.test.ts
Wymagane: src/core/indicators/reachability.ts, tests/unit/indicator-reachability.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/indicators/registry.ts (`buildRegistry`, `AvailableFile`), src/core/my-indicators/my-indicators.ts (`BASIC_INDICATORS`), src/core/search/normalize.ts, src/view/controls/IndicatorPicker.tsx (`filterIndicators`, `groupIndicators` – tylko czytasz), config/indicators.json, tests/fixtures/library/available.json, tests/unit/indicator-registry.test.ts

## Kontekst
Właściciel zgłasza: „nie wszystkie pobrane wskaźniki są widoczne na stronie”. Dziś: 20 wskaźników głównych ma pliki w `public/data/values/`, a biblioteka ma 1773 pobrane zmienne w `library/available.json` na gałęzi `data/library` – ale `registry.ts` nie jest jeszcze użyty w żadnym ekranie (mapa czyta tylko `INDICATORS` z `useMainView.ts`). Nikt nie pilnuje tej zgodności automatycznie. To zadanie daje **czystą funkcję audytu** i test na prawdziwych plikach repo; ekranowe wpięcie robią zadania Q (QC606, QC607) i strażnik interfejsu PC01 (fala 5).

## Research (10 min, bez nowych pakietów)
1. Zobacz, jak `IndicatorPicker.tsx` filtruje po nazwie (`normalize(ind.name).includes(normalize(query))`) – ta sama reguła ma być w audytowanej funkcji wyszukiwania (zadanie QC607 podmieni kopię w pickerze na eksport z tego modułu).
2. `fs.readdirSync('public/data/values')` w teście jednostkowym jest dozwolone (to pliki repo, nie sieć); fixture biblioteki: `tests/fixtures/library/available.json`.

## Zadanie
`src/core/indicators/reachability.ts` (czysty TS, zero React; odczyt plików robi test, nie moduł):
- `export function searchIndicators(list: Indicator[], query: string): Indicator[]` – pusta fraza → cała lista; inaczej `normalize(name).includes(normalize(query))`.
- `export type AuditInput = { main: Indicator[]; valuesFileIds: string[]; available: AvailableFile | null; basic?: readonly string[]; profileShards?: Record<string, string[]> }` (`profileShards`: województwo → id wskaźników z klucza `years` pliku `public/data/profiles/<woj>.json`).
- `export type AuditResult = { checked: number; problems: string[] }`.
- `export function auditIndicators(input: AuditInput): AuditResult`. Problemy (po polsku, każdy z id): duplikat id w `main`; wskaźnik główny bez pliku wartości; plik wartości bez wpisu w `main`; wskaźnik z `basic` nieobecny w `main`; wskaźnik z rejestru (`buildRegistry(main, available)`) brakujący w którymś pliku profilu (`profileShards`: „profil 02 nie ma wskaźnika X”); wskaźnik z rejestru niewyszukiwalny po własnej nazwie przez `searchIndicators` (sprawdzaj pełną nazwę); dwa wskaźniki z biblioteki o identycznym `normalize(name)` i tym samym `description` (nie do odróżnienia w wynikach).
Test na prawdziwych plikach (w tym 16 plików `public/data/profiles/*.json`, z których bierzesz klucze `years`): `main` z `config/indicators.json`, `valuesFileIds` z katalogu `public/data/values`, `available` z fixtures, `basic` = `BASIC_INDICATORS`. Oczekiwane `problems = []`.

## Testy (`tests/unit/indicator-reachability.test.ts`)
1. Prawdziwe pliki repo: `auditIndicators(...).problems` jest puste, `checked` ≥ 20.
2. Usuń syntetycznie jeden id z `valuesFileIds` → problem „bez pliku wartości” z tym id.
3. Dodaj do `valuesFileIds` obcy id → problem „plik bez wpisu w config”.
4. `basic` zawiera id spoza `main` → problem.
5. Zduplikowane id w `main` → problem.
6. Wskaźnik z biblioteki o nazwie z polskimi znakami (np. „Ludność”) jest znajdowany frazą „ludnosc” (`searchIndicators`).
7. Dwa wskaźniki biblioteki o tej samej nazwie i opisie → problem „nie do odróżnienia”; z różnym opisem (dział) → brak problemu.
8. Usuń syntetycznie wskaźnik z jednego `profileShards` → problem z numerem województwa i id.
9. `available: null` → audyt dotyczy tylko wskaźników głównych, bez wyjątku.

## Gotowe, gdy
- 9 testów zielonych, w tym test 1 na prawdziwych plikach (to jest „strażnik”: kolejny PR, który doda wskaźnik do configu bez pliku danych, zepsuje test).
- Moduł ≤ 120 linii, komentarze po polsku, bez `any`.
Nie ruszaj: `src/view/**`, `config/*`, `src/core/indicators/registry.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
