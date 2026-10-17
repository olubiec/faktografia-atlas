# Sesja CC2.3 – ręczne zakreślenia czerwonym długopisem

## Zakres prac
- Stworzenie czystej logiki menedżera zakreśleń `AnnotationManager` w `src/core/annotation/annotationManager.ts` pilnującego, by na ekranie było najwyżej jedno aktywne zakreślenie.
- Zaimplementowanie komponentów Reacta `AnnotationProvider`, `AnnotationContext`, `useAnnotationManager` oraz `Annotate` w `src/view/annotation/`.
- Komponent `<Annotate>` korzysta z `rough-notation` z tokenami: kolor z CSS `--korekta` (odczytywany w runtime), `strokeWidth: 2.5`, `iterations: 2`, `padding: 6`, `animationDuration: 600`, wyłączenie animacji przy `prefers-reduced-motion: reduce`.
- Stworzenie funkcji `roughEllipse` w `src/view/annotation/roughEllipse.ts` rysującej owal `roughjs` z kolorem `--korekta` i atrybutami stroke.
- Stworzenie strony testowej `src/view/test/AnnotationTestPage.tsx` i dodanie trasy `/__test/annotation` w `src/App.tsx`.
- Testy jednostkowe Vitest w `tests/unit/annotationManager.test.ts` i `tests/unit/roughEllipse.test.ts`.
- Testy E2E Playwright w `tests/e2e/annotation.spec.ts` sprawdzające zasadę "jedno zakreślenie w DOM" oraz `prefers-reduced-motion`.
- Zaktualizowanie `scripts/shots.mjs` w celu generowania zrzutów ekranu dla wszystkich typów zakreśleń w jasnym i ciemnym motywie.
