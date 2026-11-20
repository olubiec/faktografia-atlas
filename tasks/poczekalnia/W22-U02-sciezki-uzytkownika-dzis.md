# U02 – Ścieżki użytkownika dziś (punkt odniesienia) i scenariusz testu z ludźmi
Cel: zmierzyć, ile kliknięć i ślepych zaułków ma dziś zwykła osoba, żeby po przebudowie porównać „przed i po”.
Zmieniaj: docs/research/u/U02.md, docs/research/u/U02-test-z-ludzmi.md, docs/research/u/u02/*
Wymagane: docs/research/u/U02.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, docs/PRODUKT.md §2
Zadanie:
1. Zbuduj aplikację (pnpm build, vite preview) i przejdź Playwrightem (skrypt w scratchpadzie, NIE w tests/) 6 zadań na 390×844 i 1280×800:
   a) „Jak wypada moja gmina (np. Wadowice) w bezrobociu?” b) „Która gmina w małopolskim ma najwięcej mieszkańców?” c) „Porównaj powiat krakowski i wielicki” d) „Znajdź jakiekolwiek dane o szkołach” e) „Pokaż zmianę liczby ludności w czasie dla mojego powiatu” f) „Wyślij komuś link do tego, co widzisz”.
2. Dla każdego zadania: liczba kliknięć, czas, ślepe zaułki (kliknięcie bez efektu, powrót), elementy mylące. Do tego zrzuty w docs/research/u/u02/ (JPG, deviceScaleFactor 1, razem do ok. 3 MB).
3. Napisz U02-test-z-ludzmi.md: kartka dla właściciela na 5-minutowy test z 3–5 osobami. Zadania bez podpowiedzi, co notować (gdzie się zgubili, co powiedzieli), tabelka wyników.
Gotowe, gdy:
- U02.md ma tabelę 6 zadań × 2 ekrany z liczbą kliknięć i ślepych zaułków.
- Plik testu z ludźmi mieści się na jednej stronie.
Raport kończy się sekcjami „Rekomendacja” i „Pytania do właściciela” (najwyżej 3, każde z odpowiedziami do wyboru i zaleceniem). Pisz po ludzku: właściciel nie czyta kodu.
Nie ruszaj: plików ekranu (src/view/Home.tsx, src/view/map/AtlasMap.tsx, src/view/profile/ProfileSheet*.tsx, src/view/map/hooks/*), istniejących testów, docs/STAN.md, package.json, pnpm-lock.yaml.
Tytuł PR zaczyna się od `[W22-<id>]`; opis ma „Po ludzku”.
