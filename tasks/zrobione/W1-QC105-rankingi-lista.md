# QC105 – Lista rankingu (miejsce, nazwa, wartość, słupek, „Pokaż więcej”)
Cel: Czytelna lista z pełnymi nazwami zamiast kodów, po 50 pozycji, klik prowadzi na mapę.
Zmieniaj: src/view/ranking/RankingsList.tsx, tests/unit/rankings-list.test.tsx
Wymagane: tests/unit/rankings-list.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/ranking/RankingBars.tsx (istniejące słupki), src/core/ranking/ranking.ts, src/core/units/label.ts, src/core/format/, docs/STYL.md, src/view/pages/LibraryVariable.tsx (lista „najwyżej/najniżej”, jak formatuje wartości)

## Kontekst
Dziś lista pokazuje `{r.teryt} - {r.value}`. Właściciel nie rozpoznaje kodów. Lista ma być długa (do ~2 500 gmin), więc renderujemy po 50.

## Research
1. Czy `RankingBars` da się użyć jako słupek wiersza? Jeśli tak – użyj; jeśli nie, narysuj słupek jako `div` o szerokości w % (wartość / maksimum), kolor z tokenu.
2. W `docs/INSPIRACJE.md` jest zweryfikowany `@tanstack/react-virtual` (MIT). **Nie dodawaj go**: 50 wierszy + „Pokaż więcej” nie wymaga wirtualizacji. Jeśli po rozwinięciu 2 500 wierszy lista wyraźnie zwalnia (zmierz `performance.now()` renderu w teście), opisz w PR i zatrzymaj się – wtedy osobna decyzja o pakiecie.
3. Wartości ujemne (saldo migracji) – sprawdź, jak `RankingBars` je rysuje, i zachowaj to.

## Zadanie
`src/view/ranking/RankingsList.tsx`:
- Props: `{ items: RankedUnit[]; unitsByTeryt: Map<string, Unit>; unit: string; indicatorId: string; level: UnitLevel; year: number | null; format: (n: number) => string; pageSize?: number /* 50 */ }`.
- Wiersz (`<li>` w `<ol>`): miejsce (`rank`), nazwa z rodzajem (`unitLabel`), wartość z jednostką, słupek (`aria-hidden`, wartość jest w tekście).
- Link wiersza: `/?u=<teryt>&i=<indicatorId>&l=<level>` + `&y=<year>` gdy rok ustawiony (React Router `Link`, nie `<a href>` z pełnym przeładowaniem).
- Pokazuje `pageSize` pozycji; „Pokaż więcej (jeszcze N)” dokłada kolejne `pageSize` i znika, gdy wszystko widać. Po kliknięciu fokus zostaje na przycisku.
- Brak pozycji → „Brak danych dla tego wyboru” (rola `status`).
- Ujemne wartości: słupek w stronę przeciwną lub osobny kolor z tokenu (jak w `RankingBars`).
- Brak nazwy w `unitsByTeryt` → pokaż „Jednostka <teryt>” (ostateczność), nigdy pusty wiersz.

## Testy
1. 120 pozycji → 50 wierszy; po „Pokaż więcej” 100; po drugim 120 i przycisku brak.
2. Żaden wiersz nie zawiera samego 12-cyfrowego kodu jako treści widocznej (sprawdź `textContent` nie pasuje do `/^\d{7,12}$/`).
3. `href` pierwszego wiersza = `/?u=<teryt>&i=density&l=gmi&y=2024` (i bez `&y=` gdy `year=null`).
4. Wartość z jednostką, np. „3 465 os./km²”.
5. Ujemna wartość nie psuje szerokości słupka (0–100%).
6. Pusta lista → komunikat.
7. Lista ma semantykę `ol/li` i pozycje mają numer miejsca czytelny dla czytnika ekranu.

## Gotowe, gdy
- Żadna pozycja nie jest samym kodem; „Pokaż więcej” dokłada 50; link poprawny; testy zielone.
Nie ruszaj: `RankingBars.tsx`, `ranking.ts`, `Rankings.tsx`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
