# Q2 – audyt telefonu 390 px (QR02)

Data: 19.11.2026 · commit bazowy 3ed628d · okno 390x844, DPR 2, dotyk (Playwright, chromium z /opt/pw-browsers, `pnpm build && vite preview`).
Zrzuty nie są w repozytorium (opis słowami niżej). Dane biblioteki z `tests/fixtures/library` (sieć niedostępna), więc liczby w wierszach porównania z biblioteki to „Brak wspólnych danych” – patrz „Ograniczenia”.
Skrypt sprawdzający na każdym ekranie: szerokość dokumentu vs okno, elementy poza oknem, klikalne < 44x44 px, teksty ucięte (scrollWidth > clientWidth).

## Ustalenia
Przewijania poziomego strony nie ma nigdzie (scrollWidth = 390 na wszystkich 9 sprawdzonych ekranach). Pola dotykowe < 44 px: brak (poza ukrytym odnośnikiem „Przejdź do treści”, 2x2 px, widoczny dopiero na fokusie). Usterki:

1. **Okno udostępniania – nazwa bieżącej strony w pasku stron jest niewidoczna.** Kafelek aktywnej strony ma kolor tekstu i tła ten sam (rgb(21,35,63)): klasa `text-tusz` z `BTN` wygrywa z `text-kalka`. Na zrzucie to ciemny prostokąt bez napisu, a użytkownik nie wie, którą stronę zestawu edytuje. Poważna.
2. **Okno udostępniania – menu „+ Dodaj stronę” otwiera się pod oknem.** Po kliknięciu menu jest w DOM (x 102–390, y 483–604, opacity 1), ale `elementFromPoint` w jego środku zwraca napis „Karta” z okna, a zrzut nie pokazuje menu. Nie da się dodać strony ani podzielić strony na telefonie. Poważna (funkcja niedostępna).
3. **Okno udostępniania – pasek stron przewija się poziomo już przy jednej stronie.** Kontener ma scrollWidth 376 przy szerokości 366; przycisk „+ Dodaj stronę” jest w tym przewijaniu (prawa krawędź 388 px z 390), przy 2+ stronach zniknie poza polem. Średnia.
4. **Okno udostępniania – dolny pasek akcji zajmuje ok. 25% wysokości** (3 przyciski po 91 px, „Pobierz dane (CSV)” zawija się do 3 linii). Podgląd i wybór formatu/motywu mieszczą się w ok. 60% ekranu, napis „Motyw” jest przycięty przy dolnym pasku. Niska.
5. **Biblioteka, strona wskaźnika `/biblioteka/<id>` – kafelki statystyk ucinają wartości wielokropkiem** („160 os…”, „110 osoba – …”, „Q2: 130 osoba – 1…”), bo `truncate` jest na liczbach z jednostką. Przy prawdziwych liczbach (miliony) uciętych będzie więcej; użytkownik nie zobaczy zakresu min–max. Średnia.
6. **Biblioteka – lista podpowiedzi wyszukiwarki zasłania przycisk „Filtry”** (po wejściu z `?q=` lista pozostaje otwarta, przycisk jest pod nią; kliknięcie trafia w wynik). To zachowanie listy rozwijanej, ale nie zamyka się przy przewijaniu. Niska.
7. Biblioteka (kafelki działów, wyszukiwarka, wyniki, filtry) oraz strona Porównaj (pola A/B, ⇄, „×”, gotowe porównania, mapki, chipy wskaźników z „×”, „+ Dodaj wskaźnik”) i zakładka Porównaj w profilu: **bez usterek** na 390 px (pola ≥ 44 px, napisy w polach, brak przewijania poziomego). Gotowe porównania: dwa przyciski w jednym wierszu, reszta w osobnych – tylko kosmetyka.
8. Poza zakresem, zauważone: pasek wskaźnika w widoku mapy ucina nazwę „Gęstość zaludnienia (os./km²)” wielokropkiem (238 > 189 px).

## Dowody
- Brak przewijania: skrypt, `document.documentElement.scrollWidth` = 390 dla `/biblioteka`, `/biblioteka?q=…`, `/biblioteka/101`, `/porownaj`, `/porownaj?c=14,12`, `/?u=12&sheet=full&c=12,24` (profil, zakładka Porównaj, okno udostępniania).
- Pola < 44 px: skrypt po `a,button,input,select,[role=tab]…`; wynik pusty (poza ukrytym `a.sr-only`).
- Ust. 1: `src/view/share/DeckStrip.tsx:59` (`BTN` + `bg-tusz text-kalka`); pomiar `getComputedStyle(kafelek)`: color = backgroundColor = rgb(21, 35, 63).
- Ust. 2: `src/view/share/AddPageMenu.tsx:85`, `src/components/ui/popover.tsx:36` (`z-50`), `src/view/share/ShareDialog.tsx:208` (`fixed inset-0 z-50`, okno w nakładce arkusza); `document.elementFromPoint(left+100, top+30)` menu → `<span>Karta</span>`; kolejność w `body`: arkusze `react-modal-sheet`, potem wrapper popovera.
- Ust. 3: `DeckStrip.tsx:136` (`overflow-x-auto`); pomiar scrollWidth 376 / clientWidth 366; przycisk „Dodaj stronę” left 246, right 388.
- Ust. 4: `ShareDialog.tsx:278–323` (stopka `sticky bottom-0`, przyciski `flex-1`); pomiar: „Pobierz obraz” 115x91, „Pobierz dane (CSV)” 117x91.
- Ust. 5: `src/view/library/VariableStatsBar.tsx:99,114,166–178` (`truncate`); pomiar: `160 osoba` scrollWidth 176 > 147, „110 osoba – 210 osoba” 226 > 147.
- Ust. 6: kliknięcie `[data-testid=library-filters-mobile-toggle]` (y 640–684) przechwycone przez `span.line-clamp-2` z wyniku (Playwright: „intercepts pointer events”).

## Ograniczenia
- Dane biblioteki z fixture: wiersze porównania z biblioteki pokazały „Brak wspólnych danych” (fixture ma kody gmin, para to województwa). Układ chipów z „×” sprawdzony, układ wierszy z wartościami z biblioteki – nie. Wiersze profilu (z „×”) na zakładce Porównaj w profilu: bez usterek.
- Mapa WebGL w SwiftShader zgłasza „No actors found”; nie wpływa na sprawdzane ekrany.

## Rekomendacja
Naprawić ust. 1, 2 i 3 jednym zadaniem w plikach okna udostępniania (to jedyne usterki blokujące funkcję), ust. 5 osobnym małym zadaniem w bibliotece. Ust. 4 i 6 odłożyć (kosmetyka, bez wpływu na działanie). Nie ruszać Biblioteki (kafelki) ani Porównaj – na 390 px są poprawne.

## Proponowane zadania
1. **QR02a – pasek stron i menu „Dodaj stronę” w oknie udostępniania**
   - Zmieniaj: `src/view/share/DeckStrip.tsx`, `src/view/share/AddPageMenu.tsx`, nowy `tests/e2e/qr02a-share-strip-390.spec.ts`
   - Cel: napis aktywnego kafelka widoczny (kontrast tekst/tło ≥ 4,5:1 z tokenów); menu „Dodaj stronę” widoczne nad oknem i klikalne; pasek stron zawija się lub przycisk „+ Dodaj stronę” jest stale widoczny poza przewijaniem.
   - Gotowe, gdy: test @S19 na 390x844 sprawdza (a) kolor tekstu aktywnego kafelka ≠ kolor tła, (b) po kliknięciu „Dodaj stronę” `elementFromPoint` w środku menu zwraca element menu i da się wybrać pozycję (liczba kafelków rośnie o 1), (c) przy 3 stronach przycisk „Dodaj stronę” mieści się w oknie (right ≤ 390) bez przewijania poziomego strony; `pnpm lint && pnpm typecheck && pnpm test` zielone.
2. **QR02b – kafelki statystyk strony wskaźnika bez ucinania wartości**
   - Zmieniaj: `src/view/library/VariableStatsBar.tsx`, nowy `tests/e2e/qr02b-library-stats-390.spec.ts`
   - Cel: na 390 px mediana, min–max i klasy kwantylowe są w całości widoczne (zawijanie zamiast `truncate`).
   - Gotowe, gdy: test @S21 na 390x844 na fixture `variable-60614.json` sprawdza, że żaden element kafelków statystyk nie ma scrollWidth > clientWidth i brak przewijania poziomego strony; `pnpm lint && pnpm typecheck && pnpm test` zielone.
