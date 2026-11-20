# QC802 – Pasek udostępniania na stronie Rankingi
Cel: `/rankingi` ma „Kopiuj link · Pobierz i udostępnij”; link odtwarza bieżący wybór.
Zmieniaj: src/view/pages/Rankings.tsx, tests/unit/rankings-share.test.tsx
Wymagane: tests/unit/rankings-share.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/pages/Rankings.tsx (po QC106), src/view/share/ShareBar.tsx (QC801), src/view/share/LazyShareDialog.tsx, src/view/share/useShareData.ts (jak dziś przygotowuje kartę „ranking”), docs/PRODUKT.md §4b, §4e, D10

## Kontekst
Okno eksportu dziś ma kartę „ranking” (najwyżej/najniżej). Pasek otwiera to okno (do czasu przebudowy w QC917). Ranking dla `/rankingi` ma tę samą logikę co ranking mapy – korzystamy z gotowej karty.

## Research
Sprawdź w `useShareData.ts`, jakie dane trzeba podać dla karty rankingu (wskaźnik, poziom, rok, jednostki, wartości). Użyj już policzonych w `Rankings.tsx`. **Nie pobieraj** niczego nowego.

## Zadanie
- Dodaj `<ShareBar onOpenDialog={…} />` w `Rankings.tsx` (pod paskiem wyboru, nad listą).
- `url` = bieżący adres z `?i=&l=&y=&w=&q=` (z `writeRankingsSearch`), pełny (`location.origin + pathname + search`).
- `onOpenDialog` otwiera `LazyShareDialog` z rodzajem „ranking” dla bieżącego wyboru (ten sam wskaźnik/poziom/rok; bez filtra `q` – karta pokazuje pełny ranking).
- Pasek ukryty w stanach ładowania i błędu.
- Nie zwiększ wejściowego JS: okno ładuje się po kliknięciu (wzorzec `LazyShareDialog`).

## Testy
1. Po załadowaniu rankingu pasek jest widoczny (`getByRole('button', { name: /Kopiuj link/ })`).
2. „Kopiuj link” kopiuje adres zawierający bieżące `i`, `l`, `y` (zmień wskaźnik i sprawdź, że link się zmienił).
3. W stanie ładowania/błędu pasku nie ma.
4. „Pobierz i udostępnij” otwiera okno (mock `LazyShareDialog`) z propsem rodzaju `ranking` i wskaźnikiem z bieżącego stanu.
5. Filtr `q` nie trafia do danych karty (ale trafia do linku).
6. `Rankings.tsx` nadal ≤ 200 linii (test czyta plik) – jeśli nie, wydziel mały komponent.

## Gotowe, gdy
- Pasek widoczny, link zawiera bieżące `?i=&l=&y=`; testy zielone.
Nie ruszaj: `ShareBar.tsx`, `ShareDialog.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
