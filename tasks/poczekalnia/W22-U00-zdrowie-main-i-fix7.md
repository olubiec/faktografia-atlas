# U00 – Zielone main po W4 i domknięcie FIX7
Cel: main przechodzi CI, a mapa na telefonie startuje z widokiem całej Polski.
Zmieniaj: tests/e2e/mobile-tooltip.spec.ts, tests/e2e/profile-mobile.spec.ts, tests/e2e/helpers/map-tap.ts, tests/e2e/drill.spec.ts, tests/e2e/fix6-camera-driver.spec.ts, tests/e2e/localities-map.spec.ts, src/core/map/fit.ts, tests/unit/fix7-fit-view.test.ts, tests/e2e/fix7-start-view.spec.ts, docs/research/u/U00.md, docs/STAN.md, docs/STAN-ARCHIWUM.md
Wymagane: docs/research/u/U00.md
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, docs/STATUS-PRZERWANE.md (sekcja FIX7), docs/STAN.md (znane ograniczenia po W4), docs/research/u/WYTYCZNE.md, docs/PLAN-UPROSZCZENIE.md §0 (decyzje zatwierdzone)
Zadanie:
1. Sprawdź wynik CI ostatniego commita na main (workflow „CI”). Wypisz czerwone testy i przyczyny.
2. Sprawdź, co z gałęzi claude/FIX7 (PR #503) jest już na main (np. src/core/map/fit.ts). Jeśli FIX7 nie jest scalone, dokończ je według STATUS-PRZERWANE.md. Właściciel zgodził się wyłącznie na zmianę miejsca kliknięcia w testach dotykowych, bez zmiany asercji.
3. Trzy e2e z QC403 (drill, fix6-camera-driver, localities-map): jeśli zależą od usuniętych przycisków +/−, opisz w raporcie, co i dlaczego. Zmień tylko sposób przybliżania (np. kółko lub zdarzenie w szwie __atlas), bez osłabiania asercji. W razie wątpliwości zatrzymaj się i opisz.
4. Test jednostkowy tests/unit/docs-no-conflict-markers.test.ts jest czerwony na main (docs/STAN.md ma 145 linii, limit 110). Zgoda właściciela (20.11): skróć docs/STAN.md do najwyżej 110 linii, przenosząc najstarsze wpisy do docs/STAN-ARCHIWUM.md bez utraty treści. Testu nie zmieniasz. Po skróceniu test musi przejść; w PR wypisz, które sekcje przeniosłeś.
5. Jeśli zmieniły się zrzuty, napisz w PR, że trzeba uruchomić „Update snapshots”.
Gotowe, gdy:
- CI na gałęzi jest zielone albo raport U00.md wymienia każdy czerwony test z przyczyną i propozycją.
- Test fix7-start-view sprawdza, że na 390×844 widać całe granice Polski (stan z window.__atlas).
Nie ruszaj: kodu ekranu poza src/core/map/fit.ts, asercji istniejących testów.
Tytuł PR zaczyna się od `[W22-U00]`; opis ma „Po ludzku”.
