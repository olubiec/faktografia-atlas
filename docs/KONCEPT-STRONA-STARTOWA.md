# Koncept: strona startowa z żywą animacją, mapa osobno (pomysł właściciela 19.11.2026)
Status: **koncept, decyzja odłożona przez właściciela (19.11.2026): najpierw research i analizy (QU32), potem wybór**. Nic nie wdrożone. Kolejne Q, po W5 (patrz „Fale”). Wpisane też w `docs/PLAN-UWAGI-19-11.md` (W4d) i `docs/FALE.md`.

## Pomysł
Dziś `/` to od razu mapa; animacja rysowania obrysu Polski (`IntroOverlay`, 1,2 s) znika po chwili. Właściciel: animacja się podoba, więc niech będzie **stroną startową**:
1. `/` = strona startowa: duża animowana Polska, która **reaguje na kursor** (gdzie jest mysz, tam animacja się dostosowuje), krótki opis konceptu, co można się dowiedzieć, zachęta do wejścia.
2. Klik w mapę (lub w przycisk) = płynne „przyłączenie” do **pełnej mapy z danymi** (jakby kamera wjeżdżała w tę samą Polskę).
3. Pełna, w pełni działająca mapa żyje pod osobnym adresem.

## Czy to łatwe? Krótko
**Tak, technicznie to średnia zmiana; ryzykiem jest nie kod, tylko adresy i testy.**
- Animacja już jest (obrys z `public/geo/kalka.svg`, rysowany `stroke-dashoffset`). Reakcja na kursor = nowy, mały komponent (bez deck.gl, bez danych GUS).
- Ciężar: `kalka.svg` ma 457 KB, `admin.topo.json` 1,2 MB – na stronę startową **za dużo**. Potrzebny uproszczony obrys (cel ≤ 60 KB; generowany skryptem, zmiana w `scripts/data` tylko za zgodą). Strona startowa nie może ściągać `units.json` ani wskaźników (progi §7 PRODUKT.md).
- Ryzyko: **adresy i testy**. W testach jest 362 wywołań `goto`, z czego ok. 100 wchodzi na gołe `/` lub `/?e2e` i oczekuje mapy; udostępnione linki `/?u=…&i=…` już krążą po sieci. Zasada AGENTS.md zabrania zmiany istniejących testów bez zgody – tu potrzebna Twoja zgoda na jednorazową migrację.

## Warianty
| Wariant | Jak | Plus | Minus |
|---|---|---|---|
| **A (zalecany)** | `/` = strona startowa, mapa pod `/mapa`. Każdy stary adres z parametrami (`/?u=`, `?i=`, `?y=`, `?l=`, `?c=`) przekierowuje na `/mapa?…` (linki z sieci działają). Logo = `/`. | czysty podział, lekka strona startowa, dobre OG/SEO | migracja ok. 100 testów (jedno zadanie, wspólna funkcja `openMap()`) |
| B | `/` zostaje mapą; strona startowa to nakładka na mapie (jak dziś `IntroOverlay`), znika po kliknięciu | zero zmian adresów i testów | mapa i dane ładują się pod spodem (waga, wolniej na telefonie), trudniej o opis i SEO |
| C | strona startowa pod nowym adresem (`/start`), `/` bez zmian | zero ryzyka | pierwsza wizyta nadal ląduje na mapie – pomysł traci sens |

Rekomendacja: **A**, a jeśli nie zgadzasz się na migrację testów – **B** jako rozwiązanie przejściowe.

## Jak ma działać animacja (pomysły do wyboru po prototypie)
- **Obrys + granice województw** rysowane przy wejściu (jak dziś), potem „oddycha”.
- **Reakcja na kursor** (do wyboru, można łączyć): (1) najbliższy fragment granicy się rozjaśnia/pogrubia (SVG + zmienna CSS ustawiana z `pointermove`, 1 klatka/`requestAnimationFrame`); (2) delikatny paralaks całej Polski; (3) najechane województwo wypełnia się kolorem i pokazuje nazwę + jedną liczbę (z pliku wbudowanego w stronę, nie z sieci).
- **Tryb samoczynny (bez kursora, decyzja właściciela 19.11):** animacja żyje sama, losowo, np. fala światła wędrująca po granicach, pulsowanie losowych województw, powolny dryf. Dopiero gdy kursor (lub palec) wejdzie w obszar, animacja **przejmuje jego położenie**: efekt „ucieka” z losowych miejsc do kursora, a po ok. 2–3 s bez ruchu płynnie wraca do trybu samoczynnego. Znany wzorzec ze stron produktowych (idle → hover). Jedna pętla `requestAnimationFrame`, wspólny „punkt zainteresowania” (losowy albo kursor), wygładzanie (lerp), pauza przy ukrytej karcie i poza ekranem (oszczędność baterii). Do ustalenia w QU32: tempo, jak mocny ma być efekt, czy losowość ma ziarno (powtarzalność w testach).
- **Telefon (bez myszy):** dotknięcie i przeciąganie palcem działa jak kursor; bez dotyku – tryb samoczynny jak wyżej. Pola dotykowe ≥ 44 px.
- **`prefers-reduced-motion`:** statyczny obrys, zero ruchu (zgodnie z AGENTS.md).
- **Przejście do mapy:** klik zatrzymuje animację, obrys powiększa się do rozmiaru mapy (ta sama geometria), mapa wjeżdża pod nim (fade), potem pełna interakcja. Kliknięcie konkretnego województwa = mapa od razu wchodzi w nie. Mapa i dane doczytują się w tle (prefetch przy najechaniu na przycisk / po bezczynności), żeby przejście nie zawisło – to też lekarstwo na „zawieszenie przed przybliżeniem” (QU29).
- **Techniki:** wystarczy SVG + CSS + mały skrypt (bez nowego pakietu). Canvas 2D tylko jeśli SVG zwolni (pomiar na telefonie). Nowy pakiet (np. do animacji) tylko po wpisie do `ELEMENTY.md` i Twojej zgodzie.

## Treść strony startowej (propozycja, do Twojej korekty)
1. Hero: animowana Polska + jedno zdanie („Zobacz swoją gminę na tle całej Polski”) + przycisk „Otwórz mapę”.
2. Co tu znajdziesz: 3–4 kafelki (Mapa i profil miejsca · Rankingi · Porównaj miejsca · Biblioteka GUS) – każdy z mini-podglądem.
3. „Spróbuj”: szybki start (Warszawa, Kraków, powiat tatrzański, Kleszczów – dziś w `PortalSections`).
4. Skąd dane (GUS, licencja) i kim jest Faktografia (nazwa **bez „Atlas”**, zgodnie z QU28).
Dzisiejsze `PortalSections` (pod mapą) przechodzą tu; pod mapą zostaje tylko to, co dotyczy samej mapy.

## Kolizje z innymi zadaniami (dlatego nie w Q2)
Dotyka plików ekranu (`Home.tsx`, `AtlasMap.tsx`, `Header.tsx`, routing w `App.tsx`) – wymaga wprost wymienienia w zadaniach. Zależności: QU28 (nazwa Faktografia), QU29 (start kamery), QU23 (warstwy: pasek „Przewiń w dół…” z `Home.tsx` znika razem ze zmianą), QU25 (menu), QU03 (które strony zostają).

## Fale (propozycja)
| Fala | Zadanie | Co |
|---|---|---|
| **W4d** (tylko raporty, od ręki po poleceniu) | **QU32** | inwentarz: które testy i linki zależą od `/`; tabela „stary adres → nowy”; pomiar wagi obrysu; szkice 390/1280 px; **prototyp animacji** (tryb samoczynny + reakcja na kursor) na stronie `/design` (bez ruszania `/`) do obejrzenia na telefonie |
| **W6** (po W5, po Twojej decyzji A/B/C) | **QU33** | skrypt uproszczonego obrysu (zgoda na `scripts/data`) + test wagi ≤ 60 KB |
| | **QU34** | trasa `/mapa`, przekierowania starych adresów, logo → `/`; test przekierowań |
| | **QU35** | migracja testów e2e na `openMap()` (jednorazowa zgoda na zmianę istniejących testów) |
| **W7** | **QU36** | komponent hero: rysowanie obrysu + reakcja na kursor/dotyk + reduced motion |
| | **QU37** | przejście hero → mapa (prefetch, wspólna geometria, bez zawieszenia) |
| | **QU38** | treść strony startowej (kafelki, szybki start, źródła), przeniesienie `PortalSections`, OG/tytuły |
Kolejność: QU34 → QU35 → QU36 → QU37 → QU38 (QU36 może iść równolegle z QU34/35, bo to osobny plik). Szacunek: 1 fala analiz + 2 fale wdrożenia.

## Twoje decyzje
1. Wariant A, B czy C?
2. Zgoda na jednorazową migrację testów (tylko wariant A)?
3. Które reakcje na kursor Cię kuszą (1, 2, 3 z listy wyżej)? Prototyp pokaże je na żywo.
4. Zgoda na zmianę w `scripts/data` (uproszczony obrys)?
