# QU10 – Okno „Pobierz i udostępnij”: poprawne przełączanie stron i reguła „każdy rodzaj raz”
Cel: kliknięcie kafelka w pasku pokazuje dokładnie tę kartę, a zestaw nie ma duplikatów rodzajów.
Zmieniaj: src/view/share/ShareDialog.tsx, src/view/share/ShareControls.tsx, tests/unit/share-dialog-switch.test.tsx, tests/e2e/share-deck-switch.spec.ts
Wymagane: tests/unit/share-dialog-switch.test.tsx, tests/e2e/share-deck-switch.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/research/q2-udostepnianie-przelaczanie.md (z QU01), src/view/share/ShareDialog.tsx, src/view/share/ShareControls.tsx, QU02 (deck.ts: hasKind)
Zadanie: Napraw przyczyny z raportu QU01: rodzaj aktywnej strony = rodzaj strony (także table, bignumber, trend, histogram), nie `availableKinds[0]`; przełącznik rodzaju w ShareControls zamienia rodzaj bieżącej strony tylko na rodzaj, którego nie ma jeszcze w zestawie (albo znika – decyzja w raporcie QU01); przekaż `used` do AddPageMenu (QU02). e2e @S19: dodaj po kolei wszystkie rodzaje, kliknij każdy kafelek i sprawdź napis/identyfikator karty w podglądzie; próba dodania drugiej mapy jest zablokowana.
Gotowe, gdy:
- test: po wybraniu kafelka każdego z 10 rodzajów podgląd ma ten rodzaj
- test: nie da się mieć dwóch stron tego samego rodzaju
- e2e: scenariusz na 390 px i 1280 px
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Zależy od: QU01, QU02.
Tytuł PR zaczyna się od `[W5-QU10]`; opis ma „Po ludzku”.
