# PF06 – Test, który wiąże tekst Prywatności z prawdziwym kluczem `MY_INDICATORS_KEY`
Cel: Gdyby klucz listy „Moje wskaźniki” kiedyś się zmienił, test pokaże, że strona Prywatność mówi nieprawdę (brakujący test 3 z QC510).
Zmieniaj: tests/unit/privacy-key-sync.test.tsx
Wymagane: tests/unit/privacy-key-sync.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: tests/unit/privacy-my-indicators.test.tsx (**istniejący – nie zmieniaj**; linie 6–8: klucz wpisany na sztywno z TODO(QC502)), src/core/my-indicators/storage.ts (`MY_INDICATORS_KEY`), src/view/pages/Privacy.tsx (punkt „Moje wskaźniki”), tasks/W1-QC510-prywatnosc-moje-wskazniki.md (test 3)

## Kontekst
QC510 miał w teście 3 brać klucz z eksportu `MY_INDICATORS_KEY`, ale `storage.ts` powstało dopiero w FIX3, więc test dostał stałą wpisaną na sztywno i komentarz TODO. Zmiana istniejącego testu jest zabroniona, dlatego robimy **nowy plik testowy** z prawdziwym importem. Stary test zostaje (właściciel może go kiedyś zastąpić).

## Research (5 min)
Sprawdź, jak istniejący test renderuje `Privacy` (`renderToStaticMarkup` w `MemoryRouter`?) i użyj tego samego sposobu.

## Zadanie
Nowy test importuje `MY_INDICATORS_KEY` z `src/core/my-indicators/storage` i sprawdza stronę Prywatność. Zero zmian w kodzie strony.

## Testy
1. Wyrenderowana strona zawiera klucz z eksportu `MY_INDICATORS_KEY` w elemencie `<code>`.
2. Ta sama strona zawiera zdanie o niewysyłaniu listy („nie wysyłamy”).
3. `MY_INDICATORS_KEY` nie jest pusty i ma prefiks `faktografia-` (klucze strony mają wspólną przedrostkę).
4. Klucz, który faktycznie zapisuje `saveMyIndicators` (atrapa `Storage` zapamiętująca nazwę klucza), jest tym samym kluczem co na stronie.

## Gotowe, gdy
- 4 testy zielone; `tests/unit/privacy-my-indicators.test.tsx` bez zmian i zielony.
Nie ruszaj: `Privacy.tsx`, `storage.ts`, istniejących testów prywatności.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
