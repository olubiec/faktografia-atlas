# Stan – 27.10.2026 (po południu)

## Co działa (po ludzku; „sprawdzone przez właściciela: tak/nie”)
Na podstawie kodu na main (po F9, commit c70c84f; `pnpm test` zielony na ostatnim sprawdzeniu 26.10: 93 pliki, 620 testów; po F9 dochodzą nowe pliki). **Właściciel obejrzał K1–K5 na podglądzie 25.10.2026 i zaakceptował; ma uwagi do poprawek (lista przyjdzie osobno, zostaną rozbite na małe zadania).**
- Mapa województw, powiatów i gmin z przechodzeniem w głąb (płynna kamera, kafelki po kolei, przelewanie kolorów), okruszkami i stanem w adresie (`?u=`, `?i=`, `?y=`, `?l=`, `?c=`); da się oddalić do całej Polski. Sprawdzone: tak (K3).
- Kolory mapy według 20 wskaźników GUS, legenda (też w trybie ciemnym), suwak lat, panel wskaźnika, przełącznik poziomu, dymek, najwyżej/najniżej, „Na tle kraju”. Sprawdzone: tak (K2, K3).
- Wyszukiwarka jednostek i miejscowości; gminy z rodzajem („Wałcz (miasto)”).
- Profil miejsca: przegląd z dużą liczbą i rankingiem, zakładki (Przegląd · Powiaty/Gminy · Porównaj), wiersze wskaźników z wykresem lat. Sprawdzone: tak (K1).
- Porównanie dwóch miejsc: wybór drugiego miejsca, tabela, dwa obrysy, dwie mapki, `?c=`. Sprawdzone: tak (K4).
- Pobierz i udostępnij: okno z podglądem, karty PNG w 4 formatach, CSV, systemowe udostępnianie – z panelu wskaźnika, profilu i porównania. Sprawdzone: tak (K5).
- Telefon przebudowany (S15): cienki nagłówek, mapa na cały ekran, arkusz wskaźnika, profil w arkuszu, okruszki, dymek po pierwszym dotknięciu, mały pasek zgody. Sprawdzone: tak (K2), z uwagami do poprawek.
- Zgoda na statystyki, strony O projekcie / Prywatność / Źródła, panel `?tune`. Nocny robot danych GUS.
- **Biblioteka GUS – szkielet (F9):** strona `/biblioteka` (nagłówek, licznik, stany ładowanie/błąd/brak spisu, cztery puste miejsca na kategorie, wyszukiwarkę, filtry i wyniki) oraz przyciski „Pobierz CSV” i „Zamów ten wskaźnik” jako komponenty; jeszcze bez odnośnika w nagłówku i bez wypełnienia (F10–F11). Sprawdzone przez właściciela: nie.
- **Jeszcze bez ekranów (sama logika, F8 + F8b + F9 scalone):** lista 14 wskaźników miasto/wieś i wyciąganie części z odpowiedzi BDL, zapis części przez nocnego robota, pliki na województwa, wczytywanie i składanie wierszy; spis biblioteki GUS (budowanie, schemat kontraktu robot → wyszukiwarka, wyszukiwanie z filtrami na 63 960 zmiennych, wczytywanie, pełne nazwy zmiennych n1–n5), adres „Zamów wskaźnik” przez formularz `zamowienie-wskaznika.yml`. Sprawdzone przez właściciela: nie (nic jeszcze widocznego).

## Sesja teraz: S20 + S21, ręczna pętla (F10 → F12)
Od 25.10.2026 **Ty scalasz, Claude puszcza kolejne** (`docs/AUTOMAT.md` §0, skrypt `scripts/ops/start-tasks.mjs`); automat stoi pod etykietą `automat-stop` na #221. F1–F7 zrobione (33/33, K1–K5 zaakceptowane). Teraz: **S20** miasto i wieś gmin miejsko-wiejskich (PRODUKT §4c) i **S21** biblioteka GUS (PRODUKT §4d) – 25 małych zadań (10 W1 + 15 W2) w falach F8–F12, najwyżej 7 w fali (limit Julesa: 15 naraz).
- **F8** (6): W1.15 · W1.16 · W1.21 · W1.22 · W1.23 · W1.24 · **F9** (7): W1.17 · W1.18 · W1.19 · W1.20 · W2.27 · W2.34 · W2.35 · **F10** (7): W2.24 · W2.28 · W2.29 · W2.30 · W2.31 · W2.33 · W2.38 (nowe po researchu rundy 3: arkusz na telefonie) · **F11** (3): W2.25 · W2.32 · W2.36 · **F12** (2): W2.26 · W2.37.
- **Punkty kontrolne:** K6 = S20 (po F12) · K7 = S21 (po F12). Do pierwszego obejrzenia z liczbami: po pierwszym nocnym pobraniu z W1.17 (dla K6).
- **F8b zamknięta 26.10.2026** (3/3: W1.25 #358 · W1.26 #357 · W1.27 #356); kontrakt spisu (#350) i formularz (#351) scalone. **CI na `main` zielone (po #362 i #363).** **F9 zamknięta 27.10.2026 (7/7, PR #373–#379).** **Teraz:** F10, gdy CI na `main` po F9 będzie zielone. Przed W2.35: test linku na drugim koncie.
- **Poza kolejką:** W1.9 (teksty objaśnień – Twoja akceptacja), W3.5 i „Później”; kroki Claude w workflow (`.github/`) – ARCHITEKTURA §4 „Poza falami”.

### Postęp (pisze automat – nie edytuj ręcznie)
<!-- automat:start -->
Automat zatrzymany od 25.10.2026 (etykieta `automat-stop` na #221); fale puszcza Claude skryptem `scripts/ops/start-tasks.mjs`. F1–F7: zrobione (33/33). **F8 zamknięta 26.10.2026 (6/6)**, **F8b zamknięta 26.10.2026 (3/3: pełne nazwy zmiennych, wydajność wyszukiwania, adres „Zamów”)**. **F9 zamknięta 27.10.2026 (7/7)**. F10–F12: 0/12. **Następna fala: F10** – po zielonym CI na `main` (przebiegi po scaleniu F9 w toku). Spis `index.json` jest na gałęzi `data/library` (7,9 MB).
<!-- automat:end -->

## Plan (1 linia na sesję; zadania i fale w docs/ARCHITEKTURA.md §3–§4)
- S14–S19 – zrobione (profil, telefon, ruch, „Na tle kraju”, porównanie, pobierz i udostępnij; F1–F7).
- S20 (F8–F12) – miasto i obszar wiejski w profilu gminy miejsko-wiejskiej (zwijany blok, 14 wskaźników).
- S21 (F8–F12) – strona „Biblioteka GUS”: kategorie, wyszukiwanie, filtry, wskaźnik z rankingiem i CSV, zamówienie wskaźnika.
- Po K7: przegląd „Później” (SEO, mapa dla wskaźnika z biblioteki, R2, tryb ciemny mapy…) i nowa fala poprawek z Twojej listy.

## Przypomnienia (pełna tabela: ARCHITEKTURA §4 „Poza falami”)
- **Research, runda 2 i 3: wyniki wróciły 27.10.2026** i są sprawdzone (`docs/research/weryfikacja-runda3.md`): R9.5 (hasła GUS dla 11 z 20 wskaźników), R2.4/R5.4/R11.4 (częściowo), R13 (brak gotowego szablonu mobilnego → nowe W2.38), R14 (animacje: brak gotowego zasobu z licencją), R15 (lista kandydatów do decyzji). Odrzucone cztery raporty z sesji bez dostępu do sieci. **Opcjonalnie dalej (nie blokuje F10):** R9.6 – źródło tekstów dla 9 wskaźników bez hasła GUS (przed W1.9); R14.4 – deck.gl `transitions` i `setPaintProperty` (przed W3.5).
- **Ty:** „Fetch library” po W1.25 uruchomiony ręcznie 26.10 ok. 16:23 UTC (w toku w chwili zapisu) – po zakończeniu sprawdź, że w `library/catalog.json` tytuły z n4/n5 są pełne; test linku „Zamów” na drugim koncie (5 min) przed W2.35.
- **Ty, 2 min:** ruleset na `main` (GitHub → Settings → Rules: wymagane `testy` i `bezpieczenstwo`).
- **Ty:** lista uwag z oglądu K1–K5 (zrobię z niej małe zadania w nowej fali) · teksty objaśnień do akceptacji (W1.9; przygotuję listę do przeczytania).
- **Ty, kiedy chcesz:** pismo do GUS o zbiorczy eksport BDL – gotowy tekst (≤ 1000 znaków, limit formularza) w `docs/research/biblioteka-bulk-wynik.md`; sprawdź też w przeglądarce, czy w BDL jest „Pobrane podgrupy” (ZIP z CSV/XLSX) – raport tego nie potwierdził.
- **Claude:** (1) ✅ krok indeksu w workflow „Fetch library” dodany (PR #359; zbudowanie `index.json` sprawdzone lokalnie na prawdziwym katalogu: 63 960 zmiennych, 7,9 MB, 593 KB gzip; na gałęzi `data/library` pojawi się po zakończeniu bieżącego przebiegu i następnym przebiegu z nowym workflow); (2) ✅ krok części miasto/wieś w „Fetch data” (PR #380) – po jego scaleniu jedno ręczne uruchomienie „Fetch data” (wynik wróci jako PR z danymi do sprawdzenia przez Ciebie); (3) ✅ W0.2 `trustPolicy: no-downgrade` w `pnpm-workspace.yaml` (PR #359; etykieta `zamowienie-wskaznika` jest).
- **Biblioteka GUS – robot:** workflow `Fetch library` (co 12 h, budżet 2500 zapytań) **do 25.10.2026 nigdy nie biegł** (poprzedni zapis tutaj był błędny). Pierwszy przebieg uruchomiony ręcznie 25.10 ok. 17:42 UTC; dane (`library/catalog.json`, `state.json`, `values/`) pojawią się na gałęzi `data/library` dopiero po jego zakończeniu (do ~170 min). Magazyn: do czasu R2 gałąź w repo (`docs/research/R6-magazyn-wynik.md`).
- **Przed pierwszym obejrzeniem K7:** po pierwszym pełnym katalogu zmierzyć rozmiar `index.json`; jeśli > ~1 MB po kompresji – dzielimy na pliki działów (osobne zadanie).

## Znane problemy / dług (co · skąd · priorytet · w której fali)
- `main` bez ochrony (brak reguł) · przegląd 24.10 · wysoki · Ty: ruleset (przypomnienie wyżej).
- Uwagi właściciela z oglądu K1–K5 · 25.10 · wysoki · nowa fala poprawek po otrzymaniu listy.
- Brak prostych objaśnień wskaźników · test 20.10 · średni · W1.9 po Twojej akceptacji tekstów (hasła GUS są dla 11 z 20; dla 9 – R9.6).
- Telefon: dolny arkusz – przewijana zawartość sięga poza ekran przy 40%; przeciąganie bez alternatywy przyciskiem (WCAG 2.5.7) · test K2 + R13 · średni · **W2.38 (F10)**. Obejście w testach: `?sheet=full` (#363).
- ✅ **CI na `main` naprawione 26.10 (#362, #363).** Przyczyna masowej czerwieni: `ubuntu-latest` przechodzi na Ubuntu 26 – runner przypięty do `ubuntu-24.04` (ci.yml, update-snapshots.yml). Pozostały mobilny test `share-profile.spec.ts:72` naprawiony parametrem `?sheet=full` (arkusz profilu od razu na 100%; test przeciągania uchwytu w `profile-mobile.spec.ts` zastąpiony tym parametrem). Do tego timeout testu e2e w CI 30→60 s i limit zadania `testy` 30→60 min (przebieg trwa ok. 29 min; kilka testów padało na 30 s niestabilnie). Zmianę układu `BottomSheet` z PR Julesa #361 odrzucono (psuła `profile-tabs`). Dług: czas CI blisko 30 min – rozważyć podział e2e na części · średni · przy okazji.
- Spis biblioteki: zdublowane tytuły (n4/n5) i wolne szukanie · R7 · naprawione w kodzie (W1.25, W1.26, scalone); **potwierdzić na prawdziwych danych** po zakończeniu „Fetch library” (rozmiar `index.json`, czas wyszukiwania).
- Stare gałęzie na GitHubie (`jules-*`, `feat/*`, `w1-*`, `w2-*`, `plan/po-researchu`, `v5-struktura`) · porządki · niski · usunąć po Twojej zgodzie (ja nie mogę – proxy blokuje usuwanie gałęzi). Lista do ręcznego usunięcia: `feat/*`, `jules-*`, `w1-*`, `w2-*`, `w2.*`, `w3-1-*`, `plan/po-researchu`, `v5-struktura`, `haiku/R12.1-R12.2`, `stan-po-research`, `research-haiku`, `ci-ubuntu-24`, `napraw-share-profile-mobile`, `napraw-share-profile-min`, `stan-czyste-ci`. Zostawić: `main`, `data/library`, `data/nightly`.
- Miasto/wieś: w częściach wiejskich 244 gmin „czytelnicy bibliotek” = 0 – nie wiadomo, czy to prawdziwe zero czy brak · W1.11 · niski · pokazujemy jak BDL; sprawdzić po pierwszym pobraniu.
- Zakres lat bezrobocia w częściach (od 2019?) niesprawdzony · W1.11 · niski · pokaże pierwszy przebieg W1.17.
- Raw.githubusercontent jako adres danych biblioteki: CORS i limity niesprawdzone z przeglądarki · S21 · średni · e2e używają podmienionych żądań; sprawdzić na podglądzie po F12, w razie problemu – R2.
- Klucz PostHog · plan · niski · „Później”.

## Pomiar fal
- F1–F7: 33 zadania; część PR-ów (np. W2.1, W2.13, W1.10, W0.1) wymagała 2–3 prób; W2.21 miał jedną nieudaną próbę Julesa. Dokładne liczby poprawek nie były zbierane po zatrzymaniu automatu (25.10).
- Od F8: po każdej fali jedna linia w tej sekcji (zadania · PR-y poprawione · Twoje minuty) – dopisuje Claude przy kolejnej fali.
- F8: 6 zadań, 6 PR-ów scalonych (#325–#330). F8b: 3 zadania, 3 PR-y scalone (#356–#358), plus 2 PR-y Claude (#350 kontrakt, #351 formularz). Liczby prób Julesa i Twoje minuty nie były zbierane.

## Decyzje (najnowsze na górze, 1 linia, kto)
- 27.10.2026 · **F9 zamknięta** (7 PR scalonych po zielonym CI: #373–#379). **Research rundy 3 sprawdzony; dodane zadanie W2.38** (poprawa dolnego arkusza na telefonie, F10); cztery raporty z sesji bez dostępu do sieci odrzucone (Claude, na polecenie „zmień plan”). Plan: F10–F12 = 12 zadań
- 26.10.2026 · **CI na `main` zielone**: runner przypięty do ubuntu-24.04 (#362), naprawa share-profile + timeouty (#363); #348 scalony; PR Julesa #361 zamknięty bez scalenia (Claude, na polecenie „doprowadź do czystego”)
- 26.10.2026 · **F8b zamknięta, plan po researchu w repo** (Claude, ze stanu `main`): scalone #349 (plan), #350 (kontrakt spisu), #351 (formularz zgłoszeń), #352 (kolejka F8b), #356–#358 (W1.27, W1.26, W1.25); `pnpm test` zielony (93 pliki, 620 testów); **CI na `main` czerwone od 12:10 z powodu mobilnego testu share-profile, niezwiązanego z F8b – naprawa przed F9**; „Fetch library” ponownie uruchomiony; runda 2 researchu i PR #348 (R12) niezałatwione
- 26.10.2026 · **D1–D8 rozstrzygnięte** (Claude, z Twojego polecenia „podejmij wszystkie decyzje”): D1 zostajemy na pnpm 10.30.3, W0.2 tylko `trustPolicy`, zmiana na 11/12 dopiero po F12; D2 lista płaska „Dział – wymiary”; D3 PR kontraktu otwarty (#350); D4 naprawa robota n4/n5 = W1.25 + ponowny „Fetch library”; D5 kreski + osobna pozycja „brak danych” w legendzie (W3.8); D6 konto i domena R2 dopiero gdy `data/library` > ~1 GB; D7 zgoda na zmianę `library-order.test.ts` (tylko W1.27); D8 W1.26 przed F10. Prompty F8b: `docs/prompty/F8b.md`; formularz zgłoszeń: PR #351
- 26.10.2026 · **Po weryfikacji R2, R5, R7–R12** (`docs/research/haiku/`; Claude): R8 – link „Zamów” przez `template=` + pola `id`, bez `labels=` (obcy dostają 404), potrzebny formularz `.yml` i etykieta (W1.27); R7 – lista płaska „dział: wymiary”, ale robot gubi `n4`/`n5` (25% zmiennych ma zdublowane tytuły) → W1.25 i ponowny przegląd katalogu; spis ma 63 960 zmiennych (nie 51 tys.), 593 KB gzip; wyszukiwanie za wolne na tylu zmiennych → W1.26
- 26.10.2026 · **R9** (Claude): objaśnienia pisane własnymi słowami + `definitionUrl` do hasła GUS (GUS: kopiowanie z podaniem źródła, brak nazwanej licencji; część haseł to cytaty osób trzecich); **R10**: `trustPolicy: no-downgrade` działa na pnpm 10.30.3, akcja `@v6` już jest → W0.2; **R11**: darmowy plan R2 wystarcza, `r2.dev` nie na produkcję (własna domena); **R2**: Positron nie ma warstw rastrowych, `name:pl` zadeklarowane → W3.7; **R5**: kreskowanie `FillStyleExtension` możliwe → W3.8; **R12**: bez zmian w kodzie
- 26.10.2026 · Kontrakt spisu biblioteki: robot (`categories`, `variables`) ≠ `query.ts` (inne pola) – naprawa schematem zod i adapterem (`index-contract.ts`) scalona jako #350 (Claude)
- 26.10.2026 · Research R2, R5, R7–R12 robi Haiku w wąskich zleceniach (jedno pytanie, fakty z linkami); decyzję podejmuje Opus/Sonnet po weryfikacji i Ty (Ty, czat Claude)
- 25.10.2026 · Raporty R1–R5 zweryfikowane (`docs/research/weryfikacja-raportow-v2.md`): zero wymian własnych komponentów na pakiety teraz; szablonów nie bierzemy; prerender RR8 odpada (tryb framework); rozpiska N1–N12 w `docs/research/zadania-fala-8.md`, wchodzi do planu po decyzjach D1–D5; plan S22 nie wchodzi do ARCHITEKTURA ani kolejki – decyzja właściciela (Ty, czat Claude)
- 25.10.2026 · Research kierujemy na audyt tego, co już zrobione (szablon stron, strona główna, animacje, własne komponenty) i na gotowce pod S20–S21; wzorce z cudzych repozytoriów wolno studiować i przepisać po swojemu tylko z wpisu w `docs/INSPIRACJE.md` (licencja MIT/BSD/ISC/Apache-2.0/CC0); zmiana zasady w `AGENTS.md` (Ty, czat Claude)
- 25.10.2026 · **Plan S20 + S21** zatwierdzony do realizacji: 24 małe zadania w falach F8–F12, ≤ 7 w fali (Jules lepiej radzi sobie z małymi zadaniami; limit 15 naraz) (Ty, czat Claude)
- 25.10.2026 · **Ręczna pętla:** Ty scalasz, Claude puszcza kolejne (`start-tasks.mjs`); automat zatrzymany (`automat-stop` na #221); limity w kolejce podniesione do 15 naraz (Ty, czat Claude)
- 25.10.2026 · K1–K5 zaakceptowane przez właściciela; uwagi do poprawek później, jako małe zadania (Ty)
- 25.10.2026 · **S20: blok w profilu, bez map** – zwijany blok „Miasto i obszar wiejski” (14 wskaźników), jeden dodatkowy plik na województwo ładowany dopiero po rozwinięciu; bez obrysów części gminy i bez dochodów/wydatków (Claude, decyzja produktowa do zmiany na życzenie)
- 25.10.2026 · **S21 v1 bez mapy dla wskaźnika z biblioteki** – katalog, szukanie, filtry, ranking, CSV, zamówienie; mapa i karty PNG z biblioteki do „Później”; zamówienia = zgłoszenie na GitHubie czytane ręcznie (Claude)
- 25.10.2026 · **Magazyn biblioteki:** docelowo Cloudflare R2 (raport Deep Research zweryfikowany: cennik potwierdzony drugim źródłem, 10 GB bezpłatnie, egress 0); do czasu przejścia gałąź `data/library` + adres w jednym miejscu (`VITE_LIBRARY_BASE`) – przejście na R2 bez zmian w kodzie stron (Claude, tymczasowa)
- 25.10.2026 · **SEO podstron gmin odłożone:** raport Deep Research błędnie uznał limit 2048 „routes” na Vercel za blokadę dla 2500 stron statycznych (dokumentacja: liczą się reguły z `vercel.json`, plików wyjściowych nie ograniczono); ryzyko „scaled content abuse” i brak gotowej treści – wrócić po K7 (Claude)
- 25.10.2026 · **Zbiorczy eksport BDL:** raport zweryfikowany częściowo – liczba „1 mln zapytań” błędna (nasz pomiar: ~38 zapytań na wskaźnik, ok. 1000 wskaźników tygodniowo), ścieżka „Pobrane podgrupy” i adres e-mail sekretariatu niepotwierdzone; formularz GUS i telefon potwierdzone; tekst pisma gotowy (Claude)
- 25.10.2026 · Ręcznie uruchomiony pierwszy przebieg „Fetch library” (poprzednio workflow nigdy nie biegł mimo wpisu „działa”) (Claude)
- 24.10.2026 · W1.11 zrobione: raport Deep Research zweryfikowany na nagraniach BDL – podział miasto/wieś **istnieje** (kody 4 i 5) dla 14 z 16 wskaźników gminnych; w dochodach/wydatkach to fałszywe zera; robimy w sesji S20 po K5 (Ty, czat Claude)
- 24.10.2026 · **Pełny automat** prowadzi fale do końca (S14–S19): Jules przez etykietę `jules`, scalanie po `check-pr` i zielonym CI, Twoja ocena na punktach kontrolnych K1–K5 nie blokuje (poprawki jako nowe zadania); zmienia zasadę WORKFLOW „ręczne wklejanie” i bramkę „ocena przed falą” (Ty, czat Claude)
- 24.10.2026 · Posłaniec = zadanie cykliczne co godzinę 7–23 na tanim modelu, decyzje podejmuje skrypt `scripts/ops/automat.mjs`; Naprawiacz raz dziennie (Ty, czat Claude)
- 24.10.2026 · `STAN.md` aktualizuje automat tylko na punktach kontrolnych (blok „Postęp”), nie po każdej fali (Ty, czat Claude)
- 24.10.2026 · W2.4 może zmienić dokładnie dwa testy mobilne (`home.spec.ts`, `picker-scroll.spec.ts`) tak, jak opisuje ARCHITEKTURA §3; W2.5 zdejmuje `fixme` (Ty, czat Claude)
- 24.10.2026 · Automat może sam nałożyć `aktualizuj-zrzuty` raz na PR, gdy czerwone są tylko zrzuty (Ty, czat Claude)
- 24.10.2026 · W1.9 poza automatem (czeka na Twoją akceptację tekstów); W3.5 do „Później” (Ty, czat Claude)
- 24.10.2026 · PR-y #210, #215, #217 zamknięte – zadania W3.1, W2.4, W2.6 wracają przez automat od nowa (Ty, czat Claude)
- 24.10.2026 · Nowe: S19 „Pobierz i udostępnij” (karty PNG w 4 formatach, CSV, systemowe udostępnianie; bez nowych pakietów) i dwie mapki w porównaniu – pomysły właściciela; „generator karuzel” zawężony do serii slajdów pod konta Faktografii (osobne repo) (Ty, czat Claude)
- 24.10.2026 · Wycofany test W2.3 (#216) przez #218, bo `main` był czerwony: test szukał rankingu i zakładek, których nie ma (W2.1/W2.2 niewykonane). Wraca w F3′ po W2.1 i W2.2 (Ty, czat Claude)
- 24.10.2026 · PR #208 zastąpiony czystym #219; #210, #215, #217 wstrzymane (zależności i naruszenia AGENTS.md) (Ty, czat Claude)
- 22.10.2026 · Zadanie W1.3 (BottomSheet) wykonane (PR #207) – poza kolejnością fal (Ty)
- 22.10.2026 · Plan przebudowany wg v5.3: wszystkie zadania wg warstw (33 dla Julesa) i 14 fal F1–F14 z tabelą kolizji w ARCHITEKTURA.md; prompty pisze właściciel innym narzędziem z zadań §3, dlatego docs/prompty/ usunięty; logika W1 dla S15–S18 robiona wcześniej, równolegle z profilem (Ty, czat Claude)
- 22.10.2026 · WORKFLOW v5.3: warstwy W0–W3 i pliki-węzły w `docs/ARCHITEKTURA.md` (zastępuje TECHNIKA.md i PLAN.md), rejestr licencji `docs/ELEMENTY.md`, STAN aktualizowany po każdej fali; baza: od zera (Ty, czat Claude)
- 22.10.2026 · Usunięty duplikat projektu Vercel; GitHub usuwa gałęzie po scaleniu automatycznie (Ty)
- 21.10.2026 · Proces WORKFLOW UNIWERSALNY v5.1 (fale, gotowe elementy, tryby czatu); CI wg §10.5 (zadania `testy`, `bezpieczenstwo`); `MASTER_PLAN.md` usunięty (Ty, czat Claude)
- 21.10.2026 · Stary Autopilot i „Zgody” wyłączone w GitHub, ich Issues zamknięte, etykiety starego procesu usunięte, stare gałęzie usunięte (Ty, czat Claude)
- 21.10.2026 · Nocne PR-y z danymi bez auto-scalania; wrócić, gdy będą ≥ 2 tygodniowo (v5.3 §12) (Ty, czat Claude)
- 21.10.2026 · Plan: S15 telefon, S16 płynne wejście w głąb „kafelek po kafelku”, S17 objaśnienia, S18 porównanie; profil na telefonie (dawne S14.5) w S15 (Ty, czat Claude)
- 21.10.2026 · PR #199 (S14.3) zamknięty – dwa zakreślenia, własne czytanie adresu, zmienione testy; S14.3 od nowa. PR #198 (S14.10) – scalić po obejrzeniu podglądu (Ty, czat Claude)
- 21.10.2026 · Kontekst „na tle kraju” liczony automatycznie z danych, ręczne objaśnienia opcjonalne (Ty, czat Claude)
- 21.10.2026 · S14 = profil miejsca wg makiety 03 (Ty, czat Claude)
