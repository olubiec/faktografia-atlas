# M08 – Rozbicie TrendChart na moduly ponizej 200 linii
Cel: Rozbicie 428-liniowego TrendChart.tsx na czyste moduly ponizej 200 linii z zachowaniem identycznego zachowania i testow.
Zmieniaj: src/view/profile/TrendChart.tsx, src/core/profile/trend-geometry.ts, src/view/profile/TrendAxis.tsx, src/view/profile/TrendPoints.tsx, src/view/profile/TrendStatus.tsx, tests/unit/trend-geometry.test.ts
Wymagane: src/core/profile/trend-geometry.ts, src/view/profile/TrendAxis.tsx, src/view/profile/TrendPoints.tsx, src/view/profile/TrendStatus.tsx, tests/unit/trend-geometry.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/profile/TrendChart.tsx, tests/unit/trend-chart.test.tsx, tests/e2e/profile-trend.spec.ts

Zadanie:
1. Wydziel czysta geometrie wykresu (skale `getX`/`getY`, lata na osi, segmenty linii, obsluge brakow danych) do `src/core/profile/trend-geometry.ts` z testami w `tests/unit/trend-geometry.test.ts`.
2. Wydziel komponent osi do `src/view/profile/TrendAxis.tsx`.
3. Wydziel punkty i linie do `src/view/profile/TrendPoints.tsx`.
4. Wydziel pasek statusu dla czytnikow ekranu do `src/view/profile/TrendStatus.tsx`.
5. W `TrendChart.tsx` polacz powyzsze komponenty; zachowanie, klasy, obsluga klawiatury i atrybuty ARIA bez zmian. Kazdy plik <= 200 linii kodu.

Gotowe, gdy:
- Wszystkie istniejace testy jednostkowe `tests/unit/trend-chart.test.tsx` oraz e2e `tests/e2e/profile-trend.spec.ts` przechodza bez zmian.
- Nowy test `tests/unit/trend-geometry.test.ts` pokrywa przypadki brzegowe: brak danych, jeden punkt, luki w latach, wartosci ujemne.
- Wszystkie zmienione i utworzone pliki maja <= 200 linii.

Nie ruszaj: src/view/profile/ProfileOverview.tsx, src/view/profile/ProfileSheet.tsx, src/view/profile/ProfileIndicatorRow.tsx
