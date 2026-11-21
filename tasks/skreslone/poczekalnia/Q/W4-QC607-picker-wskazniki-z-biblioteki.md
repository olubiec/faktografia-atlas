# QC607 – Okno wyboru wskaźnika zawiera grupę „Z biblioteki GUS”
> **KOREKTA 18.11.2026:** biblioteka ma 1773 pobrane wskaźniki (nie ok. 100). Grupa „Z biblioteki GUS” w pickerze nie może renderować wszystkich naraz: pokazuj wyniki wyszukiwania (do 50 + „Pokaż więcej”) albo kategorie; bez nowych pakietów (wirtualizacja `@tanstack/react-virtual` jest w INSPIRACJE.md jako zweryfikowana, ale nie wchodzi bez decyzji). Eksport `searchIndicators` z `src/core/indicators/reachability.ts` (PF02) zastępuje lokalną kopię filtra.
Cel: W standardowym oknie wskaźników (mapa, rankingi) widać i da się wyszukać pobrane wskaźniki z biblioteki.
Zmieniaj: src/view/controls/IndicatorPicker.tsx, tests/unit/indicator-picker-library.test.tsx
Wymagane: tests/unit/indicator-picker-library.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/picker-scroll.spec.ts
Przeczytaj najpierw: src/view/controls/IndicatorPicker.tsx (`IndicatorPicker`, `IndicatorPickerContent`, grupowanie po `group`), tests/unit/indicator-picker.test.tsx i tests/e2e/picker-scroll.spec.ts (**istniejące – nie zmieniaj**), src/core/indicators/registry.ts, docs/PRODUKT.md §4d

## Kontekst
Po QC606 mapa zna wskaźniki z biblioteki, a `IndicatorPicker` dostaje `indicators: Indicator[]` – po wpięciu rejestru (QC606) będą w nim także wskaźniki `b…`. Trzeba je **pogrupować osobno**, żeby nie zgubić się wśród 20 głównych (i żeby było widać, że to dane z biblioteki).

## Research
1. Sprawdź, jak picker grupuje (`Indicator.group`) i jak działa wyszukiwanie; wskaźniki biblioteki mają `group` = nazwa działu (może się pokrywać z grupami głównych, np. „Ludność”). **Nie mieszaj ich z głównymi:** grupa „Z biblioteki GUS” na dole, podzielona wewnętrznie na działy (nagłówki 2. poziomu).
2. Lista może liczyć setki pozycji – picker już jest przewijany (`picker-scroll.spec.ts`); nie psuj przewijania. Wirtualizacja niepotrzebna (≤ ~300), ale zmierz render w teście (jeśli > 100 ms, opisz w PR).

## Zadanie
- Rozdziel wejściowe `indicators` na główne (`!isLibraryIndicatorId(id)`) i z biblioteki; główne renderuj jak dotąd; biblioteka pod nagłówkiem „Z biblioteki GUS” z etykietą działu.
- Wyszukiwanie (`normalize`) obejmuje obie grupy; przy aktywnym szukaniu grupy puste są ukryte.
- Wybór wskaźnika z biblioteki wywołuje ten sam `onSelect(id)` z id `b…`.
- Gdy na wejściu nie ma wskaźników z biblioteki – picker wygląda i działa **dokładnie jak dotąd** (zgodność z istniejącymi testami).

## Testy
1. Z mieszaną listą (20 głównych + 5 z `available.json` przez `buildRegistry`): jest nagłówek „Z biblioteki GUS” i 5 pozycji pod nim.
2. Szukanie „bezrob” znajduje i „Stopa bezrobocia rejestrowanego (%)” (główny), i „Bezrobotni zarejestrowani” (biblioteka).
3. Wybór pozycji biblioteki → `onSelect('b202')`.
4. Bez wskaźników z biblioteki brak nagłówka „Z biblioteki GUS”; struktura jak w istniejącym teście.
5. Szukanie bez trafień w bibliotece ukrywa jej nagłówek.
6. Istniejące testy pickera i `picker-scroll.spec.ts` zielone bez zmian.

## Gotowe, gdy
- Szukanie znajduje wskaźnik z biblioteki; wybór ustawia `?i=b…` (przez `onSelect`); istniejące testy bez zmian.
Nie ruszaj: `registry.ts`, `IndicatorPanel.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
