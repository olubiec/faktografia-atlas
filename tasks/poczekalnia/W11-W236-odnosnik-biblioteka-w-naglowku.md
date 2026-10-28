# W2.36 – Odnośnik „Biblioteka” w nagłówku
Cel: w nagłówku pojawia się przejście do biblioteki (komputer i telefon).
Zmieniaj: src/view/Header.tsx, tests/e2e/header-library.spec.ts
Wymagane: tests/e2e/header-library.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Limity zmian w plikach wspólnych: src/view/Header.tsx – najwyżej 15 linii zmiany
Zrzuty: zadanie zmienia wzorce zrzutów; nie generuj ich u siebie, napisz w PR, że trzeba uruchomić „Update snapshots”.

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W2.36 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** w nagłówku pojawia się przejście do biblioteki (komputer i telefon).
- **Przeczytaj najpierw:** `src/view/Header.tsx`, `docs/STYL.md` §2–§4.
- **Pliki:** `src/view/Header.tsx` (częściowy, do 15 linii), `tests/e2e/header-library.spec.ts` (nowy).
- **Zadanie:** odnośnik „Biblioteka” do `/biblioteka` obok istniejących odnośników (na telefonie w tym samym miejscu co pozostałe, bez powiększania nagłówka); aktywny stan na `/biblioteka*`.
- **Gotowe, gdy (`@S21`):** e2e: odnośnik widoczny na `/` i `/biblioteka`; kliknięcie prowadzi do `/biblioteka`; na 390 px nagłówek bez poziomego przewijania i bez zmiany wysokości; pole dotykowe ≥ 44 px; istniejące testy bez zmian (wzorce zrzutów odświeża właściciel przez workflow).
- **Ty sprawdzasz:** w nagłówku widać „Biblioteka” i działa na telefonie.
- **Nie ruszaj:** `Home.tsx`, `AtlasMap.tsx`.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W11-W236). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W11-W236]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
