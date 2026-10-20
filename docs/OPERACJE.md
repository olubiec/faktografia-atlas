# Operacje: kto co robi i jak oszczędzać limity

Obowiązuje od 19.10.2026. Uzupełnia `docs/PROMPTY.md` (zasady twarde, wspólny blok promptów) i `docs/FALE.md` (kolejka i gotowe prompty).
Cel: drogie modele **myślą raz, na zapas**; tani model i skrypty **wykonują**; właściciel **rozumie i sam sprawdza**.

---

## 1. Role

| Kto | Do czego | Czego NIE robi | Koszt |
|---|---|---|---|
| **Opus** | Raz na 2–3 fale: plan, interfejsy (nazwy plików i eksportów), prompty w `docs/FALE.md`, audyt końca fali, decyzje architektury | Rutyny: statusów, wysyłania zadań, scalania zielonych PR | wysoki, rzadko |
| **Sonnet** | Zadania C (workflowy w `.github/`, naprawy CI), przegląd PR oznaczonych „Sonnet” w `FALE.md` §1, każdy `STOP` ze skryptów, konflikty, 2 nieudane rundy, sprawdzenie liczb w danych | Planowania wielu fal | średni |
| **Haiku** | Obsługa kolejki według §3: `status.sh`, wysyłka zadań `new-task.sh`, czekanie `wait-ci.sh`, scalanie `merge.sh` PR oznaczonych „Haiku”, krótki raport | Pisania kodu, promptów i workflowów, rozwiązywania konfliktów, decyzji „czy zakres OK”, drugiego ponownego uruchomienia CI | niski |
| **Jules** | Zadania K (kod + testy) z issue z etykietą `jules` | Sieci, sekretów, `.github/` | w planie (do 15 sesji) |
| **GitHub Actions** | Zadania S: pobieranie danych z GUS i PRNG na gałęzie `data/...` | — | darmowe |
| **Gemini (czat)** | Research i druga opinia, §7 | Zmian w repo, decyzji, sekretów | darmowy |
| **Ty** | Klikasz „Run workflow”, sprawdzasz bramki fal na telefonie (§4), uruchamiasz Jules, gdy nie ruszy sam, zatwierdzasz decyzje | Nie musisz czytać kodu | — |

**Zmiana modelu: nowa sesja, nie `/model` w długiej rozmowie.** Każdy model ma osobną pamięć podręczną (cache), więc `/model` w długim wątku wczytuje całą historię od nowa, a zmiana modelu w środku rozmowy pogarsza trzymanie się poleceń. Haiku: nowa sesja → wklej polecenie z §3. Sonnet: nowa sesja → wklej zamknięte zlecenie (co, który PR, gdzie zasady). Opus: nowa sesja na planowanie, start od `FALE.md`, `OPERACJE.md` i ostatniego raportu. Długi wątek tylko wtedy, gdy potrzebny jest jego kontekst.

**Kiedy który (prosta reguła):**
- „Co słychać? Wyślij następne. Scal gotowe.” → **Haiku**, polecenie z §3.
- Skrypt napisał `STOP`, PR ma w `FALE.md` kolumnę „Sonnet”, trzeba napisać workflow → **Sonnet**.
- Skończyła się fala z `FALE.md`, trzeba promptów na kolejne fale albo zmiany planu → **Opus**.

---

## 2. Skrypty (`scripts/ops/`)

Uruchamia je Claude w swojej sesji (w katalogu repo). Każdy kończy się jednym z dwóch słów: wynik albo **`STOP: <powód>`**. `STOP` = nic nie zostało zmienione i trzeba eskalacji (§5). Skrypty same czekają, więc model nie zużywa limitu na wielokrotne pytanie „czy już?”.

| Skrypt | Co robi | Kiedy |
|---|---|---|
| `status.sh` | main, otwarte PR z werdyktem (ZIELONE / CZERWONE / CZEKA / BRAK CI), otwarte zadania Jules, ostatnie workflowy | zawsze na początku |
| `new-task.sh <ID>` | bierze prompt z `PROMPTY.md`/`FALE.md` na main, sprawdza linię `Wymaga na main:` i duplikaty, zakłada issue z etykietą `jules` | tor wolny wg `FALE.md` §1 |
| `wait-ci.sh <PR>` | czeka do ~9 min na bramki, wypisuje wynik | po nowym commicie w PR |
| `merge.sh <PR> [--dry-run]` | CI zielone, świeże pobranie, brak usuniętych plików, pliki tylko z „Zakresu” issue, brak kolorów hex w `src/`, gotowość z draftu, squash, kontrola po scaleniu | PR ZIELONY i w `FALE.md` „Haiku” |
| `rerun.sh <PR>` | JEDNO ponowne uruchomienie nieudanych jobów (niestabilny test) | pierwsza czerwień, jeśli §6 tak mówi |
| `snapshots.sh <PR>` | odświeża zrzuty /design na gałęzi PR i uruchamia CI | gdy PR zmienia cokolwiek widocznego na /design (§6, pierwszy wiersz) |
| `kick-ci.sh <PR>` | pusty commit, gdy commit robota nie uruchomił CI | `status.sh` pokazuje „BRAK CI” |

---

## 3. Polecenie dla Haiku (wklej w całości)

```text
Jesteś operatorem projektu Faktografia Atlas (repo olubiec/faktografia-atlas, katalog /home/claude/faktografia-atlas;
jeśli go nie ma: gh repo clone olubiec/faktografia-atlas /home/claude/faktografia-atlas).
Działasz WYŁĄCZNIE według docs/OPERACJE.md §3 i kolejki docs/FALE.md §1. Nie piszesz kodu ani promptów.

Kroki (po kolei, każdy raz):
1. git -C /home/claude/faktografia-atlas fetch -q origin && git -C /home/claude/faktografia-atlas checkout -q main && git -C /home/claude/faktografia-atlas reset -q --hard origin/main
2. scripts/ops/status.sh
3. Dla każdego PR „ZIELONE”, którego zadanie ma w FALE.md §1 „Kto sprawdza PR = Haiku”: scripts/ops/merge.sh <PR>.
   PR z „Sonnet” – nie scalasz, wpisujesz do raportu.
4. Dla każdego PR „CZERWONE”: przeczytaj tabelę w OPERACJE.md §6 i zrób TYLKO to, co tam jest w kolumnie „Haiku”.
   Jeśli objaw nie pasuje do żadnego wiersza – nie zgaduj, wpisz do raportu „Sonnet”.
5. Dla każdego PR „BRAK CI”: scripts/ops/kick-ci.sh <PR>.
6. Jeśli na przegląd czeka mniej niż 6 PR: dla każdego toru z FALE.md §1, w którym nie ma otwartego zadania ani PR,
   weź PIERWSZE niewysłane zadanie tego toru i uruchom scripts/ops/new-task.sh <ID>.
   STOP „brak eksportu/pliku” = zależność jeszcze nie scalona: to normalne, idziesz dalej.
   Zadania „C (Sonnet)” nie wysyłasz – wpisujesz do raportu.
7. Raport po polsku, dokładnie w tym układzie (bez innych treści):
   (na samej górze, jeśli są) URUCHOM SONNETA: <gotowe zlecenie do wklejenia w nowej sesji>
   SCALONO: …   WYSŁANO: …   CZEKA NA JULES/CI: …   DLA SONNETA: … (z powodem ze STOP)
   DLA CIEBIE (właściciela): … (np. „Run workflow X”, „uruchom Jules dla #N”, „bramka fali – test na telefonie”)
   SPRAWDŹ SAM: 1–2 linie, co właściciel może zobaczyć w aplikacji GitHub, żeby to potwierdzić.

Nie wolno: --zakres-ok bez komentarza „zakres OK” od właściciela lub Sonneta; drugiego rerun.sh; edycji plików;
git push poza skryptami; zamykania PR; zmiany workflowów. Każdy STOP, którego nie opisuje §6 → „DLA SONNETA”.
```

Haiku można wołać, kiedy chcesz („Haiku, krok z §3”). Jedno wywołanie = jeden obieg, bez pętli.

**Jak uruchomić obieg bez `/model`:** nowa sesja Claude Code w katalogu repo i polecenie „Użyj podagenta `obieg`” (definicja: `.claude/agents/obieg.md`, model Haiku, treść = ramka wyżej). Przegląd PR: „Użyj podagenta `recenzent` dla PR #N” (`.claude/agents/recenzent.md`, model Sonnet; przy SCAL nadaje etykietę `sprawdzone`). Jeśli Twoja wersja Claude Code nie wczytuje podagentów, wklej treść pliku do nowej sesji.

---

## 4. Ty sam: jak sprawdzić, czy coś jest gotowe (aplikacja GitHub na telefonie)

**Czy PR jest gotowy do scalenia?** (to samo sprawdza `merge.sh`)
1. *Pull requests* → PR → na dole **Checks**: `verify` i `security` zielone (✓).
2. *Files changed*: nazwy plików te same co w „Zakres” w zgłoszeniu (issue o tym samym ID). Żaden plik nie jest oznaczony **deleted**.
3. Jeśli zmienia się coś w `tests/e2e/*-snapshots/` – to zrzuty wzorcowe; dozwolone tylko, gdy zadanie zmienia /design.
4. Opis PR ma tabelę „warunek → test”. Brak tabeli albo „nie zrobiłem” przy którymś warunku = nie scalaj, napisz do Sonneta.
5. Scalanie: **Squash and merge**. Jeśli przycisk mówi „Ready for review”, najpierw go kliknij.

**Czy workflow z danymi przeszedł?** *Actions* → nazwa workflow → ostatnie uruchomienie: zielone ✓ i w podsumowaniu raport (np. „20/20”). Nowe uruchomienie: **Run workflow** (nigdy „Re-run” – to stara wersja).

**Czy Jules pracuje?** *Issues* → zadanie z etykietą `jules`: po kilku minutach komentarz Julesa. Po 1 h bez PR – zajrzyj w Jules; po 90 min przerwij (PROMPTY.md §2.4). „Failed to create a task” → usuń etykietę `jules` i dodaj ponownie.

**Bramki fal (Twoje testy na telefonie, podgląd Vercel z PR albo strona główna):**
- po fali 7: nic nowego do zobaczenia – sprawdź tylko, że mapa i wyszukiwarka działają jak wcześniej;
- po fali 8: wejdź na stronę z dopiskiem `/?i=unemployment-rate` → mapa w kolorach; kliknij gminę → arkusz profilu od dołu; przesuń go palcem;
- po fali 9: panel „Wskaźnik”, zmiana roku, legenda; wyślij komuś link i sprawdź, że otwiera ten sam widok.
Wynik napisz jednym zdaniem w czacie („fala 8 OK” albo „profil zasłania mapę na iPhonie”).

---

## 5. Eskalacja: komu oddać problem

| Sytuacja | Kto |
|---|---|
| `merge.sh`: „pliki spoza Zakresu” | Sonnet ocenia; jeśli OK, pisze w PR komentarz „zakres OK”, a Haiku scala z `--zakres-ok` |
| `merge.sh`: „usuwa pliki z main”, „kolory zamiast tokenów”, „PO SCALENIU zniknęły pliki” | Sonnet natychmiast |
| druga czerwień po `rerun.sh`, czerwień spoza §6 | Sonnet |
| konflikt („merge conflict” przy aktualizacji gałęzi) | Sonnet |
| 2 nieudane rundy uwag do Julesa / 90 min bez PR | Sonnet dzieli zadanie albo poprawia sam |
| koniec zadań w `FALE.md`, zmiana planu, nowe ryzyko | Opus |
| decyzja o danych, prywatności, wyglądzie | Ty (Sonnet/Opus przygotowuje 2–3 opcje) |

---

## 6. Tabela błędów (wnioski z fal 1–6)

| Objaw | Przyczyna | Haiku | Sonnet / Ty |
|---|---|---|---|
| `verify` czerwone, krok **E2E tests**, PR dotyka komponentu widocznego na `/design` (profil, legenda, wybór wskaźnika, przyciski, formularze – cokolwiek z `src/view/profile/`, `legend/`, `controls/`, `ui/`) – także gdy plik `DesignPage.tsx` nie jest zmieniony | zrzuty wzorcowe nieaktualne (np. #123: dodanie wykresu do wiersza profilu zmieniło /design) | `snapshots.sh <PR>` PRZED jakimkolwiek rerun | — |
| `verify` czerwone, krok E2E, PR nie dotyka żadnego komponentu z /design | niestabilny test albo błąd | raz `rerun.sh <PR>`; druga czerwień → Sonnet | diagnoza: lokalnie e2e działa z własną konfiguracją Playwright (`executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`); zrzuty /design tylko w CI |
| `security` czerwone, gitleaks | fałszywy klucz w teście w historii gałęzi | → Sonnet | dopisuje commit do `.gitleaks.toml` (allowlist) |
| „BRAK CI” po commicie robota (Update snapshots, dane) | pushe robota nie uruchamiają CI | `kick-ci.sh <PR>` | — |
| `merge.sh`: „bramki CI nie są zielone ()” zaraz po `update-branch` | wyścig: nowy commit, CI jeszcze się nie zaczęło | odczekaj 15 s i `wait-ci.sh <PR>`, potem `merge.sh` | — |
| „Pull Request is still a draft” | PR Julesa jest szkicem | `merge.sh` robi to sam | — |
| workflow z danymi czerwony po „Re-run” | Re-run używa starej wersji workflow | — | Ty: **Run workflow** |
| workflow danych: „exceeds limit”, timeout, 429 | rozmiar/limit API | → Sonnet | poprawka skryptu; pobieranie jest wznawialne – kolejne „Run workflow” dokończy |
| „Brak sekretu BDL_CLIENT_ID” | sekret w złym miejscu | — | Ty: Settings → Secrets and variables → **Actions** → Repository secrets |
| PR Julesa z pustym commitem po uwadze | nieudana runda (PROMPTY.md §2.5) | wpisz w raport | Sonnet liczy rundy |
| Jules zmienił zrzuty wzorcowe sam | łamie AGENTS.md | `merge.sh` tylko ostrzega; CI zielone = OK | — |
| scalenie starej gałęzi cofnęło pliki | brak świeżego pobrania | nie dotyczy: `merge.sh` sprawdza na świeżo | przywrócenie |
| „Update snapshots” kończy się kodem 128 | git w kontenerze | → Sonnet (naprawione w #110) | — |
| `verify` czerwone, krok E2E, PR nie dotyka aplikacji (tylko docs, scripts, .github), po `rerun.sh` zielone | niestabilny test e2e w CI (zdarza się ok. co trzeciego przebiegu; od 20.10 adnotacje pokazują nazwę testu) | raz `rerun.sh`; jeśli znów czerwone, `git merge origin/main` w PR (świeży przebieg) i dopiero potem Sonnet | Sonnet: gdy nazwa testu powtarza się, zadanie naprawy testu |
| `merge.sh`: „usuwa pliki z main” w PR Julesa, choć zadanie niczego nie usuwa | Jules zrobił ostatni commit z nieaktualnej kopii roboczej (#153 kasował 23 pliki) | NIE scalaj; → Sonnet | Sonnet: przywraca pliki z `origin/main` (`git checkout origin/main -- <plik>` dla każdego spoza Zakresu), commit, `wait-ci.sh`, dopiero `merge.sh` |
| sprawdzenie `zasady-pr` czerwone | brak ID zadania (`Fixes #N`), plik poza Zakresem, plik zapalny bez etykiety `sprawdzone` albo nowa zależność bez `nowa-zaleznosc` (komunikat mówi, co) | brak ID / poza zakresem: napisz w PR, żeby Jules poprawił; zapalny → Sonnet | Sonnet: po przeglądzie etykieta `sprawdzone` (znika po nowym commicie) |
| „Fetch data” (nocny) zgłasza issue „Pobieranie danych … nie powiodło się” | API BDL, limit czasu, kontrola liczb | → Sonnet | Sonnet: przyczyna z kroku, który padł (podsumowanie przebiegu); ręcznie **Run workflow** dokończy pobieranie |
| `gh` zwraca 403 „not permitted through this proxy” | ograniczenie środowiska (GraphQL, usuwanie gałęzi) | nie powtarzaj; w raport | Ty klikasz w GitHubie |

---

## 7. Gemini: co mu oddawać

Gemini (czat) jest darmowy i dobry w szukaniu w sieci. Wynik zawsze **ze źródłami (linkami)**; przynosisz go do czatu z Claude albo wklejasz jako komentarz w issue. Gemini nie zmienia repo i nie decyduje.

| Kiedy | Wklej do Gemini |
|---|---|
| Nowy wskaźnik / wątpliwość co do zmiennej GUS | „Szukam w Banku Danych Lokalnych GUS (bdl.stat.gov.pl) zmiennej: <opis>. Podaj id zmiennej (var-id), nazwę, jednostkę, poziomy (gmina/powiat), lata. Tylko z oficjalnych stron GUS, z linkami.” |
| Biblioteka w zadaniu (np. `react-modal-sheet`, deck.gl `FillStyleExtension`, `@observablehq/plot`) | „Podaj aktualne API <biblioteka> w wersji <wersja z package.json>: główne komponenty/opcje i krótki przykład. Tylko z dokumentacji lub repozytorium projektu, z linkami.” |
| Teksty dla ludzi (prywatność, „o projekcie”) | „Napisz prostym językiem (poziom B1) tekst o <temat> dla strony z mapą danych GUS. Fakty: <lista>. Bez prawniczych formułek, max 200 słów.” |
| Druga opinia o wyglądzie | zrzut ekranu + treść `docs/STYL.md` + „Wypisz maks. 5 niezgodności zrzutu ze stylem, każdą z punktem STYL.md.” |
| Licencje i atrybucje (OSM, PRNG, BDL) | „Jakie warunki licencji i jaka dokładna atrybucja dla <źródło> na publicznej stronie? Z linkiem do oficjalnego tekstu licencji.” |

Nie dawaj Gemini: sekretów (klucz BDL), decyzji o scalaniu, pisania kodu do repo.

---

## 8. Oszczędzanie limitów (zasady dla Claude)

1. **Jedno polecenie zamiast wielu:** stan z `status.sh`, nie z kilkunastu zapytań. Czekanie w skrypcie, nie w rozmowie.
2. **Nie czytaj dużych plików w całości**, gdy wystarczy `grep`/fragment (PROMPTY.md ma >40 kB).
3. **Prompty z góry:** Opus pisze 2–3 fale naraz, z nazwami eksportów, które późniejsze zadania wymieniają w `Wymaga na main:`. Po fali Opus tylko sprawdza, czy plan dalej pasuje.
4. **Przegląd tylko tam, gdzie warto:** Sonnet czyta kod PR-ów w plikach zapalnych (tor M), danych i prywatności; resztę scala Haiku po automatycznych kontrolach.
5. **Bez zgadywania:** każdy `STOP` ma właściciela (§5). Model niższy nie próbuje „trochę inaczej” – to zjada limit i robiło pętle.
6. **Raporty krótkie i stałe** (§3 punkt 7), żeby właściciel wiedział, co sam może zrobić.

---

## 9. Słowniczek

- **PR (pull request)** – propozycja zmian do `main`; **squash** – scalenie w jeden commit; **draft/szkic** – PR jeszcze niezgłoszony do przeglądu.
- **CI / bramki** – automatyczne sprawdzenia przy każdym PR: `verify` (lint, typy, testy, budowanie, e2e) i `security` (sekrety, podatności).
- **Workflow** – zadanie w GitHub Actions (np. „Fetch data”); **Run workflow** = nowe uruchomienie z aktualną wersją.
- **Tor** – grupa plików; dwa zadania z różnych torów mogą iść naraz. **Fala** – zestaw zadań wysyłanych równolegle.
- **Zrzut wzorcowy (snapshot)** – zapisany obraz strony /design; test porównuje z nim wygląd.
- **Szew testowy (`window.__atlas`)** – stan mapy, który testy czytają zamiast pikseli.
- **Zakres** – zamknięta lista plików w zadaniu; wszystko poza nią = do wyjaśnienia.

---

## 10. Jak przejąć więcej samemu (stopniowo)

1. **Obserwujesz:** po każdym raporcie Haiku sprawdzasz 1–2 rzeczy z „SPRAWDŹ SAM” (§4).
2. **Scalasz sam** zielone PR z kolumną „Haiku”, według listy z §4 (bez Claude'a).
3. **Wysyłasz sam:** issue → tytuł = pierwsza linia promptu z `FALE.md`, treść = prompt + wspólny blok z PROMPTY.md §5, etykieta `jules`. Przed wysłaniem otwórz na GitHubie pliki z linii `Wymaga na main:` – muszą istnieć.
4. **Tryb awaryjny bez Claude'a:** PROMPTY.md §9 (Gemini jako Architekt zastępczy; tylko zadania K).


---

## 11. Pomiar fali (wypełnia Sonnet na końcu każdej fali, wpis do `STAN_PROJEKTU.md`)

Bez liczb nie wiemy, czy ten system oszczędza limity. Na początku i na końcu fali wpisz wynik `/usage` (Claude Code) i uzupełnij:

| Pole | Wartość |
|---|---|
| Fala, daty | |
| `/usage` start → koniec (Opus / Sonnet / Haiku) | |
| Zadania Julesa wysłane / sesje Julesa zużyte | |
| PR scalone / czerwone CI / rerun / odświeżenia zrzutów | |
| Wizyty Sonneta: planowane / nieplanowane (powód każdej nieplanowanej) | |
| Liczba `STOP` i przyczyny | |
| Błąd powtórzony 2× → zadanie reguły w CI (numer) | |

Cel po dwóch falach: ≤ 1 nieplanowana wizyta Sonneta na falę, 0 PR scalonych bez kontroli zakresu, 0 fal ruszonych przy niespełnionej bramce.
