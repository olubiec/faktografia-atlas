# N-03 – Klawisze + i − przybliżają mapę z dowolnego miejsca strony
Cel: Naciśnięcie `+`/`=` lub `-` (poza polem tekstowym) przybliża/oddala mapę o jeden krok, także gdy fokus nie jest na mapie; gdy fokus jest na mapie – dokładnie jeden krok, nie dwa (domknięcie odłożonego z W18-P06).
Zmieniaj: src/core/map/zoom-step.ts, src/view/map/useZoomEvents.ts, src/view/map/AtlasMap.tsx, src/view/hooks/useKeyboardNavigation.ts, tests/unit/zoom-step.test.ts, tests/e2e/keyboard-zoom.spec.ts
Wymagane: src/core/map/zoom-step.ts, src/view/map/useZoomEvents.ts, tests/unit/zoom-step.test.ts, tests/e2e/keyboard-zoom.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/keyboard-zoom.spec.ts tests/e2e/camera.spec.ts
Przeczytaj najpierw: src/view/hooks/useKeyboardNavigation.ts (zdarzenie `atlas:zoom` z `detail.delta`), src/view/map/hooks/useMapViewState.ts (handleKeyDown ok. linii 354–389: krok 0.5, limity, markUserMoved), src/view/map/AtlasMap.tsx (ok. linii 120–130 i 332), src/core/map/test-seam.ts (`__atlas.viewState.zoom`)

Zadanie:
1. `src/core/map/zoom-step.ts`: czysta funkcja `nextZoom(zoom, delta: 1 | -1, limits: { minZoom; maxZoom }, step = 0.5)` z przycięciem do limitów. Eksportuj też `ZOOM_STEP = 0.5`.
2. `src/view/map/useZoomEvents.ts` (nowy plik poza `hooks/`): hook `useZoomEvents({ setCurrentViewState, limits, markUserMoved })` nasłuchuje `atlas:zoom` na `window`; na zdarzenie woła `markUserMoved()` i `setCurrentViewState(prev => ({ ...prev, zoom: nextZoom(prev.zoom, delta, limits) }))`. Sprzątanie nasłuchu w cleanup. Zła wartość `delta` = brak reakcji.
3. `AtlasMap.tsx`: tylko wywołanie `useZoomEvents(...)` z wartościami, które już zwraca `useMapViewState` (1–3 linie, bez innych zmian).
4. `useKeyboardNavigation.ts`: w `onKeyDown` przed rozpoznaniem skrótu `if (e.defaultPrevented) return;` – mapa z fokusem obsługuje `+/-` sama (`preventDefault` w handleKeyDown), więc nie będzie podwójnego kroku. Funkcja `resolveKeyAction` i typ `KeyLike` bez zmian; usuń z komentarza zdanie „nasłuch w mapie dopina osobne zadanie”.
5. `tests/unit/zoom-step.test.ts`: krok w górę/dół, przycięcie do maxZoom i minZoom, `ZOOM_STEP` = 0.5.
6. `tests/e2e/keyboard-zoom.spec.ts` (`@S16`): `/?e2e`, czekaj na `__atlas.ready`; bez klikania w mapę naciśnij `+` → `viewState.zoom` rośnie o 0.5 (tolerancja 0.01); `-` wraca. Fokus w polu wyszukiwania (otwórz wyszukiwarkę Ctrl+K) i `+` → zoom bez zmian. Fokus na kontenerze mapy (element z obsługą klawiatury) i `+` → wzrost dokładnie o 0.5, nie 1.0.

Gotowe, gdy:
- Testy jednostkowe nextZoom przechodzą.
- Test e2e: +/− działa bez fokusu na mapie, nie działa w polu tekstowym, z fokusem na mapie daje jeden krok.
- keyboard-nav.test.ts i camera.spec.ts zielone bez zmian.

Nie rób: zmian w src/view/map/hooks/*, Home.tsx, istniejących testach; nie ruszaj Escape ani Alt+1/2/3.
