# S16 – Strażnik treści: po wdrożeniu i raz na dobę sprawdza, czy produkcja nie zawiera niczego obcego
Cel: automat wykrywa obce skrypty, ukryte linki, przekierowania i przypadkowy `noindex` na stronach produkcji i zgłasza problem jako Issue z etykietą `seo-alert`, zanim zauważy go Google.
Zmieniaj: src/core/seo/content-guard.ts, scripts/seo/content-guard.mjs, .github/workflows/seo-live-check.yml, tests/unit/w35-s16-content-guard.test.ts
Wymagane: tests/unit/w35-s16-content-guard.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/SEO-AUTOMAT.md (§3–§4), src/core/seo/audit.ts (wzorzec błędów), src/core/seo/site.ts, vercel.json (CSP – tylko do czytania), index.html, `dist/` po `pnpm build` (lista obcych hostów w linkach)

Zadanie (zadanie wprost zezwala na nowy workflow):
1. `content-guard.ts`: czysta funkcja `guardHtml(html, { allowedHosts })` → lista problemów `{ code, detail }`: `external-script` (src spoza `allowedHosts`), `iframe`, `meta-refresh`, `inline-event-handler` (atrybuty `on…=`), `hidden-text` (`display:none`, `visibility:hidden`, `font-size:0`, pozycja poza ekranem – tylko gdy element zawiera `<a>` lub tekst > 20 znaków), `foreign-link` (link wychodzący do hosta spoza `allowedHosts`), `eval-like` (`eval(`, `atob(` w skrypcie inline poza zestawem znanym z `index.html`), `noindex-on-indexable` (strona z mapy strony ma `noindex` w meta lub nagłówku). Lista dozwolonych hostów jest stałą w pliku: zbuduj ją z faktycznych hostów w linkach strony po `pnpm build`, nie zgaduj; każdy host z komentarzem po co.
2. `content-guard.mjs`: tryby `--dir dist` (przeszukuje zbudowane `*.html`) i `--live https://faktografia.eu` (pobiera `robots.txt`, `sitemap.xml`, wszystkie wymienione mapy, potem do 200 stron z mapy + wszystkie rankingi, deterministycznie; sprawdza kod 200 dla robots i mapy, obecność `Sitemap:` w robots). Wyjście: lista problemów; kod 1, gdy są problemy. Błąd sieci = `::warning::` i kod 0 (nie robi fałszywych alarmów).
3. `seo-live-check.yml`: `deployment_status` (Production, success), `schedule` raz na dobę, `workflow_dispatch`; `permissions: contents: read, issues: write`; przy problemach tworzy lub aktualizuje jedno otwarte zgłoszenie „SEO – alarm” z etykietą `seo-alert` (nie mnoży duplikatów), przy braku problemów zamyka je z komentarzem.

Gotowe, gdy:
- Test: czysty HTML strony miejsca z fixtury (`tests/fixtures`) daje zero problemów.
- Test: każdy z kodów problemu ma HTML wywołujący go (obcy skrypt, iframe, meta refresh, `onclick`, ukryty link, obcy link, `eval`, `noindex` na stronie z mapy) i nic poza nim.
- Test: tryb `--live` z zamockowanym `fetch`: 404 na `robots.txt` = problem; błąd sieci = ostrzeżenie i kod 0.
- Test: lista `allowedHosts` zawiera wszystkie hosty linków wychodzących w stronach z fixtur (strażnik nie odrzuca własnych stron).
Nie ruszaj: `src/core/seo/audit.ts`, `vercel.json`, `index.html`, istniejących testów, pozostałych workflows, `package.json`.
Po scaleniu (właściciel): uruchom workflow ręcznie raz; zgłoszenie `seo-alert` ma być nieobecne.
Tytuł PR zaczyna się od `[W35-S16]`; opis ma „Po ludzku”.
