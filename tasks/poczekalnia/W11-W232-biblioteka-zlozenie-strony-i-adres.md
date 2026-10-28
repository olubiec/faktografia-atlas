# W2.32 – Biblioteka: złożenie strony i adres
Cel: kafelki, wyszukiwarka, filtry i wyniki działają razem, a stan jest w adresie (można wkleić link).
Zmieniaj: src/view/pages/Library.tsx, tests/e2e/library-search.spec.ts
Wymagane: tests/e2e/library-search.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W2.32 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** kafelki, wyszukiwarka, filtry i wyniki działają razem, a stan jest w adresie (można wkleić link).
- **Przeczytaj najpierw:** `src/view/pages/Library.tsx` (W2.27), pliki `src/view/library/` (W2.28–W2.31), `src/core/url/state.ts` (wzorzec czytania adresu).
- **Pliki:** `src/view/pages/Library.tsx`, `tests/e2e/library-search.spec.ts` (nowy).
- **Zadanie:** stan `LibraryQuery` czytany z adresu i zapisywany do adresu (`?k=` dział, `?q=` tekst, `?l=` poziom 5 lub 6, `?j=` jednostka, `?p=1` tylko pobrane); `onPick(id)` z wyszukiwarki → nawigacja do `/biblioteka/<id>`; zmiana zapytania nie przeładowuje strony; przycisk „wstecz” w przeglądarce wraca do poprzedniego stanu.
- **Gotowe, gdy (`@S21`):** e2e (spis z fixture): wpisanie „ludnosc” zawęża listę i zapisuje `?q=`; wejście w dział zapisuje `?k=`; wklejenie adresu z `?k=…&q=…` odtwarza ten sam widok; „wstecz” cofa; telefon 390 px bez poziomego przewijania; w całej ścieżce 1 żądanie spisu.
- **Ty sprawdzasz:** na `/biblioteka` kategorie, szukanie i filtry działają razem; link do wyszukiwania da się skopiować.
- **Nie ruszaj:** komponentów `src/view/library/` (tylko używasz).

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W11-W232). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W11-W232]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
