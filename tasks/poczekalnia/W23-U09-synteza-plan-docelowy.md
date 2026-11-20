# U09 – Synteza badań i krótki plan docelowy
Cel: z raportów U00–U08 zrobić jeden krótki plan docelowy z decyzjami dla właściciela i werdyktem dla każdego starego zadania.
Zmieniaj: docs/PLAN-DOCELOWY.md
Wymagane: docs/PLAN-DOCELOWY.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, docs/research/u/*, tasks/poczekalnia/*, tasks/wstrzymane/*, docs/research/u/WYTYCZNE.md, docs/PLAN-UPROSZCZENIE.md §0 (decyzje zatwierdzone)
Zadanie (start dopiero po scaleniu U01–U08):
1. Docelowy wygląd każdego ekranu (najwyżej 1 strona na ekran, szkic ASCII jak w PRODUKT.md §3).
2. Decyzje dla właściciela: najwyżej 8 pytań, każde z rekomendacją i 2–3 odpowiedziami.
3. Werdykt dla każdego pliku w tasks/poczekalnia i tasks/wstrzymane: zostaje / zmienić / skreślić, z jednym zdaniem dlaczego.
4. Plan budowy (etap B): lista zadań z plikami „Zmieniaj”, kolejnością, falami i efektem widocznym na stronie. Cel: najwyżej 15 sesji. Decyzje D1–D9 z PLAN-UPROSZCZENIE §0 są zatwierdzone: nie pytaj o nie ponownie. Uwzględnij wyniki U10 (ukrycie udostępniania) i U11 (kolejność pobierania danych przez robota).
Gotowe, gdy:
- PLAN-DOCELOWY.md ma 4 sekcje z zadania, a liczba sesji etapu B jest podana jedną liczbą.
Nie ruszaj: plików zadań (przenosi je właściciel albo następna sesja po decyzjach), kodu, testów.
Tytuł PR zaczyna się od `[W23-U09]`; opis ma „Po ludzku”.
