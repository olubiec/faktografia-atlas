# QU01 – Badanie: dlaczego przełączanie stron w „Pobierz i udostępnij” szwankuje po dodaniu kart
Cel: raport z odtworzeniem błędu i dokładną przyczyną (bez zmiany kodu strony).
Zmieniaj: docs/research/q2-udostepnianie-przelaczanie.md
Wymagane: docs/research/q2-udostepnianie-przelaczanie.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: src/view/share/ShareDialog.tsx, src/view/share/ShareControls.tsx, src/view/share/DeckStrip.tsx, src/view/share/AddPageMenu.tsx, src/core/share/deck.ts, src/core/share/deck-page-data.ts
Zadanie: Zgłoszenie właściciela 19.11: „gdy dodam dodatkowe karty, przełączanie między stronami w oknie Pobierz i udostępnij szwankuje”. Odtwórz w Playwright (390 px i 1280 px): otwórz okno z mapy, profilu, porównania i rankingów; dodaj po kolei każdy rodzaj strony z „+ Dodaj stronę” (Mapa, Ranking najwyżej/najniżej, Tabela, Duża liczba, Wykres lat, Rozkład, Profil, Porównanie, A vs B); klikaj kafelki w pasku, ‹ ›, ×, przełącznik rodzaju w ShareControls. Dla każdej akcji zapisz: co użytkownik widzi, czego się spodziewał, dlaczego. Hipotezy do sprawdzenia: (1) `availableKinds` w ShareDialog zna tylko map/ranking/profile/compare/versus, więc strony table/bignumber/trend/histogram spadają na `availableKinds[0]` i podgląd pokazuje inną kartę niż kafelek; (2) `onSelectKind` w ShareControls nadpisuje rodzaj bieżącej strony (powstają duplikaty); (3) `dataForPage` i `activeCardData` nie liczą się z opcjami strony (side). Wynik: tabela „akcja → objaw → przyczyna (plik:linia)”, lista duplikatów treści, propozycja naprawy z podziałem na pliki (dla QU10) oraz screenshoty w opisie PR.
Gotowe, gdy:
- raport ma tabelę dla każdego z 10 rodzajów stron (co pokazuje podgląd po wybraniu kafelka)
- raport wskazuje przyczynę z numerem linii dla każdej hipotezy (potwierdzona / obalona)
- raport kończy się listą zadań naprawczych z plikami
