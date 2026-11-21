# QR02 – Audyt telefonu 390 px nowych ekranów Q2
Cel: lista usterek układu na szerokości 390 px: Biblioteka (kafelki), Porównaj (×, wiersze z biblioteki), okno udostępniania (pasek stron, menu Dodaj stronę).
Zmieniaj: docs/research/q2-telefon-390.md
Wymagane: docs/research/q2-telefon-390.md
Weryfikacja: pnpm lint && pnpm typecheck
Przeczytaj najpierw: docs/PRODUKT.md (sekcje, które dotyczą tematu), docs/STAN.md
Zadanie: Uruchom podgląd lokalnie (pnpm build && pnpm preview) i Playwrightem (chromium z /opt/pw-browsers) zrób zrzuty 390x844 (nie commituj ich; opisz je słowami). Sprawdź: napisy wychodzące poza pola, pola dotykowe < 44 px, przewijanie poziome.
Gotowe, gdy:
- plik raportu istnieje, ma sekcje „Ustalenia”, „Dowody” (ścieżka:linia lub polecenie i wynik), „Rekomendacja” i „Proponowane zadania” (każde: Zmieniaj/Cel/Gotowe, gdy)
- w PR zmieniony jest wyłącznie ten plik (żadnego kodu)
Nie ruszaj: kodu, testów, wzorców zrzutów, docs/STAN.md. Raport po polsku, do 120 linii.
Decyzja 19.11.2026 (właściciel): decyzje podejmuje Claude; raport kończy się jednoznaczną rekomendacją, nie listą opcji.
