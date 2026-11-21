# QC501 – Model listy „Moje wskaźniki” (stała podstawowa, dodaj, usuń, przesuń, przywróć)
Cel: Czysta logika listy wskaźników użytkownika z siedmioma podstawowymi na start.
Zmieniaj: src/core/my-indicators/my-indicators.ts, tests/unit/my-indicators.test.ts
Wymagane: tests/unit/my-indicators.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §4f, config/indicators.json (id wskaźników), src/core/profile/profile.ts (`Indicator`)

## Kontekst
Decyzja D1: lista podstawowa ustawiona na sztywno w jednej stałej, każdy wskaźnik można usunąć, dodać dowolny, „Przywróć podstawowe”. Lista może być pusta. Ten moduł nie zna przeglądarki ani Reacta.

## Research
Z `config/indicators.json` weź **dokładne id**: Ludność ogółem=`population`, Gęstość=`density`, Przyrost naturalny=`natural-increase`, Saldo migracji=`migration-balance`, Udział 65+=`share-65plus`, Stopa bezrobocia=`unemployment-rate`, Przeciętne wynagrodzenie=`avg-wage`. Nie wymyślaj innych.

## Zadanie
`src/core/my-indicators/my-indicators.ts`:
- `export const BASIC_INDICATORS: readonly string[] = ['population','density','natural-increase','migration-balance','share-65plus','unemployment-rate','avg-wage']` (komentarz po polsku: „lista podstawowa – jedyne miejsce, gdzie ją zmieniamy”).
- `export type MyIndicators = readonly string[]`.
- `defaultMyIndicators(): MyIndicators` (kopia podstawowej).
- `addIndicator(list, id)` – dopisuje na końcu; jeśli już jest, zwraca **tę samą referencję** (brak zmiany).
- `removeIndicator(list, id)` – usuwa; nieistniejący → ta sama referencja.
- `moveIndicator(list, id, direction: -1 | 1)` – przesuwa o jedno miejsce; na krawędzi nic nie robi (ta sama referencja).
- `resetToBasic()` = `defaultMyIndicators()`.
- `isBasic(list)` – czy lista równa się podstawowej (do wyszarzenia „Przywróć podstawowe”).
- Funkcje niemutujące (zwracają nowe tablice, gdy coś się zmienia).

## Testy
1. `BASIC_INDICATORS` ma 7 pozycji, **każde id istnieje** w `config/indicators.json` (import w teście).
2. `addIndicator` dopisuje na końcu; drugi raz to samo → `Object.is(wynik, wejście)`.
3. `removeIndicator` usuwa; nieistniejący id → ta sama referencja; usunięcie wszystkich → `[]` (lista pusta jest poprawna).
4. `moveIndicator(-1)` pierwszego → bez zmiany; `+1` środkowego zamienia z następnym.
5. `resetToBasic` po usunięciu 3 → 7 podstawowych w kolejności bazowej.
6. `isBasic` true/false; zmiana kolejności = false.
7. Mutacja: funkcje nie zmieniają tablicy wejściowej (zamroź `Object.freeze`).
8. Wskaźnik z biblioteki (`b60614`) da się dodać (id to dowolny string).

## Gotowe, gdy
- Każda operacja przetestowana; dodanie istniejącego nic nie zmienia; 7 id istnieje w configu.
Nie ruszaj: `config/indicators.json`, kodu widoków.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
