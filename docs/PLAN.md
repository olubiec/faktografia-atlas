# Plan – Faktografia Atlas
Cel produktu: interaktywna mapa Polski z danymi GUS, w której każdy (najczęściej z telefonu) w minutę sprawdzi, jak jego miejsce wypada na tle innych, i wyśle komuś link.

Jak używać tego pliku (WORKFLOW UNIWERSALNY v5.1):
- **Sesja** = jeden widoczny efekt (np. „telefon od nowa”). Dzieli się na **fale**: prompty z jednej fali zmieniają rozłączne pliki, więc wklejasz je do Julesa naraz.
- **Planista** (Gemini albo Claude) na początku każdej fali: `TRYB: FALA` z linkiem do `docs/STAN.md` i do tego pliku. Sprawdza w kodzie, czy założenia są nadal prawdziwe, i z kroków fali robi prompty w formacie v5.1 §9.1 (Przeczytaj najpierw · Zadanie · Pliki · Gotowe, gdy · Nie ruszaj · „Po ludzku”). Następną falę pisze dopiero po bramce poprzedniej.
- **Bramka fali** = zielone CI na `main` po scaleniu wszystkich PR fali. Widoczne zmiany oglądasz przy scalaniu według linijki „Ty sprawdzasz”.
- Coś wyszło inaczej → `TRYB: ODŚWIEŻ`. Ostatni prompt sesji aktualizuje `docs/STAN.md` i oznacza sesję tu jako zakończoną.
- Wymagania ekranów: `docs/PRODUKT.md` (pierwszeństwo). Wygląd: `docs/STYL.md` i makiety `docs/design/`. Dane i pakiety: `docs/TECHNIKA.md`. Nowa biblioteka lub usługa → najpierw `TRYB: WYBÓR`.

Zasady wspólne dla wszystkich sesji:
- **Komputer nie może się pogorszyć**, gdy poprawiamy telefon, i odwrotnie. Każdy prompt z UI ma warunek: istniejące testy przechodzą bez zmian.
- Każdy prompt z UI ma w „Gotowe, gdy” rzutnie **390×844** (telefon) i **1440×900** (komputer); dla telefonu dodatkowo **360×740** (mały Android).
- Najwyżej jedno czerwone zakreślenie na ekranie (STYL §7).
- Vercel (darmowy) robi najwyżej 100 podglądów dziennie, a Jules – 100 zadań dziennie, 15 naraz. Fala to zwykle 1–4 prompty.

---

## S14 – Profil miejsca jak makieta 03 (w toku)
**Po co:** po kliknięciu miejsca na komputerze widać czytelny profil: kto to jest, jak wypada w bieżącym wskaźniku, ranking, lista jednostek niżej, rozwijane wskaźniki.
**Zrobione:** S14.1 (logika sekcji), S14.2 (rozwijany wiersz), S14.7 (zakreślenie trzyma się tekstu), S14.8 (oddalanie mapy), S14.9 (przewijanie listy wskaźników).
**Zostało (fale):** 1: PR #198 (S14.10 – tekst zmiany w latach, obejrzeć i scalić) + PROMPT 1 – S14.3 przegląd (od nowa, PR #199 odrzucony) · 2: PROMPT 2 – S14.4 zakładki · 3: PROMPT 3 – S14.6 test całej ścieżki → PROMPT 4 – STAN. Gotowe prompty: `docs/prompty/S14.md`.
**Przeniesione:** profil na telefonie (dawne S14.5) → S15.3.

**Co zobaczysz na końcu S14 (komputer):** klik w małopolskie → po prawej „Województwo małopolskie”, duża liczba w kółku, „2. miejsce wśród 16 województw”, słupki 16 województw, zakładki Przegląd / Powiaty (22) / Porównaj (wkrótce), wiersze wskaźników z tekstem „↗ +1,2% od 2020”, po kliknięciu wiersza wykres i „Pokaż na mapie”, na dole „Kopiuj link”.

---

## S15 – Telefon od nowa (następna)
**Po co:** dziś na telefonie strony nie da się używać: panel wskaźnika zajmuje pół ekranu nad mapą, mapa to wąski pasek, profil zasłania resztę, okruszki i „Wróć” leżą na mapie, pasek zgody zakrywa dół. Robimy ekran telefonu według makiety 04 i `PRODUKT.md` §5.

**Co zobaczysz na końcu (na swoim telefonie, podgląd Vercel):**
1. U góry tylko cienki pasek: logo, lupa, menu (☰). Przycisk „Motyw” jest w menu, nie na pasku.
2. Mapa zajmuje prawie cały ekran (co najmniej 3/4 wysokości) i od razu jest w kolorach.
3. Na dole stały pasek „Gęstość zaludnienia ▾ · 2025”. Dotknięcie wysuwa od dołu arkusz: wybór wskaźnika, poziom, legenda, rok, najwyżej/najniżej. Zamykasz go przeciągnięciem w dół, krzyżykiem albo dotknięciem mapy.
4. Pierwsze dotknięcie województwa pokazuje mały dymek nad dolnym paskiem (nazwa, wartość, miejsce, „Otwórz profil”). Drugie dotknięcie albo „Otwórz profil” otwiera profil.
5. Profil wysuwa się od dołu na ok. 40% ekranu, a nad nim widać mapę z zaznaczonym miejscem. Przeciągnięcie w górę rozwija profil na cały ekran, w dół zwija go do 40%, dalej w dół (albo ×) zamyka.
6. Okruszki to jedna krótka linia „‹ Polska / małopolskie” u góry mapy. Nie nachodzą na nic, a strzałka „‹” działa jak „Wróć”.
7. Pasek zgody jest mały (najwyżej 2 linijki nad dolnym paskiem) i znika po wyborze.
8. Nic nie wystaje poza ekran, nie da się przewinąć strony w bok, każdy przycisk jest wygodny dla palca. Na komputerze wszystko wygląda jak przed sesją.

**Założenia (decyzje – Planista ich nie zmienia bez pytania):**
- Granica „telefon” = szerokość < 768 px (token `breakpoints.tablet`, ten sam co dziś w `ProfilePortal`). Tablet ≥ 768 px zostaje w układzie komputera.
- Na telefonie `IndicatorPanel` nie jest renderowany nad mapą. Ta sama treść trafia do dolnego arkusza wskaźnika. Komponent panelu jest wspólny, bez kopii.
- Arkusze robimy na pakiecie, który już jest w projekcie (`react-modal-sheet`, używa go `ProfileSheetMobile`). Żadnych nowych pakietów.
- Naraz otwarty jest najwyżej jeden arkusz: otwarcie profilu zamyka arkusz wskaźnika i odwrotnie.
- Wysokość ekranu liczona przez `dvh` (pasek adresu Safari/Chrome), dolne elementy z odstępem `env(safe-area-inset-bottom)` (iPhone z paskiem gestów).
- Mapa przy otwartym profilu (40%) dopasowuje widok do **widocznej** części nad arkuszem (padding dolny = wysokość arkusza), więc wybrane miejsce nie chowa się pod arkuszem.
- Dziś na telefonie profil trafia do kolumny `data-slot="side"` pod mapą (`max-h-[45vh]`), a nie do pływającego arkusza. Krok 15.3 najpierw opisuje w PR, dlaczego tak jest.

**Kroki (1 krok = 1 prompt):**
- **15.1 Układ telefonu: cienki nagłówek, mapa na cały ekran, dolny pasek wskaźnika.** `Header.tsx` (Motyw do menu na < 768 px), `AtlasMap.tsx` / `Home.tsx` (na telefonie bez panelu nad mapą), nowy `MobileIndicatorBar.tsx` (sam pasek, na razie dotknięcie nic nie robi albo otwiera pusty arkusz).
  Gotowe, gdy: na 390×844 i 360×740 mapa ≥ 75% wysokości okna; nagłówek ≤ 56 px; pasek wskaźnika pokazuje nazwę bieżącego wskaźnika i rok i ma ≥ 48 px; `scrollWidth` ≤ szerokość okna; na 1440×900 istniejące testy ekranu głównego przechodzą bez zmian.
  Ty sprawdzasz: punkty 1–2 z listy wyżej plus pasek na dole.
- **15.2 Arkusz wskaźnika na telefonie.** Dotknięcie paska otwiera dolny arkusz (do ~85% wysokości) z treścią panelu wskaźnika. Przewija się w środku, pole szukania wskaźnika zostaje widoczne. Zmiana wskaźnika przekolorowuje mapę i zmienia `?i=`, a arkusz zostaje otwarty, żeby było widać legendę.
  Gotowe, gdy: dotknięcie paska otwiera arkusz; wybór innego wskaźnika zmienia `?i=` i `window.__atlas`; zamknięcie przez ×, przeciągnięcie w dół i dotknięcie mapy (3 testy); ostatnia pozycja „Najwyżej/najniżej” da się przewinąć i kliknąć; brak błędów axe.
  Ty sprawdzasz: punkt 3.
- **15.3 Profil na telefonie: arkusz 40% → 100% (dawne S14.5).** Najpierw przyczyna z założeń (opis w PR), potem naprawa w `ProfilePortal.tsx` / `ProfileSheetMobile.tsx`. Punkty zatrzymania: 40% i 100%. Mapa nad arkuszem pozostaje dotykalna. Wybrane miejsce mieści się w widocznej części mapy.
  Gotowe, gdy: po wyborze jednostki wysokość arkusza to 35–45% okna; przeciągnięcie uchwytu w górę daje ≥ 90% i widać zakładki; × zamyka, `?u=` znika, przybliżenie mapy bez zmian; bbox wybranej jednostki (z `window.__atlas`) mieści się nad górną krawędzią arkusza; pola ≥ 44 px; brak błędów axe.
  Ty sprawdzasz: punkt 5.
- **15.4 Okruszki, „Wróć”, dymek i zgoda na telefonie.** Okruszki w jednej linii z „‹” (= Wróć), bez osobnego przycisku na mapie. Dymek po pierwszym dotknięciu nad dolnym paskiem, z przyciskiem „Otwórz profil” (≥ 44 px). Drugie dotknięcie tej samej jednostki otwiera profil. Pasek zgody: krótszy tekst i dwa przyciski w jednej linii, ≤ 15% wysokości okna. Zmiana pliku `src/view/consent` dozwolona tylko w wyglądzie, bez zmiany logiki.
  Gotowe, gdy: okruszki mają jedną linię (wysokość ≤ 48 px) przy nazwie „powiat kędzierzyńsko-kozielski”; „‹” wraca poziom wyżej; dymek nie wychodzi poza ekran przy jednostce na lewej i prawej krawędzi; pasek zgody ≤ 15% wysokości; logika zgody bez zmian (istniejące testy `consent.spec.ts`).
  Ty sprawdzasz: punkty 4, 6, 7.
- **15.5 Test całej ścieżki na telefonie (`@S15`).** 390×844 i 360×740: start → pasek → zmiana wskaźnika → zamknięcie → dotknięcie województwa → dymek → profil 40% → pełna wysokość → zakładka „Powiaty (n)” → klik w powiat → × . W ścieżce: brak poziomego przewijania, najwyżej jedno żądanie `profiles/*` na wybór, zero „undefined/NaN”, test przechodzi 3 razy z rzędu.
- **15.6 Koniec sesji:** aktualizacja `docs/STAN.md` (jak PROMPT 4 w S14).

**Fale (propozycja, Planista sprawdza kolizje plików):** 1: 15.1 · 2: 15.2 + 15.3 · 3: 15.4 · 4: 15.5 → 15.6.

**Nie robimy w S15:** animacji wejścia w głąb (S16), zmian treści profilu, nowych pakietów.

---

## S16 – Mapa: płynne wejście w głąb, „kafelek po kafelku”
**Po co:** dziś po wybraniu województwa lub powiatu mapa **przeskakuje** do nowego przybliżenia, a reszta Polski znika. Wygląda to jak błąd, a nie jak przejście. Chcemy, żeby wejście w głąb było krótką, ładną animacją: kamera płynnie podjeżdża, a jednostki niższego poziomu **pojawiają się po kolei, kafelek po kafelku**.

**Co zobaczysz na końcu:**
1. Klik w województwo: przez ok. 0,6 s kamera płynnie przybliża się do niego, bez skoku. Reszta Polski nie znika, tylko blednie (jak kalka pod spodem).
2. Jednocześnie powiaty wypełniają się kolorem **po kolei, od środka województwa na zewnątrz**. Każdy „kafelek” łagodnie się pojawia, a cała fala trwa poniżej 1 s, niezależnie od tego, czy jest 12 powiatów, czy 100 gmin.
3. Klik w powiat: to samo z gminami.
4. „Wróć” / okruszki: odwrotnie i szybciej (ok. 0,4 s). Kamera się oddala, kafelki niższego poziomu gasną, wracają kolory poziomu wyżej.
5. Zmiana wskaźnika albo roku: kolory „przelewają się” w 0,3 s zamiast nagle zmieniać.
6. Jeśli w trakcie animacji przeciągniesz albo uszczypniesz mapę, animacja natychmiast oddaje Ci sterowanie.
7. Z włączonym w telefonie „Ogranicz ruch” wszystko pojawia się od razu.
8. Na telefonie animacja jest płynna (bez szarpania). Jeśli na słabym telefonie szarpie – zgłaszasz to w czacie POMOC i Planista skraca efekt.

**Założenia (decyzje):**
- Zastępujemy natychmiastowe `setCurrentViewState` w `useMapViewState` przejściem kamery 600 ms (wejście) i 400 ms (powrót), krzywa ze STYL §8 (`cubic-bezier(0.2, 0, 0, 1)`), czasy z tokenów. Przejście musi być przerywalne gestem.
- **Kafelki po kolei:** kolejność liczy czysta funkcja (od środka jednostki nadrzędnej na zewnątrz, według odległości środków). Opóźnienie kafelka = indeks × krok, krok dobrany tak, żeby całość ≤ 900 ms; pojedynczy kafelek wchodzi przez ≥ 150 ms (nie miga).
- Technika (podpowiedź dla Julesa, do potwierdzenia w kodzie): `DataFilterExtension` z `@deck.gl/extensions` (pakiet już jest w projekcie). Każdy kafelek dostaje numer w kolejności (`getFilterValue`), a animujemy tylko `filterRange` / `filterSoftRange`. Jedna liczba na klatkę, bez przebudowy danych, więc działa płynnie także przy 2479 gminach. Jeśli to się nie sprawdzi, Jules opisuje to w PR i proponuje alternatywę, zanim ją zrobi.
- Reszta kraju przy wejściu w głąb: rysowana tą samą warstwą, wyblakła (kolor `kalka` / obniżone krycie z tokenów), bez interakcji. Dziś jest odfiltrowana (`choropleth.ts`, filtr `scopeWoj`).
- Wejście z adresu (otwarcie linku z `?u=`) i zmiana rozmiaru okna **nie** animują, tylko od razu ustawiają widok.
- `window.__atlas` wystawia stan animacji (np. `reveal: { running, progress }`), żeby testy sprawdzały zachowanie bez pikseli.
- STYL §8 zaktualizowany 21.10.2026 pod tę decyzję.

**Kroki:**
- **16.1 Logika kolejności „kafelek po kafelku”** – nowy `src/core/map/reveal.ts` + testy jednostkowe: kolejność od środka na zewnątrz, deterministyczna; łączny czas ≤ 900 ms dla 12, 22 i 200 kafelków; każdy kafelek ≥ 150 ms; przy `reduced motion` wszystkie opóźnienia = 0.
  Ty sprawdzasz: nic na stronie; ✅ w PR.
- **16.2 Płynny ruch kamery** przy wejściu w głąb, „Wróć”, okruszkach i wyborze z wyszukiwarki; przerywany gestem; bez animacji przy wejściu z linku i zmianie rozmiaru.
  Gotowe, gdy: po kliknięciu województwa `window.__atlas.zoom` zmienia się stopniowo (co najmniej 3 różne wartości pośrednie), a końcowy widok = dopasowanie do bbox jak dziś; przeciągnięcie w trakcie zatrzymuje animację; wejście z `?u=12` od razu daje końcowy widok; istniejące testy `drill.spec.ts`, `map.spec.ts`, `map-zoom-out.spec.ts` przechodzą bez zmian.
  Ty sprawdzasz: punkty 1 (sam ruch kamery), 4, 6.
- **16.3 Kafelki po kolei + wyblakła reszta kraju** (warstwa choropleth, `DataFilterExtension`).
  Gotowe, gdy: w trakcie wejścia `window.__atlas.reveal.progress` rośnie od 0 do 1 w ≤ 1 s; pierwszy widoczny kafelek to ten najbliżej środka; po wejściu w małopolskie jednostki spoza województwa są nadal rysowane (wyblakłe) i nie reagują na najechanie; przy `prefers-reduced-motion` progress od razu = 1.
  Ty sprawdzasz: punkty 1–3, 7.
- **16.4 Przelewanie kolorów** przy zmianie wskaźnika, roku i poziomu (300 ms, przejście koloru wypełnienia w deck.gl).
  Ty sprawdzasz: punkt 5.
- **16.5 Pomiar szybkości i płynności** – test e2e `@S16`: całość ścieżki z animacjami + progi z PRODUKT §7 (żądania danych bez zmian), raport w PR: czas do kolorowej mapy, rozmiar JS na wejściu przed i po sesji (nie może urosnąć o więcej niż 5%).
  Ty sprawdzasz: punkt 8 na swoim telefonie.
- **16.6 Koniec sesji:** STAN.md.
- (opcjonalnie, jeśli 16.1–16.4 są płynne na telefonie) **Scena wejścia** ze STYL §8: kontur Polski rysuje się raz na wizytę.

**Fale (propozycja):** 1: 16.1 + 16.2 · 2: 16.3 · 3: 16.4 · 4: 16.5 → 16.6 (scena wejścia – osobna fala, jeśli starczy płynności).

**Nie robimy w S16:** 3D, nowych pakietów do animacji (jest `motion`, ale mapa animuje się w deck.gl/MapLibre), animacji każdego elementu panelu.

---

## S17 – Objaśnienia i „Na tle kraju” (+ drobne poprawki rozumienia danych)
**Po co:** po kliknięciu wartości użytkownik ma zrozumieć, co znaczy liczba i czy to dużo, czy mało. Nocny robot dorzuca nowe wskaźniki, więc nic nie może wymagać ręcznego tekstu przy każdej liczbie.

**Co zobaczysz na końcu:**
1. Rozwinięty wiersz wskaźnika w profilu i panel wskaźnika mają blok „Na tle kraju”: miejsce, „wyżej niż 73% powiatów”, mediana Polski, najmniej–najwięcej i prosta pozioma skala z kropką „tu jesteś” i kreską „mediana Polski”. To samo w obrębie województwa.
2. Pod tym (jeśli jest wpis) prosta definicja, „jak czytać” i link „Definicja GUS”. Wskaźnik bez wpisu pokazuje sam blok „Na tle kraju” – nic nie jest puste ani zepsute.
3. Klik w „najwyżej”/„najniżej” w bloku wybiera tę jednostkę.
4. Legenda w trybie ciemnym ma podpis kierunku „mniej → więcej” i nigdzie nie pisze „ciemniej znaczy więcej”, jeśli w ciemnym motywie jest odwrotnie.
5. W profilu nie ma już grubego czerwonego „markera” zasłaniającego tekst (typ `highlight`) – tylko zakreślenia ze STYL §7.

**Założenia:**
- Kontekst liczy się sam z `public/data/values/*.json` (czysta funkcja `context()`), ręczny tekst jest opcjonalny: jeden wpis na wskaźnik w `public/data/explanations.json` (`short`, `howToRead`, `definitionUrl`, opcjonalnie `funFact` ze źródłem). Ścieżkę `public/data/` potwierdza kod `loadExplanations()` z S14.2.
- Teksty 20 definicji: szkic `docs/data/explanations-szkic.json` – **Ty akceptujesz** przed wgraniem (Planista daje Ci listę do przeczytania).
- Ciekawostki tylko ze źródłem z linkiem; research w Gem Research, bez liczb z pamięci modelu.

**Fale (propozycja):** 1: 17.1 + 17.5 + 17.6 · 2: 17.2 + 17.4 · 3: 17.3 (po Twojej akceptacji tekstów) → 17.7.

**Kroki:** 17.1 `context()` + testy · 17.2 blok „Na tle kraju” w rozwiniętym wierszu i panelu · 17.3 wgranie `explanations.json` (po Twojej akceptacji) + test schematu i limitów znaków · 17.4 raport nocny „wskaźniki bez objaśnienia” w `docs/data-report.md` · 17.5 legenda w trybie ciemnym + usunięcie typu `highlight` z profilu · 17.6 ZWIAD (tylko raport, bez kodu): czy BDL podaje dane osobno dla miasta i obszaru wiejskiego gmin miejsko-wiejskich (TERYT z końcówką 4 i 5), dla których wskaźników → decyzja na następną sesję · 17.7 STAN.md.

---

## S18 – Porównanie dwóch miejsc
**Po co:** „Jak moja gmina wypada obok sąsiedniej?” – najczęstsze pytanie po zobaczeniu profilu. Zakładka „Porównaj” przestaje być „wkrótce”.

**Co zobaczysz na końcu:**
1. W profilu przycisk „Porównaj z innym miejscem” i aktywna zakładka „Porównaj”: wpisujesz drugie miejsce (ta sama wyszukiwarka co u góry).
2. Dwie kolumny obok siebie: każdy wskaźnik w jednym wierszu, wartości obu miejsc, miejsca w rankingu i słownie „wyżej o 12%” / „niżej o 3,1 p.p.”. Kolor nie ocenia, co lepsze (bez zieleni/czerwieni).
3. Na mapie oba miejsca obrysowane, a adres ma `?c=<teryt>,<teryt>`. „Kopiuj link” daje link do tego porównania.
4. Na telefonie to samo w arkuszu profilu, kolumny mieszczą się w 360 px.

**Założenia:** porównujemy dowolne dwie jednostki (także różnych poziomów – wtedy dopisek „różne poziomy, porównuj ostrożnie”); dane tylko z już pobranych plików (najwyżej jeden dodatkowy `profiles/*`, jeśli drugie miejsce jest w innym województwie); bez nowych pakietów.

**Fale (propozycja):** 1: 18.1 · 2: 18.2 + 18.4 · 3: 18.3 · 4: 18.5 · 5: 18.6 → 18.7.

**Kroki:** 18.1 logika `compare()` + testy (różnice %, p.p., brak danych) · 18.2 wybór drugiego miejsca i adres `?c=` · 18.3 tabela porównania w zakładce · 18.4 dwa obrysy na mapie · 18.5 telefon · 18.6 test ścieżki `@S18` · 18.7 STAN.md.

---

## Później (kolejność do ustalenia po S18)
- Podstrony gmin pod wyszukiwarki (SEO) – decyzja po pomiarach z S16.
- Blady podkład OpenFreeMap przy dużym zbliżeniu; kreskowanie „brak danych”; tryb ciemny mapy (makieta 05).
- Statystyki wyszukiwań po zgodzie (klucz PostHog).
- Tryb 3D „Arkusze”; wersja angielska. Generator karuzel – osobne prywatne repo.
