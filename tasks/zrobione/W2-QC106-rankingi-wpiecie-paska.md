# QC106 – Rankingi: wpięcie paska wyboru
Cel: Pasek wyboru (RankingsFilters, QC104) działa na stronie Rankingi; na start pokazuje tylko podstawowy zestaw wskaźników, resztę da się dodać i usunąć.
Zmieniaj: src/view/pages/Rankings.tsx, tests/unit/rankings-page-filters.test.tsx
Wymagane: tests/unit/rankings-page-filters.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §4f, src/view/ranking/RankingsFilters.tsx, src/view/pages/Rankings.tsx. Istniejących testów nie zmieniasz; jeśli któryś przeszkadza – opisz i zatrzymaj się.
