# N-40 – Logika „Największe zmiany” między dwoma latami (koncept 1, KONCEPTY-ROZWOJU.md)
Cel: Czysta funkcja w `src/core`, która z jednego pliku wartości wskaźnika (`values/<id>.json` – już w pamięci strony) wylicza 5 jednostek z największym wzrostem i 5 z największym spadkiem między dwoma latami, oraz szablon jednego zdania „Co się zmieniło” dla wybranej jednostki. Bez UI, bez nowych żądań danych, bez AI.
Zmieniaj: src/core/story/changes.ts, src/core/story/change-sentence.ts, tests/unit/story-changes.test.ts, tests/unit/story-change-sentence.test.ts
Wymagane: src/core/story/changes.ts, src/core/story/change-sentence.ts, tests/unit/story-changes.test.ts, tests/unit/story-change-sentence.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/ranking/ranking.ts (`rankUnits`, `topBottom` – wzorzec typów i filtrowania poziomu), src/core/format/ (formatowanie liczb po polsku), src/core/units/types.ts, public/data/values/density.json (kształt: `indicatorId`, `years`, `values` per TERYT – tylko czytasz, nie importujesz do kodu strony), tests/fixtures/ (wybierz nagrany plik wartości; jeśli brak – mały fixture wycięty z prawdziwego `values/density.json` w `tests/fixtures/story/`, dopisz go do „Zmieniaj” w PR z uzasadnieniem)

Zadanie:
1. `changes.ts`: `computeChanges({ values, units, level, parent?, fromYear, toYear, mode: 'percent' | 'absolute', limit = 5 })` → `{ rising: Change[]; falling: Change[] }`, gdzie `Change = { teryt: string; from: number; to: number; delta: number; deltaPercent: number | null }`. Jednostki filtrowane po poziomie (i opcjonalnie rodzicu – obszar województwa). Pomijane: brak wartości w którymś roku (`null`/brak), `from === 0` przy `mode: 'percent'`. Sortowanie: po zmianie malejąco (rising) / rosnąco (falling); remis → po TERYT rosnąco (deterministycznie). Jednostka z zerową zmianą nie trafia do żadnej listy. Lata spoza `years` → puste listy (bez wyjątku).
2. `change-sentence.ts`: `changeSentence(change, { unitName, indicatorUnit, fromYear, toYear, share })` → string po polsku z szablonu, np. „Od 2015 do 2025 r. wartość wzrosła o 6,2% – szybciej niż w 80% jednostek.” (`share` = odsetek jednostek z mniejszą zmianą, liczony w `changes.ts` funkcją `shareBelow`). Liczby przez istniejący formater (przecinek dziesiętny). Zmiana ujemna → „spadła”. Zero → „nie zmieniła się”.
3. Kody TERYT jako string. Komentarze po polsku. Każdy plik ≤ 200 linii.

Gotowe, gdy:
- Test: dla fixture i lat skrajnych `rising` i `falling` mają po 5 pozycji, posortowane jak w pkt 1; jednostka z brakiem wartości w jednym roku nie występuje w żadnej liście.
- Test: `mode: 'percent'` pomija jednostkę z `from === 0`, `mode: 'absolute'` ją uwzględnia.
- Test: filtr `parent: '12'` zwraca wyłącznie TERYT zaczynające się od „12” i właściwego poziomu; nieznany rok → `{ rising: [], falling: [] }`.
- Test: `changeSentence` zawiera oba lata, przecinek dziesiętny, słowo „wzrosła” / „spadła” / „nie zmieniła się” zgodnie ze znakiem zmiany.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.

Nie rób: zmian w plikach ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx, hooks mapy), w `src/view/*`, w `public/data` ani `scripts/data`; bez importu `public/data/*.json` do `src`; bez nowych pakietów; bez tekstów generowanych przez AI.
