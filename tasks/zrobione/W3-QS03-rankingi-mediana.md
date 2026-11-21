# QS03 – Rankingi: mediana z prawdziwych danych
Cel: w Rankings.tsx znika zaślepka median: 50 // Mocked for test; mediana liczy się z wartości wskaźnika albo jest ukryta.
Zmieniaj: src/view/pages/Rankings.tsx, tests/unit/rankings-median.test.tsx
Wymagane: tests/unit/rankings-median.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/pages/Rankings.tsx, src/core/ranking/*
Zadanie: Zamień zaślepkę na wywołanie istniejącej funkcji mediany z src/core (jeśli jej nie ma – ukryj medianę; nowej logiki nie dopisujesz poza małą czystą funkcją w pliku testowanym).
Gotowe, gdy:
- test: mediana równa medianie fixture’u
- test: brak wartości = brak napisu o medianie
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): na start tylko podstawowe dane (PRODUKT §4a); Claude decyduje sam. W PR napisz, że wzorce zrzutów odświeża właściciel workflowem „Update snapshots”.
