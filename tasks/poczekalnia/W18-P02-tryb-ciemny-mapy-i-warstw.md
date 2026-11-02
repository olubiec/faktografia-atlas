# P02 – Tryb ciemny mapy i warstw
Cel: Pelne dopasowanie stylu kartogramu i podkladu wektorowego MapLibre do motywu ciemnego.
Zmieniaj: src/view/map/AtlasMap.tsx, src/view/map/layers/choropleth.ts, src/view/map/layers/admin.ts, tests/e2e/dark-mode-map.spec.ts
Wymagane: tests/e2e/dark-mode-map.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/STYL.md (§2), docs/ARCHITEKTURA.md (W3.7)

Zadanie:
1. W `src/view/map/layers/choropleth.ts` oraz `admin.ts`:
   - Zastosuj tokeny kolorystyczne zaleznie od stanu motywu (motyw ciemny uzywa tokenow ciemnych z `config/tokens.json`).
   - Obrysy granic musza zachowywac kontrast i widocznosc na ciemnym tle.
2. Utworz `tests/e2e/dark-mode-map.spec.ts`: testujacy przelaczenie motywu na `dark`, prawidlowy render warstw i brak bledow w konsoli.

Gotowe, gdy:
- Test `tests/e2e/dark-mode-map.spec.ts` przechodzi na komputerze i telefonie.
