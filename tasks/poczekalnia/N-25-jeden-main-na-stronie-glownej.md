# N-25 – Jeden `<main>` na stronie głównej (axe landmark-no-duplicate-main)
Cel: Strona główna ma dokładnie jeden punkt orientacyjny `main`. Dziś `Home.tsx` ma `<main>` z mapą, a `PortalSections` (działy pod mapą) drugi `<main>` – czytnik ekranu widzi dwie „treści główne”. To realny błąd dostępności; przez niego padają w axe: profile-row „no axe… expanded row”, s20-parts (komputer 1440) oraz profile-mobile „passes axe”.
Zmieniaj: src/view/home/PortalSections.tsx, tests/unit/portal-landmarks.test.tsx, tests/e2e/home-single-main.spec.ts
Wymagane: tests/unit/portal-landmarks.test.tsx, tests/e2e/home-single-main.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/home-single-main.spec.ts tests/e2e/profile-row.spec.ts tests/e2e/home-portal.spec.ts tests/e2e/a11y-matrix.spec.ts tests/e2e/main-screen.spec.ts
Przeczytaj najpierw: src/view/Home.tsx (linie 29–50, tylko czytasz), src/view/home/PortalSections.tsx (linia 8), tests/unit/portal-sections.test.tsx, tasks/poczekalnia/DIAGNOZA-E2E.md (grupy 6, 8, 9)

Diagnoza (planista, 2026-11-16): axe na `/?u=…` zgłasza `landmark-no-duplicate-main` i `landmark-unique`: `<main class="flex-1 min-h-0 …">` (Home) i `<main class="max-w-7xl mx-auto …">` (PortalSections).

Zadanie:
1. `PortalSections.tsx`: zewnętrzny `<main …>` zamień na `<section aria-label="Działy i skróty">` z tymi samymi klasami (wygląd bez zmian). Nic więcej w pliku.
2. `tests/unit/portal-landmarks.test.tsx` (`renderToString` z `MemoryRouter`, wzorem portal-sections.test.tsx): HTML `PortalSections` nie zawiera `<main`, zawiera `<section` z `aria-label="Działy i skróty"`.
3. `tests/e2e/home-single-main.spec.ts` (nazwy z `@S14`): na `/?e2e` i `/?e2e&u=12` (1440×900 i 390×844) po `__atlas.ready` → `page.locator('main')` ma dokładnie 1 element; `new AxeBuilder({ page }).withRules(['landmark-no-duplicate-main','landmark-unique','landmark-one-main'])` → 0 naruszeń.

Gotowe, gdy:
- Nowe testy zielone; profile-row.spec.ts „no axe accessibility errors on open profile with expanded row” zielony bez zmian w nim; portal-sections.test, home-portal, a11y-matrix, main-screen zielone bez zmian.
- W raporcie: czy s20-parts (1440) i profile-mobile „passes axe” są już zielone (mogą jeszcze czekać na N-26 i N-28).

Nie rób: zmian w Home.tsx, AtlasMap.tsx, SiteFooter.tsx, istniejących testach; bez zmiany wyglądu ani nagłówków h2.
