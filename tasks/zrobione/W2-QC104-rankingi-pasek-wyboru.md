# QC104 – Pasek wyboru rankingu (wskaźnik, poziom, rok, województwo)
Cel: Komponent z listami wyboru, które naprawdę coś wybierają i znają ograniczenia danych (np. wskaźnik tylko powiatowy wyłącza „Gminy”).
Zmieniaj: src/view/ranking/RankingsFilters.tsx, tests/unit/rankings-filters.test.tsx
Wymagane: tests/unit/rankings-filters.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/ranking/rankings-url.ts (QC101: `RankingsState`, `applyRankingsChange`), src/view/controls/IndicatorPicker.tsx (`IndicatorPicker`), src/view/main/LevelSwitch.tsx, src/view/controls/YearSlider.tsx, src/core/map/main-view.ts (`clampLevel`), docs/PRODUKT.md §4e, docs/STYL.md

## Kontekst
Dziś `Rankings.tsx` ma puste `<select>`y. Ten komponent jest „głupi”: dostaje stan i listy opcji propsami, oddaje zmiany callbackiem. Dzięki temu da się go przetestować bez sieci i bez adresu.

## Research
1. Obejrzyj `IndicatorPicker` – eksportuje też `IndicatorPickerContent`. Użyj gotowego okna wyboru wskaźnika zamiast pisać nowe (spójność z mapą, grupy, wyszukiwanie).
2. `LevelSwitch` – sprawdź, jak oznacza poziom niedostępny; weź ten sam wzorzec dostępności (`aria-disabled`, podpowiedź).
3. Lista województw: weź z jednostek poziomu `woj` (nazwy z `units.json` przez propsy), nie wpisuj na sztywno.

## Zadanie
`src/view/ranking/RankingsFilters.tsx`:
- Props: `{ state: RankingsState; indicators: Indicator[]; years: number[]; availableLevels: UnitLevel[]; voivodeships: { teryt: string; name: string }[]; onChange: (patch: Partial<RankingsState>) => void }`.
- Wskaźnik: przycisk z nazwą bieżącego, otwiera `IndicatorPicker`; wybór → `onChange({ i })`.
- Poziom: grupa 3 przycisków (Województwa/Powiaty/Gminy, `role="radiogroup"`); poziom spoza `availableLevels` ma `aria-disabled="true"` i `title` „Ten wskaźnik nie ma danych na tym poziomie”, klik nie woła `onChange`.
- Rok: lista wyboru z `years` (malejąco), domyślnie najnowszy (`state.y ?? years[0]`); zmiana → `onChange({ y })`.
- Województwo: lista „Cała Polska” + 16 województw; widoczna tylko dla poziomów `pow` i `gmi`; zmiana → `onChange({ w })`.
- Wszystko ≥ 44 px, tokeny, napisy nie wychodzą poza pola; układ zawija się (`flex-wrap`) na 390 px.

## Testy
1. Klik „Powiaty” woła `onChange({ l: 'pow' })`.
2. `availableLevels=['woj','pow']` → „Gminy” ma `aria-disabled`, klik nie woła `onChange`, `title` z podpowiedzią.
3. Zmiana roku woła `onChange({ y: <liczba> })` (liczba, nie string).
4. Lista województw ukryta dla `l='woj'`, widoczna dla `pow`/`gmi`; wybór „Małopolskie” → `onChange({ w: '12' })`.
5. Wybór wskaźnika w oknie → `onChange({ i: '<id>' })` (zamockuj okno, jeśli ciężkie).
6. Brak lat (`years=[]`) → lista roku wyłączona, brak wyjątku.
7. Wszystkie kontrolki mają dostępne nazwy (`getByRole` z nazwą) – test dostępności.

## Gotowe, gdy
- Wybór zmienia stan; „Gminy” wyłączone z podpowiedzią dla wskaźnika powiatowego; testy zielone.
Nie ruszaj: `IndicatorPicker.tsx`, `LevelSwitch.tsx`, `Rankings.tsx`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
