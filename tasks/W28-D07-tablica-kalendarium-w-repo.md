# D07 – Tablica „Kalendarium danych” na samej górze repozytorium
Cel: wchodząc na GitHub, właściciel od razu widzi:
- co GUS publikuje w najbliższych dniach i czy to pobierzemy;
- co robot pobrał, a co odrzucił (z powodem);
- co jest już na stronie;
- jakie odkrycia z tego wyszły.

Tablica sama się odświeża i nie wymaga scalania PR.
Zmieniaj: scripts/data/calendar-board.mjs, .github/workflows/calendar-board.yml, README.md, docs/ELEMENTY.md, docs/WORKFLOW.md, tests/unit/w28-d07-calendar-board.test.ts, tests/fixtures/calendar-board/*
Wymagane: tests/unit/w28-d07-calendar-board.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: tasks/W27-D05-premiery-z-kalendarium-najpierw.md (księga `library/calendar.json`), src/core/facts/fresh.ts (W27-D02), public/data/news.json (format), .github/workflows/fetch-library.yml, .github/workflows/gsc-trend-boost.yml (wzór PR robota)

Zadanie:
1. `scripts/data/calendar-board.mjs` (czyste funkcje + cienkie wejście/wyjście) składa tablicę w Markdown z sekcjami:

   | Sekcja | Źródło | Zawartość |
   |---|---|---|
   | **Zaplanowane (14 dni)** | `planned` z księgi | data, tytuł publikacji z linkiem do GUS, co pobierzemy (wskaźniki główne / ile zmiennych biblioteki) |
   | **Czeka na BDL** | `waiting` | od kiedy |
   | **Pobrane** | `downloaded` (14 dni) | data, wskaźnik / zmienna |
   | **Odrzucone** | `rejected` (30 dni) | powód po ludzku („niszowe: dane dla 61% gmin”, „GUS nie dał nowego roku w 14 dni”) |
   | **Wdrożone (na stronie)** | biblioteka: zmienna w `available.json` na `data/library` (strona czyta ją od razu); wskaźniki główne: nowy rok w `public/data/values` na `main` | link do mapy `/mapa?i=…&y=…` |
   | **Odkrycia** | `facts-start.json` i `facts/fresh.json` na `main` | do 5 najmocniejszych faktów ze świeżych danych: zdanie z szablonu `src/core/facts`, liczba, link „Zobacz na mapie” |
   | **Tematy na czasie** | jeśli istnieje sygnał z W27-D03 | tematy rosnące |

   - Zdania i liczby tylko z plików danych i szablonów, bez AI i bez wpisywania ręcznego.
   - Puste sekcje pokazują „—”, nie znikają.
2. Gdzie widać tablicę:
   - **Przypięte zgłoszenie (issue) „Kalendarium danych”** – robot tworzy je raz (etykieta `kalendarium`) i potem tylko podmienia jego treść. Nie zakłada nowych zgłoszeń i nie komentuje (bez powiadomień). Właściciel przypina je raz ręcznie; napisz to w PR.
   - **Znaczek na górze `README.md`** (pierwsza linia pod tytułem), np. „Kalendarium: 3 premiery · 2 nowości”, z linkiem do zgłoszenia. Znaczek czyta mały JSON `library/badge.json` z gałęzi `data/library` przez endpoint shields.io (`https://img.shields.io/endpoint?url=…`). Shields.io to usługa z zewnątrz: sprawdź licencję i zasady, wpisz do `docs/ELEMENTY.md`; bez tego zostaje sam link tekstowy. README zmienia się tylko w tym PR (jedna linia), a później robot zmienia tylko JSON.
3. `.github/workflows/calendar-board.yml`:
   - uruchamia się po zakończeniu `fetch-library` i `fetch-data` (`workflow_run`), ręcznie oraz codziennie około 06:20 UTC;
   - uprawnienia: `contents: write` (tylko gałąź `data/library`, plik `library/badge.json`) i `issues: write`;
   - bez sekretów poza `GITHUB_TOKEN`; niczego nie scala i nie pisze na `main`.
4. W `docs/WORKFLOW.md` dopisz krótko, czym jest tablica i skąd biorą się stany.

Gotowe, gdy:
- Test na fiksturach (przykładowa księga, `available.json`, `facts-start.json`, `fresh.json`): Markdown zawiera wszystkie sekcje we właściwej kolejności, a każdy stan trafia do swojej sekcji.
- Test: odrzucona zmienna ma powód po ludzku. Wdrożona zmienna biblioteki ma link `/mapa?i=b<id>…`, a wskaźnik główny `/mapa?i=<id>…`.
- Test: bez księgi (pierwsze uruchomienie) tablica powstaje z pustymi sekcjami „—”, bez wyjątku.
- Test: `badge.json` ma format endpointu shields.io (`schemaVersion: 1`, `label`, `message`) z liczbami z tablicy.
- Test: funkcja aktualizacji zgłoszenia przy istniejącym zgłoszeniu z etykietą `kalendarium` edytuje je, a nie tworzy nowego (wstrzyknięty klient API).
- Tablica nie przekracza limitu treści zgłoszenia GitHub (65 536 znaków); dłuższe sekcje są przycinane z dopiskiem „i N więcej”.

Nie ruszaj: `scripts/data/library*.mjs`, `config/*`, `src/view/*`, pozostałych workflowów.
Tytuł PR zaczyna się od `[W28-D07]`; opis ma „Po ludzku” (gdzie znaleźć tablicę i jak ją przypiąć).
