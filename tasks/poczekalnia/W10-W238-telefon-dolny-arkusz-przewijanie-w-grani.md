# W2.38 – Telefon: dolny arkusz – przewijanie w granicach ekranu i przycisk zamiast przeciągania
Cel: przewijana zawartość arkusza kończy się przy dolnej krawędzi ekranu (dziś przy 40% jej dół leży pod ekranem, więc przyciski w środku są poza widocznym oknem), a arkusz da się rozwinąć i zwinąć także przyciskiem, nie tylko przeciąganiem.
Zmieniaj: src/view/ui/BottomSheet.tsx, src/view/profile/ProfileSheetMobile.tsx, tests/e2e/bottom-sheet-scroll.spec.ts
Wymagane: tests/e2e/bottom-sheet-scroll.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Limity zmian w plikach wspólnych: src/view/profile/ProfileSheetMobile.tsx – najwyżej 30 linii zmiany
Zrzuty: zadanie zmienia wzorce zrzutów; nie generuj ich u siebie, napisz w PR, że trzeba uruchomić „Update snapshots”.

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W2.38 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** przewijana zawartość arkusza kończy się przy dolnej krawędzi ekranu (dziś przy 40% jej dół leży pod ekranem, więc przyciski w środku są poza widocznym oknem), a arkusz da się rozwinąć i zwinąć także przyciskiem, nie tylko przeciąganiem.
- **Skąd (R13, 27.10.2026, `docs/research/weryfikacja-runda3.md`):** gotowego szablonu nie ma; `react-modal-sheet` 5.6.0 ma potrzebne opcje: w `Sheet.Content` `scrollRef`, `scrollClassName`, `disableDrag`/`disableScroll` jako funkcje stanu `{ scrollPosition: 'top' | 'bottom' | 'middle', currentSnap }`, w `Sheet` `prefersReducedMotion`, `avoidKeyboard`, a `Sheet.useContext().snapTo(index)`. WCAG 2.2 (kryterium 2.5.7): każda funkcja wymagająca przeciągania musi mieć alternatywę jednym dotknięciem. Apple HIG: niemodalny arkusz, gdy tło ma zostać aktywne. Wcześniejsza próba (PR #361) dodała `flex-1 min-h-0` na `Sheet.Content` i psuła `profile-tabs`, więc pierwsza zmiana ma być w tym, **jak** przewijana część jest podpięta, a nie w samym układzie flex.
- **Przeczytaj najpierw:** `src/view/ui/BottomSheet.tsx` (używany też przez arkusz wskaźnika, W2.5), `src/view/profile/ProfileSheetMobile.tsx` (parametr `?sheet=full` zostaje), `node_modules/react-modal-sheet/dist/index.d.ts`, `docs/PRODUKT.md` §5, `docs/STYL.md` §2–§4, `tests/e2e/profile-mobile.spec.ts`, `tests/e2e/share-profile.spec.ts`, `tests/e2e/profile-tabs.spec.ts`, `tests/e2e/mobile-indicator-sheet.spec.ts`.
- **Pliki:** `src/view/ui/BottomSheet.tsx` (zmiana), `src/view/profile/ProfileSheetMobile.tsx` (częściowy, do 30 linii), `tests/e2e/bottom-sheet-scroll.spec.ts` (nowy).
- **Zadanie:** (1) przewijanie zawartości w wewnętrznym kontenerze podpiętym przez opcje biblioteki (`scrollClassName`/`scrollRef`), którego wysokość to wysokość widocznego fragmentu arkusza (przy 40% – 40% okna; przy 100% – całe okno), tak by ostatni przycisk w środku był osiągalny przewijaniem przy każdym punkcie zatrzymania; (2) przeciąganie za zawartość zmienia punkt zatrzymania tylko wtedy, gdy zawartość jest przewinięta na górę (`disableDrag` jako funkcja stanu); (3) w nagłówku arkusza przyciski „Rozwiń”/„Zwiń” (≥ 44 px, nazwy dla czytnika ekranu, wołają `snapTo`) – alternatywa dla przeciągania; (4) `prefersReducedMotion` z `matchMedia`; (5) zamknięcie (×) i Esc bez zmian; baner zgody i mapa bez zmian.
- **Gotowe, gdy (`@S15`):** e2e na 390×800 i 360×740: przy 40% po przewinięciu zawartości ostatni przycisk w środku („Pobierz i udostępnij”) mieści się w oknie; „Rozwiń” daje ≥ 90% wysokości, „Zwiń” wraca do ok. 40% (bez myszy i bez przeciągania); przewinięcie zawartości w środku nie zmienia punktu zatrzymania; istniejące testy (`profile-mobile`, `profile-tabs`, `share-profile`, `mobile-indicator-sheet`, `picker-scroll`) przechodzą bez zmian; brak poziomego przewijania; pola dotykowe ≥ 44 px; axe bez błędów; test przechodzi 3×.
- **Ty sprawdzasz:** na telefonie: wybierz miejsce, przewiń profil do końca przy małym arkuszu i dotknij „Pobierz i udostępnij”; rozwiń i zwiń arkusz przyciskami.
- **Nie ruszaj:** `ProfileOverview.tsx` (W2.25), `Header.tsx`, `AtlasMap.tsx`, istniejących testów.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W10-W238). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W10-W238]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
