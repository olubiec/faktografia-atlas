# Plan – Faktografia Atlas
Cel produktu: interaktywna mapa Polski z danymi GUS, w której użytkownik szuka i porównuje wskaźniki dla województw, powiatów, gmin i miejscowości.

Format sesji: WORKFLOW v3 §5 i §16.4. Wymagania ekranów: `docs/PRODUKT.md` (pierwszeństwo przed MASTER_PLAN). Stary plan fal 0–13 (47 zadań): `docs/archiwum/PLAN-v3.2.md`.

## S14 – Profil miejsca jak makieta 03 (w toku)
Efekt dla użytkownika: po wybraniu miejsca widzi profil z nagłówkiem bez powtórzeń, bieżącym wskaźnikiem (duża liczba + miejsce), rankingiem ze słupkami, zakładkami jednostek podrzędnych, rozwijanymi wskaźnikami (wykres lat, objaśnienie, „Pokaż na mapie”) i „Kopiuj link”; na telefonie to samo w dolnym arkuszu 40% → pełna wysokość.
Paczka: docs/zadania/S14.md (6 zadań) · Testy sesji: e2e „@S14” (tests/e2e/s14-profile.spec.ts)
Kolejność: S14.1 i S14.2 równolegle → S14.3 → S14.4 → S14.5 → S14.6.

## S15 – Objaśnienia wskaźników (szkic)
- Treść `public/data/explanations.json` dla 20 wskaźników wg PRODUKT §6: research Gem Research (źródło z linkiem przy każdej liczbie), sprawdzenie źródeł, **akceptacja właściciela**.
- Zadanie Julesa: wgranie zaakceptowanego pliku + test schematu (kod wczytywania już jest: `src/core/explain/explanations.ts`).
- Przycisk (?) w panelu wskaźnika – sprawdzić, czy pokazuje objaśnienie na prawdziwym pliku.
- Ewentualne poprawki ekranu głównego po obejrzeniu przez właściciela (makieta 02).

## S16 – Porównanie dwóch miejsc (szkic, PRODUKT fala 10)
- Zakładka „Porównaj” w profilu i adres `?c=<teryt,teryt>`.
- Porównanie 2–3 miejsc: wskaźniki obok siebie, ranking z kilkoma wyróżnionymi.

## Później (PRODUKT fala 10 i dalej)
- Blady podkład OpenFreeMap przy dużym zbliżeniu; kreskowanie „brak danych”.
- Tryb ciemny mapy (makieta 05); scena wejścia „kreślenie”.
- Statystyki wyszukiwań po zgodzie (klucz PostHog).
- Tryb 3D „Arkusze”; wersja angielska. Generator karuzel – osobne prywatne repo.
