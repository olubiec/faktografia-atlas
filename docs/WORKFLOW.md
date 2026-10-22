# WORKFLOW UNIWERSALNY – praca z agentami AI (v5.4)

> 22.10.2026 · v5.4: pnpm 11 z blokadami pakietów (§6, §10.5a), Antigravity jako opcja przy komputerze (§2). v5.3: **Gemini Deep Research** jako stałe wsparcie researchu + obowiązkowa weryfikacja (§8.18–8.19). v5.2: **gotowe elementy i bazy** na pierwszym miejscu (§3b), **plan: warstwy → fale** (§3c), rejestr elementów i licencji (§4), nowe tryby BAZA i WARSTWY (§8.15–8.16).
> Dla dowolnego projektu: strona, aplikacja, gra, skrypt, automatyzacja.
> Zastępuje wcześniejsze wersje (v1–v4). To **zestaw sprawdzonych zasad i gotowych promptów**, nie sztywny regulamin – bierz, co pasuje do projektu, resztę dodawaj, gdy będzie potrzebna (§12).
> Pewność informacji: **[D]** dokumentacja · **[P]** praktycy · **[R]** pojedyncza relacja · **[O]** ocena.

---

## 1. Idea w 5 zdaniach

1. **Planista** (Claude albo Gemini – zamiennie) rozpisuje sesję na małe, gotowe prompty.
2. **Ty** wklejasz je do **Julesa**, który pisze kod i testy i otwiera PR.
3. **GitHub** sam uruchamia testy przy każdym PR; czerwone → Jules poprawia.
4. **Ty** oglądasz efekt na podglądzie i klikasz „Scal”.
5. **Cała pamięć projektu jest w repo** (`STAN.md`), więc czat, model i narzędzie możesz zmienić w każdej chwili.

Dwie rzeczy, które robimy niemal zawsze:
- **Budujemy z gotowych elementów, nie od zera.** Pakiety, shadery, komponenty, zasoby, usługi – a jeśli znajdziemy aplikację lub grę, która działa prawie jak nasza, bierzemy ją **jako bazę** i budujemy na niej całość (§3b). Własny kod piszemy tylko tam, gdzie to nasza unikalna część.
- **Plan układamy w warstwy, a pracę w fale.** Najpierw podzespoły, na których reszta stoi (warstwy, §3c), potem zadania z nich układamy w fale: kilka promptów naraz, które nie dotykają tych samych plików (§3a).

Każde AI mówi do Ciebie **po ludzku** – to część zasad, nie uprzejmość.

---

## 2. Kto co robi

| Kto | Rola | Kiedy |
|---|---|---|
| **Ty** | Decydujesz, wklejasz prompty, oglądasz, scalasz | zawsze |
| **Planista – Claude** | Plan sesji, prompty, decyzje, ocena ryzyka | gdy masz limit; rzeczy ważne i trudne do odwrócenia |
| **Planista – Gemini** (3.1 Pro) | To samo co Claude; do tego planowanie fal, kontrola postępu i pytania o kod (import repo) | gdy Claude nie ma limitu; zawsze do kontroli postępu i fal |
| **Gemini Argon** | „Oko”: ocenia zrzuty ekranu i nagrania | sprawy wyglądu |
| **Antigravity** (opcja) | Agent na Twoim komputerze: sam uruchamia aplikację, klika, robi zrzuty; modele Argon i Claude Opus 5.5 w limicie Google AI Pro [D] | tylko gdy siedzisz przy komputerze: ocena wyglądu (§8.8), trudny błąd, ważny przegląd bez zużywania limitu Claude. **Nie zastępuje** Planisty w aplikacji Gemini ani Julesa |
| **Gem Research + Gemini Deep Research** | Szuka gotowych elementów i **baz** (GitHub, npm/PyPI, listy „awesome”, galerie shaderów i zasobów, dokumentacja) oraz robi głębokie badania: wygląd i wzorce, technologie, bezpieczeństwo, licencje, kwestie do rozstrzygnięcia | na starcie projektu (TRYB: BAZA, §8.15), przed decyzją „z czego zbudować” (§8.12) i przed każdą większą decyzją (TRYB: RESEARCH, §8.18) |
| **Jules** | Wykonawca: kod, testy, PR, poprawki | każde zadanie |
| **GitHub Actions** | Testy przy każdym PR – jedyna twarda blokada | automatycznie |
| **CodeRabbit** (opcjonalnie, darmowy w repo publicznym [D]) | Komentuje każdy PR; Jules poprawia uwagi | automatycznie |
| **Claude Code** (opcjonalnie) | Druga para oczu dla ryzykownych PR, naprawy, których Jules nie umie | rzadko |

**Dlaczego Planista zostaje w aplikacji Gemini/Claude, a nie w Antigravity:** Antigravity działa tylko przy włączonym komputerze (z telefonu da się go jedynie podglądać [P]), nie ma Deep Research ani Gemów, a automatyczne zakładanie zadań dla Julesa zabrałoby Ci kontrolę nad falą. Ręczne wklejenie promptów to minuta na falę – świadomie zostawiamy ten krok.

**Research robi Gemini, weryfikuje ktoś inny.** Gemini Deep Research (3.1 Pro, aplikacja Gemini) jest świetny do zbierania i porównywania szeroko – gotowe bazy, pakiety, shadery, wzorce wyglądu, technologie, licencje, kwestie do podjęcia. Ale to **wsparcie, nie źródło prawdy**: w tym projekcie jego raporty miały błędy (nieistniejące reguły i funkcje, przekręcone nazwy modeli i liczby, błędnie odczytane badania) [R – nasze doświadczenie]. Dlatego raport przechodzi weryfikację (§8.19), zanim cokolwiek z niego trafi do decyzji, `ELEMENTY.md` albo kodu.

**Nikt nie ocenia sam siebie:** Jules pisze → testy GitHuba i (opcjonalnie) CodeRabbit sprawdzają → przy ryzykownych zmianach patrzy Claude [D – zalecenie Anthropic: recenzja w świeżym kontekście].

---

## 3. Sesja – podstawowa pętla

0. **Raz na początku projektu:** szukamy bazy i elementów (§3b), układamy warstwy (§3c). Dalej pracujemy falami (§3a).
1. **Nowy czat u Planisty** → wiadomość startowa (§8.2).
2. Planista czyta `STAN.md`, mówi prosto, co zrobimy, i daje **3–6 promptów dla Julesa** + kolejność („1 i 2 naraz, 3 po scaleniu 1”).
3. **Wklejasz prompt do Julesa** (aplikacja → repo → wklej → start). Niezależne prompty możesz puścić równolegle.
4. Jules otwiera PR z sekcją **„Po ludzku”**: co zrobił, co obejrzeć, czego nie zrobił.
5. **Czekasz na ✅.** ❌ → Jules poprawia sam. Po 2 nieudanych próbach → `TRYB: POMOC` (§8.5).
6. **Oglądasz podgląd** i scalasz („Squash and merge”). Ryzykowny PR (⚠️) → najpierw `TRYB: RYZYKO` (§8.7).
7. **Coś poszło inaczej niż w planie?** → `TRYB: ODŚWIEŻ` (§8.4) – Planista poprawia pozostałe prompty. Prompty pisane z góry zakładają, że wcześniejsze wyszły zgodnie z planem [O].
8. **Ostatni prompt sesji:** Jules aktualizuje `docs/STAN.md`.
9. **Kontrola** w Gemini (§8.6) – raz na sesję albo gdy coś niepokoi.

**Dlaczego to działa** [D – Anthropic, best practices]: plan oddzielony od wykonania; każde zadanie w czystym kontekście; każde ma sprawdzalne „Gotowe, gdy” zamienione na test („jeśli nie możesz tego sprawdzić, nie wdrażaj”); równolegle tylko zadania, które nie ruszają tych samych plików [P].
**Mierz, nie zgaduj:** w badaniu METR programiści czuli się z AI szybsi, a byli wolniejsi [R]. Po kilku sesjach policz, ile zadań zamykasz tygodniowo.

---

## 3a. Fale – jak dzielimy pracę

**Fala** = zestaw promptów, które Planista sprawdził, że:
- zmieniają **rozłączne pliki** (każdy prompt ma linię „Pliki:”; jeśli dwa prompty dotykają tego samego pliku – jeden idzie do następnej fali),
- nie zależą od siebie (żaden nie czeka na wynik innego),
- da się je sprawdzić testami i obejrzeć po kolei.

**Jak to wygląda:**
1. Planista pisze **falę N** na podstawie stanu po fali N−1 (nie z góry na wszystkie fale – plany z góry się starzeją [O]).
2. Wklejasz wszystkie prompty fali do Julesa **naraz** i czekasz.
3. **Bramka fali** = **zielone CI** na `main` po scaleniu wszystkich PR fali (testy GitHuba to jedyny warunek – nie sprawdzasz niczego ręcznie, o ile fala nie zawiera zmian widocznych, które i tak oglądasz przy scalaniu). Czerwone → naprawiasz (§8.5), następnej fali nie piszesz.
4. Po bramce: Planista pisze falę N+1 i zapisuje w `STAN.md` jedną linię: „Fala N zamknięta: <co weszło>, <co odłożone>”.

**Fale a warstwy:** fala bierze zadania z jednej warstwy (§3c), których zależności są już zamknięte. Warstwy ustalają **kolejność dużych kroków**, fale ustalają **co puszczamy naraz**.

**Dlaczego tak** [P]: równoległe zadania działają dobrze, gdy są niezależne i mają jasne granice; przy nakładających się plikach rośnie liczba konfliktów i poprawek [D – praktyki równoległych agentów].
**Limit:** Jules – 15 zadań równolegle, 100 dziennie [D]. Fala 3–5 zadań to zwykle zapas.

---

## 3b. Gotowe elementy i bazy – punkt wyjścia każdego projektu

**Zasada:** najpierw szukamy, potem piszemy. Szukamy na kilku poziomach, od największego:

| Poziom | Co | Przykłady | Jak wchodzi do projektu |
|---|---|---|---|
| **A. Baza** | Gotowa aplikacja, gra, szablon lub narzędzie, które działa prawie jak nasz produkt | repo open source z działającą grą, aplikacją, edytorem, generatorem | fork lub kopia jako **start repo** (poniżej) |
| **B. Pakiet** | Biblioteka z rejestru | npm / PyPI: mapy, wykresy, fizyka, UI | `pnpm add` + adapter (jeden plik) |
| **C. Zasób** | Shader, model 3D, tekstura, dźwięk, czcionka, ikona, dane | galerie shaderów, repozytoria zasobów, otwarte dane | plik w repo + wpis w rejestrze elementów z licencją |
| **D. Usługa** | Gotowy dostawca | logowanie, płatności, maile, analityka, formularze, hosting | konto + klucze w Secrets, integracja przez adapter |
| **E. Fragment** | Kilkadziesiąt linii z cudzego repo | funkcja, wzór, snippet | **tylko** przy licencji pozwalającej + atrybucja; w razie wątpliwości szukamy pakietu |

Własny kod: nasza logika, połączenie elementów w całość, to co wyróżnia produkt.

### Szukanie bazy (poziom A) – krok po kroku
1. **Opis jednym zdaniem:** „szukam gotowej <gry/aplikacji/narzędzia>, która robi <1–3 rzeczy kluczowe>” → `TRYB: BAZA` (§8.15, Gem Research; przy dużej stawce pełny Deep Research, §8.18). Wynik: 3–5 kandydatów z różnych miejsc (GitHub, listy „awesome”, rejestry, strony twórców).
2. **Kryteria bazy:**
   - **licencja** pozwala na modyfikację **i na to, co planujemy** (publikacja strony, sprzedaż) – zob. tabela niżej;
   - **działa** – da się ją uruchomić lokalnie/w CI bez cudów; ma testy lub przynajmniej da się je dopisać;
   - **dopasowanie** – pokrywa ≥ 60–70% naszych kluczowych funkcji [O], stos zgodny z naszym lub prostszy do przejęcia;
   - **żyje** – wydanie lub commity w ostatnich ~12 miesiącach, Issues nie wskazują na porzucenie [O];
   - **czysta struktura** – podzielona na moduły, a nie jeden plik 5000 linii (jeśli tak – szacujemy koszt rozbicia);
   - **zasoby i znaki** – kod ma licencję, ale grafika, dźwięk, nazwa i logo często **nie**; zawsze sprawdzamy osobno [O].
3. **Decyzja = Ty** (Planista rekomenduje). Zapis: `docs/ELEMENTY.md` + linia w „Decyzjach”.
4. **Wprowadzenie bazy do repo:**
   - **Fork** na GitHubie (zachowuje związek z oryginałem; fork publicznego repo jest publiczny – prywatną kopię robi się ręcznie, sprawdź w dokumentacji GitHuba [?]) **albo** kopia bez historii (czysty start). Zachowaj plik `LICENSE` i informacje o autorach bazy [D].
   - **Fala 0 na bazie** (§3c): prompt „Przygotuj bazę” (§9.2) – uruchom, dodaj CI i testy opisujące obecne zachowanie, napisz `docs/BAZA.md` (jak jest zbudowana, gdzie co jest, jak ją rozbudować), wypisz zasoby bez jasnej licencji (ich wymianę zlecasz osobnym zadaniem) i zaplanuj zmianę nazwy i brandingu.
5. **Dalej** budujemy na bazie falami (§3c) – najpierw porządki bez zmiany zachowania, potem nasze funkcje.

### Licencje – co wolno (skrót [D], nie jest poradą prawną)
| Licencja | Użycie w projekcie publikowanym lub komercyjnym | Obowiązek |
|---|---|---|
| MIT, BSD, Apache-2.0 | tak | zachować licencję i informację o autorach |
| GPL | tak, ale **jeśli rozpowszechniasz** zmodyfikowaną wersję, musisz udostępnić jej kod na GPL | kod całości otwarty |
| AGPL | j.w., a dotyczy też **usług dostępnych przez sieć** (strona = rozpowszechnianie) | kod całości otwarty dla użytkowników |
| CC0 / domena publiczna | tak | brak |
| CC BY | tak | atrybucja |
| CC BY-SA | tak | atrybucja + ta sama licencja dla pochodnych |
| CC BY-NC (i „NC” w ogóle) | **nie w projekcie komercyjnym** | — |
| **Brak licencji** | **nie** (wszelkie prawa zastrzeżone) | — |
- **Shadery z galerii** (np. Shadertoy) mają własne zasady, często restrykcyjne; domyślna licencja wymaga sprawdzenia na stronie serwisu i w nagłówku konkretnego shadera [? – nie zweryfikowałem]. Brak wzmianki o licencji ≠ wolno.
- **Cudza gra/aplikacja bez wolnej licencji:** jako inspiracja i do nauki lokalnie – tak; jako baza do publikacji – **nie**.
- Projekt tylko dla siebie (nie publikujemy, nie sprzedajemy) – wymagania są luźniejsze, ale rejestr elementów i tak prowadzimy; kiedyś zechcesz opublikować.

### Pakiet, zasób, usługa (poziomy B–D)
1. **Potrzeba w jednym zdaniu** → `TRYB: WYBÓR` (§8.12): 3 kandydatów z różnych miejsc.
2. **Kryteria:** licencja (jw.) · ostatnie wydanie ~12 mies. · dokumentacja i przykłady · działa w naszym stosie · wydawca i wiek pakietu wiarygodne (modele wymyślają nazwy pakietów i bywają one przejęte [D – USENIX 2025]) · **da się wymienić** (adapter w jednym pliku).
3. **Wybór = Twoja decyzja.** Zapis w `docs/ELEMENTY.md`.
4. **Integracja:** prompt „Element z zewnątrz” (§9.2): dodać, opakować, test.
5. **Sprzątanie:** element nieużywany po kilku falach → usuwamy (wpis w ELEMENTY.md).

### Czego nie robimy
- Nie zaczynamy od zera, gdy istnieje podobna baza lub pakiet spełniający kryteria.
- Nie bierzemy bazy ani zasobu bez sprawdzonej licencji i wpisu w `docs/ELEMENTY.md`.
- Nie wklejamy cudzych fragmentów „bo działają” – albo pakiet, albo fragment z licencją i atrybucją.
- Nie przebudowujemy bazy „na nasz styl” bez powodu – zmieniamy to, co potrzebne produktowi.

---

## 3c. Plan: warstwy → fale

**Warstwy** (podzespoły) to kolejność dużych kroków. Niższa warstwa musi być gotowa, zanim zbudujemy wyższą:

| Warstwa | Co zawiera | Przykłady |
|---|---|---|
| **W0 – Fundament** | Baza lub szkielet, CI, rejestr elementów | repo z bazą, `ci.yml`, `docs/BAZA.md` |
| **W1 – Podzespoły** | Wspólne klocki, na których stoją funkcje | dane i ich ładowanie · silnik/rdzeń logiki · renderer i shadery · biblioteka komponentów UI · usługi (logowanie, płatności) |
| **W2 – Funkcje** | Rzeczy, które widzi użytkownik, złożone z podzespołów | ekran mapy · poziom gry · panel ustawień · formularz |
| **W3 – Szlif** | Wygląd, treści, wydajność, drobiazgi, wydanie | animacje, teksty, dostępność, optymalizacja |

**Dwa poziomy planowania:**
1. **Warstwy** (raz, na początku, potem rzadko): lista podzespołów i **kto od kogo zależy** → `docs/ARCHITEKTURA.md` (`TRYB: WARSTWY`, §8.16).
2. **Fale** (co fala): z zadań bieżącej warstwy wybieramy te, które można puścić naraz (§3a, `TRYB: FALA`, §8.13).

**Zasady układania fal w warstwie:**
- Zadania w jednej fali mają **rozłączne pliki** i zależności już zamknięte.
- **Pliki-węzły** (wspólny router, plik konfiguracyjny, rejestr modułów, plik typów, główna scena) to wąskie gardła – ich dotykają wszyscy. Rozwiązanie [P]: **fala przygotowawcza** – jedno zadanie tworzy puste moduły i punkty podpięcia (każdy podzespół dostaje swój plik), a dopiero potem następna fala wypełnia je równolegle, bez dotykania węzłów. „Połączenie w całość” (podpięcie gotowych modułów do węzła) to osobne zadanie na końcu warstwy.
- W jednej fali zadania **różnych podzespołów** (np. shader, punktacja, menu, dźwięk), nie wiele zadań jednego pliku.
- Zadanie o niepewnym wyniku (nowa biblioteka, trudny shader) idzie **wcześniej** i samo – jego wynik może zmienić resztę.
- Po warstwie: bramka = zielone CI + (przy W2) Twoja ocena wersji na podglądzie.

**Przykład (gra z shaderem, na bazie):**
| Fala | Warstwa | Prompty naraz | Dotykają |
|---|---|---|---|
| 0 | W0 | Przygotuj bazę (uruchom, CI, testy, `BAZA.md`, wymiana zasobów) | całe repo (sam) |
| 1 | W0/W1 | Miejsca podpięcia: puste moduły `shader/`, `punkty/`, `menu/`, `audio/` + rejestr | tylko nowe pliki + 1 węzeł |
| 2 | W1 | A: shader tła · B: punktacja · C: menu · D: dźwięki | `shader/`, `punkty/`, `menu/`, `audio/` – rozłączne |
| 3 | W1→W2 | Podpięcie modułów do głównej sceny (jedno zadanie) | główna scena |
| 4 | W2 | A: poziom 1 · B: poziom 2 · C: ekran końca | osobne pliki poziomów |
| 5 | W3 | wygląd, teksty, wydajność – wg listy | rozłączne |

Fale pisane są **po kolei**, każda po zielonym CI poprzedniej (§3a). Powyższa tabela to plan orientacyjny w `ARCHITEKTURA.md`, nie gotowe prompty.

---

## 4. Pliki w repo

| Plik | Co zawiera | Kto zmienia |
|---|---|---|
| `AGENTS.md` | Jak pracować: polecenia, zasady, zakazy, zasady projektu. Krótko (ok. 30–80 linii) – za długi plik model ignoruje [D] | Jules na prośbę Planisty |
| `docs/PRODUKT.md` | Co budujemy: dla kogo, co ma umieć, czego nie robimy. Zmienia się rzadko | Jules na prośbę Planisty |
| `docs/STAN.md` | Gdzie jesteśmy: co działa, bieżąca warstwa i fala, plan kolejnych, problemy, decyzje. Do ~100 linii | Jules – ostatni prompt fali |
| `docs/ELEMENTY.md` | **Rejestr gotowych elementów**: nazwa · źródło (link) · wersja lub commit · licencja · do czego · wymagana atrybucja · data wyboru. Dotyczy baz, pakietów, shaderów, zasobów, usług | Jules na prośbę Planisty (przy każdym elemencie) |
| `docs/BAZA.md` (gdy jest baza) | Jak zbudowana jest baza: struktura, gdzie co leży, jak ją rozbudować, co zmieniliśmy względem oryginału | Jules (Fala 0) |
| `docs/ARCHITEKTURA.md` | Warstwy i podzespoły, zależności, pliki-węzły, orientacyjny plan fal (§3c) | Jules na prośbę Planisty |
| `docs/STYL.md` (opcjonalnie) | Wygląd: kolory, czcionki, wzorce | jw. |
| `CLAUDE.md` (opcjonalnie) | Jedna linia `@AGENTS.md` – Claude Code czyta `CLAUDE.md`, nie `AGENTS.md` [D] | raz |
| `.github/pull_request_template.md` | Szablon PR z „Po ludzku” | raz |
| `.github/workflows/ci.yml` | Testy | raz |

**Jedno źródło prawdy na temat.** Nie trzymaj kilku planów i starych instrukcji w repo – Gemini po imporcie przeczyta wszystko i dostanie sprzeczne polecenia. Stare wersje są w historii gita.

---

## 5. Repozytorium: publiczne czy prywatne

| | Publiczne | Prywatne (darmowe) |
|---|---|---|
| Testy GitHub Actions | bez limitu [D] | 2000 min/mies. [D] |
| Reguły chroniące `main` | działają | wymagają planu Pro [R] |
| Blokada wypchnięcia klucza (push protection) | za darmo [D] | niezweryfikowane |
| CodeRabbit | pełne recenzje [D] | tylko podsumowania [D] |
| Claude czyta pliki z linków | tak | nie – integracja GitHub w Projekcie (§7) |
| Gemini importuje repo | tak [D] | tylko po połączeniu konta GitHub |

- **Publiczne** – domyślnie (kod strony i tak widać w przeglądarce).
- **Mieszane** – produkt płatny: publiczny interfejs + małe prywatne repo na backend, prompty, płatne treści.
- **Prywatne** – projekt klienta, dane osobowe, NDA.
- **Klucze w publicznym repo boty znajdują w minuty** [R – kilka testów], a usunięcie commita nie pomaga [D]. Wyciek → najpierw unieważnij klucz u dostawcy.
- Projekt zarabiający: darmowy Vercel (Hobby) jest tylko do użytku niekomercyjnego [D].
- Przed upublicznieniem starego repo: prompt „Sprawdź historię” w §9.2.

---

## 6. Zasady bezpieczeństwa (krótko)

1. Klucze i hasła tylko w ustawieniach (GitHub Secrets, Vercel). Nigdy w kodzie, czacie, promptach.
2. Klucze **publiczne z założenia** (np. klucz projektu analityki w przeglądarce) są dozwolone; tajne – nigdy w kodzie przeglądarki (wszystko z `VITE_` trafia do przeglądarki [D]).
3. Scalasz tylko z ✅.
4. Nowy pakiet: Jules podaje nazwę, link do rejestru, po co. Modele potrafią wymyślać nazwy pakietów: ok. 20% sugestii w starszym badaniu [D – USENIX 2025], ok. 5–6% w nowszych modelach [R – preprint 2026]. Atakujący rejestrują takie nazwy. Ochrona automatyczna: pnpm 11 z blokadami (§10.5a) – nowe pakiety czekają, skrypty instalacyjne nie uruchamiają się bez zgody. To nie zastępuje sprawdzenia, czy pakiet jest prawdziwy i znany.
5. ⚠️ Ryzykowne (logowanie, płatności, dane osób, klucze, nagłówki bezpieczeństwa, pliki CI) → `TRYB: RYZYKO` przed scaleniem.
6. Zepsuta produkcja → w hostingu przywróć poprzednią wersję (Vercel: Instant Rollback), potem `TRYB: POMOC`.
7. W GitHub włącz Secret scanning i Push protection.

---

## 7. Jak dawać AI kontekst

- **Claude (czat):** otwiera tylko linki, które **sam wkleisz** w wiadomości [D] – dlatego każdy czat zaczynasz od linku do `STAN.md`. Pliki, które Planista ma przeczytać, wskazuje linkami (po 1–3).
  Stały link (repo publiczne): `https://raw.githubusercontent.com/<konto>/<repo>/main/docs/STAN.md`
- **Claude – repo prywatne:** Projekt → „+” → GitHub → wybierz `AGENTS.md` i `docs/` → przed sesją „Sync” [D].
- **Gemini:** wklejasz ten sam link. Pytania o cały kod: na komputerze „+” → import repo (publiczne, do 5000 plików i 100 MB, „zdjęcie” z chwili importu; dalej możesz pisać na telefonie) [D]. Nie otworzy linku → otwórz w przeglądarce, skopiuj treść, wklej.
- **Jules:** widzi całe repo i sam czyta `AGENTS.md` [D]. Inne pliki wskazujesz w prompcie: „Przeczytaj najpierw: …”.
- **Claude Code:** pracuje na repo bezpośrednio.

---

## 8. Biblioteka promptów

### 8.1 Instrukcje Planisty (wklej do instrukcji projektu Claude **i** do Gema w Gemini)
```text
Jesteś Planistą (architektem) projektu <NAZWA>. Właściciel nie programuje:
mów prosto, termin techniczny wyjaśniaj w pół zdania.

Zawsze najpierw przeczytaj docs/STAN.md z linku od właściciela (nie możesz → poproś o treść).
Nie zgaduj stanu projektu ani zawartości plików – poproś o link.
Napisz 2 linie potwierdzenia: na czym stoimy, co dalej wg STAN.md.

Tryb rozpoznajesz z pierwszej linii wiadomości (TRYB: ...). Bez trybu – odpowiedz normalnie.
Pracujemy falami (§3a): prompty na jedną falę muszą zmieniać rozłączne pliki; następną falę piszesz dopiero po bramce poprzedniej.
Preferuj gotowe elementy i bazy zamiast własnego kodu (§3b); szukanie bazy = TRYB: BAZA, wybór elementu = TRYB: WYBÓR.
Plan układasz w warstwy (§3c): najpierw podzespoły, potem funkcje. W fali tylko zadania rozłącznych plików; pliki-węzły
obsługuj osobnym zadaniem przygotowawczym i osobnym zadaniem podpięcia. Każdy element z zewnątrz = wpis w docs/ELEMENTY.md
(źródło, licencja, wersja). Nie bierz niczego bez sprawdzonej licencji.

Zasady promptów dla Julesa:
- jeden prompt = jedna mała rzecz, którą da się obejrzeć lub sprawdzić testem;
- każdy ma „Gotowe, gdy” – warunki zamieniane na testy;
- prompty, które mogą iść równolegle, nie mogą zmieniać tych samych plików;
- ryzykowne (logowanie, płatności, dane osób, klucze, CI, nagłówki) oznacz ⚠️;
- nowy pakiet tylko z uzasadnieniem.

Nie wymyślaj ustawień, funkcji narzędzi ani nazw pakietów – nie wiesz, napisz „nie wiem, sprawdźmy”.
Nie proponuj nowych narzędzi ani automatów, jeśli właściciel nie prosi.
„Co dalej” (maks. 3 krótkie punkty) podajesz **tylko na końcu fali** – po zielonym CI: co zamknęliśmy, co odłożone, co proponujesz w następnej fali. W środku fali nie dodawaj tego bloku.
```

### 8.2 TRYB: SESJA – zaplanuj sesję
```text
TRYB: SESJA
Stan: <link do STAN.md>
Cel (opcjonalnie): <co chcę mieć na koniec, np. „formularz kontaktowy działa”>
```
Planista odpowiada: 3–5 zdań po ludzku (co zrobimy, co zobaczy użytkownik) → prompty w formacie §9.1 → kolejność → ostatni prompt „Zaktualizuj STAN.md”.

### 8.3 TRYB: START – nowy projekt (Claude, najlepszy model)
```text
TRYB: START
Pomysł: <kilka zdań>
Zadawaj mi pytania po kolei (maks. 3 naraz), aż zrozumiesz: dla kogo, co ma umieć pierwsza wersja,
czego nie robimy, czy będzie zarabiać, czy są dane osób. Potem:
1) najpierw sprawdź, czy istnieje gotowa baza lub gotowe elementy (wypisz, czego szukać – to zadanie
   dla TRYB: BAZA w Gem Research; poczekaj na wynik i moją decyzję),
2) zaproponuj technologię (2 opcje, prosto: plusy/minusy, rekomendacja) – zgodną z wybraną bazą,
3) typ repo (publiczne/mieszane/prywatne),
4) napisz pełne pliki: docs/PRODUKT.md, docs/STAN.md, docs/ELEMENTY.md, AGENTS.md,
5) zaproponuj warstwy (TRYB: WARSTWY) i pierwszą falę: Fala 0 – szkielet albo przygotowanie bazy + ci.yml.
```
Wywiad przed specyfikacją to zalecana praktyka przy większych rzeczach [D – Anthropic].

### 8.4 TRYB: ODŚWIEŻ – coś poszło inaczej
```text
TRYB: ODŚWIEŻ
Stan: <link>
Co wyszło (z sekcji „Po ludzku” w PR):
<wklej>
Popraw pozostałe prompty tej sesji, jeśli trzeba. Niezmienione napisz „bez zmian”.
```

### 8.5 TRYB: POMOC – błąd albo problem
```text
TRYB: POMOC
Problem: <co się dzieje / link do PR>
Błąd: <wklej komunikat z PR lub zrzut>
Ile razy Jules próbował: <n>
Wyjaśnij prosto, co się stało, i daj gotowy tekst dla Julesa.
```
Po 2 nieudanych poprawkach lepiej **nowe zadanie z lepszym promptem** niż trzecia poprawka w tym samym – kontekst jest zaśmiecony nieudanymi próbami [D – Anthropic].

### 8.6 TRYB: KONTROLA – czy dobrze idzie (Gemini, nie zjada limitu Claude)
```text
TRYB: KONTROLA
Stan: <link>
Ostatnie PR (sekcje „Po ludzku”):
<wklej>
Odpowiedz prosto, maks. 10 linii: co zrobione · czy zgodnie z planem · co niepokoi · jedna rzecz na teraz.
```
Wersja głęboka (komputer): import repo do czatu Gemini + „Czy kod zgadza się z PRODUKT.md i STAN.md? Co jest niedokończone, zdublowane albo ryzykowne? Bez drobiazgów stylu.”

### 8.7 TRYB: RYZYKO – przegląd ryzykownego PR (Claude)
```text
TRYB: RYZYKO
PR: <link do PR>  (+ link do zmienionego pliku, jeśli Claude nie widzi zmian)
Sprawdź tylko: bezpieczeństwo (klucze, dane osób, wstawianie HTML, uprawnienia), czy testy
sprawdzają warunki z zadania, czy zmieniono coś poza zakresem.
Werdykt: SCAL / POPRAW (gotowy tekst dla Julesa) / NIE SCALAJ. Tylko istotne problemy.
```
Repo prywatne albo duży PR → to samo w Claude Code („przejrzyj PR #nr wg tych punktów”).
Recenzent zawsze coś znajdzie – poprawiamy tylko to, co wpływa na działanie lub bezpieczeństwo [D – Anthropic ostrzega przed przekombinowaniem].

### 8.8 TRYB: WYGLĄD – ocena wyglądu (Gemini Argon)
```text
Oto zrzut/nagranie strony i opis wyglądu (STYL.md lub kilka zdań).
Wypisz maks. 7 różnic lub problemów (czytelność, odstępy, telefon, kontrast) – każdy jako
gotowe polecenie dla programisty. Bez ogólników.
```
Wynik wklejasz Julesowi jako nowy prompt.

### 8.9 TRYB: DECYZJA – wybór rozwiązania
```text
TRYB: DECYZJA
Stan: <link>
Pytanie: <np. „baza danych: Supabase czy pliki JSON?”>
Materiał: <raport Gema Research, jeśli był>
Daj 2–3 opcje: prosto, koszt (zł/mies.), trudność, ryzyko, czy da się zmienić później.
Rekomendacja + 1 linia do sekcji „Decyzje” w STAN.md.
```

### 8.10 Gem Research – instrukcje
```text
Jesteś researcherem projektu. Szukasz gotowych rozwiązań: biblioteki, komponenty, dane, wzorce.
Dla każdej propozycji: nazwa · link do repozytorium i rejestru (npm/PyPI) · licencja ·
ostatnie wydanie · popularność · ryzyka. Nie podawaj pakietu, którego istnienia nie sprawdziłeś.
Wynik: maks. 3 rekomendacje + tabela. Decyzję podejmuje Planista.
```
Gem Research służy do szybkich, wąskich zapytań (jeden element, jedna biblioteka). **Szerokie badania** – przez Deep Research (§8.18). Czy Gem może sam uruchomić Deep Research – niezweryfikowane [?]; jeśli nie, uruchom Deep Research w zwykłym czacie Gemini z promptem z §8.18.

### 8.11 TRYB: PORZĄDKI – raz w miesiącu
```text
TRYB: PORZĄDKI
Stan: <link> · AGENTS.md: <link>
1) Co w AGENTS.md jest zbędne albo powtarzane? (krótszy plik = lepiej słuchany)
2) Jakie błędy Jules powtarza? Zaproponuj zasadę albo test.
3) Co w naszym sposobie pracy spowalnia? Co usunąć?
4) Dług techniczny: 3 najważniejsze rzeczy jako prompty dla Julesa.
```

### 8.12 TRYB: WYBÓR – gotowy element zamiast własnego kodu (Gem Research lub Claude)
```text
TRYB: WYBÓR
Potrzeba (1 zdanie): <np. „wykres słupkowy z tooltipami, responsywny”>
Stos projektu: <z AGENTS.md>
Licencja projektu: <np. prywatny / publiczny MIT>
Daj 3 kandydatów z różnych miejsc (GitHub, npm/PyPI, dokumentacja twórców, listy „awesome”).
Dla każdego w tabeli: nazwa + link · licencja · ostatnie wydanie · popularność · rozmiar i zależności ·
czy działa z naszym stosem · główne ryzyko · czy da się wymienić (adapter).
Nie podawaj pakietu, którego istnienia nie sprawdziłeś – napisz „niezweryfikowane”.
Na końcu: rekomendacja jednego + 1 linia do sekcji „Decyzje” w STAN.md.
```
Dla usług (logowanie, płatności, maile): to samo, ale kryteria: zgodność z przepisami o danych, cena przy wzroście, eksport danych, czy działa w Polsce.

### 8.13 TRYB: FALA – prompty na jedną falę (Gemini lub Claude)
```text
TRYB: FALA
Stan: <link do STAN.md> · Architektura: <link do ARCHITEKTURA.md> · Elementy: <link do ELEMENTY.md>
Zadania do rozpisania: <lista lub „wg planu w STAN”>
Zrób falę N:
1) Prompty dla Julesa w formacie §9.1, tylko takie, które mogą iść naraz.
2) Tabela kolizji: prompt × pliki (także pliki-węzły). Jeśli dwa dotykają tego samego pliku – przenieś do fali N+1.
   Bierz zadania z bieżącej warstwy (docs/ARCHITEKTURA.md), których zależności są zamknięte.
3) Bramka fali N: zielone CI na main po scaleniu wszystkich PR tej fali (dopisz warunek dodatkowy tylko, jeśli jest naprawdę potrzebny).
4) Co odkładam i dlaczego (maks. 3 punkty).
5) Ostatni prompt: aktualizacja STAN.md (fala zamknięta, nowa fala, dług, decyzje).
Nie pisz fali N+1, zanim nie dostaniesz wyniku bramki.
```

### 8.15 TRYB: BAZA – szukanie gotowej bazy (Gem Research lub Claude)
```text
TRYB: BAZA
Chcę zbudować: <opis produktu jednym zdaniem>
Funkcje kluczowe (1–3): <…>
Nasz stos (jeśli jest): <…> · Cel: tylko dla mnie / publikacja / sprzedaż
Znajdź 3–5 gotowych aplikacji, gier, szablonów lub narzędzi, które robią prawie to samo i można je użyć jako bazy.
Szukaj na GitHubie, w listach „awesome”, rejestrach pakietów, galeriach i na stronach twórców.
Tabela dla każdej: nazwa + link · co robi · licencja kodu · licencja zasobów (grafika, dźwięk) · ostatnia aktywność ·
stos · szacunek pokrycia naszych funkcji (%) · czy ma testy · główne ryzyko · czy można użyć przy naszym celu.
Nie podawaj niczego, czego istnienia i licencji nie sprawdziłeś – napisz „niezweryfikowane”.
Na końcu: rekomendacja jednej bazy albo „lepiej od zera, bo …” oraz co z bazy trzeba będzie wymienić.
```

### 8.16 TRYB: WARSTWY – podzespoły i plan fal
```text
TRYB: WARSTWY
Produkt: <link do PRODUKT.md> · Baza: <link do BAZA.md lub „od zera”> · Elementy: <link do ELEMENTY.md>
Rozpisz architekturę w warstwach W0–W3 (§3c):
1) lista podzespołów w W1 i co każdy robi (po ludzku), 2) zależności (kto czego potrzebuje),
3) pliki-węzły i jak je ominąć (fala przygotowawcza, osobne podpięcie),
4) orientacyjny plan fal: numer · warstwa · zadania naraz · które pliki dotykają,
5) co jest ryzykowne lub niepewne i powinno iść najpierw.
Wynik jako gotowa treść docs/ARCHITEKTURA.md. Jeszcze nie pisz promptów – to dopiero TRYB: FALA.
```

### 8.18 TRYB: RESEARCH – Gemini Deep Research (do wszystkiego, co wymaga szerokiego badania)
Gdzie: aplikacja Gemini → włącz **Deep Research** → wklej prompt. Praca trwa kilka–kilkanaście minut; potem raport. Limit zapytań zależy od planu [? – sprawdź w aplikacji].

**Kiedy używać:** gotowe bazy i pakiety (duża stawka: wybór bazy całego projektu) · zasoby (shadery, modele, dźwięki, czcionki) · wygląd i wzorce UX („jak wyglądają dobre <aplikacje tego typu>”) · wybór technologii · bezpieczeństwo i licencje · każda kwestia „co wybrać / jak to robią inni”. **Nie używać** do drobiazgów (wystarczy Gem Research lub Planista z wyszukiwaniem) ani do pytań o nasz kod (import repo).

**Prompt uniwersalny:**
```text
Zrób głęboki research (Deep Research).
Temat: <…>
Decyzja, którą ma wesprzeć: <np. „którą grę/aplikację wziąć jako bazę”, „jaką bibliotekę map wybrać”>
Kontekst projektu: <stos, typ, publikacja/sprzedaż, ograniczenia – skopiuj z PRODUKT.md i AGENTS.md>
Zakres: <co badać> · Poza zakresem: <czego nie badać>
Rodzaj: [A] gotowe bazy/pakiety/zasoby  [B] wygląd i wzorce  [C] technologia  [D] bezpieczeństwo/licencje  [E] inne

Wymagania wobec wyniku:
- tabela porównawcza (dla A: licencja kodu i zasobów, ostatnie wydanie, aktywność, stos, testy, rozmiar, pokrycie naszych funkcji;
  dla B: przykłady z linkami i opisem wzorców, dostępność, telefon; dla C: 2–3 opcje, koszt, trudność, odwracalność;
  dla D: źródła oficjalne, co obowiązuje w Polsce/UE – to nie jest porada prawna),
- każde twierdzenie z linkiem do źródła pierwotnego (dokumentacja, repozytorium, strona twórcy). Bez linku = napisz „niezweryfikowane”,
- oddziel fakty od opinii; przy faktach podaj datę („stan na …”),
- nie wymyślaj nazw pakietów, funkcji, ustawień, wersji ani liczb; jeśli nie jesteś pewien, napisz to,
- na końcu: rekomendacja, 3 największe ryzyka i lista rzeczy, których nie udało się ustalić,
- po polsku, prosto; długość: tabela + maks. 2 strony tekstu.
```
**Co dalej z raportem:** nie wklejaj go od razu do Julesa i nie zapisuj do `ELEMENTY.md`. Najpierw `TRYB: WERYFIKACJA` (§8.19). Pełny raport zachowaj poza repo (np. w Dysku) albo, jeśli ma wracać do kolejnych decyzji, w `docs/research/<data>-<temat>.md`; do `STAN.md` trafia tylko 1 linia decyzji, do `ELEMENTY.md` – wpis zweryfikowanego elementu.

### 8.19 TRYB: WERYFIKACJA – sprawdzenie raportu z Deep Research
```text
TRYB: WERYFIKACJA
Raport: <wklej treść albo linki do kluczowych źródeł z raportu>
Decyzja, której dotyczy: <…>
1) Wypisz maks. 10 twierdzeń, od których zależy decyzja (nazwy pakietów/baz, licencje, wersje, liczby, „X potrafi Y”).
2) Każde oznacz: POTWIERDZONE (z linkiem, który otworzyłeś) · NIEPOTWIERDZONE · SPRZECZNE · NIE DA SIĘ SPRAWDZIĆ.
3) Sprawdź osobno: czy każdy wskazany pakiet/repo istnieje (rejestr/GitHub), licencja kodu i zasobów, data ostatniego wydania.
4) Co z raportu można przyjąć do decyzji, a co trzeba poprawić lub odrzucić. Maks. 12 linii, po ludzku.
Nie wymyślaj – jeśli nie możesz otworzyć źródła, napisz to.
```
**Kto weryfikuje:** przy ważnych decyzjach (baza projektu, płatności, licencje) – **inna rodzina modeli niż research**, czyli Claude (otwiera tylko linki wklejone przez Ciebie [D] – wklej linki kluczowych źródeł, nie tylko sam raport). Przy mniejszych – Planista w Gemini z wyszukiwaniem, a Ty w repo/rejestrze otwierasz 2–3 kluczowe linki (licencja i data wydania są na stronie repozytorium). Repo prywatne lub brak limitu Claude: weryfikujesz sam te trzy rzeczy – istnienie, licencję, datę wydania.

### 8.17 TRYB: WYDANIE – przed publikacją
```text
TRYB: WYDANIE
Stan: <link> · adres strony: <link>
Daj mi listę kontrolną do przejścia na telefonie (maks. 10 punktów) i prompty dla Julesa na to, czego brakuje.
```
Minimum: działa na telefonie i komputerze · testy zielone · brak kluczy w kodzie · zgody na analitykę (jeśli jest) · hosting zgodny z użyciem (komercyjne/niekomercyjne).

---

## 9. Prompty dla Julesa

### 9.1 Format podstawowy
```text
PROMPT <nr> – <tytuł>   (po ludzku: <co to da, 1 zdanie>)   [⚠️ jeśli ryzykowne]
Przeczytaj najpierw: <pliki, np. docs/STYL.md> / —
Zadanie: <co zrobić, konkretnie>
Pliki: <które zmienić>
Gotowe, gdy:
- <sprawdzalny warunek>   ← każdy warunek = test
- <…>
Nie ruszaj: <czego nie zmieniać>
Uruchom wszystkie testy i popraw błędy, zanim otworzysz PR.
W opisie PR dodaj sekcję „Po ludzku”: co zrobiłeś, co sprawdzić na podglądzie, czego nie zrobiłeś.
```

### 9.2 Odmiany
**Poprawka błędu** – najpierw test, który pokazuje błąd [D – Anthropic]:
```text
Błąd: <co widzi użytkownik>. Prawdopodobnie w: <plik/obszar>.
Najpierw napisz test, który ten błąd pokazuje (ma nie przechodzić), potem napraw, aż przejdzie.
Napraw przyczynę, nie ukrywaj objawu.
```
**Według wzoru z repo:**
```text
Zrób <nową rzecz> tak samo jak <istniejący plik/komponent> – ten sam styl i struktura.
Bez nowych bibliotek.
```
**Wygląd według zrzutu:**
```text
[zrzut] Zrób ten wygląd w <komponent>. Porównaj wynik ze zrzutem, wypisz różnice i popraw.
```
**Tylko testy:**
```text
Dopisz testy dla <plik/funkcja>: przypadki <lista>. Nie zmieniaj kodu aplikacji.
Jeśli test wykryje błąd – opisz go w PR, nie naprawiaj.
```
**Porządek (refaktor):**
```text
Uporządkuj <plik/obszar>: <cel, np. rozbij na mniejsze części>. Zachowanie ma się nie zmienić –
wszystkie istniejące testy muszą przejść bez zmian.
```
**Nowy pakiet:**
```text
Potrzebujemy <funkcja>. Zaproponuj w PR 1 pakiet: nazwa, link do npm, licencja, pobrania tygodniowo,
dlaczego ten. Dodaj go dopiero w tym PR i użyj w <miejsce>.
```
**Przygotuj bazę (Fala 0, po wprowadzeniu bazy do repo):**
```text
To repo to gotowa baza <nazwa, link do oryginału, licencja>. Nie zmieniaj jej zachowania.
1. Uruchom ją i opisz w PR, jak (polecenia, wersje). Napraw tylko to, co blokuje uruchomienie.
2. Dodaj CI (ci.yml) i testy opisujące obecne zachowanie kluczowych funkcji.
3. Napisz docs/BAZA.md: struktura, gdzie co leży, jak dodać funkcję, pliki-węzły.
4. Wypisz w docs/ELEMENTY.md wszystkie zasoby (grafika, dźwięk, czcionki, modele, shadery) z ich licencją;
   zaznacz te bez jasnej licencji – NIE usuwaj ich sam, wypisz w PR.
5. Zachowaj plik LICENSE i informacje o autorach. Nie zmieniaj nazwy ani brandingu bez osobnego zadania.
Nic poza tym.
```
**Miejsca podpięcia (fala przygotowawcza):**
```text
Przygotuj miejsca na moduły: <lista, np. shader/, punkty/, menu/, audio/>.
Dla każdego utwórz katalog z pustym modułem (eksport + krótki komentarz co tu ma być) i jeden test „moduł się ładuje”.
Zarejestruj je w <plik-węzeł> w jednym miejscu. Nie implementuj funkcji.
Cel: kolejne zadania będą dotykały tylko własnych katalogów, nie plików wspólnych.
```
**Zasób z zewnątrz (shader, model, dźwięk, czcionka):**
```text
Dodaj <zasób> z <link>, licencja <…> (sprawdzona przez właściciela). Umieść w <ścieżka>.
Dopisz wpis w docs/ELEMENTY.md (źródło, licencja, autor, atrybucja) i – jeśli licencja wymaga – w stopce/stronie „O projekcie”.
Nie modyfikuj zasobu inaczej niż wymaga zadanie; zmiany opisz w wpisie.
```
**Podpięcie modułów do całości (koniec warstwy):**
```text
Podepnij gotowe moduły <lista> do <plik-węzeł> zgodnie z docs/ARCHITEKTURA.md. Nie zmieniaj ich wnętrza.
Test: <scenariusz end-to-end>.
```
**Sprawdź historię (przed upublicznieniem starego repo):**
```text
Uruchom gitleaks na całej historii repo i wypisz w PR tylko: plik, commit, typ znaleziska – BEZ wartości sekretów.
Sprawdź też, czy w historii są pliki .env, dane osób lub płatne treści. Niczego nie usuwaj i nie zmieniaj historii.
```
**Element z zewnątrz (wybrany w TRYB: WYBÓR):**
```text
Dodaj pakiet <nazwa> w wersji <x> (decyzja w STAN.md, link <…>, licencja <…>).
Opakuj go w jednym pliku <ścieżka>, żeby reszta projektu nie wiedziała o bibliotece.
Test: <co ma działać> – napisz go najpierw.
Nie kopiuj kodu z internetu. Nie dodawaj innych pakietów.
```
**Aktualizacja STAN.md (ostatni prompt sesji):**
```text
Zastąp docs/STAN.md dokładnie poniższą treścią. Nic więcej nie zmieniaj.
<pełna treść od Planisty>
```
**Zmiana zasad dla Julesa:**
```text
W AGENTS.md w sekcji <nazwa> dodaj/zmień: <treść>. Nic więcej nie zmieniaj.
```

### 9.3 Uwagi praktyczne
- Kilka promptów naraz – tylko gdy nie zmieniają tych samych plików (Planista to pisze).
- Poprawka w otwartym PR: komentarz w PR do Julesa albo w aplikacji Jules w tym samym zadaniu – sprawdź, co działa w Twoich ustawieniach [?].
- Jules sam naprawia czerwone testy na swoich PR (CI Fixer, od 02.2026) [D].
- Limit AI Pro: 100 zadań/dobę, 15 równolegle [D] – w praktyce ogranicza Cię czas na oglądanie, nie limit.

---

## 10. Szablony plików

### 10.1 `AGENTS.md`
```markdown
# Zasady dla agentów – <projekt>
Co budujemy: docs/PRODUKT.md · Gdzie jesteśmy: docs/STAN.md · Wygląd: docs/STYL.md

## Polecenia
- Instalacja: `<np. pnpm install>`
- Przed PR uruchom: `<np. pnpm lint && pnpm typecheck && pnpm test && pnpm build>`

## Jak pracujesz
- Jedno zadanie = jeden PR. Zmieniaj tylko pliki potrzebne do zadania.
- Każdy warunek „Gotowe, gdy” = test sprawdzający zachowanie. Nie wyłączaj testów, żeby przeszło
  (wyjątek: test pomijany z powodu środowiska – z komentarzem dlaczego).
- Czerwone testy na GitHubie – popraw sam.
- Nowy pakiet – uzasadnienie w PR (nazwa, link, po co). Nie wymyślaj nazw.
- Opis PR zawsze z sekcją „Po ludzku” (dla osoby, która nie programuje).

## Nigdy
- Tajne klucze i hasła w kodzie, testach, logach (klucze publiczne z założenia – dozwolone).
- Dane z zewnątrz wstawiane jako HTML.
- Zmiany w .github/workflows/ bez prośby w zadaniu.

## Zasady projektu
- <specyficzne reguły: nazewnictwo, dane, wzorce, zakazy>

## Błędy powtarzalne (dopisywane po sesjach)
- <błąd> → <jak robić dobrze>
```

### 10.2 `docs/PRODUKT.md`
```markdown
# <nazwa> – co budujemy
Dla kogo: · Problem: · Pierwsza wersja ma umieć:
Czego NIE robimy: · Zarabia: tak/nie · Dane osób: tak/nie
Technologia: <stos> · Hosting: <gdzie>
```

### 10.3 `docs/STAN.md`
```markdown
# Stan – <data>
## Co działa (po ludzku; „sprawdzone przez właściciela: tak/nie”)
## Sesja teraz: <nr> – <co ma być na końcu>
## Bieżąca warstwa (W0–W3) i fala N · bramka: zielone CI na main · zamknięte fale (1 linia każda)
## Plan następnych sesji (1 linia każda)
## Znane problemy / dług (każdy punkt: co · skąd · priorytet · w której fali go zrobimy)
## Pomiar fal (1 linia na falę: prompty · poprawki · Twoje minuty · który model i limit)
## Decyzje (najnowsze na górze, 1 linia, kto: Claude/Gemini/Ty)
```

### 10.3a `docs/ELEMENTY.md` – rejestr gotowych elementów
```markdown
# Elementy z zewnątrz
| Element | Typ (baza/pakiet/zasób/usługa) | Źródło (link) | Wersja/commit | Licencja | Do czego | Atrybucja? | Data |
|---|---|---|---|---|---|---|---|
| <nazwa> | pakiet | <link> | 1.4.2 | MIT | wykresy | nie | 2026-10-22 |
Zasady: wpis powstaje razem z elementem; element bez licencji nie wchodzi; usunięty element – wpis skreślony z datą.
```

### 10.4 `.github/pull_request_template.md`
```markdown
## Po ludzku
Co zrobiłem:
Co sprawdzić na podglądzie:
Czego nie zrobiłem i dlaczego:

## Szczegóły (dla AI)
Zadanie: · Testy: · Nowe pakiety: brak / nazwa + link
```

### 10.5 `ci.yml` – wersja dla strony/aplikacji JS (dopasuj do projektu)
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  testy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      # interfejs: testy w przeglądarce + dostępność (Playwright + axe)
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm e2e
  bezpieczenstwo:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2   # szuka kluczy; konto osobiste – bez licencji [D]
        env:
          GITHUB_TOKEN: ${{ github.token }}
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm audit --prod --audit-level high
```
Python: odpowiedniki `pip install`, `ruff`, `pytest`, `pip-audit`. Wdrożenie: prompt do Julesa „dodaj ten plik i brakujące skrypty w package.json”.

### 10.5a Blokady pakietów (pnpm 11) – `pnpm-workspace.yaml`
pnpm 11 sam blokuje pakiety młodsze niż 1 dzień, zależności spoza rejestru i skrypty instalacyjne bez zgody [D]. Wymaga Node 22+ [D]. Dokładamy dłuższą kwarantannę i ochronę przed podmienionym wydaniem:
```yaml
minimumReleaseAge: 4320        # 3 dni (domyślnie 1 dzień)
trustPolicy: no-downgrade      # nie instaluj wydania o niższym poziomie zaufania niż poprzednie
blockExoticSubdeps: true       # domyślne w pnpm 11 – zapisane dla jasności
allowBuilds:                   # tylko te pakiety mogą uruchamiać skrypty przy instalacji
  # esbuild: true
```
Wdrożenie (prompt do Julesa): „Przejdź na pnpm 11: ustaw w package.json pole packageManager na aktualną wersję pnpm 11, dodaj powyższe ustawienia do pnpm-workspace.yaml, przenieś ewentualne onlyBuiltDependencies do allowBuilds. Nie zmieniaj nic poza tym.” Pilna łatka bezpieczeństwa młodsza niż 3 dni → wyjątek `minimumReleaseAgeExclude` z nazwą pakietu, usuń go po 3 dniach.

---

## 11. Moduły według typu projektu

- **Strona / aplikacja:** testy w przeglądarce (Playwright) + dostępność (axe); dane z API z tajnym kluczem pobierane w CI lub na serwerze, nie w przeglądarce; analityka po zgodzie użytkownika.
- **Mapy, 3D, WebGL:** nie blokuj scalania testami „piksel w piksel” (bez karty graficznej w CI są niestabilne) [P]. Testuj logikę i obecność elementów; wygląd – Ty lub Argon.
- **Gra / 3D / shadery:** zaczynamy od bazy lub silnika, nie od zera (§3b); shadery, modele, dźwięki to zasoby z licencją (ELEMENTY.md); renderer i shadery jako osobny podzespół W1 z jednym punktem podpięcia; zasady, punktacja, zapis – w osobnych modułach z testami; „czucie gry” ocenia człowiek (nagranie → Argon pomocniczo); gra sieciowa – najpierw `TRYB: DECYZJA`.
- **Skrypty, automatyzacje, roboty danych:** testy na przykładowych plikach; sekrety w Secrets; zadania z harmonogramu w GitHub Actions (`schedule`).
- **Produkt płatny:** wariant mieszany repo; hosting dopuszczający komercję; każdy PR płatności = ⚠️.
- **Logowanie, płatności, przechowywanie danych osób, maile:** wyłącznie gotowe usługi, nigdy własny kod [D – zasada z naszych wcześniejszych ustaleń]. Wybór usługi → TRYB: WYBÓR. Plan bezpieczeństwa (model zagrożeń) przygotowuje Planista, zatwierdza Claude (lub Ty po przeglądzie, jeśli Claude nie ma limitu).
- **Mobilne / desktop:** szczegóły w `TRYB: START`, gdy pojawi się taki projekt.

---

## 12. Rozbudowa – dodawaj dopiero, gdy jest potrzeba

| Sygnał | Co dodać | Jak |
|---|---|---|
| Ten sam błąd Jules robi 2× | Zasada w `AGENTS.md`, a lepiej test lub reguła lintera | prompt §9.2 „Zmiana zasad” |
| Robot (np. nocne dane) otwiera PR codziennie | Auto-scalanie **tylko jego PR** po zielonych testach | prompt: „w workflow robota dodaj `gh pr merge --auto --squash` dla PR, który tworzy” + w ustawieniach repo „Allow auto-merge” |
| Jules dodaje świeże, nieznane pakiety | Blokada pakietów młodszych niż 3 dni | pnpm 11, §10.5a [D] |
| Chcesz komentarzy do każdego PR bez wysiłku | CodeRabbit (repo publiczne – darmowy) | instalacja aplikacji + `.coderabbit.yaml` z `language: pl-PL` [?] |
| Często zapominasz o ryzykownych PR | Lista plików krytycznych + sprawdzenie w CI | dopiero przy kilku ryzykownych PR tygodniowo [O] |
| Odświeżasz zrzuty wizualne | Workflow „aktualizuj zrzuty” uruchamiany ręcznie | prompt do Julesa |
| Zbyt dużo PR naraz do oglądania | Mniej promptów równolegle (2–3) | zasada w instrukcji Planisty |
| Ryzykowne PR częste, Claude ma limit | Claude Code jako stały recenzent ⚠️ | raz dziennie jedna sesja na wszystkie |

**Zasada rozbudowy:** każdy nowy element musi odpowiadać na realny problem i najlepiej coś usuwać. Przed dodaniem zapytaj Planistę: „co dzięki temu usuniemy albo przyspieszymy?”.

---

## 13. Limity i zamiana Claude ↔ Gemini

- **Brak limitu Claude:** otwierasz Gema „Planista” i wysyłasz **tę samą** wiadomość z tym samym linkiem. Nic nie przenosisz – pamięć jest w `STAN.md`.
- **Gemini do:** kontroli, pytań o kod, rutynowych sesji. **Claude do:** startu projektu, ważnych decyzji, `TRYB: RYZYKO`.
- **Decyzje zapisuj w `STAN.md`** (1 linia, kto podjął) – wtedy zmiana Planisty nie gubi ustaleń.
- **Oszczędzanie Claude:** nowy czat na każdą sesję · jeden model w jednym czacie (zmiana modelu w środku wątku pogarsza wyniki [R]) · linki zamiast całych plików · kontrola postępu w Gemini.
- **Argon:** niski limit [R] – tylko wygląd i trudne pytania. W Antigravity Argon ma osobny limit tygodniowy (AI Pro płatne, nie próbne) [D].
- **Antigravity:** limity 5-godzinne i tygodniowe, osobno Gemini i Claude [D]; użytkownicy zgłaszają kilkudniowe blokady [P] – nie opieraj na nim pracy, tylko dodatek.
- **Deep Research:** dzienna liczba raportów zależy od planu [? – sprawdź w aplikacji]; zostaw go na decyzje, które zmieniają kierunek projektu (baza, technologia, wygląd), a drobne sprawy zlecaj Gemowi Research.
- **Pomiar po każdej fali** (1 linia w STAN): liczba promptów, ile PR wymagało poprawek, Twoje minuty na oglądanie, który model i ile zużył. Po 2–3 falach zdecyduj, czy proces jest tańszy od alternatywy [O]. Nie zakładaj oszczędności – mierz.
- **Repo prywatne:** 2000 minut testów miesięcznie – roboty z harmonogramu uruchamiaj rzadziej.

---

## 14. Czego unikać

- Długich instrukcji i wielu planów naraz – model gubi zasady w szumie [D].
- Długiego czatu z wieloma poprawkami – po 2 nieudanych lepiej nowy, lepszy prompt [D].
- Scalania bez ✅ i bez obejrzenia efektu.
- Gonienia każdej uwagi recenzenta – tylko działanie i bezpieczeństwo [D].
- Narzędzi i ustawień podanych przez AI bez sprawdzenia w dokumentacji.
- Automatów „na zapas” – najpierw prosta pętla, potem §12.
- Następnej fali przed bramką poprzedniej.
- Prompt dwóch zadań na tym samym pliku w jednej fali.
- Własnego kodu tam, gdzie jest gotowa usługa, pakiet lub baza (§3b).
- Bazy, zasobu lub shadera bez sprawdzonej licencji i wpisu w ELEMENTY.md.
- Fali, w której dwa zadania dotykają pliku-węzła (najpierw fala przygotowawcza, §3c).
- Przebudowy bazy „dla porządku” bez powodu wynikającego z produktu.
- Wklejania raportu z Deep Research do Julesa, `ELEMENTY.md` lub decyzji bez weryfikacji (§8.19) – to wsparcie, nie źródło prawdy.
- Deep Research do drobiazgów: kosztuje czas i limit, a prosta sprawa nie wymaga raportu.
- Kopiowania kodu z cudzych repozytoriów bez licencji i decyzji.
- Wyłączonych usług: GitHub Models (wyłączone 30.07.2026 [D]), Gemini CLI dla AI Pro (06.2026 [D]).

---

## 15. Przejście ze starszej wersji

Prompt do Julesa (dopasuj listę – **najpierw sprawdź, które workflowy robią coś pożytecznego**, np. roboty danych, odświeżanie zrzutów):
```text
Uprość proces w repo, nie zmieniając kodu aplikacji:
1. Wypisz w PR wszystkie pliki w .github/workflows/ z jednym zdaniem „co robi”.
2. Usuń tylko te, które dotyczą starego procesu: <lista od Planisty, np. autopilot, tablica, zgody>.
   Zostaw testy (CI) i roboty robiące realną pracę (dane, zrzuty).
3. Usuń pliki starego procesu: <lista, np. scripts/autopilot/, .github/krytyczne.txt, stare docs/WORKFLOW*.md>.
4. Połącz plany w docs/STAN.md (do ~100 linii) wg wzoru poniżej; opis produktu w docs/PRODUKT.md.
5. Skróć AGENTS.md wg wzoru poniżej, zachowując sekcję „Zasady projektu” z obecnych reguł.
6. Dodaj szablon PR z sekcją „Po ludzku”.
W „Po ludzku” napisz, co usunąłeś i czy cokolwiek mogło przestać działać.
<wklej wzory §10>
```
Potem ręcznie: usuń niepotrzebne sekrety i zmienne repo (np. tokeny starych automatów – i **unieważnij je u dostawcy**), stare wymagane sprawdzenia w Settings → Rules, stare pliki z wiedzy projektu Claude.

---

## 16. Źródła
- Anthropic – Best practices for Claude Code: https://code.claude.com/docs/en/best-practices.md
- Jules – uruchamianie zadań: https://jules.google/docs/running-tasks/ · CI Fixer: https://jules.google/docs/changelog/2026-02-19
- Claude – pobieranie stron (tylko podane adresy): https://docs.claude.com/en/docs/agents-and-tools/tool-use/web-fetch-tool
- Claude – integracja GitHub: https://support.claude.com/en/articles/10167454-using-the-github-integration
- Gemini – import repo: https://support.google.com/gemini/answer/16176929?hl=en
- GitHub Actions – rozliczenia: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
- GitHub – push protection: https://github.blog/news-insights/product-news/push-protection-is-generally-available-and-free-for-all-public-repositories/
- GitHub Models – wyłączenie: https://github.blog/changelog/2026-07-01-github-models-is-being-fully-retired-on-july-30-2026/
- Wyciekłe klucze – czas użycia: https://jwatte.com/blog/leaked-api-keys-found-in-minutes-gitignore-rotation-plan.md
- Halucynowane pakiety (USENIX 2025): https://arxiv.org/abs/2406.10279
- Vercel Hobby: https://vercel.com/docs/plans/hobby
- CodeRabbit – cennik: https://docs.coderabbit.ai/about/pricing
- Równoległe zadania dla agentów: https://www.verdent.ai/guides/tasks-for-multiple-ai-coding-agents
- Anthropic – praca równoległa i podział zadań (sesje, worktrees): https://code.claude.com/docs/en/best-practices.md
- Wybór licencji (przegląd): https://choosealicense.com/
- pnpm 11 (domyślne blokady): https://pnpm.io/blog/releases/11.0 · https://pnpm.io/supply-chain-security
- Antigravity – modele w planach: https://antigravity.google/docs/models/ · Antigravity 2.0: https://antigravity.google/blog/introducing-google-antigravity-2/
- Halucynacje pakietów 2026 (preprint): https://www.alphaxiv.org/abs/2605.17062
- Doświadczenie z raportami Deep Research w tym projekcie: błędy wychwycone przy weryfikacji (nieistniejące reguły lintera, przekręcone nazwy modeli i liczby) – stąd obowiązek §8.19.
- GNU AGPL (tekst licencji): https://www.gnu.org/licenses/agpl-3.0.html
- Creative Commons – licencje: https://creativecommons.org/share-your-work/cclicenses/
- GitHub – forki: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks
- Listy „awesome” (przykład kategorii, nie rekomendacja): https://github.com/sindresorhus/awesome
