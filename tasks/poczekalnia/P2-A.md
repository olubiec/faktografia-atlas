# P2-A – Meta, SEO, manifest, robots, sitemap
Cel: Link wklejony do komunikatora ma tytuł, opis i grafikę; roboty mają robots.txt i sitemapę. Domena: https://faktografia.eu
Zmieniaj: index.html, src/view/layout/PageMeta.tsx, public/robots.txt, public/sitemap.xml, public/site.webmanifest, tests/unit/meta.test.ts
Wymagane: tests/unit/meta.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, index.html, src/view/layout/PageMeta.tsx, public/brand/

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P2-A`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P2-A] Meta, SEO, manifest, robots, sitemap`, `git push -u origin task/P2-A`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
1. index.html: meta description (po polsku, 1–2 zdania o atlasie danych GUS), canonical https://faktografia.eu/, og:title/description/type/url/locale=pl_PL/image, twitter:card=summary_large_image, theme-color, link rel=manifest, ikony.
   Grafiki WYŁĄCZNIE z istniejących plików w public/brand/. Jeśli brak PNG do og:image lub ikon 192/512, nie generuj ich, wpisz w raporcie czego brakuje.
2. PageMeta: domyślny opis i canonical = https://faktografia.eu + location.pathname.
3. robots.txt: Allow: /, Disallow: /__test/, Sitemap: https://faktografia.eu/sitemap.xml. sitemap.xml: statyczne trasy publiczne z src/App.tsx (bez /__test/ i /design).
4. site.webmanifest: name „Faktografia Atlas”, lang pl, display standalone, ikony tylko istniejące.

## Gotowe, gdy
- test czyta index.html i sprawdza wszystkie tagi z punktu 1
- test: sitemap zawiera każdą publiczną trasę i żadnej z „__test”
- test: każdy plik wskazany jako ikona/obraz istnieje na dysku

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
