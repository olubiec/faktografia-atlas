# QC507 – „Moje wskaźniki” w arkuszu wskaźnika na telefonie
Cel: Ta sama sekcja z listą, × i + na górze arkusza wskaźnika na telefonie (390 px).
Zmieniaj: src/view/main/MobileIndicatorBar.tsx, tests/unit/mobile-bar-my.test.tsx
Wymagane: tests/unit/mobile-bar-my.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/mobile-indicator-sheet.spec.ts
Przeczytaj najpierw: src/view/main/MobileIndicatorBar.tsx, src/view/ui/BottomSheet.tsx, src/view/my-indicators/MyIndicatorsList.tsx, tests/e2e/mobile-indicator-sheet.spec.ts i tests/unit/mobile-*.test.tsx (**istniejące – nie zmieniaj**), docs/PRODUKT.md §5

## Kontekst
Właściciel pracuje z telefonu. Arkusz wskaźnika to dolny panel (`react-modal-sheet`). Lista ma w nim być pierwszą rzeczą, ale nie może psuć przewijania arkusza (testy `bottom-sheet-scroll.spec.ts`).

## Research
1. Jak arkusz przewija zawartość (wewnętrzny kontener) i jak robi to `picker-scroll.spec.ts`; **nie zagnieżdżaj** drugiego przewijanego obszaru wewnątrz listy na telefonie – lista rośnie z arkuszem (7 wierszy × 44 px ≈ 310 px).
2. `MyIndicatorsList` ma prop `compact` – użyj go w arkuszu (mniejsze odstępy, bez zmniejszania celów dotykowych poniżej 44 px).

## Zadanie
- Na górze arkusza (nad dotychczasowym wyborem wskaźnika/roku): `MyIndicatorsList` + `AddIndicatorDialog` jak w QC506; klik w wiersz = `setIndicator` i **zamyka arkusz do pozycji podglądu** (jak dziś po wyborze wskaźnika – zachowaj istniejące zachowanie).
- Okno dodawania na telefonie pełnoekranowe (`Dialog` Radix z klasami tokenowymi), z przyciskiem „Zamknij” ≥ 44 px.
- 390 px: brak poziomego przewijania; × i strzałki nie nakładają się na nazwę (nazwa zawija się).

## Testy (`tests/unit/mobile-bar-my.test.tsx`)
1. Arkusz pokazuje listę z 7 wierszami.
2. Klik w wiersz woła `setIndicator` i zamyka/zwija arkusz tak jak dotychczasowy wybór (porównaj z istniejącym testem – wzorzec asercji).
3. × usuwa wiersz; `+` otwiera okno dodawania.
4. Wszystkie przyciski sekcji ≥ 44 px.
5. Przy 0 wskaźnikach widać „Dodaj pierwszy wskaźnik”.
6. Istniejące testy paska/arkusza zielone bez zmian; e2e `mobile-indicator-sheet.spec.ts` zielony.

## Gotowe, gdy
- Jak QC506, na 390 px bez poziomego przewijania; istniejące testy bez zmian.
Nie ruszaj: `IndicatorPanel.tsx`, `BottomSheet.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
