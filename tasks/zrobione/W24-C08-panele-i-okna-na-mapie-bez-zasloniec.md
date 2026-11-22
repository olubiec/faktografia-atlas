# C08 – Panele i okna na mapie na wspólnych modułach, bez zasłaniania i powtórzeń
Fala pliku: W24 (etap C). Fala budowy: 3 z 4. Zależy od: C01, C03, C04. Równolegle z: C05, C06, C07.
ZAKRES WSTĘPNY: listę poprawek wpisze Claude po C03 (sekcja „Wniosek”).
Cel: Panel wskaźnika, okienko miejsca, arkusz profilu, „Cofnij” i okruszki mają stałe położenia z jednego miejsca i nie zasłaniają się nawzajem na telefonie ani na komputerze.
Zmieniaj: src/view/main/IndicatorPanel.tsx, src/view/main/UnitTooltip.tsx, src/view/main/LevelSwitch.tsx, src/view/ui/BottomSheet.tsx, src/view/map/BackButton.tsx, src/view/map/Breadcrumbs.tsx, src/view/map/sheetInset.ts, tests/unit/c08-map-layout.test.tsx, tests/e2e/c08-map-layout.spec.ts
Wymagane: tests/unit/c08-map-layout.test.tsx, tests/e2e/c08-map-layout.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/STYL.md (§5 Układ: arkusze, profil po prawej 400–440 px, dolny arkusz 40%/90%), docs/research/c/C03-audyt-ukladu.md (Zasłanianie), docs/research/q2-telefon-390.md, src/view/map/sheetInset.ts
Zadanie:
1. Dla każdej pary „co zasłania co” z tabeli C03 ustal jedno stałe położenie (strefy: góra = nagłówek i okruszki, dół = pasek wskaźnika, prawa strona = profil na komputerze) i wyraź je klasami/zmiennymi z C04, nie wartościami sztywnymi.
2. `UnitTooltip`, `BackButton`, `Breadcrumbs`, `LevelSwitch`: pozycje wyliczone z tych samych stref (np. okienko miejsca nad paskiem wskaźnika, „Cofnij” poza profilem); powtórzone informacje usuń zgodnie z C03 (jedna nazwa miejsca i jeden wskaźnik w widoku).
3. `BottomSheet` (profil na telefonie): `sheetInset` uwzględnia nowy odstęp paska; arkusz 40%/90% bez nachodzenia na atrybucję i pasek; wspólny nagłówek i zamknięcie z `Window`/C04 tam, gdzie C03 to wskazał.
4. Plików ekranu `AtlasMap.tsx`, `Home.tsx`, `src/view/profile/ProfileSheet*.tsx`, `src/view/map/hooks/*` NIE zmieniasz; potrzebna zmiana w nich → zatrzymaj się i opisz w PR, jaka.
Gotowe, gdy:
- Test e2e (360, 390, 768, 1024, 1280 px) na `/mapa`: w stanach „bez wyboru”, „wybrana gmina”, „profil otwarty”, „okno Wybierz dane”: prostokąty elementów fixed/absolute (pasek wskaźnika, okienko miejsca, arkusz profilu, „Cofnij”, okruszki, atrybucja mapy) nie przecinają się; wszystkie mieszczą się w oknie przeglądarki.
- Test komponentu: każde położenie pochodzi z klasy/zmiennej strefy (brak `bottom-16`, `left-3` itp. wpisanych w `UnitTooltip`).
- Test: nazwa wybranej jednostki i nazwa wskaźnika występują w widoku po jednym razie (poza zakładką profilu).
- Istniejące testy panelu, profilu i kamery zielone bez zmian.
Nie ruszaj: src/view/map/AtlasMap.tsx, src/view/Home.tsx, src/view/map/hooks/*, src/view/profile/* (B13), src/view/Header.tsx (C05), config/*, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Okienka, panele i przyciski na mapie mają stałe miejsca i nie zasłaniają się; nie powtarza się ta sama nazwa w kilku miejscach.
- Co sprawdzić na podglądzie Vercel: `/mapa` na telefonie (też wąskim): kliknij gminę, otwórz profil, „Wybierz dane”, „Cofnij”; na komputerze: panel i profil po prawej.
- Czego nie zrobiłeś i dlaczego: Nie ruszałem samej mapy ani profilu (profil: B13).
Tytuł PR zaczyna się od `[W24-C08]`; gałąź `claude/W24-C08` od `origin/main`; nie scalaj.
Prompt podagenta: sekcja 3 w `docs/PLAN-FALE-C.md` z id = C08.
