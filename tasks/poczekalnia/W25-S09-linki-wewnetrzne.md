# S09 – Linki do stron miejsc z mapy, ze strony startowej i ze stopki
Fala pliku: W25 (SEO). Fala budowy: S-2 (po S07).
Cel: Google i ludzie trafiają na strony miejsc z każdego miejsca serwisu: profil na mapie ma link „Strona miejsca”, stopka ma link „Miejsca” (spis 16 województw), a `/mapa?u=<teryt>` wskazuje stronę miejsca jako adres kanoniczny.
Zmieniaj: src/view/profile/ProfileOverview.tsx, src/view/layout/SiteLayout.tsx, src/view/Home.tsx, src/core/seo/unit-link.ts, scripts/seo/build-pages.mjs, tests/unit/s09-unit-link.test.ts, tests/e2e/s09-links.spec.ts
Wymagane: tests/unit/s09-unit-link.test.ts, tests/e2e/s09-links.spec.ts
Zgoda właściciela: zmiana ekranów `Home.tsx` (tylko meta: kanoniczny adres) i `ProfileOverview.tsx` (jeden link w stopce profilu) oraz 7. link w stopce (D9, PRODUKT §3.1 mówi „ok. 6”) – dana przez start tej fali.
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md („Błędy powtarzalne” – stan z `useMainView`/`useMapSelection`), src/view/profile/ProfileOverview.tsx, src/view/layout/SiteLayout.tsx, src/core/seo/slug.ts
Zadanie:
1. `unit-link.ts`: `unitPagePath(teryt)` z tabeli adresów S05 – tabela generowana do `public/data/seo-paths.json` przez `build-pages.mjs` i wczytywana **leniwie** dopiero po otwarciu profilu (nie importuj pliku danych do kodu).
2. Profil: link „Strona miejsca →” obok „Kopiuj link” (≥ 44 px, styl istniejących linków).
3. `build-pages.mjs`: strona `/miejsca` – 16 województw z listą powiatów i miast (statyczna, indeksowana). Stopka: link „Miejsca” → `/miejsca`.
4. `Home.tsx`: przy `u` w adresie PageMeta z kanonicznym adresem strony miejsca; bez `u` – `/mapa`.
Gotowe, gdy:
- Test: `unitPagePath` dla 1261 i 1261011 = `/miasto/krakow`; nieznany TERYT → `null` (link się nie pokazuje).
- e2e `@S25`: otwarcie profilu powiatu na mapie → link „Strona miejsca” prowadzi do strony z tym samym H1; `/mapa?u=12` ma `link[rel=canonical]` = `https://faktografia.eu/wojewodztwo/malopolskie`; stopka ma link do `/miejsca`; na wejściu `/mapa` brak żądania `seo-paths.json` (próg PRODUKT §7).
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku: z profilu na mapie można przejść na stronę miejsca, a ze stopki do spisu wszystkich województw i powiatów. Sprawdź na telefonie: profil → „Strona miejsca”.
Tytuł PR zaczyna się od `[W25-S09]`; gałąź `claude/W25-S09` od `origin/main`; nie scalaj.
