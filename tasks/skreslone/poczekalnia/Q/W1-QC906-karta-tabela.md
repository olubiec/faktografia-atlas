# QC906 – Karta „Tabela” (wskaźnik, wartość, miejsce)
Cel: Nowa karta rysująca tabelę wskaźników wybranego miejsca w ramie istniejących formatów (Post, Kwadrat, Story, Poziomy).
Zmieniaj: src/core/share/card-table.ts, tests/unit/card-table.test.ts
Wymagane: tests/unit/card-table.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/card-ranking.ts (**wzór** `renderRankingContent`), card-profile.ts, card.ts (`CardItem`, `getThemeColors`), text-fit.ts (`fitText`, `MeasureFn`), tests/unit/card-ranking*.test.ts (jak testują sceny i `text-fit`), config/tokens.json (`font.scale`, `font.weights`), docs/PRODUKT.md §4b

## Kontekst
Strona „Tabela” w eksporcie pokazuje listę wskaźników (z „Moich wskaźników”) dla miejsca: nazwa wskaźnika, wartość z jednostką, miejsce w rankingu. Ramę karty (logo, tytuł, stopka z n/N) rysuje `cardScene` – ta funkcja dorysowuje **tylko treść** w obszarze treści (jak `renderRankingContent`). Podłączenie do `cardScene` robi QC916 – **nie edytuj `card.ts` tutaj**.

## Research
1. Przeczytaj `renderRankingContent` i `renderProfileContent`: skala (`scaleFactor = width/1080`), `fontScale`, sposób dodawania elementów (`items.push`). Zachowaj ten sam styl i te same pola argumentu.
2. `fitText`: używaj do nazw wskaźników (maks. 2 linie; skraca rozmiar, nie wychodzi poza pole). Najdłuższa nazwa w projekcie to np. „Przeciętna pow. użytkowa mieszkania na osobę (m²)” – to jest przypadek testowy.
3. Wysokość wierszy ma się dostosować do liczby wierszy (limit z QC904 – 8 w Post, 10 w Story; tu nie liczysz limitu, rysujesz tyle, ile dostałeś, ale **nigdy poza `availableContentHeight`**: gdy za dużo, zmniejsz czcionkę do minimum `xs`, a jeśli nadal za dużo – narysuj tyle, ile się mieści, i dodaj ostatni wiersz „… jeszcze N wskaźników”).

## Zadanie
`src/core/share/card-table.ts`:
- `export type TableCardRow = { name: string; valueText: string; rank?: string /* np. „12. z 380” */; selected?: boolean }`.
- `export type TableCardData = { unitName: string; year: number; rows: TableCardRow[] }`.
- `export function renderTableContent(args)` o **takiej samej sygnaturze argumentu** jak `renderRankingContent` (`data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor`).
- Układ: 3 kolumny (nazwa ~55% szerokości, wartość ~25%, miejsce ~20%), cienka linia rozdzielająca (`RectItem` o wysokości 1 px·scale, kolor `linia`), wartość wyrównana do prawej, nagłówek kolumn („Wskaźnik”, „Wartość”, „Miejsce”) w kolorze `olowek`.
- Tylko kolory z `getThemeColors(theme)` – żadnych wpisanych na sztywno (test `no-hardcoded-colors`).

## Testy
1. Najdłuższa nazwa mieści się w polu kolumny w **4 formatach** (`post`, `square`, `story`, `wide`) – test z `fitText` i miarą testową: żaden `TextItem` nie ma `x + maxWidth` poza `width - safe.right`.
2. 8 wierszy w `post`: wszystkie elementy mieszczą się w `contentTop … contentTop + availableContentHeight`.
3. 30 wierszy → rysuje tyle, ile się mieści + wiersz „… jeszcze N wskaźników”; nic nie wychodzi poza obszar.
4. Wiersz z `selected: true` ma kolor `korektaTekst`, pozostałe `tusz`.
5. Puste `rows` → tylko nagłówek lub nic (bez wyjątku).
6. Tekst wartości wyrównany do prawej (`align: 'right'`).
7. Każdy kolor w elementach należy do zbioru z `getThemeColors('light'|'dark')`.

## Gotowe, gdy
- Najdłuższa nazwa mieści się w 4 formatach; nic nie wychodzi poza obszar treści; testy zielone.
Nie ruszaj: `card.ts`, `card-ranking.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
