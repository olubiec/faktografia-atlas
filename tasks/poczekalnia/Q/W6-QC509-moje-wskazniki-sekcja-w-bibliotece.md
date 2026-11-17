# QC509 – Sekcja „Moje wskaźniki” na górze Biblioteki
Cel: Użytkownik widzi i porządkuje swoją listę także z poziomu Biblioteki.
Zmieniaj: src/view/pages/Library.tsx, tests/unit/library-my-section.test.tsx
Wymagane: tests/unit/library-my-section.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/library-page.spec.ts
Przeczytaj najpierw: src/view/pages/Library.tsx (po QC702/QC705), src/view/my-indicators/MyIndicatorsList.tsx, tests/e2e/library-page.spec.ts i tests/unit/library*.test.tsx (**istniejące – nie zmieniaj**), docs/PRODUKT.md §4f

## Kontekst
Decyzja D2: sekcja nad kafelkami działów. Nazwy wskaźników głównych znamy z configu, wskaźników z biblioteki z `available.json` (QC603, wczytywany przez ekran przez QC606). Do czasu wpięcia rejestru (Q7) wiersze z id biblioteki mogą pokazywać id – akceptowalne tymczasowo, opisz w PR.

## Research
1. Czy Biblioteka ma już dostęp do indeksu z nazwami? Tak (`index.json` wczytany na tej stronie) – użyj go do nazw wskaźników `b<id>` (id → `variables`). Zbuduj mapę nazw z indeksu strony + configu, **bez dodatkowego żądania**.
2. „Wejście na `/biblioteka` = jedno żądanie” (PRODUKT §7) – nie dodawaj żądań.

## Zadanie
- Nad kafelkami: nagłówek „Moje wskaźniki” (zwijany, domyślnie rozwinięty) + `MyIndicatorsList` (bez `onSelect` – klik w nazwę prowadzi do `/biblioteka/<id>` dla `b…` albo na mapę `/?i=<id>` dla głównych; użyj `Link`) + „+ Dodaj wskaźnik” otwiera okno QC505.
- Pusty zbiór: zachęta „Dodaj wskaźniki, które chcesz mieć zawsze pod ręką”.
- Układ 390 px bez poziomego przewijania; sekcja nie wypycha wyszukiwarki poniżej pierwszego ekranu (zwinięcie jednym kliknięciem).

## Testy
1. Strona pokazuje sekcję z 7 wierszami; nazwa wskaźnika `b101` (po dodaniu) pochodzi z indeksu.
2. × usuwa wiersz.
3. Klik w wiersz wskaźnika głównego → link `/?i=density` (sprawdź `href`); w wiersz `b101` → `/biblioteka/101`.
4. „+ Dodaj wskaźnik” otwiera okno.
5. Zwinięcie ukrywa listę (`aria-expanded`).
6. Brak dodatkowych żądań sieciowych po dodaniu sekcji (zlicz mock `fetch` = tak jak wcześniej, jedno).
7. Istniejące testy biblioteki zielone bez zmian.

## Gotowe, gdy
- Sekcja widoczna, × działa; jedno żądanie przy wejściu; istniejące testy bez zmian.
Nie ruszaj: `query.ts`, `MyIndicatorsList.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
