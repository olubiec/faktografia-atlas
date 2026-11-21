# P01 – Objasnienia wskaznikow GUS
Cel: Dostarczenie prostych, zrozumialych definicji i zrodel dla 20 wskaznikow GUS.
Zmieniaj: public/data/explanations.json, src/view/explain/ContextBlock.tsx, tests/unit/explanations-data.test.ts
Wymagane: public/data/explanations.json, tests/unit/explanations-data.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§4), docs/ARCHITEKTURA.md (W1.9)

Zadanie:
1. Utworz `public/data/explanations.json`: zawierajacy syntetyczne objasnienia wlasnymi slowami dla wszystkich 20 wskaznikow z `config/indicators.json`. Kazdy wpis zawiera:
   - `short`: proste objasnienie (<= 160 znakow),
   - `howToRead`: jak interpretowac liczbe (<= 240 znakow),
   - `definitionUrl`: link do definicji GUS (https://stat.gov.pl/...).
2. Zaktualizuj `src/view/explain/ContextBlock.tsx`: aby wczytywal i wyswietlal powyzsze objasnienia w profilu jednostki z linkiem do definicji GUS.
3. Utworz `tests/unit/explanations-data.test.ts`: testujacy schemat, kompletne pokrycie 20 wskaznikow oraz limity znakow.

Gotowe, gdy:
- Testy `tests/unit/explanations-data.test.ts` przechodza na zielono.
- Profil jednostki prezentuje objasnienia wybranego wskaznika.
