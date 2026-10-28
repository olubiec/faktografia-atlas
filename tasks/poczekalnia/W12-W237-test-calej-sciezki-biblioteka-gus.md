# W2.37 – Test całej ścieżki „Biblioteka GUS”
Cel: jeden test przechodzi całą ścieżkę: wejście z nagłówka, szukanie, wybór wskaźnika, ranking, CSV, zamówienie.
Zmieniaj: tests/e2e/s21-library.spec.ts
Wymagane: tests/e2e/s21-library.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W2.37 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** jeden test przechodzi całą ścieżkę: wejście z nagłówka, szukanie, wybór wskaźnika, ranking, CSV, zamówienie.
- **Pliki:** `tests/e2e/s21-library.spec.ts` (nowy). Kodu nie zmieniasz.
- **Gotowe, gdy (`@S21`):** ścieżka (nagłówek → `/biblioteka` → szukanie → wskaźnik pobrany: ranking i CSV; wskaźnik niepobrany: przycisk zamówienia; dane z `tests/fixtures/library/`) przechodzi 3×, na komputerze i 390 px; progi §7: wejście = 1 żądanie spisu, wskaźnik = 1 żądanie wartości, zero żądań do `values/*` i `profiles/*` z głównej mapy.
- **Ty sprawdzasz:** na telefonie: wejście w Bibliotekę, wyszukanie wskaźnika, ranking, „Pobierz CSV”.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W12-W237). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W12-W237]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
