# CC2.5 – Nagłówek z logo (i znakiem do testów) oraz ekran startowy wg makiety

## Podsumowanie prac
- Utworzono moduł `src/core/units/counts.ts` eksportujący stałą `UNIT_COUNTS = { woj: 16, pow: 380, gmi: 2479 }` oraz test jednostkowy `tests/unit/counts.test.ts` weryfikujący zgodność z `public/data/units.json`.
- Utworzono skrypt `scripts/geo/kalka.mjs` generujący SVG z topologii `public/geo/admin.topo.json` do `public/geo/kalka.svg` (rozmiar 446.7 KB <= 500 KB) oraz dodano skrypt `"kalka": "node scripts/geo/kalka.mjs"` w `package.json`.
- Utworzono strony statyczne `src/view/pages/About.tsx` (`/o-projekcie`) oraz `src/view/pages/Sources.tsx` (`/zrodla`) i zarejestrowano trasy w `src/App.tsx`.
- Zaktualizowano `src/view/Header.tsx` do wysokości 72px z dolną ramką 1px linia, przełącznikiem logo via `?logo=znak` (wysokości 36px/28px dla logo oraz 48px/40px dla znaku), linkami nawigacji i przyciskiem menu dla urządzeń mobilnych otwierającym `Sheet`.
- Zbudowano ekran startowy `src/view/Home.tsx` wg makiety 01 z dynamicznym podtytułem pobierającym liczby z `UNIT_COUNTS`, pojedynczym zakreśleniem `Annotate` na "2479 gmin", polem `SearchField` z badge'em "Ctrl K" oraz tłem z tła z maską SVG `public/geo/kalka.svg` w kolorze `var(--tusz)`.
- Zaktualizowano zestaw testów e2e `tests/e2e/home.spec.ts` sprawdzających przełączanie logo, menu mobilne, brak poziomego przewijania przy 390px oraz audyty dostępności `axe` dla stron `/`, `/o-projekcie` i `/zrodla` w obu motywach.

## Status testów
- Vitest unit tests: 16 przetestowanych plików, 80 passed.
- Playwright e2e tests: 24 passed (1 skipped for visual regression CI).
