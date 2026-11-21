# QC803 – Pasek udostępniania na stronie Porównaj
Cel: `/porownaj` pokazuje „Kopiuj link · Pobierz i udostępnij”, gdy wybrano dwa miejsca.
Zmieniaj: src/view/pages/ComparePage.tsx, tests/unit/compare-page-share.test.tsx
Wymagane: tests/unit/compare-page-share.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/pages/ComparePage.tsx (po QC203/QC204), src/view/share/ShareBar.tsx, src/view/share/useShareData.ts (karta „compare”), src/core/compare/compare-url.ts, tests/e2e/share-compare.spec.ts (**istniejący – nie zmieniaj**), docs/PRODUKT.md §4a, §4b

## Kontekst
Zakładka „Porównaj” w profilu ma już eksport. Strona `/porownaj` jeszcze nie. Pasek ma się pojawić dopiero, gdy są **dwa** miejsca (jedno nie ma czego udostępniać).

## Research
Zobacz, jak `share-compare.spec.ts` otwiera okno i co w nim jest (karta porównania). Użyj tej samej ścieżki danych – profile obu miejsc są już załadowane na stronie.

## Zadanie
- `<ShareBar url={…} onOpenDialog={…} />` w `ComparePage.tsx`, renderowany **tylko** gdy `pair.a && pair.b` i tabela jest gotowa.
- `url` zawiera `?c=<a>,<b>` (z `writeCompareSearch`).
- `onOpenDialog` otwiera `LazyShareDialog` z rodzajem „compare” dla obu profili.
- Układ: pasek pod tabelą lub nad nią (nie zasłania pól), 390 px bez poziomego przewijania.

## Testy
1. Brak pary / tylko A → paska nie ma; po ustawieniu B → jest.
2. Link w schowku zawiera `?c=<a>,<b>` (dokładne kody z testu).
3. „Pobierz i udostępnij” otwiera okno z rodzajem „compare” i dwoma miejscami.
4. Zamiana A↔B zmienia kolejność w linku.
5. Istniejący `share-compare.spec.ts` (e2e) nadal zielony – uruchom go w weryfikacji.

## Gotowe, gdy
- Pasek tylko przy dwóch miejscach; link z `?c=`; testy zielone.
Nie ruszaj: `ShareBar.tsx`, `compare-url.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
