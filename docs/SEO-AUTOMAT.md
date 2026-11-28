# SEO – plan automatu i rutyna (v1 · 28.11.2026)

Dla właściciela (czytane z telefonu) i dla sesji Claude. Uzupełnia `docs/SEO.md` (strategia, decyzje D1–D9); tam, gdzie się różnią, obowiązuje ten plik. Zadania: `tasks/W35-S14…S17`.

## 1. Prawda w pięciu zdaniach

1. Technicznie strona jest gotowa: HTML bez JS, 477 adresów w mapie strony, dane strukturalne, mapy SVG, robots.txt, IndexNow, raport tygodniowy.
2. „Samo działa” jeszcze nie działa: mapa strony trafiła do Google dopiero 28.11 (status „Nie udało się pobrać”, 0 stron), a IndexNow **nie wysłał do Binga ani jednego adresu** (workflow nie ma żadnego przebiegu; pierwszy przebieg miał tylko zapisać stan bazowy).
3. 6 stron „zindeksowanych” to adresy zgłoszone ręcznie. To nie infekcja, a Google dopiero zaczął poznawać domenę (mail z 26.11).
4. Google nie ma dozwolonej drogi „zaindeksuj wszystko natychmiast”. Automat może zadbać o to, żeby Google i Bing **zawsze znały aktualną mapę i zmienione adresy** oraz żebyśmy **od razu widzieli problem**. Tempo indeksowania nowej domeny to tygodnie, nie dni.
5. „Na samej górze” na frazy typu „liczba ludności [miasto]” się nie uda (Wikipedia, GUS). Realnie: długi ogon („lesistość gmina X”, „ranking powiatów … bezrobocie 2025”, „mapa … powiaty”), cytowania w odpowiedziach AI i Grafika Google. Obietnic pozycji nikt uczciwy nie składa.

## 2. Jak działa pozycjonowanie w 2026 (pięć warstw)

| Warstwa | Pytanie robota | Nasz stan | Kto pilnuje |
|---|---|---|---|
| 1. Dostęp | Czy mogę pobrać stronę i mapę? | gotowe; **do sprawdzenia: mapa w GSC** | automat (S14, S16) |
| 2. Indeks | Czy strona jest warta zapamiętania? | 396 stron z unikalnymi liczbami; gminy `noindex` do decyzji D7 | automat (S15) + Claude co kwartał |
| 3. Treść | Czy odpowiada na pytanie lepiej niż inni? | liczba, rok, źródło, porównanie, zmiana w czasie; ostrzeżenie: szablon „F2:najniższa” na 37% stron (próg 30%) | Claude (backlog B1) |
| 4. Autorytet | Kto na to linkuje? | prawie zero (domena nowa) – **największa luka** | właściciel, 1 akcja/mies. |
| 5. Doświadczenie | Szybko? Stabilnie? | strony statyczne ≤ 100 KB; Core Web Vitals do odczytu w GSC | automat (raport) |

AI i Bing: Copilot i część wyszukiwania ChatGPT korzystają z indeksu Binga, a odpowiedzi AI cytują strony z czytelnym zdaniem „wartość, rok, źródło”. Mamy to na stronach miejsc i rankingach. Bing wymaga zgłoszenia domeny (zrobione) i przypomnienia o zmianach (IndexNow – naprawia S17). Wyższe pozycje w Bingu zależą, jak w Google, głównie od linków z zewnątrz i wieku domeny.

## 3. Luki znalezione 28.11.2026

| # | Luka | Skutek | Naprawa |
|---|---|---|---|
| 1 | Mapa wysłana ręcznie raz; status „Nie udało się pobrać” | Google nie zna adresów | czekać 24–48 h, potem S14 wysyła mapę po każdym wdrożeniu i pokazuje jej status |
| 2 | IndexNow: 0 przebiegów; pierwszy przebieg wysyła „nic” | Bing nie dostał żadnego adresu | S17: wysyłka pełnej listy na start, harmonogram dobowy jako zapas |
| 3 | Raport GSC sprawdza próbkę 40 adresów, wciąż tych samych | nie widzimy całości (396) | S15: próbka obraca się po całej mapie |
| 4 | Ręcznych działań i problemów z bezpieczeństwem API GSC nie podaje | infekcję zobaczyłbyś dopiero z maila | S16: kontrola treści po każdym wdrożeniu + dobowa kontrola produkcji |
| 5 | Linki z zewnątrz ≈ 0 | brak autorytetu | §5, krok „Co miesiąc” |

## 4. Co robi automat (po wdrożeniu W35)

- **Po każdym wdrożeniu na produkcję:** wysłanie mapy do Google (S14); wysłanie zmienionych adresów do Binga (S17); kontrola treści stron (S16).
- **Co dobę:** kontrola produkcji: `robots.txt` i mapa odpowiadają 200, brak `noindex` na stronach indeksowanych, brak obcych skryptów, ukrytych linków i przekierowań (S16). Problem = zgłoszenie z etykietą `seo-alert`.
- **Co poniedziałek:** raport „SEO – tydzień” z całą rodziną liczb: wyświetlenia, kliknięcia, zapytania, **stan indeksowania obracaną próbką**, status map, czerwone flagi (S15).
- **Po aktualizacji danych GUS:** nowe strony, nowy `lastmod`, mapa i IndexNow idą razem (już działa przez build).

Granica: żaden z nich nie „przyspiesza” Google na siłę. Indexing API jest tylko dla ofert pracy i transmisji na żywo, więc go **nie używamy**.

## 5. Co robisz Ty (mało, ale to ono daje pozycje)

**Jednorazowo (15 min, telefon + komputer):**
1. W Search Console dodaj adres e-mail konta usługi (pole `client_email` z klucza) jako użytkownika z uprawnieniem „Pełny” (Ustawienia → Użytkownicy i uprawnienia). Bez tego S14 nie może wysłać mapy. Klucza nie wklejaj nigdzie.
2. Za 24–48 h otwórz Mapy witryn: jeśli nadal „Nie udało się pobrać”, zrób „Sprawdź na żywo” dla `https://faktografia.eu/sitemap.xml` i prześlij zrzut.
3. Po scaleniu S17 w Actions uruchom ręcznie „SEO – IndexNow” (przycisk Run workflow).

**Co tydzień (5 min):** przeczytaj zgłoszenie „SEO – tydzień”; reaguj tylko na punkt „Co wymaga działania”.

**Co miesiąc (30 min + 1 akcja):**
- sesja Claude: „przeanalizuj raporty SEO z ostatniego miesiąca”;
- jedna akcja z linkami (SEO.md §6): mapa lub ranking z gotowym obrazkiem do lokalnego portalu, nauczycieli geografii, samorządu albo r/Polska; po publikacji danych GUS jedna mapa na kontach Faktografii z linkiem do rankingu. Nie linkujemy z Wikipedii.

## 6. Oś czasu i oczekiwania (uczciwie, duża niepewność)

| Okres | Co normalne |
|---|---|
| Tydzień 1–2 | Google poznaje mapę; indeksuje pojedyncze strony (dziś 6); Bing dostaje adresy z S17 |
| Tydzień 3–6 | rośnie liczba zaindeksowanych (cel ≥ 80% mapy strony); pierwsze wyświetlenia na długi ogon |
| Tydzień 6–8 | decyzja D7: czy włączyć gminy (`indexGminy`) – tylko jeśli „Wykryto, nie zindeksowano” < 50% stron powiatów |
| Miesiąc 3–6 | pierwsze kliknięcia z rankingów i zestawień; wzrost zależy od linków |
| Miesiąc 6–12 | orientacyjnie kilkaset do kilku tysięcy wejść miesięcznie (SEO.md §2) |

## 7. Mierniki i czerwone flagi (z raportu tygodniowego)

Mierniki: strony zaindeksowane / w mapie (cel ≥ 80%), wyświetlenia, kliknięcia, zapytania z ≥ 1 kliknięciem, Core Web Vitals „Dobre”.
Czerwone flagi (sesja Claude): spadek zaindeksowanych > 20% w tydzień; „Wykryto, nie zindeksowano” > 50% po 8 tygodniach; ręczne działanie lub problem z bezpieczeństwem w GSC; zgłoszenie `seo-alert`; błędy 5xx.

## 8. Backlog jakości (do decyzji właściciela, nie startuje samo)

- **B1:** szablon zdania „F2:najniższa” na 37% stron indeksowanych (próg 30%). Poprawka dopisuje warianty zdania w `src/core/seo/sentences.ts`; może wymagać zmiany istniejących testów, więc sesja ma wtedy opisać to w PR i zatrzymać się (AGENTS.md).
- **B2:** magnes na linki: CSV do pobrania, osadzana mapa (`embed`) i PNG mapy ze znakiem (SEO.md, audyt zewnętrzny).
- **B3:** Bing Webmaster API (zgłaszanie adresów i statystyki do raportu) po decyzji o kluczu jako sekrecie `BING_WEBMASTER_API_KEY`.

## 9. Czego nie robić

Teksty z AI na tysiącach stron; strony dla miejscowości i par „gmina A vs B”; kupowanie i wymiana linków, katalogi; sztuczne odświeżanie dat; codzienne ręczne zgłaszanie adresów; Indexing API poza ofertami pracy; klucz konta usługi w czacie lub w repo.

## 10. Lista dnia: 10 adresów dziennie (S18)

**Co robi automat:** co dobę rano wybiera do 10 najważniejszych adresów, które jeszcze nie są odhaczone: najpierw strona główna, potem województwa, powiaty, rankingi i tematy. Gmin, miejscowości i porównań gmin nie wybiera nigdy (zob. §9). Te same adresy od razu wysyła do Binga (IndexNow), a dla Google zakłada przypięte zgłoszenie „SEO – dzień RRRR-MM-DD” z checklistą.

**Co robisz Ty (około 5 minut, wystarczy telefon):**
1. Otwórz przypięte zgłoszenie na GitHubie.
2. Dla każdego adresu: Search Console → Sprawdzanie adresu URL → wklej adres → „Poproś o zindeksowanie”.
3. Po zrobieniu odznacz kratkę przy adresie. Odhaczony adres nie wróci już na żadną listę.

Nie zdążyłeś? Nic się nie dzieje: poprzednie zgłoszenie zamyka się samo, a nieodhaczone adresy wracają na listę następnego dnia. Gdy wszystko jest odhaczone, lista jest pusta i zgłoszenie się nie zakłada. Pierwszy raz uruchom ręcznie w Actions: „SEO – lista dnia” (Run workflow).
