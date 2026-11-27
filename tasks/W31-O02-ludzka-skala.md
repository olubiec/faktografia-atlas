# O02 – Przeliczenie liczby na zdanie w ludzkiej skali („1 na 31 mieszkańców”)
Cel: czysta funkcja zamienia wartość wskaźnika, jednostkę i punkt odniesienia na zdanie redakcyjne bez wzmacniaczy, z liczbą urzędową pod spodem.
Zmieniaj: src/core/facts/human-scale.ts, tests/unit/w31-o02-human-scale.test.ts
Wymagane: tests/unit/w31-o02-human-scale.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (§4, §5), src/core/facts/sentences.ts, src/core/facts/rank.ts

Zadanie:
1. `humanScale({ value, unit, median, percentile, year, place })` zwraca `{ main, reference, source }`: zdanie główne ≤ 90 znaków, zdanie o typowej gminie, linia źródła „GUS BDL, 2025 · 32 na 1000 mieszkańców”.
2. Reguły dokładnie z §4 (pierwsza pasująca): „1 na N”, „N na 10”, ułamki słowne (dwie trzecie, co trzecia osoba) tylko przy różnicy ≤ 2 pkt, „N razy więcej/mniej niż w typowej gminie” przy stosunku ≥ 1,5, „niższy/wyższy wynik ma N% gmin”, kwoty zaokrąglone do 100 zł.
3. Zaokrąglaj tylko do bezpiecznej strony („prawie”, „ponad”). Polskie odmiany: „1 firma / 2–4 firmy / 5 firm” (jedna mała funkcja liczebnikowa).
4. Zakazy ton: brak słów ze słownika v2 (O03), brak wykrzykników, „×” zapisujemy „razy”, brak przyczyn i porównań spoza danych.

Gotowe, gdy:
- Test z przykładami z §2/§4: 32 na 1000 → „1 na 31 mieszkańców”; 36,1 vs 2,8 → „13 razy więcej”; 65,1% → „dwie trzecie”; 3. percentyl → „Niższy wynik ma 3% gmin w Polsce.”.
- Test: żadne zdanie nie przekracza 90 znaków i nie zawiera „×”, „!”, „tylko”, „aż”, „zaledwie”.
- Test: odmiana liczebników (1, 2, 5, 12, 22, 25).
- Test: brak mediany lub wartość 0 → zdanie bez porównania, bez wyjątku.
Nie ruszaj: `sentences.ts` (nowy moduł obok), plików widoku.
Tytuł PR zaczyna się od `[W31-O02]`; opis ma „Po ludzku”.
