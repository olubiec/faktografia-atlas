# T13.1 – Test ruchu `s16-motion`: czekanie na kamerę zamiast stałego czasu
Cel: test ma czekać, aż mapa naprawdę wróci do widoku całego kraju, a nie „pół sekundy i zobaczymy”
Zmieniaj: tests/e2e/s16-motion.spec.ts
Wymagane: tests/e2e/s16-motion.spec.ts
Weryfikacja: pnpm exec playwright test tests/e2e/s16-motion.spec.ts --repeat-each=10 --retries=0

Skąd: przebiegi CI na main po F12 – test przechodził dopiero po ponowieniu (wyścig czasowy w samym teście).
Zgoda właściciela (28.10.2026) na zmianę istniejącego testu – wyłącznie wskazanego pliku i wyłącznie w zakresie „czekaj na warunek zamiast sprawdzać od razu / po stałym czasie”. Wszystkie dotychczasowe asercje zostają (te same wartości oczekiwane, ta sama liczba wywołań `expect`); nie wolno ich usuwać, osłabiać, zamieniać na słabsze ani dodawać `skip`/`fixme`/`only`, `@ts-ignore`, `oxlint-disable`. Kodu aplikacji (`src/`) nie zmieniasz. Jeśli test nie przechodzi, bo aplikacja naprawdę się myli, nie naprawiaj aplikacji: opisz w PR, co zaobserwowałeś, i zatrzymaj się.

Przeczytaj najpierw: tests/e2e/s16-motion.spec.ts (całość), tests/e2e/color-transition.spec.ts i tests/e2e/camera.spec.ts (jak inne testy czekają na stan z `window.__atlas`), docs/WORKFLOW.md (wiersz „Mapy, 3D, WebGL”: testujemy logikę i stan, nie piksele).
Zadanie: w pętli „Powrót” zamień `await page.waitForTimeout(500)` na `await page.waitForFunction((z) => (window as any).__atlas.viewState.zoom < z, zoomedInZoom)` (limit czasu z konfiguracji) i dopiero potem odczytaj `returnedZoom`. Analogicznie zamień `waitForTimeout(400)` po zmianie wskaźnika na czekanie na zakończenie przejścia kolorów, jeśli `__atlas` wystawia odpowiedni znacznik (sprawdź w src, nie zmieniaj go); jeśli nie wystawia – zostaw tę jedną linię bez zmian i napisz o tym w PR. Asercje (`toBeLessThan`, progi §7 dla żądań) zostają bez zmian.
Gotowe, gdy: test przechodzi 10 razy z rzędu lokalnie (`pnpm exec playwright test <plik> --repeat-each=10 --retries=0`; jeśli środowisko nie pozwala uruchomić przeglądarki, napisz to w PR); wszystkie pozostałe testy bez zmian; zmieniony jest tylko wskazany plik testu.
Gotowe, gdy (dla tego testu): test przechodzi 10× z rzędu; liczba i treść asercji `expect` bez zmian; brak nowych stałych czekań > 500 ms.
Nie ruszaj: src/, innych testów, playwright.config.ts.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W13-T131). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W13-T131]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
