# Poczekalnia W4 – stan 20.11.2026

Gotowe do wdrożenia (dostosowane do `main` 1a54912):
- W4-QC504 → potem W4-QC506 (oba dotykają `MyIndicatorsBar.tsx`, kolejność obowiązkowa).

Do dopisania (limit API wyczerpany do 23.11, 5:00 UTC; wytyczne w `docs/AUDYT-W4-20-11.md`):
QC802, QC803, QC607, QC505, QC508, QC403→QC404, QC903→QC904→QC912, oceny QC503/QC606/QC916/QC204, badania QU01/03–07/20–32.
Do tego czasu obowiązują oryginały w `tasks/poczekalnia/Q/` i `tasks/poczekalnia/W4-QU*.md`.

Decyzje właściciela (przyjęte): Rankingi osobną stroną; QU03 wariant A; #531 porzucone; wykresy własnym SVG;
QC403 może ruszyć `useMapViewState.ts` (tylko `zoomBy`) i 1 linię w `AtlasMap.tsx`; krok zoomu: przyciski 1 poziom, klawisze 0,5; PM10 zrobione przez FIX6; PM12 zbędne.
