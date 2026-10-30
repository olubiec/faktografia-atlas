# M05 – Przebudowa O projekcie i Zrodla na bogate strony
Cel: Zamiana krotkich zasilepek na podstronach O projekcie i Zrodla w pelnowartosciowe, redakcyjne karty metodologii i rejestrow publicznych.
Zmieniaj: src/view/pages/About.tsx, src/view/pages/Sources.tsx, src/view/pages/SourcesIndicatorTable.tsx, tests/e2e/editorial-pages.spec.ts
Wymagane: src/view/pages/SourcesIndicatorTable.tsx, tests/e2e/editorial-pages.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md, docs/STYL.md (§4 Logo i znak), docs/ELEMENTY.md (§Dane i zasoby), src/view/pages/About.tsx, src/view/pages/Sources.tsx

Zadanie:
1. W `About.tsx` (opakowanym w `SiteLayout`):
   - Wstaw w naglowku duzy znak `/brand/faktografia-znak-granat.svg` / `-jasny.svg` (wysokosc 128 px, zgodnie z STYL.md §4).
   - Dodaj siatke 1 px „Atlas w liczbach” (16 wojewodztw, 380 powiatow, 2477 gmin, 63 960 zmiennych BDL w font-mono).
   - Dodaj wizualny wzornik „Jak czytac mape” (demonstracja skali sekwencyjnej i dywergentnej).
   - Dodaj sekcje „Pulapki w danych GUS” (bezrobocie rejestrowane vs BAEL, wynagrodzenia bez firm do 9 osob, floty leasingowe samochodow, budzety gmin miejsko-wiejskich).
   - Dodaj deklaracje dostepnosci (Atkinson Hyperlegible, kontrast 13:1, WCAG 2.2).
2. W `Sources.tsx` oraz `SourcesIndicatorTable.tsx` (w `SiteLayout`):
   - Wypisz karty 4 rejestrow z pelna atrybucja wymagana przez ELEMENTY.md: GUS Bank Danych Lokalnych (link do CC BY 4.0), Rejestr TERYT SIMC, GUGiK PRNG (miejscowosci), Granice TopoJSON.
   - W `SourcesIndicatorTable.tsx` wyrenderuj z `config/indicators.json` tabele wszystkich 20 wskaznikow glownych (nazwa, dzial, kod bdlVarId w font-mono, poziom, jednostka oraz przycisk „Otworz na mapie” prowadzacy do `/?i=<id>`).

Gotowe, gdy:
- Test e2e `tests/e2e/editorial-pages.spec.ts` (1440x900 i 360x740) potwierdza, ze na `/o-projekcie` wyswietla sie duzy znak marki >= 120 px, 4 liczniki jednostek i sekcje metodologii; na `/zrodla` obecne sa atrybucje BDL, TERYT SIMC i GUGiK PRNG oraz tabela 20 wskaznikow z linkami do mapy i stopka SiteFooter.
- Test `tests/e2e/home.spec.ts` (skan axe na `/o-projekcie` i `/zrodla`) przechodzi na zielono.

Nie ruszaj: src/view/Home.tsx, src/view/pages/Privacy.tsx, src/view/layout/
