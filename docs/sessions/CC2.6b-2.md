# CC2.6b-2 – panel ?tune: zakładka Typografia

## Kontekst i cel
W panelu dostrajania `?tune` obok zakładki „Kolory” została dodana zakładka „Typografia” z suwakami dla stopni skali fontu (`font.scale`: `xs`…`5xl`, mapowanymi na zmienne CSS `--text-*`). Zmiany wielkości tekstu działają na żywo w przeglądarce. Przycisk „Kopiuj JSON” generuje obiekt diff zawierający modyfikacje z obu zakładek naraz, a przycisk „Przywróć” cofa wszystkie zmiany.

## Zakres zmian
- `src/view/tune/TunePanel.tsx`:
  - Dodano zakładkę „Typografia” w interfejsie Tweakpane.
  - Zaimplementowano suwaki dla stopni skali (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`) w zakresie 10–96 px z krokiem 1.
  - Zaktualizowano `applyCssVariables` o nakładanie zmiennych `--text-*` (np. `--text-md: 20px`) na `documentElement`.
  - Zaktualizowano `resetTokens` o przywracanie domyślnych wartości `font.scale`, `color.light`, `color.dark` oraz tablic `data.*` W MIEJSCU (`Object.assign` i przypisanie po indeksach), zachowując referencje do obiektów, do których podłączony jest Tweakpane.
  - Przeniesiono przyciski „Kopiuj JSON” i „Przywróć” do poziomu panelu, aby działały globalnie na obie zakładki.
- `src/view/tune/tokens-map.ts`:
  - Zweryfikowano istniejące mapowanie `font.scale` na zmienne CSS `--text-*` (bez modyfikacji istniejących wpisów).
- `tests/unit/tune-panel.test.ts`:
  - Dodano testy jednostkowe dla `diffTokens` przy zmianach `font.scale.md`, `resetTokens` oraz `applyCssVariables`.
- `tests/e2e/tune.spec.ts`:
  - Dodano test e2e sprawdzający zakładkę „Typografia”, suwaki, natychmiastową zmianę wyliczonego `font-size` elementu z klasą `.text-md` oraz ograniczenia min/max (10-96 px).
  - Dodano test e2e sprawdzający „Kopiuj JSON” przy jednoczesnej zmianie koloru i stopnia fontu.
  - Dodano test e2e sprawdzający „Przywróć” cofające zmiany z obu zakładek.
  - Dodano test e2e weryfikujący ponowne modyfikowanie kontrolek po „Przywróć” (sprawdzający aktualizację zmiennych CSS oraz wartości w polach formularza dla `md` i `korekta`).

## Weryfikacja
Wszystkie testy jednostkowe, e2e, linter, typecheck oraz build przeszły pomyślnie (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`).
