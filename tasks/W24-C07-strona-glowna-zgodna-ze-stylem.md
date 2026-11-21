# C07 – Strona główna `/` ściśle według STYL.md (logo, kolory, typografia, przyciski)
Fala pliku: W24 (etap C). Fala budowy: 3 z 4. Zależy od: C02, C03, C04. Równolegle z: C05, C06, C08.
ZAKRES WSTĘPNY: listę odstępstw wpisze Claude po C03 (sekcja „Wniosek”).
Cel: Strona `/` przechodzi listę kontrolną STYL §12 punkt po punkcie: logo, kolory z tokenów, krój, przyciski, odstępy, jedno czerwone zakreślenie, bez zaokrągleń i cieni.
Zmieniaj: src/view/start/StartPage.tsx, src/view/start/StartBackground.tsx, tests/unit/c07-start-style.test.tsx, tests/e2e/c07-start-style.spec.ts
Wymagane: tests/unit/c07-start-style.test.tsx, tests/e2e/c07-start-style.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/STYL.md (całość), docs/research/c/C03-audyt-ukladu.md, src/view/start/StartPage.tsx, config/tokens.json
Zadanie:
1. Przejdź listę z STYL §12 i §2–§5 dla `/`: tytuł „Faktografia” (800, tracking −0,02em, skala 1,25), brak szeryfów poza logo, brak wersalików, „eyebrow” i strzałek przy linkach; kolory tylko tokeny (usuń np. `bg-tusz/90`, `rounded-none` jako obejście: zaokrągleń nie ma w tokenach); przycisk główny „Otwórz mapę” = wzór przycisku z `src/components/ui/button.tsx` (jeden styl dla całej strony), pole ≥ 44 px, stan fokusa z tokenów.
2. Logo: z `public/brand/` (jasne/ciemne zależnie od motywu), wysokość zgodna z §4, pole ochronne; bez cieni i obrysów. Jeśli `/` pokazuje duży znak, ≥ 120 px.
3. Najwyżej jedno czerwone zakreślenie na ekranie; jedna animacja wejścia (tło) i reakcja na działanie; reduced-motion bez ruchu.
4. Odstępy ze skali (siatka 4 px), sekcje 48–64 px; przykłady i kroki jako `PageSection`/`LinkList` (C04), bez identycznych „kart”.
5. Teksty: bez haseł marketingowych i emoji (STYL §11); treści strony bez zmian (P6 A), chyba że naruszają §11 (wypisz w PR).
Gotowe, gdy:
- Test komponentu: na `/` brak klas `rounded-*`, `shadow-*`, `backdrop-blur`, wartości sztywnych kolorów i px w `className`; logo jest z `/brand/…` o dozwolonej wysokości.
- Test e2e (360, 390, 768, 1280, jasny i ciemny motyw): kontrast tekstu ≥ 4,5:1 (sprawdzenie wyliczonych kolorów), pola dotykowe ≥ 44 px, napisy nie wychodzą poza pola, na stronie najwyżej jeden element w kolorze `korekta`.
- Test e2e: zrzut elementów DOM nagłówka i sekcji z przyciskiem (wzorce odświeży CI: napisz w PR).
- `test no-hardcoded-colors` zielony.
Nie ruszaj: src/view/Header.tsx i layout (C05), stopka (C06), src/core/start/*, config/tokens.json, docs/STYL.md (nie zmieniasz wytycznych), docs/STAN.md, package.json, istniejące `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Sprawdziłem stronę główną z listą wytycznych wyglądu (logo, kolory, krój, przyciski, odstępy) i poprawiłem każde odstępstwo.
- Co sprawdzić na podglądzie Vercel: `/` na telefonie i komputerze, jasny i ciemny motyw: logo, przycisk, kolory, odstępy.
- Czego nie zrobiłeś i dlaczego: Nie zmieniałem tekstów ani samej animacji tła.
Tytuł PR zaczyna się od `[W24-C07]`; gałąź `claude/W24-C07` od `origin/main`; nie scalaj.
Prompt podagenta: sekcja 3 w `docs/PLAN-FALE-C.md` z id = C07.
