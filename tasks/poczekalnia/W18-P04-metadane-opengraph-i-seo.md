# P04 – Metadane OpenGraph i SEO
Cel: Dynamiczne generowanie metadanych stron, tytulow i tagow OpenGraph dla podstron i wskaźnikow.
Zmieniaj: src/core/meta/seo.ts, src/view/pages/LibraryVariable.tsx, src/view/pages/Rankings.tsx, tests/unit/seo-meta.test.ts
Wymagane: src/core/meta/seo.ts, tests/unit/seo-meta.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md

Zadanie:
1. Utworz `src/core/meta/seo.ts`: czysta funkcja generujaca zestaw metatagow (`title`, `description`, `og:title`, `og:description`, `canonical`) na podstawie biezacej trasy i kontekstu jednostki/wskaznika.
2. Podepnij metadane pod podstrony `LibraryVariable.tsx` i `Rankings.tsx`.
3. Utworz test `tests/unit/seo-meta.test.ts` weryfikujacy poprawnosc generowanych tagow.

Gotowe, gdy:
- Test `tests/unit/seo-meta.test.ts` przechodzi na zielono.
