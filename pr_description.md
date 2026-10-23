W3.1 – Sprzątanie zakreśleń w profilu

### Po ludzku
- Usunąłem stary kod zakreśleń (`highlight`) z wiersza wskaźnika w profilu jednostki (`ProfileIndicatorRow.tsx` i `ProfileSheet.tsx`). Czerwony marker zasłaniający tekst już się nie pojawi.
- Usunąłem nieużywany plik `src/core/profile/highlight.ts` oraz odpowiadające mu testy z `tests/unit/highlight.test.ts`.
- Usunąłem stare testy e2e sprawdzające to zakreślenie z `tests/e2e/annotation-scroll.spec.ts`.
- Zaktualizowałem `docs/STAN.md` – oznaczyłem W3.1 jako wykonane i wykreśliłem zasłaniające zakreślenie z listy znanych problemów.
- **Co sprawdzić:** Otwórz profil jakiejś jednostki (np. Zakopanego) i upewnij się, że żadne wiersze wskaźników nie są na czerwono zakreślone.
- **Czego nie robiłem:** Nie zmieniałem widoku Przeglądu (`ProfileOverview.tsx`) ani samego silnika adnotacji `Annotate.tsx` (są wykorzystywane w nowych widokach profilu).

### Zmiany w kodzie
1. Edycja `src/view/profile/ProfileIndicatorRow.tsx` (usunięcie importu, atrybutów i warunków renderowania).
2. Edycja `src/view/profile/ProfileSheet.tsx` (usunięcie logiki dobierającej `highlightedIndicatorId`).
3. Usunięcie `tests/unit/highlight.test.ts` oraz `src/core/profile/highlight.ts`.
4. Usunięcie `tests/e2e/annotation-scroll.spec.ts`.
5. Edycja `docs/STAN.md`.
