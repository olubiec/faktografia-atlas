# Plan dalszych prac (dopisane na prośbę właściciela, 16.11)

## 1. Dane z GUS codziennie, od razu na stronie
- Robot w GitHub Actions pobiera dane GUS raz dziennie i zapisuje je do `public/data`.
- Po zapisie dane trafiają na stronę bez ręcznego kroku: automatyczne scalenie zielonego PR (albo zapis wprost na gałąź produkcyjną) i nowe wdrożenie na Vercelu.
- Do ustalenia z właścicielem: czy „baza” = pliki w repozytorium (jak teraz), czy osobna baza.

## 2. Układ strony do pełnej customizacji
- Domyślnie widać tylko kilka podstawowych wskaźników.
- Użytkownik wybiera, które wskaźniki i bloki widzi i w jakiej kolejności; wybór zapamiętany w przeglądarce.
- Karty graficzne do pobrania biorą ten sam wybór (te same wskaźniki, ta sama kolejność).
- Z tym łączą się warianty wielostronicowe kart (1/5, 2/5…) i przycisk „Pobierz wszystkie”.

## 3. Animacje na wszystkich poziomach
- Wejście i wyjście: Polska → województwo → powiat → gmina → miejscowość, w obie strony.
- Pojawianie się i wypełnianie pól (poligonów) po zejściu poziom niżej oraz przy zmianie wskaźnika.
- Tylko gotowe, sprawdzone rozwiązania (deck.gl `transitions` i `FlyToInterpolator`), wszystko z tokenów, wyłączone przy ograniczeniu ruchu.

## 4. Domena faktografia.eu (home.pl + Vercel)
- Rekord A dla domeny głównej i CNAME dla `www` w DNS home.pl; domena dodana w Vercelu.
- Po podpięciu: zmienić `faktografia.pl` w stopce kart na `faktografia.eu`.
