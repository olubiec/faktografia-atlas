# QU14 – Rankingi: nowy czytelny układ
Cel: jedna logiczna ścieżka: wskaźnik → rok → poziom → wynik (10 najwyżej / 10 najniżej, pozycja wybranego miejsca).
Zmieniaj: src/view/pages/Rankings.tsx, src/view/ranking/RankingsFilters.tsx, tests/unit/rankings-layout.test.tsx
Wymagane: tests/unit/rankings-layout.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/research/q2-rankingi-diagnoza.md (z QU04), PRODUKT §4e
Zadanie: Wdróż szkic układu z raportu QU04 po zatwierdzeniu go przez właściciela; Rankings.tsx ma zejść poniżej 200 linii (wydziel MyIndicatorsBar do osobnego pliku, tylko przenosiny).
Gotowe, gdy:
- test: kolejność kontrolek w DOM zgodna ze szkicem
- test: puste dane i błąd ładowania mają osobny komunikat
- test: wybór wskaźnika/poziomu zmienia adres i wynik
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Zależy od: QU04 i zatwierdzenia szkicu.
Tytuł PR zaczyna się od `[W5-QU14]`; opis ma „Po ludzku”.
