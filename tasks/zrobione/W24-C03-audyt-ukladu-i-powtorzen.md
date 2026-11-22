# C03 – Audyt układu: powtórzenia, zasłanianie, niespójne okna i menu (bez zmian w kodzie strony)
Fala pliku: W24 (etap C). Fala budowy: 1 z 4. Zależy od: nic. Równolegle z: C01, C02.
Cel: Powstaje konkretna lista, co na każdym ekranie się powiela, zasłania albo wygląda inaczej niż reszta, razem z propozycją wspólnych modułów, na których C04–C08 naprawią to jednolicie.
Zmieniaj: docs/research/c/C03-audyt-ukladu.md, docs/research/c/C03-zrzuty/*
Wymagane: docs/research/c/C03-audyt-ukladu.md
Weryfikacja: pnpm lint && pnpm typecheck (kod strony nie jest zmieniany; `git diff --name-only origin/main...HEAD` tylko w `docs/research/c/`)
Przeczytaj najpierw: AGENTS.md, docs/STYL.md (całość, szczególnie §4 Logo, §5 Układ, §12), docs/PRODUKT.md, docs/INSPIRACJE.md (wpisy `zweryfikowane`: shadcn/ui blocks), docs/ELEMENTY.md, src/components/ui/*, src/view/ui/*, src/view/design/DesignPage.tsx (`/design`), docs/research/q2-telefon-390.md
Zadanie:
1. Zrzuty (Playwright, `deviceScaleFactor` 1, do `docs/research/c/C03-zrzuty/`): `/`, `/mapa` (bez wyboru, z wybraną gminą, z profilem, z oknem „Wybierz dane” po C01 jeśli scalone), `/rankingi`, `/porownaj`, `/o-projekcie`, `/zrodla`, `/prywatnosc`, stopka każdej z nich; rozmiary 390×844, 768×1024, 1280×800; jasny i ciemny motyw tam, gdzie to ma znaczenie. Nie generujesz wzorców `*-snapshots/`.
2. Zasłanianie: skrypt (w scratchpadzie, nie w repo) liczy dla elementów `position: fixed/sticky/absolute` na każdym ekranie przecinające się prostokąty i listuje pary (np. dolny pasek × okienko miejsca × atrybucja × przycisk „Cofnij”). Wynik: tabela „ekran · rozmiar · co zasłania co”.
3. Powtórzenia: dla każdego ekranu wypisz informacje pokazane więcej niż raz (np. nazwa wskaźnika w panelu i w nagłówku, ten sam link w nagłówku, stopce i menu telefonu, ten sam przycisk dwa razy) i zaproponuj, które miejsce zostaje.
4. Spójność: zestawienie rodzajów okien i menu (Dialog, BottomSheet, Sheet, panel, Popover, arkusz profilu) ze wspólnymi cechami: tło, ramka, padding, odstęp między sekcjami, wysokość nagłówka okna, przycisk zamknięcia, układ przycisków, wysokość pól dotykowych, wyjątki od STYL.md (np. `rounded-*`, `shadow-*`, wartości sztywne w `className`). Tabela „komponent · odchylenie od STYL · gdzie w kodzie”.
5. Wzorce i gotowce: sprawdź, co już jest w repo i w zainstalowanych pakietach (`radix-ui`, `cmdk`, `src/components/ui/*`, `/design`) oraz w repozytoriach ze statusem `zweryfikowane` w INSPIRACJE.md; dla każdego modułu z p. 6 napisz, co z tego użyć (nazwa, plik, licencja). Nowe pakiety lub repozytoria spoza listy: tylko wymień kandydatów z linkiem, licencją i datą wydania (sprawdzone w rejestrze), nie dodawaj.
6. Propozycja modułów wspólnych (do C04): np. `Window` (pełnoekranowe/okno/arkusz dolny z jednym nagłówkiem i przyciskiem zamknięcia), `PageSection` (nagłówek + treść + odstępy), `LinkList` (lista linków stopki i menu), `ToolbarButton`; dla każdego: propsy, gdzie zastępuje istniejące kawałki, ile linii kodu ubywa.
7. Wniosek: lista poprawek podzielona na ekrany C05 (nagłówek i menu), C06 (stopka i odwołania do Biblioteki), C07 (strona `/`), C08 (panele i okna na mapie) z poprawionymi listami plików „Zmieniaj” dla każdego (Claude wpisze je do tasków przed startem fali 3).
Gotowe, gdy:
- `docs/research/c/C03-audyt-ukladu.md` ma sekcje: Zrzuty (lista plików), Zasłanianie (tabela), Powtórzenia (tabela), Spójność (tabela), Gotowce, Moduły wspólne, Wniosek; każdy wiersz tabel wskazuje plik i linię w kodzie.
- Każdy ekran z p. 1 jest w co najmniej dwóch rozmiarach w `C03-zrzuty/`.
- `git diff --name-only origin/main...HEAD` zawiera tylko pliki w `docs/research/c/`.
Nie ruszaj: cały kod (`src/*`, `tests/*`, `config/*`), `docs/STAN.md`, `docs/INSPIRACJE.md` (kandydatów tylko zgłaszasz w raporcie), `*-snapshots/`, package.json.
Po ludzku (do opisu PR):
- Co zrobiłeś: Sprawdziłem wszystkie ekrany na telefonie i komputerze i spisałem, co się powiela, co co zasłania i co wygląda inaczej niż reszta, z zrzutami.
- Co sprawdzić na podglądzie Vercel: Nic na stronie (nie ma zmian w kodzie); przejrzyj raport i zrzuty i powiedz, czy lista poprawek zgadza się z tym, co widzisz.
- Czego nie zrobiłeś i dlaczego: Niczego nie naprawiałem; naprawy są w C04–C08.
Tytuł PR zaczyna się od `[W24-C03]`; gałąź `claude/W24-C03` od `origin/main`; nie scalaj.
Prompt podagenta: sekcja 3 w `docs/PLAN-FALE-C.md` z id = C03.
