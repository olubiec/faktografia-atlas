# QU07 – Badanie: wskaźnik z biblioteki ma mieć wszystkie funkcje mapy
Cel: wykaz brakujących funkcji dla wskaźnika z biblioteki (mapa, legenda, rok, poziom, ranking, wykres lat, udostępnianie) i plan ich włączenia bez dublowania zadań QC.
Zmieniaj: docs/research/q2-biblioteka-pelna-mapa.md
Wymagane: docs/research/q2-biblioteka-pelna-mapa.md
Weryfikacja: pnpm lint
Zależy od: nic (runda A). Zasila W5-QU12 i QU27 (klik miejsca otwiera mapę); spójne z QU03 (wariant A).
Kolizje plików: brak – zapisuje tylko własny raport. Kolizje wdrożeniowe do opisania w raporcie: `LibraryVariable.tsx` ruszają W5-QU12, W5-QC608, W6-QC804; `useMainView.ts` (chroniony) – W3-QC606; `Library.tsx` – W6-QC806. Podaj proponowaną kolejność (stare zadanie QC zostaje, QU się zawęża).
Przeczytaj najpierw: docs/PRODUKT.md (§4d „Zmiana 17.11.2026”), src/view/pages/LibraryVariable.tsx, src/core/indicators/registry.ts, src/core/indicators/load-any-values.ts, src/view/map/AtlasMap.tsx (tylko czytasz), docs/research/q2-podstawowe-na-start.md, tasks/poczekalnia/Q/W3-QC606-mapa-na-wskazniku-z-biblioteki.md, tasks/poczekalnia/Q/W5-QC608-pokaz-na-mapie-z-biblioteki.md, tasks/poczekalnia/Q/W6-QC804-udostepnianie-wskaznik-biblioteki.md, tasks/poczekalnia/Q/W6-QC806-biblioteka-kopiuj-link.md, tasks/poczekalnia/W5-QU12-biblioteka-wskaznik-otwiera-mape.md; dane: tests/fixtures/library/ (variable-60614.json, index.json, available.json)

## Kontekst
Uwaga właściciela 2 (docs/PLAN-UWAGI-19-11.md): „w bibliotece chyba powinna włączać się normalnie mapa i wszystkie funkcje po wybraniu wskaźnika – przemyśl to”; uwaga 18: klik miejsca w Bibliotece/rankingu/liście ma otwierać mapę z jednostką i danymi wybranego wskaźnika, nie sam profil. Decyzja właściciela: QU03 → wariant A (Biblioteka = katalog prowadzący na mapę, stare adresy z przekierowaniem).

## Zadanie
(1) Wejdź w 3 wskaźniki z biblioteki (pobrany powiatowy, pobrany gminny, niepobrany) na /biblioteka/<id> i na /?i=b<id> (Playwright lub czytanie kodu, gdy dane z sieci niedostępne – napisz, co użyłeś); zapisz, które funkcje działają na każdym adresie (mapa, legenda, klasy, suwak roku, zmiana poziomu, tooltip, kliknięcie → profil, panel, ranking, udostępnianie, kopiuj link). (2) Zmapuj braki na W3-QC606, W5-QC608, W6-QC804, W6-QC806 – dla każdego: pokrywa / dubluje / koliduje (wspólny plik), czy QU12 jest pokryte, a czy dubluje; porównaj z „Zmieniaj” W5-QU12. (3) Wariant „jedna ścieżka” zgodny z A: kliknięcie wskaźnika w bibliotece = nawigacja do `/?i=b<id>` i wczytanie mapy; `/biblioteka/<id>` zostaje tylko dla niepobranych („Zamów”); przekierowania starych adresów. (4) Ograniczenia: profil miejsca nie obejmuje wskaźników biblioteki (PRODUKT §4d), poziomy tylko powiat/gmina, jednostki brakujące. (5) Uwaga 18: jak klik miejsca ma otwierać mapę (podaj mechanizm w istniejących nazwach z kodu).

## Format raportu (stały, limit ok. 120 linii)
Nagłówki dokładnie w tej kolejności: `## Fakty (plik:linia)` · `## Wnioski` · `## Warianty z kosztem` · `## Rekomendacja` · `## Pytania do właściciela` (pytania tak/nie, numerowane). Każdy fakt ma `plik:linia`; liczby pochodzą z plików danych, nie z pamięci. Czego nie dało się sprawdzić (np. brak sieci) – napisz wprost w „Fakty”, nie zgaduj.

## Testy
Brak – zadanie badawcze (nie zmienia kodu strony). Sprawdzenie: `pnpm lint` oraz przegląd raportu przez Claude.

## Gotowe, gdy
- raport ma tabelę „funkcja × adres” dla 3 wskaźników (`/biblioteka/<id>` i `/?i=b<id>`)
- raport wskazuje powielenia i kolizje plików z zadaniami QC606/QC608/QC804/QC806 oraz proponowaną kolejność
- raport zawiera zalecenie wariantu i listę zadań dla QU12 z plikami (z uwzględnieniem, że W5-QU12 i QC608 dotykają tych samych plików)
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
