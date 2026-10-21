# Plan – Faktografia Atlas
Cel produktu: interaktywna mapa Polski z danymi GUS, w której użytkownik szuka i porównuje wskaźniki dla województw, powiatów, gmin i miejscowości.

Format promptów i przebieg sesji: WORKFLOW v5 (§3, §9.1). Wymagania ekranów: `docs/PRODUKT.md` (pierwszeństwo przed MASTER_PLAN). Stary plan fal 0–13 (47 zadań): `docs/archiwum/PLAN-v3.2.md`.

## S14 – Profil miejsca jak makieta 03 (w toku)
Efekt dla użytkownika: po wybraniu miejsca widzi profil z nagłówkiem bez powtórzeń, bieżącym wskaźnikiem (duża liczba + miejsce), rankingiem ze słupkami, zakładkami jednostek podrzędnych, rozwijanymi wskaźnikami (wykres lat, objaśnienie, „Pokaż na mapie”) i „Kopiuj link”; na telefonie to samo w dolnym arkuszu 40% → pełna wysokość.
Paczka: docs/zadania/S14.md (10 zadań; niezależne ruszają od razu: S14.7 zakreślenie przyklejone do tekstu, S14.8 oddalanie mapy, S14.9 przewijanie panelu i listy wskaźników; S14.10 czytelna zmiana w latach zamiast malutkiego wykresu – po S14.2) · Testy sesji: e2e „@S14” (tests/e2e/s14-profile.spec.ts)
Kolejność: S14.1, S14.2, S14.7, S14.8, S14.9 równolegle → S14.10 (po S14.2); S14.3 → S14.4 → S14.5 → S14.6.

## S15 – Poprawki po oglądzie i pomiary (szkic)
Po pierwszym oglądzie ekranu głównego przez właściciela (21.10.2026):
- Legenda w trybie ciemnym: w ciemnym motywie niskie wartości są ciemne, wysokie jasne (celowa paleta `--seq-*`, odwrócona jasność względem jasnego motywu) – dodać do legendy wskazówkę kierunku („mniej → więcej”) i upewnić się, że żaden opis nie mówi „ciemniej”. Decyzja właściciela po obejrzeniu.
- ZWIAD szybkości: Lighthouse (telefon) na podglądzie, rozmiar kodu i danych na wejściu, czas do pierwszej kolorowej mapy; raport z liczbami i propozycją, co skrócić (progi: docs/PRODUKT.md §7).
- ZWIAD danych „miasto” osobno od gminy: czy BDL podaje dane dla części miejskiej i wiejskiej gmin miejsko-wiejskich (kody TERYT z końcówką 4 i 5) [niezweryfikowane] i dla których wskaźników; wynik → `TRYB: DECYZJA`, co pokazać w profilu.
- Zakreślenia wg STYL.md §7: tylko kółko, podkreślenie, nawias, ramka (profil używa dziś typu „highlight” – gruby marker zasłaniający tekst, nie ma go w stylu); najwyżej jedno zakreślenie na ekranie.
- Pozostałe błędy ekranu głównego z oglądu właściciela.

## S16 – Objaśnienia i „Na tle kraju” (szkic, wysoki priorytet)
Wymaganie właściciela (21.10.2026): po kliknięciu wartości widać prostą definicję, **czy to dużo czy mało na tle kraju**, ewentualnie ciekawostkę, i da się przejść do porównań. Nocny robot dorzuca nowe wskaźniki, więc nic nie może wymagać ręcznego tekstu przy każdej liczbie.
Zasada: **kontekst liczy się sam z danych** (`public/data/values/*.json`), a ręczny tekst jest tylko dodatkiem per wskaźnik.
- Liczone automatycznie dla bieżącej jednostki, wskaźnika i roku: miejsce, „wyżej niż X% jednostek tego poziomu”, mediana Polski, najmniej–najwięcej, położenie na prostej skali z zaznaczoną medianą; to samo w obrębie województwa. Źródło zawsze: GUS, BDL, rok.
- Ręczne (opcjonalne, jeden wpis na wskaźnik w `public/data/explanations.json`): prosta definicja (`short`), jak czytać (`howToRead`), ciekawostka ze źródłem (`funFact`), odnośnik do definicji. **Brak wpisu nie psuje nic** – wskaźnik pokazuje sam kontekst; nowy wskaźnik z nocnego robota dostaje kontekst od razu.
- Teksty definicji dla 20 obecnych wskaźników: szkic `docs/data/explanations-szkic.json` (Claude) – właściciel akceptuje.
- Zadania (po S14.2): S16.1 czysta logika `context()` + testy; S16.2 blok „Na tle kraju” w rozwiniętym wierszu profilu i w panelu wskaźnika (odnośniki: „Pokaż na mapie”, najwyżej/najniżej – klik wybiera jednostkę, jednostka nadrzędna); S16.3 wgranie `explanations.json` + test schematu i limitów; S16.4 raport nocny „wskaźniki bez objaśnienia” (lista w `docs/data-report.md`); S16.5 ciekawostki ze źródłami (Gem Research → weryfikacja → akceptacja właściciela, bez liczb z pamięci).

## S17 – Porównanie dwóch miejsc (szkic, PRODUKT fala 10)
- Zakładka „Porównaj” w profilu i adres `?c=<teryt,teryt>`; wskaźniki obok siebie.

## S18 – Ruch i widoczność w wyszukiwarkach (szkic)
- Płynne przejścia: zmiana wskaźnika / poziomu / roku (przejście kolorów mapy), wejście i zamknięcie profilu; zgodnie z STYL.md (ruch tylko w odpowiedzi na działanie, bez sprężyn, wyłączany przy `prefers-reduced-motion`). Scena wejścia „kreślenie”.
- Podstrony gmin pod wyszukiwarki (MASTER_PLAN „Później”): do decyzji po pomiarach z S15 (`TRYB: DECYZJA`).

## Później (PRODUKT fala 10 i dalej)
- Blady podkład OpenFreeMap przy dużym zbliżeniu; kreskowanie „brak danych”; tryb ciemny mapy (makieta 05).
- Statystyki wyszukiwań po zgodzie (klucz PostHog).
- Tryb 3D „Arkusze”; wersja angielska. Generator karuzel – osobne prywatne repo.
