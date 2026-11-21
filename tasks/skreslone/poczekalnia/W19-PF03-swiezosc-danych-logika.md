# PF03 – Świeżość danych: czysta logika „Dane z dnia…”
Cel: Jedno przetestowane miejsce, które z dat w plikach danych układa napis o świeżości danych i rozpoznaje przeterminowane dane robota.
Zmieniaj: src/core/data/freshness.ts, tests/unit/data-freshness.test.ts
Wymagane: src/core/data/freshness.ts, tests/unit/data-freshness.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/data/load-values.ts, src/core/library/load-library.ts (`LibraryValues.fetchedAt`), public/data/values/density.json (pola `fetchedAt`, `years`), src/core/format/ (formatowanie liczb i dat, jeśli jest), docs/PRODUKT.md §6–§7

## Kontekst
Właściciel pyta, czy nocny automat „coś pobrał”, a na stronie nie ma żadnej informacji, z kiedy są dane. W plikach wartości jest `fetchedAt` (dziś wszystkie 20 z 19.10.2026, bo nocny robot zapisuje tylko realne zmiany – znaczniki czasu są odrzucane przez `nightly-checks.mjs revert-noise`). Dlatego „świeżość” ma dwie osobne rzeczy: **kiedy pobrano dane** (z pliku) i **kiedy robot ostatnio sprawdzał** (z pliku statusu, zadanie PD01). To zadanie robi tylko logikę dat; skąd czytamy status – PD01/PU01.

## Research (5 min, bez nowych pakietów)
Użyj wbudowanego `Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw' })`. Sprawdź, jak testy w repo ustawiają „teraz” (wstrzykiwany parametr `now`, bez fałszywych timerów, jeśli to możliwe).

## Zadanie
`src/core/data/freshness.ts` (czysty TS):
- `export function latestTimestamp(isoDates: (string | undefined | null)[]): Date | null` – największa poprawna data; niepoprawne i puste pomijane; same niepoprawne → `null`.
- `export function formatDay(date: Date): string` – „19.10.2026” (strefa Europe/Warsaw, dzień i miesiąc dwucyfrowe).
- `export type Freshness = { label: string; ageDays: number; stale: boolean }`.
- `export function describeFreshness(iso: string | null | undefined, now: Date, staleAfterDays = 3): Freshness | null` – `label` = „Dane z 19.10.2026”; `ageDays` = pełne dni między datą a `now` (data z przyszłości → 0); `stale` = `ageDays > staleAfterDays`; brak/zła data → `null`.
- `export function describeCheck(checkedAtIso: string | null | undefined, now: Date): string | null` – „Sprawdzone przez automat: dziś”, „wczoraj”, „3 dni temu”, „5 dni temu” (poprawna odmiana: 1 dzień → „wczoraj”, 2–4 „dni temu”, 5+ „dni temu”; zawsze „temu” – bez „1 dni”).

## Testy (`tests/unit/data-freshness.test.ts`)
1. `latestTimestamp(['2026-10-19T20:25:18.912Z', 'zła', undefined, '2026-10-19T21:25:48.342Z'])` → druga data; same złe → `null`.
2. `formatDay` dla `2026-10-19T22:30:00Z` → „20.10.2026” (po północy czasu polskiego – strefa jest brana pod uwagę).
3. `describeFreshness('2026-10-19T20:00:00Z', now=2026-11-18T10:00:00Z)` → `ageDays` 30, `stale` true, `label` „Dane z 19.10.2026”.
4. Data z przyszłości → `ageDays` 0, `stale` false; `null`/`''`/„xyz” → `null`.
5. `staleAfterDays` podane jawnie (np. 60) → ten sam wiek nie jest `stale`.
6. `describeCheck`: ten sam dzień → „dziś”; poprzedni → „wczoraj”; 3 dni → „3 dni temu”; brak → `null`.

## Gotowe, gdy
- 6 testów zielonych; plik ≤ 100 linii; zero zależności od przeglądarki (`window`, `document`).
Nie ruszaj: `src/view/**`, `public/data/**`, `scripts/data/**`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
