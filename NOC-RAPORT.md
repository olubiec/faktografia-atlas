
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

## [T-EDGE] Testy przypadków brzegowych (N-40/41/42)
- Dodano tests/unit/story-edge.test.ts, search-intent-edge.test.ts, embed-edge.test.ts (puste dane, null, polskie znaki, bardzo długie wejście, złośliwe parametry URL).
- Błędów w src/core nie ujawniły – kodu nie zmieniano. Uwaga projektowa: bez indeksu jednostek `readEmbedParams` przepuszcza `u` jako surowy tekst; jest bezpieczny, bo trafia tylko do kodowanego URL-a i escapowanego atrybutu.
- Istniejące testy bez zmian.

## [N-49] Podwójny canonical – ZATRZYMANE (bez zmian w kodzie)
- Usunięcie canonical/`og:url` z `index.html` wywróciłoby istniejące testy `tests/unit/meta.test.ts:51-52` i `:58` (wymagają ich w index.html), a `Home` (`/`) nie używa `PageMeta` i jest plikiem ekranu – po usunięciu `/` zostałby bez canonical. Potrzebna decyzja: zmiana tych 2 testów + wymienienie `src/view/Home.tsx` w zadaniu.

## [N-50] PNG og:image i ikony
- Dodano scripts/brand/make-png.mjs (Playwright/Chromium z projektu, bez nowych pakietów; tło `arkusz` z config/tokens.json, logo wyłącznie z public/brand/). Uruchomienie: `node scripts/brand/make-png.mjs`.
- Wynik w public/brand/: faktografia-og-1200x630.png (1200×630), faktografia-icon-192.png (192×192), faktografia-icon-512.png (512×512). Wymiary sprawdzone (`file`), obrazy obejrzane. Nazwy zgodne z DECYZJE-WLASCICIELA pkt 5 (nie „og-image.png”).
- Wpisy w docs/ELEMENTY.md (zasoby pochodne logo). index.html i PageMeta NIE ruszane.
- Do zmiany przez drugiego agenta: index.html:18 (i odpowiednik w PageMeta):
  `<meta property="og:image" content="https://faktografia.eu/brand/faktografia-logo-granat.svg" />`
  → `content="https://faktografia.eu/brand/faktografia-og-1200x630.png"`; dodać `og:image:width`=1200, `og:image:height`=630, `og:image:alt`, `og:image:type`=image/png oraz `twitter:image` z tym samym adresem (jeśli twitter:image wskazuje SVG – też zmienić).
- Ikony do public/site.webmanifest: `/brand/faktografia-icon-192.png` (192x192) i `/brand/faktografia-icon-512.png` (512x512), type image/png.
- Uwaga: PNG nie niesie manifestu C2PA z SVG.
