# P06 – Skroty klawiszowe i dostepnosc
Cel: Wzbogacenie interfejsu mapy i profilu o pelna obsluge skrotow klawiszowych (a11y).
Zmieniaj: src/view/hooks/useKeyboardNavigation.ts, src/view/Home.tsx, tests/unit/keyboard-nav.test.ts
Wymagane: src/view/hooks/useKeyboardNavigation.ts, tests/unit/keyboard-nav.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md, docs/STYL.md

Zadanie:
1. Utworz `src/view/hooks/useKeyboardNavigation.ts`: obslugujacy globalne skroty klawiaturowe:
   - `+` / `-`: przyblizenie i oddalenie mapy (przez zdarzenia kamery / zoom),
   - `Escape`: zamkniecie otwartego profilu jednostki lub okna dialogowego,
   - `Alt+1` / `Alt+2` / `Alt+3`: szybka zmiana szczebla administracyjnego (woj / pow / gmi).
2. Podepnij hook w `src/view/Home.tsx`.
3. Utworz test `tests/unit/keyboard-nav.test.ts` weryfikujacy poprawne reagowanie na zdarzenia klawiatury.

Gotowe, gdy:
- Test `tests/unit/keyboard-nav.test.ts` przechodzi na zielono.
- Skroty dzialaja poprawnie i sa ignorowane, gdy fokus jest w polu wyszukiwania (`input`).
