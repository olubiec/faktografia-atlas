# Faktografia Atlas – co budujemy
**Dla kogo:** osoba ciekawa swojej okolicy (mieszkaniec, dziennikarz, uczeń, samorządowiec), najczęściej z telefonu (§2).
**Problem:** dane GUS o gminach i powiatach są w tabelach Banku Danych Lokalnych, nie da się ich szybko zobaczyć na mapie ani porównać.
**Pierwsza wersja ma umieć:** mapa Polski w kolorach wybranego wskaźnika (§3) · profil miejsca z rankingiem i wykresami (§4) · wygodny telefon (§5) · płynne wejście w głąb mapy (§5a) · proste objaśnienia (§6) · porównanie dwóch miejsc (§4a) · link do każdego widoku · **pobieranie i udostępnianie** kart z mapą, rankingiem, profilem i porównaniem oraz danych w CSV (§4b).
**Czego NIE robimy:** kont użytkowników, liczb wpisywanych ręcznie lub przez AI, śledzenia osób, Google Maps, generatora serii slajdów pod konta Faktografii w tym repo – pojedyncze karty do pobrania dla każdego robimy (§4b) (pełna lista: `docs/ARCHITEKTURA.md` §7).
**Zarabia:** nie (projekt marki Faktografia; przy komercjalizacji – zmiana hostingu z Vercel Hobby). **Dane osób:** nie – tylko anonimowe statystyki wyszukiwań po zgodzie.
**Technologia:** Vite + React + TypeScript, MapLibre + deck.gl, dane statyczne z robota GUS (`docs/ARCHITEKTURA.md`, elementy: `docs/ELEMENTY.md`). **Hosting:** Vercel (podgląd każdego PR).
**Gdzie jesteśmy:** `docs/STAN.md` · warstwy i plan fal: `docs/ARCHITEKTURA.md` · wygląd: `docs/STYL.md` + makiety `docs/design/`.

Wersja 3 · 24.10.2026 (v2: 21.10.2026, v1: 20.10.2026). Zmiany v3: §4a porównanie (dwie mapy pomocnicze), §4b pobieranie i udostępnianie (pomysły właściciela 24.10). Zmiany v2: Zmiany v2: nagłówek wg WORKFLOW v5.3 §10.2, §5 telefon (po oglądzie 21.10), §5a wejście w głąb mapy, §6 ścieżka pliku objaśnień, §8–§9 pod nowy proces.
Opisy ekranów niżej są wymaganiami – mają pierwszeństwo przed starymi promptami i kodem.

---

## 1. Zasady z pierwszego testu właściciela (20.10.2026)
Strona przechodziła wszystkie testy, a jako produkt nie działała (zacinała się, mapa bez kolorów, profil zasłaniał mapę, nieczytelne wykresy, „powiat powiat”). Od tego czasu:
1. Budujemy **ekran jako całość**, nie kawałki – każda sesja kończy się czymś, co da się obejrzeć.
2. Ekran ogląda **właściciel na podglądzie** (komputer i telefon) przed scaleniem.
3. Szybkość i wygląd mają **mierzalne progi** (§7) i testy na prawdziwych danych.
4. Makiety (`docs/design/`) są **warunkiem odbioru**, nie inspiracją.

---

## 2. Dla kogo i po co

Osoba ciekawa swojej okolicy (mieszkaniec, dziennikarz, uczeń, samorządowiec), najczęściej z telefonu albo laptopa. Chce w minutę:
1. zobaczyć, jak jej gmina/powiat wypada na tle innych w jednej sprawie (ranking, kolory na mapie);
2. zobaczyć „wszystko o moim miejscu” w czytelnej formie;
3. zrozumieć, co znaczy liczba (prosta definicja, odniesienie do Polski i świata);
4. wysłać komuś link do tego samego widoku.

---

## 3. Ekran główny (komputer, ≥ 1024 px) – makieta 02

```
┌ Faktografia ─────────────────────────────── [ Szukaj miejsca  Ctrl K ] [Motyw] ┐
│┌ Panel wskaźnika (≈ 400 px) ┐                                                  │
││ Gęstość zaludnienia      ▾ │   Polska / małopolskie            (okruszki)     │
││ osoby na 1 km², 2025,       │                                                  │
││ dane dla województw     (?) │          MAPA w kolorach wskaźnika               │
││ Poziom: [Woj][Pow][Gmi]     │          (zajmuje całą resztę ekranu)            │
││ Legenda: 5 klas + brak      │                     ┌ dymek po najechaniu ┐      │
││ „Ciemniej znaczy gęściej”   │                     │ małopolskie         │      │
││ Rok: ────────────■ 2025     │                     │ 225,8 os./km²       │      │
││ Najwyżej / najniżej (5+5)   │                     │ 2. z 16 województw  │      │
││ Źródło: GUS, BDL, 2025      │                     │ Otwórz profil →     │      │
│└─────────────────────────────┘                     └─────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Na wejściu mapa jest już w kolorach.** Domyślny wskaźnik: **gęstość zaludnienia** (jak na makiecie; zmiana = jedna stała w kodzie). Domyślny poziom: województwa.
- **Bez dużego nagłówka „Mapa Polski z danymi GUS” obok mapy.** Tytuł i opis strony są w panelu wskaźnika (jedno zdanie nad nazwą wskaźnika) albo w `<title>`; mapa ma całą szerokość poza panelem.
- **Wybór wskaźnika:** nazwa wskaźnika w panelu jest przyciskiem, otwiera `IndicatorPicker` (lista z grupami i wyszukiwaniem). Zmiana od razu przekolorowuje mapę i zmienia adres (`?i=`).
- **Poziom:** przełącznik Województwa / Powiaty / Gminy (gminy tylko dla wskaźników z `minLevel` = gmi; inaczej przycisk wyłączony z podpowiedzią „GUS podaje te dane tylko do powiatów”).
- **Legenda** z opisem słownym klas i „brak danych”; **rok** suwakiem.
- **Najwyżej / najniżej:** 5 najlepszych i 5 najsłabszych jednostek bieżącego poziomu; klik = wybór jednostki. To jest „zestawienie miejsc”, o które prosił właściciel.
- **Dymek** po najechaniu (komputer) albo pierwszym dotknięciu (telefon): nazwa, wartość z jednostką, miejsce w rankingu, „Otwórz profil”. Zwykły tekst, bez HTML.
- **(?) przy wskaźniku** otwiera objaśnienie (§6).

## 4. Profil miejsca (komputer) – makieta 03

- Panel po prawej **obok mapy** (440 px), mapa się zwęża, **nic nie jest nałożone na mapę**. Zamknięcie: ×, Escape; mapa wraca do pełnej szerokości bez zmiany przybliżenia.
- Nagłówek: „Województwo małopolskie”, „Gmina miejska Wałcz” (bez powtórzeń typu „powiat powiat”), TERYT. **Wszędzie, gdzie widać nazwę gminy, widać jej rodzaj**: „Wałcz (miasto)”, „Wałcz (gmina wiejska)”.
- Zakładki: **Przegląd** · **Powiaty (22)** / **Gminy (n)** (lista jednostek niższego poziomu z wartością bieżącego wskaźnika) · **Porównaj** (S18; do tego czasu zakładka nieaktywna z napisem „wkrótce”).
- **Przegląd** (od góry):
  1. bieżący wskaźnik: nazwa, rok, **duża liczba**, miejsce w rankingu (jedno zakreślenie wg STYL.md §7);
  2. **ranking wszystkich jednostek tego poziomu** w województwie / kraju jako poziome słupki, wybrana jednostka wyróżniona (makieta 03); długie listy: 10 + „pokaż wszystkie”;
  3. **pozostałe wskaźniki** w grupach (Ludność, Praca, Pieniądze, Mieszkania, Środowisko, Życie, Transport), każdy jako wiersz: nazwa, wartość, miejsce. **Klik w wiersz rozwija go:** czytelny wykres lat (oś lat, min/max, wartość po najechaniu), objaśnienie (§6), przycisk **„Pokaż na mapie”** (ustawia ten wskaźnik na mapie i w panelu).
- Na dole: „Kopiuj link”, „Pobierz i udostępnij” (S19, §4b), źródło. „Porównaj z innym miejscem” – S18.

## 4a. Porównanie dwóch miejsc (S18)

Pomysł właściciela 24.10.2026: „zestawianie ze sobą różnych powiatów – dwie mapy albo okno z danymi obu”. Robimy oba, w tanim wariancie:
- **Okno z danymi obu:** zakładka „Porównaj” w profilu – tabela: wiersz na wskaźnik, wartości obu miejsc, miejsca w rankingu, słowna różnica („wyżej o 1,2 p.p.”). Kolory neutralne (bez zieleni i czerwieni).
- **Dwie mapy:** nad tabelą dwie małe mapki (rysunek SVG, nie druga mapa WebGL): każda pokazuje województwo z danym miejscem w kolorach bieżącego wskaźnika i obrysem w kolorze `korekta`. Na dużej mapie oba miejsca obrysowane.
- Link `?c=<teryt>,<teryt>` otwiera to samo porównanie. Dowolne dwa miejsca, także różnych poziomów (wtedy dopisek „różne poziomy – porównuj ostrożnie”).
- Poza pierwszą wersją („Później”): dwie pełne, ruchome mapy obok siebie (np. dwa wskaźniki albo dwa lata), więcej niż dwa miejsca.

## 4b. Pobierz i udostępnij (S19)

Pomysł właściciela 24.10.2026: każdy może pobrać dane, tabelki, mapy z legendą i porównania, żeby je udostępniać i używać – w formatach pod komentarze, Instagram i X. To publiczna wersja tego, co miało być w karuzelach.

- **Przycisk „Pobierz i udostępnij”** w panelu wskaźnika (mapa, ranking), w stopce profilu (profil) i w zakładce „Porównaj” (porównanie). Otwiera okno z podglądem.
- **Karty (obrazy PNG):**
  | Karta | Co na niej jest |
  |---|---|
  | Mapa | tytuł (wskaźnik, rok, poziom, obszar), mapa w kolorach z legendą 5 klas i „brak danych”, wybrane miejsce obrysowane |
  | Ranking | 10 najwyżej i 10 najniżej (albo całość, gdy ≤ 20) jako słupki, wybrane miejsce wyróżnione |
  | Profil | nazwa miejsca, duża liczba z miejscem w rankingu (jedno kółko korekty), 5 wybranych wskaźników |
  | Porównanie | dwa miejsca, dwie małe mapki, 5–8 wierszy porównania ze słowną różnicą |
  Każda karta ma logo z `public/brand/`, linijkę „Źródło: GUS, Bank Danych Lokalnych, <rok>” i adres strony – bez wyjątku (licencja danych CC BY 4.0).
- **Formaty:** Post 4:5 – 1080×1350 (Instagram, Facebook, Threads) · Kwadrat 1:1 – 1080×1080 (komentarze, X, Facebook) · Story 9:16 – 1080×1920 (treść w środkowym pasie 1080×1610) · Poziomy 16:9 – 1600×900 (X, LinkedIn, strony). Motyw jasny albo ciemny.
- **Zestaw:** „Udostępnij zestaw” wysyła naraz kartę mapy i rankingu (oraz profilu, gdy wybrane jest miejsce) – na telefonie przez systemowe okno udostępniania (Instagram robi z tego karuzelę), na komputerze pobiera kolejne pliki.
- **Dane (CSV):** to, co widać – bieżący wskaźnik dla wszystkich jednostek poziomu (lub obszaru), cały profil miejsca albo tabela porównania. Kodowanie UTF-8, separator „;”, przecinek dziesiętny (otwiera się wprost w polskim Excelu), kolumny z rokiem i źródłem.
- **Na telefonie** przycisk „Udostępnij” otwiera systemowe okno (Instagram, X, komunikatory), jeśli przeglądarka to umie; inaczej „Pobierz”.
- **Prawa:** w oknie zdanie „Możesz używać i udostępniać, podając źródło: Faktografia Atlas, dane GUS”. Karty i CSV na licencji CC BY 4.0.
- **Zasady techniczne:** zero nowych pobrań danych (karty powstają z tego, co już jest w pamięci strony), zero nowych pakietów (SVG i `canvas` przeglądarki, istniejące `roughjs` do kółka korekty), napisy nie wychodzą poza pola także dla najdłuższych nazw („Powiat kędzierzyńsko-kozielski”), działa offline po wczytaniu strony; kod okna i rysowania ładowany dopiero po kliknięciu (osobny plik JS – nie powiększa wejścia, §7).
- **Poza zakresem:** generator serii slajdów pod konta Faktografii (osobne prywatne repo – może korzystać z tych samych kart), wideo, GIF, XLSX.

## 4c. Miasto i obszar wiejski w gminach miejsko-wiejskich (S20)

Decyzja 25.10.2026 (zwiad W1.11: `docs/research/W1.11-wynik.md`). Dotyczy **tylko gmin miejsko-wiejskich** (7-cyfrowy TERYT kończy się na 3). W BDL mają dwie części: **miasto** (kod …4) i **obszar wiejski** (kod …5).
- W profilu takiej gminy, pod przeglądem: zwijany blok „Miasto i obszar wiejski”. Domyślnie zwinięty; dopiero rozwinięcie pobiera **jeden** plik `public/data/parts/<teryt województwa>.json` (wejście w profil nadal robi dokładnie jedno żądanie – §7).
- Zawartość: 14 wskaźników z `config/parts.json`; kolumny „Gmina · Miasto · Obszar wiejski” dla najnowszego roku, w którym jest jakakolwiek wartość części; brak wartości → „brak danych”. Telefon: każdy wskaźnik jako karta (trzy liczby pod nazwą), bez poziomego przewijania.
- **Nie pokazujemy** dochodów i wydatków na mieszkańca (GUS podaje dla części zera = „tylko cała gmina”) ani wskaźników tylko powiatowych. Liczby bierzemy tak, jak podaje BDL (zero zostaje zerem).
- **Nie robimy** osobnych obrysów miasta i wsi na mapie (nie mamy ich granic) ani koloru części na mapie głównej.
- Podpis bloku: „Dane GUS (Bank Danych Lokalnych) dla części gminy miejsko-wiejskiej.”

## 4d. Biblioteka GUS (S21)

Decyzja 25.10.2026. Osobna strona na całą bibliotekę wskaźników BDL pobieraną stopniowo przez robota (`docs/research/biblioteka-gus.md`). Ekran główny z mapą i 20 wskaźnikami zostaje taki, jaki jest.
- **`/biblioteka`** (link „Biblioteka” w nagłówku): licznik („<n> wskaźników GUS, z czego <m> można już przeglądać”), kafelki kategorii (działy GUS) z okruszkami, wyszukiwarka po nazwie (bez względu na polskie znaki i wielkość liter), filtry: poziom (powiaty / gminy), jednostka miary, „tylko już pobrane”; wyniki jako lista po 50 z „Pokaż więcej”. Stan (kategoria, tekst, filtry) w adresie `?k= &q= &l= &p=`.
- **`/biblioteka/<id>`**: nazwa, kategoria, jednostka, wybór roku i poziomu, ranking „najwyżej / najniżej” (po 10), „Pobierz CSV”, źródło i licencja (GUS, BDL, CC BY 4.0). Wskaźnik jeszcze niepobrany → komunikat i przycisk „Zamów ten wskaźnik” (otwiera zgłoszenie na GitHubie z wypełnionym tekstem – sami niczego nie wysyłamy).
- **Nie ma w pierwszej wersji** (idzie do „Później”): mapa dla wskaźnika z biblioteki (wymaga zmiany ekranu głównego), porównania, karty PNG, konta, automatyczna kolejka zamówień (zamówienia czytamy ręcznie).
- Dane: indeks (jeden plik) i wartości (jeden plik na wskaźnik) czytane z jednego adresu, ustawianego w `src/core/library/config.ts` (zmienna `VITE_LIBRARY_BASE`) – dzięki temu zmiana magazynu danych (gałąź w repo → Cloudflare R2) nie dotyka kodu stron.

## 5. Telefon (< 768 px) – makieta 04

Ogląd właściciela 21.10.2026: telefon nie nadaje się do użytku (panel wskaźnika nad mapą zajmuje pół ekranu, mapa to pasek, profil zasłania resztę, okruszki i „Wróć” leżą na mapie, pasek zgody zakrywa dół). Wymagania:

- **Nagłówek** ≤ 56 px: logo, lupa, menu. „Motyw”, „O projekcie”, „Skąd są dane” – w menu.
- **Mapa na cały ekran** pod nagłówkiem (≥ 75% wysokości okna), od razu w kolorach. Wysokość przez `dvh`, dolne elementy z odstępem `safe-area`.
- **Dolny pasek wskaźnika** „Gęstość zaludnienia ▾ · 2025” (≥ 48 px). Dotknięcie wysuwa **arkusz wskaźnika**: wybór wskaźnika, poziom, legenda, rok, najwyżej/najniżej. Zamknięcie: przeciągnięcie w dół, ×, dotknięcie mapy.
- **Dymek** po pierwszym dotknięciu jednostki, nad dolnym paskiem, z przyciskiem „Otwórz profil”; drugie dotknięcie tej samej jednostki otwiera profil.
- **Profil:** dolny arkusz na 40% wysokości, przeciągany do pełnej wysokości i z powrotem; treść jak w §4. Mapa nad arkuszem pozostaje widoczna i dotykalna, a wybrane miejsce mieści się nad arkuszem.
- Naraz otwarty najwyżej jeden arkusz.
- **Okruszki** w jednej linii u góry mapy, „‹” działa jak „Wróć” (bez osobnego przycisku na mapie).
- **Pasek zgody** ≤ 15% wysokości okna, znika po wyborze.
- Pola dotykowe ≥ 44 px, brak poziomego przewijania przy 360 i 390 px. Tablet (≥ 768 px) = układ komputera.

## 5a. Wejście w głąb mapy (komputer i telefon)

- Wybór województwa / powiatu (klik, ranking, wyszukiwarka): kamera **płynnie** podjeżdża do jednostki (ok. 600 ms), bez skoku. Gest użytkownika przerywa ruch.
- Jednostki niższego poziomu pojawiają się **kafelek po kafelku**, od środka na zewnątrz; cała fala < 1 s niezależnie od liczby jednostek.
- Reszta Polski nie znika – zostaje wyblakła jako tło.
- „Wróć” i okruszki: ruch odwrotny, szybszy (ok. 400 ms). Zmiana wskaźnika / roku: kolory przelewają się w 300 ms.
- Otwarcie linku z `?u=` i zmiana rozmiaru okna – bez animacji. `prefers-reduced-motion` – wszystko od razu.

## 6. Objaśnienia wskaźników

Dla każdego wskaźnika (opcjonalnie) wpis w pliku `public/data/explanations.json`. Niezależnie od wpisu blok „Na tle kraju” liczy się sam z danych (miejsce, mediana Polski, najmniej–najwięcej; szczegóły: `docs/ARCHITEKTURA.md` §3, zadania W1.6 i W2.12).

| Pole | Treść | Limit |
|---|---|---|
| `short` | definicja prostym językiem („Ilu ludzi mieszka średnio na 1 km² powierzchni.”) | 160 znaków |
| `howToRead` | jak czytać, na co uważać („Miasta zawsze wypadają wyżej niż wsie; porównuj miasta z miastami.”) | 240 znaków |
| `world` | Polska na tle UE/świata, z rokiem i liczbą; **jeśli definicje się różnią (np. bezrobocie rejestrowane vs badanie BAEL), napisać to wprost** | 240 znaków + `source`, `url`, `year` |
| `funFact` | jedna ciekawostka ze świata albo z Polski | 200 znaków + `source`, `url` |
| `definitionUrl` | oficjalna definicja GUS (pojęcia w statystyce publicznej / opis zmiennej BDL) | link |

Zasady: każda liczba i ciekawostka ma źródło z linkiem; research robi Gem Research, Planista sprawdza każde źródło, **akceptuje właściciel** przed publikacją. Brak wpisu = brak przycisku (?), strona działa dalej.

## 7. Szybkość (progi sprawdzane testem w CI)

| Sytuacja | Próg |
|---|---|
| Kod JavaScript ładowany na wejściu | bez danych w środku: `units.json` i granice doczytywane jako osobne pliki z pamięcią podręczną |
| Dane pobierane na wejściu | granice + lista jednostek + **jeden** plik wskaźnika domyślnego; żadnego `profiles/*` |
| Wybór miejsca | **dokładnie jedno** żądanie danych profilu (`public/data/profiles/<województwo>.json`) |
| Zmiana wskaźnika | jedno żądanie `values/<id>.json` (jeśli nie było w pamięci) |
| Profil gminy miejsko-wiejskiej | bez dodatkowych żądań; dopiero rozwinięcie „Miasto i obszar wiejski” = jedno żądanie `parts/<województwo>.json` (§4c) |
| Biblioteka GUS (`/biblioteka`) | wejście = jedno żądanie indeksu; wybór wskaźnika = jedno żądanie wartości; żadnych `values/*` ani `profiles/*` z głównej mapy (§4d) |
| Pliki danych | bez wcięć (`JSON.stringify` bez spacji) |
| Odczuwalnie (właściciel na podglądzie, także na telefonie) | mapa w kolorach ≤ 3 s na zwykłym laptopie; otwarcie profilu bez widocznego zacięcia |

## 8. Definicja „gotowe” dla zadań z UI (dodatkowo do AGENTS.md)

1. Zgodne z makietą (02–05) na 1440×900 i 390×844; różnice wypisane w PR.
2. Działa **na prawdziwych danych** z `public/data` (nie tylko na danych syntetycznych w teście).
3. Właściciel przed scaleniem ogląda podgląd Vercel na komputerze i telefonie według linijki „Ty sprawdzasz” przy zadaniu w `docs/ARCHITEKTURA.md` §3; Jules w sekcji „Po ludzku” pisze, co sprawdzić.
4. Progi z §7 przechodzą.

## 9. Kolejność

Zadania wg warstw: `docs/ARCHITEKTURA.md` §3; fale i ich kolejność: §4 (S14 profil, S15 telefon, S16 wejście w głąb, S17 objaśnienia, S18 porównanie, S19 pobierz i udostępnij – zrobione; S20 miasto i wieś, S21 biblioteka GUS – F8–F12; potem „Później”). Od 25.10.2026 fale puszcza Claude, a Ty scalasz (`docs/AUTOMAT.md` §0).
