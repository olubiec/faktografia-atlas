# M01 – Telefon: pelnoekranowa mapa, dolny pasek i arkusz wskaznika
Cel: Na telefonie mapa zajmuje pelny ekran pod naglowkiem, a wskaznik obslugiwany jest dolnym paskiem i arkuszem zamiast wysokiego panelu nad mapa.
Zmieniaj: src/view/main/MobileIndicatorBar.tsx, src/view/map/AtlasMap.tsx, src/view/main/IndicatorPanel.tsx, src/view/map/Breadcrumbs.tsx, src/view/main/UnitTooltip.tsx, tests/e2e/mobile-layout.spec.ts, tests/e2e/mobile-indicator-sheet.spec.ts
Wymagane: src/view/main/MobileIndicatorBar.tsx, tests/e2e/mobile-layout.spec.ts, tests/e2e/mobile-indicator-sheet.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (sekcja S15 telefon), docs/STYL.md, src/view/map/AtlasMap.tsx, src/view/main/IndicatorPanel.tsx

Zadanie:
1. Utworz `src/view/main/MobileIndicatorBar.tsx`: komponent dolnego paska wskaznika dla telefonu (< 768 px). Pokazuje nazwe biezacego wskaznika, rok oraz mini-pasek 5 kolorow legendy (`min-h-[48px]`, `pb-[env(safe-area-inset-bottom)]`). Dotkniecie paska otwiera wysuwany arkusz `BottomSheet` z pelna zawartoscia `IndicatorPanel`.
2. W `src/view/map/AtlasMap.tsx`: gdy `useIsMobile()` jest true, usun renderowanie bloku `IndicatorPanel` w kolumnie nad mapa (`max-h-[45vh]`); mapa wypelnia cala przestrzen (`dvh`) pod naglowkiem (wysokosc mapy >= 75% okna); na dole renderuj `MobileIndicatorBar`. Otwarcie profilu jednostki automatycznie zamyka arkusz wskaznika oraz mobilny dymek.
3. W `AtlasMap.tsx` i `Breadcrumbs.tsx`: przekaz `onBack={goBack}` do `Breadcrumbs`, a osobny komponent `<BackButton />` ukryj na telefonie (`hidden md:block`), aby nie dublowac przycisku „Wroc”. W `Breadcrumbs.tsx` skracaj srodkowe elementy sciezki przy 3 poziomach zaglebienia na 360 px.
4. W `UnitTooltip.tsx`: dymek pozycjonowany nad dolnym paskiem wskaznika i nad paskiem zgody, chowany w chwili otwarcia profilu.
5. W `IndicatorPanel.tsx`: usun zabroniona klase `rounded-lg`.

Gotowe, gdy:
- Test e2e `tests/e2e/mobile-layout.spec.ts` (390x844 i 360x740) potwierdza, ze mapa zajmuje >= 75% wysokosci okna, panel wskaznika nie jest renderowany nad mapa, widoczny jest dolny pasek wskaznika, a nad mapa jest tylko jeden przycisk „Wroc”.
- Test e2e `tests/e2e/mobile-indicator-sheet.spec.ts` potwierdza, ze dotkniecie paska otwiera arkusz, wybor wskaznika zmienia `?i=`, a otwarcie profilu zamyka arkusz wskaznika.
- Istniejace testy komputerowe `main-screen.spec.ts` i `home.spec.ts` przechodza bez zmian.

Nie ruszaj: src/view/profile/ProfileSheet.tsx, src/view/profile/ProfileSheetMobile.tsx, src/core/map/
