# B12 – Druga mapa na telefonie i koniec strony Porównaj
Fala pliku: W23 (etap B budowy). Fala budowy: 6 z 8. Zależy od: B11. Równolegle z: nic (sama w fali).
Cel: Na telefonie dwie mapy są jedna pod drugą (zapas: przełącznik A/B), a strona Porównaj znika z przekierowaniem na mapę; porównanie dwóch miejsc zostaje w profilu.
Zmieniaj: src/view/map/ComparePanes.tsx, src/view/map/ViewSwitch.tsx, src/App.tsx, src/core/url/legacy-links.ts, tests/e2e/path-redirects.spec.ts, tests/e2e/path-s5m-druga-mapa-telefon.spec.ts, tests/unit/b12-compare-panes-mobile.test.tsx, tests/unit/b12-legacy-compare-links.test.ts
Usuń (zgoda właściciela, tylko jeśli plik istnieje i po zmianie nie ma importera: sprawdź `rg -l`): src/view/pages/ComparePage.tsx, src/view/pages/CompareShare.tsx, src/view/compare/PlacePicker.tsx, src/core/compare/compare-url.ts, src/core/compare/compare-extra.ts (tylko jeśli po zmianie nie mają importera); testy Z3 (E2 i U3): tests/e2e/q-compare-mobile.spec.ts, q-compare.spec.ts, q2-compare-remove.spec.ts oraz tests/unit/compare-extra-edge.test.ts, compare-extra-wiring.test.tsx, compare-extra.test.ts, compare-page-defaults.test.tsx, compare-page-share.test.tsx, compare-url.test.ts. NIE usuwasz: src/core/compare/compare.ts, src/view/compare/CompareIndicatorPicker.tsx (używa go profil do B13/B14), testów porównania w profilu (grupa E9: compare-map.spec.ts, compare-maps.spec.ts, compare-pick.spec.ts, compare-table.spec.ts, s18-compare.spec.ts) ani profile-compare-*.test.tsx
Wymagane: tests/e2e/path-s5m-druga-mapa-telefon.spec.ts, tests/unit/b12-compare-panes-mobile.test.tsx, tests/unit/b12-legacy-compare-links.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U06.md (UX telefonu, decyzja D1), docs/research/u/U08.md (E2, U3; R3; S5), src/view/map/ComparePanes.tsx, src/App.tsx
Zgody właściciela (21.11.2026, odpowiedź P2 A): Z1 (adresy w testach e2e), Z2 (testy strony startowej i nazwy), Z3 (usunięcie testów Biblioteki, Rankingów, Porównaj i pickera razem z funkcją), Z4 (usunięcie testów „Moich wskaźników” i martwych sekcji). Zgody dotyczą wyłącznie plików wymienionych w tym zadaniu. Decyzje D1 (telefon: jedna pod drugą) i D3 (strona Porównaj znika; porównanie dwóch miejsc zostaje w profilu; dwa wskaźniki = druga mapa) są zatwierdzone. Usuwasz testy tylko razem z usuwanym plikiem; w PR wypisz każdy usunięty plik testowy.
Zadanie:
1. Układ telefonu (< 768 px): mapa A i mapa B jedna pod drugą, każda ok. 40% wysokości ekranu, nagłówek B z wyborem wskaźnika; wspólna kamera, rok i poziom jak na komputerze (B11). Zapas: przełącznik A / B (druga mapa odmontowana, tylko jedna instancja WebGL naraz), wybierany ustawieniem zapamiętanym per urządzenie (`localStorage` w try/catch) i włączany przez `?dwie=ab` do testów; domyślnie układ „jedna pod drugą”. Przycisk „+ Druga mapa” staje się widoczny także na telefonie.
2. Pamięć: na telefonie nie więcej niż dwie instancje mapy naraz; przy zamknięciu drugiej instancja jest zwalniana (test na liczbie kontekstów WebGL w `window.__atlas`, jeśli udostępnia; inaczej opisz sposób sprawdzenia w PR).
3. Przekierowanie R3 w `legacy-links.ts`: `/porownaj?c=12,14` → `/mapa?u=12&c=12,14` (profil miejsca 12 z porównaniem do 14); `/porownaj` bez parametrów → `/mapa`. Usuń trasę `/porownaj` z `App.tsx` i stronę Porównaj (lista „Usuń”).
4. Przed zamknięciem zadania poproś w PR właściciela o test na jego telefonie (szczypanie, przewijanie strony, przełączanie układu) i napisz wyniki pomiaru z SwiftShader jako orientacyjne.
Gotowe, gdy:
- Test e2e `@PATH-5m` (390×844 i 360×740): „+ Druga mapa” → dwie mapy jedna pod drugą, różne legendy, wspólny rok i poziom; klik w miejsce zaznacza na obu; po zamknięciu wraca jedna mapa; brak przewijania w poziomie; pola dotykowe ≥ 44 px; przewijanie strony poza mapami działa.
- Test e2e zapasu: z `?dwie=ab` widać przełącznik A/B i naraz tylko jedną mapę.
- Test e2e R3: `/porownaj?c=12,14` → `/mapa?u=12&c=12,14`, profil z porównaniem i dwoma zarysami; `/porownaj` → `/mapa`; „Wstecz” bez pętli; 0 błędów w konsoli.
- Test jednostkowy `legacyRedirect` dla `/porownaj` z parametrami i bez.
- Test komponentu: układ „jedna pod drugą” poniżej 768 px, „obok siebie” od 768 px (tablet = komputer).
- Testy porównania dwóch miejsc w profilu (E9) przechodzą bez zmian.
Nie ruszaj: src/view/Home.tsx, src/view/map/AtlasMap.tsx, src/view/map/hooks/*, src/view/profile/*, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Na telefonie dwie mapy są teraz jedna pod drugą (z zapasowym przełącznikiem A/B). Strona „Porównaj” zniknęła; porównanie dwóch miejsc jest w profilu miejsca, a stary link `/porownaj` przenosi na mapę.
- Co sprawdzić na podglądzie Vercel: Zrób test na swoim telefonie: „+ Druga mapa”, szczypanie i przesuwanie, przewijanie strony, klik w miejsce, zamknięcie drugiej mapy; sprawdź `/porownaj?c=1217,1218` (przykładowe kody) i zadanie z kartki testu: „Porównaj powiat krakowski i wielicki”.
- Czego nie zrobiłeś i dlaczego: Nie dodałem wykresu punktowego A × B (później). Jeśli telefon zacina, zapasem jest przełącznik A/B.
Tytuł PR zaczyna się od `[W23-B12]`; gałąź `claude/W23-B12` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B12] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B12-druga-mapa-telefon-koniec-porownaj.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: B11. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B12 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B12] Druga mapa na telefonie i koniec strony Porównaj”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
