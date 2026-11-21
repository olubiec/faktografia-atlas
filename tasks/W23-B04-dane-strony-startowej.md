# B04 – Dane strony startowej: obrys i kolory
Fala pliku: W23 (etap B budowy). Fala budowy: 2 z 8. Zależy od: nic. Równolegle z: B03, B05.
Cel: Są dwa małe pliki gotowe dla strony startowej: uproszczony obrys 16 województw i kolory czterech wskaźników; robot odświeża drugi z nich razem z danymi.
Zmieniaj: scripts/geo/start-outline.mjs, scripts/data/start.mjs, .github/workflows/fetch-data.yml, public/geo/start-outline.json, public/data/start.json, tests/unit/b04-start-data.test.ts, tests/fixtures/start/values-sample.json
Wymagane: tests/unit/b04-start-data.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U07.md (§3.2 budżety, §3.5), src/view/test/proto/start.tsx (wzór uproszczenia Douglasa–Peuckera, próg 1,2), src/core/start/idle-motion.ts, scripts/geo/build.mjs, scripts/data/values.mjs, .github/workflows/fetch-data.yml, docs/KONCEPT-STRONA-STARTOWA.md
Zgoda właściciela (21.11.2026, odpowiedź U07 P3 A): ten prompt wprost prosi o zmianę `.github/workflows/fetch-data.yml` i `scripts/data` (odświeżanie `start.json` przez robota razem z danymi).
Zadanie:
1. `scripts/geo/start-outline.mjs`: z warstwy `woj` pliku `public/geo/admin.topo.json` zrób uproszczony obrys (próg ≈ 1,2; współrzędne w jednostkach ok. 1/100 stopnia). Wynik: `public/geo/start-outline.json` w formacie `{version:1,viewBox:[w,h],paths:[{teryt:"12",d:"M…"}]}`, TERYT jako tekst, JSON bez wcięć. Budżet: ≤ 25 KB surowo i ≤ 10 KB po gzip.
2. `scripts/data/start.mjs`: z `public/data/values/*.json` (ludność `population`, `unemployment-rate`, `avg-wage`, `density`) zbuduj `public/data/start.json`: `{version:1,generatedAt,indicators:[{id,name,unit,year,values:{"<teryt woj>":liczba}}]}` dla 16 województw, najnowszy rok z danymi dla każdego wskaźnika, pierwszy wskaźnik = ludność (pierwszy kadr). Budżet: ≤ 5 KB. Liczby tylko z `public/data` (nic wpisanego ręcznie).
3. Workflow `fetch-data.yml`: po kroku odświeżającym wartości dodaj krok `node scripts/data/start.mjs` zapisujący `public/data/start.json` razem z resztą danych; bez zmiany harmonogramu, limitów i uprawnień.
4. Wygeneruj oba pliki i dołącz je do PR (to pliki wynikowe skryptów).
Gotowe, gdy:
- Test jednostkowy rozmiaru: `start-outline.json` ≤ 25 KB i ≤ 10 KB po gzip; `start.json` ≤ 5 KB.
- Test: obrys ma dokładnie 16 ścieżek z kodami TERYT jako tekst (2 cyfry), każda ścieżka niepusta; `viewBox` dodatni.
- Test na fixture: `start.json` ma 4 wskaźniki, 16 wartości na wskaźnik, rok = najnowszy rok z fixture, wartości równe tym z `values` (brak NaN), pierwszy wskaźnik to `population`.
- Test: skrypt jest deterministyczny (dwa uruchomienia = identyczny wynik) i nie czyta sieci.
- Test: w `fetch-data.yml` krok `start.mjs` występuje po kroku wartości i nie zmienia `cron` (kontrola tekstu pliku); istniejący `workflows-guard.test.ts` przechodzi bez zmian.
Nie ruszaj: src/*, config/*, docs/STAN.md, package.json, innych workflow.
Po ludzku (do opisu PR):
- Co zrobiłeś: Przygotowałem dwa małe pliki do strony startowej: obrys Polski (16 województw) i kolory czterech wskaźników. Robot będzie je odświeżał razem z danymi.
- Co sprawdzić na podglądzie Vercel: Na stronie nic nie widać. Po scaleniu sprawdź w GitHub → Actions → „Fetch data”, że krok „start” przeszedł; pliki: `/geo/start-outline.json` i `/data/start.json` na podglądzie.
- Czego nie zrobiłeś i dlaczego: Nie rysowałem jeszcze tła (B07).
Tytuł PR zaczyna się od `[W23-B04]`; gałąź `claude/W23-B04` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B04] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B04-dane-strony-startowej.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: brak. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B04 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B04] Dane strony startowej: obrys i kolory”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
