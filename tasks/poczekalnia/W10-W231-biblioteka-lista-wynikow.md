# W2.31 – Biblioteka: lista wyników
Cel: lista wskaźników pasujących do wyszukiwania, po 50, z „Pokaż więcej”.
Zmieniaj: src/view/library/LibraryResults.tsx, tests/unit/library-results.test.tsx
Wymagane: tests/unit/library-results.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W2.31 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** lista wskaźników pasujących do wyszukiwania, po 50, z „Pokaż więcej”.
- **Przeczytaj najpierw:** `src/view/library/LibraryResults.tsx` (szkielet), `src/core/library/query.ts`.
- **Pliki:** `src/view/library/LibraryResults.tsx`, `tests/unit/library-results.test.tsx` (nowy).
- **Zadanie:** z `filterVars(index, query)` wyświetl wiersze: nazwa, ścieżka kategorii, jednostka, poziom („powiaty” / „gminy i powiaty”), znacznik „można przeglądać” albo „jeszcze niepobrane” (tekst, nie tylko kolor); wiersz to odnośnik do `/biblioteka/<id>`; pierwsze 50 wyników i przycisk „Pokaż więcej” (+50); brak wyników → „Brak wyników. Spróbuj innego słowa albo zdejmij filtry.”
- **Gotowe, gdy (`@S21`):** testy z `MemoryRouter`: 120 wyników → 50 widocznych; „Pokaż więcej” → 100; odnośnik prowadzi do `/biblioteka/<id>`; stan „jeszcze niepobrane” z tekstem; brak wyników → komunikat; axe bez błędów; długa nazwa zawija się, bez poziomego przewijania przy 360 px.
- **Ty sprawdzasz:** ✅ (widoczne po W2.32).
- **Nie ruszaj:** `Library.tsx`.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W10-W231). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W10-W231]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
