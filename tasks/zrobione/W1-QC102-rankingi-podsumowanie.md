# QC102 – Podsumowanie rankingu zdaniami (najwyżej, najniżej, mediana)
Cel: Funkcja zamieniająca policzony ranking na trzy czytelne zdania z nazwami i jednostkami (zamiast „50” wpisanego na sztywno).
Zmieniaj: src/core/ranking/rankings-summary.ts, tests/unit/rankings-summary.test.ts
Wymagane: tests/unit/rankings-summary.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/ranking/ranking.ts (`rankUnits`, `RankedUnit`, `topBottom`), src/core/format/ (formatowanie liczb – znajdź istniejącą funkcję, np. `formatNumber`), src/core/units/label.ts (`unitLabel`), docs/PRODUKT.md §4e

## Kontekst
`Rankings.tsx` ma dziś `median: 50 // Mocked for test` i pokazuje kody TERYT. Właściciel: „Rankingi nie działają”. To zadanie dostarcza poprawny tekst; ekran dopiero w QC106.

## Research
Znajdź w `src/core/format/` istniejące formatowanie liczb po polsku (separator tysięcy, przecinek dziesiętny, liczba miejsc po przecinku zależna od wskaźnika). **Użyj go** – nie pisz drugiego. Jeśli nie ma funkcji z jednostką, złóż ją z istniejącej + `indicator.unit`.

## Zadanie
Utwórz `src/core/ranking/rankings-summary.ts`:
- `export type RankingSummary = { highest: string | null; lowest: string | null; median: string | null; count: number }`.
- `export function summarizeRanking(items: RankedUnit[], unitsByTeryt: Map<string, Unit>, unit: string, format?: (n: number) => string): RankingSummary`.
  - `highest` = `„Najwyżej: <nazwa z rodzajem>, <wartość> <jednostka>”` (np. „Najwyżej: Warszawa (miasto), 3 465 os./km²”). Rodzaj gminy z `unitLabel`.
  - `lowest` analogicznie „Najniżej: …”.
  - `median` = „Mediana: <wartość> <jednostka>” – **policzona** z `items.map(i => i.value)`: dla parzystej liczby średnia dwóch środkowych.
  - Puste `items` → wszystkie `null`, `count: 0`.
  - Remisy: bierz pierwszego wg istniejącej kolejności rankingu (nie sortuj ponownie).
  - Brak jednostki w `unitsByTeryt` → użyj `teryt` jako ostateczności, ale **nigdy** nie pokazuj samego kodu, jeśli nazwa jest dostępna.

## Testy
Użyj danych z `tests/fixtures` (znajdź plik z wartościami wskaźnika dla kilku jednostek, np. przez istniejące testy `tests/unit/ranking.test.ts`, i skopiuj podejście ładowania).
1. Zdanie „Najwyżej” zawiera nazwę jednostki o największej wartości i jednostkę miary; nie zawiera 12-cyfrowego kodu.
2. Mediana nieparzystej liczby (5 wartości) = trzecia po posortowaniu; parzystej (4) = średnia środkowych (policz ręcznie w teście).
3. Jedna jednostka → najwyżej = najniżej = mediana, bez wyjątku.
4. Pusta lista → `null`-e, `count 0`.
5. Liczby po polsku: `1234.5` → „1 234,5” (spacja niełamliwa dopuszczalna – sprawdź przez `replace(/\s/g,' ')`).
6. Własny `format` podany jako argument jest użyty.

## Gotowe, gdy
- Testy 1–6 zielone; nazwa zamiast kodu; mediana policzona z danych, nie wpisana.
Nie ruszaj: `ranking.ts` (tylko import), `Rankings.tsx`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
