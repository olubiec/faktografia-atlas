# M07 – Objasnienia wskaznikow explanations.json i czystosc profilu
Cel: Dodanie pliku objasnien dla 20 wskaznikow glownych (odblokowanie ikon (?) i definicji GUS) oraz naprawa pol dotykowych i stylow w profilu.
Zmieniaj: public/data/explanations.json, src/view/profile/ProfileOverview.tsx, src/view/profile/ProfileIndicatorRow.tsx, src/view/explain/ContextBlock.tsx, src/view/profile/ProfileParts.tsx, tests/unit/explanations-data.test.ts, tests/unit/context-block.test.tsx
Wymagane: public/data/explanations.json, tests/unit/explanations-data.test.ts, tests/unit/context-block.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md, docs/STYL.md (§3, §7, §12), src/view/profile/ProfileOverview.tsx, src/view/explain/ContextBlock.tsx

Zadanie:
1. Utworz `public/data/explanations.json` dla wszystkich 20 wskaznikow z `config/indicators.json` (pola `short` <= 160 zn., `howToRead` <= 240 zn., `definitionUrl` prowadzacy do hasla w Slowniku Pojec GUS / metadanych BDL).
2. W `ProfileOverview.tsx` i `ProfileIndicatorRow.tsx`: usun tag `<style>` z `!important`, dodaj `min-h-[44px]` na przycisku rozwijania i linkach „Definicja GUS”, usun kropki `•` miedzy metadanymi.
3. W `ContextBlock.tsx`: usun klasy `rounded-full`, `rounded-xs`, `shadow-xs` oraz nieistniejaca `text-3xs`; znacznik pozycji na osi zrob jako techniczny kwadrat lub kreske z tokenow.
4. W `ProfileParts.tsx`: popraw naglowek „Obszar wiejski” na 360 px, by nie lamal sie asymetrycznie wzgledem sasiednich kolumn.

Gotowe, gdy:
- Test jednostkowy `tests/unit/explanations-data.test.ts` potwierdza poprawnosc schematu JSON dla wszystkich 20 wskaznikow i limity dlugosci tekstu.
- Test jednostkowy `tests/unit/context-block.test.tsx` potwierdza poprawne renderowanie bez klas rounded/shadow i bez bledow axe.
- W profilu i panelu wskaznika rozwiniety wiersz wyswietla definicje i link „Definicja GUS”.

Nie ruszaj: src/view/profile/ProfileSheet.tsx, src/view/profile/ProfileSheetMobile.tsx, src/core/profile/
