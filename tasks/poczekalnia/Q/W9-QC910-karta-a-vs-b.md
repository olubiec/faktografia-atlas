# QC910 – Karta „Duża liczba A vs B” (dwa miejsca, jedna liczba, słowna różnica)
Cel: Karta porównująca wartość jednego wskaźnika w dwóch miejscach: dwie duże liczby i różnica słowami, w neutralnych kolorach.
Zmieniaj: src/core/share/card-versus.ts, tests/unit/card-versus.test.ts
Wymagane: tests/unit/card-versus.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/card-compare.ts (jak dziś rysuje dwa miejsca i różnicę), src/core/compare/compare.ts (słowna różnica), card-bignumber.ts (QC907), text-fit.ts, docs/PRODUKT.md §4a (kolory neutralne, bez zieleni i czerwieni), docs/STYL.md

## Kontekst
Strona „A vs B” dla jednego wskaźnika: po lewej miejsce A z dużą liczbą, po prawej B, pośrodku „vs”, pod spodem słowna różnica („A wyżej o 1,2 p.p.”). Kolory **neutralne** (PRODUKT §4a): nie wolno sugerować „lepsze/gorsze” zielenią i czerwienią – A i B w `tusz`, różnica w `olowek`, ewentualne zakreślenie w `korekta` tylko raz.

## Research
1. Jak `card-compare.ts` formatuje różnicę – dostaniesz ją **gotową jako tekst** w danych (`diffText`), bo liczy ją `core/compare`; ta karta jej nie wylicza.
2. Na wąskich formatach (`post`, `story`) liczby układają się **jedna pod drugą**, w `wide`/`square` obok siebie – sprawdź, który układ da więcej miejsca na długą nazwę „Powiat kędzierzyńsko-kozielski”.

## Zadanie
`src/core/share/card-versus.ts`:
- `export type VersusCardData = { indicator: { name: string; unit?: string }; year: number; a: { name: string; valueText: string }; b: { name: string; valueText: string }; diffText: string }`.
- `export function renderVersusContent(args)` – ta sama sygnatura co `renderRankingContent`.
- Układ adaptacyjny (pionowy/poziomy wg proporcji obszaru treści), nazwy miejsc przez `fitText` (2 linie), liczby przez `fitText` (1 linia), między nimi „vs”.
- **Zero** użycia kolorów zieleni/czerwieni: wyłącznie `tusz`, `olowek`, `linia` (+ opcjonalnie jedno kółko `korekta` wokół różnicy).

## Testy
1. Dwie nazwy i słowna różnica są w scenie („wyżej o 1,2 p.p.”).
2. Najdłuższe nazwy („Powiat kędzierzyńsko-kozielski” × 2) mieszczą się w 4 formatach.
3. Kolory użyte w scenie ⊂ {`tusz`, `olowek`, `linia`, `korekta`, `kalka`} dla obu motywów (żadnych z `data.*`).
4. Pionowy układ w `post`/`story` (A nad B), poziomy w `wide` (A lewo, B prawo – porównaj współrzędne `x`/`y`).
5. Jedno zakreślenie lub brak – nigdy więcej niż jedno.
6. Brak `diffText` (pusty) → nie rysuje pustej linii, bez wyjątku.
7. Wszystko w obszarze treści.

## Gotowe, gdy
- Dwie nazwy i słowna różnica; kolory neutralne; testy zielone.
Nie ruszaj: `card-compare.ts`, `compare.ts`, `card.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
