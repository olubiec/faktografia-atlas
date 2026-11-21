# QR01 – Audyt zasady „na start tylko podstawowe”
Cel: lista miejsc, gdzie ekran na starcie pokazuje więcej niż podstawowe dane (Profil, Porównaj, Rankingi, Biblioteka, panel mapy, okno udostępniania) wraz z poprawką dla każdego.
Zmieniaj: docs/research/q2-podstawowe-na-start.md
Wymagane: docs/research/q2-podstawowe-na-start.md
Weryfikacja: pnpm lint && pnpm typecheck
Przeczytaj najpierw: docs/PRODUKT.md (sekcje, które dotyczą tematu), docs/STAN.md
Zadanie: Przejrzyj PRODUKT §4a i §4f oraz kod ekranów (src/view/profile, pages, compare, ranking, library, share). Dla każdego miejsca: co jest pokazane na starcie, co powinno (7 wskaźników podstawowych / pusty stan), jak dodać i usunąć resztę.
Gotowe, gdy:
- plik raportu istnieje, ma sekcje „Ustalenia”, „Dowody” (ścieżka:linia lub polecenie i wynik), „Rekomendacja” i „Proponowane zadania” (każde: Zmieniaj/Cel/Gotowe, gdy)
- w PR zmieniony jest wyłącznie ten plik (żadnego kodu)
Nie ruszaj: kodu, testów, wzorców zrzutów, docs/STAN.md. Raport po polsku, do 120 linii.
Decyzja 19.11.2026 (właściciel): decyzje podejmuje Claude; raport kończy się jednoznaczną rekomendacją, nie listą opcji.
