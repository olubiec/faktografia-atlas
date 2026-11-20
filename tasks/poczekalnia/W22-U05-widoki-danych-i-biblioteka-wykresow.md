# U05 – Mapa / Wykres / Tabela / Ranking i wybór jednej biblioteki wykresów
Cel: wybrać jedną prostą bibliotekę wykresów i zaprojektować przełącznik 4 widoków tych samych danych.
Zmieniaj: docs/research/u/U05.md, src/view/test/proto/widoki.tsx
Wymagane: docs/research/u/U05.md
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, docs/research/qu/QU05*.md, docs/research/qu/QU26*.md (jeśli jest), docs/ELEMENTY.md, src/view/profile/TrendChart.tsx, src/view/ranking/*, docs/research/u/WYTYCZNE.md, docs/PLAN-UPROSZCZENIE.md §0 (decyzje zatwierdzone)
Zadanie:
1. Porównaj: Observable Plot, visx, uPlot, Recharts, Apache ECharts i własny SVG. Kryteria: rozmiar po kompresji, licencja, data ostatniego wydania, pobrania tygodniowo (sprawdź w rejestrze npm), działanie dotykiem, dostępność (klawiatura, czytnik), kolory z tokenów, tryb ciemny. Bez instalacji pakietów w tym zadaniu.
2. Zaprojektuj 4 widoki dla jednego wskaźnika: mapa (jest), wykres (lata dla wybranego miejsca i Polski lub rozkład), tabela (sortowanie, szukaj), ranking (słupki). Opisz też, co pokazuje każdy przy dwóch wskaźnikach.
3. Model adresu: ?v=mapa|wykres|tabela|ranking, z zachowaniem i, rok, poziom i wybranego miejsca.
4. Prototyp pod /__test/proto/widoki na istniejącym kodzie (TrendChart, RankingBars, prosta tabela), bez nowych pakietów. Przełącznik 4 widoków na danych jednego wskaźnika.
Gotowe, gdy:
- U05.md ma tabelę porównawczą 6 opcji ze źródłami (linki do npm i repozytorium) i jedną rekomendację.
- Prototyp przełącza 4 widoki pod /__test/proto/widoki na podglądzie.
Raport kończy się sekcjami „Rekomendacja” i „Pytania do właściciela” (najwyżej 3, każde z odpowiedziami do wyboru i zaleceniem). Pisz po ludzku: właściciel nie czyta kodu.
Nie ruszaj: src/App.tsx, plików ekranu (src/view/Home.tsx, src/view/map/AtlasMap.tsx, src/view/profile/ProfileSheet*.tsx, src/view/map/hooks/*), istniejących testów, docs/STAN.md, package.json, pnpm-lock.yaml.
Tytuł PR zaczyna się od `[W22-<id>]`; opis ma „Po ludzku”.
