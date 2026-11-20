# U08 – Mapa testów i strategia sprzątania
Cel: wiedzieć, które testy odejdą razem z usuwanymi funkcjami, i zaprojektować krótki zestaw testów całych ścieżek jako strażnika przebudowy.
Zmieniaj: docs/research/u/U08.md
Wymagane: docs/research/u/U08.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, tests/e2e/*, tests/unit/*, .github/workflows/* (tylko do czytania), docs/research/u/WYTYCZNE.md, docs/PLAN-UPROSZCZENIE.md §0 (decyzje zatwierdzone)
Zadanie:
1. Dla każdego pliku w tests/e2e i tests/unit: jaką funkcję strony pilnuje i werdykt wg PLAN-UPROSZCZENIE §2 („zostaje / usunąć z funkcją / zmienić”, np. adres / → /mapa).
2. Ile testów i jaki czas CI odpadnie po uproszczeniu.
3. Zaprojektuj 6–8 testów ścieżek (opis kroków i asercji, bez kodu), np. „wejście → Otwórz mapę → wybór danych → gmina → wykres”.
4. Dodaj do strażników testy przekierowań: /rankingi, /biblioteka, /porownaj i /?u=… (decyzje D3 i D4) prowadzą na /mapa z właściwym stanem.
5. Kolejność: najpierw testy ścieżek, potem wycinanie funkcji z jej testami w tym samym PR. Lista zgód do zatwierdzenia przez właściciela jednym podpisem (osobno: testy udostępniania zmienione w U10).
Gotowe, gdy:
- U08.md ma tabelę obejmującą wszystkie pliki z tests/e2e i tests/unit (sprawdź skryptem, że żadnego nie brakuje).
Raport kończy się sekcjami „Rekomendacja” i „Pytania do właściciela” (najwyżej 3, każde z odpowiedziami do wyboru i zaleceniem). Pisz po ludzku: właściciel nie czyta kodu.
Nie ruszaj: plików ekranu (src/view/Home.tsx, src/view/map/AtlasMap.tsx, src/view/profile/ProfileSheet*.tsx, src/view/map/hooks/*), istniejących testów, docs/STAN.md, package.json, pnpm-lock.yaml.
Tytuł PR zaczyna się od `[W22-<id>]`; opis ma „Po ludzku”.
