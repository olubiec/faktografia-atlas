# Sesja CC7.4b – przypisy i źródła pod wskaźnikami w profilu

## Zadanie
Implementacja obsługi numerowanych przypisów pod wskaźnikami w profilu jednostki oraz skonsolidowanej listy przypisów i źródła danych w stopce profilu.

## Zmiany
1. `src/core/profile/footnotes.ts` (nowy):
   - Funkcja `collectFootnotes(items, units)` zbierająca przypisy z pól `fromParent` oraz `indicator.footnote`.
   - Automatyczna deduplikacja identycznych treści przypisów oraz nadawanie im spójnych numerów sekwencyjnych (1-based).
   - Pomocnicza funkcja `formatParentFootnoteText` generująca czytelny opis jednostki wyższej (np. „dane dla powiatu bolesławiecki”).

2. `src/view/profile/Footnotes.tsx` (nowy):
   - Komponent React prezentujący skonsolidowaną listę numerowanych przypisów (`<ol>`) na dole arkusza profilu.
   - Unikalne identyfikatory `id="footnote-N"` dla ułatwienia nawigacji kotwicowej.

3. `src/view/profile/ProfileIndicatorRow.tsx`:
   - Zastąpienie wierszy tekstu przypisów pod wskaźnikiem jednolicą obsługą odnośników górnych (`<sup><a href="#footnote-N">N</a></sup>`).
   - Dostępność z klawiatury (`focus:ring-1 focus:ring-tusz`) oraz podpowiedź w `title`.

4. `src/view/profile/ProfileSheet.tsx`:
   - Dodanie wywołania `collectFootnotes` w `ProfileBody` i przekazanie listy do wierszy oraz komponentu `<Footnotes>`.
   - Umieszczenie listy przypisów w stopce profilu tuż nad zdaniem ze źródłem danych (`formatSource`).

5. Testy jednostkowe:
   - `tests/unit/footnotes.test.ts` (nowy): testowanie czystej logiki zbierania i deduplikacji przypisów.
   - `tests/unit/footnotes-view.test.tsx` (nowy): testowanie renderowania odnośników `<sup>` oraz listy przypisów w widoku.
