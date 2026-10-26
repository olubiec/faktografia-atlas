# Inspiracje i wzorce z cudzych projektów
Rejestr repozytoriów, demo i stron, które wolno **studiować jako wzorzec** przy pisaniu własnego kodu. Uzupełnia `docs/ELEMENTY.md` (tam są rzeczy, które faktycznie wchodzą do projektu: pakiety, dane, zasoby, usługi).

## Zasady
1. **Najpierw pakiet lub usługa** (WORKFLOW §3b); wzorzec z cudzego repozytorium dopiero, gdy gotowego pakietu nie ma albo jest nieadekwatny.
2. **Licencja wzorca:** MIT, BSD, ISC, Apache-2.0, CC0 / domena publiczna. GPL, AGPL, „NC”, brak licencji lub niejasna licencja – **nie** czytamy jako wzorca (opisujemy w PR i zatrzymujemy się).
3. **Bierzemy pomysł i strukturę, kod piszemy własny:** nasze nazwy, nasze tokeny, nasze testy, pliki do ok. 200 linii. Zero wklejania fragmentów.
4. **Wyjątek (poziom E z WORKFLOW §3b):** dłuższy fragment tylko z decyzją właściciela w prompcie, nagłówkiem licencji i autora w pliku oraz wpisem w `ELEMENTY.md` (typ „fragment”) i w tej tabeli.
5. **Wpis przed użyciem:** repozytorium wpisuje Planista po `TRYB: WERYFIKACJA` raportu (istnienie, licencja, data ostatniej aktywności sprawdzone na stronie źródła). Jules korzysta tylko z wpisów o statusie `zweryfikowane`.
6. Strony i produkty bez wolnej licencji służą wyłącznie jako inspiracja wizualna i pomysł na układ; nie przenosimy ich tekstów, grafik ani kodu.
(To zbiór zasad roboczych, nie porada prawna.)

## Rejestr
| Źródło | Link | Licencja | Sprawdzone (data, commit/wydanie) | Co bierzemy (pomysł, struktura, układ) | Dla zadania/sesji | Status |
|---|---|---|---|---|---|---|
| MapLibre GL JS – kamera (`fitBounds`, `flyTo`, `AnimationOptions.essential`) | https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/AnimationOptions | BSD-3-Clause (npm `maplibre-gl` 6.16.0) | 25.10.2026, npm + dokumentacja | `padding` jako obiekt (arkusz), `essential:false` ucina ruch przy reduced-motion | N7 (warunkowe) | zweryfikowane |
| deck.gl – przejścia atrybutów (`transitions`), `DataFilterExtension` | https://deck.gl/docs/developer-guide/animations-and-transitions | MIT (npm `deck.gl` 9.4.0) | 25.10.2026, npm | wzorzec już użyty w W3.3, W3.4 | – | użyte |
| nuqs | https://www.npmjs.com/package/nuqs | MIT (2.10.2, wydanie 2026-10-08) | 25.10.2026, npm | stan filtrów w adresie (adapter react-router); zgodność z RR 8 sprawdza N10 | N10, N11 | zweryfikowane |
| @tanstack/react-virtual | https://www.npmjs.com/package/@tanstack/react-virtual | MIT (3.14.22, wydanie 2026-10-22) | 25.10.2026, npm | wirtualizacja długiej listy wskaźników | N11 | zweryfikowane |
| shadcn/ui blocks | https://ui.shadcn.com/blocks | MIT (npm `shadcn` 4.22.1; plik LICENSE repo do potwierdzenia przez Julesa przed czytaniem kodu) | 25.10.2026, npm | pomysł układu nagłówek–treść–stopka; kod własny | N1 | zweryfikowane |
| World Bank Open Data, Eurostat Data Browser, BDL, dane.gov.pl, Polska w Liczbach | https://data.worldbank.org · https://ec.europa.eu/eurostat/databrowser/ · https://bdl.stat.gov.pl · https://dane.gov.pl | strony, nie kod | – | tylko inspiracja wyglądu i układu (zasada 6); opisy z raportu R4 niezweryfikowane | N11 | do przejrzenia |
| launch-ui, shadcnstore, ChatDeck, Shadcnblocks (szablony) | – | niesprawdzona; npm `launch-ui` nie istnieje | 25.10.2026 | – | – | odrzucone (nie do sprawdzenia / Next.js) |
| modern-cmdk, react-zod-url-state, @turahe/react-rough-notation | npm | MIT | 25.10.2026 | – | – | odrzucone (jeden autor, młode, zysk niepotwierdzony) |
| vite-plugin-sitemap | npm | brak pola licencji | 25.10.2026 | – | – | odrzucone (brak licencji) |
| satori (karty OG) | https://www.npmjs.com/package/satori | MPL-2.0 | 25.10.2026, npm | dopiero przy podstronach gmin | „Później” | do przejrzenia |

Statusy: `do przejrzenia` (z raportu, niezweryfikowane) · `zweryfikowane` (wolno użyć jako wzorca) · `użyte` (jest w kodzie; wskaż plik) · `odrzucone` (powód).
