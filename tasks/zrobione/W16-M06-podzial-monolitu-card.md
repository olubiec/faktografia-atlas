# M06 – Podzial monolitu card.ts na moduly ponizej 200 linii
Cel: Rozbicie 909-liniowego src/core/share/card.ts na czytelne moduly kart ponizej 200 linii oraz sprzatanie highlight.ts.
Zmieniaj: src/core/share/card.ts, src/core/share/card-map.ts, src/core/share/card-ranking.ts, src/core/share/card-profile.ts, src/core/share/card-compare.ts, src/core/profile/highlight.ts, tests/unit/highlight.test.ts, tests/unit/share-card.test.ts
Wymagane: src/core/share/card-map.ts, src/core/share/card-ranking.ts, src/core/share/card-profile.ts, src/core/share/card-compare.ts, tests/unit/share-card.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/card.ts, tests/unit/share-card.test.ts

Zadanie:
1. Wydziel generowanie scen poszczegolnych kart z `card.ts` do:
   - `src/core/share/card-map.ts` (karta mapy),
   - `src/core/share/card-ranking.ts` (karta rankingu),
   - `src/core/share/card-profile.ts` (karta profilu),
   - `src/core/share/card-compare.ts` (karta porownania).
2. W `src/core/share/card.ts` zachowaj publiczna funkcje `cardScene` delegujaca do modulow. Kazdy plik <= 200 linii kodu.
3. Usun zbedny `highlight.ts` i `highlight.test.ts` (sprzatanie W3.1).

Gotowe, gdy:
- Test jednostkowy `tests/unit/share-card.test.ts` przechodzi dla wszystkich 32 kombinacji (4 rodzaje kart x 4 formaty x 2 motywy).
- Kazdy plik w `src/core/share/` ma <= 200 linii.

Nie ruszaj: src/core/share/formats.ts, src/core/share/csv.ts, src/view/share/
