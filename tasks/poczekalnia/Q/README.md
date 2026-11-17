# Plan Q – prompty zadań (17.11.2026)

70 plików `W<fala>-QC<cel><nn>-<nazwa>.md` (7 fal; w fali zadania nie dzielą plików i nie zależą od siebie, więc idą równolegle) plus `QC601-CLAUDE-…md` (robot biblioteki robi Claude, nie pętla) (np. `W3-QC106-rankingi-zlozenie-strony.md` = fala Q3, zadanie C1-6). Plan i decyzje: `../PLAN-UWAGI-17-11.md`. Pętla ignoruje ten katalog.

## Jak puścić falę
1. Poprzednia fala scalona i zielona (plus punkt kontrolny właściciela, jeśli jest w planie §4).
2. `cp tasks/poczekalnia/Q/W<n>-*.md tasks/` (bez `README.md` i `waves-Q.fragment.yaml`).
3. Do `waves.yaml` wklej blok `- id: q<n>` z `Q/waves-Q.fragment.yaml`.
4. Push na `main`. **QC601** wykonuje Claude, nie pętla (celowo nie ma go we fragmencie).

## Co jest w każdym prompcie
Cel · `Zmieniaj` / `Wymagane` / `Weryfikacja` (linie czytane maszynowo) · **Przeczytaj najpierw** (konkretne pliki i funkcje) · **Kontekst** (skąd uwaga właściciela, co jest dziś w kodzie) · **Research** (co sprawdzić przed kodem: istniejące funkcje do ponownego użycia, pakiety już w repo, dokumentacja MapLibre/deck.gl, zweryfikowane wpisy z `docs/INSPIRACJE.md`; **bez nowych pakietów**) · **Zadanie** (pliki, funkcje, sygnatury) · **Testy** (numerowana lista przypadków) · **Gotowe, gdy** · **Nie ruszaj** · wspólna stopka z zasadami AGENTS.md.

Zadania z zadaniem badawczym: QC401 (raport pomiaru ruchu mapy – nadrzędny dla QC402–QC405). Zadania, które wprost dostają zgodę na pliki ekranu: QC402, QC403, QC404, QC405, QC606 (reszta plików ekranu zakazana).

## Reguła zgodności
Prawie każdy prompt zawiera zdanie „istniejące testy … nie mogą się zmienić ani paść”. Gdy nowa funkcja koliduje ze starym testem, rozwiązaniem jest **opcjonalny prop / nowa funkcja obok starej**, nigdy zmiana testu. Gdzie to się nie da – agent ma się zatrzymać i opisać w PR.

## Decyzje podjęte przy pisaniu promptów (do Twojej wiadomości)
- Format spisu pobranych `available.json`: `{"version":1,"generatedAt","variables":[{"id","n","u","s","c","lv":["woj|pow|gmi"],"y":[lata]}]}` – wzór: `tests/fixtures/library/available.json` (5 wskaźników, w tym tylko powiatowe). Wskaźniki z biblioteki mają id `b<id>` (adres `?i=b60614`).
- Limity tabeli na karcie: Post 8 wierszy, Story 10 (z planu); Kwadrat i Poziomy – propozycja 6 i 5, **potwierdza je test w QC904** (wiersze mają się mieścić w obszarze treści).
- Karty bez numeru przy jednej stronie; numer „n/N” w stopce (QC905).
- „Pobierz wszystkie” = N kolejnych plików PNG (bez ZIP); „Udostępnij zestaw” na telefonie wysyła je systemowym oknem.
- Tabela „Porównaj” pokazuje wiersze z listy „Moje wskaźniki” (nie wszystkie 20); pusta lista → zachęta do dodania (QC205). Jeśli istniejące testy zakładają 20 wierszy – agent się zatrzyma i zapyta.
- Tekst w Prywatności: jedno zdanie o kluczu `faktografia-my-indicators` (QC510).
