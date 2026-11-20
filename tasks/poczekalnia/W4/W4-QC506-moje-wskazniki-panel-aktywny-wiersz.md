# QC506 – „Moje wskaźniki” w panelu mapy: aktywny wiersz
Cel: W panelu wskaźnika wiersz aktualnie pokazywanego wskaźnika na liście „Moje wskaźniki” jest oznaczony (`aria-current`), co jest sprawdzone testem panelu.
Zależy od: **QC504** (dodaje prop `activeId` w `src/view/pages/MyIndicatorsBar.tsx`; ten plik jest tam wspólny, więc QC506 idzie PO QC504 i go nie edytuje).
Kolizje plików: `src/view/main/MobileIndicatorBar.tsx` – żadne inne zadanie W4 go nie rusza; `src/view/pages/MyIndicatorsBar.tsx` – QC504 (kolejność: QC504 → QC506).
Zmieniaj: src/view/main/IndicatorPanel.tsx, src/view/main/MobileIndicatorBar.tsx, tests/unit/indicator-panel-my.test.tsx (nowy)
Wymagane: tests/unit/indicator-panel-my.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/main/IndicatorPanel.tsx (linia z `<MyIndicatorsManager …>`), src/view/main/MobileIndicatorBar.tsx (`MyIndicatorsManager`), src/view/pages/MyIndicatorsBar.tsx (po QC504: prop `activeId`), tests/unit/indicator-panel-basic.test.tsx (**istniejący – nie zmieniaj**; wzór mocków i `render`), docs/PRODUKT.md §4f

## Kontekst
Audyt (docs/AUDYT-W4-20-11.md): katalog `src/view/my-indicators/` nie istnieje; sekcja „Moje wskaźniki” w panelu mapy **już jest** (`MyIndicatorsManager` w `MobileIndicatorBar.tsx`, wstawiony w `IndicatorPanel.tsx`: zwijana, `aria-expanded`, ×, „Przywróć podstawowe”, dodawanie, kolejność). Nie dubluj. Brakuje tylko wskazania, który wiersz jest teraz na mapie, i testu `indicator-panel-my`. Wiersz nie jest przyciskiem wyboru (nazwa nic nie robi) – nie zmieniaj tego zachowania.

## Zadanie
- `MobileIndicatorBar.tsx`: `MyIndicatorsManager` dostaje opcjonalny prop `activeId?: string | null` i przekazuje go do `<MyIndicatorsBar activeId={activeId} …>` (prop dodaje QC504).
- `IndicatorPanel.tsx`: w miejscu użycia `<MyIndicatorsManager …>` dopisz `activeId={indicator.id}`.
- Nic więcej: bez zmiany układu, zwijania, domyślnego stanu ani kolejności elementów (istniejące e2e i zrzuty bez zmian).

## Testy (`tests/unit/indicator-panel-my.test.tsx`, `renderToString`, wzór z `indicator-panel-basic.test.tsx`)
1. `MyIndicatorsManager` z `defaultOpen`, `activeId` = pierwszy z `BASIC_INDICATORS` → dokładnie jeden wiersz ma `aria-current="true"` i jest to wiersz tego wskaźnika (`data-row-id`).
2. Bez `activeId` (lub `null`) żaden wiersz nie ma `aria-current`.
3. `activeId` spoza listy „moich” (id, którego nie ma w `BASIC_INDICATORS`, np. `'b999'`) → brak `aria-current` i brak wyjątku.
4. Cały `IndicatorPanel` (render jak w `indicator-panel-basic`) z bieżącym wskaźnikiem z bazowych i rozwiniętą sekcją: wiersz bieżącego wskaźnika ma `aria-current`. Jeśli sekcja jest domyślnie zwinięta (renderToString nie klika), sprawdź to testem 1 i opisz w PR, że panel przekazuje `activeId` (np. przez spy na `MyIndicatorsManager` zamockowany w `vi.mock`).
5. Istniejące `indicator-panel*.test.tsx` zielone bez zmian.

## Gotowe, gdy
- Aktywny wskaźnik ma `aria-current` w liście (testy 1, 4); nieaktywne i spoza listy – nie (testy 2, 3).
- Istniejące testy panelu i `tests/e2e/main-screen.spec.ts` bez zmian i zielone.
- Wygląd się nie zmienia (atrybut `aria-current` bez stylu) – odświeżanie wzorców zrzutów niepotrzebne; napisz to w PR.
Nie ruszaj: `Home.tsx`, `AtlasMap.tsx`, `src/view/pages/MyIndicatorsBar.tsx`, `useMyIndicators.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
