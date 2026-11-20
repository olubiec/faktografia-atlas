# QU04 – Badanie: Rankingi – mapa się nie ładuje, układ nielogiczny i nieczytelny
Cel: diagnoza błędów, ocena „przebudować od zera?” i nowy prosty układ strony Rankingi (do zatwierdzenia przez właściciela).
Zmieniaj: docs/research/q2-rankingi-diagnoza.md
Wymagane: docs/research/q2-rankingi-diagnoza.md
Weryfikacja: pnpm lint
Zależy od: nic (runda A). Zasila W5-QU14 (układ) i W5-QU15 (mapa); te dwa ruszają `Rankings.tsx`, więc idą kolejno: QU14, potem QU15.
Kolizje plików: brak – zapisuje tylko własny raport. W kodzie `Rankings.tsx` zazębia się z W4-QC802 (ShareBar) – zaznacz w raporcie, czy nowy układ ją unieważnia.
Przeczytaj najpierw: docs/PRODUKT.md (§4e), src/view/pages/Rankings.tsx, src/view/ranking/RankingBars.tsx, src/view/ranking/RankingsFilters.tsx, src/view/ranking/RankingsList.tsx, src/core/ranking/ranking.ts, src/core/ranking/rankings-filter.ts, src/core/ranking/rankings-summary.ts, src/core/ranking/rankings-url.ts, docs/research/q2-telefon-390.md

## Kontekst
Uwaga właściciela 3 i 21 (docs/PLAN-UWAGI-19-11.md): rankingi „nielogiczne, nieczytelne, mapa się nie ładuje”, „nadal nie działają albo są skrajnie nielogiczne”; po diagnozie decyzja, czy przebudować od zera. Decyzja właściciela: Rankingi zostają osobną stroną.

## Zadanie
(1) Otwórz /rankingi na 390 i 1280 px, z i bez `?i=`, `?l=`, `?w=`, `?y=`, `?q=`, wskaźnikiem z biblioteki, przy wolnej sieci (throttling) i po błędzie 404 danych. Ustal, której „mapy” brakuje (czy §4e każe stronie ją mieć? czy chodzi o mapę wskaźnika w oknie udostępniania?) i dlaczego się nie ładuje – z numerem linii. (2) Audyt czytelności: lista kontrolek w kolejności, jak widzi je użytkownik (pasek „Moje wskaźniki”, poziom, województwo, kierunek, mediana, słupki), co każda robi, ocena 1–3 (jasna / niejasna / dubluje panel mapy). (3) Uwaga 21: porównaj „naprawa w miejscu” z „przebudowa od zera” (koszt w plikach i liniach, ryzyko dla istniejących testów – których nie wolno zmieniać), zarekomenduj jedno. (4) Układ docelowy: nagłówek „Co porównujemy” (wskaźnik, rok, poziom), małe okno mapy (to samo co na mapie głównej bez własnego silnika – albo link „Pokaż na mapie”), 10 najwyżej / 10 najniżej, „pokaż wszystkie”, pozycja wybranego miejsca; szkic jako lista bloków dla 390 i 1280 px. Stan wskaźnika/roku/jednostki z `useMainView`/`useMapSelection`, nie drugi (AGENTS.md).

## Format raportu (stały, limit ok. 120 linii)
Nagłówki dokładnie w tej kolejności: `## Fakty (plik:linia)` · `## Wnioski` · `## Warianty z kosztem` · `## Rekomendacja` · `## Pytania do właściciela` (pytania tak/nie, numerowane). Każdy fakt ma `plik:linia`; liczby pochodzą z plików danych, nie z pamięci. Czego nie dało się sprawdzić (np. brak sieci) – napisz wprost w „Fakty”, nie zgaduj.

## Testy
Brak – zadanie badawcze (nie zmienia kodu strony). Sprawdzenie: `pnpm lint` oraz przegląd raportu przez Claude.

## Gotowe, gdy
- raport podaje przyczynę niezaładowanej mapy (plik:linia) albo dowód, że strona jej nie ma i nie powinna
- raport ma listę kontrolek z oceną czytelności i rozstrzygnięciem „naprawa vs od zera” (uwaga 21)
- raport zawiera szkic układu docelowego (390 i 1280 px) oraz listę zadań dla QU14 i QU15 z plikami i kolejnością
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
