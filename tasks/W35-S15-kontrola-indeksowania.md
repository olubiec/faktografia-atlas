# S15 – Raport tygodniowy sprawdza po kolei całą mapę strony, nie wciąż te same 40 adresów
Cel: tygodniowy raport z Search Console pokazuje stan indeksowania wszystkich stron z mapy strony (obracana próbka), liczy udział zaindeksowanych i podnosi czerwoną flagę przy spadku.
Zmieniaj: src/core/seo/gsc-sample.ts, scripts/seo/gsc-report.mjs, tests/unit/w35-s15-gsc-sample.test.ts
Wymagane: tests/unit/w35-s15-gsc-sample.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/SEO-AUTOMAT.md (§3, §7), docs/SEO.md (§8), scripts/seo/gsc-report.mjs, src/core/seo/gsc-report.ts (tylko do czytania), tests/unit/s12-gsc-report.test.ts (tylko do czytania), zgłoszenia „SEO – tydzień” (znacznik `gsc-state` w treści)

Zadanie:
1. `gsc-sample.ts`: czyste funkcje `pickSample(urls, previousCursor, size)` – deterministyczny wybór kolejnych `size` adresów z listy posortowanej alfabetycznie, od kursora z poprzedniego tygodnia, z zawinięciem na początek; zwraca `{ sample, cursor }`. `mergeCoverage(previous, current)` – udział zaindeksowanych liczony z ostatniego znanego stanu każdego adresu (znacznik stanu w zgłoszeniu: mapa adres → stan, skrócona, żeby zmieścić się w limicie treści zgłoszenia).
2. `gsc-report.mjs`: zamiast stałych 40 adresów używa `pickSample` (wielkość próbki 150; limit dobowy URL Inspection to 2000 na właściwość) i kursora odczytanego z poprzedniego zgłoszenia. Zachowaj dotychczasowy kształt znacznika `gsc-state` (pola `indexedShare`, `sampleSize`), dopisz `cursor` i `coverage`.
3. Czerwona flaga „Co wymaga działania”: udział zaindeksowanych spadł o więcej niż 20 punktów procentowych względem poprzedniego tygodnia przy obu odczytach ≥ 100 adresów (progi z docs/SEO.md §8).
4. Pierwszy tydzień bez poprzedniego stanu: kursor od zera, brak flagi spadku.

Gotowe, gdy:
- Test: `pickSample` na 396 adresach w 3 kolejnych wywołaniach po 150 obejmuje wszystkie adresy bez powtórzeń do zawinięcia; po zawinięciu zaczyna od początku.
- Test: `mergeCoverage` zachowuje stan adresów spoza bieżącej próbki i nadpisuje te z próbki.
- Test: spadek o > 20 pp przy próbkach ≥ 100 daje flagę; spadek o 10 pp albo próbka < 100 nie.
- Test: brak poprzedniego stanu = brak flagi, kursor 0.
Nie ruszaj: `src/core/seo/gsc-report.ts`, `tests/unit/s12-gsc-report.test.ts`, `scripts/seo/gsc-client.mjs`, `scripts/seo/gsc-topics.mjs`, workflows.
Jeśli dotychczasowy format znacznika `gsc-state` wymusza zmianę istniejącego testu S12 – opisz w PR i zatrzymaj się.
Tytuł PR zaczyna się od `[W35-S15]`; opis ma „Po ludzku”.
