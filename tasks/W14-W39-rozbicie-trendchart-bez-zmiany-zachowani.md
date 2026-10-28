# W3.9 – Rozbicie TrendChart bez zmiany zachowania
Cel: wykres lat w profilu wygląda i działa tak samo; kod podzielony na małe pliki (zasada ≤ ok. 200 linii), łatwiejszy do poprawiania.
Zmieniaj: src/view/profile/TrendChart.tsx, src/core/profile/trend-geometry.ts, src/view/profile/TrendAxis.tsx, src/view/profile/TrendPoints.tsx, src/view/profile/TrendStatus.tsx, tests/unit/trend-geometry.test.ts
Wymagane: tests/unit/trend-geometry.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W3.9 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** wykres lat w profilu wygląda i działa tak samo; kod podzielony na małe pliki (zasada ≤ ok. 200 linii), łatwiejszy do poprawiania.
- **Przeczytaj najpierw:** `src/view/profile/TrendChart.tsx`, `src/core/profile/trend.ts`, `tests/unit/trend-chart.test.tsx`, `tests/e2e/profile-trend.spec.ts`.
- **Pliki:** `src/view/profile/TrendChart.tsx` (zmiana), `src/core/profile/trend-geometry.ts` (nowy), `src/view/profile/TrendAxis.tsx` (nowy), `src/view/profile/TrendPoints.tsx` (nowy), `src/view/profile/TrendStatus.tsx` (nowy), `tests/unit/trend-geometry.test.ts` (nowy).
- **Zadanie:** wydziel czystą geometrię (skale `getX`/`getY`, lata na osi, segmenty linii) do `trend-geometry.ts` z testami jednostkowymi; z komponentu wydziel oś, punkty/linie i pasek statusu (`aria-live`). Zachowanie, atrybuty ARIA, klasy i obsługa klawiatury bez zmian. **Nie** dodajesz bibliotek (`@observablehq/plot` usunięty w W0.1).
- **Gotowe, gdy:** wszystkie istniejące testy (`trend-chart.test.tsx`, `profile-trend.test.ts`, `profile-trend.spec.ts`, `profile-row.spec.ts`) przechodzą **bez zmian**; każdy nowy lub zmieniony plik ≤ 200 linii; test geometrii pokrywa: brak danych, jeden punkt, luki w latach, wartości ujemne.
- **Ty sprawdzasz:** w profilu rozwinięty wskaźnik pokazuje ten sam wykres; najechanie lub dotknięcie roku działa jak dotąd.
- **Nie ruszaj:** `ProfileSheet*.tsx`, `ProfileIndicatorRow.tsx`, istniejących testów.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W14-W39). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W14-W39]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
