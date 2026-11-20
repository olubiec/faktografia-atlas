# QU05 – Badanie: specyfikacja przesuwanego wykresu liniowego lat (własny SVG)
Cel: raport z danymi o latach i gotową specyfikacją wykresu lat (własny SVG, bez nowego pakietu) dla zadania W5-QU13.
Zmieniaj: docs/research/q2-wykres-lat.md
Wymagane: docs/research/q2-wykres-lat.md
Weryfikacja: pnpm lint
Zależy od: nic (runda A). Zasila W5-QU13 (wykres) i QU26 (wspólny komponent z kursorem).
Kolizje plików: brak – zapisuje tylko własny raport. W kodzie wdrożeniowym wykres dotknie `AtlasMap.tsx`/panelu mapy (chronione) i `LibraryVariable.tsx` (też W5-QU12, W6-QC804): wskaż w raporcie kolejność wdrożeń.
Przeczytaj najpierw: docs/PRODUKT.md (§4, §4d), src/core/share/card-trend.ts, src/core/profile/trend.ts, src/core/profile/trend-geometry.ts, src/view/profile/TrendChart.tsx, src/view/profile/TrendAxis.tsx, src/view/profile/TrendPoints.tsx, src/core/data/load-values.ts, src/core/indicators/load-any-values.ts, src/core/library/load-library.ts, docs/ELEMENTY.md, docs/INSPIRACJE.md; dane: public/data/values/*.json (20 wskaźników głównych) i tests/fixtures/library/*.json (biblioteka – pełne dane są na gałęzi `data`, patrz `src/core/library/config.ts`)

## Kontekst
Uwagi właściciela 11 (porównanie: brak wykresów po przedziale czasu, wspólne zestawiające miejsca) i 17 („zobacz wykres”: najechanie kursorem pokazuje dokładne dane; też w rankingach i listach miast) w docs/PLAN-UWAGI-19-11.md. Decyzja właściciela (obowiązuje, nie do rozstrzygania): wykresy lat = własny SVG, bez nowego pakietu. Raport ma więc dać specyfikację, a nie wybierać bibliotekę.

## Zadanie
(1) Gdzie dziś jest wykres lat (profil `TrendChart`, karta „Wykres lat” w `card-trend.ts`) i co z niego da się użyć ponownie (geometria, oś, punkty) – a co trzeba napisać. (2) Histogram liczby lat: ile lat ma każdy z 20 wskaźników głównych (policz skryptem jednorazowym ze `public/data/values`, skrypt poza repozytorium) i wskaźniki z fixture biblioteki; czy wszystkie lata wskaźnika biblioteki są w jednym pliku. Jeśli pełnej biblioteki nie da się pobrać (sieć), napisz to wprost. (3) Miejsca wstawienia: panel wskaźnika na mapie, strona wskaźnika z biblioteki, profil, okno udostępniania, Porównaj (wspólny wykres miejsc – uwaga 11), Rankingi/lista miast (uwaga 17) – dla każdego: plik, rozmiar dostępnego miejsca (390/1280 px), priorytet. (4) Specyfikacja interakcji: jeden stan roku z `useMainView` (suwak roku i punkt na linii zsynchronizowane), przeciągnięcie po linii zmienia rok, kursor/dotyk pokazuje tooltip z dokładną wartością (tekst, bez HTML), linia wybranej jednostki + mediana kraju (+ druga jednostka w Porównaj), klawiatura (strzałki ± rok), cel dotykowy 44 px, reduced motion, tokeny kolorów, zachowanie przy brakach lat (przerwa w linii) i 1–2 latach (sam punkt). (5) Krótka tabela „własny SVG vs pakiet” bez zbierania danych z rejestru: tylko koszt (linie kodu, bajty wejściowego JS, ELEMENTY.md) – uzasadnienie decyzji, nie nowe badanie. (6) Proponowane API: sygnatura czystej funkcji serii w `src/core/charts/year-series.ts` i propsy `YearLineChart` (zgodne z istniejącymi nazwami w kodzie – sprawdź, nie wymyślaj).

## Format raportu (stały, limit ok. 120 linii)
Nagłówki dokładnie w tej kolejności: `## Fakty (plik:linia)` · `## Wnioski` · `## Warianty z kosztem` · `## Rekomendacja` · `## Pytania do właściciela` (pytania tak/nie, numerowane). Każdy fakt ma `plik:linia`; liczby pochodzą z plików danych, nie z pamięci. Czego nie dało się sprawdzić (np. brak sieci) – napisz wprost w „Fakty”, nie zgaduj.

## Testy
Brak – zadanie badawcze (nie zmienia kodu strony). Sprawdzenie: `pnpm lint` oraz przegląd raportu przez Claude.

## Gotowe, gdy
- raport zawiera histogram liczby lat wskaźników (liczby ze `public/data` i z fixture, nie z pamięci)
- raport cytuje uwagi 11 i 17 jako wymagania i mapuje je na miejsca wstawienia
- raport ma tabelę miejsc wstawienia i specyfikację interakcji dla 390 i 1280 px
- raport zawiera proponowane API (funkcja serii + propsy) i listę zadań dla QU13 z plikami; wpis do ELEMENTY.md nie jest potrzebny (brak pakietu) – napisz to wprost
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
