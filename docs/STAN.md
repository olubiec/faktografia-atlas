# Stan projektu

## Następny krok
Domknąć falę 3 (scalić PR #27 i #28 po potwierdzeniu stanu), potem zadanie S14 wg docs/PLAN.md.

Aktualizuje Claude przy przeglądzie, nie Jules. Ostatnia aktualizacja: 17.10.2026, po fali 2.

## Gotowe (na main)

| Sesja | Co jest | PR |
|---|---|---|
| CC0 | system stylu „Kalka i korekta” (docs/STYL.md), tokeny, logo, plan | #1 |
| CC1, CC1.1, CC1.1b | szkielet Vite + React + TS, CI (lint, typy, testy, build, e2e, gitleaks, audyt), Dependabot, nagłówki bezpieczeństwa | #2, #11, #18 |
| CC1.2 | wszystkie paczki, shadcn/ui na tokenach | #13 |
| CC2.1 | przycisk, pole, etykieta, ikona, pole wyszukiwania, arkusz | #19, przywrócone w #20 |
| CC2.2 | zakładki, dymek, okno, popover, suwak, przełącznik | #17 |
| CC2.3 | ręczne zakreślenia czerwonym (rough-notation) | #16 |
| CC3.1 | geometria: 16 województw, 380 powiatów, 2479 gmin w public/geo/admin.topo.json | #14, przywrócone w #20 |
| CC6.1 | klient API GUS (BDL) z limitami, nagrane odpowiedzi do testów | #15 |
| logo | przywrócone logo „Faktografia” z czerwonym podkreśleniem | #23 |

Testy na main: 34 jednostkowe, 14 e2e.

## W toku (fala 3)

| Zadanie | Zgłoszenie | Uwagi |
|---|---|---|
| CC3.2 lista jednostek (units.json) | #24 | PR #27 po przeglądzie, gotowy do scalenia |
| CC2.4 strona /design + wzorce zrzutów | #25 | PR #28: wzorce zrzutów przez etykietę `aktualizuj-zrzuty` |
| CC1.5 makiety 4 ekranów | — | Claude; płótno „Faktografia Atlas – makiety”, czeka na akceptację, potem PNG do docs/design/ |

## Następne

- CC6.2 mapowanie GUS ↔ TERYT: po scaleniu CC3.2.
- CC2.5 nagłówek (z przełącznikiem logo / znak F na powiatach) i ekran startowy: po akceptacji makiet.
- Fala 4: CC2.6, CC4.1, CC5.1, CC5.3, CC6.3 (docs/PLAN.md).

## Wnioski z fali 2

- Jules dwa razy wysłał PR, który usuwał pracę z main (#16, #15): budował gałąź od nowa na starej wersji. Każde zgłoszenie ma teraz zasadę „tylko `git merge origin/main`, przed pushem zero usuniętych plików”, a przegląd sprawdza `git diff --diff-filter=D` przed każdym scaleniem.
- Jules nie zawsze reaguje na komentarze w PR. Gdy nie reaguje, Claude poprawia sam po zgodzie właściciela.

## Przypomnienia dla właściciela

- Przed CC6.4: klucz `BDL_CLIENT_ID` w sekretach GitHub i w ustawieniach repo w Julesie.
- Przed CC11: klucz PostHog.
- Decyzja: czy repo ma być publiczne. Bez tego main nie ma ochrony (GitHub Free chroni gałęzie tylko w publicznych repo), nie ma też darmowego CodeRabbita i CodeQL.
- Podpięcie Vercel do repo (podgląd każdego PR na telefonie).
