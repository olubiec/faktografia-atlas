CC8.3b – komponent wyboru roku, bez podpinania do mapy

Zadanie: CC8.3b – komponent wyboru roku, bez podpinania do mapy
Wymaga na main: src/view/controls/IndicatorPicker.tsx#IndicatorPicker, src/components/ui/slider.tsx
Kontekst: wybór wskaźnika jest w src/view/controls/IndicatorPicker.tsx (wzór stylu i testów). Suwak bazowy: src/components/ui/slider.tsx. Podpięcie do mapy i ?y= robi CC8.W.
Cel dla użytkownika: brak zmiany na stronie; gotowy komponent.
Zakres (tylko te pliki):

src/view/controls/YearSlider.tsx (nowy): props { years: number[]; value: number; onChange: (year: number) => void }
tests/unit/year-slider.test.tsx (nowy)
docs/sessions/CC8.3b.md

Warunki odbioru:

Suwak przyjmuje tylko lata z years (skoki po latach, nie co 1, gdy brakuje roku); bieżący rok widoczny jako tekst.
Klawiatura: strzałki zmieniają rok, Home/End pierwszy/ostatni; aria-valuetext = rok (test).
Jeden rok w years → sam tekst z rokiem, bez suwaka.
Pole dotykowe uchwytu co najmniej 44 px, tylko tokeny.
NIE zmieniaj /design ani zrzutów wzorcowych.

Poza zakresem: podpięcie (CC8.W).
