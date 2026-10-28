> **ZAMKNIĘTE (26.10.2026) – archiwum, nie wykonywać.** Problem naprawiony w #363 (`?sheet=full` w testach, timeout e2e). Nie wrzucać do `tasks/`.

# NAPRAWA main – mobilny test „Udostępnianie z profilu” (26.10.2026)

Prompt dla Julesa (etykieta `jules`, jedno zadanie, jeden PR). Powód: CI na `main` czerwone od 26.10 12:10 UTC.

```text
PROMPT NAPRAWA-1 – Napraw czerwony test mobilny share-profile   (po ludzku: CI na main znowu będzie zielone)
Przeczytaj najpierw: tests/e2e/share-profile.spec.ts (test „na 360 i 390 px…”, linia ~72), tests/e2e/profile-mobile.spec.ts (test „drags handle up…” – tam jest wzór rozwijania arkusza), src/view/ui/BottomSheet.tsx, src/view/profile/ProfileSheetMobile.tsx.
Zadanie: test pada w CI na kliknięciu przycisku „Pobierz i udostępnij” (timeout; Playwright pisze, że <canvas class="maplibregl-canvas"> przechwytuje zdarzenia wskaźnika).
Co ustalono (Claude, 26.10, odtworzone lokalnie 3 z 3 razy, także na ostatnim zielonym commicie a1513f5 – kod aplikacji się nie zmienił, więc test jest niestabilny, nie aplikacja):
- na ekranie 360×800 arkusz profilu otwiera się na 40% wysokości (react-modal-sheet, snapPoints [1, 0.4, 0]); kontener arkusza ma wysokość całego okna, a jego przewijany obszar sięga poza dolną krawędź ekranu; przycisk leży w tym obszarze na y ≈ 860 (poza oknem 800 px), więc kliknięcie wskaźnikiem trafia w mapę;
- scrollIntoView z Playwrighta nie pomaga, bo przeglądarka uważa przycisk za widoczny w obrębie kontenera.
- Próby, które NIE rozwiązały problemu u Claude (nie powtarzaj w ciemno): samo przewinięcie zawartości arkusza; zamknięcie paska zgody „Zgoda na analitykę”; przeciągnięcie uchwytu (`.cursor-grab`) myszą – to ostatnie przekracza limit czasu także w istniejącym teście profile-mobile.spec.ts („drags handle up…”), który w CI jest niestabilny.
Napraw przyczynę, nie ukrywaj objawu: ustal, czy kłopot jest w teście (przycisk poza ekranem przy 40%), czy w aplikacji (użytkownik nie może dojść do dolnej części zawartości, dopóki nie rozwinie arkusza). Jeśli aplikacja: popraw układ (np. ogranicz wysokość przewijanego obszaru do widocznej części przy węższym punkcie zatrzymania). Jeśli test: otwórz arkusz od razu na 100% wysokości w sposób deterministyczny (np. parametr w trybie `?e2e` odczytywany w ProfilePortal/BottomSheet, tylko w trybie testowym) i użyj go w obu testach mobilnych (share-profile i profile-mobile).
Pliki: tests/e2e/share-profile.spec.ts, tests/e2e/profile-mobile.spec.ts i – tylko jeśli konieczne – src/view/ui/BottomSheet.tsx, src/view/map/ProfilePortal.tsx.
Gotowe, gdy:
- `pnpm test:e2e` na tych dwóch plikach przechodzi 5 razy z rzędu bez ponowień (`--repeat-each=5 --retries=0`);
- test „na 360 i 390 px” nadal sprawdza: brak poziomego przewijania, wysokość przycisków okna ≥ 44 px, axe bez błędów;
- wszystkie pozostałe testy bez zmian.
Nie ruszaj: .github/workflows/, snapshotów zrzutów, plików biblioteki (src/core/library).
Uruchom wszystkie testy i popraw błędy, zanim otworzysz PR.
W opisie PR dodaj sekcję „Po ludzku”: co zrobiłeś, co sprawdzić na podglądzie, czego nie zrobiłeś.
```
