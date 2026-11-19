# QU13 – Przesuwany wykres liniowy lat
Cel: wykres linii wskaźnika po latach z suwakiem roku, zsynchronizowany z mapą (panel wskaźnika, wskaźnik z biblioteki, profil).
Zmieniaj: src/view/charts/YearLineChart.tsx, src/core/charts/year-series.ts, tests/unit/year-series.test.ts, tests/unit/year-line-chart.test.tsx
Wymagane: tests/unit/year-series.test.ts, tests/unit/year-line-chart.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/research/q2-wykres-lat.md (z QU05), docs/ELEMENTY.md
Zadanie: Wg raportu QU05: czysta funkcja serii (jednostka + mediana kraju) w src/core i komponent SVG (lub wybrana biblioteka z wpisem w ELEMENTY.md po decyzji właściciela). Przeciąganie po linii zmienia rok z `useMainView` (jeden stan roku, nie drugi). Reduced motion, dotyk 44 px, wartości z tokenów. Osadzenie w panelu mapy robi osobne zadanie (pliki ekranu mapy są chronione: AtlasMap, ProfileSheet – tylko za wyraźną zgodą w prompcie).
Gotowe, gdy:
- test: seria ma punkt na każdy rok z danych i pomija braki bez wypełniania
- test: przesunięcie zmienia rok przez callback
- test: klawiatura ←/→ przesuwa rok
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Zależy od: QU05.
Tytuł PR zaczyna się od `[W5-QU13]`; opis ma „Po ludzku”.
