# Poczekalnia W4 – stan 20.11.2026

Zapisane (21 plików, każdy z blokiem „Zasady wspólne”), oparte na `main` 1a54912. Nie sprawdzone w całości przez Claude – przed startem przejrzeć.

## Kolejność i kolizje plików
- QC504 → QC506 (`MyIndicatorsBar.tsx`)
- QC403 → QC404 (`useMapViewState.ts`)
- QC903 → QC904 → QC912 (QC912 napisane; testy na czystych plikach, bo nie ma `renderHook`)
- Niezależne (równolegle): QC802, QC803, QC607, QC505, QC508
- Badania (tylko docs, bez kodu): QU01, 03, 04, 05, 06, 07, 20, 22, 25, 28

## Brak (agenci przerwani limitem API do 23.11, 5:00 UTC)
- QC912, oceny QC503/QC606/QC916/QC204 (wytyczne: `docs/AUDYT-W4-20-11.md`)
- badania QU21, 23, 24, 26, 27, 29–32 (część scalona w QU20/22/25/28 – sprawdzić)
- Zastąpione oryginały są w `tasks/poczekalnia/archiwum/W4-zastapione/` (22 pliki; QC503 zrobione na main). Obowiązują pliki z tego katalogu.

## Decyzje przyjęte
Rankingi osobną stroną; QU03 wariant A; #531 porzucone; wykresy lat własnym SVG; QC403 może ruszyć `useMapViewState.ts` (tylko `zoomBy`) i 1 linię w `AtlasMap.tsx`; krok zoomu: przyciski 1 poziom, klawisze 0,5; PM10 zrobione przez FIX6; PM12 zbędne.


## Uzupełnienie (20.11)
- Dodane: QC912 (przepisane: ścieżka `src/view/hooks/useMyIndicators.ts`, logika w `deckReducer.ts`/`valueLoader.ts` testowana w node), QC204, QC606, QC916 (oryginały W3 sprawdzone: wszystkie ścieżki istnieją, kopiowane bez zmian).
- QC503: już na main (`src/view/hooks/useMyIndicators.ts` z `move`) – nic do robienia, oryginał do archiwum.
- Kolejność: QC204 → QC803 (`ComparePage.tsx`); QC606 → QC607; QC903 → QC904 → QC912; QC916 niezależne (przed QC918 z W7).
- Pozostają do napisania po resecie limitu: tylko ewentualne badania spoza QU01–07/20/22/25/28.
