# C05 – Nagłówek i menu telefonu na wspólnych modułach, bez powtórzeń
Fala pliku: W24 (etap C). Fala budowy: 3 z 4. Zależy od: C03, C04, B13. Równolegle z: C06, C07, C08.
ZAKRES WSTĘPNY: listę poprawek wpisze Claude po C03 (sekcja „Wniosek”).
Cel: Nagłówek (logo, Start, Mapa, „Kopiuj link”) i menu telefonu mają jeden układ z modułów C04, logo zgodne z STYL §4 i nic się w nich nie powtarza ani nie zasłania.
Zmieniaj: src/view/Header.tsx, src/view/layout/SiteLayout.tsx, src/view/layout/CopyLinkButton.tsx, tests/unit/c05-header.test.tsx, tests/e2e/c05-header.spec.ts
Wymagane: tests/unit/c05-header.test.tsx, tests/e2e/c05-header.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/STYL.md (§4 Logo, §5, §12), docs/research/c/C03-audyt-ukladu.md, src/view/ui/Window.tsx, src/view/ui/LinkList.tsx, src/view/Header.tsx
Zadanie:
1. Menu telefonu: `Window` (odmiana `fullscreen`/`dialog` wg C03) + `LinkList`; te same linki co na komputerze, bez duplikatów (Start, Mapa, O projekcie, Skąd są dane).
2. Logo: tylko pliki z `public/brand/`, wysokość 28–32 px (telefon) i 36–40 px (komputer), pole ochronne ≥ wysokość litery F, bez cieni; wersja jasna/ciemna zależnie od motywu.
3. „Kopiuj link” (z B13) w jednym miejscu na komputerze i telefonie; nie wypycha logo ani menu poza ekran przy 360 px.
4. Poprawki z C03 dla nagłówka (zasłanianie, wysokość, odstępy) tylko przez klasy z tokenów.
Gotowe, gdy:
- Test komponentu: nagłówek ma logo z `/brand/…` o wysokości w zakresie STYL §4; menu telefonu ma ten sam zestaw linków co komputer, każdy raz.
- Test e2e (360, 390, 768, 1280 px): elementy nagłówka (logo, linki, „Kopiuj link”, przycisk menu) nie nachodzą na siebie, nie wychodzą poza ekran, pola ≥ 44 px; menu telefonu otwiera się, zamyka Esc i zwraca fokus.
- Test: brak `rounded-*`, `shadow-*`, wartości sztywnych w zmienionych plikach.
Nie ruszaj: src/view/Home.tsx, src/view/map/*, src/view/layout/SiteFooter.tsx (C06), src/view/start/* (C07), config/*, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Nagłówek i menu na telefonie mają jeden, uporządkowany układ, bez powtórzeń i z logo zgodnym z wytycznymi.
- Co sprawdzić na podglądzie Vercel: Każda strona na telefonie (także wąskim) i komputerze: nagłówek, otwarcie i zamknięcie menu, „Kopiuj link”.
- Czego nie zrobiłeś i dlaczego: Stopka i strona startowa mają osobne zadania.
Tytuł PR zaczyna się od `[W24-C05]`; gałąź `claude/W24-C05` od `origin/main`; nie scalaj.
Prompt podagenta: sekcja 3 w `docs/PLAN-FALE-C.md` z id = C05.
