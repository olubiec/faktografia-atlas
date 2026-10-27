# Research – prompty do wklejenia (runda 3, 27.10.2026)
Cztery grupy zleceń, **niezależne od siebie – wszystkie można puścić naraz** (cztery równoległe sesje). Każda grupa jest gotowym tekstem do wklejenia (nagłówek + kontekst + zlecenia); żadnych linków do naszego repozytorium. Wynik każdej sesji: jeden plik markdown (nazwa w treści grupy); wracają do Claude'a, który robi `TRYB: WERYFIKACJA` i zapisuje je w `docs/research/haiku/`.
Zalecenia: grupa A (wąskie pytania) – Haiku albo Sonnet; grupy B–D (szukanie i porównywanie) – Sonnet. Pytania z grupy A (R2.4, R5.4, R11.4) dotyczą spraw na później (K7, konto Cloudflare), ale sama dokumentacja nie zależy od niczego – można sprawdzić od razu; R9.5 jest potrzebne przed W1.9.

---

# GRUPA A – Runda 2 – cztery wąskie zlecenia (można dać Haiku albo Sonnetowi)
Nazwa pliku z wynikiem: `runda-2.md`

```text
Jesteś researcherem. Odpowiadasz tylko na pytania poniżej – każde osobno. Nie rekomendujesz, nie oceniasz, nie wybierasz „najlepszego” – zbierasz fakty.
Źródła w kolejności: oficjalna dokumentacja i specyfikacje → repozytorium (README, changelog, licencja, zgłoszenia/issues) → strony właścicieli serwisów. Pomijaj blogi „poradnikowe”, agregatory, rankingi „top 10” i strony SEO.
Przy KAŻDYM fakcie: link do strony, którą faktycznie otworzyłeś, i data „stan na …” (data strony, wydania albo ostatniego commita).
Czego nie znalazłeś lub nie otworzyłeś – napisz „NIEZWERYFIKOWANE”. Nie zgaduj nazw, wersji, licencji, rozmiarów ani liczb. Licencję podawaj tylko po otwarciu pliku licencji lub strony pakietu.
Cytaty najwyżej 15 słów; resztę własnymi słowami.
Odpowiedź po polsku, w jednym pliku markdown o nazwie podanej w grupie. Na końcu każdego zlecenia: „Czego nie ustaliłem” (lista).

KONTEKST PROJEKTU (do wiadomości; nie trzeba go szukać w internecie):
Budujemy polski atlas statystyczny: mapa Polski z kolorami (choropleth) pokazująca dane GUS z Banku Danych Lokalnych (licencja CC BY 4.0). 20 wskaźników na trzech poziomach: 16 województw, ok. 380 powiatów, ok. 2 500 gmin. Dalej: wejście w głąb mapy (kliknięcie województwa pokazuje powiaty, potem gminy), profil miejsca (na komputerze panel po prawej 400–440 px, na telefonie dolny arkusz z punktami zatrzymania 40% i 90% wysokości), porównanie dwóch miejsc, karta do udostępnienia (obraz) i plik CSV, osobna strona „Biblioteka” z ok. 64 tys. zmiennych GUS (wyszukiwarka, kategorie, filtry, ranking). Styl wizualny: „odręczny” – papier, tusz, zakreślenia owalem rysowane ręcznie (w stylu rough.js).
Stos: React 19, Vite, Tailwind CSS 4, MapLibre GL z nakładką deck.gl, komponenty Radix, react-modal-sheet (dolny arkusz), react-router, ikony Iconoir. Hosting statyczny, bez serwera. Interfejs po polsku.
Ograniczenia, według których oceniasz przydatność znalezisk (podawaj fakty, nie wnioski): licencja pozwalająca na użycie komercyjne i otwarte (MIT, Apache-2.0, BSD, ISC, CC0; CC BY akceptowalna z atrybucją; GPL/AGPL/„źródło dostępne”/płatne – oznacz wyraźnie); dodatek do paczki JavaScript do ok. 30 kB po gzip; działanie na średniej klasy telefonie z Androidem i na iPhonie; dostępność WCAG 2.2 AA; obsługa `prefers-reduced-motion`; dotyk ≥ 44 px.

Nazwa pliku z odpowiedzią: runda-2.md
## R9.5 – Hasła słownika GUS dla pozostałych wskaźników
**Po co:** każdy wskaźnik na stronie dostanie objaśnienie „co to znaczy” oparte na oficjalnej definicji. Mamy już pięć haseł (przyrost naturalny – hasło 3956, gęstość zaludnienia – 3915, stopa bezrobocia rejestrowanego – 2390, saldo migracji – 2259, lesistość – 1706). Zostało 15 wskaźników.
**R9.5** Dla każdego wskaźnika z listy znajdź w słowniku pojęć GUS (stat.gov.pl/metainformacje/slownik-pojec) hasło o tym samym znaczeniu: numer hasła, tytuł, kto jest autorem tekstu definicji (jednostka GUS), link. Brak hasła o tym samym znaczeniu → „BRAK” (nie dobieraj hasła podobnego).
Lista (id · nazwa · jednostka): population · Ludność ogółem · osoba · share-65plus · Udział ludności 65+ · % · median-age · Mediana wieku · lata · unemployed-share-working-age · Udział bezrobotnych w ludności w wieku produkcyjnym · % · avg-wage · Przeciętne wynagrodzenie brutto · zł · income-per-capita · Dochody budżetu gminy na mieszkańca · zł · spending-per-capita · Wydatki budżetu gminy na mieszkańca · zł · regon-per-10k · Podmioty REGON na 10 tys. ludności · na 10 tys. · dwellings-per-1000 · Mieszkania oddane do użytku na 1000 ludności · na 1000 · dwelling-area-per-person · Przeciętna powierzchnia użytkowa mieszkania na osobę · m² · sewerage-share · Ludność korzystająca z kanalizacji · % · preschool-3-6 · Wychowanie przedszkolne, dzieci 3–6 lat · % · library-readers-per-1000 · Czytelnicy bibliotek publicznych na 1000 ludności · na 1000 · tourist-nights-per-1000 · Noclegi udzielone turystom na 1000 ludności · na 1000 · cars-per-1000 · Samochody osobowe na 1000 ludności · na 1000.
Format: tabela: id wskaźnika · numer hasła · tytuł hasła · autor/źródło tekstu · link · data. Pod tabelą: które wskaźniki mają hasło tylko dla pojęcia ogólniejszego lub węższego (opisz różnicę jednym zdaniem).

## R2.4 – Czy nazwy po polsku są naprawdę w kafelkach mapy
**Po co:** chcemy pokazywać nazwy miejscowości po polsku na podkładzie mapy z kafelków wektorowych OpenFreeMap (schemat OpenMapTiles). W opisie kafelków jest pole `name:pl`, ale nie wiadomo, czy mają je obiekty w Polsce.
**R2.4** Czy dokumentacja OpenMapTiles / OpenFreeMap opisuje, kiedy atrybut `name:pl` jest wypełniany (skąd się bierze z OpenStreetMap, czy zawsze, czy tylko gdy jest tag `name:pl`)? Podaj jeden przykład z linkiem dla dużego miasta w Polsce.
Format: 3–5 punktów · linki · daty.

## R5.4 – Tryb ciemny mapy w MapLibre
**Po co:** ciemny podkład bez dokładania osobnych kafelków.
**R5.4** Czy OpenFreeMap udostępnia ciemny styl (np. `dark`) na tych samych kafelkach co jasny styl Positron, i jaka jest oficjalna lista stylów? Czy dokumentacja MapLibre GL JS opisuje zmianę kolorów warstw w czasie działania (`setPaintProperty`) jako wspierany sposób?
Format: lista stylów z linkami · 2–3 punkty o `setPaintProperty` · daty.

## R11.4 – CORS i kompresja na własnej domenie Cloudflare R2
**Po co:** zamierzamy trzymać duże pliki danych w zasobniku R2 podpiętym do własnej domeny; konta jeszcze nie ma, więc sprawdzamy dokumentację.
**R11.4** Jak w dokumentacji Cloudflare R2 ustawia się CORS dla zasobnika podpiętego do własnej domeny i czy odpowiedzi JSON z własnej domeny są kompresowane (gzip/brotli) automatycznie? Czy `aws s3 sync` do R2 wymaga obejścia sum kontrolnych (opcje `request_checksum_calculation`)?
Format: 3–6 punktów · linki · daty · „NIEZWERYFIKOWANE” tam, gdzie dokumentacja milczy.
```

---

# GRUPA B – Gotowa formatka strony dla telefonu (układ mapa + arkusz + lista z filtrami) – dać Sonnetowi
Nazwa pliku z wynikiem: `szablon-mobile.md`

```text
Jesteś researcherem. Odpowiadasz tylko na pytania poniżej – każde osobno. Nie rekomendujesz, nie oceniasz, nie wybierasz „najlepszego” – zbierasz fakty.
Źródła w kolejności: oficjalna dokumentacja i specyfikacje → repozytorium (README, changelog, licencja, zgłoszenia/issues) → strony właścicieli serwisów. Pomijaj blogi „poradnikowe”, agregatory, rankingi „top 10” i strony SEO.
Przy KAŻDYM fakcie: link do strony, którą faktycznie otworzyłeś, i data „stan na …” (data strony, wydania albo ostatniego commita).
Czego nie znalazłeś lub nie otworzyłeś – napisz „NIEZWERYFIKOWANE”. Nie zgaduj nazw, wersji, licencji, rozmiarów ani liczb. Licencję podawaj tylko po otwarciu pliku licencji lub strony pakietu.
Cytaty najwyżej 15 słów; resztę własnymi słowami.
Odpowiedź po polsku, w jednym pliku markdown o nazwie podanej w grupie. Na końcu każdego zlecenia: „Czego nie ustaliłem” (lista).

KONTEKST PROJEKTU (do wiadomości; nie trzeba go szukać w internecie):
Budujemy polski atlas statystyczny: mapa Polski z kolorami (choropleth) pokazująca dane GUS z Banku Danych Lokalnych (licencja CC BY 4.0). 20 wskaźników na trzech poziomach: 16 województw, ok. 380 powiatów, ok. 2 500 gmin. Dalej: wejście w głąb mapy (kliknięcie województwa pokazuje powiaty, potem gminy), profil miejsca (na komputerze panel po prawej 400–440 px, na telefonie dolny arkusz z punktami zatrzymania 40% i 90% wysokości), porównanie dwóch miejsc, karta do udostępnienia (obraz) i plik CSV, osobna strona „Biblioteka” z ok. 64 tys. zmiennych GUS (wyszukiwarka, kategorie, filtry, ranking). Styl wizualny: „odręczny” – papier, tusz, zakreślenia owalem rysowane ręcznie (w stylu rough.js).
Stos: React 19, Vite, Tailwind CSS 4, MapLibre GL z nakładką deck.gl, komponenty Radix, react-modal-sheet (dolny arkusz), react-router, ikony Iconoir. Hosting statyczny, bez serwera. Interfejs po polsku.
Ograniczenia, według których oceniasz przydatność znalezisk (podawaj fakty, nie wnioski): licencja pozwalająca na użycie komercyjne i otwarte (MIT, Apache-2.0, BSD, ISC, CC0; CC BY akceptowalna z atrybucją; GPL/AGPL/„źródło dostępne”/płatne – oznacz wyraźnie); dodatek do paczki JavaScript do ok. 30 kB po gzip; działanie na średniej klasy telefonie z Androidem i na iPhonie; dostępność WCAG 2.2 AA; obsługa `prefers-reduced-motion`; dotyk ≥ 44 px.

Nazwa pliku z odpowiedzią: szablon-mobile.md
## Dlaczego to zlecenie
Nasz układ na telefonie jest słaby: dolny arkusz z profilem miejsca otwiera się na 40% wysokości, a jego przewijana zawartość sięga poza dolną krawędź ekranu (przycisk w środku leży poniżej widocznego okna, a dotyk trafia w mapę pod spodem); baner zgody na analitykę zajmuje dół ekranu i nakłada się na arkusz; przeciąganie arkusza konfliktuje z przesuwaniem mapy. Szukamy gotowych, sprawdzonych elementów albo całych szablonów, które można podmienić zamiast pisać od zera.

## R13.1 – Gotowe szablony / zestawy startowe układu „pełnoekranowa mapa + wyszukiwarka u góry + dolny arkusz”
Znajdź 6–10 otwartych projektów (szablony, zestawy startowe, otwarty kod serwisów z mapą danych), które dają gotowy układ mobilny: pełnoekranowa mapa, pole wyszukiwania na górze, dolny arkusz z kilkoma punktami zatrzymania, zakładki w arkuszu, obsługa bezpiecznych marginesów (notch, pasek gestów) i klawiatury ekranowej. Szukaj m.in. w GitHubie (tematy: bottom-sheet, maplibre, mobile-first dashboard, choropleth, data portal) oraz w otwartym kodzie portali statystycznych i rządowych atlasów danych; przykłady podane tylko jako punkt wyjścia, nie ograniczaj się do nich.
Dla każdego: nazwa · link · licencja (po otwarciu pliku LICENSE) · data ostatniego wydania/commita · stos (React? Tailwind? MapLibre/Mapbox/Leaflet?) · jakie elementy układu zawiera (lista) · czy jest demo na żywo (link) · 3 najnowsze otwarte zgłoszenia dotyczące telefonów (iOS Safari, Chrome Android) z linkami · ile pracy wymaga użycie w projekcie React 19 + Tailwind 4 + MapLibre (tylko fakty: zależności, wymagane wersje).
Format: tabela + krótka lista „elementy układu, które każdy z projektów rozwiązał” (np. zachowanie przewijania w arkuszu, punkty zatrzymania, safe-area).

## R13.2 – Oficjalne wytyczne: dolne arkusze (bottom sheets) przy interaktywnej mapie
Co mówią Material Design 3, Apple Human Interface Guidelines (sheets) i dokumentacja Android o: (a) arkuszu modalnym vs standardowym (niemodalnym), gdy mapa pod spodem ma pozostać interaktywna; (b) liczbie i wysokości punktów zatrzymania; (c) przekazywaniu przewijania z arkusza do zawartości (kiedy przewija się arkusz, a kiedy zawartość); (d) uchwycie: wymagany rozmiar dotyku, alternatywa klawiaturowa i dla czytników ekranu; (e) zachowaniu przy klawiaturze ekranowej.
Format: po 3–6 punktów na źródło · link do konkretnej strony wytycznych · data.

## R13.3 – Pułapki przeglądarek mobilnych przy układzie pełnoekranowym
Zbierz z MDN, web.dev, blogu WebKit i bloga Chrome for Developers: (a) jednostki `dvh`/`svh`/`lvh` – wsparcie i znane różnice w iOS Safari i Chrome Android przy chowaniu paska adresu; (b) `visualViewport` i klawiatura ekranowa, meta viewport `interactive-widget`; (c) `env(safe-area-inset-*)` i `viewport-fit=cover`; (d) `overscroll-behavior` i `touch-action` przy przewijanej zawartości nad mapą przechwytującą gesty; (e) pozycjonowanie `fixed` w iOS Safari przy przewijaniu.
Format: tabela: zagadnienie · stan wsparcia (z linkiem do caniuse lub MDN) · znana pułapka (jedno zdanie) · link do źródła · data.

## R13.4 – Biblioteki dolnego arkusza: stan faktyczny
Porównaj faktami (bez wskazywania wyboru) biblioteki dolnego arkusza dla Reacta, w tym obecnie używaną react-modal-sheet oraz co najmniej 4 inne znalezione samodzielnie. Dla każdej: link · licencja · ostatnie wydanie · zgodność z React 19 (zapis w package.json/peerDependencies) · rozmiar po gzip (strona pakietu lub bundlephobia – podaj, skąd liczba) · punkty zatrzymania (tak/nie) · tryb niemodalny z interaktywnym tłem (tak/nie, link do dokumentacji) · zachowanie przewijania zawartości przy punktach zatrzymania (opis z dokumentacji) · liczba otwartych zgłoszeń z słowami „scroll”, „drag”, „iOS” i 2 przykładowe z linkami.
Format: tabela.

## R13.5 – Wzorce strony „wyszukiwarka + kategorie + filtry + lista” na telefonie
Nasza strona Biblioteka ma: pole wyszukiwania, kafelki kategorii z okruszkami, filtry (poziom, jednostka, „tylko pobrane”), listę wyników po 50 z przyciskiem „Pokaż więcej”. Zbierz oficjalne wzorce z GOV.UK Design System, USWDS, Material Design 3 i Apple HIG: filtry na telefonie (szuflada vs. rozwijana sekcja vs. chipy), lepki pasek wyszukiwania, licznik wyników, „Pokaż więcej” vs. nieskończone przewijanie vs. numeracja stron, stan „brak wyników”, ogłaszanie zmiany wyników czytnikowi ekranu (aria-live).
Format: tabela: wzorzec · źródło (link) · zalecenie źródła (jedno zdanie, własnymi słowami) · data.
```

---

# GRUPA C – Gotowe animacje i zasady ruchu – dać Sonnetowi
Nazwa pliku z wynikiem: `animacje.md`

```text
Jesteś researcherem. Odpowiadasz tylko na pytania poniżej – każde osobno. Nie rekomendujesz, nie oceniasz, nie wybierasz „najlepszego” – zbierasz fakty.
Źródła w kolejności: oficjalna dokumentacja i specyfikacje → repozytorium (README, changelog, licencja, zgłoszenia/issues) → strony właścicieli serwisów. Pomijaj blogi „poradnikowe”, agregatory, rankingi „top 10” i strony SEO.
Przy KAŻDYM fakcie: link do strony, którą faktycznie otworzyłeś, i data „stan na …” (data strony, wydania albo ostatniego commita).
Czego nie znalazłeś lub nie otworzyłeś – napisz „NIEZWERYFIKOWANE”. Nie zgaduj nazw, wersji, licencji, rozmiarów ani liczb. Licencję podawaj tylko po otwarciu pliku licencji lub strony pakietu.
Cytaty najwyżej 15 słów; resztę własnymi słowami.
Odpowiedź po polsku, w jednym pliku markdown o nazwie podanej w grupie. Na końcu każdego zlecenia: „Czego nie ustaliłem” (lista).

KONTEKST PROJEKTU (do wiadomości; nie trzeba go szukać w internecie):
Budujemy polski atlas statystyczny: mapa Polski z kolorami (choropleth) pokazująca dane GUS z Banku Danych Lokalnych (licencja CC BY 4.0). 20 wskaźników na trzech poziomach: 16 województw, ok. 380 powiatów, ok. 2 500 gmin. Dalej: wejście w głąb mapy (kliknięcie województwa pokazuje powiaty, potem gminy), profil miejsca (na komputerze panel po prawej 400–440 px, na telefonie dolny arkusz z punktami zatrzymania 40% i 90% wysokości), porównanie dwóch miejsc, karta do udostępnienia (obraz) i plik CSV, osobna strona „Biblioteka” z ok. 64 tys. zmiennych GUS (wyszukiwarka, kategorie, filtry, ranking). Styl wizualny: „odręczny” – papier, tusz, zakreślenia owalem rysowane ręcznie (w stylu rough.js).
Stos: React 19, Vite, Tailwind CSS 4, MapLibre GL z nakładką deck.gl, komponenty Radix, react-modal-sheet (dolny arkusz), react-router, ikony Iconoir. Hosting statyczny, bez serwera. Interfejs po polsku.
Ograniczenia, według których oceniasz przydatność znalezisk (podawaj fakty, nie wnioski): licencja pozwalająca na użycie komercyjne i otwarte (MIT, Apache-2.0, BSD, ISC, CC0; CC BY akceptowalna z atrybucją; GPL/AGPL/„źródło dostępne”/płatne – oznacz wyraźnie); dodatek do paczki JavaScript do ok. 30 kB po gzip; działanie na średniej klasy telefonie z Androidem i na iPhonie; dostępność WCAG 2.2 AA; obsługa `prefers-reduced-motion`; dotyk ≥ 44 px.

Nazwa pliku z odpowiedzią: animacje.md
## Dlaczego to zlecenie
Dziś mamy: scenę otwarcia (kontur Polski rysowany „tuszem” 1,2 s techniką `stroke-dashoffset`, potem regiony wypełniają się kolorem 300 ms), przelewanie kolorów mapy przy zmianie wskaźnika lub roku (300 ms), wysuwanie arkusza (300 ms), wejście w głąb mapy (kamera 600 ms, potem jednostki wypełniają się kafelek po kafelku od środka). Krzywa `cubic-bezier(0.2, 0, 0, 1)`. Ruch wygląda słabo i „technicznie”. Szukamy gotowych, sprawdzonych rozwiązań i zasad, nie opinii.

## R14.1 – Co oficjalnie potrafią mapa i warstwa deck.gl w zakresie animacji
(a) deck.gl 9: przejścia wartości (`transitions`) dla `getFillColor`, `getElevation` i innych atrybutów warstw – składnia z dokumentacji, parametry (czas, funkcja easing, `enter`), znane ograniczenia przy dużej liczbie wielokątów (ok. 2 500); (b) MapLibre GL JS: `flyTo`, `easeTo`, `fitBounds` – opcje (`duration`, `easing`, `curve`, `essential`) i zachowanie przy `prefers-reduced-motion`; (c) czy któraś z tych dokumentacji opisuje animację „wypełnianie kolejnych jednostek z opóźnieniem” (stagger) i jak ją zrobić oficjalnie; (d) nakładka SVG nad mapą a wydajność na telefonie (zalecenia dokumentacji).
Format: po 3–6 punktów na pozycję · linki do konkretnych stron dokumentacji · data.

## R14.2 – Gotowe biblioteki i zasoby animacji: stan faktyczny
Zbierz fakty o co najmniej 8 rozwiązaniach (przykłady do sprawdzenia, nie ograniczaj się do nich): Motion (dawniej Framer Motion), GSAP, anime.js, Lottie / dotLottie, Rive, rough-notation (animowane zakreślenia), Vivus albo podobne do „rysowania” ścieżek SVG, CSS View Transitions API, auto-animate. Dla każdego: link · licencja (po otwarciu pliku LICENSE; GSAP i Rive – zapisz dokładne warunki użycia komercyjnego) · ostatnie wydanie · rozmiar po gzip (z podaniem źródła liczby) · zgodność z React 19 · wsparcie `prefers-reduced-motion` (zapis w dokumentacji) · czy pozwala na animację ścieżek SVG / liczników / przejść między widokami (tak/nie z linkiem).
Osobno: serwisy z gotowymi animacjami do pobrania (np. LottieFiles, repozytoria społeczności Rive): jakie licencje mają darmowe zasoby – podaj dosłowną nazwę licencji i link do jej tekstu; czy wolno użyć komercyjnie bez atrybucji.
Format: tabela + osobna lista zasobów z licencjami.

## R14.3 – Zasady ruchu i ładowania (oficjalne)
(a) Material Design 3 (motion): tokeny czasu trwania i krzywych easing; co dokument mówi o czasach dla przejść małych i dużych elementów; (b) Apple HIG (motion): zasady, kiedy ruch jest zalecany; (c) web.dev / Chrome for Developers: animacje a wydajność (właściwości animowane na kompozytorze, `will-change`, budżet klatek) i wpływ animacji wejścia na LCP/CLS/INP; (d) wytyczne dla stanów ładowania (szkielety vs. wskaźnik postępu vs. stopniowe odsłanianie) – Nielsen Norman Group i web.dev (tylko strony otwarte bez konta); (e) WCAG 2.2 – kryteria dotyczące ruchu (2.2.2, 2.3.3) i zalecenie dotyczące przycisku „pomiń animację”.
Format: tabela: źródło · konkretna liczba lub zasada (własnymi słowami) · link · data.
```

---

# GRUPA D – Czego jeszcze brakuje w porównaniu z innymi atlasami (audyt elementów) – dać Sonnetowi
Nazwa pliku z wynikiem: `brakujace-elementy.md`

```text
Jesteś researcherem. Odpowiadasz tylko na pytania poniżej – każde osobno. Nie rekomendujesz, nie oceniasz, nie wybierasz „najlepszego” – zbierasz fakty.
Źródła w kolejności: oficjalna dokumentacja i specyfikacje → repozytorium (README, changelog, licencja, zgłoszenia/issues) → strony właścicieli serwisów. Pomijaj blogi „poradnikowe”, agregatory, rankingi „top 10” i strony SEO.
Przy KAŻDYM fakcie: link do strony, którą faktycznie otworzyłeś, i data „stan na …” (data strony, wydania albo ostatniego commita).
Czego nie znalazłeś lub nie otworzyłeś – napisz „NIEZWERYFIKOWANE”. Nie zgaduj nazw, wersji, licencji, rozmiarów ani liczb. Licencję podawaj tylko po otwarciu pliku licencji lub strony pakietu.
Cytaty najwyżej 15 słów; resztę własnymi słowami.
Odpowiedź po polsku, w jednym pliku markdown o nazwie podanej w grupie. Na końcu każdego zlecenia: „Czego nie ustaliłem” (lista).

KONTEKST PROJEKTU (do wiadomości; nie trzeba go szukać w internecie):
Budujemy polski atlas statystyczny: mapa Polski z kolorami (choropleth) pokazująca dane GUS z Banku Danych Lokalnych (licencja CC BY 4.0). 20 wskaźników na trzech poziomach: 16 województw, ok. 380 powiatów, ok. 2 500 gmin. Dalej: wejście w głąb mapy (kliknięcie województwa pokazuje powiaty, potem gminy), profil miejsca (na komputerze panel po prawej 400–440 px, na telefonie dolny arkusz z punktami zatrzymania 40% i 90% wysokości), porównanie dwóch miejsc, karta do udostępnienia (obraz) i plik CSV, osobna strona „Biblioteka” z ok. 64 tys. zmiennych GUS (wyszukiwarka, kategorie, filtry, ranking). Styl wizualny: „odręczny” – papier, tusz, zakreślenia owalem rysowane ręcznie (w stylu rough.js).
Stos: React 19, Vite, Tailwind CSS 4, MapLibre GL z nakładką deck.gl, komponenty Radix, react-modal-sheet (dolny arkusz), react-router, ikony Iconoir. Hosting statyczny, bez serwera. Interfejs po polsku.
Ograniczenia, według których oceniasz przydatność znalezisk (podawaj fakty, nie wnioski): licencja pozwalająca na użycie komercyjne i otwarte (MIT, Apache-2.0, BSD, ISC, CC0; CC BY akceptowalna z atrybucją; GPL/AGPL/„źródło dostępne”/płatne – oznacz wyraźnie); dodatek do paczki JavaScript do ok. 30 kB po gzip; działanie na średniej klasy telefonie z Androidem i na iPhonie; dostępność WCAG 2.2 AA; obsługa `prefers-reduced-motion`; dotyk ≥ 44 px.

Nazwa pliku z odpowiedzią: brakujace-elementy.md
## R15.1 – Audyt elementów w publicznych atlasach i portalach statystycznych
Wybierz 8–10 publicznych serwisów z mapami danych statystycznych (przykłady do sprawdzenia, nie ograniczaj się do nich: Regionalatlas Destatis, Eurostat – Regional Yearbook i Data Browser, Census Reporter, ONS – profile obszarów, CBS Statline / Kaart (Holandia), INSEE – statystyki lokalne, Our World in Data – mapy, Statistics Canada – Focus on Geography, polska Geostatystyka GUS). Dla każdego sprawdź na żywo (otwórz stronę) obecność elementów z listy kontrolnej: wyszukiwarka miejsc z podpowiedziami · legenda interaktywna (kliknięcie klasy podświetla jednostki) · histogram/rozkład w legendzie · ranking „najwyższe / najniższe” · suwak lat lub odtwarzanie w czasie · wiele map obok siebie (small multiples) · porównanie dwóch lub więcej miejsc · „podobne miejsca” lub „sąsiedzi” · adres URL zachowujący stan widoku · kod osadzania (iframe) · eksport PNG/SVG/CSV/PDF · arkusz stylów do druku · przełącznik języka · API danych · deklaracja dostępności · alternatywa tabelaryczna dla mapy · wprowadzenie / wycieczka po stronie przy pierwszej wizycie · gotowe „historie” lub przykłady · objaśnienie wskaźnika w miejscu użycia · data aktualizacji danych · przycisk „zgłoś błąd” · obsługa trybu ciemnego · instalacja jako aplikacja (PWA).
Format: tabela: serwis (link) × element: „jest” / „brak” / „NIEZWERYFIKOWANE”, przy „jest” link do strony lub zrzutu pokazującego element. Pod tabelą: lista elementów, które ma co najmniej połowa serwisów (tylko liczby, bez rekomendacji).

## R15.2 – Dostępność map koropletowych (oficjalne źródła)
Zbierz z W3C WAI, WCAG 2.2, GOV.UK Design System, USWDS (data visualization) i frameworku Chartability: wymagania i zalecenia dla map kolorowanych wartością: kryteria WCAG istotne dla mapy (1.4.1 użycie koloru, 1.4.11 kontrast elementów graficznych, 2.1.1 klawiatura, 2.5.7 gesty przeciągania, 2.5.8 rozmiar celu), alternatywa tabelaryczna, opis tekstowy, paleta bezpieczna dla daltonistów (źródło: ColorBrewer – licencja palet), zalecana liczba klas koloru według źródeł, nawigacja klawiaturą po jednostkach mapy.
Format: tabela: wymaganie · źródło (link) · treść własnymi słowami · data.

## R15.3 – Elementy specyficzne dla telefonu: wsparcie platformy
Dla każdego sprawdź stan wsparcia w iOS Safari i Chrome Android (MDN, caniuse, web.dev) i opisz ograniczenia: (a) „Znajdź mnie” – Geolocation API: wymagania (kontekst bezpieczny, uprawnienia), zalecane wzorce zapytania o zgodę; (b) Web Share API z plikami (udostępnianie obrazu karty); (c) instalowalność PWA: kryteria, manifest, wymagania iOS; (d) `prefers-color-scheme` i ciemny motyw; (e) buforowanie danych statycznych przez service worker (Workbox – licencja, rozmiar; strategie z dokumentacji); (f) `Save-Data` / `navigator.connection` – wsparcie.
Format: tabela: funkcja · iOS Safari · Chrome Android · główne ograniczenie (jedno zdanie) · link · data.
```
