# S08 – Strażnik jakości SEO w budowie
Fala pliku: W25 (SEO). Fala budowy: S-2 (po S07).
Cel: Budowa przerywa się, gdy wygenerowane strony mają błędy, które obniżają widoczność: powtórzone tytuły lub opisy, brak H1, zły adres kanoniczny, martwe linki wewnętrzne, strona bez danych w mapie strony.
Zmieniaj: src/core/seo/audit.ts, scripts/seo/build-pages.mjs, tests/unit/s08-seo-audit.test.ts
Wymagane: tests/unit/s08-seo-audit.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/seo/* (S05–S07), docs/SEO.md §5
Zadanie:
1. `auditPages(pages, sitemapUrls)` → lista błędów i ostrzeżeń: duplikat tytułu lub opisu (błąd), tytuł > 65 lub opis poza 70–160 znaków (ostrzeżenie), ≠ 1 H1 (błąd), kanoniczny ≠ własny adres (błąd), link wewnętrzny do nieistniejącego adresu (błąd), adres w mapie strony z `noindex` lub nieistniejący (błąd), strona `indexable` bez linku przychodzącego z innej strony (ostrzeżenie), `undefined`/`NaN` w tekście (błąd).
2. `build-pages.mjs` wywołuje audyt; błąd → kod wyjścia 1 i lista w logu; ostrzeżenia → podsumowanie.
Gotowe, gdy:
- Testy: dla każdego rodzaju błędu przypadek, który go wykrywa, i przypadek poprawny; komplet stron z fixture S06 przechodzi bez błędów.
- `pnpm build` na pełnych danych przechodzi; liczba ostrzeżeń wpisana w PR.
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku: automat sprawdza przy każdej zmianie, czy strony miejsc nie mają błędów, za które Google obniża pozycje. Nic nie zmienia się na ekranie.
Tytuł PR zaczyna się od `[W25-S08]`; gałąź `claude/W25-S08` od `origin/main`; nie scalaj.
