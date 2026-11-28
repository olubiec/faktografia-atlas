# S14 – Po każdym wdrożeniu produkcji mapa strony sama trafia do Google i widzimy jej status
Cel: po udanym wdrożeniu na produkcję robot wysyła `https://faktografia.eu/sitemap.xml` do Search Console i zapisuje w podsumowaniu przebiegu status mapy (pobrana, błędy, ostrzeżenia, liczba adresów).
Zmieniaj: scripts/seo/gsc-client.mjs, scripts/seo/gsc-submit-sitemap.mjs, .github/workflows/seo-sitemap-submit.yml, tests/unit/w35-s14-gsc-submit-sitemap.test.ts
Wymagane: tests/unit/w35-s14-gsc-submit-sitemap.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/SEO-AUTOMAT.md (§3–§5), scripts/seo/gsc-client.mjs, scripts/seo/gsc-report.mjs (jak czyta sekret i obsługuje brak), .github/workflows/seo-weekly.yml (wzór workflow), .github/workflows/seo-indexnow.yml (wyzwalacz po wdrożeniu)

Zadanie (zadanie wprost zezwala na zmiany w `.github/workflows/` i `scripts/seo/gsc-client.mjs`):
1. `gsc-client.mjs`: funkcja pobierająca token przyjmuje zakres jako argument; domyślnie `webmasters.readonly` (dotychczasowe wywołania bez zmian). Dodaj eksport `SCOPE_WRITE = 'https://www.googleapis.com/auth/webmasters'`. Funkcja `api` przyjmuje metodę (`PUT` bez ciała). Nie zmieniaj zachowania istniejących wywołań.
2. `gsc-submit-sitemap.mjs`: token z zakresem zapisu → `PUT {WM}/sitemaps/{encodeURIComponent(sitemapUrl)}` → `GET` tej samej mapy → wypisz status: `isPending`, `lastDownloaded`, `errors`, `warnings`, liczba adresów z `contents`. Zapisz też do `$GITHUB_STEP_SUMMARY`, jeśli zmienna istnieje. Mapa strony = `SITE_URL` z `src/core/seo/site.ts` + `/sitemap.xml`. Dodatkowo wyślij pliki z indeksu (`sitemap-*.xml`) – te z `sitemapLocs`.
3. Błędy: brak sekretu → komunikat, kod 0 (jak `loadAccount`). HTTP 403 przy `PUT` = konto usługi ma tylko odczyt → `::warning::` z instrukcją „dodaj konto usługi jako użytkownika z uprawnieniem Pełny (docs/SEO-AUTOMAT.md §5)”, kod 0. Żaden komunikat nie zawiera treści sekretu.
4. `seo-sitemap-submit.yml`: wyzwalacze `deployment_status` (tylko `state == 'success'` i środowisko `Production`) oraz `workflow_dispatch`; `permissions: contents: read`; sekret tylko w `env` kroku skryptu; `concurrency`; wzór reszty z `seo-weekly.yml`.

Gotowe, gdy:
- Test: dla `PUT` na zakresie zapisu skrypt wywołuje właściwy adres (z zakodowanym adresem mapy) i metodę `PUT`; odczyt statusu mapuje pola odpowiedzi na wiersz podsumowania (zamockowane `fetch`, nagrane odpowiedzi w teście).
- Test: odpowiedź 403 daje ostrzeżenie z instrukcją i kod wyjścia 0.
- Test: brak sekretu = komunikat i kod 0; żaden wypisany tekst nie zawiera fragmentu klucza.
- Test: istniejące wywołania `gsc-client` bez nowego argumentu nadal proszą o `webmasters.readonly`.
Nie ruszaj: istniejących testów (w tym `s12-gsc-report.test.ts`), `scripts/seo/gsc-report.mjs`, `scripts/seo/indexnow.mjs`, pozostałych workflows, `package.json`.
Po scaleniu (właściciel): dodaj konto usługi w Search Console jako użytkownika „Pełny”; uruchom workflow ręcznie.
Tytuł PR zaczyna się od `[W35-S14]`; opis ma „Po ludzku”.
