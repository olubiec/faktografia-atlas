# S11 – IndexNow: powiadamianie wyszukiwarek o zmienionych stronach
Fala pliku: W25 (SEO). Fala budowy: S-4.
Cel: Po wdrożeniu produkcji Bing (i wyszukiwarki partnerskie IndexNow) dostają listę **tylko tych** adresów, których `lastmod` w mapie strony się zmienił. Google nie obsługuje IndexNow – dla niego wystarcza mapa strony.
Zmieniaj: scripts/seo/indexnow.mjs, src/core/seo/sitemap-diff.ts, public/<klucz>.txt, .github/workflows/seo-indexnow.yml, tests/unit/s11-sitemap-diff.test.ts
Wymagane: tests/unit/s11-sitemap-diff.test.ts
Zgoda właściciela: nowy workflow w `.github/workflows/` – dana przez start tej fali. Klucz IndexNow jest publiczny z założenia (leży w pliku na stronie); generujesz losowe 32 znaki szesnastkowe.
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: https://www.indexnow.org/documentation, docs/SEO.md §5, istniejące workflow (wzorzec uprawnień)
Zadanie:
1. `sitemap-diff.ts`: `changedUrls(oldXml, newXml)` → adresy nowe lub ze zmienionym `lastmod` (usunięte pomija).
2. `indexnow.mjs`: pobiera stary indeks mapy strony z produkcji **przed** wdrożeniem – zapisany jako artefakt poprzedniego przebiegu workflow; porównuje z nowym; POST do `https://api.indexnow.org/indexnow` w paczkach ≤ 10 000; brak zmian → nic nie wysyła; błąd sieci → ostrzeżenie, nie błąd.
3. Workflow: `deployment_status` = success dla środowiska Production; `permissions: contents: read`.
Gotowe, gdy:
- Testy: zmiana `lastmod` 3 adresów → dokładnie te 3; nowy adres → jest; identyczne pliki → pusta lista; 25 000 adresów → 3 paczki.
- Plik klucza w `dist/` po budowie.
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku: gdy robot GUS doda nowe dane, Bing i inne wyszukiwarki dowiadują się o tym od razu i tylko o zmienionych stronach (bez „spamowania”). Nic do sprawdzania na ekranie.
Tytuł PR zaczyna się od `[W25-S11]`; gałąź `claude/W25-S11` od `origin/main`; nie scalaj.
