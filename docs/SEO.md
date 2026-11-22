# SEO – strategia, wdrożenie, utrzymanie (v1 · 22.11.2026)

Dokument dla właściciela i dla sesji Claude. Zadania wdrożeniowe: `tasks/poczekalnia/W25-S*.md` (start fali = decyzja właściciela, docs/FALE.md).

## 1. Diagnoza (stan na 22.11.2026, z kodu)

| # | Problem | Skutek | Waga |
|---|---|---|---|
| 1 | Strona jest w całości rysowana w przeglądarce. `index.html` ma tylko `<title>Faktografia</title>` i pusty `<div id="root">`. | Google widzi treść dopiero po drugim przejściu (renderowanie JS, z opóźnieniem). Bing, ChatGPT, Perplexity, Claude i inne roboty AI w większości **nie wykonują JS** – widzą pustą stronę. | krytyczna |
| 2 | Wszystkie miejsca żyją w parametrach `/mapa?u=…&i=…`. | Dla wyszukiwarki to **jedna strona** (`/mapa`). 2875 jednostek z danymi = 0 stron do zaindeksowania. | krytyczna |
| 3 | Brak `robots.txt` i `sitemap.xml`; reguła w `vercel.json` kieruje każdy adres na `index.html`. | Każdy błędny adres odpowiada kodem 200 („miękkie 404”), `robots.txt` zwraca stronę HTML. | wysoka |
| 4 | Brak opisu (`meta description`), obrazka do udostępnień (`og:image`), adresu kanonicznego i danych strukturalnych w HTML startowym. | Słabe wyniki w Google, brzydkie podglądy linków w Messengerze/Facebooku/X. | średnia |
| 5 | Karty do udostępniania drukują adres **faktografia.pl** (`src/core/share/card.ts`, `ShareDialog.tsx`) – tej domeny nie mamy (zajęta przez kogoś innego). | Ruch i linki z udostępnionych kart trafiają na cudzą stronę. | wysoka – naprawa w S13 |
| 6 | Strony techniczne (`/__test/*`, `/design`) są publiczne. | Śmieci w indeksie. | niska |

Wniosek: dziś strona może pojawiać się w Google praktycznie tylko na zapytanie „Faktografia”. Wszystko poniżej to budowa od zera, nie „optymalizacja”.

## 2. Rynek i konkurencja (zimna ocena)

- Google ma w Polsce ok. 95 % wyszukiwań. **Przegląd od AI** działa w Polsce od 26.03.2025, **Tryb AI** od jesieni 2025. Pytania typu „ile mieszkańców ma X” są w dużej części odpowiadane bez kliknięcia.
- Na zapytania „[miasto] liczba ludności”, „[gmina] statystyki” wygrywają: Wikipedia, GUS (stat.gov.pl, BDL, „Polska w liczbach”), polskawliczbach.pl, strony urzędów, portale regionalne. Mają lata historii i tysiące linków. **Na te zapytania główne realnie nie wygramy w 2026–2027.**
- Gdzie jest realna szansa (słabsza konkurencja, nasze dane są lepsze):
  1. **Wskaźnik × miejsce, długi ogon:** „lesistość gmina Wieliczka”, „mediana wieku powiat krośnieński”, „saldo migracji gmina X 2025”, „ile mieszkań oddano w gminie X”. Tysiące małych zapytań, często bez dobrej odpowiedzi.
  2. **Zmiana w czasie:** „jak zmieniała się liczba ludności w gminie X” – mamy serie 1995–2025, konkurencja zwykle pokazuje jeden rok.
  3. **Rankingi:** „najbardziej zalesione gminy”, „powiaty z najniższym bezrobociem 2025”, „ranking gmin małopolska dochody na mieszkańca”.
  4. **Mapy (Grafika Google):** „mapa bezrobocia powiaty 2025”, „mapa gęstości zaludnienia Polski”.
  5. **Cytowania w odpowiedziach AI** (Google, ChatGPT, Perplexity): wymagają czytelnego HTML z liczbą, rokiem i źródłem w jednym zdaniu.
- Ryzyko: Google od 2024 r. karze „masowo tworzone treści” (scaled content abuse); aktualizacje w marcu, sierpniu i wrześniu 2026 r. mocno uderzyły w strony generowane z szablonu bez wartości (zwłaszcza strony „na każdą miejscowość”). **Nasza obrona: każda strona ma unikalne, prawdziwe liczby i porównania, zero tekstu z AI, strony bez danych mają `noindex`, wdrażamy partiami.**

Szacunek (orientacyjny, duża niepewność): po pełnym wdrożeniu i 6–12 miesiącach – od kilkuset do kilku tysięcy wejść z wyszukiwarki miesięcznie. Kluczowy czynnik, którego kod nie załatwi: **linki z innych stron** (§6).

## 3. Decyzje (do potwierdzenia przez właściciela; domyślnie obowiązują)

| # | Decyzja | Domyślnie | Dlaczego |
|---|---|---|---|
| D1 | Domena główna | **faktografia.eu – potwierdzone przez właściciela 22.11.2026** (`.pl` zajęta przez kogoś innego); `www` → przekierowanie 301 | jeden adres = jedna siła strony. Nigdzie (kod, karty, materiały) nie podajemy `faktografia.pl`. |
| D2 | Adresy miejsc | `/wojewodztwo/<nazwa>`, `/powiat/<nazwa>`, `/gmina/<nazwa>` (polskie litery → ASCII); przy powtórzeniu nazwy dopisek rodzaju (`-miasto`, `-gmina-wiejska`) i powiatu | czytelne, stałe; 226 nazw gmin i 10 nazw powiatów się powtarza |
| D3 | Strony miejscowości (54 tys.) | **nie robimy** | brak własnych danych = dokładnie typ stron karany od 2024 r. Nazwy miejscowości wypisujemy na stronie gminy. |
| D4 | Strony miejsc są statyczne (HTML generowany przy budowie), lekkie, bez mapy WebGL; przycisk „Otwórz na mapie” → `/mapa?u=…` | tak | szybkość, czytelność dla robotów AI, brak zmian w ekranach mapy |
| D5 | Roboty AI (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended) | **wpuszczamy** | projekt niekomercyjny, dane CC BY; cytowanie w AI to zasięg |
| D6 | `/mapa?u=…` | adres kanoniczny = strona miejsca | parametry nie tworzą duplikatów |
| D7 | Kolejność | woj. + powiaty + rankingi (≈ 460 stron) → 4–6 tygodni obserwacji w Search Console → gminy (2479) | bezpieczne tempo, wczesne wykrycie problemów |
| D8 | Tekst na stronach | wyłącznie stałe szablony zdań + liczby z `public/data`; **zero tekstu z AI** | zgodne z AGENTS.md i z polityką Google |
| D9 | Stopka | 7. link „Miejsca” → `/miejsca` (spis województw, powiatów, rankingów); PRODUKT §3.1 mówi „ok. 6” | bez tego strony miejsc nie mają linków z całego serwisu |

## 4. Plan wdrożenia (fale)

**Fala S-1 – fundament (bezpieczne, 1–2 dni pracy agentów): S01–S04 + S13**
- S01 `robots.txt`, podstawowe meta w `index.html` (opis, `og:*`, `lang`, `theme-color`), statyczna mapa strony dla 4 stron.
- S02 `vercel.json`: prawdziwe 404, `noindex` dla `/__test/*` i `/design`.
- S13 karty do udostępniania: adres `faktografia.eu` zamiast `faktografia.pl`.
- S03 `PageMeta`: `og:image`, `og:url`, `og:locale`, karta X, kanoniczny adres na każdej stronie; obrazek 1200×630 z logo.
- S04 dane strukturalne: `Organization` + `WebSite` (strona startowa), `Dataset` (strona „Skąd są dane”).

**Fala S-2 – strony miejsc (główny silnik):**
- S05 logika adresów (slug) – czysta funkcja + testy kolizji.
- S06 model strony miejsca: tytuł, opis, H1, 20 wskaźników (wartość, rok, miejsce w kraju i województwie, zmiana w 5 i 10 lat), linki (wyżej, niżej, sąsiedzi w rankingu), flaga „indeksuj”.
- S07 generator HTML przy budowie (`scripts/seo/`), mapa strony z `lastmod` = data danych, dane strukturalne `Place` + `BreadcrumbList`.
- S08 strażnik jakości w CI: unikalne tytuły i opisy, jeden H1, kanoniczny adres, brak martwych linków, budżet wagi strony, mapa strony = strony indeksowane.
- S09 linki wewnętrzne: profil na mapie → „Strona miejsca”, stopka → 16 województw, `/mapa?u=` → kanoniczny adres strony miejsca.

**Fala S-3 – rankingi:** S10 `/ranking/<wskaźnik>/<poziom>` (60 stron) i `/ranking/<wskaźnik>/gminy/<województwo>` (320 stron).

**Fala S-4 – automatyzacja:** S11 IndexNow (Bing i wyszukiwarki partnerskie, po zmianie danych – tylko zmienione adresy). S12 tygodniowy raport z Search Console jako zgłoszenie (Issue) na GitHubie.

Gminy włączamy do mapy strony dopiero po sprawdzeniu fali S-2 na powiatach (D7) – przełącznik w generatorze, nie osobny kod.

## 5. Automatyzacja – co tak, co nie

Tak (nie szkodzi zasięgom):
- Strony i mapa strony odtwarzane przy każdej aktualizacji danych przez robota GUS; `lastmod` zmienia się **tylko** przy realnej zmianie liczb.
- IndexNow po wdrożeniu: tylko adresy, które się zmieniły.
- Strażnik jakości w CI blokuje PR, który psuje tytuły, linki, kanoniczne adresy lub dodaje strony bez danych do indeksu.
- Tygodniowy raport z Search Console (spadki, błędy indeksowania, nowe zapytania).

Nie (szkodzi albo nic nie daje):
- Teksty pisane przez AI na tysiącach stron; „artykuły” generowane automatycznie.
- Strony dla każdej miejscowości lub każdej pary „gmina A vs gmina B” (2479² kombinacji).
- Sztuczne odświeżanie dat, ręczne zgłaszanie adresów w Google co dzień, kupowanie linków, katalogi stron, wymiana linków.
- `llms.txt` i podobne pliki „dla AI” – brak dowodów działania; pomijamy.

## 6. Linki z zewnątrz (tylko właściciel; największa dźwignia)

Raz w miesiącu jedno z poniższych:
- Lokalne media i portale („mapa: gdzie w województwie X jest najstarsza ludność”) – gotowy obrazek mapy + link do rankingu.
- Nauczyciele geografii i WOS (grupy na Facebooku, platformy edukacyjne) – mapy jako materiał do lekcji, licencja CC BY.
- Samorządy i lokalne stowarzyszenia – link do strony ich gminy.
- Reddit r/Polska, Wykop – tylko gdy mapa jest naprawdę ciekawa; jeden wpis, bez powtarzania.
- Wikipedia – **nie dodajemy** linków do własnej strony (zakaz autopromocji, ryzyko bana domeny).
- Po każdej publikacji danych GUS (np. bezrobocie, ludność): jedna mapa na kontach Faktografii z linkiem do rankingu.

## 7. Narzędzia do podpięcia (właściciel)

Stan 22.11.2026 (zgłoszone przez właściciela): Search Console, Bing Webmaster Tools, przekierowanie `www` w Vercel i sekret `GSC_SERVICE_ACCOUNT` – **zrobione**. Pozostaje opcjonalnie Ahrefs Webmaster Tools.

| Narzędzie | Koszt | Po co | Kiedy |
|---|---|---|---|
| **Google Search Console** – usługa typu „Domena” (weryfikacja wpisem TXT w DNS u rejestratora) | 0 zł | jedyne wiarygodne źródło: co Google indeksuje, na jakie zapytania pokazuje, błędy | **teraz** |
| **Bing Webmaster Tools** – import z Search Console | 0 zł | Bing zasila m.in. Copilota i częściowo wyszukiwanie ChatGPT; IndexNow | po GSC |
| Konto usługi Google Cloud z dostępem „tylko odczyt” do Search Console, klucz jako sekret repozytorium `GSC_SERVICE_ACCOUNT` | 0 zł | tygodniowy raport (S12) | przed falą S-4 |
| Ahrefs Webmaster Tools | 0 zł (dla zweryfikowanej strony) | kto do nas linkuje, audyt techniczny | opcjonalnie, po 2–3 miesiącach |
| PostHog (już jest) | – | zachowanie po wejściu; liczy tylko osoby ze zgodą, więc zaniża ruch – **liczby ruchu bierzemy z Search Console** | – |

Klucza konta usługi nigdy nie wklejasz do czatu ani do repo – tylko jako sekret w ustawieniach repozytorium GitHub.

## 8. Rutyna utrzymania

| Kiedy | Kto | Co (czas) |
|---|---|---|
| Co tydzień | właściciel | przeczytać zgłoszenie „SEO – tydzień” na GitHubie; działać tylko przy czerwonym punkcie (5 min, telefon) |
| Co miesiąc | właściciel + Claude | sesja: „przeanalizuj raporty SEO z ostatniego miesiąca” → Claude wypisuje 1–3 poprawki jako zadania (30 min) |
| Co miesiąc | właściciel | jedna akcja z §6 (linki) |
| Po aktualizacji danych GUS | automat | nowe strony, mapa strony, IndexNow; właściciel: jeden wpis z mapą na kontach Faktografii |
| Co kwartał | Claude | audyt: Search Console (strony „Wykryto, nie zindeksowano”), konkurencja na 20 wybranych zapytań, decyzja o kolejnych typach stron |

Mierniki (Search Console, co miesiąc): liczba stron zaindeksowanych / w mapie strony (cel ≥ 80 %), wyświetlenia, kliknięcia, liczba zapytań z ≥ 1 kliknięciem, Core Web Vitals = „Dobre”.

Czerwone flagi (wymagają sesji Claude): spadek zaindeksowanych stron > 20 % w tydzień; „Wykryto – obecnie nie zindeksowano” > 50 % stron gmin po 8 tygodniach (sygnał słabej jakości – nie dokładamy stron, poprawiamy istniejące); ręczne działanie w Search Console; błędy 5xx.
