# Koncept: Odkrycie dnia, karuzela zestawień, pełne zestawienia

Wersja 1 · 27.11.2026 · na podstawie uwag właściciela z 27.11.2026 (po scaleniu PR #699).

Dokument uzupełnia `docs/KONCEPT-ODKRYCIA.md` (§6 i §7). Po zatwierdzeniu trzeba dopisać zmiany do `docs/PRODUKT.md` §3.1 i §7. Robi to zadanie Z04, poniżej.

## 0. Uwagi właściciela i odpowiedzi

| Uwaga | Odpowiedź |
|---|---|
| Odkrycie dnia ma być jedno, bez „Pokaż inną” | §1: jedna karta dnia, bez przycisku i bez licznika |
| Pozycja 1 w zestawieniu nie ma być większa od reszty | §2: wszystkie wiersze w jednym rozmiarze |
| Zestawienia są stale te same. Karuzela z wszystkimi danymi, pasek wskaźników do przełączania, wybór z całej biblioteki mapy | §3: pasek wskaźników + karuzela + „Więcej danych” z menu wyboru danych mapy |
| Pełne zestawienie: cała lista, po 50 na stronę | §4: cała lista porównanych jednostek, strony po 50 pozycji |

Uwagę o pełnym zestawieniu czytam tak: ma pokazywać całą listę, podzieloną na strony po 50, a nie tylko pierwsze 50. Dziś strona ma właśnie te pierwsze 50 i na tym się kończy.

## 1. Odkrycie dnia: jedna karta

**Teraz:** karta dnia, przycisk „Pokaż inną ciekawostkę” i licznik „Ciekawostka dnia (1 z 30)”.

**Po zmianie:**
- Jedna karta, ta sama dla wszystkich danego dnia, wybierana po dacie tak jak dziś.
- Para skrajności zostaje, gdy w pliku jest drugi biegun. Bez niego zostaje pojedynczy fakt.
- Znikają przycisk „Pokaż inną ciekawostkę”, licznik i region `aria-live`. Karta się nie zmienia, więc nie ma czego ogłaszać.
- Plik `facts-start.json` zostaje bez zmian. Pole `daily` nadal ma 30 dni, bo to zapas na kolejne dni bez nowego pliku.

Kod:
- `src/view/start/DailyDiscovery.tsx` pokazuje `deck[0]`.
- `discoveryDeck` (`src/core/start/extremes.ts`) zostaje: jego pierwszy element to karta dnia. Nic nie usuwamy z core.

## 2. Zestawienie: równe wiersze

**Teraz:** pozycja 1 ma większy numer (`text-xl`), pogrubioną nazwę (`text-md`) i wartość w kolorze tuszu.

**Po zmianie:** każdy wiersz wygląda tak samo:
- numer: `text-sm text-olowek`, mono;
- nazwa: `text-sm text-tusz`;
- wartość: `text-xs text-olowek`, mono.

O kolejności mówi sam numer. Pole dotykowe zostaje: min. 44 px, cały wiersz jest linkiem.

Kod: `RowBody` w `src/view/start/ListPodium.tsx` traci parametr `first`. Jest jedna stała klas dla wszystkich wierszy.

## 3. Karuzela zestawień z paskiem wskaźników

### 3.1 Jak to wygląda (telefon 390 px, komputer ten sam układ, szerszy)

```
Zestawienia
┌─────────────────────────────────────────────────────────┐
│ Dochody gmin │ Wynagrodzenie │ Lesistość │ Mediana … │ ⟶  ← pasek wskaźników (przewijany palcem)
│ ═══════════                                             │   aktywny: czerwone podkreślenie (jedyny czerwony element)
├─────────────────────────────────────────────────────────┤
│ [ Najwyższe | Najniższe ]                               │   przełącznik jak dziś, wspólny dla wszystkich
│ 5 gmin z najwyższą wartością, 2025                      │
│ 1  Kobierzyce               9 812 zł                    │   ← slajd; przesuwany palcem w bok
│ 2  Rewal                    9 105 zł                    │
│ 3  …                                                    │
│ Zobacz na mapie   Pełne zestawienie                     │
├─────────────────────────────────────────────────────────┤
│ ‹ Poprzednie        3 z 19        Następne ›            │   strzałki ≥ 44 px, licznik
└─────────────────────────────────────────────────────────┘
[ + Więcej danych ]  ← otwiera menu wyboru danych (to samo co na mapie)
Wszystkie tematy i zestawienia
```

### 3.2 Zachowanie

1. **Pasek wskaźników** to dzisiejsze zakładki (ARIA `tablist`), tylko dłuższe.
   - Pozycje to 4 zestawienia redakcyjne z `facts-start.json`, potem pozostałe wskaźniki główne (§3.3).
   - Pasek przewija się palcem w poziomie, bez widocznego paska przewijania.
   - Aktywna pozycja zawsze jest wsuwana w widok (`scrollIntoView({ inline: 'nearest' })`).
   - Klawiatura: strzałki, Home i End jak w obecnych zakładkach.
2. **Slajdy** leżą w poziomym torze z `scroll-snap-type: x mandatory`. To natywny CSS, bez pakietu karuzeli.
   - Przesunięcie palcem zmienia slajd i aktywną pozycję paska (IntersectionObserver na slajdach).
   - Kliknięcie w pasek albo strzałkę przewija tor do slajdu.
   - Przy `prefers-reduced-motion` przewijanie jest skokowe (`behavior: 'auto'`).
3. **Tylko aktywny slajd jest dostępny.** Pozostałe mają `inert`, więc nie mają linków w kolejności Tab ani niewidocznych pól dotykowych. To ta sama zasada co dziś przy zakładkach.
4. **Strzałki i licznik** „3 z 19” są pod slajdem.
   - Na pierwszym slajdzie „‹ Poprzednie” jest wyłączone, na ostatnim „Następne ›”.
   - Karuzela się nie zapętla, żeby było jasne, gdzie jest koniec.
5. **Przełącznik „Najwyższe | Najniższe”** działa jak dziś: jeden wybór obowiązuje na wszystkich slajdach.
6. **„+ Więcej danych”** (przycisk pod karuzelą, ≥ 44 px) otwiera menu wyboru danych.
   - To ten sam `DataMenu`: na telefonie `layout="stack"`, na komputerze `layout="columns"`.
   - Po wyborze wskaźnika na końcu paska pojawia się nowa pozycja z krótką nazwą i dopiskiem „z biblioteki” (tylko dla czytników ekranu). Karuzela przechodzi do niej.
   - Kolejny wybór z biblioteki zastępuje poprzedni slajd biblioteki. Na końcu paska jest najwyżej jeden taki slajd.
   - Bez zapamiętywania w przeglądarce: po odświeżeniu strona wraca do zestawu redakcyjnego. Polityka prywatności zostaje bez zmian.
   - Wybranie w menu wskaźnika, który już jest w pasku, przechodzi do jego slajdu i nie dodaje nowego.
7. **Linki w slajdzie:**
   - „Zobacz na mapie” prowadzi do `/mapa?i=<id>&l=<poziom>&y=<rok>`.
   - „Pełne zestawienie” prowadzi do `/zestawienie/<slug>` w wybranym kierunku, gdy taka strona istnieje (`config/lists.json`, kind `value`).
   - Gdy strony nie ma, link nazywa się „Pełny ranking” i prowadzi do `/mapa?v=ranking&i=<id>&l=<poziom>&y=<rok>`. To widok Ranking na mapie, z całą listą.
   - Dla wskaźników z biblioteki jest zawsze „Pełny ranking”.
8. **Wiersz zestawienia** otwiera profil jednostki na mapie, jak dziś.

### 3.3 Które wskaźniki są w pasku

Kolejność ustala redakcja w `config/facts.json`, w nowym polu `start.carousel`. Lista poniżej to propozycja.

| # | Wskaźnik | Poziom | Kierunek na start |
|---|---|---|---|
| 1–4 | z `start.lists` (dziś: dochody gmin, wynagrodzenie, lesistość, mediana wieku; pierwsze miejsce może zająć świeży wskaźnik) | jak w pliku | jak w pliku |
| 5 | stopa bezrobocia | powiaty | najniższe |
| 6 | bezrobotni w wieku produkcyjnym | gminy | najniższe |
| 7 | wydatki na mieszkańca | gminy | najwyższe |
| 8 | firmy REGON na 10 tys. | gminy | najwyższe |
| 9 | saldo migracji | gminy | najwyższe |
| 10 | przyrost naturalny | gminy | najwyższe |
| 11 | udział 65+ | gminy | najwyższe |
| 12 | gęstość zaludnienia | gminy | najwyższe |
| 13 | mieszkania oddane na 1000 | gminy | najwyższe |
| 14 | powierzchnia mieszkania na osobę | gminy | najwyższe |
| 15 | dostęp do kanalizacji | gminy | najniższe |
| 16 | przedszkola 3–6 lat | gminy | najwyższe |
| 17 | czytelnicy bibliotek na 1000 | gminy | najwyższe |
| 18 | noclegi turystów na 1000 | powiaty | najwyższe |
| 19 | samochody na 1000 | powiaty | najwyższe |

- **Bez „liczby ludności”.** To suma, więc na górze zawsze są największe miasta i nie ma tu nic do odkrycia. Na mapie liczba ludności zostaje.
- **Poziom** to gminy, gdy plik wartości ma dane gmin. W przeciwnym razie powiaty: wynagrodzenie, bezrobocie rejestrowane, noclegi i samochody mają tylko powiaty.
- **Gminy poniżej 5000 mieszkańców są pomijane**, tak jak na stronach `/zestawienie` (`config/lists.json` → `gminaMinPopulation`). Inaczej szum małych liczb daje rekordy z przypadku.

### 3.4 Dane i szybkość

| Co | Kiedy | Ile |
|---|---|---|
| `facts-start.json` (4 zestawienia redakcyjne) | jak dziś, gdy sekcja zbliża się do ekranu | ≤ 5 KB, bez zmian |
| **nowy** `facts-lists.json` (slajdy 5–19: po 5 + 5 pozycji) | przy pierwszym ruchu w karuzeli (pasek, strzałka, przesunięcie) albo w wolnej chwili, gdy sekcja jest widoczna, ale nie w pierwszych 3 s i nie przy oszczędzaniu danych | ≤ 12 KB (ok. 15 × 0,5 KB; ok. 4 KB po kompresji) |
| `library/available.json` | dopiero po kliknięciu „+ Więcej danych” | jak na mapie (< 50 KB po kompresji) |
| `units.json` + plik wartości wybranego wskaźnika | dopiero po wyborze wskaźnika z biblioteki | jak przy zmianie wskaźnika na mapie (wartości ok. 230 KB i jednostki ok. 100 KB po kompresji; `units.json` często już jest w pamięci po rozgrzewce mapy) |
| **nowy** `gmina-small.json` (738 kodów TERYT gmin < 5000 mieszkańców w ostatnim roku) | razem z wartościami wskaźnika z biblioteki na poziomie gmin | ≤ 8 KB |

Zasady:
- **Pierwsze 3 s strony bez zmian:** zero plików wartości, `units.json` i `facts-lists.json`. Pilnuje tego dzisiejszy test budżetu.
- Pozycje slajdów wskaźników głównych są **liczone przy budowie danych** (`scripts/data/build-facts.mjs`, logika w `src/core/facts/start.ts`, czyli `buildList`). Format jest taki sam jak w `facts-start.json`, więc `listView` i `listEnds` działają bez zmian.
- Pozycje wskaźnika z biblioteki są **liczone w przeglądarce**:
  - pobranie: `loadAnyValues`;
  - wybór roku: ostatni rok z danymi dla co najmniej połowy jednostek poziomu;
  - kolejność: `rankUnits` i `topBottom(…, 5)` z `src/core/ranking`;
  - pominięcie małych gmin według `gmina-small.json`.

  Nowa czysta funkcja `libraryList(values, units, small, level)` w `src/core/start/library-list.ts` zwraca `StartList`. Widok dostaje więc ten sam kształt co przy zestawieniach redakcyjnych.
- Do czasu wczytania slajd pokazuje podpis i „Wczytujemy pozycje…” (już jest). Przy błędzie pokazuje „Nie udało się wczytać danych. Spróbuj jeszcze raz” z przyciskiem ponowienia.

### 3.5 Pliki (nowe i zmienione)

| Plik | Zmiana |
|---|---|
| `config/facts.json` | `start.carousel: string[]` (id wskaźników, kolejność §3.3) |
| `src/core/facts/start.ts` | `buildCarousel()` → `{ generatedAt, lists: StartList[] }`; poziom i kierunek wg §3.3 |
| `scripts/data/build-facts.mjs` | zapis `public/data/facts-lists.json` i `public/data/gmina-small.json` |
| `src/core/start/load-lists.ts` | `loadFactsLists()`: jedno żądanie, pamięć na sesję, walidacja jak w `load-discoveries.ts` |
| `src/core/start/library-list.ts` | `libraryList()` (§3.4) |
| `src/core/start/list-links.ts` | link „Pełny ranking” (`/mapa?v=ranking…`), gdy nie ma `/zestawienie` |
| `src/view/start/StartCarousel.tsx` | zastępuje `StartLists.tsx`: pasek, tor slajdów, strzałki, licznik |
| `src/view/start/IndicatorStrip.tsx` | pasek wskaźników (ARIA tabs, przewijanie, `scrollIntoView`) |
| `src/view/start/useCarouselSync.ts` | IntersectionObserver ↔ aktywny slajd, przewijanie do slajdu |
| `src/view/start/LibraryPick.tsx` | „+ Więcej danych”, `DataMenu` w oknie lub arkuszu, wczytanie wartości |
| `src/view/start/ListPodium.tsx` | §2 i link „Pełny ranking” |
| `src/view/start/Discoveries.tsx` | `StartCarousel` zamiast `StartLists` |

## 4. Pełne zestawienie: cała lista, strony po 50

**Teraz:** `/zestawienie/<slug>` pokazuje pierwsze 50 pozycji (`config/lists.json` → `rows: 50`), a pozostałe nie są nigdzie widoczne.

**Po zmianie:**
- **Cała lista porównanych jednostek.** Wykluczenia zostają: gminy poniżej 5000 mieszkańców i, w zestawieniach zmian, gminy ze zmianą granic. Jest to opisane we wstępie strony, jak dziś.
- **Po 50 pozycji na stronę.** Pole `rows: 50` w `config/lists.json` zaczyna znaczyć „pozycji na stronę”. Opis w `$opis` trzeba poprawić.
  - Strona 1: `/zestawienie/<slug>` (adres bez zmian).
  - Kolejne: `/zestawienie/<slug>/2`, `/zestawienie/<slug>/3`…
  - Przykład: ok. 1 700 gmin ≥ 5000 mieszkańców to ok. 35 stron, a 380 powiatów to 8 stron.
- **Nawigacja** pod tabelą i nad nią:
  ```
  Pozycje 51–100 z 1 734
  ‹ Poprzednia   1 2 3 … 35   Następna ›
  ```
  - Linki zwykłe (`<a>`), działają bez JS.
  - Pola ≥ 44 px.
  - Bieżąca strona ma `aria-current="page"`.
  - Widać zawsze stronę pierwszą, ostatnią i dwie sąsiednie. Resztę zastępuje „…”.
- **Numery miejsc są ciągłe** (51, 52…). Remisy liczone są na całej liście, nie na stronie.
- **Wstęp** („Zestawienie obejmuje…, pierwsze miejsce…, mediana…”) jest tylko na stronie 1. Kolejne strony mają jedno zdanie: „Strona 2 z 35. Zestawienie: <h1>. Wstęp i objaśnienia na pierwszej stronie” z linkiem.
- **„Najwyższe” i „Najniższe”** to nadal osobne zestawienia, np. `najstarsze-gminy` i `najmlodsze-gminy`. Każde ma całą listę we własnym kierunku. Na stronie 1 jest link do odwrotnego zestawienia.
- **Google:**
  - Strona 1 jest indeksowana i jest w mapie strony, bez zmian.
  - Strony 2+ mają `noindex, follow`, kanoniczny adres na siebie i nie trafiają do mapy strony. Google przechodzi po linkach do profili, ale nie indeksuje setek prawie takich samych tabel.
- **Waga budowy:** 26 zestawień daje ok. 600 dodatkowych plików HTML (ok. 10–15 KB każdy). Zmieści się w obecnym budżecie wdrożenia, a test wagi strony nadal sprawdza pojedynczą stronę.

Kod:
- `src/core/facts/lists.ts`: `buildList` zwraca wszystkie pozycje (`entries`). `rows` przestaje przycinać.
- `src/core/seo/list-page.ts`: `buildListPages(def, ctx): ListPage[]` dzieli listę na strony. `ListPage` dostaje `page`, `pages`, `from`, `to`, `total`, `prev`, `next`. Opis i tytuł stron 2+ mają dopisek „– strona N”.
- `src/core/seo/discover-template.ts`: nawigacja stron i `robots` dla stron 2+.
- `src/core/seo/discover-site.ts`: zapis wszystkich stron.
- `src/core/seo/sitemap.ts`: tylko strony 1.

## 5. Testy, które trzeba zmienić (zgoda właściciela)

Zmiany §1–§3 usuwają działające dziś zachowanie. Testy, które je sprawdzają, trzeba przerobić, a nie tylko dopisać nowe. Zgodnie z AGENTS.md wymaga to Twojej zgody. **Zatwierdzenie tego konceptu = zgoda na poniższe zmiany i nic ponad nie.**

| Test | Co sprawdza dziś | Po zmianie |
|---|---|---|
| `tests/e2e/start-odkrycia-panel.spec.ts` | „Pokaż inną ciekawostkę”, licznik, 4 zakładki | jedna karta bez przycisku; pasek wskaźników, przesunięcie i strzałki zmieniają slajd; przełącznik obowiązuje na kolejnym slajdzie |
| `tests/e2e/f02-odkrycia.spec.ts` | 4 zakładki × 5 pozycji | pasek z ≥ 4 pozycjami, aktywny slajd ma 5 pozycji |
| `tests/e2e/path-s1a-ekran-startowy.spec.ts` | 4 widoczne linki „Zobacz na mapie” (czerwony od #699) | przejście po 4 pierwszych slajdach i 4 różne adresy `/mapa` |
| `tests/unit/start-extremes.test.ts` | talia i jej długość | bez zmian w core; widok sprawdza jedną kartę |
| `tests/unit/f04-topics.test.ts` i testy `/zestawienie` | tabela ma `rows` pozycji | strona 1 ma 50 pozycji, ostatnia strona ma resztę, suma = `compared` |

Wzorce zrzutów `start-*` i `zestawienie-*` trzeba odświeżyć workflowem „Update snapshots”.

## 6. Zadania (kolejność i zależności)

Pierwsza fala ma 3 niezależne zadania. Karuzela musi poczekać na plik danych, a wybór z biblioteki na karuzelę.

```
fala A:  Z01 Odkrycie dnia ─┐   Z02 Równe wiersze ─┐   Z03 facts-lists.json ─┐   Z05 Pełne zestawienie (strony)
fala B:                                            └────────────────────────── Z04 Karuzela i pasek
fala C:                                                                         Z06 Więcej danych (biblioteka)
```

### Z01 – Odkrycie dnia: jedna karta, bez „Pokaż inną”
Cel: na starcie jest jedna karta dnia, bez przycisku i licznika.
Zmieniaj: src/view/start/DailyDiscovery.tsx, tests/e2e/start-odkrycia-panel.spec.ts, docs/PRODUKT.md
Wymagane: tests/e2e/start-odkrycia-panel.spec.ts
Gotowe, gdy:
- nie ma przycisku „Pokaż inną ciekawostkę” ani `data-slot="daily-counter"`;
- karta jest ta sama przy dwóch wejściach tego samego dnia (zegar ustawiony w teście);
- para skrajności nadal się pokazuje, gdy dzień ją ma.

### Z02 – Zestawienie: wszystkie wiersze w jednym rozmiarze
Cel: pozycja 1 wygląda jak pozostałe.
Zmieniaj: src/view/start/ListPodium.tsx, tests/e2e/start-odkrycia-panel.spec.ts
Wymagane: tests/e2e/start-odkrycia-panel.spec.ts
Gotowe, gdy:
- nazwy pozycji 1 i 2 mają ten sam rozmiar pisma (`getComputedStyle().fontSize`) i tę samą grubość;
- wiersze mają ≥ 44 px wysokości.

### Z03 – Dane karuzeli: facts-lists.json i gmina-small.json
Cel: przy budowie danych powstają zestawienia 5 + 5 dla wskaźników z `start.carousel` i lista małych gmin.
Zmieniaj: config/facts.json, src/core/facts/start.ts, scripts/data/build-facts.mjs, public/data/facts-lists.json, public/data/gmina-small.json, tests/unit/start-carousel-data.test.ts
Wymagane: tests/unit/start-carousel-data.test.ts
Gotowe, gdy:
- każdy wpis ma 5 + 5 pozycji, rozłączne i uporządkowane (jak test `start-list-ends`);
- poziom = gminy tylko dla wskaźników z danymi gmin; gminy < 5000 mieszkańców są pominięte;
- 4 zestawienia z `facts-start.json` nie powtarzają się w `facts-lists.json`;
- `facts-lists.json` ≤ 12 KB, `gmina-small.json` ≤ 8 KB, bez wcięć.

### Z04 – Karuzela zestawień z paskiem wskaźników
Cel: zestawienia na starcie przełącza się paskiem wskaźników, strzałkami i przesunięciem palcem.
Zmieniaj: src/view/start/StartCarousel.tsx, src/view/start/IndicatorStrip.tsx, src/view/start/useCarouselSync.ts, src/view/start/Discoveries.tsx, src/view/start/StartLists.tsx, src/core/start/load-lists.ts, src/core/start/list-links.ts, src/view/start/ListPodium.tsx, tests/e2e/start-odkrycia-panel.spec.ts, tests/e2e/f02-odkrycia.spec.ts, tests/e2e/path-s1a-ekran-startowy.spec.ts, tests/unit/start-load-lists.test.ts, docs/PRODUKT.md
Wymagane: tests/e2e/start-odkrycia-panel.spec.ts, tests/unit/start-load-lists.test.ts
Gotowe, gdy:
- pasek ma 4 pozycje redakcyjne + pozycje z `facts-lists.json`; kliknięcie, strzałka i przesunięcie zmieniają slajd i aktywną pozycję;
- licznik „N z M”, strzałki wyłączone na końcach, bez zapętlenia;
- nieaktywne slajdy mają `inert` (żaden link poza aktywnym slajdem nie dostaje fokusu);
- w pierwszych 3 s nie ma żądania `facts-lists.json`; jest dopiero po pierwszym ruchu w karuzeli;
- „Pełny ranking” prowadzi do `/mapa?v=ranking…`, gdy nie ma strony `/zestawienie`;
- przy `prefers-reduced-motion` przewijanie bez animacji;
- jedyny czerwony element w sekcji to aktywna pozycja paska.

### Z05 – Pełne zestawienie: cała lista, strony po 50
Cel: `/zestawienie/<slug>` pokazuje całą listę, po 50 pozycji na stronę, z nawigacją.
Zmieniaj: src/core/facts/lists.ts, src/core/seo/list-page.ts, src/core/seo/discover-template.ts, src/core/seo/discover-site.ts, src/core/seo/sitemap.ts, config/lists.json, tests/unit/f04-topics.test.ts, tests/unit/list-pages.test.ts
Wymagane: tests/unit/list-pages.test.ts
Gotowe, gdy:
- suma pozycji na wszystkich stronach = liczba porównanych jednostek; miejsca ciągłe, remisy na całej liście;
- strona 1 pod starym adresem; strony 2+ pod `/<slug>/N`, z `noindex, follow` i poza mapą strony;
- nawigacja ma `aria-current`, pierwszą i ostatnią stronę, pola ≥ 44 px, działa bez JS;
- wstęp tylko na stronie 1.

### Z06 – „Więcej danych”: dowolny wskaźnik z biblioteki w karuzeli
Cel: pod karuzelą można wybrać dowolny wskaźnik z menu wyboru danych mapy i zobaczyć jego 5 + 5.
Zmieniaj: src/view/start/LibraryPick.tsx, src/view/start/StartCarousel.tsx, src/core/start/library-list.ts, tests/unit/start-library-list.test.ts, tests/e2e/start-library-pick.spec.ts
Wymagane: tests/unit/start-library-list.test.ts, tests/e2e/start-library-pick.spec.ts
Gotowe, gdy:
- `available.json` pobierany dopiero po kliknięciu „+ Więcej danych”; wartości i `units.json` dopiero po wyborze;
- wybrany wskaźnik jest ostatnią pozycją paska, karuzela do niej przechodzi; kolejny wybór zastępuje poprzedni;
- `libraryList` pomija gminy z `gmina-small.json`, wybiera rok z danymi dla ≥ 50% jednostek, zwraca 5 + 5 (dane z `tests/fixtures`);
- błąd wczytania pokazuje komunikat i „Spróbuj jeszcze raz”.

## 7. Poza zakresem (świadomie)

- Przełącznik poziomu Gminy | Powiaty w slajdzie (dziś poziom jest stały; mapa ma pełny wybór).
- Zapamiętywanie wybranego wskaźnika z biblioteki między wizytami.
- Statyczne strony `/zestawienie` dla wskaźników z biblioteki.
- Zmiana kolejności odkryć dnia lub liczby dni w `facts-start.json`.

## 8. Decyzje do potwierdzenia

1. Pełne zestawienie = cała lista po 50 na stronę (tak rozumiem uwagę; §4).
2. Strony 2+ zestawienia bez indeksowania w Google (§4).
3. Pasek bez „liczby ludności”; reszta wskaźników głównych w kolejności z §3.3.
4. Wybór z biblioteki pobiera ok. 330 KB (po kompresji) dopiero po kliknięciu, tyle co zmiana wskaźnika na mapie (§3.4).
5. Zgoda na zmiany testów z §5.

## 9. Wdrożenie (27.11.2026): odstępstwa od koncepcji

Właściciel zatwierdził całość („Tak, zgadzam się. Wykonaj od razu całość”). Przy wdrożeniu wyszły trzy rzeczy, które różnią się od opisu wyżej:

1. **„Pełny ranking” prowadzi do `/rankingi?i=<id>&l=<poziom>&y=<rok>`**, a nie do `/mapa?v=ranking…`. Widoku `v=ranking` na mapie nie ma, a strona Rankingi istnieje. Czyta tylko wskaźniki główne, więc **dla wskaźnika z biblioteki nie ma linku „Pełny ranking”** (zostaje „Zobacz na mapie”).
2. **`StartLists.tsx` zostaje w repozytorium, nieużywany.** Plik sprawdza istniejący test `ui-global-views.test.ts`, którego bez zgody nie zmieniamy, a reguła „nie usuwamy plików z main” zabrania kasowania. Do usunięcia razem z tym testem, gdy właściciel się zgodzi.
3. **`gmina-small.json` ma postać `{ "min": 5000, "t": "kod,kod,…" }`** (lista w jednym napisie), bo tablica kodów w cudzysłowach ledwie mieściła się w 8 KB. Jest 738 gmin, plik ma ok. 6 KB.

Do tego: „Spróbuj jeszcze raz” czyści pamięć wartości biblioteki (`resetLibraryCache`), bo loader zapamiętuje także nieudane pobranie. Dalsze zestawienia (`facts-lists.json`) pobierają się po pierwszym ruchu w karuzeli albo po ok. 4 s od wczytania danych redakcyjnych (nie przy oszczędzaniu danych).
