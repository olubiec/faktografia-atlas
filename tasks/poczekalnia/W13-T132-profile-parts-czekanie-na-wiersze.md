# T13.2 – Test `profile-parts`: czekanie na wiersze i tolerancja spacji tysięcy
Cel: test ma poczekać, aż tabela miasta i wsi się wypełni, i nie zależeć od tego, jaką spację przeglądarka wstawi w liczbie
Zmieniaj: tests/e2e/profile-parts.spec.ts
Wymagane: tests/e2e/profile-parts.spec.ts
Weryfikacja: pnpm exec playwright test tests/e2e/profile-parts.spec.ts --repeat-each=10 --retries=0

Skąd: przebiegi CI na main po F12 – test przechodził dopiero po ponowieniu (wyścig czasowy w samym teście).
Zgoda właściciela (28.10.2026) na zmianę istniejącego testu – wyłącznie wskazanego pliku i wyłącznie w zakresie „czekaj na warunek zamiast sprawdzać od razu / po stałym czasie”. Wszystkie dotychczasowe asercje zostają (te same wartości oczekiwane, ta sama liczba wywołań `expect`); nie wolno ich usuwać, osłabiać, zamieniać na słabsze ani dodawać `skip`/`fixme`/`only`, `@ts-ignore`, `oxlint-disable`. Kodu aplikacji (`src/`) nie zmieniasz. Jeśli test nie przechodzi, bo aplikacja naprawdę się myli, nie naprawiaj aplikacji: opisz w PR, co zaobserwowałeś, i zatrzymaj się.

Przeczytaj najpierw: tests/e2e/profile-parts.spec.ts (całość), tests/fixtures/parts/shard-12.json, src/view/profile/ProfileParts.tsx (tylko czytasz), src/core/format/number.ts (jak formatujemy liczby).
Zadanie: w pierwszym teście zamień jednorazowy odczyt `innerText()` na asercje z automatycznym ponawianiem: `await expect(partsTable).toContainText(/16[\s  ]500/)` i analogicznie dla `20 200`. Usuń zbędne ręczne `replace(/ /g, ' ')`, jeśli staje się niepotrzebne. Wartości oczekiwane (16 500 i 20 200), liczba żądań do `parts` (0 przy otwarciu profilu, dokładnie 1 po rozwinięciu) i drugi test (404) zostają bez zmian.
Gotowe, gdy: test przechodzi 10 razy z rzędu lokalnie (`pnpm exec playwright test <plik> --repeat-each=10 --retries=0`; jeśli środowisko nie pozwala uruchomić przeglądarki, napisz to w PR); wszystkie pozostałe testy bez zmian; zmieniony jest tylko wskazany plik testu.
Gotowe, gdy (dla tego testu): test przechodzi 10× z rzędu; obie liczby nadal sprawdzane; asercje o liczbie żądań bez zmian.
Nie ruszaj: src/, fixture, innych testów.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W13-T132). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W13-T132]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
