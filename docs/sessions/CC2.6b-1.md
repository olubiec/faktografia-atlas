# CC2.6b-1 – panel ?tune: zakładka Kolory, ładowanie, kopiowanie, przywracanie

Kontekst: przeczytaj AGENTS.md („Gałąź i PR”), docs/STYL.md oraz src/view/tune/tokens-map.ts (tokensMap i diffTokens, scalone w CC2.6a).
Poprzednia próba (#47) trwała ponad 3 godziny bez PR. Dlatego panel dzielimy: ta część to jedna zakładka „Kolory” wraz z ładowaniem, kopiowaniem i przywracaniem. Pozostałe zakładki dojdą w CC2.6b-2.
Cel dla właściciela: dopisując ?tune do adresu (na /design), dostaje panel z próbnikami kolorów. Zmiana koloru działa na żywo, a „Kopiuj JSON” kopiuje tylko zmienione wartości do wklejenia w config/tokens.json.
Gotowce: tweakpane 4.x (zainstalowany; przeczytaj typy w node_modules/tweakpane). Nie instaluj nowych paczek.
Zakres (tylko te pliki):

src/view/tune/TunePanel.tsx (nowy)
src/main.tsx (TYLKO warunkowy, leniwy import() panelu, gdy w adresie jest ?tune)
tests/unit/tune-panel.test.ts, tests/e2e/tune.spec.ts (nowe)
docs/sessions/CC2.6b-1.md (nowy)

Nie zmieniaj: src/view/tune/tokens-map.ts, src/App.tsx, src/view/Header.tsx, src/view/Home.tsx, package.json, config/, public/, src/core/, scripts/, docs/shots/.
Warunki odbioru (najpierw testy):

Bez ?tune żądania sieci na / i /design nie pobierają kodu panelu. Test e2e. Główny pakiet nie rośnie o więcej niż 2 KB gzip (podaj rozmiary przed i po w opisie PR).
Z ?tune na /design pojawia się panel z jedną zakładką „Kolory”: wszystkie tokeny kolorów jasnego i ciemnego motywu z tokensMap. Zmiana próbnika natychmiast zmienia zmienną CSS na stronie.
„Kopiuj JSON” kopiuje tylko zmienione wartości przez diffTokens, w strukturze config/tokens.json. Test e2e: zmiana koloru korekta daje JSON z dokładnie jedną zmianą.
„Przywróć” wraca do wartości z pliku (test jednostkowy funkcji resetu).
Panel nie zapisuje niczego na stałe: bez localStorage i bez zapisu plików. Test e2e: po przeładowaniu bez ?tune nie ma śladu zmian.
Panel nie zasłania nagłówka strony i można go zwinąć z klawiatury.
axe bez nowych naruszeń na /design?tune w trybie jasnym i ciemnym.
