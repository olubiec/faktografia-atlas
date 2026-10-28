# W2.25 – Blok „Miasto i obszar wiejski” w profilu gminy
Cel: w profilu gminy miejsko-wiejskiej pojawia się blok z miastem i wsią.
Zmieniaj: src/view/profile/ProfileOverview.tsx, tests/e2e/profile-parts.spec.ts, tests/fixtures/parts/shard-12.json
Wymagane: tests/e2e/profile-parts.spec.ts, tests/fixtures/parts/shard-12.json
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Limity zmian w plikach wspólnych: src/view/profile/ProfileOverview.tsx – najwyżej 25 linii zmiany
Zrzuty: zadanie zmienia wzorce zrzutów; nie generuj ich u siebie, napisz w PR, że trzeba uruchomić „Update snapshots”.

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W2.25 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** w profilu gminy miejsko-wiejskiej pojawia się blok z miastem i wsią.
- **Przeczytaj najpierw:** `src/view/profile/ProfileOverview.tsx`, `src/view/profile/ProfileParts.tsx` (W2.24), `src/core/data/load-parts.ts` (W1.19), `src/core/parts/rows.ts` (W1.20).
- **Pliki:** `src/view/profile/ProfileOverview.tsx` (częściowy, do 25 linii), `tests/e2e/profile-parts.spec.ts` (nowy), `tests/fixtures/parts/shard-12.json` (nowy – krótki plik województwa 12 z dwiema gminami m-w z `units.json` i trzema wskaźnikami).
- **Zadanie:** dla gminy z końcówką `3` pod przeglądem pokaż `ProfileParts`; `onFirstExpand` → `loadPartsShard` (W1.19) → `partsRows` (W1.20); brak pliku (404) → blok z komunikatem „Dane o mieście i wsi pojawią się po najbliższej aktualizacji”; w innych gminach i jednostkach bloku nie ma.
- **Gotowe, gdy (`@S20`):** test e2e z podmienionym żądaniem `/data/parts/12.json` (fixture): w profilu gminy m-w blok jest zwinięty, otwarcie profilu = 0 żądań do `parts`, rozwinięcie = dokładnie 1, widać liczby miasta i wsi; 404 → komunikat; w profilu gminy miejskiej i powiatu bloku nie ma; telefon 390 px bez poziomego przewijania; istniejące testy bez zmian.
- **Ty sprawdzasz:** w profilu gminy miejsko-wiejskiej (np. po wyszukaniu „Wałcz”) pod przeglądem jest blok „Miasto i obszar wiejski”; po rozwinięciu widać trzy kolumny (liczby pojawią się po pierwszym nocnym pobraniu).
- **Nie ruszaj:** `ProfileSheet*.tsx`, `ProfileIndicatorRow.tsx`.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W11-W225). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W11-W225]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
