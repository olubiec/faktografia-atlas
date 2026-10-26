# Faktografia Atlas – prompty do Gemini Deep Research (v2, 25.10.2026)

Jak używać: aplikacja Gemini → włącz **Deep Research** → wklej cały prompt (kontekst i wymagania są w środku). Jeden prompt = jeden raport. Wynik wraca do Claude (`TRYB: WERYFIKACJA`): wklej **treść raportu i linki do 3–5 kluczowych źródeł** (Claude otwiera tylko linki, które mu wkleisz).
Plan i uzasadnienie: `docs/research/plan-badan-v2.md`. Kolejność: **R1, R2, R3 teraz · R4, R5 przed S21.**

Wspólny kontekst (jest wklejony w każdym prompcie): Faktografia Atlas – publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS (Bank Danych Lokalnych, CC BY 4.0); Vite 8 + React 19 + TypeScript (strict), react-router 8, Tailwind v4 (tokeny w `@theme`), shadcn/ui na radix-ui, deck.gl 9 + MapLibre (react-map-gl), Observable Plot, MiniSearch, cmdk, react-modal-sheet; hosting Vercel; testy Vitest + Playwright; kod pisze agent AI (Jules), właściciel nie programuje; styl „Kalka i korekta”: jasny papierowy, kolory i rozmiary wyłącznie z tokenów, **bez cieni, zaokrągleń i rozmycia**, jedno ręczne czerwone zakreślenie na ekranie; dostępność (axe), `prefers-reduced-motion`, telefon ważniejszy niż komputer. Zasada projektu: gotowy pakiet lub usługa zamiast własnego kodu; cudzy kod nie jest kopiowany – wzorce z licencją MIT/BSD/ISC/Apache-2.0/CC0 wolno studiować i przepisać po swojemu.

---

## R1. Szablon stron, wspólny układ, strona główna, metadane i SEO
**Cel:** dostać gotowce lub wzorce na układ strony (nagłówek, stopka, podstrony), ładną stronę główną i poprawne metadane, żeby podmienić ręcznie składane strony.

```text
Zrób głęboki research (Deep Research).
Temat: gotowe szablony, bloki i wzorce dla (a) wspólnego układu strony z nagłówkiem i stopką oraz podstron treściowych (O projekcie, Źródła i metodologia, Prywatność, 404, ewentualnie FAQ i Kontakt), (b) strony głównej serwisu opartego na interaktywnej mapie z danymi, (c) metadanych i SEO dla aplikacji SPA.
Decyzja, którą ma wesprzeć: z jakiego gotowego szablonu/bloków/wzorców zbudować wspólny układ i stronę główną oraz jak wdrożyć tytuły podstron, opis, Open Graph, robots i sitemap.
Kontekst projektu: Faktografia Atlas – publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS (Bank Danych Lokalnych, CC BY 4.0); Vite 8 + React 19 + TypeScript (strict), react-router 8, Tailwind v4 (tokeny w `@theme`), shadcn/ui na radix-ui, deck.gl 9 + MapLibre (react-map-gl), Observable Plot, MiniSearch, cmdk, react-modal-sheet; hosting Vercel; testy Vitest + Playwright; kod pisze agent AI (Jules), właściciel nie programuje; styl „Kalka i korekta”: jasny papierowy, kolory i rozmiary wyłącznie z tokenów, **bez cieni, zaokrągleń i rozmycia**, jedno ręczne czerwone zakreślenie na ekranie; dostępność (axe), `prefers-reduced-motion`, telefon ważniejszy niż komputer. Zasada projektu: gotowy pakiet lub usługa zamiast własnego kodu; cudzy kod nie jest kopiowany – wzorce z licencją MIT/BSD/ISC/Apache-2.0/CC0 wolno studiować i przepisać po swojemu.. Stan obecny: trzy podstrony (O projekcie ok. 30 linii, Źródła, Prywatność) składają układ każda osobno, bez stopki; index.html ma tylko <title>; brak robots.txt, sitemap.xml, opisu i Open Graph; strona główna to od razu mapa z panelem wskaźnika (duży nagłówek i wprowadzenie z makiety zostały pominięte); w planie „Później”: podstrony gmin pod wyszukiwarki (SEO).
Zakres:
(1) 3–4 gotowe szablony lub zestawy bloków zgodne z React 19 + Tailwind v4 + radix/shadcn (np. kolekcje bloków shadcn, otwarte szablony landing/marketing/dokumentacji) – oceń, co z nich nadaje się do przerobienia na nasz styl bez cieni i zaokrągleń;
(2) 8–10 żywych przykładów stron głównych serwisów z danymi i mapami (atlasy, portale statystyczne, dziennikarstwo danych, polskie i zagraniczne): link, co widać na pierwszym ekranie, jak wchodzi się do mapy, co z tego da się przenieść; opisz 2–3 warianty strony głównej (np. mapa od razu z krótkim wstępem w panelu / wstęp + wyszukiwarka + przykładowe wskaźniki nad mapą / osobna strona wprowadzająca i mapa pod osobnym adresem) z plusami i minusami dla SEO, telefonu i szybkości (LCP);
(3) wzorce treści podstron: „O projekcie”, „Źródła i metodologia”, „Prywatność” po polsku (przykłady od instytucji lub otwartych projektów danych; nie porada prawna);
(4) metadane w aplikacji SPA na Vite z react-router 8 i React 19: tytuły i opisy podstron, Open Graph i obrazek podglądu, robots.txt, sitemap.xml, prerendering/SSG dla wybranych adresów – opcje, koszty, czy działa na Vercel; wpływ na udostępnianie linku (karty z S19).
Poza zakresem: płatne motywy, CMS, blog, wersja angielska.
Rodzaj: [A] gotowe szablony/bloki/pakiety, [B] wygląd i wzorce, [C] technologia.
Wymagania wobec wyniku:
- tabela szablonów/bloków: nazwa + link · licencja · ostatnie wydanie lub commit · zgodność z React 19 i Tailwind v4 · co wziąć · co przerobić · ryzyko,
- tabela przykładów stron głównych: link · co na pierwszym ekranie · wzorzec wejścia do mapy · licencja jest bez znaczenia (inspiracja wizualna, bez kopiowania),
- 2–3 warianty strony głównej z rekomendacją i uzasadnieniem,
- opcje metadanych i prerenderingu: opcja · trudność · koszt · działa z react-router 8 i Vercel · źródło w dokumentacji,
- każde twierdzenie z linkiem do źródła pierwotnego (dokumentacja, repozytorium, strona twórcy). Bez linku = „niezweryfikowane”,
- fakty oddziel od opinii, przy faktach data („stan na …”),
- nie wymyślaj nazw pakietów, bloków, funkcji, wersji ani liczb; sprawdź istnienie każdego pakietu w rejestrze,
- na końcu: rekomendacja, 3 największe ryzyka, lista rzeczy nieustalonych,
- po polsku, prosto; tabele + maks. 2 strony tekstu.
```

---

## R2. Gotowe rozwiązania dla animacji przejść (kamera, kafelki, „kreślenie”)
**Cel:** sprawdzić, czy własna kamera i kolejność kafelków mają lepsze gotowe odpowiedniki, i zebrać wzorce płynnego wejścia w głąb oraz sceny „kreślenie konturu”.

```text
Zrób głęboki research (Deep Research).
Temat: płynne przejścia w interaktywnej mapie choropleth (deck.gl 9 + MapLibre): wejście z kraju w województwo, powiat i gminę oraz powrót; sąsiednie jednostki pojawiają się po kolei, reszta kraju zostaje wyblakła; zmiana wskaźnika przelewa kolory; opcjonalna scena otwierająca, w której kontur Polski „rysuje się” tuszem.
Decyzja, którą ma wesprzeć: czy zostawić obecną własną implementację, czy zastąpić jej części wbudowanymi mechanizmami lub gotowymi wzorcami, i jak zrobić scenę „kreślenie”.
Kontekst projektu: Faktografia Atlas – publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS (Bank Danych Lokalnych, CC BY 4.0); Vite 8 + React 19 + TypeScript (strict), react-router 8, Tailwind v4 (tokeny w `@theme`), shadcn/ui na radix-ui, deck.gl 9 + MapLibre (react-map-gl), Observable Plot, MiniSearch, cmdk, react-modal-sheet; hosting Vercel; testy Vitest + Playwright; kod pisze agent AI (Jules), właściciel nie programuje; styl „Kalka i korekta”: jasny papierowy, kolory i rozmiary wyłącznie z tokenów, **bez cieni, zaokrągleń i rozmycia**, jedno ręczne czerwone zakreślenie na ekranie; dostępność (axe), `prefers-reduced-motion`, telefon ważniejszy niż komputer. Zasada projektu: gotowy pakiet lub usługa zamiast własnego kodu; cudzy kod nie jest kopiowany – wzorce z licencją MIT/BSD/ISC/Apache-2.0/CC0 wolno studiować i przepisać po swojemu.. Stan obecny: kamera to własna pętla requestAnimationFrame w jednym hooku (ok. 350 linii) z czasami z tokenów (wejście 600 ms, powrót 400 ms, bez animacji przy wejściu z linku, zmianie rozmiaru i prefers-reduced-motion; gest użytkownika przerywa ruch; dolny margines dla arkusza na telefonie); kolory zmieniają się przez mechanizm transitions warstw deck.gl; kafelki po kolei: obliczana kolejność + DataFilterExtension; ok. 2500 gmin i 380 powiatów w jednej warstwie; docelowo ma być płynnie na telefonie średniej klasy; mapę WebGL testujemy przez stan w window.__atlas, nie przez piksele.
Zakres:
(1) mechanizmy wbudowane: przejścia widoku w deck.gl (interpolatory, lot kamery, przerywanie przejścia), animacje kamery w MapLibre (easeTo, flyTo, fitBounds z paddingiem) i współpraca react-map-gl z deck.gl w trybie przeplatanym; transitions warstw; jakie mają ograniczenia (przerwanie gestem, margines, reduced motion, wydajność przy ok. 2500 wielokątów);
(2) wzorce „zoom do regionu z kontekstem”: otwarte przykłady i repozytoria (D3/Observable zoomable choropleth, deck.gl/MapLibre demo, mapy z dziennikarstwa danych): link · licencja · co robi · co można przenieść (idea lub struktura; kod przepisujemy);
(3) scena „kreślenie konturu”: 2–3 techniki (animacja ścieżki SVG/dasharray, warstwy ścieżek w deck.gl, canvas) z oceną wydajności na telefonie i zgodności z reduced motion; przykłady z linkami;
(4) jak mierzyć płynność w CI i na telefonie (liczba klatek, długie zadania) – gotowe narzędzia lub wzorce testów Playwright.
Poza zakresem: nowe silniki map, biblioteki animacji ogólnego przeznaczenia bez związku z mapą.
Rodzaj: [A] gotowe mechanizmy/pakiety, [B] wzorce, [C] technologia.
Wymagania wobec wyniku:
- tabela: mechanizm/wzorzec · gdzie opisany (link do dokumentacji lub repozytorium) · licencja · co zastępuje w naszym kodzie · zysk (mniej kodu, płynność) · ryzyko · czy nadal da się wyłączyć animacje i przerwać gestem,
- osobno lista repozytoriów i demo do przejrzenia: link · licencja · ostatnia aktywność · na co patrzeć,
- rekomendacja per element: kamera / kafelki / przelewanie kolorów / scena „kreślenie”: zostawić · zastąpić · uzupełnić, z uzasadnieniem,
- każde twierdzenie z linkiem do źródła pierwotnego. Bez linku = „niezweryfikowane”,
- fakty oddziel od opinii, przy faktach data,
- nie wymyślaj nazw funkcji, opcji, pakietów ani liczb; jeśli nie jesteś pewien, napisz to,
- na końcu: rekomendacja, 3 największe ryzyka, lista rzeczy nieustalonych,
- po polsku, prosto; tabela + maks. 2 strony tekstu.
```

---

## R3. Gotowe komponenty zamiast własnych (audyt zrobionego)
**Cel:** dla każdego dużego własnego elementu ocenić, czy istnieje lepszy gotowiec, i dostać listę „wymienić / zostawić”.

```text
Zrób głęboki research (Deep Research).
Temat: audyt własnego kodu pod kątem zastąpienia gotowymi, utrzymywanymi pakietami.
Decyzja, którą ma wesprzeć: które własne elementy zamienić na gotowce (po jednym na zadanie), a które zostawić.
Kontekst projektu: Faktografia Atlas – publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS (Bank Danych Lokalnych, CC BY 4.0); Vite 8 + React 19 + TypeScript (strict), react-router 8, Tailwind v4 (tokeny w `@theme`), shadcn/ui na radix-ui, deck.gl 9 + MapLibre (react-map-gl), Observable Plot, MiniSearch, cmdk, react-modal-sheet; hosting Vercel; testy Vitest + Playwright; kod pisze agent AI (Jules), właściciel nie programuje; styl „Kalka i korekta”: jasny papierowy, kolory i rozmiary wyłącznie z tokenów, **bez cieni, zaokrągleń i rozmycia**, jedno ręczne czerwone zakreślenie na ekranie; dostępność (axe), `prefers-reduced-motion`, telefon ważniejszy niż komputer. Zasada projektu: gotowy pakiet lub usługa zamiast własnego kodu; cudzy kod nie jest kopiowany – wzorce z licencją MIT/BSD/ISC/Apache-2.0/CC0 wolno studiować i przepisać po swojemu.. Własne elementy (ok. liczba linii): wykres trendu w profilu (TrendChart, 427; obok jest Observable Plot) · okno „Pobierz i udostępnij” z generowaniem obrazka PNG z SVG (ShareDialog 404 + render-png 148; wymóg: bez generatora serii slajdów, tylko pojedyncze karty w 4 formatach) · zapis CSV po polsku (csv.ts 203: BOM, średnik, przecinek dziesiętny) · słupki rankingu (RankingBars 171) · klasy kolorów i legenda mapy (classes.ts 93: przedziały, kwantyle) · stan w adresie ?u= ?i= ?y= ?l= ?c= (url/state.ts 137; wcześniej usunięto pakiet nuqs jako nieużywany) · indeks wyszukiwania (search/index.ts 226, MiniSearch) · ręczne zakreślenia (Annotate 165, rough-notation) · formatowanie liczb po polsku (format/number.ts 82) · okruszki (Breadcrumbs 90) · suwak roku (YearSlider 83, radix slider) · wybór wskaźnika z grupami (IndicatorPicker 299).
Zakres: dla każdego elementu 2–3 kandydatów (pakiety npm lub gotowe bloki), albo „zostaw własne, bo gotowiec nie istnieje / jest cięższy”. Kryteria: licencja, ostatnie wydanie, pobrania tygodniowo, rozmiar po spakowaniu, zgodność z React 19 i Tailwind v4, możliwość ostylowania bez cieni i zaokrągleń, dostępność, czy da się wymienić przez adapter w jednym pliku, czy istniejące testy zostają bez zmian.
Poza zakresem: wymiana silnika mapy, frameworka i testów.
Rodzaj: [A] gotowe pakiety.
Wymagania wobec wyniku:
- jedna tabela: element (nasz plik) · kandydat + link npm i repozytorium · licencja · ostatnie wydanie · pobrania/tydz. · rozmiar · zysk (mniej linii, mniej błędów) · ryzyko · werdykt WYMIEŃ / ZOSTAW / SPRAWDŹ,
- dla werdyktu WYMIEŃ: 2–3 zdania, jak to wymienić w jednym PR bez zmiany zachowania,
- każde twierdzenie z linkiem do źródła pierwotnego. Bez linku = „niezweryfikowane”,
- nie wymyślaj nazw pakietów, wersji, liczb pobrań ani rozmiarów; sprawdź istnienie każdego pakietu w rejestrze; jeśli nie możesz sprawdzić, napisz „niezweryfikowane”,
- na końcu: top 5 wymian o największym zysku, 3 największe ryzyka, lista rzeczy nieustalonych,
- po polsku, prosto; tabela + maks. 2 strony tekstu.
```

---

## R4. Nawigacja, kategorie, filtry i wyszukiwarka dla biblioteki GUS (przed S21)
**Cel:** gotowa struktura i komponenty dla strony z tysiącami wskaźników: kategorie, filtry, wyszukiwarka, „zamów wskaźnik”.

```text
Zrób głęboki research (Deep Research).
Temat: interfejs przeglądania, filtrowania i wyszukiwania dużego katalogu wskaźników statystycznych (tysiące pozycji w drzewie działów).
Decyzja, którą ma wesprzeć: jaką strukturę nawigacji, jakie gotowe komponenty i jaki mechanizm wyszukiwania przyjąć dla strony „Biblioteka wskaźników” (sesja S21).
Kontekst projektu: Faktografia Atlas – publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS (Bank Danych Lokalnych, CC BY 4.0); Vite 8 + React 19 + TypeScript (strict), react-router 8, Tailwind v4 (tokeny w `@theme`), shadcn/ui na radix-ui, deck.gl 9 + MapLibre (react-map-gl), Observable Plot, MiniSearch, cmdk, react-modal-sheet; hosting Vercel; testy Vitest + Playwright; kod pisze agent AI (Jules), właściciel nie programuje; styl „Kalka i korekta”: jasny papierowy, kolory i rozmiary wyłącznie z tokenów, **bez cieni, zaokrągleń i rozmycia**, jedno ręczne czerwone zakreślenie na ekranie; dostępność (axe), `prefers-reduced-motion`, telefon ważniejszy niż komputer. Zasada projektu: gotowy pakiet lub usługa zamiast własnego kodu; cudzy kod nie jest kopiowany – wzorce z licencją MIT/BSD/ISC/Apache-2.0/CC0 wolno studiować i przepisać po swojemu.. Stan obecny: 20 wskaźników z polem „group” w prostym wyborze z wyszukiwaniem (IndicatorPicker) i oknie szukania cmdk; robot pobiera z BDL katalog działów i zmiennych (poziom danych, lata, jednostka miary) do plików JSON; strona ma pobierać tylko mały indeks (id, nazwa, dział, poziom, lata), a wartości dopiero po wyborze wskaźnika; plan funkcji: kategorie (ok. 10–15 głównych działów jako kafelki, potem podkategorie), filtry (poziom: powiaty/gminy, zakres lat, jednostka miary, „popularne”), wyszukiwarka po nazwie z podpowiedziami, „zamów wskaźnik” (zgłoszenie przesuwa wskaźnik w kolejce pobierania robota); telefon jest priorytetem (arkusz dolny).
Zakres:
(1) wzorce UI dla katalogów danych: nawigacja po drzewie kategorii, filtry fasetowe, wyniki z kategorią i licznikami, puste wyniki, telefon (filtry w arkuszu dolnym); 6–8 żywych przykładów (portale otwartych danych, statystyczne, biblioteki wskaźników) z linkami i opisem, co działa dobrze;
(2) gotowe komponenty i pakiety zgodne z React 19, radix/shadcn i Tailwind v4: drzewo/akordeon kategorii, multi-select/combobox, wirtualizacja długich list, filtry fasetowe – 2–3 kandydatów na potrzebę, licencja, rozmiar, dostępność;
(3) wyszukiwanie po stronie przeglądarki dla kilku tysięcy do kilkudziesięciu tysięcy rekordów po polsku (diakrytyki, odmiana): czy obecny MiniSearch wystarczy (rozmiar indeksu, czas budowy, ładowanie leniwe, podział na paczki), jakie są alternatywy i kiedy warto przejść; wzorce podpowiedzi;
(4) „zamów wskaźnik”: sprawdzone wzorce zbierania próśb bez własnego serwera (np. formularz zakładający zgłoszenie w repozytorium, usługa formularzy) – koszty, prywatność (RODO, nie porada prawna), ochrona przed spamem.
Poza zakresem: własne API, logowanie użytkowników.
Rodzaj: [A] gotowe pakiety, [B] wzorce wyglądu i UX, [C] technologia.
Wymagania wobec wyniku:
- tabela przykładów: link · co robi dobrze · co przenieść · uwagi (inspiracja wizualna),
- tabela komponentów/pakietów: potrzeba · nazwa + link · licencja · ostatnie wydanie · rozmiar · zgodność z naszym stosem · ryzyko,
- porównanie wyszukiwarek: opcja · rozmiar i czas dla 5 tys. / 50 tys. rekordów (tylko z cytowanych źródeł, inaczej „niezweryfikowane”) · polskie znaki · ryzyko,
- zaproponowana struktura strony (ekrany: lista kategorii, kategoria z filtrami, wynik wyszukiwania, karta wskaźnika) w kilku zdaniach per ekran – komputer i telefon,
- każde twierdzenie z linkiem do źródła pierwotnego. Bez linku = „niezweryfikowane”,
- nie wymyślaj nazw pakietów, wersji, liczb ani funkcji,
- na końcu: rekomendacja, 3 największe ryzyka, lista rzeczy nieustalonych,
- po polsku, prosto; tabele + maks. 2 strony tekstu.
```

---

## R5. Magazyn danych biblioteki GUS (decyzja „R6” z `docs/research/biblioteka-gus.md`)
**Cel:** gdzie trzymać i skąd serwować dane, które nie zmieszczą się w repozytorium, i co z hostingiem.

```text
Zrób głęboki research (Deep Research).
Temat: przechowywanie i serwowanie rosnącego zbioru statycznych plików JSON (od kilkuset MB do kilkunastu GB) dla publicznej strony.
Decyzja, którą ma wesprzeć: gdzie trzymać dane biblioteki GUS (dziś osobna gałąź `data/library` w repozytorium GitHub, tymczasowo do ok. 1 GB) i jak je serwować stronie, oraz czy hosting Vercel Hobby wystarcza.
Kontekst projektu: Faktografia Atlas – publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS (Bank Danych Lokalnych, CC BY 4.0); Vite 8 + React 19 + TypeScript (strict), react-router 8, Tailwind v4 (tokeny w `@theme`), shadcn/ui na radix-ui, deck.gl 9 + MapLibre (react-map-gl), Observable Plot, MiniSearch, cmdk, react-modal-sheet; hosting Vercel; testy Vitest + Playwright; kod pisze agent AI (Jules), właściciel nie programuje; styl „Kalka i korekta”: jasny papierowy, kolory i rozmiary wyłącznie z tokenów, **bez cieni, zaokrągleń i rozmycia**, jedno ręczne czerwone zakreślenie na ekranie; dostępność (axe), `prefers-reduced-motion`, telefon ważniejszy niż komputer. Zasada projektu: gotowy pakiet lub usługa zamiast własnego kodu; cudzy kod nie jest kopiowany – wzorce z licencją MIT/BSD/ISC/Apache-2.0/CC0 wolno studiować i przepisać po swojemu.. Stan obecny: robot GitHub Actions co 12 godzin pobiera dane z API BDL do gałęzi `data/library` (katalog i pliki wartości po jednym na wskaźnik, ok. 0,3 MB na wskaźnik); strona czyta tylko pliki z `public/data` i nie woła API GUS; wartości pobiera na żądanie, po jednym pliku na wybrany wskaźnik; ruch początkowo mały, może urosnąć; Vercel Hobby jest wg dokumentacji tylko do użytku niekomercyjnego, a w przyszłości możliwa jest monetyzacja marki.
Zakres: (1) warianty: repozytorium/gałąź, zasoby wydań GitHub, GitHub Pages, magazyn obiektów (np. Cloudflare R2, Backblaze B2, AWS S3, Vercel Blob – sprawdź i wskaż, co faktycznie ma darmowy próg), CDN przed magazynem; (2) limity i koszty przy 10 tys. / 100 tys. / 1 mln odsłon miesięcznie: transfer, liczba zapytań, rozmiar pliku, rozmiar repozytorium; (3) bezpieczny wzorzec wysyłania plików z robota GitHub Actions do magazynu (uprawnienia, sekrety, ochrona gałęzi `main`); (4) warunki użycia komercyjnego Vercel Hobby vs Pro i tańsze alternatywy hostingu statycznego; (5) kompresja (gzip/brotli), buforowanie, CORS dla plików z innej domeny.
Poza zakresem: własny serwer, bazy SQL, logowanie.
Rodzaj: [C] technologia, [D] warunki i koszty.
Wymagania wobec wyniku:
- tabela opcji: opcja · limity · koszt przy 10 tys. / 100 tys. / 1 mln odsłon · trudność · odwracalność (jak przenieść dane gdzie indziej) · czy dozwolone przy monetyzacji,
- opis wzorca „robot → magazyn” z linkiem do dokumentacji (wymagane ustawienia, uprawnienia),
- warunki komercyjne Vercel Hobby i najtańszy plan, który je spełnia, z linkiem do regulaminu,
- każde twierdzenie z linkiem do oficjalnej dokumentacji lub cennika. Bez linku = „niezweryfikowane”,
- fakty oddziel od opinii, przy faktach data („stan na …”); ceny i limity zmieniają się – podaj datę odczytu,
- nie wymyślaj ustawień, nazw usług, cen ani limitów,
- na końcu: rekomendacja, 3 największe ryzyka, lista rzeczy nieustalonych,
- po polsku, prosto; tabela + maks. 2 strony tekstu.
```
