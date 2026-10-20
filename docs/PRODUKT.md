# Produkt: co ma widzieć i robić użytkownik

Wersja 1 · 20.10.2026 · Opus, po pierwszym teście właściciela na komputerze.
Ten plik ma pierwszeństwo przed opisami ekranów w `docs/MASTER_PLAN.md` i w starych promptach. Wygląd: makiety `docs/design/02–05` + `docs/STYL.md`.

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

**Wniosek:** małe zadania z zielonymi testami nie składają się same w dobry produkt. Od teraz: (1) budujemy po ekranie, nie po kawałku; (2) ekran składa i ogląda Sonnet przed scaleniem; (3) szybkość i wygląd mają mierzalne progi; (4) makiety są warunkiem odbioru, nie inspiracją.

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
- Nagłówek: „Województwo małopolskie” (bez powtórzeń typu „powiat powiat”), TERYT.
- Zakładki: **Przegląd** · **Powiaty (22)** / **Gminy (n)** (lista jednostek niższego poziomu z wartością bieżącego wskaźnika) · **Porównaj** (fala 10; do tego czasu zakładka nieaktywna z napisem „wkrótce”).
- **Przegląd** (od góry):
  1. bieżący wskaźnik: nazwa, rok, **duża liczba**, miejsce w rankingu (jedno zakreślenie wg STYL.md §7);
  2. **ranking wszystkich jednostek tego poziomu** w województwie / kraju jako poziome słupki, wybrana jednostka wyróżniona (makieta 03); długie listy: 10 + „pokaż wszystkie”;
  3. **pozostałe wskaźniki** w grupach (Ludność, Praca, Pieniądze, Mieszkania, Środowisko, Życie, Transport), każdy jako wiersz: nazwa, wartość, miejsce. **Klik w wiersz rozwija go:** czytelny wykres lat (oś lat, min/max, wartość po najechaniu), objaśnienie (§6), przycisk **„Pokaż na mapie”** (ustawia ten wskaźnik na mapie i w panelu).
- Na dole: „Kopiuj link”, źródło. „Porównaj z innym miejscem” – fala 10.

## 5. Telefon (< 768 px) – makieta 04

- Mapa na cały ekran pod nagłówkiem (logo + lupa). Na dole pasek **„Gęstość zaludnienia ▾ · 2025”**: dotknięcie wysuwa arkusz z wyborem wskaźnika, poziomem, legendą, rokiem, rankingiem.
- Profil: dolny arkusz na 40% wysokości (przeciągany w górę do pełnej wysokości), treść jak w §4.
- Pola dotykowe ≥ 44 px, brak poziomego przewijania przy 390 px.

## 6. Objaśnienia wskaźników

Dla każdego z 20 wskaźników plik `config/explanations.json`:

| Pole | Treść | Limit |
|---|---|---|
| `short` | definicja prostym językiem („Ilu ludzi mieszka średnio na 1 km² powierzchni.”) | 160 znaków |
| `howToRead` | jak czytać, na co uważać („Miasta zawsze wypadają wyżej niż wsie; porównuj miasta z miastami.”) | 240 znaków |
| `world` | Polska na tle UE/świata, z rokiem i liczbą; **jeśli definicje się różnią (np. bezrobocie rejestrowane vs badanie BAEL), napisać to wprost** | 240 znaków + `source`, `url`, `year` |
| `funFact` | jedna ciekawostka ze świata albo z Polski | 200 znaków + `source`, `url` |
| `definitionUrl` | oficjalna definicja GUS (pojęcia w statystyce publicznej / opis zmiennej BDL) | link |

Zasady: każda liczba i ciekawostka ma źródło z linkiem; research robi Gemini (OPERACJE §7), weryfikuje Sonnet (otwiera każde źródło), **akceptuje właściciel** przed publikacją. Brak wpisu = brak przycisku (?), strona działa dalej.

## 7. Szybkość (progi sprawdzane testem w CI)

| Sytuacja | Próg |
|---|---|
| Kod JavaScript ładowany na wejściu | bez danych w środku: `units.json` i granice doczytywane jako osobne pliki z pamięcią podręczną |
| Dane pobierane na wejściu | granice + lista jednostek + **jeden** plik wskaźnika domyślnego; żadnego `profiles/*` |
| Wybór miejsca | **dokładnie jedno** żądanie danych profilu (`public/data/profiles/<województwo>.json`) |
| Zmiana wskaźnika | jedno żądanie `values/<id>.json` (jeśli nie było w pamięci) |
| Pliki danych | bez wcięć (`JSON.stringify` bez spacji) |
| Odczuwalnie (mierzy Sonnet na nagraniu/w przeglądarce, wpis w PR) | mapa w kolorach ≤ 3 s na zwykłym laptopie; otwarcie profilu bez widocznego zacięcia |

## 8. Definicja „gotowe” dla zadań z UI (dodatkowo do AGENTS.md)

1. Zgodne z makietą (02–05) na 1440×900 i 390×844; różnice wypisane w PR.
2. Działa **na prawdziwych danych** z `public/data` (nie tylko na danych syntetycznych w teście).
3. Sonnet przed scaleniem uruchamia stronę, przechodzi ścieżkę z §3–§5 i dołącza w PR opis z 2 zrzutami (komputer, telefon) obejrzanymi przez siebie.
4. Progi z §7 przechodzą.

## 9. Kolejność (szczegóły i prompty: `docs/FALE.md`)

- **Fala 9 – „działa i wygląda jak makieta”:** szybkość, ekran główny (§3), profil obok mapy z rankingiem i rozwijanymi wskaźnikami (§4), telefon (§5), poprawki błędów, objaśnienia (§6).
- **Fala 10:** porównanie dwóch miejsc (zakładka Porównaj), blady podkład przy dużym zbliżeniu, kreskowanie „brak danych”, tryb ciemny mapy (makieta 05), scena wejścia, statystyki wyszukiwania.
- Później: wersja angielska, karuzele (osobne repo).
