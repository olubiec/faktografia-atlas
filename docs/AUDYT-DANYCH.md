# Audyt automatu danych (FIX5) – 18.11.2026

Audyt tylko do odczytu: stan `main` (157d304), gałęzie `data/nightly` i `data/library`, przebiegi GitHub Actions sprawdzone 18.11.2026 ok. 07:30 UTC. Workflowów ani danych nie zmieniano.

## 1. Dlaczego dane mają `fetchedAt` 19.10.2026

- Wszystkie 20 plików `public/data/values/*.json` na `main` ma `fetchedAt` z 19.10.2026 (20:25–21:25 UTC). To data ostatniego scalenia danych głównych do `main`.
- Robot „Fetch data” działa i kończy się sukcesem (patrz §3), ale nigdy nie pisze na `main`: zapisuje na `data/nightly` i trzyma w PR **#451** (otwarty 15.11, 47 plików).
- Dodatkowo krok `nightly-checks.mjs revert-noise` cofa pliki, w których zmieniły się tylko `fetchedAt` i `report`. W PR #451 po tygodniu nocnych przebiegów realnie zmienił się jeden wskaźnik: `preschool-3-6` (doszedł rok 2025). Reszta to przebudowane profile (16) i części miasto/wieś (`data/parts` ×14, `public/data/parts` ×16).
- Skutek: dopóki nikt nie scali #451, `main` ma stare daty, a produkcja nie ma katalogu `public/data/parts` (blok „Miasto i obszar wiejski” pokazuje komunikat o braku danych).
- PR #451 nie jest gotowy do scalenia „na zielono”: CI na `data/nightly` (przebieg 44065287339, 17.11) ma czerwone: `bezpieczenstwo` (krok gitleaks) i wszystkie 4 shardy e2e (padają po ok. 3 s, czyli przed pierwszym testem; gałąź jest zbudowana na starym `main` 21917ca z 14.11, sprzed poprawek FIX/FIX2/FIX3). Lint, typecheck, testy jednostkowe i build są zielone. Nie ustalono przyczyny gitleaks (log nie zawiera wyniku). Zalecane: scalić `main` do `data/nightly` przez robota (następny przebieg zaczyna od `origin/main`, więc sam to naprawi) i dopiero wtedy ocenić CI.

## 2. Wskaźniki z biblioteki a UI

Stan `data/library` (18.11, 01:34 UTC):

| Rzecz | Liczba |
|---|---|
| `available.json` (zmienne z danymi, poziomy pow/gmi) | 1773 |
| pliki `library/values/<id>.json` | 2148 |
| `index.json` (cały spis GUS) | 63 960 zmiennych, z czego 2148 z `has=1` |
| w `available.json`, brak pliku wartości | 0 |
| plik wartości jest, brak w `available.json` | 375 |
| `state.failed` (zmienne, które nie dały danych po 1–3 próbach) | 155 |
| `state.queue` / `pending` | 0 / 0 |

Poziomy w `available.json`: 1771 × pow+gmi, 1 × tylko pow, 1 × tylko gmi (brak województw). Kategorie: szkolnictwo 962, spisy rolne 256, środowisko 175, ludność 82, gospodarka komunalna 52, zdrowie/opieka 47, samorząd 34, przedszkola 32, pozostałe po kilkanaście lub mniej.

Gdzie te wskaźniki są widoczne w UI (kod na `main`):

- `/biblioteka` i `/biblioteka/:id`: tak, wszystkie z `has=1` (2148, więc także 375 spoza `available.json`). Dane idą z `raw.githubusercontent.com/.../data/library`, nie z `main`.
- Rejestr (`src/core/indicators/registry.ts`, czyta `available.json`) jest używany tylko do rozpoznawania identyfikatorów `b<id>` w adresie (`src/core/url/state.ts`). Mapa, picker, Rankingi, Porównaj i profil czytają dalej tylko `config/indicators.json` (20 wskaźników). Czyli **1773 z `available.json` nie ma w mapie, pickerze, Rankingach, Porównaj ani profilu**; są tylko w bibliotece.
- Dla 375 wskaźników z plikiem wartości, ale bez wpisu w `available.json`, nie ustalono reguły wykluczenia (wymaga zajrzenia do `scripts/data/library-available.mjs`; nie robiono tego w tym audycie).
- Wskaźniki 1773 mają `lv` bez województw (woj nie występuje w żadnym wpisie), więc nawet po podpięciu do mapy nie narysują poziomu województw.

## 3. Przebiegi workflowów (`actions_list`)

| Workflow | Ostatnie przebiegi | Uwagi |
|---|---|---|
| Fetch data (nocny, cron 01:10 UTC) | #30 17.11 sukces; #23–#29 (10–16.11) sukces; **#19–#22 (6–9.11) porażka** | Przebiegi startują o 07:00–09:10 UTC, czyli 6–8 h po cronie (opóźnienia GitHuba). Trwają ok. 1–1,3 h. Przebiegu z 18.11 jeszcze nie ma (godzina sprawdzenia). |
| Fetch library (kilka razy na dobę) | #38–#49 (12.11–18.11) wszystkie sukces; ostatni 18.11 01:34 UTC | Każdy przebieg dopisuje porcję do `data/library`. Kolejka wyczerpana (`queue` 0). |
| Fetch localities (PRNG) | 8 przebiegów, ostatni 19.10; 3 porażki 18.10, potem sukces | Tylko ręczny; bez problemu. |
| BDL record | 1 przebieg 18.10, sukces | Ręczny. |
| Sprzątanie gałęzi | wyłączony ręcznie | Jednorazowy. |

Błąd z 6–9.11 (przebieg #22, krok „Pobierz wartości z BDL”, po ok. 70 s): `Brak odpowiedzi z http://vmacor12.stat.intra/api/v1/data/by-variable/72305?unit-level=5...: fetch failed`. API BDL zwróciło w `links.next` adres wewnętrznego hosta GUS (`vmacor12.stat.intra`), którego runner nie widzi, a `scripts/data/fetch-values.mjs` idzie za `links.next` bez przepisywania hosta (`nextPageUrl` w `values.mjs`). Od 10.11 BDL zwraca poprawne adresy i przebiegi są zielone, ale to nadal pojedynczy punkt awarii. Workflow w takiej sytuacji zgłasza issue „Pobieranie danych (Fetch data) nie powiodło się” (krok jest, nie sprawdzano, czy issue powstało).

## 4. Lista braków

1. PR #451 niescalony od 15.11 (CI czerwone na gałęzi, patrz §1), `main` ma dane z 19.10, brak `public/data/parts` na `main`.
2. Strona nigdzie nie pokazuje daty pobrania ani informacji „robot sprawdzał wczoraj” (zadania PD01, PU01, PF03 w planie).
3. 1773 wskaźniki biblioteki poza mapą, pickerem, Rankingami, Porównaj i profilem (zadania fal Q2–Q4).
4. Brak strażnika, że wskaźnik z danymi jest osiągalny (PF02) i że workflowy się nie psują (PF09).
5. `fetch-values.mjs` ufa `links.next` z API (awaria 6–9.11).
6. 155 zmiennych w `state.failed` i 375 wskaźników z plikiem wartości poza `available.json` bez opisanej przyczyny.
7. Cron 01:10 UTC startuje realnie po 6–8 h; nie szkodzi danym, ale mylące przy „dane z wczoraj”.
8. Brak województw w `available.json` (poziom woj).

## 5. Zalecenia

1. Właściciel: scalić PR #451 po zielonym CI (najpierw dać robotowi odświeżyć gałąź od `main`, albo uruchomić „Fetch data” ręcznie). Dopiero to odświeży `fetchedAt` i wprowadzi `public/data/parts`.
2. Zadanie następne (zmiana skryptu, nie workflowu): w `scripts/data/values.mjs` / `fetch-values.mjs` przepisać host z `links.next` na `https://bdl.stat.gov.pl` albo budować kolejną stronę z numeru strony; test na nagranej odpowiedzi z hostem `*.stat.intra`.
3. Zrobić `status.json` (PD01) z datą ostatniego sprawdzenia i ostatniej zmiany, żeby „brak zmian” nie wyglądał jak martwy robot.
4. Podpiąć rejestr biblioteki do pickera, mapy i Rankingów (fala Q2–Q4) i dodać strażnika osiągalności (PF02).
5. Zbadać 155 wskaźników `failed` oraz regułę dla 375 spoza `available.json`; zdecydować, czy mają wejść do rejestru.
