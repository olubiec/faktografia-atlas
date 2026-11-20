# P05 – Eksport kart wysokiej rozdzielczosci
Cel: Obsluga generowania kart udostepniania w podwojonej rozdzielczosci (Retina 2x) dla mediow spolecznosciowych.
Zmieniaj: src/core/share/card.ts, src/core/share/formats.ts, tests/unit/share-retina.test.ts
Wymagane: tests/unit/share-retina.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§4b), docs/ARCHITEKTURA.md (W1.12, W1.14)

Zadanie:
1. Rozszerz `src/core/share/formats.ts` i `card.ts` o obsluge mnoznika pikseli `scale: 1 | 2` przy zachowaniu matematycznych proporcji `safe area`.
2. Utworz `tests/unit/share-retina.test.ts` weryfikujacy poprawnosc pozycjonowania elementow przy podwojonym DPI.

Gotowe, gdy:
- Test `tests/unit/share-retina.test.ts` przechodzi na zielono.
- Elementy graficzne i tekst zachowuja idealne proporcje wzgledem tokenow.
