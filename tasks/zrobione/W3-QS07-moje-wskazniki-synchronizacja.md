# QS07 – useMyIndicators: wspólny stan między oknem a widokiem
Cel: zmiana listy „Moje wskaźniki” w jednym miejscu (np. okno Dodaj wskaźnik) odświeża listę w pozostałych hookach bez przeładowania strony.
Zmieniaj: src/view/hooks/useMyIndicators.ts, tests/unit/use-my-indicators-sync.test.tsx
Wymagane: tests/unit/use-my-indicators-sync.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/hooks/useMyIndicators.ts, src/core/my-indicators/storage.ts, tests/unit/add-indicator-library.test.tsx
Zadanie: Hook ma subskrybować wspólne źródło: zdarzenie 'storage' (inne karty) oraz małe zdarzenie okna wysyłane po zapisie (ta sama karta); list ma się aktualizować w każdej instancji. Interfejs { list, add, remove, reset } bez zmian. Dodaj czyszczenie nasłuchu przy odmontowaniu.
Gotowe, gdy:
- test: add w jednej instancji zmienia list w drugiej
- test: zdarzenie storage odświeża listę
- test: po odmontowaniu nasłuch jest zdjęty
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): Claude decyduje sam. Pełne CI musi być zielone; jeśli lokalny test czasowy (próg ms) pada przy równoległych przebiegach, uruchom go osobno i opisz w PR uczciwie, co padło.
