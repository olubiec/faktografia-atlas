# Stan – 25.10.2026

## Co działa (po ludzku; „sprawdzone przez właściciela: tak/nie”)
Na podstawie kodu na main (commit d797711, po F7). **Właściciel obejrzał K1–K5 na podglądzie 25.10.2026 i zaakceptował; ma uwagi do poprawek (lista przyjdzie osobno, zostaną rozbite na małe zadania).**
- Mapa województw, powiatów i gmin z przechodzeniem w głąb (płynna kamera, kafelki po kolei, przelewanie kolorów), okruszkami i stanem w adresie (`?u=`, `?i=`, `?y=`, `?l=`, `?c=`); da się oddalić do całej Polski. Sprawdzone: tak (K3).
- Kolory mapy według 20 wskaźników GUS, legenda (też w trybie ciemnym), suwak lat, panel wskaźnika, przełącznik poziomu, dymek, najwyżej/najniżej, „Na tle kraju”. Sprawdzone: tak (K2, K3).
- Wyszukiwarka jednostek i miejscowości; gminy z rodzajem („Wałcz (miasto)”).
- Profil miejsca: przegląd z dużą liczbą i rankingiem, zakładki (Przegląd · Powiaty/Gminy · Porównaj), wiersze wskaźników z wykresem lat. Sprawdzone: tak (K1).
- Porównanie dwóch miejsc: wybór drugiego miejsca, tabela, dwa obrysy, dwie mapki, `?c=`. Sprawdzone: tak (K4).
- Pobierz i udostępnij: okno z podglądem, karty PNG w 4 formatach, CSV, systemowe udostępnianie – z panelu wskaźnika, profilu i porównania. Sprawdzone: tak (K5).
- Telefon przebudowany (S15): cienki nagłówek, mapa na cały ekran, arkusz wskaźnika, profil w arkuszu, okruszki, dymek po pierwszym dotknięciu, mały pasek zgody. Sprawdzone: tak (K2), z uwagami do poprawek.
- Zgoda na statystyki, strony O projekcie / Prywatność / Źródła, panel `?tune`. Nocny robot danych GUS.

## Sesja teraz: S20 + S21, ręczna pętla (F8 → F12)
Od 25.10.2026 **Ty scalasz, Claude puszcza kolejne** (`docs/AUTOMAT.md` §0, skrypt `scripts/ops/start-tasks.mjs`); automat stoi pod etykietą `automat-stop` na #221. F1–F7 zrobione (33/33, K1–K5 zaakceptowane). Teraz: **S20** miasto i wieś gmin miejsko-wiejskich (PRODUKT §4c) i **S21** biblioteka GUS (PRODUKT §4d) – 24 małe zadania (10 W1 + 14 W2) w falach F8–F12, najwyżej 7 w fali (limit Julesa: 15 naraz).
- **F8** (6): W1.15 · W1.16 · W1.21 · W1.22 · W1.23 · W1.24 · **F9** (7): W1.17 · W1.18 · W1.19 · W1.20 · W2.27 · W2.34 · W2.35 · **F10** (6): W2.24 · W2.28 · W2.29 · W2.30 · W2.31 · W2.33 · **F11** (3): W2.25 · W2.32 · W2.36 · **F12** (2): W2.26 · W2.37.
- **Punkty kontrolne:** K6 = S20 (po F12) · K7 = S21 (po F12). Do pierwszego obejrzenia z liczbami: po pierwszym nocnym pobraniu z W1.17 (dla K6).
- **F8b** (3, po F8, przed F9): W1.25 · W1.26 · W1.27 · **Przed F9:** naprawa kontraktu spisu scalona, formularz `zamowienie-wskaznika.yml` w repo, test na drugim koncie.
- **Poza kolejką:** W1.9 (teksty objaśnień – Twoja akceptacja), W3.5 i „Później”; kroki Claude w workflow (`.github/`) – ARCHITEKTURA §4 „Poza falami”.

### Postęp (pisze automat – nie edytuj ręcznie)
<!-- automat:start -->
Automat zatrzymany od 25.10.2026 (etykieta `automat-stop` na #221); fale puszcza Claude skryptem `scripts/ops/start-tasks.mjs`. F1–F7: zrobione (33/33). **F8 zamknięta 26.10.2026 (6/6; pliki i 35 testów sprawdzone w kodzie)**. Odłożone z F8: poprawki po researchu → **F8b** (W1.25 pełne nazwy zmiennych, W1.26 wydajność wyszukiwania, W1.27 adres „Zamów”). F9–F12: 0/18. Następna fala: F8b, po scaleniu naprawy kontraktu spisu.
<!-- automat:end -->

## Plan (1 linia na sesję; zadania i fale w docs/ARCHITEKTURA.md §3–§4)
- S14–S19 – zrobione (profil, telefon, ruch, „Na tle kraju”, porównanie, pobierz i udostępnij; F1–F7).
- S20 (F8–F12) – miasto i obszar wiejski w profilu gminy miejsko-wiejskiej (zwijany blok, 14 wskaźników).
- S21 (F8–F12) – strona „Biblioteka GUS”: kategorie, wyszukiwanie, filtry, wskaźnik z rankingiem i CSV, zamówienie wskaźnika.
- Po K7: przegląd „Później” (SEO, mapa dla wskaźnika z biblioteki, R2, tryb ciemny mapy…) i nowa fala poprawek z Twojej listy.

## Przypomnienia (pełna tabela: ARCHITEKTURA §4 „Poza falami”)
- **Ty → Haiku (research, runda 2):** `docs/research/haiku-zlecenia-runda2.md` (R9.5 przed W1.9; R2.4, R5.4 po K7; R11.4 po koncie Cloudflare). Pierwsza runda zweryfikowana 26.10.
- **Ty (decyzje D1–D8 z PR „po researchu”):** pnpm 11 czy 12 · lista płaska · PR naprawy kontraktu · naprawa robota n4/n5 · kreski czy szarość · domena R2 · test etykiety na 2. koncie · perf wyszukiwania.
- **Ty, 2 min:** ruleset na `main` (GitHub → Settings → Rules: wymagane `testy` i `bezpieczenstwo`).
- **Ty:** lista uwag z oglądu K1–K5 (zrobię z niej małe zadania w nowej fali) · teksty objaśnień do akceptacji (W1.9; przygotuję listę do przeczytania).
- **Ty, kiedy chcesz:** pismo do GUS o zbiorczy eksport BDL – gotowy tekst (≤ 1000 znaków, limit formularza) w `docs/research/biblioteka-bulk-wynik.md`; sprawdź też w przeglądarce, czy w BDL jest „Pobrane podgrupy” (ZIP z CSV/XLSX) – raport tego nie potwierdził.
- **Claude (po scaleniu F8 i F9):** krok indeksu w workflow „Fetch library”, krok części miasto/wieś w „Fetch data”, etykieta `zamowienie-wskaznika`, jedno ręczne uruchomienie „Fetch data”.
- **Biblioteka GUS – robot:** workflow `Fetch library` (co 12 h, budżet 2500 zapytań) **do 25.10.2026 nigdy nie biegł** (poprzedni zapis tutaj był błędny). Pierwszy przebieg uruchomiony ręcznie 25.10 ok. 17:42 UTC; dane (`library/catalog.json`, `state.json`, `values/`) pojawią się na gałęzi `data/library` dopiero po jego zakończeniu (do ~170 min). Magazyn: do czasu R2 gałąź w repo (`docs/research/R6-magazyn-wynik.md`).
- **Przed pierwszym obejrzeniem K7:** po pierwszym pełnym katalogu zmierzyć rozmiar `index.json`; jeśli > ~1 MB po kompresji – dzielimy na pliki działów (osobne zadanie).

## Znane problemy / dług (co · skąd · priorytet · w której fali)
- `main` bez ochrony (brak reguł) · przegląd 24.10 · wysoki · Ty: ruleset (przypomnienie wyżej).
- Uwagi właściciela z oglądu K1–K5 · 25.10 · wysoki · nowa fala poprawek po otrzymaniu listy.
- Brak prostych objaśnień wskaźników · test 20.10 · średni · W1.9 po Twojej akceptacji tekstów (R9.5 dla reszty haseł).
- Spis biblioteki: zdublowane tytuły (n4/n5) i wolne szukanie na 64 tys. zmiennych · R7 · wysoki · F8b (W1.25, W1.26).
- Miasto/wieś: w częściach wiejskich 244 gmin „czytelnicy bibliotek” = 0 – nie wiadomo, czy to prawdziwe zero czy brak · W1.11 · niski · pokazujemy jak BDL; sprawdzić po pierwszym pobraniu.
- Zakres lat bezrobocia w częściach (od 2019?) niesprawdzony · W1.11 · niski · pokaże pierwszy przebieg W1.17.
- Raw.githubusercontent jako adres danych biblioteki: CORS i limity niesprawdzone z przeglądarki · S21 · średni · e2e używają podmienionych żądań; sprawdzić na podglądzie po F12, w razie problemu – R2.
- Klucz PostHog · plan · niski · „Później”.

## Pomiar fal
- F1–F7: 33 zadania; część PR-ów (np. W2.1, W2.13, W1.10, W0.1) wymagała 2–3 prób; W2.21 miał jedną nieudaną próbę Julesa. Dokładne liczby poprawek nie były zbierane po zatrzymaniu automatu (25.10).
- Od F8: po każdej fali jedna linia w tej sekcji (zadania · PR-y poprawione · Twoje minuty) – dopisuje Claude przy kolejnej fali.

## Decyzje (najnowsze na górze, 1 linia, kto)
- 26.10.2026 · **Po weryfikacji R2, R5, R7–R12** (`docs/research/haiku/`; Claude): R8 – link „Zamów” przez `template=` + pola `id`, bez `labels=` (obcy dostają 404), potrzebny formularz `.yml` i etykieta (W1.27); R7 – lista płaska „dział: wymiary”, ale robot gubi `n4`/`n5` (25% zmiennych ma zdublowane tytuły) → W1.25 i ponowny przegląd katalogu; spis ma 63 960 zmiennych (nie 51 tys.), 593 KB gzip; wyszukiwanie za wolne na tylu zmiennych → W1.26
- 26.10.2026 · **R9** (Claude): objaśnienia pisane własnymi słowami + `definitionUrl` do hasła GUS (GUS: kopiowanie z podaniem źródła, brak nazwanej licencji; część haseł to cytaty osób trzecich); **R10**: `trustPolicy: no-downgrade` działa na pnpm 10.30.3, akcja `@v6` już jest → W0.2; **R11**: darmowy plan R2 wystarcza, `r2.dev` nie na produkcję (własna domena); **R2**: Positron nie ma warstw rastrowych, `name:pl` zadeklarowane → W3.7; **R5**: kreskowanie `FillStyleExtension` możliwe → W3.8; **R12**: bez zmian w kodzie
- 26.10.2026 · Kontrakt spisu biblioteki: robot (`categories`, `variables`) ≠ `query.ts` (inne pola) – naprawa schematem zod i adapterem na lokalnej gałęzi `naprawa-kontraktu`, **niewypchniętej** do Twojej zgody (Claude)
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
