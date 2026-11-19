# QR04 – Zdrowie main po Q2: pełne testy lokalnie
Cel: pełna lista czerwonych testów (jednostkowych i e2e bez zrzutów) na main po #523, z przyczyną każdego.
Zmieniaj: docs/research/q2-zdrowie-main.md
Wymagane: docs/research/q2-zdrowie-main.md
Weryfikacja: pnpm lint && pnpm typecheck
Przeczytaj najpierw: docs/PRODUKT.md (sekcje, które dotyczą tematu), docs/STAN.md
Zadanie: Na czystym checkoucie origin/main uruchom pnpm install, pnpm lint, typecheck, test, build oraz pnpm test:e2e z --trace off (zrzuty pomiń: wskaż, które padają tylko na zrzutach). Sprawdź też CI main (mcp github actions_list). Dla każdej awarii: plik, przyczyna, propozycja poprawki.
Gotowe, gdy:
- plik raportu istnieje, ma sekcje „Ustalenia”, „Dowody” (ścieżka:linia lub polecenie i wynik), „Rekomendacja” i „Proponowane zadania” (każde: Zmieniaj/Cel/Gotowe, gdy)
- w PR zmieniony jest wyłącznie ten plik (żadnego kodu)
Nie ruszaj: kodu, testów, wzorców zrzutów, docs/STAN.md. Raport po polsku, do 120 linii.
Decyzja 19.11.2026 (właściciel): decyzje podejmuje Claude; raport kończy się jednoznaczną rekomendacją, nie listą opcji.
