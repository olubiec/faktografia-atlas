# D05 – Premiera w kalendarium GUS = pobranie w pierwszej kolejności (tego samego dnia) i wpis do księgi kalendarium
Cel: gdy GUS opublikuje temat, który mamy we wskaźnikach głównych albo w bibliotece, robot pobiera go przed wszystkim innym, w ciągu kilku godzin. Każda premiera trafia do księgi kalendarium ze stanem: zaplanowana → pobrana / odrzucona (z powodem). Księga jest podstawą etykiety „Nowość” (W28-D06), tablicy kalendarium (W28-D07) i materiałów (W29-D08).
Zmieniaj: scripts/data/gus-calendar.mjs, scripts/data/library-plan.mjs, scripts/data/library.mjs, scripts/data/premieres.mjs, config/library-priority.json, .github/workflows/fetch-data.yml, .github/workflows/fetch-library.yml, tests/fixtures/gus-calendar/*, tests/unit/w27-d05-premieres.test.ts
Wymagane: tests/unit/w27-d05-premieres.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: scripts/data/gus-calendar.mjs, scripts/data/library-plan.mjs (`refreshCandidates`, `calendarMax`), scripts/data/library.mjs (l. 200–240), scripts/data/probe-new-year.mjs, .github/workflows/fetch-data.yml, .github/workflows/fetch-library.yml, config/library-curation.json, tasks/W27-D01-nowe-wskazniki-glowne.md (zasada „nie niszowe”)

Stan dziś:
- Kalendarium daje zmiennej biblioteki najwyżej 10 pkt premii.
- Na przebieg sprawdza najwyżej 10 zmiennych pasujących do publikacji, i tylko z ostatnich 3 dni.
- Biblioteka chodzi o 04:40 i 16:40 UTC, a wskaźniki główne raz na dobę o 01:10 UTC.

Zadanie:
1. **Przyszłe premiery.**
   - `loadCalendar` dostaje opcję `ahead` (domyślnie 14 dni naprzód). Sprawdź na prawdziwej podstronie dnia z przyszłości, czy GUS ją publikuje (harmonogram), i nagraj ją do `tests/fixtures/gus-calendar/`.
   - Jeśli przyszłych podstron nie ma albo są puste, zostaw `ahead = 0`, opisz to w PR i rób resztę.
   - Jeśli sieć sesji blokuje `stat.gov.pl`, użyj fikstur już nagranych w repo albo napisz w PR i zatrzymaj się na tej części.
2. **Dopasowanie** (`scripts/data/premieres.mjs`, czyste funkcje).
   - Publikacja (tytuł, data, link) jest łączona z wskaźnikami głównymi (`config/indicators.json`, po nazwie i grupie) i ze zmiennymi biblioteki (po rdzeniach, jak `calendarHits`, ale z wymogiem ≥ 2 trafień, żeby „ludność” nie łapała połowy katalogu).
   - Wynik: `{ date, title, href, main: [id], library: [varId] }`.
3. **Priorytet.**
   - Zmienne z publikacji z dziś i wczoraj idą na początek kolejki biblioteki, przed przypiętymi (`pinnedIds`), z limitem `premiereMax` (w `config/library-priority.json`, start: 40 na przebieg). Limity API BDL nadal sprawdza `checkWindows`.
   - `calendarMax` nie dotyczy premier.
4. **Wskaźniki główne tego samego dnia.** W `fetch-data.yml` dodaj drugi cron około 10:40 UTC (GUS publikuje zwykle o 10:00 czasu polskiego). Ten przebieg:
   - robi sondę nowego roku (`probe-new-year.mjs`) **tylko** dla wskaźników głównych dopasowanych do dzisiejszych publikacji;
   - bez dopasowań kończy się od razu, z zerem zapytań do BDL.

   Biblioteka: w `fetch-library.yml` dodaj przebieg około 11:10 UTC, ograniczony do premier. Reszta obu workflowów bez zmian.
5. **Księga kalendarium** `library/calendar.json` na gałęzi `data/library`, zapisywana przez `fetch-library` obok `library/status.json`, bez PR:
   - wpis na każdą publikację z dopasowaniem;
   - stany zmiennych:
     - `planned` – data w przyszłości;
     - `waiting` – opublikowano, BDL nie ma jeszcze nowego roku; sprawdzaj przez 14 dni;
     - `downloaded` – nowy rok pobrany, z datą;
     - `rejected` – z powodem: `niszowe` (zasada z W27-D01), `brak-gmin`, `brak-nowego-roku-14-dni` albo `poza-wytycznymi` (curation);
   - wpisy starsze niż 90 dni wypadają;
   - plik bez wcięć, deterministyczny dla tych samych danych.

Gotowe, gdy:
- Testy na nagranych podstronach kalendarium:
  - publikacja o urodzeniach dopasowuje wskaźnik główny z grupy Ludność i zmienne biblioteki z „urodzenia”;
  - ogólny tytuł z jednym trafieniem nie dopasowuje niczego.
- Test: zmienne premiery z dziś są na początku kolejki, przed `pinnedIds`, a jest ich nie więcej niż `premiereMax`.
- Test: przebieg „premierowy” wskaźników głównych bez dopasowań nie robi żadnego zapytania (wstrzyknięty fetch nie jest wołany).
- Test księgi: przejścia `planned` → `waiting` → `downloaded`; `waiting` po 14 dniach → `rejected` z powodem `brak-nowego-roku-14-dni`; zmienna łamiąca zasadę „nie niszowe” → `rejected` z powodem `niszowe`; wpis po 90 dniach znika.
- `checkWindows` dla planu z nowymi przebiegami mieści się w limitach BDL (test).
- Istniejące testy `library-priority`, `library-plan` i kalendarium przechodzą bez zmian.

Nie ruszaj: `scripts/data/library-priority.mjs` (zmienia go W28-D04), `config/indicators.json`, `src/*`.
Tytuł PR zaczyna się od `[W27-D05]`; opis ma „Po ludzku” (w tym: o której godzinie robot teraz sprawdza premiery).
