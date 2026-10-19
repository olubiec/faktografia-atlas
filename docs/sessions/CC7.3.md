# CC7.3 – arkusz profilu na telefon (dolny, przeciągany)

## Treść zadania

**Zadanie:** CC7.3 – arkusz profilu na telefon (dolny, przeciągany)
**Kontekst:** arkusz na komputer jest na main (`src/view/profile/ProfileSheet.tsx`, wiersze w `ProfileIndicatorRow.tsx`), logika w `src/core/profile/profile.ts` (`UnitProfile`), formatowanie w `src/core/format/number.ts`. Makieta: `docs/design/04-profil-telefon.png`. Paczka `react-modal-sheet` (^5.6.0) jest w `package.json`. Podpięcie do mapy (wybór komputer/telefon wg szerokości) to osobne zadanie toru M (CC7.2b); tu powstaje sam komponent przyjmujący profile przez props.
**Cel dla użytkownika:** na stronie `/design` widać arkusz profilu jak na telefonie: wysuwa się od dołu, ma trzy wysokości (zwinięty, połowa, pełny), da się go zamknąć.

**Zakres (tylko te pliki):**
- `src/view/profile/ProfileSheetMobile.tsx` (nowy)
- `src/view/profile/ProfileSheet.tsx` (tylko: wyciągnięcie wspólnej treści do eksportowanego komponentu `ProfileBody`, zachowanie działania bez zmian)
- `src/view/design/DesignPage.tsx` (tylko: jedna nowa sekcja)
- `tests/unit/profile-sheet-mobile.test.tsx` (nowy)
- `docs/sessions/CC7.3.md`

**Warunki odbioru:**
1. Komponent używa `react-modal-sheet`, ma punkty zatrzymania (zwinięty ≈ nagłówek, połowa, pełny) i przycisk zamknięcia z `aria-label`; Escape i przycisk wywołują `onClose` (test).
2. Treść jest ta sama co na komputerze (wspólny `ProfileBody`); istniejący test `tests/unit/profile-sheet.test.tsx` przechodzi bez zmian.
3. Najdłuższa nazwa jednostki z `public/data/units.json` mieści się w nagłówku (zawijanie lub truncate z pełną nazwą w `title`; test po klasach), a przycisk zamknięcia ma obszar dotyku co najmniej 44 × 44 px (klasy).
4. Kolory, odstępy i cienie wyłącznie z tokenów (bez hex, bez nowych wartości w `tokens.json`).
5. Brak danych profilu (pusta lista wskaźników) pokazuje czytelny komunikat tekstowy zamiast pustego arkusza.

---

## Podsumowanie realizacji

1. **Wspólna treść (`ProfileBody`):**
   - Wyciągnięto komponent `ProfileBody` w `src/view/profile/ProfileSheet.tsx` renderujący nagłówek jednostki z `title={unitName}` i `break-words`, przycisk zamknięcia (`aria-label="Zamknij"`, obszar dotyku `min-h-[44px]` i `min-w-[44px]`), listę wskaźników pogrupowanych lub komunikat o braku danych (`"Brak danych profilu dla tej jednostki."`), oraz stopkę ze źródłem.
   - Zachowano pełną wsteczną kompatybilność dla `ProfileSheet` (wersja na komputer).

2. **Mobilny arkusz (`ProfileSheetMobile`):**
   - Utworzono komponent `ProfileSheetMobile.tsx` wykorzystujący `react-modal-sheet` z trybem `unstyled`, własnymi tokenami Tailwind (`bg-arkusz`, `border-linia`, `text-tusz`) i uchwytem do przeciągania.
   - Zdefiniowano 3 punkty zatrzymania (`[0, 0.18, 0.5, 1]`): closed (0), zwinięty ≈ nagłówek (0.18), połowa (0.5), pełny (1.0).
   - Obsłużono zdarzenie klawisza `Escape` oraz zamykanie kliknięciem w przycisk zamknięcia lub tło.

3. **Sekcja w `/design`:**
   - Dodano sekcję `13b. Mobilny arkusz profilu jednostki (ProfileSheetMobile)` w `src/view/design/DesignPage.tsx` z przyciskiem do otwierania/testowania mobilnego arkusza profilu.

4. **Testy jednostkowe i e2e:**
   - Utworzono `tests/unit/profile-sheet-mobile.test.tsx` testujący wszystkie warunki odbioru.
   - Zweryfikowano przechodzenie wszystkich testów jednostkowych (`pnpm test`) oraz testów Playwright (`pnpm test:e2e`).
