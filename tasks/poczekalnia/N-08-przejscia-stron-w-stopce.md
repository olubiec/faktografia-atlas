# N-08 – Płynne przejścia stron także z linków w stopce i na stronie 404
Cel: Kliknięcie linku w stopce (np. „Prywatność”, „Skąd są dane”) albo „Wróć na stronę główną” na stronie 404 daje ten sam łagodny fade co linki w nagłówku; przy ograniczeniu ruchu – bez animacji (domknięcie odłożonego z P4-A).
Zmieniaj: src/view/layout/SiteFooter.tsx, src/view/NotFound.tsx, src/view/pages/DataDisclaimer.tsx, tests/unit/footer-view-transitions.test.ts
Wymagane: tests/unit/footer-view-transitions.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: tests/unit/view-transitions.test.ts (wzór testu dla Header.tsx), src/styles/view-transitions.css, src/view/layout/SiteFooter.tsx, tasks/poczekalnia/NOC-RAPORT.md (P4-A)

Zadanie:
1. Dodaj prop `viewTransition` do każdego `<Link>` w SiteFooter.tsx (2 miejsca: linki grup i drugi Link ok. linii 135), NotFound.tsx (1) i DataDisclaimer.tsx (1). Nic poza tym propem (hrefy, teksty, klasy i liczba linków bez zmian – pilnują tego istniejące testy stopki).
2. `tests/unit/footer-view-transitions.test.ts`: odczytaj źródła tych trzech plików (jak w view-transitions.test.ts) i sprawdź, że liczba `<Link\b` > 0 i równa liczbie `<Link\b[^>]*?\bviewTransition\b` w każdym pliku. Dodaj też przypadek kontrolny: funkcja licząca zwraca rozbieżność dla przykładowego tekstu z jednym Linkiem bez propu.
3. CSS przejść ani blok reduced-motion nie wymagają zmian (już działają globalnie) – sprawdź i napisz w PR.

Gotowe, gdy:
- footer-view-transitions.test.ts przechodzi dla trzech plików, a przypadek kontrolny wykrywa brak propu.
- site-footer-mobile.test.tsx, site-layout.test.tsx, info-pages.test.tsx, view-transitions.test.ts zielone bez zmian.

Nie rób: dodawania nowych linków w stopce (decyzja z P2-E wciąż otwarta), zmian Header.tsx, PortalSections.tsx, plików CSS i istniejących testów.
