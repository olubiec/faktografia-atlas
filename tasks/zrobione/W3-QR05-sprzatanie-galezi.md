# QR05 – Inwentarz gałęzi i kopii roboczych do usunięcia
Cel: lista gałęzi claude/* i worktrees, które można bezpiecznie usunąć (scalone), i tych, których nie wolno.
Zmieniaj: docs/research/q2-sprzatanie.md
Wymagane: docs/research/q2-sprzatanie.md
Weryfikacja: pnpm lint && pnpm typecheck
Przeczytaj najpierw: docs/PRODUKT.md (sekcje, które dotyczą tematu), docs/STAN.md
Zadanie: Wylistuj gałęzie zdalne claude/* (mcp github list_branches) i dla każdej: czy jej PR jest scalony, czy ma niescalone commity (git cherry). NIE usuwaj niczego; podaj gotowe polecenia dla właściciela.
Gotowe, gdy:
- plik raportu istnieje, ma sekcje „Ustalenia”, „Dowody” (ścieżka:linia lub polecenie i wynik), „Rekomendacja” i „Proponowane zadania” (każde: Zmieniaj/Cel/Gotowe, gdy)
- w PR zmieniony jest wyłącznie ten plik (żadnego kodu)
Nie ruszaj: kodu, testów, wzorców zrzutów, docs/STAN.md. Raport po polsku, do 120 linii.
Decyzja 19.11.2026 (właściciel): decyzje podejmuje Claude; raport kończy się jednoznaczną rekomendacją, nie listą opcji.
