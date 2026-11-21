# M01 – Sekcje redakcyjnego portalu pod mapa na stronie glownej
Cel: Dodanie sekcji redakcyjnych pod mapa na stronie glownej (dzialy, rekordy, pojedynki miejsc) bez naruszania ukladu pierwszego ekranu i bez nowych zadan sieciowych.
Zmieniaj: src/view/Home.tsx, src/view/home/PortalSections.tsx, src/view/home/FeaturedComparisons.tsx, src/view/map/IntroOverlay.tsx, tests/unit/portal-sections.test.tsx, tests/e2e/home-portal.spec.ts
Wymagane: src/view/home/PortalSections.tsx, src/view/home/FeaturedComparisons.tsx, tests/unit/portal-sections.test.tsx, tests/e2e/home-portal.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md, docs/STYL.md, src/view/Home.tsx, config/indicators.json

Zadanie:
1. W `Home.tsx`: pierwszy ekran zachowuje `h-dvh flex flex-col` z naglowkiem i mapa `AtlasMap` (dzieki czemu `main-screen.spec.ts` i `home.spec.ts` przechodza w 100% bez zmian!). Na dole pierwszego ekranu dodaj pasek „Przewin w dol: Dzialy tematyczne · Rekordy Polski · Pojedynki miejsc · Biblioteka”.
2. Utworz `src/view/home/PortalSections.tsx`: ponizej pierwszego ekranu wyrenderuj w siatce 1 px sekcje:
   - Szybki start: wyszukiwarka jednostek + skroty do 6 jednostek (Warszawa, Krakow, Powiat tatrzanski, Kleszczow, Sopot, Walcz).
   - 7 dzialow tematycznych z `config/indicators.json`: klikniecie wskaznika przelacza mape (`?i=`) i przewija do mapy lub prowadzi do `/rankingi?i=`.
   - Brama do Biblioteki 64 000 zmiennych BDL.
   - Stopka `SiteFooter`.
3. Utworz `src/view/home/FeaturedComparisons.tsx`: 6 kart kontrastowych pojedynkow (np. Warszawa vs Krakow, Kleszczow vs Przytuly, Tatrzanski vs Bieszczadzki) otwierajacych porownanie jednym kliknieciem.
4. Utworz `src/view/map/IntroOverlay.tsx` (`W3.5`): animowany kontur Polski raz na sesje wg `timeline.ts` (`1200ms`, `pointer-events-none`, wylaczony przy `prefers-reduced-motion` i `?e2e`).

Gotowe, gdy:
- Test e2e `tests/e2e/home-portal.spec.ts` potwierdza, ze przewiniecie w dol odslania 7 dzialow, 6 pojedynkow i stopke; klikniecie dzialu przelacza wskaznik na mapie.
- Istniejace testy `main-screen.spec.ts`, `home.spec.ts` i `perf-budget.spec.ts` (0 nowych zadan `/data/*` na starcie) przechodza bez zmian.

Nie ruszaj: src/view/map/AtlasMap.tsx, src/view/main/IndicatorPanel.tsx
