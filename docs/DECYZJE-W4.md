# Decyzje właściciela do fali W4 (20.11.2026)

Źródło: `docs/AUDYT-W4-20-11.md` (stan `main` = 1a54912). Zadania: `tasks/poczekalnia/W4/` (indeks i kolejność: `README.md` tamże).

| # | Pytanie | Decyzja |
|---|---|---|
| 1 | QU03: scalanie/usuwanie stron | Wariant A. |
| 2 | #531 (podpowiedzi tylko z pobranych) | Porzucone, istniejącego testu nie zmieniamy. |
| 3 | Rankingi | Zostają osobną stroną. |
| 4 | Wykresy lat | Własny SVG, bez nowego pakietu. |
| 5 | QC403 a `useMapViewState.ts` | Wolno wąsko (tylko `zoomBy`, klawisze `+`/`-`) i jedna linia `<ZoomButtons/>` w `AtlasMap.tsx`. QC404: `useMapViewState.ts` i tylko `onLocalitySelectView` w `AtlasMap.tsx`. |
| 6 | Krok zoomu | Przyciski 1 poziom, klawisze 0,5. |
| 7 | PM10 / PM12 | PM10 zrobione przez FIX6; PM12 zbędne (brak `setInterval`). |
| D4 | Dostęp QC403 | Zatwierdzona 18.11. |

Zasady: testy widoków bez Testing Library (`renderToString` lub czysta logika w pliku osobnym); bez nowych pakietów w W4; PR-y `[W4-<id>]`, scala właściciel.

Kolejność: QC403→QC404 · QC504→QC506 · QC903→QC904→QC912 · QC204→QC803 · QC606→QC607 · reszta i badania QU równolegle.
