# Research dla Haiku – wąskie zlecenia (R2, R5, R7–R12)
Plan z 26.10.2026 (Claude). Research robi **Claude Haiku**, decyzję po `TRYB: WERYFIKACJA` (WORKFLOW §8.19) podejmuje Opus/Sonnet i Ty.
Zasada: **jedno pytanie = jedno zlecenie**. Haiku zbiera fakty z linkami, nie rekomenduje. Kolejka i terminy: `docs/ARCHITEKTURA.md` §4a.

## Ustalone już 26.10.2026 – NIE zlecać
Sprawdzone przez Claude na kodzie, prawdziwych danych albo w dokumentacji:
- Spis biblioteki: 51 050 zmiennych (poziom ≥ 5), 23 111 różnych nazw, 151 zmiennych nazywa się „ogółem”; `index.json` 6,1 MB, **417 KB po gzip** (dzielenie na pliki działów niepotrzebne).
- `nuqs` ma adapter react-router v8, ale wystarcza `useSearchParams` z react-router (już w projekcie).
- OpenFreeMap: MIT, bez klucza i limitów, wymagana atrybucja OpenMapTiles + OSM, użycie komercyjne dozwolone.
- deck.gl `FillStyleExtension` (w `@deck.gl/extensions`, już zainstalowany) robi wzór na wypełnieniu (atlas + mapowanie).
- pnpm 11: `minimumReleaseAge` domyślnie 1 dzień, `blockExoticSubdeps` true, `allowBuilds` zastępuje `onlyBuiltDependencies`, Node ≥ 22.
- Skrypty instalacyjne w naszych zależnościach: tylko `better-sqlite3` (przez `mapshaper` i `@ngageoint/geopackage`), `core-js` (przez `posthog-js`), `msgpackr-extract` – wszystkie dziś zablokowane i nic nie psują → `allowBuilds` może zostać puste.
- GitHub: etykiety z pliku formularza (`labels:`) dodają się automatycznie; parametr adresu `labels=` wymaga uprawnień do etykiet (zwykły odwiedzający ich nie ma).

## Nagłówek – wklej na początku KAŻDEGO zlecenia
```text
Jesteś researcherem. Odpowiadasz tylko na JEDNO pytanie poniżej. Nie rekomendujesz, nie oceniasz – zbierasz fakty.
Źródła w kolejności: oficjalna dokumentacja → repozytorium/README/changelog → zgłoszenia (issues) i fora. Pomijaj blogi „poradnikowe”, agregatory i strony SEO.
Przy KAŻDYM fakcie: link do strony, którą faktycznie otworzyłeś, i data „stan na …” (data strony albo wpisu).
Czego nie znalazłeś lub nie otworzyłeś – napisz „NIEZWERYFIKOWANE”. Nie zgaduj nazw, wersji, liczb ani ustawień.
Cytaty najwyżej 15 słów; resztę własnymi słowami.
Odpowiedź po polsku w formacie z sekcji „Format”. Na końcu: „Czego nie ustaliłem” (lista).
```

---

## R7 – Jak pokazać wskaźnik BDL, którego nazwa to same wymiary · **przed F10**
**Po co:** wiersz listy (W2.31), podpowiedzi wyszukiwarki (W2.29), nagłówek strony wskaźnika (W2.33). Decyzja: lista płaska „dział: nazwa” czy grupowanie wariantów jednego działu z wyborem wymiarów.
**Kontekst do wklejenia:** „W BDL nazwa zmiennej to wymiary, np. »ogółem – 13 i więcej miesięcy«; sens daje dopiero nazwa tematu (»Bezrobotni wg okresu poszukiwania pracy«).”

**R7.1** Jak strona bdl.stat.gov.pl pokazuje zmienną w wynikach wyszukiwania i przy wyborze danych: jakie elementy (temat, wymiary, jednostka, lata) i w jakiej kolejności?
Format: lista elementów w kolejności · link · data.

**R7.2** Jak Eurostat Data Browser (ec.europa.eu/eurostat/databrowser) pokazuje zbiór z wieloma wymiarami: osobny wybór każdego wymiaru czy lista wszystkich kombinacji? Jak wygląda tytuł wybranego wariantu?
Format: 3–5 punktów · link do przykładowego zbioru · data.

**R7.3** Jak Our World in Data pokazuje wynik wyszukiwania wskaźnika (tytuł, podtytuł, jednostka, źródło)? Jeden przykład z linkiem.
Format: pola wiersza wyniku · link · data.

**R7.4** Jakie pola zwraca API BDL `GET /api/v1/variables/{id}` i `GET /api/v1/subjects/{id}` (np. `n1`–`n5`, `measureUnitName`, `level`, `subjectId`, `years`)? Czy jest pole z pełną nazwą zmiennej?
Źródło: dokumentacja API BDL (api.stat.gov.pl, Swagger BDL). Format: tabela pole · typ · przykład · link.

---

## R8 – „Zamów ten wskaźnik” przez formularz zgłoszeń GitHuba · **przed F9**
**Po co:** W2.35 i poprawka W1.24 (`orderIssueUrl`): czy przejść na plik `.github/ISSUE_TEMPLATE/zamowienie-wskaznika.yml` z polami wypełnianymi przez link.

**R8.1** Czy w 2026 r. działa wypełnianie pól formularza zgłoszeń (issue forms, plik `.yml`) parametrem adresu o nazwie `id` pola, np. `/issues/new?template=x.yml&nazwa=wartość`?
Szukaj: docs.github.com, github.com/orgs/community/discussions, github.blog/changelog. Format: TAK / NIE / NIEPEWNE · najnowsze wpisy z datami i linkami · czy działa dla `input`, `textarea`, `dropdown`.

**R8.2** Czy etykiety z pola `labels:` formularza są dodawane, gdy zgłoszenie zakłada osoba BEZ uprawnień w repozytorium? Szukaj potwierdzenia lub zaprzeczenia (dokumentacja mówi „automatically added”).
Format: TAK / NIE / NIEPEWNE · linki · daty.

**R8.3** Czy GitHub podaje maksymalną długość adresu `/issues/new?...` (błąd 414)? Liczba i źródło albo „NIEZWERYFIKOWANE”.

---

## R9 – Definicje wskaźników z GUS do objaśnień · **przed W1.9**
**Po co:** W1.9 (plik `explanations.json`: `short`, `howToRead`, `definitionUrl`) – skąd brać definicje i czy wolno je cytować.

**R9.1** Czy GUS udostępnia „Pojęcia stosowane w statystyce publicznej” jako API albo plik do pobrania (JSON, CSV, XML)? Adres i format.
Format: TAK/NIE · adres · format · link · data.

**R9.2** Na jakiej licencji są teksty na stat.gov.pl (definicje, opisy metodologiczne)? Czy to samo co dane BDL (CC BY 4.0)? Link do strony o ponownym wykorzystaniu.
Format: licencja · wymagany podpis · link · data.

**R9.3** Czy API BDL ma metadane albo definicję zmiennej (np. pole lub endpoint z opisem metodologicznym)? Nazwa endpointu, przykład.
Format: TAK/NIE · endpoint · przykład odpowiedzi (skrót) · link.

**R9.4** Link do oficjalnej definicji GUS dla: gęstość zaludnienia · stopa bezrobocia rejestrowanego · przyrost naturalny na 1000 ludności · saldo migracji na 1000 ludności · lesistość. Do każdego jedno zdanie streszczenia własnymi słowami (nie cytat).
Format: tabela wskaźnik · link · streszczenie · data.

---

## R10 – Przejście na pnpm 11 · **nowe zadanie W0.2 (przed najbliższą zmianą `package.json`)**
**Po co:** WORKFLOW v5.4 §10.5a. Skrypty instalacyjne ustalone wyżej – nie zlecać.

**R10.1** Co dokładnie robi ustawienie pnpm `trustPolicy` (wartości, np. `no-downgrade`), od której wersji i czy działa w `pnpm-workspace.yaml`?
Źródło: pnpm.io/settings i strona ustawienia. Format: wartości · opis · wersja · link.

**R10.2** Czy `pnpm/action-setup@v4` instaluje pnpm 11 i czy bierze wersję z pola `packageManager` w `package.json`? Czy jest nowsze `v5`?
Źródło: README i wydania github.com/pnpm/action-setup. Format: TAK/NIE · wersja akcji · link.

**R10.3** Najnowsze stabilne wersje pnpm 11 i pnpm 12 (stan na dziś) i czy pnpm 12 zmienia `minimumReleaseAge`, `allowBuilds`, `trustPolicy` albo wymagania Node?
Źródło: pnpm.io/blog/releases, github.com/pnpm/pnpm/releases. Format: tabela wersja · data · zmiany w tych 4 punktach · link.

---

## R11 – Biblioteka na Cloudflare R2 (rozszerza R6) · **„Później”, przed przejściem z gałęzi `data/library`**
**Po co:** krok synchronizacji w workflow „Fetch library” i adres `VITE_LIBRARY_BASE`.

**R11.1** Czy `aws s3 sync … --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com` działa z R2 w AWS CLI v2 z lat 2025–2026? Czy są znane błędy z sumami kontrolnymi i obejście (np. zmienne `AWS_REQUEST_CHECKSUM_CALCULATION`, `AWS_RESPONSE_CHECKSUM_VALIDATION`)?
Źródła: developers.cloudflare.com/r2, github.com/aws/aws-cli/issues. Format: TAK/NIE · wersja CLI · obejście · linki · daty.

**R11.2** Czy publiczny kubełek R2 (domena `r2.dev` albo własna) pozwala ustawić CORS i czy oddaje pliki `.json` skompresowane (gzip/brotli)? Jak ustawić CORS?
Format: TAK/NIE dla każdego · przykład konfiguracji z dokumentacji · link.

**R11.3** Darmowy plan R2: GB miejsca, operacje klasy A i B na miesiąc, opłata za transfer – stan na dziś.
Format: tabela · link do cennika · data.

---

## R2 – Blady podkład mapy (OpenFreeMap) · **„Później”, po K7**
**Po co:** nowe zadanie W3 „podkład przy dużym zbliżeniu” i tryb ciemny mapy (R5). Licencja ustalona wyżej.

**R2.1** Dokładne adresy stylów OpenFreeMap (Positron, Dark i pozostałe) z instrukcji Quick Start.
Format: nazwa stylu · URL · link do instrukcji.

**R2.2** Czy etykiety w stylach OpenFreeMap mogą być po polsku (pole `name:pl` w danych OpenMapTiles) i jak w MapLibre GL JS zmienić język etykiet stylu?
Format: TAK/NIE · przykład wyrażenia/kodu z dokumentacji · linki.

**R2.3** Jak w MapLibre GL JS ukryć wybrane warstwy (etykiety, drogi) i zmniejszyć nasycenie albo przezroczystość podkładu? Przykłady z dokumentacji MapLibre (`setLayoutProperty`, `raster-saturation` itp.).
Format: 3 przykłady kodu (≤ 5 linii) · link do każdego.

---

## R5 – Kreskowanie „brak danych” i tryb ciemny mapy · **„Później”, po K7**
**Po co:** warstwa `choropleth.ts` – jednostki bez danych oznaczone wzorem zamiast koloru.

**R5.1** Czy `FillStyleExtension` w deck.gl 9.4 ma wzór proceduralny (bez obrazka-atlasu)? Nazwa opcji i od której wersji.
Źródło: deck.gl/docs i changelog/what's new deck.gl. Format: TAK/NIE · opcja · wersja · link.

**R5.2** Link do gotowego przykładu atlasu wzoru („hatch”) i pliku mapowania JSON w repozytorium deck.gl (katalog `examples` lub testy) oraz licencja repozytorium.
Format: link do pliku obrazka · link do mapowania · licencja.

**R5.3** Jak oznaczać „brak danych” na kartogramie: kreskowanie czy szary kolor? Zalecenia ze źródeł o kartografii lub wizualizacji danych (np. Datawrapper Academy, ColorBrewer, podręczniki).
Format: 3–5 punktów, każdy z linkiem i datą.

---

## R12 – Podział kolorów mapy: kwantyle czy „naturalne przerwy” · **opcjonalne, po K7**
**Po co:** ewentualna podmiana własnego `src/core/map/classes.ts` na pakiet `simple-statistics` (`ckmeans`).

**R12.1** Co zalecają źródła o kartografii (np. Datawrapper Academy, podręczniki) dla danych o bardzo skośnym rozkładzie, jak gęstość zaludnienia: kwantyle, naturalne przerwy (Jenks / ckmeans), skala logarytmiczna?
Format: metoda · kiedy zalecana · link · data.

**R12.2** Pakiet npm `simple-statistics`: najnowsza wersja i jej data, licencja, czy funkcja `ckmeans(data, n)` zwraca grupy, z których da się wyznaczyć progi? Przykład z dokumentacji.
Źródło: npmjs.com, simple-statistics.github.io, GitHub. Format: wersja · data · licencja · przykład kodu · linki.

---

## Co dalej z odpowiedziami
1. Odpowiedzi Haiku wklejasz do czatu Claude z pierwszą linią `TRYB: WERYFIKACJA` i numerami pytań (np. „R8.1–R8.3”). Opus/Sonnet otwiera kluczowe linki.
2. Wynik: 1 linia w „Decyzjach” w `docs/STAN.md`. Jeśli zmienia zadanie albo dodaje nowe, Planista poprawia `docs/ARCHITEKTURA.md` §3–§4. Element z zewnątrz trafia do `docs/ELEMENTY.md`.
3. Odpowiedzi Haiku nie idą bez weryfikacji do Julesa ani do `ELEMENTY.md` (WORKFLOW §14).
