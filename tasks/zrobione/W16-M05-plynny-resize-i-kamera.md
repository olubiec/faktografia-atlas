# M05 – Plynny resize okna bez utraty stanu profilu i skokow kamery
Cel: Zachowanie aktywnej zakladki i stanu profilu przy zmianie rozmiaru ekranu przez prog 768 px oraz natychmiastowe dopasowanie kamery bez animacji.
Zmieniaj: src/view/map/ProfilePortal.tsx, src/view/map/hooks/useMapViewState.ts, src/view/consent/ConsentBar.tsx, tests/e2e/responsive-resize.spec.ts
Wymagane: tests/e2e/responsive-resize.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§5a Kamera), src/view/map/ProfilePortal.tsx, src/view/map/hooks/useMapViewState.ts

Zadanie:
1. W `ProfilePortal.tsx`: zachowaj stan aktywnej zakladki (`activeTab`) i sekcji przy przelaczaniu miedzy kolumna boczna a `BottomSheet` podczas zmiany szerokosci okna przez prog 768 px.
2. W `useMapViewState.ts`: zmiana rozmiaru okna w `ResizeObserver` dopasowuje mape w trybie `instant` (czas 0 ms, zgodnie z PRODUKT.md §5a) zamiast uruchamiac 600 ms animacje.
3. W `ConsentBar.tsx`: dodaj obsluge `safe-area-inset-bottom`.

Gotowe, gdy:
- Test e2e `tests/e2e/responsive-resize.spec.ts` potwierdza, ze zmiana viewportu 1440x900 -> 360x740 -> 1440x900 zachowuje wybrana jednostke i aktywna zakladke profilu bez nowych zadan sieciowych.
- Zmiana rozmiaru okna nie wyzwala dlugiej animacji kamery mapy.

Nie ruszaj: src/view/profile/ProfileSheet.tsx, src/view/map/AtlasMap.tsx
