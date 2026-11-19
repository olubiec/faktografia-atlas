# QC303 – Obrys: przekazanie szerokości mapy
Cel: Wygaszanie obrysu wybranej jednostki (QC302) działa w aplikacji: `mapWidthPx` dociera do warstwy.
Zmieniaj: src/view/map/layers/admin.ts, src/view/map/layers/registry.ts, src/view/map/AtlasMap.tsx, tests/unit/outline-width-wiring.test.ts
Wymagane: tests/unit/outline-width-wiring.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/map/layers/choropleth.ts (parametr `mapWidthPx`), tests/unit/outline-layer.test.ts. Pliki ekranu tu wprost dozwolone; zmiana minimalna, bez refaktorów.
