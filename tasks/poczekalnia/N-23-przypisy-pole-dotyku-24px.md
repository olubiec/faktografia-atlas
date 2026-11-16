# N-23 – Odnośniki przypisów w profilu z polem co najmniej 24×24 px (WCAG 2.5.8)
Cel: Małe cyfry przypisów przy wskaźnikach profilu (`<sup><a href="#footnote-…">`) mają pole kliknięcia co najmniej 24×24 px. Dziś robi to za aplikację `a11y-matrix.spec.ts` (wstrzykuje `min-width/min-height: 24px` dla `a[href^="#footnote-"]`) – poprawka ma być w kodzie.
Zmieniaj: src/view/profile/ProfileIndicatorRow.tsx, tests/unit/footnote-link-size.test.tsx, tests/e2e/footnote-target-size.spec.ts
Wymagane: tests/unit/footnote-link-size.test.tsx, tests/e2e/footnote-target-size.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/footnote-target-size.spec.ts tests/e2e/a11y-matrix.spec.ts tests/e2e/profile-row.spec.ts tests/e2e/profile.spec.ts tests/e2e/s14-profile.spec.ts
Przeczytaj najpierw: src/view/profile/ProfileIndicatorRow.tsx (blok `itemFootnotes`, ok. linie 143–160), src/view/profile/Footnotes.tsx, src/core/profile/footnotes.ts (które wskaźniki mają przypisy), tests/e2e/a11y-matrix.spec.ts (`runAxe`), tests/e2e/profile-row.spec.ts, docs/STYL.md

Zadanie:
1. `ProfileIndicatorRow.tsx`: odnośnik przypisu jako `inline-flex` z wyśrodkowaną cyfrą i minimalnym rozmiarem 24×24 px – klasy Tailwind z tokenów/skali (bez wartości kolorów na sztywno; jeśli w projekcie przyjęte są `min-h-[…px]` dla pól dotykowych, użyj tej samej konwencji). Cyfra wygląda jak dziś (rozmiar i kolor tekstu bez zmian), wiersz nie zmienia wysokości o więcej niż 4 px. Kilka przypisów obok siebie nie nachodzi na siebie. `onClick` ze `stopPropagation` i `title` zostają.
2. `tests/unit/footnote-link-size.test.tsx` (`renderToString`; dane wiersza z przypisem z istniejących fixture lub `src/core/profile/footnotes.ts`): odnośnik `#footnote-…` ma klasy minimalnej szerokości i wysokości odpowiadające ≥ 24 px oraz `inline-flex`; wiersz bez przypisów nie renderuje `<sup>`.
3. `tests/e2e/footnote-target-size.spec.ts` (nazwy z `@S14`, zgoda „denied”): 1440×900 i 390×844, profil jednostki z wskaźnikiem z przypisem (znajdź w `src/core/profile/footnotes.ts`, którą jednostkę/wskaźnik; użyj `?u=…&e2e`): każdy widoczny `a[href^="#footnote-"]` ma `boundingBox` ≥ 24×24; axe z regułą `target-size` (BEZ wstrzykiwanego stylu) → 0 naruszeń dotyczących przypisów; kliknięcie odnośnika przewija do `#footnote-<id>` i nie otwiera/nie zwija wiersza wskaźnika.

Gotowe, gdy:
- Nowe testy zielone; a11y-matrix, profile-row, profile, s14-profile, footnotes-view.test, footnotes.test zielone bez zmian.
- W raporcie: zrzuty profilu, które mogą wymagać odświeżenia w CI.

Nie rób: zmian w a11y-matrix.spec.ts i innych istniejących testach, w ProfileSheet*.tsx, Footnotes.tsx, tokenach; bez zmiany treści przypisów.
