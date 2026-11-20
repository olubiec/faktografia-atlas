# U10 – Ukryj „Pobierz i udostępnij” (tymczasowo)
Cel: na stronie nie ma żadnego przycisku „Pobierz i udostępnij”. Kod okna zostaje, żeby można go było włączyć jedną zmianą.
Zmieniaj: src/core/share/share-flag.ts, src/view/share/ShareBar.tsx, src/view/main/IndicatorPanel.tsx, src/view/main/MobileIndicatorBar.tsx, src/view/profile/ProfileCompare.tsx, src/view/profile/ProfileOverview.tsx, tests/unit/u10-share-hidden.test.ts, tests/e2e/u10-share-hidden.spec.ts, oraz istniejące testy udostępniania wymienione niżej (tylko jak w pkt 4)
Wymagane: tests/unit/u10-share-hidden.test.ts, tests/e2e/u10-share-hidden.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (§3), AGENTS.md, tasks/wstrzymane/README.md
Decyzja właściciela (20.11): „na razie wycofać Pobierz i udostępnij”. Przycisk znika z całej strony; „Kopiuj link” zostaje.
Zadanie:
1. Jeden przełącznik w src/core/share/share-flag.ts: `isShareEnabled()`; domyślnie false. Włącza go tylko adres z `?share=1` (do testów i ewentualnego powrotu).
2. Wszystkie miejsca z napisem „Pobierz i udostępnij” (ShareBar, IndicatorPanel, MobileIndicatorBar, ProfileCompare, ProfileOverview) pokazują przycisk tylko przy `isShareEnabled()`. Strony Porównaj i Rankingi (CompareShare, RankingsShare) korzystają z ShareBar, więc nie wymagają zmiany.
3. Okno ShareDialog i src/core/share nie są usuwane ani zmieniane poza przełącznikiem.
4. Zgoda właściciela na istniejące testy udostępniania (unit: share-bar, rankings-share, compare-page-share, profile-compare-versus, share-deck-wiring, share-versus-data, indicator-panel-*; e2e: s19-share, share-dialog, share-profile, share-map, q2-share-deck, share-compare, bottom-sheet-scroll, a11y-matrix): wolno zmienić WYŁĄCZNIE sposób włączenia przycisku (`?share=1` w adresie lub wywołanie przełącznika w teście). Asercji nie zmieniasz, testów nie pomijasz. Jeśli któryś test wymaga czegoś więcej, zatrzymaj się i opisz w PR.
Gotowe, gdy:
- Test e2e (390 i 1280 px): na mapie, w profilu miejsca, na Porównaj i na Rankingach nie ma przycisku „Pobierz i udostępnij”, a „Kopiuj link” jest.
- Test e2e: z `?share=1` przycisk wraca i otwiera okno.
- Test jednostkowy przełącznika: domyślnie false, z `?share=1` true.
- Wszystkie dotychczasowe testy udostępniania przechodzą po zmianie z pkt 4.
Nie ruszaj: src/App.tsx, Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx, hooków mapy, docs/STAN.md, package.json, pnpm-lock.yaml.
Zrzuty: jeśli zmieniły się wzorce, napisz w PR, że trzeba uruchomić „Update snapshots”.
Tytuł PR zaczyna się od `[W22-U10]`; opis ma „Po ludzku”.
