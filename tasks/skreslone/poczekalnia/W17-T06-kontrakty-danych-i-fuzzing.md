# T06 – Kontrakty danych Zod i fuzzing warunkow brzegowych
Cel: Testy kontraktowe laczace roboty GUS z parserami Zod oraz weryfikacja warunkow brzegowych w src/core.
Zmieniaj: tests/unit/core-contracts-and-fuzz.test.ts
Wymagane: tests/unit/core-contracts-and-fuzz.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/ARCHITEKTURA.md, src/core/url/state.ts, src/core/share/csv.ts, src/core/explain/context.ts

Zadanie:
1. Utworz `tests/unit/core-contracts-and-fuzz.test.ts`:
   - Walidacja wyjscia skryptow danych (`build-parts.mjs`, `library-index.mjs`) schematami Zod z `src/core/`.
   - Testy brzegowe i fuzzing parsera URL (`readUrlState`): zlosliwe parametry, `?u=../../../`, `?c=12,12`, nieznane kody TERYT, ekstremalnie dlugie stringi.
   - Testy brzegowe generatora CSV (`toCsv`): sredniki, cudzyslowy, znaki nowej linii, BOM UTF-8.
   - Testy brzegowe `context()` i `compare()`: wartosci identyczne, same braki danych `null`, zera w mianowniku.

Gotowe, gdy:
- Test `tests/unit/core-contracts-and-fuzz.test.ts` przechodzi na zielono dla wszystkich testowanych przypadkow.

Nie ruszaj: src/
