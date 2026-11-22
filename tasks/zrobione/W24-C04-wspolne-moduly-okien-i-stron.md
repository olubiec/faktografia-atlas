# C04 – Wspólne moduły okien, sekcji i list (jedno miejsce na rozmiary, odstępy i położenie)
Fala pliku: W24 (etap C). Fala budowy: 2 z 4. Zależy od: C03 (lista modułów z raportu). Równolegle z: B13.
ZAKRES WSTĘPNY: dokładną listę modułów i plików wpisze Claude po scaleniu C03 (sekcja „Moduły wspólne” raportu `docs/research/c/C03-audyt-ukladu.md`); poniższe to założenie robocze.
Cel: Okna, sekcje stron i listy linków budowane są z kilku wspólnych modułów, które mają odstępy, wysokości, ramki i położenie z jednego miejsca (tokeny), tak że każda zmiana wyglądu robi się raz.
Zmieniaj: src/view/ui/Window.tsx, src/view/ui/PageSection.tsx, src/view/ui/LinkList.tsx, src/view/data-menu/DataMenuWindow.tsx, tests/unit/c04-ui-modules.test.tsx, tests/unit/c04-no-hardcoded-layout.test.ts
Wymagane: tests/unit/c04-ui-modules.test.tsx, tests/unit/c04-no-hardcoded-layout.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/STYL.md (§5, §9, §12), docs/research/c/C03-audyt-ukladu.md (Moduły wspólne, Spójność), src/components/ui/dialog.tsx, src/view/ui/BottomSheet.tsx, src/view/ui/Sheet.tsx, src/view/data-menu/DataMenuWindow.tsx (z C01)
Zadanie:
1. `Window`: jedno okno w trzech odmianach (`fullscreen`, `dialog`, `bottom` dla telefonu), zbudowane na `Dialog` z Radix; wspólny nagłówek (tytuł + przycisk zamknięcia ≥ 44 px), wspólne tło/ramka/padding z tokenów, Esc, trap fokusa, powrót fokusa. `DataMenuWindow` przepisz tak, by używał `Window`.
2. `PageSection`: nagłówek sekcji + treść + odstęp między sekcjami z jednego miejsca (48–64 px wg STYL §5, w panelu 16–24 px), bez „eyebrow”, bez wersalików.
3. `LinkList`: lista linków (stopka, menu telefonu): jeden styl linku, pole dotykowe ≥ 44 px, stan aktywny i fokus z tokenów.
4. Odstępy i położenia (dolny odstęp paska, szerokość arkusza profilu, wysokość nagłówka) jako klasy z `@theme`/zmienne CSS w jednym pliku; jeśli konieczne nowe tokeny w `config/tokens.json` lub `src/styles/tokens.css`, zatrzymaj się i opisz w PR (zgoda właściciela).
5. Moduły są nieużywane poza `DataMenuWindow` (przejmują je C05–C08); nie zmieniaj istniejących ekranów.
Gotowe, gdy:
- Testy komponentów: `Window` w każdej odmianie ma nagłówek z tytułem i przycisk zamknięcia ≥ 44 px, zamyka się Esc, wraca fokus; `PageSection` i `LinkList` renderują się z klasami tokenów; `LinkList` ma pola ≥ 44 px.
- Test `c04-no-hardcoded-layout`: nowe pliki nie zawierają `rounded-*`, `shadow-*`, `backdrop-blur`, wartości w `px`/`#` w `className` (poza tokenami); odstęp z p. 4 występuje w jednym miejscu.
- `DataMenuWindow` ma testy C01 zielone bez zmian.
Nie ruszaj: pozostałe pliki `src/view/*`, config/*, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Dodałem „klocki” okien, sekcji i list linków. Na razie używa ich tylko okno „Wybierz dane”; kolejne ekrany przechodzą na nie w następnych zadaniach.
- Co sprawdzić na podglądzie Vercel: „Wybierz dane” na telefonie i komputerze działa i wygląda jak wcześniej.
- Czego nie zrobiłeś i dlaczego: Nie przepinałem innych ekranów (to C05–C08), żeby zmiany były małe.
Tytuł PR zaczyna się od `[W24-C04]`; gałąź `claude/W24-C04` od `origin/main`; nie scalaj.
Prompt podagenta: sekcja 3 w `docs/PLAN-FALE-C.md` z id = C04.
