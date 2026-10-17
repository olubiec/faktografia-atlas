# Kolejka zadań (źródło prawdy)

Ten plik mówi, co wysłać do Julesa, kiedy i z jakim tekstem. Zmiany w nim idą przez PR (jak każdy dokument), a nie bezpośrednio na main.

## Zasady

1. **1 wpis = 1 zgłoszenie = 1 sesja Julesa = 1 PR.**
2. **Wysyłka tylko, gdy zależności są scalone na main** (kolumna „Zależy od”). Zadanie z niespełnioną zależnością ma status `czeka`.
3. **Naraz tyle zadań, ile mają rozłączne pliki.** Dwa zadania, które dotykają tych samych plików (np. `Home.tsx`, `Header.tsx`), nie idą równolegle. Reszta może.
4. **Jedna rzecz na raz w jednym miejscu:** tylko jedna sesja aktualizuje ten plik, zawsze przez PR.
5. **Kto co robi:**
   - **Haiku** (sesja wysyłkowa): zakłada zgłoszenie z gotowego szablonu, dodaje etykietę `jules`, wpisuje numer do tabeli. Nie ocenia kodu, nie scala.
   - **Sonnet** (sesja kontrolna): dla każdego PR w przeglądzie sprawdza: CI, `git diff --name-status --diff-filter=D origin/main...<gałąź>` (ma być puste), zakres plików, testy warunków odbioru. Wynik to raport: „OK” albo lista problemów. Nie scala.
   - **Claude (ocena merytoryczna):** przegląd diffu względem warunków odbioru, decyzja o poprawce.
   - **Ty:** scalanie (squash), „scalaj”, decyzje o repo i sekretach.
6. **Statusy:** `czeka` (zależność), `gotowe` (można wysłać), `wysłane` (#zgłoszenia), `w przeglądzie` (PR), `scalone`.
7. **Żadne zgłoszenie nie zmienia `package.json`, `.github/`, `src/App.tsx` ani `public/data/` poza wskazanym zakresem.**

## Stan na 17.10, wieczór

| Zadanie | Zgłoszenie | PR | Zależy od | Status |
|---|---|---|---|---|
| CC1.5 makiety | — | #30 | — | scalone |
| CC6.2 mapowanie GUS ↔ TERYT | #29 | #36 | CC3.2 | scalone |
| CC5.1 indeks wyszukiwania | #32 | #35 | CC3.2 | scalone |
| CC2.6a tokens-map, diffTokens | #40 | #41 | CC2.4 | scalone |
| CC5.3a parser PRNG | #33 | #43 | CC3.2 | scalone |
| CC6.3 raport wskaźników BDL | — | #45 | CC6.2 | scalone (raport czeka na akceptację) |
| CC2.5 nagłówek i ekran startowy | #31 | #46 | CC2.1, CC1.5 | scalone |
| CC5.2 okno Ctrl+K | #50 | #51 | CC5.1, CC2.2 | w przeglądzie (poprawki Claude'a) |
| CC5.3b pobieranie PRNG przez Actions | #49 | #53 | CC5.3a | w przeglądzie (poprawki Claude'a) |
| CC4.1a logika widoku mapy, szew testowy | #54 | #57 | CC2.5, CC3.2 | w przeglądzie |
| CC2.6b-1 panel ?tune, zakładka Kolory | #56 | #58 | CC2.6a | w przeglądzie |
| CC4.1b komponent mapy | #55 | — | CC4.1a scalone | czeka |
| CC2.6b-2 panel ?tune, pozostałe zakładki | — | — | CC2.6b-1 scalone | czeka |
| CC4.2 przechodzenie w głąb | — | — | CC4.1b scalone | czeka |
| CC6.4 pobieranie danych | — | — | akceptacja raportu CC6.3, sekret `BDL_CLIENT_ID` | czeka |

Zamknięte bez scalenia: #37, #39 (CC2.6, pętla Julesa), #47 (CC2.6b, bez PR przez ponad 3 h), #52 (CC4.1, pusty PR), #48 (zastąpione przez #54 i #55).

**Następna wysyłka:** CC4.1b (#55, dodaj etykietę `jules` po scaleniu #57). CC2.6b-2 rozpisz po scaleniu #58.

**Po scaleniu #53:** właściciel uruchamia Actions → „Fetch localities (PRNG)” (gałąź `data/localities`), Claude sprawdza liczby i licencję PRNG.

## Fala 4–5: wpisy do wysłania

### CC4.1 mapa: kalka, kontur, szew testowy
- **Podzielone** na CC4.1a (#54, logika) i CC4.1b (#55, komponent). Pełne treści są w tych zgłoszeniach; poniższy tekst to pierwotny opis.
- **Status:** `wysłane` (CC4.1a), `czeka` (CC4.1b)

> Kontekst: przeczytaj AGENTS.md („Gałąź i PR”), docs/STYL.md, docs/MASTER_PLAN.md §3 (mapa) oraz `docs/design/README.md` (makiety 01 i 02).
> Dane: `public/geo/admin.topo.json` (województwa, powiaty, gminy), `public/data/units.json` (jednostki).
>
> Cel: mapa Polski na MapLibre GL + react-map-gl + deck.gl, zastępuje statyczną kalkę na ekranie startowym.
>
> Zakres: `src/view/map/` (nowe pliki), `src/view/Home.tsx` (tylko podmiana kalki na mapę), `tests/unit/map.test.ts`, `tests/e2e/map.spec.ts`, `docs/sessions/CC4.1.md`.
>
> Warunki odbioru (najpierw testy):
> 1. Mapa startuje z widokiem całego kraju, granice przesuwania i przybliżania ograniczone do Polski.
> 2. Warstwy deck.gl z `admin.topo.json`: województwa, szczeliny 1–1,5 px w kolorze arkusza, kontur kraju 1,5 px tuszem. Motyw jasny i ciemny z tokenów.
> 3. Bez podkładu ulic. Brak zapytań do zewnętrznych serwerów kafelków w testach.
> 4. Szew testowy `window.__atlas` (warstwy, wybrana jednostka, widok) wyłącznie w trybie testowym. Testy e2e sprawdzają tylko ten stan, nie piksele.
> 5. Lint: zakaz zwracania HTML z `getTooltip` w deck.gl (reguła w `.oxlintrc.json`).
> 6. Zrzut mapy jako informacyjny, nieblokujący.
>
> Zasady gałęzi (obowiązkowe): tylko `git merge origin/main`, bez rebase i `--force`. Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste. Przed pushem `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` zielone. Nie osłabiaj reguł ani testów.

### CC6.3 wybór 20 wskaźników → raport (STOP na przeglądzie)
- **Zależy od:** CC6.2 scalone
- **Status:** `scalone` (#45)

> Kontekst: przeczytaj AGENTS.md („Gałąź i PR”), docs/MASTER_PLAN.md §4.2 (lista wskaźników) i docs/data-sources.md.
>
> Cel: dla każdego wskaźnika z §4.2 znaleźć zmienne w BDL i zaproponować 1–3 kandydatów z uzasadnieniem. Nie pobieraj danych do `public/data/` i nie zmieniaj strony.
>
> Zakres: `scripts/data/discover.mjs` (nowy), `tests/unit/discover.test.ts`, `tests/fixtures/bdl/` (nagrane odpowiedzi API), `docs/data-report.md` (nowy), `docs/sessions/CC6.3.md`.
>
> Dla każdego kandydata w raporcie: jednostka miary, najniższy poziom z danymi, dostępne lata, pokrycie (ile gmin i powiatów ma wartość w ostatnim roku), przykładowe wartości dla Małopolski i Zakopanego. Liczby pochodzą tylko z odpowiedzi API, nie wpisuj ich ręcznie.
>
> Warunki odbioru: każdy wskaźnik z §4.2 ma wpis w raporcie (także „brak danych”); skrypt działa offline na fixturach w testach; klucz `X-ClientId` tylko z `process.env.BDL_CLIENT_ID`, nigdy w kodzie.
>
> **Zatrzymaj się po PR z raportem.** Nie tworzy `config/indicators.json`. Ten plik powstanie po akceptacji właściciela.
>
> Zasady gałęzi: jak wyżej (merge, zero usuniętych plików, lint/typy/testy/build/e2e zielone).

### CC5.2 okno wyszukiwania (Ctrl+K)
- **Zależy od:** CC5.1 scalone, CC2.2 scalone
- **Status:** `w przeglądzie` (#51)

> Kontekst: przeczytaj AGENTS.md („Gałąź i PR”), docs/STYL.md (§ komponenty: cmdk, dialog) i `src/core/search` z CC5.1.
>
> Cel: okno Ctrl+K (cmdk) z wynikami z indeksu CC5.1. Enter przechodzi do jednostki, strzałki poruszają wynikiem, Esc zamyka.
>
> Zakres: `src/view/search/` (nowe pliki), `src/view/Header.tsx` (tylko podpięcie skrótu i pola), `tests/unit/search-ui.test.ts`, `tests/e2e/search.spec.ts`, `docs/sessions/CC5.2.md`.
>
> Warunki odbioru:
> 1. Ctrl+K i Cmd+K otwierają okno, Esc je zamyka i przywraca fokus na poprzedni element.
> 2. Wyniki pochodzą z `search()` z CC5.1; test sprawdza „lodz” → Łódź.
> 3. Strzałki i Enter działają bez myszy; test e2e na klawiaturze.
> 4. Na telefonie okno zajmuje cały ekran; axe bez nowych naruszeń.
> 5. Brak wyniku pokazuje komunikat, nie pustą listę.
>
> Zasady gałęzi: jak wyżej.

### CC4.2 przechodzenie w głąb (województwo → powiaty → gminy)
- **Zależy od:** CC4.1 scalone
- **Status:** `czeka`

> Kontekst: przeczytaj AGENTS.md („Gałąź i PR”), docs/MASTER_PLAN.md §3 (mapa) i `docs/design/README.md`.
>
> Cel: kliknięcie jednostki na mapie przybliża ją i pokazuje jej poziom niżej (województwo → powiaty, powiat → gminy). Przycisk „wróć” cofa poziom.
>
> Zakres: `src/view/map/` (zmiany w warstwach i stanie wyboru), `src/core/units/` (tylko odczyt, bez zmian logiki), `tests/unit/drill.test.ts`, `tests/e2e/drill.spec.ts`, `docs/sessions/CC4.2.md`.
>
> Warunki odbioru:
> 1. Klik w województwo ładuje powiaty tego województwa; test na `window.__atlas` sprawdza listę warstw.
> 2. Klik w powiat ładuje gminy; kraj i województwo nie znikają.
> 3. „Wróć” cofa poziom i przywraca widok; test sprawdza stan po cofnięciu.
> 4. Adres `?u=` zachowuje wybraną jednostkę (test e2e: wejście z `?u=` otwiera jednostkę).
> 5. Zbudowany pakiet nie rośnie o więcej niż 150 KB gzip względem main (sprawdzane w CI).
>
> Zasady gałęzi: jak wyżej.

### CC6.4 pobieranie danych do public/data (po przeglądzie CC6.3)
- **Zależy od:** przegląd CC6.3 zaakceptowany przez właściciela, sekret `BDL_CLIENT_ID` w GitHub Secrets i w ustawieniach Julesa
- **Status:** `czeka`

> Kontekst: przeczytaj AGENTS.md („Gałąź i PR”, „Zawsze”), docs/MASTER_PLAN.md §4 i `config/indicators.json` (z zaakceptowanego CC6.3).
>
> Cel: skrypt pobiera wybrane wskaźniki z BDL do `public/data/` z kluczem `BDL_CLIENT_ID` z środowiska. Uruchamiany tylko przez robota nocnego lub ręcznie w CI, nigdy przez stronę.
>
> Zakres: `scripts/data/fetch.mjs` (nowy), `tests/unit/fetch.test.ts`, `tests/fixtures/bdl/`, `public/data/` (tylko nowe pliki wskaźników), `docs/sessions/CC6.4.md`.
>
> Warunki odbioru:
> 1. Klient BDL ma limity: 8 żądań/s, ponowienia przy 429 i 5xx (test jednostkowy na fixturach).
> 2. Test: zbudowana strona nie zawiera adresu `bdl.stat.gov.pl` ani zmiennych `VITE_*` z kluczem.
> 3. Strona czyta tylko `public/data`; test e2e sprawdza, że żadne żądanie nie idzie do `bdl.stat.gov.pl`.
> 4. Klucz nigdy nie trafia do logów, plików ani commitów (gitleaks zielony).
> 5. Brak klucza w środowisku kończy skrypt czytelnym błędem, nie cichym pustym plikiem.
>
> Zasady gałęzi: jak wyżej.

## Fale 6–12

Wpisy zakładam, gdy zależności z wyższych fal są scalone. Zakres z `docs/PLAN.md`, sekcje „Fala 6” do „Fala 12”.

## Po każdym scaleniu

1. Sonnet aktualizuje tabelę „Stan” i sprawdza, czy można wysłać kolejne zadanie.
2. Claude zapisuje zmiany w tym pliku przez PR.
3. Dopiero wtedy Haiku wysyła nowe zgłoszenie.
