# D02 – Świeże dane i skrajności najpierw w „Odkryciach”
Cel: gdy robot pobierze nowy rok wskaźnika albo nowy wskaźnik, przez kolejne tygodnie najmocniejsze, skrajne fakty z tych danych są w Odkryciu dnia, w zestawieniach na stronie startowej i wyżej na liście „3 rzeczy” w profilu miejsca. Działa to bez ręcznej pracy i bez AI.
Zmieniaj: src/core/facts/fresh.ts, src/core/facts/start.ts, src/core/facts/strength.ts, src/core/facts/types.ts, src/core/facts/build.ts, scripts/data/build-facts.mjs, config/facts.json, docs/KONCEPT-ODKRYCIA.md, tests/unit/w27-d02-fresh-facts.test.ts
Wymagane: tests/unit/w27-d02-fresh-facts.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA.md (§3–§9), src/core/facts/* (zwłaszcza strength.ts, start.ts, detectors.ts, boundaries.ts), scripts/data/build-facts.mjs, config/facts.json, .github/workflows/fetch-data.yml (linie z `git add`)

Zadanie:
1. **Księga świeżości** (`src/core/facts/fresh.ts`, czyste funkcje).
   - Robot faktów prowadzi plik `public/data/facts/fresh.json`: `{ "<indicatorId>": { "year": <ostatni rok>, "since": "<ISO>" } }`. Katalog `public/data/facts/` robot już dodaje do commita, więc workflow się nie zmienia.
   - Przy każdym `build-facts`:
     - jeśli ostatni rok wskaźnika różni się od zapisanego albo wskaźnika nie było, ustaw `since = generatedAt` (znacznik z danych, nie z zegara);
     - przy pierwszym uruchomieniu (brak pliku) wszystkie wskaźniki dostają `since = "1970-01-01T00:00:00.000Z"`, czyli nie są świeże. Wyjątek: wskaźnik, którego plik wartości ma `fetchedAt` w ciągu `fresh.days` przed `generatedAt`, jest świeży.
   - Wskaźnik jest świeży, gdy `generatedAt − since ≤ fresh.days`.
   - Ten sam stan danych daje ten sam plik.
2. **Skrajność.**
   - Fakt z najnowszego roku świeżego wskaźnika mnoży siłę przez `fresh.boost` (w `config/facts.json`, start: 1,6). Dotyczy to też faktów jednostek, więc nowe dane wypychają stare z „3 rzeczy”.
   - Dodatkowo `fresh.extremeBoost` (start: 1,3) dostają fakty, które są: 1. miejscem w kraju (F1, bez remisu), rekordem serii (detectRecord) albo zmianą rok do roku w górnym 1% wszystkich jednostek poziomu.
   - Do zmiany rok do roku używaj istniejącego typu faktu zmiany z rokiem bazowym = rok wcześniejszy, z progiem ludności `thresholds.smallPopulation` i strażnikiem zmian granic z `boundaries.ts`.
   - Jeśli istniejący typ lub szablon zdania nie obsłuży zmiany rok do roku poprawnie po polsku, nie dodawaj nowego typu. Napisz w PR i zrób tylko pozostałe dwa rodzaje skrajności.
3. **Odkrycie dnia** (`pickDaily` / `buildStart` w `start.ts`).
   - Pierwsze `fresh.dailySlots` dni (start: 7) po `generatedAt` dostają najsilniejsze fakty krajowe ze świeżych wskaźników. Faktów umieszczasz na indeksach `dailyIndex(generatedAt + k dni, length)` dla k = 0…dailySlots−1, więc strona (bez zmian w `src/view`) pokaże je w te dni.
   - Pozostałe miejsca wypełnia dotychczasowy algorytm, bez powtórzeń jednostek.
   - Gdy świeżych wskaźników brak, wynik jest identyczny jak dziś (test na obecnych danych).
4. **Zestawienia.**
   - Gdy jest świeży wskaźnik, pierwsze z 4 zestawień zastępuje zestawienie tego wskaźnika (poziom `gmi`, kierunek „najwyżej”, gminy poniżej `thresholds.smallPopulation` pominięte).
   - Gdy świeżych jest kilka, wybierz najmocniejszy według sumy siły jego faktów krajowych.
   - Pozostałe trzy zestawienia bez zmian.
   - Rozmiar `facts-start.json` ≤ 4 KB (PRODUKT.md §7) musi zostać zachowany.
5. **Wagi nowych wskaźników** z W27-D01: w `config/facts.json` dopisz `indicatorWeights` z wartościami:

   | wskaźnik | waga |
   |---|---|
   | `births-per-1000` | 1 |
   | `old-per-100-young` | 1 |
   | `deaths-per-1000` | 0,8 |
   | `people-per-pharmacy` | 0,8 |
   | `bike-paths-per-10k` | 0,6 |
   | `marriages-per-1000` | 0,6 |
   | `nursery-per-1000-under3` | 0,8 |

   Wagi dla id, których jeszcze nie ma w `config/indicators.json`, nie mogą niczego psuć (test).
6. W `docs/KONCEPT-ODKRYCIA.md` dopisz krótką sekcję „Świeże dane (W27-D02)”: co jest świeże, ile trwa, jak wpływa na Odkrycie dnia, zestawienia i profil.

Gotowe, gdy (testy na danych z `tests/fixtures` lub małych danych zbudowanych w teście, bez sieci):
- Księga: nowy rok wskaźnika ustawia `since`; ten sam rok go nie zmienia; brak pliku nie robi wszystkiego świeżym; ten sam stan daje identyczny JSON.
- Fakt świeżego wskaźnika ma siłę większą o `fresh.boost`. Po `fresh.days` mnożnik znika.
- Przy jednym świeżym wskaźniku `dailyIndex(generatedAt + k)` dla k < dailySlots wskazuje fakt tego wskaźnika (jeśli ma tyle faktów krajowych), a jednostki się nie powtarzają.
- Bez świeżych wskaźników `buildStart` daje dokładnie ten sam wynik co przed zmianą (porównanie z wynikiem obecnego kodu na tych samych danych).
- Zestawienie świeżego wskaźnika jest pierwsze, nie zawiera gmin poniżej progu ludności, a `facts-start.json` ≤ 4 KB.
- Fakt skrajny (1. miejsce bez remisu albo rekord) ze świeżego wskaźnika ma siłę wyższą niż ten sam fakt bez skrajności.

Nie ruszaj: `src/view/*`, `.github/workflows/*`, `config/indicators.json`, `public/data/*` (pliki danych przebuduje robot po scaleniu; jeśli test potrzebuje przykładowego `fresh.json`, trzymaj go w `tests/fixtures`).
Tytuł PR zaczyna się od `[W27-D02]`; opis ma „Po ludzku”. Napisz w nim, że efekt zobaczy się po najbliższym przebiegu robota z nowym rokiem albo po scaleniu W27-D01, bo nowe wskaźniki są świeże z definicji.
