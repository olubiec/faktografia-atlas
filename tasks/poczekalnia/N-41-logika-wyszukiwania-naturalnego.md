# N-41 – Logika wyszukiwania naturalnego: rozpoznanie wskaźnika, poziomu, roku i miejsca (koncept 8, KONCEPTY-ROZWOJU.md)
Cel: Czysta funkcja, która z wpisanego tekstu („bezrobocie krakow 2020”, „gęstość gminy małopolskie”) rozpoznaje wskaźnik, poziom, rok i jednostkę – na słowniku synonimów w kodzie, bez AI i bez usług zewnętrznych. Wynik ma kształt zgodny z `UrlState` (`i`, `l`, `y`, `u`), żeby później wyszukiwarka mogła ustawić widok tym samym stanem co ręczny wybór. Bez UI.
Zmieniaj: src/core/search/intent.ts, src/core/search/intent-synonyms.ts, tests/unit/search-intent.test.ts
Wymagane: src/core/search/intent.ts, src/core/search/intent-synonyms.ts, tests/unit/search-intent.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/search/normalize.ts (usuwanie polskich znaków i wielkości liter – użyj, nie pisz drugiej), src/core/search/index.ts, src/core/url/state.ts (`UrlState`), config/indicators.json (id, nazwy, `minLevel`), src/core/units/types.ts, tests/fixtures/context-test-units.json (jednostki do testu; jeśli brak Krakowa – użyj jednostki z fixture i opisz w PR)

Zadanie:
1. `intent-synonyms.ts`: mapa fraz → id wskaźnika (co najmniej po 2 frazy dla 20 wskaźników z `config/indicators.json`, np. „bezrobocie”, „bez pracy” → `unemployment-rate`; „gestosc”, „zaludnienie” → `density`; „lasy”, „lesistosc” → `forest-cover`) oraz poziomu („wojewodztwa” → `woj`, „powiaty” → `pow`, „gminy” → `gmi`). Frazy zapisane już w postaci po `normalize`. Test pilnuje, że każde id z mapy istnieje w `config/indicators.json`.
2. `intent.ts`: `parseIntent(text, { units, indicators })` → `{ i?: string; l?: 'woj'|'pow'|'gmi'; y?: number; u?: string; notes: string[] } | null`. Rok: liczba 4-cyfrowa 1995–2100. Jednostka: najdłuższe dopasowanie nazwy z `units` po `normalize` (bez prefiksów „powiat”, „gmina”); przy kilku równych dopasowaniach – brak `u` i notka „kilka miejsc o tej nazwie”. Poziom poniżej `minLevel` wskaźnika → poziom pominięty i notka „GUS podaje te dane tylko do powiatów”. Brak rozpoznanego wskaźnika → `null` (wyszukiwarka działa jak dziś).
3. Kody TERYT jako string. Komentarze po polsku. Pliki ≤ 200 linii.

Gotowe, gdy:
- Test: „Bezrobocie KRAKÓW 2020” i „bezrobocie krakow 2020” dają ten sam wynik z `i: 'unemployment-rate'`, `y: 2020` i TERYT jednostki z fixture.
- Test: „gęstość gminy” dla wskaźnika z `minLevel` = `pow` zwraca `l` pusty i notkę o powiatach; dla wskaźnika z `minLevel` = `gmi` zwraca `l: 'gmi'`.
- Test: „Wałcz” (sama nazwa, bez wskaźnika) → `null`; nazwa pasująca do dwóch jednostek → brak `u` i notka.
- Test: każde id w `intent-synonyms.ts` istnieje w `config/indicators.json`, a każdy z 20 wskaźników ma co najmniej 2 frazy.
- Istniejące testy wyszukiwarki zielone bez zmian; `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.

Nie rób: zmian w `src/view/search/*` i plikach ekranu, w `normalize.ts`, `index.ts`, `state.ts`, `config/indicators.json`; bez wywołań sieci, modeli AI i nowych pakietów (np. bibliotek NLP).
