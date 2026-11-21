# QS01 – Okno „Dodaj wskaźnik” dodaje wskaźniki z biblioteki do „Moich”
Cel: w oknie Dodaj wskaźnik pobrany wskaźnik z biblioteki da się dodać do listy Moje wskaźniki (a nie tylko otworzyć link), więc pojawia się w Porównaj.
Zmieniaj: src/view/profile/AddIndicatorWindow.tsx, tests/unit/add-indicator-library.test.tsx
Wymagane: tests/unit/add-indicator-library.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/profile/AddIndicatorWindow.tsx, src/view/hooks/useMyIndicators.ts, src/core/indicators/registry.ts, tests/unit/compare-extra-wiring.test.tsx
Zadanie: W sekcji biblioteki okna zamień link na przycisk „Dodaj” (44 px) wywołujący useMyIndicators().add(id); już dodany pokazuje „Dodano” i przycisk usuń; link /biblioteka/<id> zostaje jako druga akcja. Tylko pobrane (spis pobranych).
Gotowe, gdy:
- test: klik „Dodaj” wywołuje add z id wskaźnika z biblioteki
- test: już dodany wskaźnik ma stan „Dodano” i nie dubluje się
- test: niepobrany wskaźnik nie jest na liście
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): na start tylko podstawowe dane (PRODUKT §4a); Claude decyduje sam. W PR napisz, że wzorce zrzutów odświeża właściciel workflowem „Update snapshots”.
