# QC802 – Pasek udostępniania na stronie Rankingi
Cel: `/rankingi` ma „Kopiuj link · Pobierz i udostępnij”; link odtwarza bieżący wybór, a okno otwiera kartę „ranking” dla tego wyboru.
Zależy od: QC801 (`ShareBar`, jest na main), QC106 (na main, #520), QS03 (na main, #535).
Kolizje plików: `Rankings.tsx` ruszają jeszcze tylko zadania z listy rankingów (np. QC609, W5) – QC802 idzie przed nimi. QC917/QC918 (W6–W7) przebudują okno eksportu, nie ten pasek.
Zmieniaj: src/view/pages/Rankings.tsx, src/view/pages/RankingsShare.tsx (nowy), tests/unit/rankings-share.test.tsx (nowy)
Wymagane: tests/unit/rankings-share.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/pages/Rankings.tsx (137 linii; `RankingMedian`, `ranking` z `rankUnits`, `onChange`), src/view/share/ShareBar.tsx (`ShareBarProps`: `url`, `onOpenDialog`), src/view/share/LazyShareDialog.tsx (`defaultKind`, `data`), src/view/share/useShareData.ts (linie ~152–182: jak powstaje `RankingCardData`), src/core/share/card-ranking.ts (`RankingCardData`, `RankingCardItem`), src/core/ranking/rankings-url.ts (`writeRankingsSearch`, `RankingsState`), src/core/format/number.ts (`formatValue`), docs/PRODUKT.md §4b

## Kontekst
Okno eksportu ma kartę „ranking” (`ShareDialogData.ranking`). `useShareData` buduje ją dla mapy, a `/rankingi` ma już policzony `ranking` (`RankedResult` z `rankUnits`), więc dane karty składamy z niego – **bez nowych pobrań**. `Rankings.tsx` ma 137 linii, więc cały pasek idzie do nowego pliku, a w `Rankings.tsx` dochodzi tylko import i jedno użycie.

## Zadanie
- Nowy `RankingsShare.tsx`: komponent z propsami `{ state: RankingsState; ranking: RankedUnit[] | null; units: Unit[]; indicator: Indicator | undefined; year: number | null }`. Trzyma `useState` otwarcia okna i renderuje `<ShareBar url onOpenDialog />` oraz `<LazyShareDialog isOpen onClose defaultKind="ranking" data={{ ranking: card }} />`.
- `url` = `window.location.origin + window.location.pathname + writeRankingsSearch(state)` (pełny adres z `?i=&l=&y=&w=&q=`).
- `card` (`RankingCardData`) z `ranking`: `indicator: { name, unit }`, `year`, `items` = `{ teryt, name, value, valueText: formatValue(value, unit), rank }` dla wszystkich pozycji (pełny ranking, **bez** filtra `q`). Nazwy: `unit.name` z `units` (powiat bez przedrostka „powiat ”, jak w `useShareData`), brak jednostki → `r.name`.
- `Rankings.tsx`: `{ranking && indicator && <RankingsShare … />}` pod paskiem wyboru, nad „Podsumowaniem”. Stany bez rankingu (ładowanie, brak danych) = brak paska.
- Nie zmieniaj `useShareData.ts` ani `ShareBar.tsx` (dane składa nowy plik).

## Testy (tests/unit/rankings-share.test.tsx, dane z `tests/fixtures`, `loadUnits` i `loadIndicatorValues` zamockowane na fixture)
1. Po załadowaniu rankingu `getByRole('button', { name: /Kopiuj link/ })` i `{ name: /Pobierz i udostępnij/ }` są widoczne.
2. Klik „Kopiuj link” → `navigator.clipboard.writeText` dostaje adres zawierający `i=`, `l=`, `y=` z bieżącego stanu; po zmianie wskaźnika w adresie (`?i=…`) skopiowany link ma nowe `i`.
3. Przed załadowaniem wartości (ranking `null`) i przy braku danych pasku nie ma.
4. „Pobierz i udostępnij” → zamockowany `LazyShareDialog` dostaje `isOpen`, `defaultKind="ranking"` i `data.ranking.indicator.name` równe nazwie bieżącego wskaźnika.
5. Przy `?q=gdan` link zawiera `q=gdan`, a `data.ranking.items.length` = liczba pozycji całego rankingu (filtr nie wchodzi do karty).
6. Plik `src/view/pages/Rankings.tsx` ma ≤ 200 linii, a `RankingsShare.tsx` ≤ 200 (test czyta pliki przez `node:fs`).

## Gotowe, gdy
- Pasek widoczny po załadowaniu rankingu, ukryty bez danych (testy 1, 3).
- Link zawiera bieżące `?i=&l=&y=` (test 2) i `q` (test 5).
- „Pobierz i udostępnij” otwiera okno z kartą „ranking” dla bieżącego wskaźnika (test 4).
- Limit rozmiaru plików (test 6); istniejące testy `rankings-*.test.*` bez zmian i zielone.
Nie ruszaj: `ShareBar.tsx`, `ShareDialog.tsx`, `useShareData.ts`, `RankingsFilters.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
