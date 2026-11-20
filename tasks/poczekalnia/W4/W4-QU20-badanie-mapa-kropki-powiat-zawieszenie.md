# QU20 – Badanie mapy: kropki miejscowości, gmina miejska = miasto, nawigacja po powiecie, zawieszenie przed przybliżeniem
Cel: jeden raport z faktami i wariantami dla uwag 8, 9 i 20 (połączone QU20+QU21+QU29); bez zmiany kodu strony.
Zmieniaj: docs/research/QU20-mapa-kropki-powiat-zawieszenie.md
Wymagane: docs/research/QU20-mapa-kropki-powiat-zawieszenie.md
Weryfikacja: pnpm lint
Zależy od: nic (tylko czytanie main). Wdrożenia po raporcie: QC403/QC404 (zoom, animacja zejścia) i zadania z decyzji właściciela.
Kolizje plików: brak (nowy plik w docs/research). Pośrednio: raport ma być gotowy przed QC403/QC404, bo oba ruszają `useMapViewState.ts` (zgoda właściciela, wąsko).
Przeczytaj najpierw: src/view/map/layers/localities.ts, src/core/map/localities-layer.ts, src/core/search/localities.ts, src/core/search/load-localities.ts, src/view/map/BackButton.tsx, src/view/map/Breadcrumbs.tsx, src/view/map/hooks/useMapViewState.ts, src/view/map/hooks/useCameraDriver.ts, src/view/map/hooks/useMapSelection.ts, src/core/map/drill.ts, src/core/map/camera-plan.ts, src/core/map/camera-driver.ts, src/core/map/camera-retarget.ts, src/core/map/camera-wheel.ts, src/core/map/reveal.ts, docs/PLAN-UWAGI-19-11.md (uwagi 8, 9, 20), docs/research/p-animacja-kamery-pomiar.md, docs/research/p-kamera-pomiar-telefon.md (pliki chronione: tylko czytasz)

## Kontekst
Uwaga 8: czerwone kropki miejscowości „dają po oczach”; miejscowość nie ma własnych danych GUS, a gmina miejska ma. Uwaga 9: po wejściu w powiat trzeba klikać „Wróć”; po oddaleniu kółkiem nie da się kliknąć innej jednostki, dopiero po strzałce. Uwaga 20: przed animacją przybliżenia bywa zatrzęsienie lub zawieszenie (zależnie od poziomu).

## Zadanie
1. Kropki: skąd się biorą (`localities.ts`, `layersZoomBucket`), ile ich w `public/data/localities.json` (policz skryptem jednorazowym w scratchpadzie, nie w repo), od jakiego zoomu widać, co otwiera klik (`tests/e2e/localities-map.spec.ts`, `localities-search.spec.ts`). Czy miejscowość ma wskaźniki? Które miejscowości to gminy miejskie (kod TERYT jako string: ten sam 7-cyfrowy kod gminy?) i jak uniknąć powielania „miejscowość” vs „gmina miejska”.
2. Wejście w powiat i Wróć: opisz krok po kroku dzisiejsze zachowanie (klik jednostki, `drill.ts`, `BackButton`, kółko, zoom out) i wskaż, w którym miejscu po oddaleniu klik jest blokowany (plik:linia). Zaproponuj zasadę: klik innej jednostki zawsze zmienia wybór.
3. Zawieszenie: wskaż w kodzie, co dzieje się między kliknięciem a pierwszą klatką animacji (ładowanie warstw, dopasowanie granic, `camera-plan`, `commitRest`). Użyj istniejących pomiarów (`docs/research/p-*`, `src/core/map/frame-stats.ts`); nowego profilowania nie uruchamiaj, jeśli wystarczą dane z repo – brakujące pomiary wpisz jako zadanie na później.
4. Struktura raportu (≤120 linii): Fakty (plik:linia) · Wnioski · Warianty z kosztem · Rekomendacja · Pytania do właściciela. Warianty z kosztem (pliki, linie, ryzyko dla testów e2e) minimum po 2 na każdą z trzech uwag.
Gotowe, gdy:
- raport zawiera liczbę kropek, próg zoomu i listę testów dotykających kropek (nazwy plików)
- raport wskazuje plik:linia, w którym blokowany jest klik po oddaleniu, albo jawnie pisze „nie odtworzono” z powodem
- raport mapuje kod gminy miejskiej na miejscowość (przykład z fixture lub `public/data`) i rekomenduje jedno z: ukryć / pokazać po przybliżeniu / usunąć
- raport kończy się listą zadań wdrożeniowych z plikami i kolizjami z QC403/QC404 oraz sekcją „Pytania do właściciela”
- `pnpm lint` przechodzi
Nie ruszaj: kod strony (src/, tests/), config/, public/data, scripts/, wzorce zrzutów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
