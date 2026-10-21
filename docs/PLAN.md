# Plan – Faktografia Atlas
Cel produktu: interaktywna mapa Polski z danymi GUS, w której użytkownik szuka i porównuje wskaźniki dla województw, powiatów, gmin i miejscowości.

Format sesji: WORKFLOW v3 §5 i §16.4. Wymagania ekranów: `docs/PRODUKT.md` (pierwszeństwo przed MASTER_PLAN). Stary plan fal 0–13 (47 zadań): `docs/archiwum/PLAN-v3.2.md`.

## S14 – Profil miejsca jak makieta 03 (w toku)
Efekt dla użytkownika: po wybraniu miejsca widzi profil z nagłówkiem bez powtórzeń, bieżącym wskaźnikiem (duża liczba + miejsce), rankingiem ze słupkami, zakładkami jednostek podrzędnych, rozwijanymi wskaźnikami (wykres lat, objaśnienie, „Pokaż na mapie”) i „Kopiuj link”; na telefonie to samo w dolnym arkuszu 40% → pełna wysokość.
Paczka: docs/zadania/S14.md (8 zadań; S14.7 zakreślenie przyklejone do tekstu i S14.8 oddalanie mapy – niezależne, ruszają od razu) · Testy sesji: e2e „@S14” (tests/e2e/s14-profile.spec.ts)
Kolejność: S14.1, S14.2, S14.7, S14.8 równolegle → S14.3 → S14.4 → S14.5 → S14.6.

## S15 – Poprawki po oglądzie i pomiary (szkic)
Po pierwszym oglądzie ekranu głównego przez właściciela (21.10.2026):
- Legenda w trybie ciemnym: w ciemnym motywie niskie wartości są ciemne, wysokie jasne (celowa paleta `--seq-*`, odwrócona jasność względem jasnego motywu) – dodać do legendy wskazówkę kierunku („mniej → więcej”) i upewnić się, że żaden opis nie mówi „ciemniej”. Decyzja właściciela po obejrzeniu.
- ZWIAD szybkości: Lighthouse (telefon) na podglądzie, rozmiar kodu i danych na wejściu, czas do pierwszej kolorowej mapy; raport z liczbami i propozycją, co skrócić (progi: docs/PRODUKT.md §7).
- ZWIAD danych „miasto” osobno od gminy: czy BDL podaje dane dla części miejskiej i wiejskiej gmin miejsko-wiejskich (kody TERYT z końcówką 4 i 5) [niezweryfikowane] i dla których wskaźników; wynik → `TRYB: DECYZJA`, co pokazać w profilu.
- Pozostałe błędy ekranu głównego z oglądu właściciela.

## S16 – Objaśnienia wskaźników (szkic)
- Treść `public/data/explanations.json` dla 20 wskaźników wg PRODUKT §6: research Gem Research (źródło z linkiem przy każdej liczbie), sprawdzenie źródeł, **akceptacja właściciela**.
- Zadanie Julesa: wgranie zaakceptowanego pliku + test schematu (kod wczytywania już jest: `src/core/explain/explanations.ts`).

## S17 – Porównanie dwóch miejsc (szkic, PRODUKT fala 10)
- Zakładka „Porównaj” w profilu i adres `?c=<teryt,teryt>`; wskaźniki obok siebie.

## S18 – Ruch i widoczność w wyszukiwarkach (szkic)
- Płynne przejścia: zmiana wskaźnika / poziomu / roku (przejście kolorów mapy), wejście i zamknięcie profilu; zgodnie z STYL.md (ruch tylko w odpowiedzi na działanie, bez sprężyn, wyłączany przy `prefers-reduced-motion`). Scena wejścia „kreślenie”.
- Podstrony gmin pod wyszukiwarki (MASTER_PLAN „Później”): do decyzji po pomiarach z S15 (`TRYB: DECYZJA`).

## Później (PRODUKT fala 10 i dalej)
- Blady podkład OpenFreeMap przy dużym zbliżeniu; kreskowanie „brak danych”; tryb ciemny mapy (makieta 05).
- Statystyki wyszukiwań po zgodzie (klucz PostHog).
- Tryb 3D „Arkusze”; wersja angielska. Generator karuzel – osobne prywatne repo.
