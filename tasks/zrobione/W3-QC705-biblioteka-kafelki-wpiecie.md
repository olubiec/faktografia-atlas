# QC705 – Biblioteka: kafelki działów tylko z pobranymi (wpięcie)
Cel: `Library.tsx` przekazuje `onlyWithData` do `CategoryTiles`, więc na stronie Biblioteka kafelki mają tylko działy z pobranymi wskaźnikami i ich liczbę.
Zmieniaj: src/view/pages/Library.tsx, tests/unit/library-page-tiles.test.tsx
Wymagane: tests/unit/library-page-tiles.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/pages/Library.tsx, src/view/library/CategoryTiles.tsx, tests/unit/library-page-fetched.test.tsx
Decyzja 19.11.2026 (właściciel): istniejących testów (też e2e) nie zmieniasz; jeśli któryś pada, opisz w PR i zatrzymaj się.
