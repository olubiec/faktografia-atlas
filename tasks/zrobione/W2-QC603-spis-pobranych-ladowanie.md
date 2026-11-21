# QC603 – Ładowanie spisu pobranych (`available.json`): jedno żądanie, pamięć podręczna, odporność na błędy
> **KOREKTA 18.11.2026:** prawdziwy `available.json` na gałęzi `data/library` ma dziś 1773 wskaźniki, ok. 538 KB po rozpakowaniu i ok. 27 KB po kompresji gzip; wszystkie mają poziomy tylko `pow`/`gmi` (żaden `woj`). Loader musi to znieść (decyzja D7: próg dotyczy rozmiaru po kompresji). Dodaj do testów wariant z plikiem ok. 2000 pozycji (generowany w teście).
Cel: Strona dowiaduje się, które wskaźniki biblioteki są pobrane, jednym małym żądaniem i bez ryzyka dla reszty aplikacji.
Zmieniaj: src/core/indicators/load-available.ts, tests/unit/load-available.test.ts
Wymagane: tests/unit/load-available.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/library/load-library.ts (`loadLibraryIndex` – **wzorzec** pamięci podręcznej i błędów), src/core/library/config.ts (`libraryBase()`), src/core/indicators/registry.ts (QC602: `AvailableFile`), tests/unit/load-library.test.ts (jak testować `fetchImpl`), tests/unit/fetch-values-timeout.test.ts

## Kontekst
`available.json` (QC601) leży obok `index.json` pod `libraryBase()`. Strona go potrzebuje na wejściu (PRODUKT §7: mały plik, nigdy pełny indeks). Gdy plik nie istnieje (robot jeszcze go nie wygenerował) lub sieć zawodzi – aplikacja działa na 20 głównych wskaźnikach.

## Research
Skopiuj **strukturę** `loadLibraryIndex` (nie kod): `fetchImpl` jako parametr, `promise` + `cache`, brak ponownego żądania po błędzie 404, `resetAvailableCache()` do testów. Dodaj **timeout** (jak w `fetch-values.test`) – 8 s, po którym zwracamy `null`.

## Zadanie
`src/core/indicators/load-available.ts`:
- `export function loadAvailable(fetchImpl = fetch): Promise<AvailableFile | null>` – GET `${libraryBase()}/available.json`; wynik **zawsze** ten sam obiekt/obietnica przy kolejnych wywołaniach (jedno żądanie).
- Walidacja: `version === 1` i `variables` jest tablicą; wpisy o złym kształcie odrzucane pojedynczo; zły plik → `null`.
- 404 / błąd sieci / zły JSON / timeout → `null` (bez wyjątku) i zapamiętane (nie męczymy sieci powtórnymi próbami w tej sesji strony).
- `export function resetAvailableCache(): void`.
- `export function peekAvailable(): AvailableFile | null | undefined` – synchroniczny odczyt cache (undefined = jeszcze nie ładowano); przyda się komponentom bez ponownego fetch.

## Testy
1. Dwa równoległe `loadAvailable` = **jedno** wywołanie `fetchImpl` (licznik) i ten sam wynik.
2. Poprawny plik (fixture `available.json`) → obiekt z 5 zmiennymi.
3. 404 → `null`, bez wyjątku; kolejne wywołanie nie robi nowego żądania.
4. Odrzucenie `fetch` (sieć) → `null`.
5. JSON w złym kształcie (`{"foo":1}`) → `null`; `version: 2` → `null`.
6. Wpis bez `id` odrzucony, pozostałe zachowane.
7. Timeout (zamockuj opóźnioną odpowiedź + fake timers) → `null` po 8 s.
8. `resetAvailableCache` pozwala na nowe żądanie; `peekAvailable` zwraca `undefined` przed i wynik po ładowaniu.

## Gotowe, gdy
- Dwa wywołania = jedno żądanie; 404 → pusta lista bez błędu; testy zielone.
Nie ruszaj: `load-library.ts`, `config.ts`, `registry.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
