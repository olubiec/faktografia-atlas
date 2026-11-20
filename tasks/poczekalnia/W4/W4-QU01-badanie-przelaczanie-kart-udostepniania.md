# QU01 – Badanie: dlaczego przełączanie stron w „Pobierz i udostępnij” szwankuje po dodaniu kart
Cel: raport z odtworzeniem błędu i dokładną przyczyną (bez zmiany kodu strony).
Zmieniaj: docs/research/q2-udostepnianie-przelaczanie.md
Wymagane: docs/research/q2-udostepnianie-przelaczanie.md
Weryfikacja: pnpm lint
Zależy od: nic (start od razu, runda A).
Kolizje plików: brak – zapisuje tylko własny raport. Wynik zasila W5-QU10 (ShareDialog.tsx, ShareControls.tsx) i W5-QU24/QU02; te zadania wdrożeniowe ruszają te same pliki, więc idą po kolei po tym raporcie.
Przeczytaj najpierw: src/view/share/ShareDialog.tsx, src/view/share/ShareControls.tsx, src/view/share/DeckStrip.tsx, src/view/share/AddPageMenu.tsx, src/core/share/deck.ts, src/core/share/deck-page-data.ts

## Kontekst
Uwaga właściciela 1 (docs/PLAN-UWAGI-19-11.md): po dodaniu kart przełączanie między stronami szwankuje; każdy rodzaj karty ma być tylko raz. Uwaga 15 (strzałki ‹ › i „×” nielogiczne) dotyczy DeckStrip.tsx – opisz stan dzisiejszy, wdrożenie to osobne zadanie.

## Zadanie
Odtwórz błąd w Playwright (390 px i 1280 px; zrzuty tylko do własnej analizy, nie do repozytorium): otwórz okno z mapy, profilu, porównania i rankingów; dodaj po kolei każdy rodzaj strony z „+ Dodaj stronę” (Mapa, Ranking najwyżej/najniżej, Tabela, Duża liczba, Wykres lat, Rozkład, Profil, Porównanie, A vs B); klikaj kafelki w pasku, ‹ ›, ×, przełącznik rodzaju w ShareControls. Dla każdej akcji zapisz: co użytkownik widzi, czego się spodziewał, dlaczego. Hipotezy do potwierdzenia lub obalenia z numerem linii: (1) `availableKinds` w ShareDialog zna tylko map/ranking/profile/compare/versus, więc strony table/bignumber/trend/histogram spadają na `availableKinds[0]` i podgląd pokazuje inną kartę niż kafelek; (2) `onSelectKind` w ShareControls nadpisuje rodzaj bieżącej strony (powstają duplikaty); (3) `dataForPage` i `activeCardData` nie liczą się z opcjami strony (side). Wynik: tabela „akcja → objaw → przyczyna (plik:linia)”, lista duplikatów treści, propozycja naprawy z podziałem na pliki (dla QU10 i QU02).

## Format raportu (stały, limit ok. 120 linii)
Nagłówki dokładnie w tej kolejności: `## Fakty (plik:linia)` · `## Wnioski` · `## Warianty z kosztem` · `## Rekomendacja` · `## Pytania do właściciela` (pytania tak/nie, numerowane). Każdy fakt ma `plik:linia`; liczby pochodzą z plików danych, nie z pamięci. Czego nie dało się sprawdzić (np. brak sieci) – napisz wprost w „Fakty”, nie zgaduj.

## Testy
Brak – zadanie badawcze (nie zmienia kodu strony). Sprawdzenie: `pnpm lint` oraz przegląd raportu przez Claude.

## Gotowe, gdy
- raport ma tabelę dla każdego z 10 rodzajów stron (co pokazuje podgląd po wybraniu kafelka)
- raport wskazuje przyczynę z numerem linii dla każdej z 3 hipotez (potwierdzona / obalona)
- raport kończy się listą zadań naprawczych z plikami (dla QU10 i QU02)
- sekcje raportu są w stałej kolejności z „Format raportu”; plik ma ≤ ok. 120 linii; `pnpm lint` przechodzi
Nie ruszaj: kod strony (src/, tests/), `config/`, `public/`, `.github/`, `package.json`, `docs/PRODUKT.md`, `docs/STAN.md`, `docs/ELEMENTY.md`, innych plików zadań. Zapisujesz wyłącznie raport z linii „Zmieniaj”. Pliki z „Przeczytaj najpierw” tylko czytasz; innych nie czytasz.
Wykonanie: sub-agent z modelem sonnet; czyta tylko pliki wymienione w „Przeczytaj najpierw”; bez commitów (commit/PR robi Claude po zgodzie właściciela); odpowiedź zwrotna ≤150 słów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
