# Status prac przerwanych i do zrobienia (stan na 2026-11-18)

## Zrobione i scalone na main
- FIX6 (płynna kamera) w całości: PR #492–#502.

## Przerwane: [W2-FIX7] – startowy widok mapy (PR #503, gałąź `claude/FIX7`)
Cel: na telefonie mapa startuje za blisko (widać tylko środek Polski). Ma być widoczna cała Polska z marginesem; do tego lżejszy render.

Zrobione na gałęzi:
- Przyczyna: w `onLoad` referencja mapy była pusta, więc `syncMap` nic nie ustawiał i mapa zostawała na sztywnym zoomie 5,5. Teraz `syncMap` dostaje mapę ze zdarzenia `onLoad`.
- `src/core/map/fit.ts` (`fitViewState`): dopasowanie do rozmiaru kontenera (margines 48 px, 64 px u góry na pasek „Polska”); „Wróć” używa tej samej funkcji.
- `pixelRatio` MapLibre i `useDevicePixels` deck.gl ograniczone do min(dpr, 2).
- `__atlas.mapView` w szwie testowym; testy `tests/unit/fix7-fit-view.test.ts`, `tests/e2e/fix7-start-view.spec.ts`.
- Test `tests/e2e/s15-mobile.spec.ts` poprawiony (klik w centroid woj. pomorskiego; zgoda właściciela).

Przerwane / niedokończone:
- CI na gałęzi jest czerwone (shard 3/4): stały punkt kliknięcia w testach trafia teraz w pustkę. Dotyczy `tests/e2e/mobile-tooltip.spec.ts` (6 testów) i `tests/e2e/profile-mobile.spec.ts:114`. Właściciel zgodził się na zmianę wyłącznie miejsca kliknięcia (środek widocznego województwa nad dolnym arkuszem, y < ok. 380), bez zmiany asercji.
- Rozpoczęta, niedokończona praca: helper `tests/e2e/helpers/map-tap.ts` i częściowa zmiana `mobile-tooltip.spec.ts` (zacommitowane jako WIP, niesprawdzone). `profile-mobile.spec.ts` nie ruszony.
- Uwaga środowiskowa: `playwright.config.ts` ma `reuseExistingServer` poza CI; stary `vite preview` na porcie 4173 serwuje nieaktualny build. Przed testami lokalnymi: `pkill -f "vite preview"` i `pnpm build`.
- Po zielonym CI: scalić #503 squashem; jeśli zmieniły się zrzuty, odświeżyć wzorce workflowem „Update snapshots”.

## Do sprawdzenia przez właściciela na telefonie (FIX6)
Płynny zoom (kółko/pinch), „Cofnij”/„Wróć”, warstwa miejscowości bez skoku (pojawia się od 8,5, znika poniżej 8,0), wachlarze przy zoomie 11–12, przerwanie animacji dotykiem, ograniczony ruch. Liczby wydajności (SwiftShader) są orientacyjne.

## Otwarte
- Fala Q2 (19 zadań w `tasks/poczekalnia/`): tylko na „start Q2”, po sprawdzeniu kolizji plików z FIX4/FIX6/FIX7 (`AtlasMap.tsx`, `useMapViewState.ts`, `ProfileIndicatorList.tsx`, `AddIndicatorWindow.tsx`, `localities-layer.ts`, `picker-results.ts`).
- Reduced motion: bezwładność `scrollZoom`/`dragPan` nie jest wyłączona (konfiguracja w `AtlasMap.tsx`).
- Q3–Q7, wskaźniki biblioteki niepodpięte do UI, skrypt GUS (host wewnętrzny), 155 nieudanych + 375 poza available.json, czerwony gitleaks w #451, wynik „Fetch data” #31, odświeżenie STAN.md (D10), PX02 (D3).
- Nie scalać Dependabot #450 w trakcie W3–W5.
- Stare gałęzie `claude/FIX6A` i `claude/FIX6I` (obce commity, nieszkodliwe) – można usunąć.
