# N-43 – Sitemapa z generatora i test zgodności (AUDYT-SEO.md, P2-3)
Cel: `public/sitemap.xml` przestaje być pisany ręcznie. Skrypt generuje go z tras w `src/App.tsx` (i opcjonalnie z jednostek w `public/data/units.json`), a test w CI pilnuje, że plik na dysku jest dokładnie wynikiem generatora. Jednostki są przygotowane, ale domyślnie WYŁĄCZONE do decyzji D-SEO-1 (canonical dla `?u=`). Bez zmian w `package.json` i w workflow.
Zmieniaj: scripts/seo/sitemap.mjs, public/sitemap.xml, tests/unit/sitemap-build.test.ts
Wymagane: scripts/seo/sitemap.mjs, tests/unit/sitemap-build.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: tests/unit/meta.test.ts (`publicRoutes()` i test „sitemap zawiera każdą publiczną trasę…” – NIE zmieniaj go, nowy plik musi go dalej spełniać), src/App.tsx (trasy), scripts/geo/units.mjs (format `units.json`), tasks/poczekalnia/AUDYT-SEO.md (P1-4, P2-3)

Zadanie:
1. `scripts/seo/sitemap.mjs` (ESM, bez nowych pakietów, komentarze po polsku, ≤ 200 linii) eksportuje czyste funkcje:
   - `readPublicRoutes(appSource)` → lista tras z `<Route path="…">` z pominięciem parametrów (`:`), `*`, `/__test…` i `/design` – ta sama reguła co `publicRoutes()` w `meta.test.ts`; kolejność jak w pliku.
   - `unitUrls(units, { levels })` → `['/?u=<teryt>', …]` tylko dla podanych poziomów (`'woj' | 'pow' | 'gmi'`), posortowane po TERYT (string, bez zamiany na liczbę).
   - `buildSitemap({ domain, routes, unitPaths = [] })` → string XML: nagłówek `<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`, po jednym `<url><loc>…</loc></url>` w linii z dwiema spacjami wcięcia, znak nowej linii na końcu. `&` w adresie escapowany jako `&amp;` (wymóg XML). Bez `lastmod` (wynik musi być deterministyczny, niezależny od daty). Deduplikacja adresów.
   - Stałe: `DOMAIN = 'https://faktografia.eu'`, `INCLUDE_UNITS = false` z komentarzem: „włączyć dopiero po decyzji D-SEO-1 (canonical z ?u=) – patrz AUDYT-SEO.md P1-4”.
   - Uruchomienie `node scripts/seo/sitemap.mjs` (gdy plik jest wywołany bezpośrednio) zapisuje `public/sitemap.xml`; z `--check` nic nie zapisuje i kończy kodem 1, jeśli plik różni się od wyniku.
2. Wygeneruj `public/sitemap.xml` skryptem (bez jednostek). Zbiór `<loc>` musi być identyczny z obecnym (9 tras); dopuszczalna jest tylko zmiana białych znaków.
3. `tests/unit/sitemap-build.test.ts` – testy na `src/App.tsx` z repo i na fixture jednostek (`tests/fixtures/` – użyj istniejącego nagrania z jednostkami; jeśli nie ma pasującego, zbuduj tablicę 3–4 obiektów w teście z prawdziwymi TERYT, np. `"02"`, `"0201"`, `"0201011"`).

Gotowe, gdy:
- Test: plik `public/sitemap.xml` na dysku === `buildSitemap({ domain: DOMAIN, routes: readPublicRoutes(<src/App.tsx>) })` (test zgodności – dodanie trasy w `App.tsx` bez regeneracji sitemapy daje czerwony test z komunikatem „uruchom node scripts/seo/sitemap.mjs”).
- Test: `readPublicRoutes` na fragmencie z `/biblioteka/:id`, `/__test/ui`, `/design`, `*` zwraca tylko trasy publiczne, w kolejności źródła.
- Test: `unitUrls(units, { levels: ['woj','pow'] })` pomija gminy, zachowuje wiodące zero (`/?u=02`), jest posortowane; `buildSitemap` z `unitPaths` zawiera `<loc>https://faktografia.eu/?u=0201</loc>`, a adres z `&` daje `&amp;` (XML przechodzi `new DOMParser()`/regex bez surowego `&`).
- Test: wynik `buildSitemap` jest deterministyczny (dwa wywołania = identyczny string), bez duplikatów `<loc>`, kończy się `</urlset>\n`.
- Test: `INCLUDE_UNITS === false` i plik na dysku nie zawiera `?u=`.
- Istniejący `tests/unit/meta.test.ts` przechodzi bez zmian.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.

Nie rób: zmian w `package.json` (bez nowego skryptu `pnpm sitemap` i bez `prebuild` – generator uruchamia się ręcznie, a test pilnuje zgodności), w `.github/workflows/`, `vercel.json`, `robots.txt`, `index.html`, `src/view/*`, `tests/unit/meta.test.ts`; bez włączania jednostek do sitemapy; bez `lastmod`/`changefreq`/`priority` (Google je ignoruje lub wymagają prawdziwej daty zmiany); bez nowych pakietów; bez pobierania czegokolwiek z sieci (lista zmiennych biblioteki z gałęzi `data` – osobne zadanie).
