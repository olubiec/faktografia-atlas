# Makiety

Wzorzec wyglądu dla zadań z UI. Warunek „zgodne z makietą” w prompcie odnosi się do tych plików.
Źródło do edycji: płótno „Faktografia Atlas – makiety” w Claude Design (właściciel). PNG w 2× (2880 px szerokości dla komputera).

| Plik | Ekran | Sesja |
|---|---|---|
| 01-start-komputer.png | ekran startowy, 1440×900 | – (dziś wejście od razu na mapę) |
| 02-mapa-komputer.png | mapa z kartogramem, panel wskaźnika, legenda, dymek | ekran główny (zrobione), S16 |
| 03-profil-komputer.png | profil miejsca w arkuszu po prawej (440 px) | S14 |
| 04-profil-telefon.png | profil miejsca w dolnym arkuszu (40% wysokości), 390×844 | S15 |
| 05-mapa-ciemna.png | mapa w trybie ciemnym | wszystkie zadania z UI; ciemny podkład mapy – „Później” |

Zasady czytania makiet:
- Kolory, kroje i odstępy są z `config/tokens.json` i docs/STYL.md. Gdy makieta i STYL.md się różnią, wygrywa STYL.md – zgłoś różnicę w PR.
- Liczby na makietach (gęstość zaludnienia województw, 2022) są prawdziwe: nagrana odpowiedź API GUS, zmienna 60559 (`tests/fixtures/bdl/data-by-variable.json`). Na stronie liczby zawsze pochodzą z `public/data`, nigdy z makiety.
- Nazwy wskaźników na przyciskach (Ludność, Bezrobocie, Wynagrodzenia) są tylko przykładem; lista: `config/indicators.json`.
- Mapa na makietach to statyczny rysunek z `public/geo/admin.topo.json`. W aplikacji rysuje ją MapLibre + deck.gl, wygląd ma być ten sam.
- Na ekranie najwyżej jedno ręczne zakreślenie (STYL.md §7); czerwony obrys wybranej jednostki na mapie się do tego nie liczy.
