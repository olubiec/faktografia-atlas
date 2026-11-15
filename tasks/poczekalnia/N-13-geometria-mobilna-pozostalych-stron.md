# N-13 – Geometria na telefonie: pozostałe strony (porównaj, źródła, zmienna biblioteki, kontakt, zastrzeżenie, 404)
Cel: Domknąć luki audytu W17-T01 (`mobile-ux-geometry.spec.ts` sprawdza tylko /, profil, okno udostępniania i /biblioteka). Na 360 i 390 px pozostałe strony nie mają poziomego przewijania, uciętych napisów ani za małych pól dotykowych.
Zmieniaj: tests/e2e/mobile-geometry-pages.spec.ts, src/view/pages/ComparePage.tsx, src/view/pages/Sources.tsx, src/view/pages/SourcesIndicatorTable.tsx, src/view/pages/LibraryVariable.tsx, src/view/pages/Contact.tsx, src/view/pages/DataDisclaimer.tsx, src/view/NotFound.tsx
Wymagane: tests/e2e/mobile-geometry-pages.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/mobile-geometry-pages.spec.ts tests/e2e/editorial-pages.spec.ts tests/e2e/a11y-matrix.spec.ts tests/e2e/compare-page-p1b.spec.ts tests/e2e/library-variable.spec.ts
Przeczytaj najpierw: docs/STYL.md, docs/PRODUKT.md (§5), tests/e2e/mobile-ux-geometry.spec.ts i tests/e2e/rankings-mobile-p1a.spec.ts (wzór pomiarów), tests/e2e/a11y-matrix.spec.ts (ustawienie zgody)

Zadanie:
1. Najpierw test. `tests/e2e/mobile-geometry-pages.spec.ts` (nazwy z `@S21`), dla okien 360×740 i 390×844 i tras: `/porownaj`, `/porownaj?c=1465,1261` (gotowy pojedynek), `/zrodla`, `/biblioteka/60614`, `/kontakt`, `/zastrzezenie`, `/nie-ma-takiej-strony`. Zgoda ustawiona na „denied” w `addInitScript` (jak w mobile-sheet-map-visible.spec.ts). Czekaj na `h1`.
   - `document.documentElement.scrollWidth <= innerWidth`.
   - Każdy widoczny `main button, main select, main input, main summary` ma wysokość ≥ 44 px; samodzielne linki (`main a` poza akapitem/komórką tabeli/elementem listy z tekstem – wyjątek WCAG 2.5.8 dla linków w tekście) też ≥ 44 px.
   - Brak uciętego tekstu: `main h1, main h2, main h3, main p, main li, main td, main th` mają `scrollWidth <= clientWidth + 1` – z wyjątkiem elementów wewnątrz kontenera z `overflow-x: auto` (tabela może przewijać się w swoim pudełku, strona nie).
   - Komunikat błędu asercji podaje trasę, selektor i zmierzone wartości.
2. Uruchom test na obecnym kodzie i zapisz w PR listę naruszeń.
3. Popraw naruszenia wyłącznie w plikach z linii „Zmieniaj” – klasami z tokenów (`min-h-[44px]`, `break-words`, `min-w-0`, kontener `overflow-x-auto` dla szerokiej tabeli). Bez `rounded-*`, `shadow-*`, wersalików.
4. Jeśli naruszenie siedzi w pliku spoza listy (SiteLayout, SiteFooter, Header, src/components/ui, profil) – nie poprawiaj go: oznacz ten przypadek w teście jako `test.fail()` z komentarzem wskazującym plik, opisz w PR i nie poprawiaj dalej tego przypadku.

Gotowe, gdy:
- Nowy spec zielony (ewentualne `test.fail()` tylko z pkt 4, opisane w PR).
- editorial-pages, a11y-matrix, compare-page-p1b, library-variable zielone bez zmian.
- Wzorce zrzutów, które mogą się zmienić (design.spec.ts nie dotyczy), wymienione w PR do odświeżenia w CI.

Nie rób: zmian w istniejących testach, w src/view/layout/*, src/view/Header.tsx, src/components/ui/*, w plikach profilu; bez zmniejszania tekstu poniżej tokenów; bez ukrywania treści (`overflow-hidden`, `truncate`), żeby przeszło.
