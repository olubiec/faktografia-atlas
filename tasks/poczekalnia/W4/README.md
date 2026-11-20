# Poczekalnia W4 – stan 20.11.2026

Zapisane (21 plików, każdy z blokiem „Zasady wspólne”), oparte na `main` 1a54912. Nie sprawdzone w całości przez Claude – przed startem przejrzeć.

## Kolejność i kolizje plików
- QC504 → QC506 (`MyIndicatorsBar.tsx`)
- QC403 → QC404 (`useMapViewState.ts`)
- QC903 → QC904 → QC912 (plik QC912 jeszcze do napisania)
- Niezależne (równolegle): QC802, QC803, QC607, QC505, QC508
- Badania (tylko docs, bez kodu): QU01, 03, 04, 05, 06, 07, 20, 22, 25, 28

## Brak (agenci przerwani limitem API do 23.11, 5:00 UTC)
- QC912, oceny QC503/QC606/QC916/QC204 (wytyczne: `docs/AUDYT-W4-20-11.md`)
- badania QU21, 23, 24, 26, 27, 29–32 (część scalona w QU20/22/25/28 – sprawdzić)
- Oryginały w `tasks/poczekalnia/Q/` i `tasks/poczekalnia/W4-QU*.md` zostają, dopóki te pliki ich nie zastąpią.

## Decyzje przyjęte
Rankingi osobną stroną; QU03 wariant A; #531 porzucone; wykresy lat własnym SVG; QC403 może ruszyć `useMapViewState.ts` (tylko `zoomBy`) i 1 linię w `AtlasMap.tsx`; krok zoomu: przyciski 1 poziom, klawisze 0,5; PM10 zrobione przez FIX6; PM12 zbędne.
