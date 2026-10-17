# Makiety (CC1.5)

Wzorzec wyglądu dla zadań z UI. Warunek „zgodne z makietą” w zgłoszeniu odnosi się do tych plików.
Źródło do edycji: płótno „Faktografia Atlas – makiety” w Claude Design (właściciel). PNG w 2× (2880 px szerokości dla komputera).

| Plik | Ekran | Używa |
|---|---|---|
| 01-start-komputer.png | ekran startowy, 1440×900 | CC2.5 |
| 02-mapa-komputer.png | mapa z kartogramem, panel wskaźnika, legenda, dymek | CC4.x, CC8.x |
| 03-profil-komputer.png | profil miejsca w arkuszu po prawej (440 px) | CC7.2, CC7.4 |
| 04-profil-telefon.png | profil miejsca w dolnym arkuszu (40% wysokości), 390×844 | CC7.3 |
| 05-mapa-ciemna.png | mapa w trybie ciemnym | wszystkie zadania z UI |

Zasady czytania makiet:
- Kolory, kroje i odstępy są z `config/tokens.json` i docs/STYL.md. Gdy makieta i STYL.md się różnią, wygrywa STYL.md – zgłoś różnicę w PR.
- Liczby na makietach (gęstość zaludnienia województw, 2022) są prawdziwe: nagrana odpowiedź API GUS, zmienna 60559 (`tests/fixtures/bdl/data-by-variable.json`). Na stronie liczby zawsze pochodzą z `public/data`, nigdy z makiety.
- Nazwy wskaźników na przyciskach (Ludność, Bezrobocie, Wynagrodzenia) są tylko przykładem; lista powstaje w CC6.3.
- Mapa na makietach to statyczny rysunek z `public/geo/admin.topo.json`. W aplikacji rysuje ją MapLibre + deck.gl (CC4.1), wygląd ma być ten sam.
- Na ekranie najwyżej jedno ręczne zakreślenie (STYL.md §7); czerwony obrys wybranej jednostki na mapie się do tego nie liczy.
