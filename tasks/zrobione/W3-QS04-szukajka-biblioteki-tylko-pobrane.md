# QS04 – Podpowiedzi szukajki biblioteki tylko z pobranych
Cel: podpowiedzi w LibrarySearchBar nie pokazują niepobranych wskaźników (zgodnie z listą Biblioteki).
Zmieniaj: src/view/library/LibrarySearchBar.tsx, tests/unit/library-search-fetched.test.tsx
Wymagane: tests/unit/library-search-fetched.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/library/LibrarySearchBar.tsx, src/view/pages/Library.tsx, tests/unit/library-page-fetched.test.tsx
Zadanie: Przefiltruj podpowiedzi tym samym spisem pobranych co lista (bez nowego pobierania).
Gotowe, gdy:
- test: wskaźnik niepobrany nie jest w podpowiedziach
- test: pobrany jest
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): na start tylko podstawowe dane (PRODUKT §4a); Claude decyduje sam. W PR napisz, że wzorce zrzutów odświeża właściciel workflowem „Update snapshots”.
