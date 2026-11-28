# S18b – Jedno stałe zgłoszenie z listą dnia (zamiast nowego codziennie i przypinania)
Cel: workflow „SEO – lista dnia” utrzymuje jedno zgłoszenie z etykietą `seo-dzien`, które codziennie nadpisuje; właściciel przypina je ręcznie raz (GITHUB_TOKEN nie może przypinać).
Zmieniaj: src/core/seo/daily-batch.ts, tests/unit/seo-daily-batch.test.ts, scripts/seo/daily-batch.mjs, .github/workflows/seo-daily-list.yml, docs/SEO-AUTOMAT.md (rozdz. 10), tasks/W35-S18b-stale-zgloszenie.md
Wymagane: tests/unit/seo-daily-batch.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm vitest run tests/unit/seo-daily-batch.test.ts tests/unit/docs-no-conflict-markers.test.ts
Przeczytaj najpierw: tasks/W35-S18-codzienna-porcja-indeksowania.md, docs/SEO-AUTOMAT.md (§10)

Zadanie (zadanie wprost zezwala na zmianę workflow `seo-daily-list.yml`):
1. Workflow: znajdź otwarte zgłoszenie `seo-dzien` (brak → utwórz; starsze duplikaty zamknij po zebraniu z nich odhaczonych adresów), nadpisz jego treść (`gh issue edit --body-file`) i tytuł „SEO – do zgłoszenia w Google (aktualizacja RRRR-MM-DD)”. Usuń pinIssue/unpinIssue.
2. `daily-batch.ts`: `renderIssueBody(urls, date, done)` dopisuje sekcję `## Zrobione` z `- [x] adres`; `parseCheckedUrls` czyta listę i sekcję bez duplikatów; `issueTitleUpdated`.
3. `daily-batch.mjs`: do treści trafiają wszystkie odhaczone adresy (pamięć między dniami).
4. Docs §10 po ludzku: „raz przypnij zgłoszenie: otwórz je → ⋯ → Pin issue”.

Gotowe, gdy:
- Test: render z sekcją Zrobione (bez duplikatów, bez adresów z dzisiejszej listy), tytuł z datą aktualizacji.
- Test: parser czyta oba miejsca bez duplikatów.
- Test: odhaczone adresy nie przepadają po nadpisaniu treści (kilka dni z rzędu).
Nie ruszaj: istniejących asercji testów (rozszerzaj), `package.json`, `docs/STAN.md`.
Tytuł PR zaczyna się od `[W35-S18b]`; opis ma „Po ludzku”.
