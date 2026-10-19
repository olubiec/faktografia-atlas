# Sesja CC8.2b: legenda kartogramu (logika i komponent)

## Opis zadania
Zadanie CC8.2b obejmuje stworzenie czystej logiki budowania elementów legendy kartogramu oraz komponentu widoku prezentującego legendę bez podpinania jej do interaktywnej mapy (podpięcie nastąpi w osobnym zadaniu).

## Zakres prac
1. `src/core/legend/legend.ts`: Implementacja czystej funkcji `buildLegend` generującej elementy legendy `{ token, from, to, label }` z użyciem `classColorToken` oraz `formatValue`.
2. `src/view/legend/Legend.tsx`: Komponent widoku renderujący kontener z `role="list"` i pozycjami `role="listitem"`, wykorzystujący wyłącznie kolory zmiennych CSS (`var(--token)`) bez sztywnych hexów.
3. `src/view/design/DesignPage.tsx`: Dodanie sekcji 15 prezentującej przykłady legendy w różnych wariantach na stronie `/design`.
4. `tests/unit/legend.test.ts`: Testy jednostkowe czystej logiki wyliczania przedziałów, formantów etykiet i obsługi pustych danych.
5. `tests/unit/legend-view.test.tsx`: Testy komponentu pod kątem struktury DOM, dostępności (role="list", role="listitem"), braku kolorów hex i obcinania długich etykiet.
6. `docs/sessions/CC8.2b.md`: Dokumentacja wykonanej sesji.

## Warunki odbioru
- $n$ progów daje $n + 1$ klas z odpowiednim tokenem z `classColorToken`. Etykiety sformatowane w języku polskim ("poniżej ...", "od ... do ...", "powyżej ...") via `formatValue`.
- Pozycja "brak danych" zawsze na końcu z tokenem `--no-data` i stylizacją przez `var(--token)`.
- Komponent posiada `role="list"`, `role="listitem"` z widoczną etykietą tekstową.
- Brak przepełnienia przy długich etykietach (np. duże liczby).
- Pusta lista progów tworzy bezpiecznie samą pozycję "brak danych".
