# QC908 – Karta „Wykres lat” (linia wskaźnika w czasie dla miejsca)
Cel: Karta z wykresem liniowym wartości wskaźnika w kolejnych latach, z osią lat i zaznaczonymi minimum/maksimum.
Zmieniaj: src/core/share/card-trend.ts, tests/unit/card-trend.test.ts
Wymagane: tests/unit/card-trend.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/profile/trend-geometry.ts (**gotowa geometria**: `getValidPoints`, `hasEnoughData`, `calculateYDomain`, `calculateX`, `calculateY`, `getXAxisYears`, `buildSegments`, `buildPathD`), src/view/profile/ (jak profil rysuje wykres trendu – tylko do zrozumienia), card.ts (`PathItem`, `TextItem`), tests/unit/trend*.test.ts, docs/PRODUKT.md §4b

## Kontekst
Profil miejsca ma już wykres trendu (SVG w DOM) z całą geometrią w `trend-geometry.ts`. Karta ma użyć **tej samej geometrii** (jedno źródło prawdy), tylko wygenerować `PathItem`/`TextItem` zamiast SVG w React. Brakujące lata = przerwa w linii (`buildSegments`). Ramę rysuje `cardScene`; podłączenie w QC916.

## Research
1. Przeczytaj eksporty `trend-geometry.ts` i `DEFAULT_DIMENSIONS`. Sprawdź, czy funkcje biorą wymiary (`ChartDimensions`) – tak, przekaż wymiary obszaru treści karty.
2. `hasEnoughData`: poniżej progu (np. < 2 punkty) – profil pokazuje komunikat; karta ma w takim razie narysować **tekst** „Za mało danych do wykresu” zamiast pustej ramki.
3. Skąd dane: `TrendDataPoint[]` (rok, wartość|null). Format wartości z `valueText`-pomocnika wywołującego (karta dostaje już tekst min/max).

## Zadanie
`src/core/share/card-trend.ts`:
- `export type TrendCardData = { indicator: { name: string; unit?: string }; unitName: string; series: TrendDataPoint[]; minText?: string; maxText?: string; lastText?: string }`.
- `export function renderTrendContent(args)` – ta sama sygnatura co `renderRankingContent`.
- Rysuje: oś pionową z 3 podziałkami (`calculateYDomain`), oś lat (`getXAxisYears`, nie więcej niż ~6 etykiet w najwęższym formacie), linię (`buildPathD` po segmentach – **jeden `PathItem` na segment**), punkty min i max z etykietami, ostatnią wartość wyróżnioną kolorem `korektaTekst`.
- Linia w kolorze `tusz`, siatka w `linia`, etykiety `olowek`.

## Testy
1. Seria 2018–2024 bez braków → jeden segment (`PathItem`); etykiety osi lat zawierają 2018 i 2024.
2. Seria z brakiem w 2021 → **dwa** segmenty (przerwa w linii).
3. Za mało danych (1 punkt) → element tekstowy „Za mało danych do wykresu”, brak `PathItem`.
4. Oś lat: w formacie `post` nie więcej niż 6 etykiet i żadna nie wychodzi poza `safeWidth`.
5. Min i max oznaczone (etykiety `minText`/`maxText`), jeśli podane.
6. Wartości identyczne we wszystkich latach (domena zerowa) – bez dzielenia przez zero, linia pozioma pośrodku.
7. Wszystkie elementy mieszczą się w obszarze treści w 4 formatach.

## Gotowe, gdy
- Oś lat z min/max; brakujące lata = przerwa w linii; testy zielone.
Nie ruszaj: `trend-geometry.ts`, `card.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
