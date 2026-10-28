# W2.30 – Biblioteka: filtry
Cel: przełączniki: powiaty/gminy, jednostka miary, „tylko już pobrane”.
Zmieniaj: src/view/library/LibraryFilters.tsx, tests/unit/library-filters.test.tsx
Wymagane: tests/unit/library-filters.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W2.30 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** przełączniki: powiaty/gminy, jednostka miary, „tylko już pobrane”.
- **Przeczytaj najpierw:** `src/view/library/LibraryFilters.tsx` (szkielet), `src/core/library/query.ts`, `src/view/controls/` (istniejące kontrolki).
- **Pliki:** `src/view/library/LibraryFilters.tsx`, `tests/unit/library-filters.test.tsx` (nowy).
- **Zadanie:** trzy kontrolki zmieniające `level`, `unit`, `onlyReady` przez `onQueryChange`; lista jednostek tylko te, które występują w bieżących wynikach; przycisk „Wyczyść filtry”; stan aktywnych filtrów widoczny (nie tylko kolorem).
- **Gotowe, gdy (`@S21`):** testy: zmiana każdej kontrolki woła `onQueryChange` z właściwym polem; „Wyczyść filtry” zeruje trzy pola, nie dotyka `cat` i `text`; lista jednostek zgodna z wynikami; ≥ 44 px; axe bez błędów.
- **Ty sprawdzasz:** ✅ (widoczne po W2.32).
- **Nie ruszaj:** `Library.tsx`, `src/view/controls/` (tylko używasz).

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W10-W230). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W10-W230]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
