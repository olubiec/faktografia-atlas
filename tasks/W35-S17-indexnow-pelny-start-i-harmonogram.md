# S17 – IndexNow wysyła do Binga pełną listę na starcie i działa też według harmonogramu
Cel: Bing i wyszukiwarki partnerskie dostają przy pierwszym przebiegu wszystkie adresy z mapy strony, a potem zmienione adresy po wdrożeniu lub raz na dobę, nawet gdy wyzwalacz Vercel nie zadziała.
Zmieniaj: scripts/seo/indexnow.mjs, src/core/seo/sitemap-diff.ts, .github/workflows/seo-indexnow.yml, tests/unit/w35-s17-indexnow-start.test.ts
Wymagane: tests/unit/w35-s17-indexnow-start.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/SEO-AUTOMAT.md (§3), scripts/seo/indexnow.mjs, src/core/seo/sitemap-diff.ts, .github/workflows/seo-indexnow.yml, istniejący test sitemap-diff (jeśli jest – tylko do czytania)

Stan wyjściowy (sprawdzone 28.11.2026): workflow `seo-indexnow.yml` nie ma żadnego przebiegu, a gdy brak poprzedniej migawki, skrypt zapisuje stan bazowy i **nic nie wysyła**.

Zadanie (zadanie wprost zezwala na zmianę tego workflow):
1. `sitemap-diff.ts`: dodaj `allUrls(xml)` – wszystkie adresy z mapy strony (po sklejeniu plików), bez duplikatów; istniejące eksporty bez zmian.
2. `indexnow.mjs`: gdy `oldXml === null` (pierwszy przebieg) wyślij `allUrls(newXml)` zamiast „nic”; przestrzegaj `batches` (limit paczki IndexNow). Przed wysyłką sprawdź, że `{SITE_URL}/{key}.txt` zwraca dokładnie klucz; jeśli nie – `::warning::` z adresem i nic nie wysyłaj. Na końcu wypisz do `$GITHUB_STEP_SUMMARY`: tryb (start/zmiany), liczba adresów, kody odpowiedzi.
3. `seo-indexnow.yml`: dodaj wyzwalacz `schedule` raz na dobę (zapasowy, gdy `deployment_status` nie uruchomi workflow); reszta bez zmian. Zadanie nadal tylko ostrzega przy błędach sieci.

Gotowe, gdy:
- Test: `allUrls` na zestawie plików mapy zwraca wszystkie adresy raz.
- Test: brak starej migawki = wysyłka wszystkich adresów w paczkach nieprzekraczających limitu; obecna migawka = tylko zmienione (`changedUrls` jak dotąd).
- Test: gdy plik klucza zwraca coś innego niż klucz, nic nie jest wysyłane i jest ostrzeżenie.
- Test: błąd sieci przy wysyłce = ostrzeżenie, nie wyjątek.
Nie ruszaj: istniejących testów, `scripts/seo/gsc-*.mjs`, `src/core/seo/sitemap.ts`, pozostałych workflows, klucza w `public/`.
Po scaleniu (właściciel): w Actions uruchom „SEO – IndexNow” (Run workflow); w Bing Webmaster Tools po kilku dniach sprawdź „Przesłane adresy URL”.
Tytuł PR zaczyna się od `[W35-S17]`; opis ma „Po ludzku”.
