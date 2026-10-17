# STYL — Faktografia „Kalka i korekta”

Wersja 1, 17.10.2026. Ten plik zastępuje dawną sekcję designu („Rocznik, który ożył”) w docs/MASTER_PLAN.md.
Wartości liczbowe (kolory, rozmiary, czasy) są w `config/tokens.json`. W kodzie używaj wyłącznie tokenów,
nigdy wpisanych na sztywno kolorów ani rozmiarów.

---

## 1. Idea

Strona wygląda jak **kalka kreślarska położona na mapie Polski**. Granice i dane rysujemy granatowym
tuszem. Jedyny inny kolor to **czerwony długopis korektora**: zakreśla to, co najważniejsze, tak jak
czerwona kreska i przesunięta kopia litery F w znaku.

Faktografia sprawdza fakty, więc jej językiem jest korekta: dane są czyste i spokojne, a uwagę kieruje
ręczny, lekko nierówny znak czerwonym. Ta nierówność jest celowa.

## 2. Kolory

| Token | Jasny | Ciemny | Do czego |
|---|---|---|---|
| kalka | #EEF1EF | #0F1A30 | tło strony |
| arkusz | #F8FAF9 | #16233D | panele nałożone na mapę, pola formularzy |
| linia | #C5CDD3 | #2A3A5C | ramki i podziały, zawsze 1 px |
| tusz | #15233F | #E7ECF3 | tekst, granice, przyciski główne (kontrast 13,7:1) |
| olowek | #4D5B72 | #A9B6CA | tekst drugiego planu (6:1) |
| korekta | #E3242B | #FF5A5F | ręczne zakreślenia, aktywna zakładka, wybrane miejsce na mapie |
| korektaTekst | #B8141C | #FF7A7E | drobny tekst w kolorze korekty (wymaga 4,5:1) |
| ochra | #C77700 | #F0A33A | tylko ujemna strona skali dywergentnej |
| ochraTekst | #8F5600 | #F0A33A | drobny tekst w ochrze |

Zasady:
- Tło to chłodna biel `kalka`, nigdy kremowy ani beżowy papier.
- Tusz to granat, nie czerń. Nie używaj #000 ani #111.
- Czerwony (`korekta`) jest rzadki: **najwyżej jedna rzecz na ekranie** jest zakreślona. Wyjątek: aktywna zakładka i wybrana jednostka na mapie.
- Czerwony nie oznacza „źle”. Oznacza „patrz tutaj”.

### Kolory danych

- **Skala sekwencyjna** (więcej/mniej): 5 klas granatu z `data.sequential`. Jasne = mniej, tusz = więcej.
- **Skala dywergentna** (powyżej/poniżej średniej): ochra ↔ arkusz ↔ granat z `data.diverging`. Para ochra–granat jest czytelna przy daltonizmie.
- **Brak danych:** kolor `arkusz` z kropkowaniem w kolorze `linia` i osobną pozycją w legendzie.
- **Wybrana jednostka:** obrys 2,5 px w kolorze `korekta` (nie zmieniamy jej wypełnienia).
- Kolor nigdy nie jest jedynym nośnikiem informacji: wartość zawsze też liczbą, a w kartogramie można dodać kreskowanie jako drugi kanał (deck.gl FillStyleExtension).

## 3. Typografia

- **Krój główny: Atkinson Hyperlegible Next** (`@fontsource/atkinson-hyperlegible-next`, OFL).
  Zaprojektowany przez Braille Institute dla czytelności, także dla osób słabowidzących. Rozróżnia
  znaki łatwe do pomylenia w liczbach (1, l, I oraz 0 i O).
- **Liczby w kolumnach: Atkinson Hyperlegible Mono** (`@fontsource/atkinson-hyperlegible-mono`).
  Tylko w tabelach, rankingach i kodach TERYT, gdzie liczby muszą się równać. Nigdy jako ozdobny podpis.
- **Jedynym krojem szeryfowym w całej marce jest litera F w znaku.** Żadnych nagłówków szeryfowych.
- Fonty ładowane lokalnie (self-hosting przez @fontsource), zero zapytań do Google Fonts.

Skala (stosunek 1,25): 13, 17, 20, 25, 31, 39, 49, 61, 76 px.

| Rola | Rozmiar | Waga | Interlinia | Uwagi |
|---|---|---|---|---|
| Tytuł strony | 61–76 | 800 | 1,05 | tracking −0,02em |
| Nagłówek sekcji | 31–39 | 700 | 1,15 | |
| Podtytuł | 20–25 | 500 | 1,3 | |
| Tekst | 17 | 400 | 1,6 | max 70 znaków w linii |
| Drobny tekst, źródła | 13 | 400 | 1,5 | kolor `olowek` |
| Duża liczba w panelu | 49 | 800 | 1,0 | tabular-nums |

Zakazy typograficzne: wersaliki w etykietach, napisy nad nagłówkami („eyebrow”), kropki między
metadanymi (A · B · C), strzałki doklejane do linków i przycisków, wyróżnianie jednego słowa
w nagłówku kolorem lub kursywą.

## 4. Logo

Pliki w `public/brand/`, wszystkie bez tła, tekst zamieniony na krzywe (nie zależy od fontów):

| Plik | Gdzie |
|---|---|
| faktografia-logo-granat.svg | nagłówek strony w trybie jasnym, slajdy jasne |
| faktografia-logo-jasne.svg | nagłówek w trybie ciemnym, slajdy ciemne |
| faktografia-favicon.svg | ikonka karty przeglądarki, rozmiary poniżej 48 px |
| faktografia-znak-granat.svg | duży znak (F na zarysach granic) na jasnym tle: strona „o projekcie”, ekran ładowania |
| faktografia-znak-jasny.svg | duży znak na ciemnym tle: avatar IG/TikTok, okładki karuzel |

Zasady:
- Logo w nagłówku: wysokość 28–32 px na telefonie, 36–40 px na komputerze.
- Pole ochronne: wokół logo wolne miejsce co najmniej wysokości litery F.
- Duży znak z zarysami granic nie schodzi poniżej 120 px (granice znikają). Poniżej używaj favicony.
- Nie zmieniaj kolorów, proporcji ani kąta F. Nie dodawaj cieni ani obrysów.

## 5. Układ

- **Mapa na całą szerokość** jako tło aplikacji. Wszystko inne to **arkusze** nałożone na mapę.
- Arkusz: tło `arkusz`, ramka 1 px `linia`, promień 0, **bez cieni**. Na mapie może mieć krycie 96%, ale bez rozmycia.
- Siatka 4 px. Odstępy tylko ze skali `space`. Między sekcjami 48–64 px, w panelu 16–24 px.
- Na komputerze arkusz z profilem miejsca po prawej (szerokość 400–440 px). Na telefonie dolny arkusz (40% / 90% wysokości).
- Wyrównanie do lewej. Wyśrodkowanie tylko dla pojedynczych komunikatów (pusta lista, błąd).
- Nie tniemy treści na identyczne karty. Hierarchię budują rozmiar tekstu i odstępy, nie pudełka.
- Pola dotykowe min. 44 × 44 px.

## 6. Mapa

- **Bez podkładu z ulicami i miastami.** Mapa to sama kalka z granicami jednostek (TopoJSON z repo).
  Podkład OpenFreeMap tylko gdy przybliżenie pokazuje pojedynczą gminę, wtedy bardzo blady (krycie 25%, bez etykiet POI).
- Granice: szczelina 1–1,5 px w kolorze `arkusz` między regionami, nie czarna linia.
- Kontur kraju: 1,5 px `tusz`.
- Kartogram: skala z `data.sequential` lub `data.diverging`, 5 klas kwantylowych.
- Wybrane miejsce: obrys w kolorze `korekta` + ręczne zakreślenie (sekcja 7).
- Tryb 3D „arkusze”: jednostki unoszą się jak warstwy kalki, matowe, bez poświat.

## 7. Korekta: ręczne znaki

- Biblioteka **rough-notation** (MIT). Każde zakreślenie jest trochę inne, jak prawdziwy długopis.
- Ustawienia z `annotation` w tokenach: kolor `korekta`, grubość 2,5, 2 przebiegi, animacja 600 ms.
- Typy: kółko (najważniejsza liczba), podkreślenie (kluczowe zdanie), nawias (grupa wierszy), ramka (wybrany wiersz rankingu).
- **Najwyżej jedno zakreślenie na ekranie.** Nowe zakreślenie usuwa poprzednie.
- Na mapie zakreślenie wybranej jednostki rysujemy jako owal SVG wokół jej obrysu (rough.js), w tym samym stylu.

## 8. Ruch: kreślenie

- Jedna scena na wejście (raz na sesję): kontur Polski rysuje się tuszem w 1,2 s (animacja `stroke-dashoffset`
  na nakładce SVG), potem regiony wypełniają się kolorem (300 ms), na koniec długopis zakreśla wybrane miejsce.
- Potem ruch tylko odpowiada na działania: zmiana wskaźnika lub roku przelewa kolory w 300 ms,
  lot kamery do jednostki 800 ms, arkusz wysuwa się w 300 ms.
- Krzywa: `cubic-bezier(0.2, 0, 0, 1)`. Żadnych sprężyn, odbić ani animacji wjazdu każdego elementu.
- `prefers-reduced-motion`: wszystko pojawia się od razu, zakreślenia bez animacji.

## 9. Ikony

- **Iconoir** (`iconoir-react`, MIT), linia 1,5 px, rozmiar 20 px. Wygląd rysunku technicznego.
- Ikona zawsze z tekstem albo z `aria-label`. Żadnych emoji.

## 10. Wykresy

- Observable Plot, styl z tokenów: osie i siatka w kolorze `linia`, tekst `olowek`, dane `tusz`.
- Podpis bezpośrednio przy linii lub słupku zamiast legendy, gdy to możliwe.
- Wyróżniona seria lub słupek w kolorze `korekta`, reszta w odcieniach granatu.
- Pod każdym wykresem źródło: „Źródło: GUS, Bank Danych Lokalnych, <rok>”.

## 11. Teksty w interfejsie

- Zdania pisane normalnie, wielka litera tylko na początku.
- Przyciski mówią, co się stanie: „Porównaj z innym miejscem”, nie „Dalej”.
- Puste stany mówią, co zrobić: „Wpisz nazwę gminy albo kliknij mapę”.
- Błędy mówią, co się stało i jak to naprawić, bez przepraszania.
- Liczba zawsze z jednostką, rokiem i poziomem: „dane dla powiatu tatrzańskiego, 2024”.

## 12. Nie robimy (lista kontrolna przed każdym PR)

- [ ] Brak kremowego/beżowego tła, terakoty i szeryfowych nagłówków.
- [ ] Brak gradientów, rozmyć, szkła (glassmorphism), poświat, miękkich cieni.
- [ ] Brak zaokrągleń (radius 0).
- [ ] Brak wersalików w etykietach, „eyebrow” nad nagłówkami, kropek między metadanymi, strzałek przy linkach.
- [ ] Mono tylko w kolumnach liczb.
- [ ] Brak emoji, ikon „sparkles”, haseł marketingowych.
- [ ] Najwyżej jedno czerwone zakreślenie na ekranie.
- [ ] Jedna animacja wejścia, reszta tylko w odpowiedzi na działanie.
- [ ] Kontrast tekstu min. 4,5:1, pola dotykowe min. 44 px, działa z klawiatury.
