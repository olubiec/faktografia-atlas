# S18 – Codzienna porcja 10 priorytetowych adresów do indeksowania (Bing automatem, Google listą do odhaczenia)
Cel: co dobę automat wybiera do 10 najważniejszych jeszcze nieodhaczonych adresów, wysyła je do IndexNow (Bing) i zakłada przypięte zgłoszenie z checklistą, którą właściciel wkleja do Search Console (Google); odhaczone adresy nie wracają.
Zmieniaj: src/core/seo/daily-batch.ts, tests/unit/seo-daily-batch.test.ts, scripts/seo/daily-batch.mjs, scripts/seo/indexnow.mjs (tylko dopisanie `export` przy istniejących funkcjach), .github/workflows/seo-daily-list.yml, docs/SEO-AUTOMAT.md (nowy rozdział)
Wymagane: tests/unit/seo-daily-batch.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/SEO-AUTOMAT.md (§3, §9), scripts/seo/indexnow.mjs, src/core/seo/sitemap-diff.ts, .github/workflows/seo-indexnow.yml, .github/workflows/seo-live-check.yml

Zadanie (zadanie wprost zezwala na dodanie workflow `seo-daily-list.yml`; `seo-indexnow.yml` bez zmian):
1. `daily-batch.ts`: `pickDailyBatch({ urls, done, date, limit = 10 })` – tylko adresy indeksowalne (strona główna, /mapa, /miejsca, województwa, powiaty i miasta na prawach powiatu, rankingi, tematy, zestawienia); NIGDY gminy, miejscowości i porównania gmin (noindex, SEO-AUTOMAT §9) ani rankingi i zestawienia gmin; kolejność priorytetu: strony główne, województwa, powiaty, rankingi, tematy; pomijaj adresy odhaczone; rotacja deterministyczna po dacie; bez duplikatów; krótka lista = mniej adresów. `renderIssueBody`, `parseCheckedUrls`.
2. `daily-batch.mjs`: mapa strony z produkcji (jak indexnow.mjs), odhaczone ze zgłoszeń `seo-dzien`, wyliczenie porcji, pliki `batch.txt`, `issue.md`, `title.txt`, wysyłka tych samych adresów do IndexNow (klucz z `public/`, nie wpisany w kodzie). Błąd IndexNow = `::warning::`, kod 0.
3. `seo-daily-list.yml`: raz na dobę + ręcznie; tworzy etykietę i zgłoszenie „SEO – dzień RRRR-MM-DD”, zamyka poprzednie otwarte, przypina nowe (GraphQL `pinIssue`), odpina stare; porażka przypięcia = ostrzeżenie.
4. Rozdział w `docs/SEO-AUTOMAT.md` po ludzku.

Gotowe, gdy:
- Test: wynik ma najwyżej 10 adresów, bez duplikatów.
- Test: żaden adres gminy, miejscowości ani porównania gmin (także rankingu/zestawienia gmin) nie trafia do porcji.
- Test: kolejność – strona główna, województwa, powiaty, rankingi, tematy.
- Test: adresy z listy `done` są pomijane; gdy zostaje mniej niż 10, wynik jest krótszy; gdy nic – pusty.
- Test: ta sama data = ten sam wynik; inna data = inna porcja w obrębie tej samej grupy.
- Test: `renderIssueBody` daje checklistę `- [ ] https://…` i instrukcję po polsku; `parseCheckedUrls` czyta tylko `- [x]` (także duże X), a pozostałe linie ignoruje.
Nie ruszaj: istniejących testów, `seo-indexnow.yml`, `package.json`, `docs/STAN.md`, klucza w `public/`.
Po scaleniu (właściciel): w Actions uruchom „SEO – lista dnia” (Run workflow); otwórz przypięte zgłoszenie i odhaczaj adresy po wysłaniu ich w Search Console.
Tytuł PR zaczyna się od `[W35-S18]`; opis ma „Po ludzku”.
