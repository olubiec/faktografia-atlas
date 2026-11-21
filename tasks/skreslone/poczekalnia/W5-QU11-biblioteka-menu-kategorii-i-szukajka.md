# QU11 – Biblioteka: pełne menu kategorii + wyszukiwanie zamiast długiej listy
Cel: /biblioteka startuje od menu kategorii i wyszukiwarki; lista wyników pojawia się dopiero po wyborze.
Zmieniaj: src/view/pages/Library.tsx, src/view/library/CategoryMenu.tsx, src/view/library/CategoryTiles.tsx, tests/unit/library-category-menu.test.tsx
Wymagane: tests/unit/library-category-menu.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/research/q2-biblioteka-menu-kategorii.md (z QU06), src/view/pages/Library.tsx
Zadanie: Wg raportu QU06: CategoryMenu z pełnym drzewem działów (liczby wskaźników, pobrane wyróżnione), okruszki, wejście → lista; pasek wyszukiwania nad menu; stan w adresie (`?k=&q=`); Library.tsx ma zejść poniżej 200 linii (wydziel komponenty). Pola dotykowe 44 px, tokeny.
Gotowe, gdy:
- test: start bez zapytania nie renderuje listy wyników
- test: wybór działu pokazuje jego wskaźniki i okruszek
- test: wpisanie tekstu filtruje niezależnie od menu
- test: DOM na starcie ≤ 1000 elementów
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Zależy od: QU06, decyzji właściciela w sprawie #531 (podpowiedzi) i QU03 (układ).
Tytuł PR zaczyna się od `[W5-QU11]`; opis ma „Po ludzku”.
