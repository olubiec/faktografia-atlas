# QC502 – Zapis „Moich wskaźników” w przeglądarce (bezpieczny odczyt/zapis)
> **KOREKTA 18.11.2026 (docs/PLAN-POPRAWEK.md): NIE PUSZCZAĆ.** `src/core/my-indicators/storage.ts` i `tests/unit/my-indicators-storage.test.ts` powstały w [FIX3] (#479). Brakujący test klucza prywatności robi `W19-PF06`.
Cel: Lista przeżywa odświeżenie strony; zepsuty lub niedostępny zapis nigdy nie wywala aplikacji.
Zmieniaj: src/core/my-indicators/storage.ts, tests/unit/my-indicators-storage.test.ts
Wymagane: tests/unit/my-indicators-storage.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/my-indicators/my-indicators.ts (QC501), docs/PRODUKT.md §4f, src/core/consent (jak aplikacja obsługuje localStorage – tylko do odczytu wzorca; **nie zmieniaj**), tests/unit/consent.test.ts (jak testowany storage)

## Kontekst
Lista „Moje wskaźniki” zapisuje się w `localStorage` pod kluczem `faktografia-my-indicators` (bez kont). Przeglądarka bywa w trybie prywatnym, ma wyłączony zapis albo uszkodzone dane – wtedy wracamy do listy podstawowej, bez błędu.

## Research
Zobacz, jak `src/core/consent` zabezpiecza dostęp do `localStorage` (try/catch przy odczycie i zapisie). Zastosuj ten sam styl. Nie importuj nic z `consent` – tylko wzorzec.

## Zadanie
`src/core/my-indicators/storage.ts`:
- `export const MY_INDICATORS_KEY = 'faktografia-my-indicators'` i `MY_INDICATORS_VERSION = 1`.
- Format zapisu: `{"v":1,"ids":["population", ...]}` (bez wcięć).
- `loadMyIndicators(storage?: Pick<Storage,'getItem'>, isKnown?: (id: string) => boolean): MyIndicators`:
  - brak klucza / brak storage / wyjątek → `defaultMyIndicators()`;
  - zły JSON, zła wersja, `ids` nie jest tablicą → `defaultMyIndicators()`;
  - `ids` filtruj: tylko stringi, bez duplikatów, `isKnown(id)` (domyślnie: id z `config/indicators.json` **lub** wzorzec `^b\d+$` – id z biblioteki; w QC603 spis pobranych będzie dopinany);
  - pusta tablica `ids: []` jest **poprawna** (użytkownik usunął wszystko) → zwraca `[]`, a nie podstawowe.
- `saveMyIndicators(list, storage?)`: zapis w try/catch; zwraca `boolean` (czy się udało); nigdy nie rzuca.
- `storage` domyślnie `globalThis.localStorage` odczytane **wewnątrz** try (samo odwołanie do `localStorage` potrafi rzucić).
- Zero logowania danych użytkownika.

## Testy
1. Zapis i odczyt: lista z dodanym `b60614` wraca identyczna.
2. Zepsuty JSON (`'{'`) → podstawowe. `{"v":2,...}` → podstawowe. `{"v":1,"ids":"x"}` → podstawowe.
3. Nieznane id (`"foo"`) odrzucone, znane zostają; duplikaty usunięte, kolejność zachowana.
4. `{"v":1,"ids":[]}` → `[]`.
5. Storage rzucający w `getItem` i w `setItem` (tryb prywatny) → `load` daje podstawowe, `save` zwraca `false`, brak wyjątku.
6. `globalThis.localStorage` rzucający przy samym dostępie (getter) → bez wyjątku.
7. Zapis nie zawiera wcięć i mieści się w jednej linii; klucz dokładnie `faktografia-my-indicators`.

## Gotowe, gdy
- Zepsuty JSON → podstawowe; tryb prywatny → działa bez błędu; puste `[]` zachowane; testy zielone.
Nie ruszaj: `core/consent`, `my-indicators.ts` (tylko import).

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
