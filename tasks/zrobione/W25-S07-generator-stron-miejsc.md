# S07 – Generator statycznych stron miejsc i mapy strony
Fala pliku: W25 (SEO). Fala budowy: S-2. Zależy od: S01–S06.
Cel: `pnpm build` tworzy lekką stronę HTML dla każdego miejsca (czytelną bez JavaScriptu, z przyciskiem „Otwórz na mapie”) oraz `sitemap.xml` z adresami, które mają być w Google.
Zmieniaj: scripts/seo/build-pages.mjs, src/core/seo/html.ts, src/core/seo/page-template.ts, src/core/seo/sitemap.ts, config/seo.json, package.json, public/sitemap.xml, tests/unit/s07-html.test.ts, tests/unit/s07-sitemap.test.ts
Wymagane: tests/unit/s07-html.test.ts, tests/unit/s07-sitemap.test.ts
Zgoda właściciela: zmiana `package.json` (tylko skrypt `build`: dopisanie `&& node scripts/seo/build-pages.mjs`), nowy `config/seo.json`, usunięcie `public/sitemap.xml` z S01 (zastępuje go generator). Bez nowych pakietów.
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/SEO.md (D4, D6, D7), src/core/seo/* (S03–S06), src/core/share/csv.ts (jak liczymy i formatujemy), public/theme-init.js, docs/STYL.md
Zadanie:
1. `html.ts`: `escapeHtml` (`& < > " '`), `escapeAttr`; **każda** wartość z danych przechodzi przez nie.
2. `page-template.ts`: `renderUnitPage(model, assets)` → pełny dokument: `<html lang="pl">`, tytuł, opis, kanoniczny adres, `og:*` (obrazek z S03), `robots` = `noindex,follow` gdy `indexable` false, JSON-LD `Place` (nazwa, `containedInPlace`, współrzędne z `centroid`) i `BreadcrumbList` przez `serializeLd` (S04); treść: okruszki, H1, `lead`, tabela (`<table>` z `<caption>` i `<th scope>`), przycisk-link „Otwórz na mapie” → `/mapa?u=<teryt>&l=<poziom>` (≥ 44 px), linki powiązane, w gminie lista miejscowości z `public/data/localities.json` (same nazwy, najwyżej 150, bez osobnych stron – D3), stopka „Źródło: GUS, Bank Danych Lokalnych, CC BY 4.0 · dane z <data>”. Style: klasy Tailwind z tokenami (pliki `src/core/seo/*.ts` są skanowane przez Tailwind), dołączony zbudowany CSS z `dist/assets/*.css`, `theme-init.js`. **Bez** głównego skryptu aplikacji i bez WebGL.
3. `sitemap.ts`: `buildSitemaps(pages, staticPaths)` → indeks `sitemap.xml` + `sitemap-strony.xml`, `sitemap-wojewodztwa-powiaty.xml`, `sitemap-gminy.xml`; tylko `indexable`; `lastmod` = data danych; ≤ 50 000 adresów na plik.
4. `config/seo.json`: `{"indexGminy":false}` (D7). Przy `false` strony gmin powstają, ale mają `noindex,follow` i nie trafiają do mapy strony.
5. `build-pages.mjs`: czyta `dist/`, `public/data/units.json`, `profiles/*.json`, `localities.json`; moduły TS uruchamia przez Vite (`createServer` + `ssrLoadModule`) albo `node --experimental-strip-types` – bez nowych pakietów; zapisuje `dist/<adres>/index.html`; wypisuje liczbę stron indeksowanych i nieindeksowanych; czas budowy dopisuje do PR.
Gotowe, gdy:
- Test: nazwa `<img src=x onerror=alert(1)>` w modelu nie pojawia się w HTML jako znacznik.
- Test: strona z fixture ma 1 `<h1>`, kanoniczny adres = jej adres, JSON-LD parsuje się `JSON.parse`, link „Otwórz na mapie” z poprawnym TERYT, brak `<script type="module"`.
- Test: `indexable:false` → meta robots noindex i brak w mapie strony; `indexGminy:false` → `sitemap-gminy.xml` pusty lub nieobecny w indeksie.
- Test: mapa strony to poprawny XML, adresy absolutne `https://faktografia.eu`.
- e2e `@S25`: po `pnpm build` + `vite preview`: `/powiat/krakowski` zwraca 200 z H1 bez JavaScriptu (`javaScriptEnabled: false`); kliknięcie „Otwórz na mapie” otwiera mapę z zaznaczonym powiatem (`window.__atlas`).
- Rozmiar strony gminy ≤ 80 KB (bez kompresji) – sprawdzane w skrypcie, błąd przerywa budowę.
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku (do opisu PR):
- Co zrobiłeś: każde województwo, powiat i miasto ma swoją stronę z liczbami GUS, którą Google i czatboty mogą przeczytać. Gminy też mają strony, ale na razie są ukryte przed Google (włączymy po kilku tygodniach).
- Co sprawdzić: na podglądzie `/wojewodztwo/malopolskie`, `/powiat/krakowski`, `/miasto/krakow`, `/gmina/wieliczka` na telefonie; przycisk „Otwórz na mapie”.
- Czego nie zrobiłeś: linków do tych stron z mapy (S09).
Tytuł PR zaczyna się od `[W25-S07]`; gałąź `claude/W25-S07` od `origin/main`; nie scalaj.
