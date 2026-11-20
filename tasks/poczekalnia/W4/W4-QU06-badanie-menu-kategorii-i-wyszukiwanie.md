# QU06 – Badanie: pełne menu kategorii i wyszukiwanie zamiast długiej listy w Bibliotece
Cel: projekt jednego wspólnego menu kategorii z wyszukiwarką (Biblioteka i każde „Dodaj wskaźnik”), które zastąpi „wielką ilość danych” na starcie.
Zmieniaj: docs/research/q2-biblioteka-menu-kategorii.md
Wymagane: docs/research/q2-biblioteka-menu-kategorii.md
Weryfikacja: pnpm lint
Zależy od: nic (runda A). Zasila W5-QU11 (menu w Bibliotece) i QU25 (menu główne).
Kolizje plików: brak – zapisuje tylko własny raport. W kodzie wdrożeniowym `Library.tsx` ruszają też W6-QC806 (kopiuj link) i W6-QC611; `CategoryTiles.tsx` – W5-QU11; podaj w raporcie kolejność.
Przeczytaj najpierw: docs/PRODUKT.md (§4d, §4a), src/view/pages/Library.tsx, src/view/library/CategoryTiles.tsx, src/view/library/LibrarySearchBar.tsx, src/view/library/LibraryFilters.tsx, src/view/library/LibraryResults.tsx, src/view/profile/AddIndicatorWindow.tsx, src/core/library/query.ts, src/core/library/picker-results.ts, src/core/library/index-contract.ts, docs/research/biblioteka-gus.md, docs/research/q2-wydajnosc-biblioteki.md; dane: tests/fixtures/library/index.json i available.json (pełny indeks jest na gałęzi `data`, patrz `src/core/library/config.ts`)

## Kontekst
Uwagi właściciela 2, 10 i 13 (docs/PLAN-UWAGI-19-11.md): brakuje pełnego menu kategorii i wyszukiwania zamiast „wielkiej ilości danych”; „Dodaj wskaźnik” w wielu miejscach od razu pokazuje długą listę zamiast pełnego menu z kategoriami i szukajką – ma być jedno wspólne menu wszędzie; pytanie, czy poziom w Bibliotece to tylko „powiaty / gminy / wszystkie” (dziś etykieta „powiaty” albo „gminy i powiaty”) – propozycja filtru Województwa · Powiaty · Gminy · Wszystkie, zgodnego z poziomami w danych. Decyzja właściciela: #531 porzucone, istniejącego testu podpowiedzi nie zmieniamy – projekt podpowiedzi ma się z nim zgadzać.

## Zadanie
(1) Z indeksu biblioteki (pełny z gałęzi `data`, a gdy sieć niedostępna – fixture; napisz, co użyłeś) wyciągnij drzewo kategorii BDL (poziomy, liczba wskaźników w gałęzi, ile pobranych) – tabela w raporcie. (2) Co pokazuje dziś /biblioteka na starcie (lista 50, kafelki działów) i co jest za duże; gdzie jeszcze jest „Dodaj wskaźnik” (okno w profilu, picker) i czym różni się od Biblioteki. (3) Projekt: start = „Moje wskaźniki” + pasek wyszukiwania + menu kategorii (komputer: drzewo po lewej; telefon: lista wejść z okruszkami „Dział › Grupa”); lista wyników dopiero po wyborze kategorii albo wpisaniu tekstu; licznik; stan w adresie. Jeden wspólny komponent menu dla Biblioteki i okna „Dodaj wskaźnik”. (4) Wyszukiwanie: po nazwie czy też po kategorii; podpowiedzi (tylko pobrane – zgodnie z istniejącym testem); niepobrane = „Zamów”. (5) Uwaga 13: filtr poziomów – zestaw wartości z danych (policz, jakie poziomy występują w indeksie), etykiety, domyślna wartość, wpływ na licznik. (6) Wymagania wydajnościowe (DOM ≤ 1000, brak pełnego indeksu poza /biblioteka – sprawdź progi w PRODUKT §7 i q2-wydajnosc-biblioteki).

## Format raportu (stały, limit ok. 120 linii)
Nagłówki dokładnie w tej kolejności: `## Fakty (plik:linia)` · `## Wnioski` · `## Warianty z kosztem` · `## Rekomendacja` · `## Pytania do właściciela` (pytania tak/nie, numerowane). Każdy fakt ma `plik:linia`; liczby pochodzą z plików danych, nie z pamięci. Czego nie dało się sprawdzić (np. brak sieci) – napisz wprost w „Fakty”, nie zgaduj.

## Testy
Brak – zadanie badawcze (nie zmienia kodu strony). Sprawdzenie: `pnpm lint` oraz przegląd raportu przez Claude.

## Gotowe, gdy
- raport zawiera tabelę drzewa kategorii z liczbami z danych (z oznaczeniem źródła: pełny indeks / fixture)
- raport zawiera szkic ekranu dla 390 i 1280 px (lista bloków i stany: pusty, wynik, brak wyników)
- raport rozstrzyga uwagę 10 (wspólne menu) i 13 (filtr poziomów: wartości z danych, etykiety, domyślny)
- raport kończy się listą zadań dla QU11 z plikami (zgodnie z „Zmieniaj” istniejącego W5-QU11 lub z uzasadnioną korektą)
- sekcje w stałej kolejności z „Format raportu”; ≤ ok. 120 linii; `pnpm lint` przechodzi
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
