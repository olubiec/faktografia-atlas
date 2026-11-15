# N-07 – Test: na telefonie mapa zostaje widoczna nad arkuszem wskaźnika i profilu
Cel: Test e2e pilnuje wymagania z PRODUKT §5 na 390×844 i 360×740: arkusz wskaźnika i arkusz profilu nie zasłaniają więcej niż 65% wysokości okna w pozycji startowej, a nagłówek ma ≤ 56 px (domknięcie odłożonego z P4-C).
Zmieniaj: tests/e2e/mobile-sheet-map-visible.spec.ts
Wymagane: tests/e2e/mobile-sheet-map-visible.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/mobile-sheet-map-visible.spec.ts --repeat-each=3
Przeczytaj najpierw: docs/PRODUKT.md (§5), tests/e2e/profile-mobile.spec.ts (wejście `/?e2e&u=12`), tests/e2e/a11y-matrix.spec.ts (selektor arkusza profilu: dialog po aria-label), tests/e2e/mobile-indicator-sheet.spec.ts, src/view/main/MobileIndicatorBar.tsx (aria-label „Panel wskaźnika”), tests/e2e/helpers/

Zadanie:
1. Nowy plik `tests/e2e/mobile-sheet-map-visible.spec.ts`, testy z `@S15`, dla obu rozmiarów okna:
   - Start `/?e2e`, czekaj na `__atlas.ready`; zamknij/pomiń pasek zgody tak, jak robią to istniejące testy mobilne. Nagłówek (`header`) ma wysokość ≤ 56 px.
   - Otwórz arkusz wskaźnika (dotknięcie paska wskaźnika). Górna krawędź arkusza (`boundingBox().y`) ≥ 35% wysokości okna.
   - Wejście `/?e2e&u=12`: czekaj na `__atlas.profileOpen === true`; górna krawędź arkusza profilu ≥ 35% wysokości okna, a `document.documentElement.scrollWidth <= innerWidth`.
   - Najwyżej jeden arkusz otwarty naraz: po otwarciu profilu nie ma widocznego arkusza wskaźnika.
2. Selektory po rolach i aria-label (jak w istniejących testach), bez `waitForTimeout` dłuższego niż 500 ms; czekaj na stan (`expect.poll`, `waitForFunction`).

Gotowe, gdy:
- Test przechodzi 3 razy z rzędu (`--repeat-each=3`) na obu rozmiarach.
- Jeśli któryś warunek nie przechodzi na obecnej aplikacji – NIE zmieniaj kodu w src/ ani progu: opisz w PR, który warunek i jakie wartości zmierzyłeś, i zatrzymaj się.

Nie ruszaj: src/, istniejących testów i helperów (nowy helper tylko w tym pliku specu).
