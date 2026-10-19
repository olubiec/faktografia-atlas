# Sesja CC7.4a — Mały wykres lat (sparkline) przy każdym wskaźniku w profilu

## Zadanie
Dodanie małego wykresu liniowego (sparkline) prezentującego wartości z kolejnych lat dla każdego wskaźnika wyświetlanego w profilu jednostki administracyjnej.

## Zakres zmian
- `src/core/profile/profile.ts`: Rozszerzenie typu `ProfileIndicatorItem` o pole `series: { year: number; value: number | null }[]`. W funkcji `buildProfile` budowanie serii dla skutecznej jednostki (`effectiveUnit`) ze wszystkimi latami w kolejności rosnącej z zachowaniem wartości `null`.
- `src/view/profile/Sparkline.tsx`: Nowy komponent React renderujący wykres liniowy SVG przy użyciu `@observablehq/plot` (`Plot.lineY`). Gdy liczba nie-null punktów jest mniejsza niż 2, komponent zwraca `null`. Ustawia `role="img"`, `aria-label` (np. „Ludność ogółem, 2015–2024”) oraz kolor stroke za pomocą `currentColor`.
- `src/view/profile/ProfileIndicatorRow.tsx`: Osadzenie komponentu `Sparkline` obok sformatowanej wartości wskaźnika.
- `tests/unit/profile.test.ts`: Testy dla pola `series` w profilu.
- `tests/unit/sparkline.test.tsx`: Testy jednostkowe dla komponentu `Sparkline` (progi min. 2 punkty, atrybuty accessibility, czyszczenie inner `aria-label`).
- `docs/sessions/CC7.4a.md`: Dokumentacja sesji.

## Mapa warunków odbioru
| Warunek odbioru | Status | Weryfikacja |
| --- | --- | --- |
| `series` ma wszystkie lata z pliku wartości w kolejności rosnącej; null zostaje null | Zaliczony | `tests/unit/profile.test.ts` |
| `Sparkline` renderuje `<svg>` z `role="img"` i `aria-label` | Zaliczony | `tests/unit/sparkline.test.tsx` |
| Kolor linii przez `currentColor`, brak kodów hex w UI/SVG | Zaliczony | `tests/unit/sparkline.test.tsx` & oxlint |
| Mniej niż 2 lata z wartością → brak wykresu i brak błędu | Zaliczony | `tests/unit/sparkline.test.tsx` |
| Brak zmian w `/design` oraz w wzorcach zrzutów | Zaliczony | Zgodność z instrukcjami w repozytorium |
