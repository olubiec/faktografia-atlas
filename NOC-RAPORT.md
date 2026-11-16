
## [N-40] Logika „Największe zmiany”
- Dodano src/core/story/changes.ts (computeChanges, shareBelow) i change-sentence.ts (changeSentence).
- Testy: tests/unit/story-changes.test.ts, story-change-sentence.test.ts; fixture tests/fixtures/story/density-sample.json (wycięty z prawdziwego values/density.json, 3 lata, woj + powiaty 02/12/14) – dopisany do „Zmieniaj”.
- lint, typecheck, build zielone; pnpm test: wszystko zielone poza cudzym, niezacommitowanym tests/unit/search-intent.test.ts (nie mój).
- Brak usuniętych plików względem origin/main. Bez nowych pakietów, bez zmian UI/configów/snapshotów.

## [N-43] Sitemapa z generatora
- Dodano scripts/seo/sitemap.mjs (readPublicRoutes, unitUrls, buildSitemap, DOMAIN, INCLUDE_UNITS=false; `--check`).
- Test zgodności i jednostkowe: tests/unit/sitemap-build.test.ts (plik na dysku === wynik generatora).
- public/sitemap.xml bez zmian treści (9 tras, identyczny zestaw <loc>; diff pusty).
- lint, typecheck, test (1081), build zielone. meta.test.ts bez zmian.
- Brak usuniętych plików względem origin/main; bez zmian package.json/workflow/configów.
- Uwaga: w teście import .mjs z `@ts-expect-error` (brak typów modułu).
