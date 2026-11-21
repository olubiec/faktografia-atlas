# PU01 – Wczytanie `status.json` i napis „Dane z dnia…” (komponent do wpięcia)
Cel: Mały, odporny na błędy loader statusu danych i komponent z napisem o świeżości danych, gotowy do wstawienia w stopkę i panel wskaźnika.
Zmieniaj: src/core/data/load-status.ts, src/view/layout/DataFreshness.tsx, tests/unit/load-status.test.ts, tests/unit/data-freshness-view.test.tsx
Wymagane: tests/unit/load-status.test.ts, tests/unit/data-freshness-view.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/data/freshness.ts (PF03: `describeFreshness`, `describeCheck`), src/core/library/config.ts (`libraryBase`), src/core/data/load-values.ts (wzór pamięci podręcznej i obsługi błędów), src/view/layout/SiteFooter.tsx (tylko czytasz – wpięcie to PU02), docs/STYL.md (rozmiary i kolory napisów małych), scripts/data/status.mjs (PD01: kształt pliku)

## Kontekst
Właściciel nie widzi na stronie, z kiedy są dane ani czy automat działa. Plik `status.json` (PD01) powstaje obok biblioteki (adres: `<libraryBase()>/status.json`). Strona nigdy nie może się zepsuć, gdy pliku nie ma (404, sieć, zły JSON): wtedy po prostu nie pokazuje drugiej części napisu.

## Research (5 min)
Zajrzyj do `docs/STYL.md`: który token rozmiaru/koloru jest dla napisów pomocniczych (np. `text-xs text-olowek`). Zero wartości na sztywno.

## Zadanie
1. `src/core/data/load-status.ts`:
   - `export type DataStatus = { version: number; checkedAt: string | null; values: { count: number | null; latestFetchedAt: string | null; latestYear: number | null; oldestFetchedAt: string | null } | null; library: { availableCount: number | null; availableGeneratedAt: string | null; doneCount: number | null; pendingCount: number | null } | null }`.
   - `export function loadDataStatus(fetchImpl: typeof fetch = (...a) => fetch(...a)): Promise<DataStatus | null>` – jedno żądanie na sesję (pamięć + wspólna obietnica), 404/sieć/zły kształt → `null` (zapamiętane na sesję, bez ponawiania w pętli), `version !== 1` → `null`.
2. `src/view/layout/DataFreshness.tsx`:
   - `export function DataFreshness(props: { fetchedAt?: string | null; status?: DataStatus | null; now?: Date; className?: string })`.
   - Pokazuje „Dane z 19.10.2026” (z `fetchedAt` bieżącego wskaźnika, jeśli jest; w przeciwnym razie z `status.values.latestFetchedAt`) oraz, gdy jest `status.checkedAt`, ` · Sprawdzone przez automat: wczoraj`. Gdy `describeFreshness(...).stale` dla `checkedAt` (więcej niż 3 dni) – drugi człon dostaje słowo „uwaga” w tekście (nie tylko kolor) i `role="status"`. Brak jakichkolwiek dat → komponent nic nie renderuje (`null`).
   - Bez `dangerouslySetInnerHTML`; kolory/rozmiary tylko z tokenów.

## Testy
`load-status.test.ts` (wstrzyknięty `fetchImpl`):
1. Poprawny plik → obiekt; dwa wywołania = 1 żądanie.
2. 404 → `null`; kolejne wywołanie nie ponawia żądania.
3. Zły JSON i `version: 2` → `null`.
4. Żądany adres kończy się na `/status.json` i zaczyna od `libraryBase()`.
`data-freshness-view.test.tsx` (`renderToString`, stałe `now`):
5. `fetchedAt` + świeży `checkedAt` → tekst „Dane z 19.10.2026” i „Sprawdzone przez automat: wczoraj”.
6. Tylko `fetchedAt` (brak statusu) → tylko pierwszy człon.
7. `checkedAt` sprzed 5 dni → w tekście jest słowo „uwaga”, atrybut `role="status"`.
8. Brak wszystkich dat → pusty wynik renderowania.
9. Brak klas z wartościami na sztywno (test `no-hardcoded-colors` nadal zielony).

## Gotowe, gdy
- 9 testów zielonych; komponent ≤ 60 linii; nic jeszcze nie jest wstawione na stronę (wpięcie: PU02).
Nie ruszaj: `SiteFooter.tsx`, `IndicatorPanel.tsx`, `config.ts`, `scripts/data/*`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
