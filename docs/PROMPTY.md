# Prompty i zasady fal (wersja 2, 18.10.2026)

Ten plik jest instrukcją obsługi dla każdego, kto prowadzi Julesa: Claude'a, Gemini albo właściciela.
Zawiera wnioski z dotychczasowych błędów, twarde zasady, gotowe prompty na najbliższą falę i podział wszystkich pozostałych fal na zadania.
Ma pierwszeństwo przed `docs/KOLEJKA.md` (tamten plik zostaje jako historia) i uzupełnia `docs/PLAN.md` (cele fal).

Jak używać:
- **Claude lub Gemini jako Architekt:** przeczytaj sekcje 1–4. Prompt zadania składasz z sekcji 5 („Wspólny blok”) i treści zadania z sekcji 6 lub 7. Po każdym PR przechodzisz listę z sekcji 8.
- **Właściciel bez Claude'a:** sekcja 9 („Tryb awaryjny”) mówi, co wkleić do Gemini i co klikać.

---

## 1. Co szło źle i dlaczego

| Objaw | Przykład | Przyczyna | Zasada, która temu zapobiega |
|---|---|---|---|
| Jules pracuje godzinami i nie oddaje PR | CC6.3c (#68): ponad 5 h | Zadanie wymagało pobrania danych z API GUS. Jules nie ma pewnego dostępu do `bdl.stat.gov.pl` i próbuje w kółko | 2.1: Jules nie robi nic, co wymaga sieci |
| Puste commity w odpowiedzi na uwagi | #63, #64 (5 razy z rzędu) | Jules nie umiał wykonać poprawki (brak danych), ale „odpowiadał” | 2.5: pusta odpowiedź = nieudana runda, po 2 stop |
| PR usuwał pracę z main | #15, #16 | Gałąź budowana od nowa na starym main | Wspólny blok: tylko `git merge origin/main`, kontrola usuniętych plików |
| Osłabione testy | #63 (search.spec, home.spec) | Jules „naprawiał” CI zmianą testów | Wspólny blok: zakaz zmian istniejących testów |
| Zadanie łączyło dwie rzeczy | CC6.3b: wybór zmiennej + algorytm pokrycia + nagrywanie danych | Za szeroki zakres, więcej niż jeden rodzaj pracy | 2.2: jedno zadanie = jeden rodzaj pracy |
| Ukryty błąd w workflow | Fetch localities: zielony krok, brak pliku | `| tee` bez `pipefail`, ucięty komunikat | Workflowy pisze i naprawia Claude (2.1), błąd musi być widoczny w adnotacji |
| Zadania bez PR po 3 h | #47 (CC2.6b) | Zbyt duży komponent na raz | 2.4: limit czasu, potem podział |

Co działało: zadania czysto kodowe na gotowych danych, do 7 plików, z 4–5 warunkami (CC4.2: 30 min, CC4.3: 22 min, oba bez poprawek).

---

## 2. Twarde zasady

### 2.1 Trzy rodzaje zadań

| Typ | Kto wykonuje | Co to jest | Przykład |
|---|---|---|---|
| **K – kod** | Jules | Kod i testy na danych, które już są w repo (`public/data`, `public/geo`, `tests/fixtures`). Zero sieci, zero sekretów | logika profilu, warstwa mapy |
| **S – sieć** | GitHub Actions (workflow pisze Claude, uruchamia właściciel) | Pobranie danych z zewnątrz (BDL, PRNG) na osobną gałąź `data/...`. Wynik idzie do main przez PR | nagranie fixtur BDL, pobranie wartości wskaźników |
| **C – Claude** | Claude (lub Architekt zastępczy) | Zmiany w `.github/`, decyzje, przeglądy, ratowanie po 2 nieudanych rundach | nowy workflow, naprawa CI |

Zadanie, które potrzebuje sieci **i** kodu, dzielimy zawsze na dwa: najpierw S (dane trafiają do repo), potem K.

### 2.2 Rozmiar zadania K
- Jeden rodzaj pracy: albo logika (`src/core`), albo widok (`src/view`), albo skrypt (`scripts/`). Logika i jej podpięcie w UI to dwa zadania, chyba że podpięcie to ≤ 20 linii w jednym pliku.
- Do 6 plików (nie licząc `docs/sessions/<ID>.md`), do 5 warunków odbioru, do ok. 400 zmienionych linii.
- Każdy warunek sprawdzalny testem offline. Jeśli nie da się tego sprawdzić testem, najpierw zadanie „szew testowy”.
- Lista plików w promptcie jest **zamknięta**: Jules zmienia tylko te pliki.

### 2.3 Równoległość
- Najwyżej **2 zadania Julesa naraz**.
- Nigdy dwa zadania w tym samym katalogu (`src/view/map/`, `src/core/map/`, `src/view/search/`…) ani w tym samym pliku (szczególnie `AtlasMap.tsx`, `Home.tsx`, `Header.tsx`, `layers.ts`).
- Kolejne zadanie zależne wysyłamy dopiero po **scaleniu** poprzedniego na main.

### 2.4 Limity czasu
- Zadanie K powinno mieć PR w ciągu **1 h**. Po **90 min** bez PR: przerwij sesję w Julesie, zamknij zgłoszenie z komentarzem i podziel zadanie na mniejsze.
- Jules prosi o plan: zatwierdź tylko, jeśli zawiera „najpierw testy” i pliki z zakresu.

### 2.5 Rundy poprawek
- Uwaga do PR: jeden komentarz `@Jules`, ponumerowane punkty, każdy z nazwą pliku i warunkiem.
- Po odpowiedzi Julesa sprawdź, czy commit coś zmienił (sekcja 8, krok 2). **Pusta odpowiedź = nieudana runda.**
- Po **2 nieudanych rundach** stop: albo Claude poprawia sam na gałęzi PR (typ C), albo zamykamy PR i wysyłamy węższe zadanie. Nigdy trzeciej rundy tych samych uwag.

### 2.6 Dane
- Liczby tylko z odpowiedzi API, nigdy wpisane ręcznie. Brak wartości = `null`, nigdy `0`.
- Testy algorytmów mogą używać małych **danych syntetycznych zgodnych z kontraktem** z MASTER_PLAN §4.5, w pliku `tests/fixtures/synthetic/…` z komentarzem „dane syntetyczne do testu”. Takie liczby nigdy nie trafiają do `public/data`.
- Klucz BDL tylko jako sekret `BDL_CLIENT_ID` (GitHub, Jules). Nigdy w plikach, logach, czacie z Julesem ani w `VITE_*`.

---

## 3. Stan na 18.10.2026, 14:30

Scalone na main: fale 0–5 bez CC6.3b/CC6.4, w tym CC4.2 (#69), CC4.3 (#71), poprawki workflow PRNG (#65, #72).
Wysłane 18.10: CC5.4a (#74), CC8.1 (#75).
Zamknięte bez scalenia: #64 i #68 (CC6.3b/c: pętla, patrz sekcja 1). Gałąź `feat/indicators-config-cc6.3b-13743892434589782789` zostaje: jest na niej `config/indicators.json` (20 wpisów) do odzyskania.
Brakuje na main: `config/indicators.json`, `public/data/localities.json`, `public/data/values/`.
Sekret `BDL_CLIENT_ID`: ustawiony przez właściciela 18.10 (GitHub i Jules).

---

## 4. Plan sesji i fal (od teraz)

Legenda: **K** Jules, **S** workflow (Claude pisze, właściciel klika „Run workflow”), **C** Claude.

### 4.1 Tory pracy: kto może iść równolegle

Projekt dzielimy na **tory**. Każdy tor ma własne katalogi. Dwa zadania z **różnych torów** mogą iść naraz (najwyżej 2 zadania Julesa jednocześnie). Dwa zadania z **tego samego toru** idą zawsze po kolei.

| Tor | Katalogi i pliki (tylko ten tor je zmienia) | Sesje |
|---|---|---|
| **M – mapa** | `src/view/map/`, `src/core/map/` (bez `classes.ts`), `src/view/Home.tsx` | CC4, CC5.4b, CC8.2a, CC9, CC10 |
| **D – dane** | `scripts/data/`, `config/indicators.json`, `public/data/values/`, `tests/fixtures/bdl/`, `.github/workflows/` (tylko C) | CC6 |
| **W – wyszukiwarka** | `src/core/search/`, `src/view/search/` | CC5 |
| **P – profil** | `src/core/profile/`, `src/view/profile/` | CC7 |
| **K – kartogram** | `src/core/map/classes.ts`, `src/core/scale/`, `src/view/legend/`, `src/view/controls/` | CC8 |
| **Z – zgoda i jakość** | `src/core/consent/`, `src/view/consent/`, `src/view/pages/`, Lighthouse/axe | CC11 |
| **U – stan w adresie** | `src/core/url/` | CC4.R, potem tylko dopisywanie pól |

**Punkty zapalne** (najczęstsze konflikty): `AtlasMap.tsx`, `layers.ts`, `Home.tsx`, `Header.tsx`. Dotyka ich tylko tor M. Inne tory dostarczają **gotowy moduł lub komponent**, a jego podpięcie to osobne, małe zadanie toru M (oznaczone „podpięcie”).

### 4.2 Najważniejsza zmiana struktury: CC4.R (punkty podpięcia)

Dziś każda nowa funkcja mapy dopisuje kod do `AtlasMap.tsx` i `layers.ts`. To dlatego zadania mapy nie mogą iść równolegle i dlatego Jules psuje cudze testy. Zanim ruszy fala 7, robimy jedno zadanie porządkowe (tor M + U):

- `src/view/map/layers/registry.ts`: lista fabryk warstw (`woj`, `pow`, `gmi`, `country`, potem `loc`, `choropleth`, `basemap`, `3d`). Nowa warstwa = **nowy plik** w `src/view/map/layers/` + jedna linia w rejestrze.
- `src/core/url/state.ts`: jeden moduł stanu adresu (`?u=`, potem `?i=`, `?y=`, `?c=`) z testami. Na start obsługuje tylko `?u=` (przeniesione z `drill.ts`, zachowanie bez zmian). Kolejne pola dopisują zadania CC8.3a, CC8.3b, CC8.5a. Biblioteka `nuqs` (MASTER_PLAN §5) jest zainstalowana. Jules sprawdza w PR, czy jej użycie daje mniej kodu niż własna funkcja; jeśli nie, zostaje własna.
- `src/view/Home.tsx`: trzy stałe miejsca (sloty) na panele: `side` (arkusz profilu), `bottom` (legenda, suwak), `overlay` (porównanie). Moduły z innych torów wstawia się do slotu jedną linią.
- Warunek: wszystkie istniejące testy przechodzą **bez zmian** (`drill`, `breadcrumbs`, `map`, `home`, `search`). To czysta przebudowa, bez nowej funkcji.

Po CC4.R zadania „podpięcie” są małe (1–2 pliki), a nowe warstwy nie dotykają cudzych plików.

### 4.3 Sesje: cel, założenia, elementy, zadania

#### CC4 – mapa (domknięcie)
- **Cel:** mapa z przechodzeniem w głąb, okruszkami, `?u=` (zrobione) + blady podkład przy dużym zbliżeniu + zgodność z makietą 02.
- **Założenia:** mapę testujemy tylko przez `window.__atlas`, zrzuty WebGL informacyjne. Podkład OpenFreeMap (positron) dopiero od zoomu 9, bardzo blady, z atrybucją OSM. W testach żadnych żądań do serwerów kafelków (`page.route` blokuje).
- **Elementy:** `layers/registry.ts`, `layers/basemap.ts`, `core/url/state.ts`, sloty w `Home.tsx`.
- **Ryzyka:** `setWorkerCount(0)` (obejście z CC4.1b) może spowalniać mapę na telefonie → właściciel sprawdza podgląd Vercel w fali 7; zapasowe kolory hex w `layers.ts` → usuwa je CC4.R.
- **Zadania:** CC4.R (K, M+U), CC4.4 (K, M, podkład), CC4.5 (K, M + przegląd wizualny C).

#### CC5 – wyszukiwarka
- **Cel:** Ctrl+K znajduje jednostki i miejscowości; wybór miejscowości zbliża mapę.
- **Założenia:** `localities.json` ładowany leniwie, poza paczką główną. Brak pliku nie psuje wyszukiwarki. Miejscowość bez punktu PRNG ma centroid gminy i `approx: true`.
- **Elementy:** `core/search/localities.ts`, `core/search/load-localities.ts`, `layers/localities.ts`.
- **Ryzyka:** PRNG blokuje serwery GitHuba → CC5.3c (C) diagnozuje; plan B: zmniejszyć tempo, pobierać partiami w kilku uruchomieniach z cache.
- **Zadania:** CC5.4a (K, W), CC5.3c (C+S), CC5.4b (K, M, po CC4.R i danych).

#### CC6 – dane GUS
- **Cel:** 20 wskaźników z BDL w `public/data/values/`, odświeżanych co noc, z kontrolą formatu.
- **Założenia:** całe pobieranie robi GitHub Actions z sekretem; Jules pracuje na nagraniach. Liczby tylko z API, brak = `null`. Liczymy tylko jednostki z `units.json` (po `bdlId`). Robot otwiera PR z danymi, nie pushuje do main.
- **Elementy:** `config/indicators.json`, `scripts/data/record-bdl.mjs` + workflow `bdl-record.yml`, `scripts/data/coverage.mjs`, `scripts/data/values.mjs`, `scripts/data/fetch-values.mjs`, `scripts/data/contract.mjs`, workflowy `fetch-data.yml`, `nightly-data.yml`.
- **Ryzyka:** limit zapytań BDL (500/15 min z kluczem) → nagrywamy tylko ostatni rok i poziomy 5 i 6, a pełne lata pobiera robot w kilku przebiegach. Zmiana formatu API → CC6.5b.
- **Zadania:** CC6.3c-1 (C), CC6.3c-2 (C+S), CC6.3d (K), CC6.4a (K), CC6.4b (K), CC6.4c (C+S), CC6.5a (C), CC6.5b (K).

#### CC7 – profil miejsca („Fiszka”)
- **Cel:** po wybraniu jednostki widać arkusz z wartościami wskaźników, miejscem w rankingu, wykresem lat i przypisami (makiety 03 i 04).
- **Założenia:** logika (`buildProfile`) osobno od widoku. Wartość z poziomu wyższego opisana „dane dla powiatu X”. Przypisy z MASTER_PLAN §4.2. Źródło przy każdej liczbie: „Źródło: GUS, BDL, <rok>”. Na telefonie dolny arkusz (`react-modal-sheet`). Wykresy: `@observablehq/plot`, jako SVG. Najwyżej jedno zakreślenie na ekranie.
- **Elementy:** `core/profile/profile.ts`, `core/format/number.ts` (format liczb po polsku), `view/profile/ProfileSheet.tsx`, `view/profile/KpiRow.tsx`, `view/profile/Sparkline.tsx`, `view/profile/Footnotes.tsx`.
- **Ryzyka:** długie nazwy gmin i liczby wychodzą poza pola → warunek w każdym zadaniu UI (test z najdłuższą nazwą z `units.json`); zrzuty DOM wzorcowe tylko przez workflow „Update snapshots”.
- **Zadania:** CC7.1 (K, P), CC7.1b (K, P: format liczb), CC7.2a (K, P), CC7.2b (K, M: podpięcie do slotu `side`), CC7.3 (K, P: telefon), CC7.4a (K, P: wykres), CC7.4b (K, P: przypisy i źródła), CC7.4c (K, P: zakreślenie).

#### CC8 – kartogram
- **Cel:** mapa koloruje się wybranym wskaźnikiem i rokiem; legenda; braki danych kreskowane; porównanie 2–3 miejsc.
- **Założenia:** kolory tylko `--seq-1…5` i `--div-1…5`, najwyżej 5 klas, kwantyle domyślnie. Brak danych: token `data.noData` + kreskowanie (deck.gl `FillStyleExtension`). Stan w adresie: `?i=`, `?y=`, `?c=` w `core/url/state.ts`. Skale: `d3-scale`, `d3-array`.
- **Elementy:** `core/map/classes.ts`, `layers/choropleth.ts`, `view/legend/Legend.tsx`, `view/controls/IndicatorPicker.tsx`, `view/controls/YearSlider.tsx`, `core/compare/compare.ts`, `view/compare/ComparePanel.tsx`.
- **Ryzyka:** kartogram na 2479 gminach może zwolnić telefon → warunek wydajności w CC8.2a (aktualizacja koloru bez przebudowy geometrii, `updateTriggers`).
- **Zadania:** CC8.1 (K, K), CC8.2a (K, M: warstwa), CC8.2b (K, K: legenda), CC8.3a (K, K+U: wybór wskaźnika), CC8.3b (K, K+U: suwak lat), CC8.4 (K, M: kreskowanie), CC8.5a (K, U: logika porównania), CC8.5b (K, K: panel porównania).

#### CC9 – ruch „kreślenie”
- **Cel:** przy wejściu kontur Polski rysuje się tuszem (1,2 s), potem wypełnienie, potem zakreślenie; przejścia między poziomami.
- **Założenia:** czasy tylko z `tokens.motion`. `prefers-reduced-motion` = brak animacji (test). Bez sprężyn. Animacja nie blokuje kliknięć ani `window.__atlas.ready`.
- **Elementy:** `core/motion/timeline.ts` (czysta logika etapów), `view/map/IntroSequence.tsx`, `core/map/transition.ts`.
- **Zadania:** CC9.1a (K, M: logika etapów + test reduced-motion), CC9.1b (K, M: scena), CC9.2 (K, M: przejścia).

#### CC10 – tryb 3D „Arkusze”
- **Cel:** przełącznik 3D: jednostki jako arkusze o wysokości wg wskaźnika.
- **Założenia:** sprawdzane przez `window.__atlas` (kąt kamery `pitch`, lista warstw, wysokości), zrzuty 3D informacyjne. Na telefonie i słabym GPU 3D wyłączone z komunikatem. Antigravity tylko, gdy 3D wygląda źle.
- **Elementy:** `core/map/extrusion.ts`, `layers/sheets3d.ts`, `view/map/ModeToggle.tsx`.
- **Zadania:** CC10.1a (K, M: logika wysokości i kamery), CC10.1b (K, M: warstwa + przełącznik), CC10.2 (K, M: ograniczenia i szlif).

#### CC11 – zgoda, prywatność, jakość, start
- **Cel:** statystyki wyszukiwań tylko po zgodzie, strona `/prywatnosc`, budżety wydajności, dostępność wszystkich ekranów.
- **Założenia:** `posthog-js` (region EU) ładowany dopiero po zgodzie; bez zgody zero zdarzeń i ciasteczek (test sieci w e2e). Klucz PostHog publiczny z założenia (klucz projektu), ale tylko w zmiennych Vercel.
- **Elementy:** `core/consent/consent.ts`, `view/consent/ConsentBar.tsx`, `view/pages/Privacy.tsx`, `.github/workflows/lighthouse.yml` (C).
- **Zadania:** CC11.1a (K, Z: logika zgody), CC11.1b (K, Z: pasek + PostHog), CC11.2 (K, Z), CC11.3a (C), CC11.3b (K, osobno na każdy punkt raportu), CC11.4 (K, Z), audyt przed startem (C).

### 4.4 Siatka fal: co idzie jednocześnie

Każdy wiersz to fala. Kolumny to tory. W jednej fali naraz pracują najwyżej **2 zadania Julesa** (z różnych kolumn) + zadania C/S. Gdy zadanie się scali, w tej samej fali wchodzi następne z kolejki toru. Nie czekamy na koniec całej fali.

| Fala | Tor M (mapa) | Tor W / P (wyszukiwarka, profil) | Tor K (kartogram) | Tor D (dane, C+S) | Bramka wyjścia z fali |
|---|---|---|---|---|---|
| **6** | CC4.R | CC5.4a → CC7.1 → CC7.1b | CC8.1 | CC6.3c-1 → CC6.3c-2 → (S) nagranie → CC6.3d ∥ CC6.4a → CC6.4b → CC6.4c (S) → CC6.5a, CC6.5b; CC5.3c | `public/data/values/` i `config/indicators.json` na main, CC4.R scalone |
| **7** | CC5.4b → CC8.2a → CC7.2b | CC7.2a | CC8.2b | CC6.5 – pierwsze ręczne uruchomienie robota (Ty) | mapa koloruje się wskaźnikiem, profil otwiera się po kliknięciu; Ty: test na telefonie |
| **8** | CC4.4 → CC4.5 | CC7.3 | CC8.3a → CC8.3b | — | telefon: arkusz, wybór wskaźnika i roku działają; zrzuty wzorcowe odświeżone |
| **9** | CC8.4 → CC9.1a → CC9.1b | CC7.4a → CC7.4b → CC7.4c | — | — | test reduced-motion, test „jedno zakreślenie” |
| **10** | CC9.2 → CC10.1a → CC10.1b | — | CC8.5a → CC8.5b | — | porównanie i 3D działają przez `window.__atlas` |
| **11** | CC10.2 | — | — | — (Z: CC11.1a → CC11.1b → CC11.2) | klucz PostHog ustawiony; test „bez zgody zero zdarzeń” |
| **12** | — | — | — | CC11.3a (C) → CC11.3b; Z: CC11.4 | audyt przed startem, domena, 2 telefony |

Uwagi do siatki:
- W fali 6 tor M (CC4.R) i tor W (CC5.4a) mogą iść razem, ale CC4.R nie może iść razem z CC5.4b ani z niczym innym w `src/view/map/`.
- Tor M jest najbardziej obciążony. Dlatego w nim są tylko zadania, które naprawdę muszą dotknąć mapy; wszystko inne (legenda, arkusz, suwak, porównanie) powstaje w swoim torze jako gotowy komponent i wchodzi do slotu.
- Tor D nie zajmuje Julesa przez większość czasu (to praca C+S), więc w fali 6 Jules ma równolegle tory M, W i K.
- Kolejność w torze (→) jest wiążąca. Zadania z tej samej komórki po „∥” mogą iść razem.

### 4.5 Bramki przed każdą falą (sprawdza Architekt)

1. Poprzednia fala: wszystkie PR scalone albo świadomie zamknięte, `main` zielone.
2. Dane, na których pracuje nowa fala, są na main (nie na gałęzi `data/...`).
3. Prompty nowej fali napisane po scaleniu poprzedniej, z prawdziwymi nazwami plików i funkcji (sprawdzone w repo).
4. Żadne dwa zadania wysyłane naraz nie mają wspólnego pliku (porównaj listy „Zakres”).
5. `docs/PROMPTY.md` sekcja 3 zaktualizowana.

---

## 5. Wspólny blok (dopisz na końcu KAŻDEGO promptu K)

```markdown
### Zasady (obowiązują zawsze)
- Przeczytaj AGENTS.md. Najpierw testy do warunków odbioru (pokaż, że nie przechodzą), potem kod.
- Zmieniasz WYŁĄCZNIE pliki z listy „Zakres”. Nie zmieniasz istniejących testów, package.json, pnpm-lock.yaml, .github/, config/tokens.json, docs/STYL.md.
- Bez sieci: testy i kod działają na plikach z repo (public/data, public/geo, tests/fixtures). Nie wywołuj API GUS, PRNG ani innych serwerów. Jeśli czegoś brakuje w danych, zatrzymaj się i napisz komentarz.
- Gałąź: tylko `git merge origin/main`, bez rebase i bez `--force`. `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- Kolory, kroje, odstępy i czasy tylko z tokenów. Zero hexów i liczb wpisanych na sztywno w UI. Brak HTML w dymkach. Pola dotykowe min. 44 px. Animacje wyłączone przy prefers-reduced-motion.
- Przed pushem osobno: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` – wszystkie zielone. Nie uruchamiaj `pnpm shots` ani `pnpm verify`, nie commituj `docs/shots/` ani wzorców zrzutów.
- ZAKAZ PUSTYCH COMMITÓW: przed pushem `git diff --stat origin/main...HEAD` nie może być puste. Gdy odpowiadasz na uwagę, commit musi zmieniać pliki. Jeśli nie umiesz czegoś zrobić, NIE pushuj – napisz komentarz, co blokuje, i dostarcz mniejszą część.
- Opis PR po polsku: co zmieniło się dla użytkownika; tabela „warunek → test”; lista plików; rozmiar paczki głównej (gzip) przed i po, jeśli zmieniasz src/; czego nie zrobiłeś i dlaczego. Na koniec zapisz treść zadania jako docs/sessions/<ID>.md.
```

---

## 6. Prompty na najbliższą falę (fala 6)

Każdy prompt = treść zgłoszenia na GitHubie (tytuł = pierwsza linia), etykieta `jules`. Do każdego dopisz wspólny blok z sekcji 5.

### CC5.4a – Wyszukiwanie miejscowości (logika i leniwe ładowanie) · K · można teraz

```markdown
Zadanie: CC5.4a – wyszukiwanie miejscowości (logika i leniwe ładowanie)

Kontekst: okno Ctrl+K (CC5.2) szuka dziś tylko jednostek (`src/core/search`). Plik `public/data/localities.json` (kontrakt `Locality` w docs/MASTER_PLAN.md §4.5) jeszcze nie istnieje na main – powstanie z workflow PRNG. Do testów używasz próbek z `tests/fixtures/prng/`.

Cel dla użytkownika: po wpisaniu nazwy miejscowości w Ctrl+K widać ją w wynikach razem z gminą.

Zakres (tylko te pliki):
- `src/core/search/localities.ts` (nowy): budowa indeksu i wyszukiwanie miejscowości
- `src/core/search/load-localities.ts` (nowy): leniwe pobranie `/data/localities.json` przez `fetch`, z obsługą braku pliku
- `src/view/search/SearchDialog.tsx` (tylko dołączenie wyników miejscowości do listy)
- `tests/unit/localities-search.test.ts` (nowy)
- `tests/e2e/localities-search.spec.ts` (nowy; plik danych podstawiany przez `page.route` z próbki w tests/fixtures/prng)
- `docs/sessions/CC5.4a.md`

Warunki odbioru:
1. `searchLocalities("lodz")` i `searchLocalities("Łódź")` zwracają Łódź; wynik zawiera nazwę, typ (jeśli jest) i nazwę gminy z `units.json`. Najwyżej 50 wyników, dokładne trafienia na górze.
2. `localities.json` nie trafia do paczki głównej: ładowany dopiero po otwarciu okna Ctrl+K (test e2e: brak żądania przed otwarciem, jest po otwarciu).
3. Brak pliku (404) nie psuje okna: jednostki dalej się wyszukują, w konsoli nie ma błędu nieobsłużonego (test e2e).
4. Wyniki miejscowości są oznaczone jako osobna grupa „Miejscowości”, obsługa klawiaturą jak dotąd (istniejące `search.spec.ts` przechodzi bez zmian).
5. Paczka główna (gzip) nie rośnie o więcej niż 5 KB.

Poza zakresem: mapa, warstwa punktów, zbliżanie do miejscowości (to CC5.4b).
```

### CC8.1 – Klasy kolorów (logika) · K · można teraz, równolegle z CC5.4a

```markdown
Zadanie: CC8.1 – klasy kolorów kartogramu (czysta logika)

Kontekst: kartogram (CC8.2) pokoloruje gminy według wartości wskaźnika. Tu powstaje tylko logika podziału na klasy, bez UI. Prawdziwych wartości jeszcze nie ma na main, więc testy używają małych danych syntetycznych zgodnych z kontraktem `IndicatorValues` (docs/MASTER_PLAN.md §4.5).

Cel dla użytkownika: brak widocznej zmiany; to podstawa kolorowania mapy.

Zakres (tylko te pliki):
- `src/core/map/classes.ts` (nowy)
- `tests/unit/classes.test.ts` (nowy)
- `tests/fixtures/synthetic/values-sample.json` (nowy, z polem `"_comment": "dane syntetyczne do testu"`)
- `docs/sessions/CC8.1.md`

Warunki odbioru:
1. `computeBreaks(values, "quantile" | "equal", n)` zwraca n−1 progów rosnąco; wartości `null` są pomijane.
2. `classify(value, breaks)` zwraca indeks klasy 0…n−1, a dla `null` zwraca `"no-data"`.
3. Przypadki brzegowe mają testy: wszystkie wartości równe, mniej różnych wartości niż klas, jedna wartość, sama lista `null`.
4. `classColorToken(index, n, scheme)` zwraca nazwę zmiennej CSS z istniejących tokenów: `--seq-1`…`--seq-5` (skala `sequential`) albo `--div-1`…`--div-5` (`diverging`, dla wskaźników z `higherIsBetter: null` nie używać), nigdy kolor hex. Dla `"no-data"` zwraca token braku danych (`data.noData`). Najwyżej 5 klas.
5. Moduł nie importuje Reacta, DOM ani deck.gl (test importów jak w `tests/unit/dependencies.test.ts`, w nowym pliku).
```

### CC4.R – Punkty podpięcia mapy (rejestr warstw, stan adresu, sloty) · K · po scaleniu CC5.4a albo CC8.1

```markdown
Zadanie: CC4.R – rejestr warstw, moduł stanu adresu i sloty na panele (przebudowa bez nowej funkcji)

Kontekst: każda nowa funkcja mapy dopisuje dziś kod do `src/view/map/AtlasMap.tsx` i `src/view/map/layers.ts`, więc zadania mapy kolidują ze sobą. Po tej przebudowie nowa warstwa to nowy plik, a nowy panel to jedna linia w slocie. Zachowanie strony się NIE zmienia.

Cel dla użytkownika: brak widocznej zmiany.

Zakres (tylko te pliki):
- `src/view/map/layers/registry.ts` (nowy): lista fabryk warstw; `src/view/map/layers/admin.ts` (nowy): obecne warstwy `woj`, `pow`, `gmi`, `country` przeniesione z `layers.ts`
- `src/view/map/layers.ts` (zostaje tylko jako ponowny eksport z `layers/`, żeby istniejące importy działały)
- `src/core/url/state.ts` (nowy): odczyt i zapis `?u=` (logika przeniesiona z `src/core/map/drill.ts`, które ją re-eksportuje)
- `src/view/map/AtlasMap.tsx` (tylko użycie rejestru i `core/url/state.ts`)
- `src/view/Home.tsx` (tylko trzy puste sloty: `side`, `bottom`, `overlay` jako elementy z `data-slot`)
- `tests/unit/layer-registry.test.ts`, `tests/unit/url-state.test.ts` (nowe), `docs/sessions/CC4.R.md`

Warunki odbioru:
1. Wszystkie istniejące testy przechodzą BEZ ŻADNEJ zmiany w katalogu `tests/` poza dwoma nowymi plikami (w szczególności `drill`, `breadcrumbs`, `map`, `home`, `search`).
2. `getLayerFactories()` zwraca fabryki w stałej kolejności; `window.__atlas.layers` ma te same identyfikatory co przed zmianą, w tej samej kolejności (test jednostkowy na rejestrze).
3. `readUrlState(search)` / `writeUrlState(state)` obsługują `u` (nieznany TERYT ignorowany, inne parametry jak `e2e`, `tune` zachowane); typ stanu ma już pola `i`, `y`, `c` jako opcjonalne, jeszcze nieużywane. Sprawdź, czy `nuqs` (jest w package.json) daje mniej kodu; opisz wybór w PR jednym zdaniem.
4. Zero hexów w `src/view/map/` (zapasowe kolory w `getMapColorsFromCss` zastąpione odczytem tokenów; jeśli zmienna CSS jest pusta, warstwa czeka na następny odczyt zamiast używać koloru z kodu).
5. Paczka główna (gzip) nie rośnie o więcej niż 2 KB.

Poza zakresem: nowe warstwy, nowe panele, zmiany wyglądu.
```

### CC7.1b – Formatowanie liczb po polsku · K · razem z dowolnym zadaniem spoza toru P

```markdown
Zadanie: CC7.1b – formatowanie liczb, jednostek i źródła po polsku (czysta logika)

Kontekst: profil, legenda i dymki będą pokazywać liczby. Jedno miejsce formatowania zapobiega różnicom („1 234,5”, „12,3%”, „zł”).

Zakres (tylko te pliki):
- `src/core/format/number.ts` (nowy)
- `tests/unit/format-number.test.ts` (nowy)
- `docs/sessions/CC7.1b.md`

Warunki odbioru:
1. `formatValue(value, unit)` używa `Intl.NumberFormat('pl-PL')`: spacja niełamiąca jako separator tysięcy, przecinek dziesiętny, `%` i `zł` z niełamiącą spacją przed jednostką (testy dla 0, 1234,5, 1 000 000, ujemnych).
2. `null` → „brak danych” (nigdy „0” ani „NaN”).
3. Liczba miejsc po przecinku zależy od jednostki (% → 1, zł → 0, osoby → 0, na 1000 → 1); tabela w kodzie, test dla każdej jednostki z `config/indicators.json` (jeśli plik jeszcze nie istnieje na main, test na liście jednostek z MASTER_PLAN §4.2).
4. `formatSource(year)` → „Źródło: GUS, BDL, <rok>”.
5. Bez Reacta i DOM.
```

### CC7.1 – Logika profilu · K · po scaleniu CC5.4a lub CC8.1 (limit 2 naraz)

```markdown
Zadanie: CC7.1 – logika profilu jednostki (czysta logika)

Kontekst: arkusz profilu (CC7.2) pokaże dla wybranej gminy/powiatu wartości wskaźników i miejsce w rankingu. Tu powstaje tylko logika. Wskaźniki: kontrakt `Indicator`, wartości: `IndicatorValues` (docs/MASTER_PLAN.md §4.5). Testy na danych syntetycznych.

Cel dla użytkownika: brak widocznej zmiany; to podstawa arkusza profilu.

Zakres (tylko te pliki):
- `src/core/profile/profile.ts` (nowy)
- `tests/unit/profile.test.ts` (nowy)
- `tests/fixtures/synthetic/profile-sample.json` (nowy, z polem `"_comment": "dane syntetyczne do testu"`)
- `docs/sessions/CC7.1.md`

Warunki odbioru:
1. `buildProfile(teryt, indicators, valuesById, units)` zwraca dla każdego wskaźnika: ostatni rok z wartością, wartość, miejsce w kraju i w województwie (wśród jednostek tego samego poziomu), liczbę jednostek w rankingu.
2. Kierunek rankingu z `higherIsBetter`; dla `null` (neutralny) ranking malejąco, z flagą `neutral: true`.
3. Remisy dostają to samo miejsce (test). Jednostki z `null` nie biorą udziału w rankingu i nie dostają miejsca.
4. Gdy wskaźnik ma `minLevel` wyższy niż poziom jednostki (np. powiat dla gminy), profil bierze wartość jednostki nadrzędnej i ustawia `fromParent: "<teryt rodzica>"`.
5. Nieznany TERYT zwraca pusty profil bez wyjątku. Moduł bez Reacta i DOM.
```

### CC6.3d – Pokrycie gmin w raporcie wskaźników · K · po kroku 3 (dane BDL nagrane na main)

```markdown
Zadanie: CC6.3d – pokrycie w discover.mjs liczone po jednostkach z units.json

Kontekst: `scripts/data/discover.mjs` przycina pokrycie: `gmiCount = min(totalRecords, 2479)`. Zmienna z rekordami części gmin dostaje zawsze „2479/2479”. Nagrane odpowiedzi BDL dla wszystkich zmiennych z `config/indicators.json` leżą w `tests/fixtures/bdl/recorded/` (workflow „BDL record”). Nie pobierasz niczego z sieci.

Cel dla użytkownika: raport `docs/data-report.md` pokazuje prawdziwą liczbę gmin i powiatów z danymi.

Zakres (tylko te pliki):
- `scripts/data/coverage.mjs` (nowy): czysta funkcja `countCoverage(records, units, level)`
- `scripts/data/discover.mjs` (tylko użycie `countCoverage` i usunięcie przycinania)
- `tests/unit/coverage.test.ts` (nowy)
- `docs/data-report.md` (tylko liczby pokrycia, wygenerowane skryptem w trybie offline)
- `docs/sessions/CC6.3d.md`

Warunki odbioru:
1. Pokrycie = liczba rekordów, których `id` jest w zbiorze `bdlId` jednostek danego poziomu z `public/data/units.json` i które mają wartość w danym roku. Rekordy części gmin (np. miasto/obszar wiejski gminy miejsko-wiejskiej) nie są liczone (test na fixturze z obiema sytuacjami).
2. Brak przycinania do 2479/380 w całym skrypcie (test: wynik dla fixtury z nadmiarem rekordów < liczby rekordów).
3. Skrypt działa offline na nagranych plikach (`--offline`), test go tak uruchamia.
4. Tabela w raporcie: id wskaźnika, var-id, poziom, ostatni rok, liczba gmin i powiatów z wartością / wszystkich. Tę samą tabelę wklej do opisu PR.
```

### CC6.4a – Logika pobierania wartości · K · po kroku 3, równolegle z CC6.3d

```markdown
Zadanie: CC6.4a – zamiana odpowiedzi BDL na pliki wartości (czysta logika)

Kontekst: strona czyta liczby tylko z `public/data/values/<indicatorId>.json` (kontrakt `IndicatorValues`, docs/MASTER_PLAN.md §4.5). Nagrane odpowiedzi `/data/by-variable/<id>?unit-level=…` są w `tests/fixtures/bdl/recorded/`. Tu powstaje tylko przekształcenie, bez sieci i bez CLI.

Zakres (tylko te pliki):
- `scripts/data/values.mjs` (nowy): `toIndicatorValues(indicator, pages, units)` i `nextPageUrl(page)`
- `tests/unit/values.test.ts` (nowy)
- `docs/sessions/CC6.4a.md`

Warunki odbioru:
1. Wynik ma klucze TERYT (string) z `units.json`, przypisane przez `bdlId`; rekordy spoza `units.json` są pomijane i liczone w polu raportu `skipped`.
2. Brak wartości w roku = `null`, nigdy `0` (test na fixturze z brakami). `years` rosnąco, tablice wartości tej samej długości co `years`.
3. Rekordy ze wszystkich stron są łączone (test na fixturze wielostronicowej); `nextPageUrl` zwraca `null` na ostatniej stronie.
4. Wartości liczbowe bez zaokrąglania; liczby tylko z fixtur.
5. Nie zmieniasz `config/indicators.json`.
```

### CC6.4b – Skrypt pobierania (CLI) · K · po scaleniu CC6.4a

```markdown
Zadanie: CC6.4b – skrypt `pnpm data:fetch` wokół logiki z CC6.4a

Kontekst: `scripts/data/values.mjs` (CC6.4a) zamienia strony BDL na pliki wartości. Klient BDL z limitami istnieje z CC6.1 (`src/core/bdl` lub `scripts/` – sprawdź). Ten skrypt uruchamia tylko workflow w GitHub Actions z sekretem `BDL_CLIENT_ID`; w testach zawsze działa na fixturach (wstrzyknięta funkcja pobierająca).

Zakres (tylko te pliki):
- `scripts/data/fetch-values.mjs` (nowy)
- `package.json` – WYŁĄCZNIE dopisanie jednej linii skryptu `"data:fetch": "node scripts/data/fetch-values.mjs"` (wyjątek od zakazu, nic więcej)
- `tests/unit/fetch-values.test.ts` (nowy)
- `docs/sessions/CC6.4b.md`

Warunki odbioru:
1. Brak `BDL_CLIENT_ID` w środowisku kończy skrypt kodem 1 i czytelnym komunikatem, bez tworzenia plików (test).
2. Limit 8 żądań/s i ponowienia przy 429/5xx (wykładniczo, maks. 5 prób) – test na wstrzykniętym zegarze i fałszywym fetch.
3. Klucz nie pojawia się w żadnym logu ani pliku (test przechwytuje stdout/stderr).
4. Na koniec raport w stdout: wskaźnik, rok, liczba jednostek z wartością / wszystkich, liczba zapytań.
5. Zapis do `public/data/values/` tylko po sukcesie wszystkich stron danego wskaźnika (brak połówkowych plików, test).
```

### CC5.4b – Miejscowości na mapie · K · po CC5.4a, CC4.R i `localities.json` na main

```markdown
Zadanie: CC5.4b – wybór miejscowości zbliża mapę, punkty od zoomu 9

Kontekst: CC5.4a dodało miejscowości do Ctrl+K. Mapa ma przechodzenie w głąb i `?u=` (CC4.2, CC4.3) oraz rejestr warstw i moduł stanu adresu (CC4.R). `public/data/localities.json` jest już na main.

Zakres (tylko te pliki):
- `src/core/map/localities-layer.ts` (nowy): filtr widocznych punktów i dane warstwy
- `src/view/map/layers/localities.ts` (nowy) + jedna linia w `src/view/map/layers/registry.ts` (rejestr z CC4.R)
- `src/view/map/AtlasMap.tsx` (tylko obsługa wyboru miejscowości, jeśli CC4.R nie dało do tego punktu podpięcia)
- `tests/unit/localities-layer.test.ts`, `tests/e2e/localities-map.spec.ts` (nowe)
- `docs/sessions/CC5.4b.md`

Warunki odbioru:
1. Wybór miejscowości w Ctrl+K ustawia `?u=` na TERYT jej gminy i zbliża widok do punktu (test na `window.__atlas`: `selected`, `viewState.zoom ≥ 11`).
2. Warstwa `loc-layer` jest w `window.__atlas.layers` tylko przy zoomie ≥ 9.
3. Dymek miejscowości tylko tekstem (istniejący test zakazu HTML przechodzi).
4. Punkty z `approx: true` mają inny, opisany w PR wygląd z tokenów.
5. Istniejące testy `drill.spec.ts`, `breadcrumbs.spec.ts`, `map.spec.ts` przechodzą bez zmian.
```

### CC6.5b – Test kontraktu danych · K · po CC6.4c

```markdown
Zadanie: CC6.5b – test kontraktu plików danych i odpowiedzi BDL

Kontekst: nocny robot (`.github/workflows/nightly-data.yml`, pisze Claude) będzie odświeżał `public/data/values/`. Test ma wykryć, że API GUS zmieniło format albo że plik danych jest uszkodzony, zanim trafi na stronę.

Zakres (tylko te pliki):
- `tests/unit/data-contract.test.ts` (nowy)
- `scripts/data/contract.mjs` (nowy): walidacja kształtu, używana też przez robota
- `docs/sessions/CC6.5b.md`

Warunki odbioru:
1. Każdy plik `public/data/values/*.json` spełnia `IndicatorValues`: klucze TERYT istnieją w `units.json`, długości tablic = długość `years`, wartości to liczby lub `null`.
2. Każdy wskaźnik z `config/indicators.json` ma plik wartości.
3. `validateBdlPage(json)` sprawdza pola, z których korzysta CC6.4a (`results[].id`, `values[].year`, `values[].val`, `links.next`); test na nagranej fixturze przechodzi, na uszkodzonej kopii pada z czytelnym komunikatem.
4. `node scripts/data/contract.mjs` kończy się kodem 1 przy błędzie (robot użyje tego do przerwania commita).
```

### Zadania C i S w fali 6 (dla Claude'a lub Architekta zastępczego)

- **CC6.3c-1:** z gałęzi `feat/indicators-config-cc6.3b-13743892434589782789` przenieść na nową gałąź od main: `config/indicators.json`, `tests/unit/indicators-config.test.ts`, `docs/data-report.md`; w `config/indicators.json` ustawić `unemployed-share-working-age` → `bdlVarId: 79214`, `minLevel: "gmi"` (temat P2670 „ogółem”, %, 2003–2025). Bez `discover-cache.json` (zastąpią go nagrania). PR, CI zielone, scalenie.
- **CC6.3c-2:** `scripts/data/record-bdl.mjs` + `.github/workflows/bdl-record.yml` (ręczny, `workflow_dispatch`): dla każdego wskaźnika nagrywa `/variables/<id>` i wszystkie strony `/data/by-variable/<id>?unit-level=5` i `=6` (ostatni rok), do `tests/fixtures/bdl/recorded/<id>-<level>-p<n>.json`, z kluczem z sekretu, klucz wycinany z zapisanych plików; commit na gałąź `data/bdl-fixtures`; błędy jako `::error::` z przyczyną (nie końcem stosu).
- **CC6.4c:** `.github/workflows/fetch-data.yml` (ręczny): `pnpm data:fetch` → `node scripts/data/contract.mjs` (gdy istnieje) → commit `public/data/values/` na gałąź `data/values`. Claude sprawdza liczby na 3 jednostkach (Polska, Małopolska, Zakopane) z WebFetch BDL przed scaleniem.
- **CC5.3c:** właściciel uruchamia „Fetch localities (PRNG)”; Claude czyta adnotację (`gh api repos/<repo>/check-runs/<job>/annotations`) i poprawia `scripts/geo/localities.mjs` (tempo, timeout, nagłówki) jako własny PR.
- **CC6.5a:** `.github/workflows/nightly-data.yml`: cron `0 1 * * *`, `pnpm data:fetch` → `node scripts/data/contract.mjs` → PR z danymi (nie push do main), uruchamia się tylko gdy sekret istnieje, e-mail przy błędzie (domyślny GitHub).

---

## 7. Szablon promptu dla fal 7–12

Prompty na fale 7–12 pisze się dopiero po scaleniu fali poprzedniej (wtedy znamy nazwy plików i funkcji). Każdy według wzoru:

```markdown
Zadanie: <ID> – <tytuł z tabeli w sekcji 4>

Kontekst: <1–3 zdania: co już istnieje (pliki, funkcje z poprzednich zadań), skąd dane>.

Cel dla użytkownika: <co widzi po zmianie>.

Zakres (tylko te pliki):
- <maks. 6 plików, z dopiskiem „(nowy)” albo „(tylko …)”>
- docs/sessions/<ID>.md

Warunki odbioru:
1. … (każdy sprawdzalny testem offline; przy UI: test na DOM lub window.__atlas, zrzut tylko DOM/SVG)
…(maks. 5)

Poza zakresem: <co zostawić, bo robi to następne zadanie>.

<Wspólny blok z sekcji 5>
```

Przed wysłaniem sprawdź: (1) czy lista plików nie pokrywa się z innym otwartym zadaniem; (2) czy nie ma słowa „oraz” w tytule; (3) czy żaden warunek nie wymaga sieci; (4) czy dane, na których zadanie pracuje, są już na main.

---

## 8. Przegląd PR (lista dla Architekta)

1. **CI:** `verify` i `security` zielone.
2. **Commit niepusty:** `git diff --stat <poprzedni sha> <nowy sha>` – przy odpowiedzi na uwagę musi coś pokazać.
3. **Nic nie usunięte:** `git diff --name-status --diff-filter=D origin/main...<gałąź>` puste.
4. **Zakres:** lista plików w PR = lista z promptu (poza `docs/sessions/`).
5. **Testy:** każdy warunek ma test, który naprawdę go sprawdza; istniejące testy niezmienione (`git diff origin/main...<gałąź> -- tests/` pokazuje tylko nowe pliki).
6. **Zakazy:** brak hexów w `src/view`, brak `VITE_*` z kluczem, brak `dangerouslySetInnerHTML`/HTML w dymkach, brak `skip`/`only`/`@ts-ignore`/`oxlint-disable`.
7. **Werdykt:** SCAL (squash, tytuł `typ(obszar): <ID> – opis (#nr)`) albo jeden komentarz `@Jules` z ponumerowanymi punktami. Po 2 nieudanych rundach: sekcja 2.5.
8. Po scaleniu: zaktualizuj tabelę stanu w sekcji 3 tego pliku (przez PR) i wyślij następne zadanie z sekcji 4.

Ograniczenia sesji Claude'a (żeby nie tracić czasu): `gh` GraphQL zablokowany (używaj `gh api` REST; `gh issue create` nie działa – `gh api -X POST repos/<repo>/issues`); logi Actions i sekrety niedostępne (czytaj adnotacje check-runów); `bdl.stat.gov.pl` i `ogcapi.geoportal.gov.pl` niedostępne z sandboxa (dane pobiera workflow, WebFetch tylko do sprawdzenia pojedynczych liczb).

---

## 9. Tryb awaryjny (gdy Claude ma wyczerpany limit)

1. Otwórz Gemini, wklej: `WORKFLOW.md`, ten plik (`docs/PROMPTY.md`) i napisz: „Jesteś Architektem projektu Faktografia Atlas. Działaj według docs/PROMPTY.md. Następne zadanie według sekcji 4: <ID>.”
2. **Wysyłka zadania:** na GitHubie Issues → New issue; tytuł = pierwsza linia promptu; treść = prompt z sekcji 6 + wspólny blok z sekcji 5; etykieta `jules`. Jeśli Jules napisze „failed to create a task”: usuń etykietę `jules` i dodaj ją ponownie.
3. **Przegląd bez Claude'a** (na telefonie, w PR):
   - zakładka *Checks*: oba zielone;
   - zakładka *Files changed*: tylko pliki z „Zakresu”, żaden plik czerwony „deleted”, w `tests/` tylko nowe pliki;
   - po odpowiedzi Julesa na uwagę: w zakładce *Commits* nowy commit ma „+” i „−” (nie „0 files changed”);
   - wklej do Gemini: opis PR + listę plików + prompt zadania i zapytaj „TRYB: PR, werdykt według sekcji 8 docs/PROMPTY.md”.
4. **Nie rób bez Claude'a:** zadań typu C i S (workflowy, `.github/`), scalania PR z danymi (`public/data/`), zmiany `config/indicators.json`. Te zadania poczekają, zadań K może być w tym czasie kilka.
5. Gemini to ta sama rodzina modeli co Jules: jego przegląd kodu jest słabszy. Scalaj tylko zadania K, w których lista plików i testów jest zgodna z promptem, a CI zielone.
