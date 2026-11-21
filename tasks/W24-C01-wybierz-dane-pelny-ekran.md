# C01 – „Wybierz dane”: pełnoekranowe okno wyboru wskaźnika na mapie, bez „Moich wskaźników”
Fala pliku: W24 (etap C). Fala budowy: 1 z 4. Zależy od: nic (B01–B07 scalone). Równolegle z: C02, C03.
Cel: Jedyny wskaźnik na mapie wybiera się w pełnoekranowym oknie „Wybierz dane” (szukajka u góry, pod nią działy i grupy, to samo menu co dawna Biblioteka); „Moich wskaźników” nie ma na głównej mapie, a dolny pasek na telefonie jest lekko wyżej.
Zmieniaj: src/view/data-menu/DataMenuWindow.tsx, src/view/main/IndicatorPanel.tsx, src/view/main/MobileIndicatorBar.tsx, src/view/main/SheetIndicatorPicker.tsx, src/view/main/UnitTooltip.tsx, tests/unit/c01-data-window.test.tsx, tests/e2e/c01-data-window.spec.ts
Wymagane: tests/unit/c01-data-window.test.tsx, tests/e2e/c01-data-window.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/STYL.md (§5 Układ, §12), docs/PRODUKT.md (§3.3 menu danych), src/view/data-menu/DataMenu.tsx (DataMenuBody, DataMenuDialog), src/components/ui/dialog.tsx, src/view/main/IndicatorPanel.tsx, src/view/main/MobileIndicatorBar.tsx
Zgody właściciela (21.11.2026, polecenie w sesji planowania): usunięcie „Moich wskaźników” z głównej mapy; usunięcie testów tego zachowania w plikach wymienionych w „Zmieniaj” (wypisz w PR każdy usunięty test i powód). Prompt wprost wymienia pliki `IndicatorPanel.tsx` i `MobileIndicatorBar.tsx`; `AtlasMap.tsx` i `Home.tsx` NIE są zmieniane (propsy panelu zostają).
Zadanie:
1. Nowy `DataMenuWindow` (jeden plik, ok. 120 linii): przycisk „Wybierz dane” (pod napisem nazwa bieżącego wskaźnika i rok; pole ≥ 44 px) otwiera okno na całą wysokość i szerokość ekranu (`100dvh`, bez zaokrągleń, bez cieni, tło `arkusz`). Zawartość: nagłówek „Wybierz dane” + przycisk zamknięcia (≥ 44 px), niżej `DataMenuBody` (szukajka, pod nią działy i grupy). Komputer `layout='columns'`, telefon `layout='stack'`. Zbudowany na `Dialog` z `src/components/ui/dialog.tsx` (Esc zamyka, fokus wraca na przycisk). Wybór wskaźnika: `onSelect(id)` → `view.setIndicator`, okno zamyka się.
2. `IndicatorPanel`: usuń `MyIndicatorsManager`, `useMyIndicators` i listę „Moje wskaźniki”; zamiast `SheetIndicatorPicker`/`DataMenuDialog` jest jeden `DataMenuWindow`. Nazwa bieżącego wskaźnika jest w panelu pokazana jeden raz (w przycisku), nie powtórzona w osobnym nagłówku.
3. `MobileIndicatorBar`: dolny pasek podniesiony o odstęp z tokenu (klasa z `@theme`, ok. 12 px = skala `space`; bez nowych wartości sztywnych) ponad dolną krawędź i `safe-area`; nie zasłania wtedy dolnej krawędzi mapy ani logo/atrybucji; usuń `MyIndicatorsManager` z arkusza. `UnitTooltip` ma odstęp od dolnego paska liczony z tego samego odstępu (nie zasłania paska i nie jest przez niego zasłonięty).
4. Nie usuwaj plików (`IndicatorPicker.tsx`, `useMyIndicators.ts`, `MyIndicatorsBar.tsx` zostają: używa ich Porównaj; sprząta B14). Jeśli po zmianie plik nie ma importera, wypisz go w PR.
Gotowe, gdy:
- Test komponentu: kliknięcie „Wybierz dane” otwiera okno z szukajką i listą działów; wybór wskaźnika woła `onSelect` z id i zamyka okno; Esc zamyka i fokus wraca na przycisk.
- Test komponentu: w `IndicatorPanel` i `MobileIndicatorBar` nie ma tekstu „Moje wskaźniki”, a nazwa bieżącego wskaźnika występuje w panelu dokładnie raz.
- Test e2e (390 i 1280 px): `/mapa` → „Wybierz dane” → okno zajmuje cały ekran (rozmiar okna = rozmiar okna przeglądarki) → wpisz „bezrobocie” → wybierz wynik → adres ma nowe `i`, okno zamknięte, mapa i panel pokazują nowy wskaźnik.
- Test e2e (390 px): dolny pasek wskaźnika leży wyżej niż dotąd (odstęp od dolnej krawędzi okna ≥ odstępu z tokenu), `UnitTooltip` po kliknięciu miejsca nie nachodzi na pasek (prostokąty się nie przecinają).
- Pola dotykowe przycisku otwarcia i zamknięcia ≥ 44 px (test wymiarów).
Nie ruszaj: src/view/map/AtlasMap.tsx, src/view/Home.tsx, src/view/map/hooks/*, src/view/profile/* (profil: B13), src/view/data-menu/DataMenu.tsx i pozostałe pliki menu (tylko używasz), config/*, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Na mapie jest przycisk „Wybierz dane”, który otwiera okno na cały ekran z szukajką i działami (jak dawna Biblioteka). „Moich wskaźników” nie ma na mapie. Dolny pasek na telefonie jest trochę wyżej.
- Co sprawdzić na podglądzie Vercel: `/mapa` na telefonie i komputerze: „Wybierz dane”, wyszukaj „zarobki”, wybierz wskaźnik; na telefonie sprawdź położenie dolnego paska i okienka po kliknięciu miejsca.
- Czego nie zrobiłeś i dlaczego: Profil miejsca zostaje do B13; pliki „Moich wskaźników” zostają, bo używa ich Porównaj.
Tytuł PR zaczyna się od `[W24-C01]`; gałąź `claude/W24-C01` od `origin/main`; nie scalaj.
Prompt podagenta: sekcja 3 w `docs/PLAN-FALE-C.md` z id = C01.
