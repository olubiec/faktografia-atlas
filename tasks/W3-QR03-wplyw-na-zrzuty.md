# QR03 – Które wzorce zrzutów zmieniły się po Q2
Cel: dokładna lista specyfikacji e2e i zrzutów do odświeżenia workflowem Update snapshots, z powodem.
Zmieniaj: docs/research/q2-zrzuty-wplyw.md
Wymagane: docs/research/q2-zrzuty-wplyw.md
Weryfikacja: pnpm lint && pnpm typecheck
Przeczytaj najpierw: docs/PRODUKT.md (sekcje, które dotyczą tematu), docs/STAN.md
Zadanie: Porównaj zmienione pliki PR #506–#523 (git log, git diff) z testami tests/e2e/*.spec.ts używającymi toHaveScreenshot oraz katalogami *-snapshots. Wypisz: spec, zrzut, który PR go zmienia, pewność (pewne/możliwe).
Gotowe, gdy:
- plik raportu istnieje, ma sekcje „Ustalenia”, „Dowody” (ścieżka:linia lub polecenie i wynik), „Rekomendacja” i „Proponowane zadania” (każde: Zmieniaj/Cel/Gotowe, gdy)
- w PR zmieniony jest wyłącznie ten plik (żadnego kodu)
Nie ruszaj: kodu, testów, wzorców zrzutów, docs/STAN.md. Raport po polsku, do 120 linii.
Decyzja 19.11.2026 (właściciel): decyzje podejmuje Claude; raport kończy się jednoznaczną rekomendacją, nie listą opcji.
