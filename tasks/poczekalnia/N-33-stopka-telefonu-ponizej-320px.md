# N-33 – Zwinięta stopka na telefonie znów niższa niż 320 px
Cel: Na telefonie (360 i 390 px) zwinięta stopka ma być niska (≤ 320 px), jak zakłada P1-F. Dziś ma 343,5 px i 4 testy w `tests/e2e/site-footer-mobile.spec.ts` są czerwone. To realny błąd układu, nie środowisko: zmierzone (360×740, /o-projekcie) – kolumna z logo: link logo 44 px, opis misji 39 px, linijka licencji 44 px (pole dotyku linku CC BY 4.0), linijka „Dane GUS odświeżone: …” 19,5 px, trzy nagłówki grup po 44 px. Linijka świeżości dodana w P3-D (z odstępem `gap-2`) dołożyła ok. 27,5 px; bez niej stopka miała ok. 316 px.
Zmieniaj: src/view/layout/SiteFooter.tsx, src/view/layout/DataFreshness.tsx, tests/unit/site-footer-freshness-row.test.tsx, tests/e2e/site-footer-mobile-height.spec.ts
Wymagane: tests/unit/site-footer-freshness-row.test.tsx, tests/e2e/site-footer-mobile-height.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/site-footer-mobile.spec.ts tests/e2e/site-footer-mobile-height.spec.ts tests/e2e/freshness-single-fetch.spec.ts tests/e2e/library-no-map-values.spec.ts tests/e2e/home-portal.spec.ts tests/e2e/a11y-matrix.spec.ts tests/e2e/mobile-geometry-pages.spec.ts
Przeczytaj najpierw: src/view/layout/SiteFooter.tsx (kolumna 1: logo, opis, licencja, `<DataFreshness />`), src/view/layout/DataFreshness.tsx, tests/e2e/site-footer-mobile.spec.ts, tests/unit/site-footer-mobile.test.tsx (kolejność linków stopki – nie może się zmienić), tests/e2e/freshness-single-fetch.spec.ts, docs/STYL.md

Zadanie:
1. Odzyskaj wysokość na telefonie bez usuwania żadnej treści i bez zmniejszania pól dotyku poniżej 44 px. Zalecany sposób: na telefonie linijka świeżości stoi w jednym wierszu z logo (wiersz logo i tak ma 44 px: logo po lewej, „Dane GUS odświeżone: …” po prawej, `text-xs`, wyrównane do środka); od `md` układ jak dziś (świeżość pod licencją). Dopuszczalny inny sposób, jeśli daje ten sam efekt (np. świeżość w jednym wierszu z licencją, z zawijaniem). `DataFreshnessText` może dostać opcjonalny `className`, żeby ustawić położenie – bez zmiany tekstu ani warunku pobierania (`freshnessFetchAllowed`).
2. Bez linijki świeżości (np. na /biblioteka, gdzie się nie pobiera) wiersz logo wygląda jak dotąd.
3. Tylko klasy tokenów (Tailwind z @theme), bez wartości na sztywno poza już używanymi w pliku. Napis świeżości nie wychodzi poza pole przy 360 px (`scrollWidth <= clientWidth`), bez poziomego przewijania strony.
4. `tests/unit/site-footer-freshness-row.test.tsx` (`renderToString`, MemoryRouter): `DataFreshnessText` z etykietą renderuje ją z przekazaną klasą; bez etykiety – nic; kolejność i liczba linków stopki bez zmian (17, jak w site-footer-mobile.test.tsx).
5. `tests/e2e/site-footer-mobile-height.spec.ts` (nazwy z `@S1`): 360×740 i 390×844, /o-projekcie, czekaj na „Dane GUS odświeżone” → wysokość `footer` ≤ 316 px (zapas 4 px wobec limitu 320); linijka świeżości widoczna i nie wychodzi poza pole; `scrollWidth <= innerWidth`; 1280×800 → świeżość widoczna w kolumnie z logo.

Gotowe, gdy:
- Nowe testy zielone; wszystkie 7 testów `site-footer-mobile.spec.ts` zielone bez zmian w nim; site-footer-mobile.test, footer-view-transitions.test, freshness.test, data-freshness-cache.test, freshness-single-fetch, library-no-map-values zielone.
- W raporcie: zmierzona wysokość stopki przy 360 i 390 px przed i po; zrzuty (`*-snapshots`) ze stopką na telefonie do odświeżenia.

Nie rób: zmian w istniejących testach, w tekstach stopki, w grupach linków ani w `freshness-label.ts`; bez nowych pakietów.
