# QC911 – CSV zestawu: sekcja na stronę („Strona n/N”)
Cel: Pobranie danych całego zestawu jako jeden plik CSV z sekcją na każdą stronę, otwierający się wprost w polskim Excelu.
Zmieniaj: src/core/share/deck-csv.ts, tests/unit/deck-csv.test.ts
Wymagane: tests/unit/deck-csv.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/csv.ts (`toCsv`, `indicatorTableCsv`, `profileCsv`, `compareCsv`, `shareFileName` – **użyj ich**, nie pisz drugiego formatera), tests/unit/csv*.test.ts, src/core/share/deck.ts, docs/PRODUKT.md §4b (CSV: UTF-8, „;”, przecinek dziesiętny, rok, źródło)

## Kontekst
Istniejące funkcje CSV tworzą pliki dla jednej karty (wskaźnik dla wszystkich jednostek, profil, porównanie). Zestaw potrzebuje pliku zbiorczego: dla każdej strony nagłówek „Strona n/N – <rodzaj>: <tytuł>” i jej dane, oddzielone pustą linią.

## Research
1. Przeczytaj `toCsv` (separator „;”, cudzysłowy, escaping, BOM?) i zachowaj ten sam format dla sekcji; pierwsza linia pliku = BOM jeśli `toCsv` go dodaje – **BOM tylko raz**, na początku pliku, nie przed każdą sekcją.
2. Które rodzaje stron mają dane tabelaryczne: `map`/`ranking`/`histogram` → wartości jednostek wskaźnika (`indicatorTableCsv`); `table`/`profile` → wiersze wskaźników miejsca; `compare`/`versus` → `compareCsv`; `bignumber`/`trend` → seria lat.
3. Stopka pliku: „Źródło: GUS, Bank Danych Lokalnych; licencja CC BY 4.0”.

## Zadanie
`src/core/share/deck-csv.ts`:
- `export type DeckCsvSection = { title: string; csv: string }` (csv bez BOM).
- `export function deckCsv(sections: DeckCsvSection[], opts?: { pageLabels?: string[] }): string` – składa plik: BOM, dla każdej sekcji linia `Strona n/N;<tytuł>`, treść sekcji, pusta linia; na końcu źródło.
- `export function pageCsv(...)`: cienka funkcja wybierająca właściwą istniejącą funkcję CSV po rodzaju strony (wejście: dane już policzone – przyjmij generyczny `data` i unia; **bez** pobierania czegokolwiek).
- Kodowanie: zwróć string; konwersja do `Blob` UTF-8 jest po stronie widoku.

## Testy
1. 3 strony → 3 sekcje z nagłówkami „Strona 1/3”, „Strona 2/3”, „Strona 3/3”.
2. Separator „;” i przecinek dziesiętny w liczbach (np. `3 465,5` zapisane tak, jak w `csv.ts` – skopiuj konwencję z istniejących testów).
3. Dokładnie jeden BOM (`﻿`) na początku; brak BOM w środku.
4. Tytuł z „;” lub cudzysłowem poprawnie zescapowany.
5. Zestaw z jedną stroną – nagłówek „Strona 1/1” albo pominięty? **Decyzja:** dla N = 1 bez nagłówka strony (zgodnie z kartą bez numeru) – test to utrwala.
6. Stopka ze źródłem i licencją na końcu.
7. Istniejące testy CSV zielone bez zmian.

## Gotowe, gdy
- 3 strony → 3 sekcje z nagłówkami „Strona n/N”; testy zielone; istniejące testy CSV bez zmian.
Nie ruszaj: `csv.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
