# S10 – Statyczne strony rankingów wskaźników
Fala pliku: W25 (SEO). Fala budowy: S-3 (po S08).
Cel: Dla każdego z 20 wskaźników istnieją strony „ranking województw / powiatów / gmin” oraz „ranking gmin w województwie”, odpowiadające na zapytania typu „najbardziej zalesione gminy”, „powiaty z najniższym bezrobociem 2025”.
Zmieniaj: src/core/seo/ranking-page.ts, src/core/seo/page-template.ts, src/core/seo/slug.ts, scripts/seo/build-pages.mjs, tests/unit/s10-ranking-page.test.ts
Wymagane: tests/unit/s10-ranking-page.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/SEO.md §2, src/core/ranking/, public/data/values/<id>.json (kształt), public/data/explanations.json, src/core/seo/* 
Zadanie:
1. Adresy: `/ranking/<slug wskaźnika>/wojewodztwa|powiaty|gminy` (60) i `/ranking/<slug>/gminy/<slug województwa>` (320); slug wskaźnika ze `slugify(nazwa)` bez jednostki (np. `lesistosc`), test unikalności.
2. Treść: H1 „Lesistość gmin w Polsce – ranking 2025”, zdanie wprowadzające ze stałego szablonu (najwyżej, najniżej, mediana – liczby z danych), `short` i `howToRead` z explanations.json (jeśli są), link do definicji GUS, tabela (miejsce, nazwa → link do strony miejsca, wartość); przy rankingu krajowym gmin: 100 najwyżej + 100 najniżej + linki do 16 rankingów wojewódzkich; przycisk „Zobacz na mapie” → `/mapa?i=<id>&l=<poziom>`. JSON-LD `Dataset` (jeden wskaźnik, rok) + `BreadcrumbList`.
3. Rankingi gmin podlegają `indexGminy` (D7). Strony w mapie strony (`sitemap-rankingi.xml`) i w spisie `/miejsca` (sekcja „Rankingi”). Audyt S08 obejmuje nowe strony.
Gotowe, gdy:
- Test: 380 unikalnych adresów; tytuły unikalne; tabela posortowana zgodnie z kierunkiem wskaźnika (`neutral`/wyżej-lepiej z config).
- Test: zdanie wprowadzające podaje te same wartości co pierwsze i ostatnie miejsce w tabeli.
- `pnpm build` przechodzi z audytem; strona rankingu gmin ≤ 120 KB.
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku: powstają strony „ranking gmin/powiatów” dla każdego wskaźnika – to na nie najczęściej trafia się z Google. Sprawdź `/ranking/lesistosc/powiaty` na telefonie.
Tytuł PR zaczyna się od `[W25-S10]`; gałąź `claude/W25-S10` od `origin/main`; nie scalaj.
