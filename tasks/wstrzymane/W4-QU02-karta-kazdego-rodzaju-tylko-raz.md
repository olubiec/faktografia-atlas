# QU02 – Każdy rodzaj karty w zestawie tylko raz
Cel: zestaw stron nie ma dwóch kart tego samego rodzaju (informacje się nie powielają); menu „+ Dodaj stronę” pokazuje już dodane rodzaje jako nieaktywne.
Zmieniaj: src/core/share/deck.ts, src/view/share/AddPageMenu.tsx, tests/unit/deck-unique-kinds.test.ts, tests/unit/add-page-menu-unique.test.tsx
Wymagane: tests/unit/deck-unique-kinds.test.ts, tests/unit/add-page-menu-unique.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/deck.ts, src/view/share/AddPageMenu.tsx, tests/unit (istniejące testy deck i AddPageMenu – nie zmieniać)
Zadanie: Dodaj w deck.ts czystą funkcję `hasKind(deck, kind, options?)` i spraw, by `addPage` nie dodawało drugiej strony tego samego rodzaju (zwraca niezmieniony zestaw). Wyjątek: „Ranking najwyżej” i „Ranking najniżej” to dwa różne rodzaje (różnią się `options.side`) – każdy może być raz. Przekaż do AddPageMenu listę już użytych rodzajów (nowy opcjonalny props `used`); pozycje użyte są wyszarzone, `aria-disabled`, z podpisem „już w zestawie”, a kliknięcie nic nie robi. Jeśli istniejący test deck/AddPageMenu przeczy nowej regule (np. dodaje dwie mapy) – opisz w PR i zatrzymaj się. Okno ShareDialog podłączy QU10 (tu go nie ruszasz).
Gotowe, gdy:
- test: addPage z rodzajem już obecnym zwraca ten sam zestaw
- test: ranking top i ranking bottom mogą współistnieć, drugi top już nie
- test: AddPageList z `used` oznacza pozycje `aria-disabled` i nie woła onPick
- test: po usunięciu strony jej rodzaj znów można dodać
Nie ruszaj: ShareDialog.tsx, ShareControls.tsx, plików kart w src/core/share/card-*.ts.
