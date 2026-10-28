# W2.33 – Strona wskaźnika /biblioteka/<id>
Cel: po wybraniu wskaźnika widać ranking najwyżej i najniżej, można wybrać rok i poziom, pobrać CSV albo zamówić wskaźnik, którego jeszcze nie ma.
Zmieniaj: src/view/pages/LibraryVariable.tsx, src/App.tsx, tests/e2e/library-variable.spec.ts, tests/fixtures/library/values-sample.json
Wymagane: tests/e2e/library-variable.spec.ts, tests/fixtures/library/values-sample.json
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Limity zmian w plikach wspólnych: src/App.tsx – najwyżej 4 linii zmiany

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W2.33 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** po wybraniu wskaźnika widać ranking najwyżej i najniżej, można wybrać rok i poziom, pobrać CSV albo zamówić wskaźnik, którego jeszcze nie ma.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4d, `src/core/ranking/ranking.ts`, `src/view/ranking/RankingBars.tsx`, `src/core/data/load-atlas-data.ts`, `src/view/library/DownloadCsv.tsx` i `OrderButton.tsx` (W2.34, W2.35).
- **Pliki:** `src/view/pages/LibraryVariable.tsx` (nowy), `src/App.tsx` (częściowy, do 4 linii), `tests/e2e/library-variable.spec.ts` (nowy), `tests/fixtures/library/values-sample.json` (nowy – wartości w kształcie `LibraryValues` dla 3 powiatów i 3 lat z `units.json`).
- **Zadanie:** trasa `/biblioteka/:id`. Metadane ze spisu (`loadLibraryIndex`), wartości z `loadLibraryValues` + `valuesByTeryt` (W1.23). Wskaźnik z wartościami: nazwa, ścieżka kategorii, jednostka, wybór roku (domyślnie najnowszy) i poziomu (gdy są oba), dwa rankingi (10 najwyżej, 10 najniżej) przez `src/core/ranking` i `RankingBars` z nazwami jednostek, `DownloadCsv`, źródło „GUS, Bank Danych Lokalnych (CC BY 4.0)”. Wskaźnik bez wartości (`has` = 0 lub 404): komunikat „Ten wskaźnik jeszcze nie został pobrany” i `OrderButton`. Nieistniejące id: komunikat i odnośnik do `/biblioteka`.
- **Gotowe, gdy (`@S21`):** e2e z podmienionymi żądaniami (fixture): strona pokazuje ranking z poprawną kolejnością, zmiana roku zmienia ranking bez nowego żądania, wejście = 1 żądanie spisu + 1 żądanie wartości; wskaźnik niepobrany → komunikat i przycisk „Zamów ten wskaźnik”; nieistniejące id → komunikat; telefon 390 px bez poziomego przewijania; istniejące testy bez zmian.
- **Ty sprawdzasz:** wybrany z listy wskaźnik pokazuje rankingi; niepobrany – przycisk zamówienia.
- **Nie ruszaj:** `AtlasMap.tsx`, `src/core/ranking/` (tylko używasz).

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W10-W233). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W10-W233]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
