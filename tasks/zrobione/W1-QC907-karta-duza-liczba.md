# QC907 – Karta „Duża liczba” (liczba, jednostka, miejsce, jedno kółko korekty)
Cel: Karta z jedną ogromną liczbą wskaźnika dla miejsca i zakreśleniem miejsca w rankingu.
Zmieniaj: src/core/share/card-bignumber.ts, tests/unit/card-bignumber.test.ts
Wymagane: tests/unit/card-bignumber.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/card-profile.ts (**duża liczba z miejscem i kółkiem korekty już tam jest** – wzór, nie kopiuj kodu), card.ts (`AnnotationItem` – `kind: 'circle'`), text-fit.ts, tests/unit/card-profile*.test.ts (sprawdzają „jedno kółko”), docs/PRODUKT.md §4b (tabela kart: „duża liczba z miejscem w rankingu (jedno kółko korekty)”), docs/STYL.md (zasada: jedno zakreślenie)

## Kontekst
Strona „Duża liczba” to samodzielna karta: nazwa wskaźnika (mały tytuł), liczba (największa czcionka, jaka się mieści), jednostka, miejsce w rankingu („12. z 380 powiatów”) i **dokładnie jedno** kółko korekty (annotation). Ramę rysuje `cardScene`; to tylko treść. Podłączenie do `cardScene` w QC916.

## Research
Obejrzyj w `card-profile.ts`, jak liczone jest położenie kółka wokół liczby (z `measure`) i jak ustawione `AnnotationItem`. Użyj **tej samej metody** (wyodrębnij nie – skopiowanie 5 linii geometrii jest OK, ale bez dotykania `card-profile.ts`).

## Zadanie
`src/core/share/card-bignumber.ts`:
- `export type BigNumberCardData = { indicator: { name: string; unit?: string }; valueText: string; rankText?: string; unitName: string; year: number }`.
- `export function renderBigNumberContent(args)` – ta sama sygnatura argumentu co `renderRankingContent`.
- Liczba: `fitText` na `valueText` z `maxLines: 1`, startowy rozmiar `5xl`·skala × 1.6, zmniejszany, aż się zmieści w `safeWidth`; wyśrodkowana poziomo i w pionie obszaru treści.
- Pod liczbą jednostka (`indicator.unit`) i, jeśli jest, `rankText`; nad liczbą nazwa wskaźnika i nazwa miejsca.
- Dokładnie **jeden** element `annotation` (kółko wokół liczby); przy `valueText === ''` brak liczby i brak kółka.

## Testy
1. Liczba „3 465” mieści się w polu w 4 formatach.
2. Bardzo długi tekst („1 234 567,89”) zmniejsza czcionkę, nie wychodzi poza `safeWidth`.
3. **Dokładnie jedno** zakreślenie: `items.filter(i => i.type === 'annotation').length === 1`.
4. Puste `valueText` → 0 zakreśleń, brak wyjątku.
5. Z `rankText` – tekst miejsca obecny; bez niego nieobecny, układ nadal wyśrodkowany.
6. Wszystkie elementy mieszczą się w obszarze treści.
7. Kolory z `getThemeColors` dla obu motywów.

## Gotowe, gdy
- Jak QC906; dokładnie jedno zakreślenie; testy zielone.
Nie ruszaj: `card-profile.ts`, `card.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
