# M02 – Nowe podstrony Rankingi i Porownaj oraz rozbudowana nawigacja
Cel: Dodanie dedykowanych podstron /rankingi i /porownaj oraz rozbudowa menu glownego Header.tsx.
Zmieniaj: src/App.tsx, src/view/Header.tsx, src/view/pages/Rankings.tsx, src/view/pages/ComparePage.tsx, tests/e2e/rankings-and-compare-pages.spec.ts, tests/e2e/header-library.spec.ts
Wymagane: src/view/pages/Rankings.tsx, src/view/pages/ComparePage.tsx, tests/e2e/rankings-and-compare-pages.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md, docs/STYL.md, src/App.tsx, src/view/Header.tsx

Zadanie:
1. W `App.tsx`: dodaj trasy `/rankingi` -> `Rankings` oraz `/porownaj` -> `ComparePage`.
2. W `Header.tsx`: dodaj linki nawigacji: Mapa (`/`), Rankingi (`/rankingi`), Porownaj (`/porownaj`), Biblioteka (`/biblioteka`), O projekcie (`/o-projekcie`), Sklad sa dane (`/zrodla`). Kazdy link ma `min-h-[44px]` i podkreslenie `aria-current="page"`. Wysokosc naglowka na telefonie = 56px, na komputerze = 72px.
3. Utworz `src/view/pages/Rankings.tsx` (w `SiteLayout`): podstrona pelnych rankingow z filtrem dzialu, wskaznika, poziomu i roku; podsumowanie mediany i rozkladu 5 klas; ranking z filtrem szukania jednostki + mini-mapa SVG z `mapShapes`.
4. Utworz `src/view/pages/ComparePage.tsx` (w `SiteLayout`): pelnoszerokosciowa porownywarka dwoch miejsc z selektorami A i B (`?c=A,B`), 6 gotowymi pojedynkami do klikniecia, dwiema mapkami SVG `CompareMaps` i tabela porownania.

Gotowe, gdy:
- Test e2e `tests/e2e/rankings-and-compare-pages.spec.ts` (1440x900 i 360x740) potwierdza nawigacje miedzy `/`, `/rankingi`, `/porownaj` i `/biblioteka`.
- Na `/rankingi` widac podsumowanie mediany, najwyzej/najnizej i liste jednostek.
- Na `/porownaj` klikniecie gotowego pojedynku laduje mapki i tabele porownania.
- Test `tests/e2e/header-library.spec.ts` (wysokosc 56px na mobile) przechodzi bez zmian.

Nie ruszaj: src/view/map/AtlasMap.tsx, src/view/Home.tsx
