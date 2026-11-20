# QU03 – Badanie: co w nawigacji powiela mapę (Biblioteka, Rankingi, Porównaj) i co zostawić
Cel: macierz „funkcja × strona” i rekomendacja, które strony scalić lub usunąć, żeby nie było kilku miejsc pokazujących to samo co mapa.
Zmieniaj: docs/research/q2-nawigacja-duplikaty.md
Wymagane: docs/research/q2-nawigacja-duplikaty.md
Weryfikacja: pnpm lint
Zależy od: nic (runda A). Zasila W6-QU16 (porządki w nawigacji) i W5-QU12.
Kolizje plików: brak – zapisuje tylko własny raport. Tematycznie zazębia się z QU07 (wariant A = ta sama ścieżka `/?i=b<id>`) i QU04 (Rankingi): raporty niezależne, ale rekomendacje muszą być spójne – cytuj w „Fakty” tylko własne ustalenia.
Przeczytaj najpierw: docs/PRODUKT.md (§3, §4, §4a, §4d, §4e), src/App.tsx, src/view/Header.tsx, src/view/pages/Library.tsx, src/view/pages/LibraryVariable.tsx, src/view/pages/Rankings.tsx, src/view/pages/ComparePage.tsx, docs/research/q2-podstawowe-na-start.md

## Kontekst
Uwaga właściciela 4 (docs/PLAN-UWAGI-19-11.md): „część zakładek można wyrzucić, jeśli powielają sens i działanie; nie ma być kilku stron pokazujących to samo co mapa; stanie się tak z biblioteką”. Uwaga 16: menu główne jest „zawalone”. Decyzje właściciela (obowiązują): Rankingi zostają osobną stroną (wariant B odpada jako rekomendacja, opisz go tylko krótko dla kompletności); rekomendacja wstępna: wariant A.

## Zadanie
Zbuduj macierz: wiersze = funkcje (wybór wskaźnika, mapa kolorów, ranking top/bottom, pełny ranking, wykres lat, wybór roku, porównanie A/B, CSV, udostępnianie, wybór poziomu, wyszukiwanie wskaźnika, kategorie), kolumny = Mapa (`/`), Biblioteka (`/biblioteka`, `/biblioteka/<id>`), Rankingi, Porównaj, panel wskaźnika. Zaznacz, gdzie funkcja jest zduplikowana, gdzie unikatowa i co się psuje na każdej stronie osobno (np. mapa się nie ładuje). Warianty: A) Biblioteka = katalog, który zawsze kończy się wczytaniem wskaźnika na mapie (`/?i=b<id>`), a `/biblioteka/<id>` znika – stare adresy z przekierowaniem (rekomendacja wstępna właściciela); B) Rankingi jako tryb panelu mapy (odrzucone decyzją – tylko krótko); C) bez zmian. Dla każdego: co znika, co przechodzi, tabela przekierowań starych adresów (stare linki muszą działać, także `?i=`, `?y=`, `?l=` z `/rankingi`), ryzyko, koszt w zadaniach (które z W5/W6 dotyka). Co z niepobranymi wskaźnikami (strona „Zamów”) w wariancie A? Zasada: usunięcie funkcji to decyzja właściciela (AGENTS.md) – raport tylko rekomenduje.

## Format raportu (stały, limit ok. 120 linii)
Nagłówki dokładnie w tej kolejności: `## Fakty (plik:linia)` · `## Wnioski` · `## Warianty z kosztem` · `## Rekomendacja` · `## Pytania do właściciela` (pytania tak/nie, numerowane). Każdy fakt ma `plik:linia`; liczby pochodzą z plików danych, nie z pamięci. Czego nie dało się sprawdzić (np. brak sieci) – napisz wprost w „Fakty”, nie zgaduj.

## Testy
Brak – zadanie badawcze (nie zmienia kodu strony). Sprawdzenie: `pnpm lint` oraz przegląd raportu przez Claude.

## Gotowe, gdy
- macierz obejmuje wszystkie 12 wymienionych funkcji i 5 kolumn
- każdy wariant ma tabelę przekierowań starych adresów (stary → nowy → zachowanie parametrów)
- raport kończy się pytaniami do właściciela (tak/nie) i rekomendacją z uzasadnieniem (wstępnie wariant A – potwierdź lub zakwestionuj faktami)
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
