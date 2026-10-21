# Produkt: co ma widzieć i robić użytkownik

> **Co budujemy:** publiczną mapę Polski z danymi GUS dla województw, powiatów i gmin.
> **Dla kogo:** osoba ciekawa swojej okolicy, najczęściej z telefonu (§2).
> **Najważniejsze ekrany:** ekran główny z mapą (§3), profil miejsca (§4), telefon (§5).
> **Jak oceniamy „gotowe”:** właściciel ogląda podgląd Vercel na komputerze i telefonie; progi szybkości §7; definicja „gotowe” §8.
> **Gdzie jesteśmy i co dalej:** `docs/STAN.md`, `docs/PLAN.md`. Wygląd: `docs/STYL.md` + makiety `docs/design/`.

Wersja 2 · 21.10.2026 (v1: 20.10.2026, po pierwszym teście właściciela na komputerze). Zmiany v2: §5 telefon dokładniej (po oglądzie 21.10), §5a wejście w głąb mapy, §6 ścieżka pliku objaśnień, §8–§9 pod proces v5.
Ten plik ma pierwszeństwo przed opisami ekranów w `docs/MASTER_PLAN.md`.

---

## 1. Co poszło źle (test właściciela 20.10, wieczór)

Strona po falach 1–8 przechodziła wszystkie testy, ale jako produkt nie działała:

| Co widzi właściciel | Przyczyna techniczna | Przyczyna w procesie |
|---|---|---|
| Strona zamula i się zacina | Kod mapy (1,1 MB po kompresji) ma wklejone `units.json` i granice; wybór miejsca pobiera naraz 20 plików (14 MB) i przelicza je w przeglądarce | Prompt CC7.2b kazał „wczytać 20 wskaźników równolegle”; nikt nie mierzył szybkości |
| Mapa cała jasna | Kolory tylko z `?i=` w adresie; brak domyślnego wskaźnika i panelu wyboru | Panel (CC8.W) zaplanowany na koniec; nikt nie zdecydował, co widać na wejściu |
| Okno profilu zasłania mapę, elementy nachodzą | Duży nagłówek strony obok mapy, arkusz nałożony na mapę | Makiety 02–04 były, ale żaden prompt nie kazał zbudować ekranu jako całości |
| Krzyżyk w wyszukiwarce nie zamyka | Po zamknięciu fokus wraca do pola na stronie głównej, które przy fokusie znów otwiera okno | Brak testu „zamknij i sprawdź, że zamknięte” na stronie głównej |
| Nie da się zobaczyć wskaźnika jako zestawienia miejsc | Brak rankingu i brak „pokaż na mapie” w profilu | Funkcji nie było w planie, choć jest na makiecie 03 |
| Wykresy nieczytelne, przypisy sklejone („ludności¹³”, „powiatu powiat”) | Brak lat i skali; numery przypisów bez separatora; nazwa jednostki już zawiera „powiat” | Testy sprawdzały obecność, nie czytelność |
| Brak objaśnień wskaźników | — | Nie było w planie |
| „Wałcz” dwa razy w powiecie wałeckim z różną ludnością | To dwie gminy: miejska (miasto) i wiejska (wokół miasta); 143 takie pary w Polsce. Strona pokazuje samą nazwę | Nikt nie sprawdził nazw na prawdziwych danych |

**Wniosek:** małe zadania z zielonymi testami nie składają się same w dobry produkt. Od teraz: (1) budujemy po ekranie, nie po kawałku; (2) ekran ogląda właściciel na podglądzie (komputer i telefon) przed scaleniem; (3) szybkość i wygląd mają mierzalne progi; (4) makiety są warunkiem odbioru, nie inspiracją.

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
- Na dole: „Kopiuj link”, źródło. „Porównaj z innym miejscem” – S18.

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

Dla każdego wskaźnika (opcjonalnie) wpis w pliku `public/data/explanations.json`. Niezależnie od wpisu blok „Na tle kraju” liczy się sam z danych (miejsce, mediana Polski, najmniej–najwięcej; szczegóły: `docs/PLAN.md`, S17).

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
| Pliki danych | bez wcięć (`JSON.stringify` bez spacji) |
| Odczuwalnie (właściciel na podglądzie, także na telefonie) | mapa w kolorach ≤ 3 s na zwykłym laptopie; otwarcie profilu bez widocznego zacięcia |

## 8. Definicja „gotowe” dla zadań z UI (dodatkowo do AGENTS.md)

1. Zgodne z makietą (02–05) na 1440×900 i 390×844; różnice wypisane w PR.
2. Działa **na prawdziwych danych** z `public/data` (nie tylko na danych syntetycznych w teście).
3. Właściciel przed scaleniem ogląda podgląd Vercel na komputerze i telefonie według linijki „Ty sprawdzasz” z `docs/PLAN.md`; Jules w sekcji „Po ludzku” pisze, co sprawdzić.
4. Progi z §7 przechodzą.

## 9. Kolejność

Sesje i ich kolejność: `docs/PLAN.md` (S14 profil, S15 telefon, S16 wejście w głąb, S17 objaśnienia, S18 porównanie, potem „Później”).
