# QR07 – Pomiar: liczba elementów DOM i rozmiar po Q2
Cel: liczby: elementy DOM na /biblioteka z 1773 pozycjami, czas wejścia, rozmiar available.json po gzip, czy potrzeba wirtualizacji.
Zmieniaj: docs/research/q2-wydajnosc-biblioteki.md
Wymagane: docs/research/q2-wydajnosc-biblioteki.md
Weryfikacja: pnpm lint && pnpm typecheck
Przeczytaj najpierw: docs/PRODUKT.md (sekcje, które dotyczą tematu), docs/STAN.md
Zadanie: Zmierz Playwrightem na podglądzie lokalnym z fixture’ami (nie z sieci): document.querySelectorAll('*').length na /biblioteka, /porownaj, /rankingi; czas do interaktywności; rozmiar plików. Rekomendacja: wirtualizacja tak/nie (PLAN-POPRAWEK zakłada: nie, wyniki ≤ 50).
Gotowe, gdy:
- plik raportu istnieje, ma sekcje „Ustalenia”, „Dowody” (ścieżka:linia lub polecenie i wynik), „Rekomendacja” i „Proponowane zadania” (każde: Zmieniaj/Cel/Gotowe, gdy)
- w PR zmieniony jest wyłącznie ten plik (żadnego kodu)
Nie ruszaj: kodu, testów, wzorców zrzutów, docs/STAN.md. Raport po polsku, do 120 linii.
Decyzja 19.11.2026 (właściciel): decyzje podejmuje Claude; raport kończy się jednoznaczną rekomendacją, nie listą opcji.
