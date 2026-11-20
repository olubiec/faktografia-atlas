# Archiwum STAN.md (stan z 28.10.2026 i starsze wpisy)

Przeniesione z `docs/STAN.md`, bo plik ma limit ok. 100 linii (test `docs-no-conflict-markers`). Najnowsze wpisy są w STAN.md.

## Pomiar fal (F1–F13)
- F1–F7: 33 zadania; część PR-ów (np. W2.1, W2.13, W1.10, W0.1) wymagała 2–3 prób; W2.21 miał jedną nieudaną próbę Julesa. Dokładne liczby poprawek nie były zbierane po zatrzymaniu automatu (25.10).
- Od F8: po każdej fali jedna linia w tej sekcji (zadania · PR-y poprawione · Twoje minuty) – dopisuje Claude przy kolejnej fali.
- F8: 6 zadań, 6 PR-ów scalonych (#325–#330). F8b: 3 zadania, 3 PR-y scalone (#356–#358), plus 2 PR-y Claude (#350 kontrakt, #351 formularz). Liczby prób Julesa i Twoje minuty nie były zbierane.
- F9: 7 zadań, 7 PR (#373–#379). F10: 7 zadań, 7 PR (#389–#395). F11: 3 zadania, 3 PR (#399–#401). F12: 2 zadania, 2 PR (#404, #405); po F12 CI na `main` czerwone (wyścig w teście W2.37) → poprawka Claude #408, PR Julesa #407 odrzucony. F13: 4 zadania, 4 PR (#414–#417; #414 po jednym ponowieniu CI), start 16:47, ostatni PR scalony 17:52 (ok. 1 h 5 min); prompty F13 jako #409. F11–F13 scalane przez skrypt nadzorujący Claude, Twoje minuty na scalanie: 0. Dokładne liczby poprawek Julesa dla F9–F12 nie były zbierane.

## Sesja S20/S21: szczegóły fal F8–F14 (stan 28.10.2026)
- **F8** (6): W1.15 · W1.16 · W1.21 · W1.22 · W1.23 · W1.24 · **F9** (7): W1.17 · W1.18 · W1.19 · W1.20 · W2.27 · W2.34 · W2.35 · **F10** (7): W2.24 · W2.28 · W2.29 · W2.30 · W2.31 · W2.33 · W2.38 (nowe po researchu rundy 3: arkusz na telefonie) · **F11** (3): W2.25 · W2.32 · W2.36 · **F12** (2): W2.26 · W2.37.
- **Punkty kontrolne:** K6 = S20 (miasto i wieś) · K7 = S21 (biblioteka GUS) – **czekają na Twoje obejrzenie na podglądzie** (najlepiej z telefonu). K6 z liczbami dopiero po scaleniu danych z `data/nightly` (patrz „Znane problemy”).
- **F8b zamknięta 26.10.2026** (3/3: W1.25 #358 · W1.26 #357 · W1.27 #356). **F9 zamknięta 27.10.2026 (7/7, PR #373–#379).** **F10 zamknięta 27.10.2026 (7/7, PR #389–#395).** **F11 zamknięta 28.10.2026 (3/3: W2.36 #399 · W2.32 #400 · W2.25 #401).** **F12 zamknięta 28.10.2026 (2/2: W2.37 #404 · W2.26 #405).** **F13 zamknięta 28.10.2026 (4/4, zadania tylko-testowe: T13.4 #415 · T13.3 #414 · T13.2 #417 · T13.1 #416)** plus poprawka testu W2.37 (#408) – patrz „Decyzje”. **CI na `main` zielone (commit 3c38f23).** Przed W2.35 test linku „Zamów” na drugim koncie nadal do zrobienia (5 min).
- **F14 (szlif, pętla Jules Loop od 28.10.2026):** W3.8 kreskowanie „brak danych” · W3.9 rozbicie TrendChart (`tasks/W14-*`). **Poza kolejką:** W1.9 (teksty objaśnień – Twoja akceptacja), W3.5, W3.7 (spike podkładu – po K7) i „Później”; kroki Claude w workflow (`.github/`) – ARCHITEKTURA §4 „Poza falami”.

## Decyzje 21.10–25.10.2026
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

## Przeniesione ze STAN.md 20.11.2026 (U00): starsze sekcje opisu z 28.10
_Skrócono STAN.md do limitu 110 linii; treść bez zmian: „Co działa”, „Sesja teraz”, „Plan”, „Przypomnienia”, „Znane problemy / dług”._

### Co działa (po ludzku; „sprawdzone przez właściciela: tak/nie”)
Na podstawie kodu na main (po F13, commit 3c38f23; **CI na `main` zielone**; `pnpm test` zielony na ostatnim pomiarze 26.10: 93 pliki, 620 testów, od tego czasu dochodzą nowe pliki). **Właściciel obejrzał K1–K5 na podglądzie 25.10.2026 i zaakceptował; ma uwagi do poprawek (lista przyjdzie osobno, zostaną rozbite na małe zadania).**
- Mapa województw, powiatów i gmin z przechodzeniem w głąb (płynna kamera, kafelki po kolei, przelewanie kolorów), okruszkami i stanem w adresie (`?u=`, `?i=`, `?y=`, `?l=`, `?c=`); da się oddalić do całej Polski. Sprawdzone: tak (K3).
- Kolory mapy według 20 wskaźników GUS, legenda (też w trybie ciemnym), suwak lat, panel wskaźnika, przełącznik poziomu, dymek, najwyżej/najniżej, „Na tle kraju”. Sprawdzone: tak (K2, K3).
- Wyszukiwarka jednostek i miejscowości; gminy z rodzajem („Wałcz (miasto)”).
- Profil miejsca: przegląd z dużą liczbą i rankingiem, zakładki (Przegląd · Powiaty/Gminy · Porównaj), wiersze wskaźników z wykresem lat. Sprawdzone: tak (K1).
- Porównanie dwóch miejsc: wybór drugiego miejsca, tabela, dwa obrysy, dwie mapki, `?c=`. Sprawdzone: tak (K4).
- Pobierz i udostępnij: okno z podglądem, karty PNG w 4 formatach, CSV, systemowe udostępnianie – z panelu wskaźnika, profilu i porównania. Sprawdzone: tak (K5).
- Telefon przebudowany (S15): cienki nagłówek, mapa na cały ekran, arkusz wskaźnika, profil w arkuszu, okruszki, dymek po pierwszym dotknięciu, mały pasek zgody. Sprawdzone: tak (K2), z uwagami do poprawek.
- Zgoda na statystyki, strony O projekcie / Prywatność / Źródła, panel `?tune`. Nocny robot danych GUS.
- **Biblioteka GUS (S21, F9–F12):** odnośnik „Biblioteka” w nagłówku (komputer i telefon), strona `/biblioteka` z kafelkami działów i okruszkami, wyszukiwarką wskaźników, filtrami (poziom, jednostka, tylko pobrane) i listą wyników („Pokaż więcej”); stan zapytania jest w adresie (`?k=`, `?q=`, `?l=`, `?j=`, `?p=1`), „wstecz” cofa; strona wskaźnika `/biblioteka/<id>` z rankingiem (10 najwyżej / 10 najniżej), wyborem roku i poziomu, „Pobierz CSV” i – dla niepobranych – „Zamów ten wskaźnik” (zgłoszenie na GitHubie). Spis ma 63 960 zmiennych. Testy całej ścieżki (W2.37) przechodzą. Sprawdzone przez właściciela: **nie (K7)**.
- **Miasto i obszar wiejski (S20, F8–F12):** w profilu gminy miejsko-wiejskiej pod przeglądem zwijany blok z 14 wskaźnikami (tabela na komputerze, karty na telefonie); rozwinięcie pobiera jeden plik województwa. Test całej ścieżki (W2.26) przechodzi. **Liczby pojawią się dopiero po scaleniu danych z gałęzi `data/nightly` (patrz „Znane problemy”); do tego czasu blok pokaże komunikat „Dane o mieście i wsi pojawią się po najbliższej aktualizacji”.** Sprawdzone przez właściciela: **nie (K6)**.
- **Telefon, dolny arkusz (W2.38):** przewijana zawartość kończy się przy dolnej krawędzi ekranu, arkusz rozwija się i zwija także przyciskami (alternatywa dla przeciągania). Sprawdzone przez właściciela: nie.

### Sesja teraz: S20 + S21 zamknięte (F8–F12) i F13; do obejrzenia K6 i K7
Od 17.11.2026 pętla Jules Loop i Orkiestra są usunięte; fale prowadzą sesje Claude (`docs/FALE.md`), scala właściciel. Fala Q1 wystartowała 17.11.2026 na pętli, reszta zadań Q1 idzie sesjami Claude.

#### Postęp (pisze automat – nie edytuj ręcznie)
<!-- automat:start -->
Automat zatrzymany od 25.10.2026 (etykieta `automat-stop` na #221); fale puszcza Claude skryptem `scripts/ops/start-tasks.mjs`. F1–F7: zrobione (33/33). **F8 zamknięta 26.10.2026 (6/6)**, **F8b zamknięta 26.10.2026 (3/3: pełne nazwy zmiennych, wydajność wyszukiwania, adres „Zamów”)**. **F9 zamknięta 27.10.2026 (7/7)**, **F10 zamknięta 27.10.2026 (7/7)**, **F11 zamknięta 28.10.2026 (3/3)**, **F12 zamknięta 28.10.2026 (2/2)**, **F13 zamknięta 28.10.2026 (4/4, testy)**. Kolejka planu S20 + S21: 61/61. **Następny krok: K6 i K7 (Twoje obejrzenie), potem lista uwag z K1–K5 jako nowa fala poprawek.** Spis `index.json` jest na gałęzi `data/library` (7,9 MB).
<!-- automat:end -->

### Plan (1 linia na sesję; zadania i fale w docs/ARCHITEKTURA.md §3–§4)
- S14–S19 – zrobione (profil, telefon, ruch, „Na tle kraju”, porównanie, pobierz i udostępnij; F1–F7).
- S20 (miasto i wieś w profilu gminy, czeka na K6) i S21 (Biblioteka GUS, czeka na K7) – zrobione (F8–F13); F13 = stabilizacja testów e2e.
- 18.11.2026: po K7 wypłynęła lista poprawek właściciela → [FIX]–[FIX7], P1 (W19), FIX6 (kamera); dalej Q2–Q7 (`docs/PLAN-POPRAWEK.md`).
- Po K7: przegląd „Później” (SEO, mapa dla wskaźnika z biblioteki, R2, tryb ciemny mapy…) i nowa fala poprawek z Twojej listy.

### Przypomnienia (pełna tabela: ARCHITEKTURA §4 „Poza falami”)
- **Research, runda 2 i 3: wyniki wróciły 27.10.2026** i są sprawdzone (`docs/research/weryfikacja-runda3.md`): R9.5 (hasła GUS dla 11 z 20 wskaźników), R2.4/R5.4/R11.4 (częściowo), R13 (brak gotowego szablonu mobilnego → nowe W2.38), R14 (animacje: brak gotowego zasobu z licencją), R15 (lista kandydatów do decyzji). Odrzucone cztery raporty z sesji bez dostępu do sieci. **Opcjonalnie dalej (nie blokuje F10):** R9.6 – źródło tekstów dla 9 wskaźników bez hasła GUS (przed W1.9); R14.4 – deck.gl `transitions` i `setPaintProperty` (przed W3.5).
- **[Nieaktualne od 18.11: wartości BDL trafiły na main w #451 (commit 40c3f27); czy `public/data/parts` jest na main – do weryfikacji.]** **Ty (ważne dla K6):** na gałęzi `data/nightly` czekają dane o miastach i wsiach (`public/data/parts`, `data/parts`, 47 plików, 1 commit przed `main`), ale **PR z danymi nie został otwarty** (workflow „Fetch data” próbuje go założyć; prawdopodobna przyczyna: wyłączona zgoda w GitHub → Settings → Actions → General → „Allow GitHub Actions to create and approve pull requests”). Włącz to ustawienie albo otwórz PR z `data/nightly` ręcznie, sprawdź kilka liczb z bdl.stat.gov.pl i scal – dopiero wtedy blok „Miasto i obszar wiejski” pokaże liczby.
- **Ty:** „Fetch library” (ostatni udany przebieg 28.10 ok. 10:47 UTC) – sprawdź, że w `library/catalog.json` tytuły z n4/n5 są pełne; na gałęzi `data/library` jest 101 plików wartości (`values/`), dla reszty wskaźników strona pokazuje „jeszcze niepobrane” i przycisk zamówienia. Test linku „Zamów” na drugim koncie (5 min).
- **Ty, 2 min:** ruleset na `main` (GitHub → Settings → Rules: wymagane `testy` i `bezpieczenstwo`).
- **Ty:** lista uwag z oglądu K1–K5 (zrobię z niej małe zadania w nowej fali) · teksty objaśnień do akceptacji (W1.9; przygotuję listę do przeczytania).
- **Claude:** (1) ✅ krok indeksu w workflow „Fetch library” dodany (PR #359; zbudowanie `index.json` sprawdzone lokalnie na prawdziwym katalogu: 63 960 zmiennych, 7,9 MB, 593 KB gzip; na gałęzi `data/library` pojawi się po zakończeniu bieżącego przebiegu i następnym przebiegu z nowym workflow); (2) ✅ krok części miasto/wieś w „Fetch data” (PR #380) – po jego scaleniu jedno ręczne uruchomienie „Fetch data” (uruchomione; dane są na `data/nightly`, ale PR nie został założony – patrz „Ty (ważne dla K6)” wyżej); (3) ✅ W0.2 `trustPolicy: no-downgrade` w `pnpm-workspace.yaml` (PR #359; etykieta `zamowienie-wskaznika` jest).
- **Biblioteka GUS – robot:** workflow `Fetch library` (co 12 h, budżet 2500 zapytań) **do 25.10.2026 nigdy nie biegł** (poprzedni zapis tutaj był błędny). Pierwszy przebieg uruchomiony ręcznie 25.10 ok. 17:42 UTC; dane (`library/catalog.json`, `state.json`, `values/`) pojawią się na gałęzi `data/library` dopiero po jego zakończeniu (do ~170 min). Magazyn: do czasu R2 gałąź w repo (`docs/research/R6-magazyn-wynik.md`).
- **Przed pierwszym obejrzeniem K7:** po pierwszym pełnym katalogu zmierzyć rozmiar `index.json`; jeśli > ~1 MB po kompresji – dzielimy na pliki działów (osobne zadanie).

### Znane problemy / dług (co · skąd · priorytet · w której fali)
- `main` bez ochrony (brak reguł) · przegląd 24.10 · wysoki · Ty: ruleset (przypomnienie wyżej).
- Uwagi właściciela z oglądu K1–K5 · 25.10 · wysoki · nowa fala poprawek po otrzymaniu listy.
- Brak prostych objaśnień wskaźników · test 20.10 · średni · W1.9 po Twojej akceptacji tekstów (hasła GUS są dla 11 z 20; dla 9 – R9.6).
- Dane „miasto i wieś” czekają na gałęzi `data/nightly` bez PR-a na `main` (47 plików) · 28.10 · **wysoki dla K6** · Ty: włącz „Allow GitHub Actions to create and approve pull requests” albo otwórz PR ręcznie i sprawdź liczby (przypomnienie wyżej).
- ✅ Telefon: dolny arkusz – przewijana zawartość i przycisk zamiast przeciągania (WCAG 2.5.7) · test K2 + R13 · **W2.38 (F10) scalone**, do obejrzenia na telefonie. Obejście w testach: `?sheet=full` (#363).
- ✅ **CI na `main` naprawione 26.10 (#362, #363).** Przyczyna masowej czerwieni: `ubuntu-latest` przechodzi na Ubuntu 26 – runner przypięty do `ubuntu-24.04` (ci.yml, update-snapshots.yml). Pozostały mobilny test `share-profile.spec.ts:72` naprawiony parametrem `?sheet=full` (arkusz profilu od razu na 100%; test przeciągania uchwytu w `profile-mobile.spec.ts` zastąpiony tym parametrem). Do tego timeout testu e2e w CI 30→60 s i limit zadania `testy` 30→60 min (przebieg trwa ok. 29 min; kilka testów padało na 30 s niestabilnie). Zmianę układu `BottomSheet` z PR Julesa #361 odrzucono (psuła `profile-tabs`). Dług: czas CI blisko 30 min – rozważyć podział e2e na części · średni · przy okazji.
- Spis biblioteki: zdublowane tytuły (n4/n5) i wolne szukanie · R7 · naprawione w kodzie (W1.25, W1.26, scalone). Na `data/library`: `index.json` 7,9 MB (bez kompresji), `catalog.json` 26,5 MB, 101 plików wartości. **Do potwierdzenia na podglądzie (K7):** czas wyszukiwania na prawdziwym spisie i rozmiar po kompresji (próg ~1 MB – inaczej dzielimy na pliki działów).
- Niestabilne testy e2e (`s16-motion`, `profile-parts`, `library-search`, `profile-mobile`) · adnotacje CI po F12 · średni · **naprawione w F13** (czekanie na warunek zamiast stałych czasów); obserwować, czy CI nadal przechodzi bez ponowień. Czas pełnego CI nadal ok. 30 min.
- Stare gałęzie na GitHubie (`jules-*`, `feat/*`, `w1-*`, `w2-*`, `plan/po-researchu`, `v5-struktura`) · porządki · niski · usunąć po Twojej zgodzie (ja nie mogę – proxy blokuje usuwanie gałęzi). Lista do ręcznego usunięcia: `feat/*`, `jules-*`, `w1-*`, `w2-*`, `w2.*`, `w3-1-*`, `plan/po-researchu`, `v5-struktura`, `haiku/R12.1-R12.2`, `stan-po-research`, `research-haiku`, `ci-ubuntu-24`, `napraw-share-profile-mobile`, `napraw-share-profile-min`, `stan-czyste-ci`. Zostawić: `main`, `data/library`, `data/nightly`.
- Miasto/wieś: w częściach wiejskich 244 gmin „czytelnicy bibliotek” = 0 – nie wiadomo, czy to prawdziwe zero czy brak · W1.11 · niski · pokazujemy jak BDL; sprawdzić po pierwszym pobraniu.
- Zakres lat bezrobocia w częściach (od 2019?) niesprawdzony · W1.11 · niski · pokaże pierwszy przebieg W1.17.
- Raw.githubusercontent jako adres danych biblioteki: CORS i limity niesprawdzone z przeglądarki · S21 · średni · e2e używają podmienionych żądań; sprawdzić na podglądzie po F12, w razie problemu – R2.
- Klucz PostHog · plan · niski · „Później”.

