# N-28 – Pasek wskaźnika na telefonie: widoczny tekst zawarty w nazwie przycisku (WCAG 2.5.3)
Cel: Przycisk w `MobileIndicatorBar` ma `aria-label="Wskaźnik: Gęstość zaludnienia (os./km²) 2025, 50,4 os./km² – 320,7 os./km²"`, a widoczny tekst sklejony bez odstępów: „Gęstość zaludnienia (os./km²)202550,4 os./km² – …”. axe zgłasza `label-content-name-mismatch` (osoba sterująca głosem nie trafi w przycisk). Padają przez to profile-mobile „passes axe” (razem z N-25).
Zmieniaj: src/view/main/MobileIndicatorBar.tsx, tests/unit/mobile-indicator-bar-name.test.tsx, tests/e2e/mobile-indicator-name.spec.ts
Wymagane: tests/unit/mobile-indicator-bar-name.test.tsx, tests/e2e/mobile-indicator-name.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/mobile-indicator-name.spec.ts tests/e2e/mobile-indicator-sheet.spec.ts tests/e2e/mobile-layout.spec.ts tests/e2e/profile-mobile.spec.ts tests/e2e/a11y-matrix.spec.ts
Przeczytaj najpierw: src/view/main/MobileIndicatorBar.tsx (linie 118–165), tests/unit/mobile-indicator-bar.test.tsx (linie 100–120 przypinają dokładny `aria-label` – NIE zmieniaj go), tasks/poczekalnia/DIAGNOZA-E2E.md (grupa 9)

Diagnoza (planista, 2026-11-16): sprawdzone w przeglądarce – po dopisaniu spacji na końcu każdego `<span>` w przycisku reguła `label-content-name-mismatch` daje 0 naruszeń (przed: 1). Przyczyną jest brak odstępów między nazwą, rokiem i zakresem w tekście widocznym.

Zadanie:
1. W przycisku dodaj rozdzielające odstępy w treści tekstowej między nazwą wskaźnika, rokiem i zakresem legendy (np. `{' '}` między elementami albo przecinek w ukrytym wizualnie `<span className="sr-only">, </span>` przed zakresem), tak by `textContent` przycisku czytał się „Gęstość zaludnienia (os./km²) 2025 50,4 os./km² – 320,7 os./km²”. `aria-label` zostaje identyczny (istniejący test go przypina). Wygląd bez zmian (odstępy już daje `gap-2`; zwykła spacja w flexie nie zmienia układu).
2. `tests/unit/mobile-indicator-bar-name.test.tsx` (`renderToString`, dane jak w mobile-indicator-bar.test.tsx): po usunięciu znaczników z HTML przycisku tekst zawiera nazwę, spację i rok (np. `/Stopa bezrobocia rejestrowanego\s+2023/`) oraz rok, spację i początek zakresu.
3. `tests/e2e/mobile-indicator-name.spec.ts` (nazwy z `@S15`): 390×844 i 360×740, `/?e2e` i `/?e2e&u=12` → axe `withRules(['label-content-name-mismatch'])` → 0 naruszeń; `textContent` przycisku `[data-slot="mobile-indicator-bar"] button` zawiera rok poprzedzony spacją.

Gotowe, gdy:
- Nowe testy zielone; mobile-indicator-bar.test, mobile-indicator-sheet, mobile-layout, a11y-matrix zielone bez zmian.
- profile-mobile.spec.ts uruchomiony z `--workers=1` – w raporcie wynik testu „passes axe accessibility scan” (zielony po N-25 i N-28).

Nie rób: zmiany `aria-label`, istniejących testów, układu paska ani tokenów; bez nowych pakietów.
