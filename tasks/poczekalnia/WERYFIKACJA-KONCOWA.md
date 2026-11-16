# Weryfikacja końcowa nocy (2026-11-16)

Gałąź: claude/laughing-pasteur-8af8jz, bez zmian w kodzie i testach.

## Krok 1: lint, typecheck, test, build
Wszystko zielone. Vitest: 166 plików, 1045 testów, 0 czerwonych. Build przechodzi (tylko ostrzeżenie o chunkach > 500 kB: AtlasMap, ProfileCompareTable, index).

## Krok 2: e2e (Playwright, chromium, `--workers=1 --trace off`, środowisko bez GPU)
Pełny przebieg przerwany limitem 30 min na teście 347/491 (profile-sheet-inset). Reszta (146 testów, od `profile-sheet-inset` alfabetycznie do `ui`) uruchomiona osobno w 15,2 min.
- Część 1 (pliki do `profile-parts`, ok. 345 testów): 9 czerwonych, reszta zielona.
- Część 2 (146 testów): 142 zielone, 4 czerwone.
- Razem: 491 testów, ok. 478 zielonych, 13 czerwonych. Liczby części 1 są przybliżone (przebieg przerwany limitem czasu, bez podsumowania Playwrighta).

## Czerwone testy e2e
| # | Test | Przyczyna | Na baseline? |
|---|---|---|---|
| 1 | s21-library „pełna ścieżka” komputer | test: licznik żądań liczy `values/density.json` pobrany przez mapę na `/` (grupa 4a) | tak, DIAGNOZA 4a/4b (czeka na decyzję) |
| 2 | s21-library „pełna ścieżka” telefon | j.w. | tak |
| 3 | library-search „1 żądanie spisu index.json” (URL zostaje `?q=ludnosc`, brak `k=1`) | test lub aplikacja, niezbadane; po zmianie P3-C/N-29 | nie ma w DIAGNOZIE, do zbadania |
| 4 | compare-maps „touch targets” (0 elementów `[data-slot=compare-map]`) | test: selektor niezgodny z obecnym DOM, lub ładowanie; niezbadane | nie ma w DIAGNOZIE |
| 5 | home „loads properly” (strict mode: 2 logo `alt="Faktografia"`, nagłówek i stopka) | test: selektor zbyt szeroki po dodaniu logo w stopce | nie ma w DIAGNOZIE |
| 6-7 | mobile-sheet-map-visible 390 i 360 (arkusz startuje wyżej niż 35% w limicie 5 s) | środowisko bez GPU (animacja arkusza dłuższa niż limit) lub aplikacja; niepotwierdzone | nie ma w DIAGNOZIE |
| 8 | picker-scroll „picker mieści się w viewport” (brak przycisku z tekstem „Wskaźnik”) | test: stary selektor tekstu przycisku | nie ma w DIAGNOZIE |
| 9 | picker-scroll „panel przewija się do końca” (źródło w sr-only, ratio 0) | test: sprawdza widoczność elementu `sr-only` | nie ma w DIAGNOZIE |
| 10 | picker-scroll „brak poziomego przewijania i pola dotykowe” (brak przycisku „Wskaźnik”) | test: stary selektor | nie ma w DIAGNOZIE |
| 11 | profile-overview „?u=12 ... 10 pozycji, 16 po Pokaż wszystkie” (brak wyróżnionego województwa) | test: selektor `.text-korekta` / `font-bold` nieaktualny; niezbadane | nie ma w DIAGNOZIE |
| 12 | share-compare „360 i 390 px ... axe” | błąd aplikacji (a11y): `heading-order`, `<h4 class="sr-only">Przypisy</h4>` przeskakuje poziom nagłówka | nie ma w DIAGNOZIE |
| 13 | tune „tab Typografia ... .text-md” (computed font-size null) | test: brak elementu `.text-md` (klasy z tokenów) | nie ma w DIAGNOZIE |

Pozycje 1-2 są znane z DIAGNOZA-E2E.md (4a/4b). Pozostałe 11 nie występują w DIAGNOZIE ani w NOC-RAPORT.md, więc nie da się potwierdzić, że są na baseline; NOC-RAPORT wspomina tylko camera.spec i profile-mobile.spec (te przeszły). Przyczyny podane jako „test” wynikają z odczytu komunikatu błędu, bez uruchamiania na czystym stanie (nie robiono stash/checkout na starszym commicie).

## Zielone, które DIAGNOZA wymieniała jako czerwone
camera.spec, responsive-resize, library-page axe, s20-parts, compare-table, profile-row, profile-mobile i library-search „podpowiedzi”/„Filtry” nie wystąpiły na liście czerwonych (zadania N-25..N-32 zadziałały).

## Do decyzji właściciela
- s21-library (2 testy): zmiana istniejącego testu wg DIAGNOZA 4a/4b.
- share-compare: błąd aplikacji, poprawka nagłówka „Przypisy” (h4 -> poziom zgodny).
- Reszta (compare-maps, home, picker-scroll x3, profile-overview, tune, mobile-sheet-map-visible x2, library-search): zbadać po jednym, czy test jest nieaktualny, czy aplikacja się zmieniła.
