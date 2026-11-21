# B07 – Animowane tło strony startowej i wejście do mapy
Fala pliku: W23 (etap B budowy). Fala budowy: 3 z 8. Zależy od: B03, B04. Równolegle z: B06.
Cel: Na `/` w tle rusza się obrys Polski w kolorach aktualnych danych (sam losowo, a za myszą lub palcem reaguje), a przycisk „Otwórz mapę” płynnie prowadzi na `/mapa`; sekcje pod mapą znikają.
Zmieniaj: src/view/start/StartBackground.tsx, src/view/start/StartPage.tsx, src/core/start/outline.ts, src/core/start/start-data.ts, src/view/Home.tsx, tests/unit/b07-start-data.test.ts, tests/unit/b07-start-background.test.tsx, tests/e2e/path-s1-pierwsza-wizyta.spec.ts, tests/e2e/b07-start-budget.spec.ts
Usuń (zgoda właściciela, tylko jeśli plik istnieje i po zmianie nie ma importera: sprawdź `rg -l`): src/view/home/PortalSections.tsx, src/view/home/FeaturedComparisons.tsx, tests/unit/portal-sections.test.tsx, tests/e2e/home-portal.spec.ts (Z4; sekcje pod mapą znikają, przykłady są już na ekranie startowym od B03)
Wymagane: tests/unit/b07-start-data.test.ts, tests/unit/b07-start-background.test.tsx, tests/e2e/path-s1-pierwsza-wizyta.spec.ts, tests/e2e/b07-start-budget.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U07.md (całość), docs/KONCEPT-STRONA-STARTOWA.md, src/core/start/idle-motion.ts, tests/unit/u07-idle-motion.test.ts, src/view/test/proto/start.tsx, public/geo/start-outline.json, public/data/start.json, src/view/Home.tsx
Zgody właściciela (21.11.2026, odpowiedź P2 A): Z1 (adresy w testach e2e), Z2 (testy strony startowej i nazwy), Z3 (usunięcie testów Biblioteki, Rankingów, Porównaj i pickera razem z funkcją), Z4 (usunięcie testów „Moich wskaźników” i martwych sekcji). Zgody dotyczą wyłącznie plików wymienionych w tym zadaniu. Ten prompt wprost wymienia plik ekranu src/view/Home.tsx (usuwasz z niego wyłącznie PortalSections, napis „Przewiń w dół: Działy tematyczne · Rekordy Polski · Pojedynki miejsc · Biblioteka” i nic więcej).
Zadanie:
1. `StartBackground`: własny SVG (bez nowego pakietu i bez WebGL) z `public/geo/start-outline.json`, kolory z `public/data/start.json` (5 klas, tokeny `--seq-1…5`, `--no-data`). Logikę ruchu bierzesz z `src/core/start/idle-motion.ts` (NIE zmieniasz tego pliku ani jego testu). Odpowiedź właściciela: tło A, cykl 4 wskaźników co 5 s, pierwszy kadr (i `prefers-reduced-motion`, i stan bez JS) = ludność.
2. Zachowanie: bez ruchu kursora tryb losowy; ruch myszy lub palca = tryb reakcji (podświetlenie i fala); po 4 s bezruchu powrót do losowego; podpis „Stopa bezrobocia, 2025 · mazowieckie: 3,1 %” tylko gdy animacja reaguje; opis dla czytników ekranu „Mapa Polski: <wskaźnik>”; pole ma `touch-action: none` tylko nad obrysem, strona nadal się przewija poza nim; jedna pętla `requestAnimationFrame`, pauza gdy karta ukryta (`visibilitychange`) i gdy tło poza ekranem.
3. Wejście: klik „Otwórz mapę” — obrys płynnie powiększa się i zanika (czas z tokenu `motion.cameraIn`, bez animacji przy `prefers-reduced-motion`), potem nawigacja na `/mapa`. Czasy, kolory i odstępy tylko z tokenów (test `no-hardcoded-colors` ma przejść).
4. Home.tsx: usuń `PortalSections`, napis „Przewiń w dół…” i ich importy; usuń pliki z listy „Usuń” (po sprawdzeniu `rg -l`). `IntroOverlay` zostaje (usunie go B14).
5. Budżety (U07): obrys ≤ 25 KB (≤ 10 KB gzip), `start.json` ≤ 5 KB, 0 pobrań wartości wskaźników i `units.json`, p95 klatki ≤ 33 ms na SwiftShader ×4 CPU (3 powtórzenia, mediana; napisz w PR, że to liczby orientacyjne, werdykt daje telefon właściciela).
Gotowe, gdy:
- Test jednostkowy ładowania: z fixture `start.json` powstaje 16 pól w kolorach 5 klas; pierwszy kadr to ludność; przy `prefers-reduced-motion` brak cyklu i brak zmian koloru w 6 s.
- Test komponentu: bez zdarzeń wskaźnik cyklu zmienia się co 5 s; ruch kursora zatrzymuje cykl i pokazuje podpis z nazwą województwa i wartością; ukrycie karty zatrzymuje pętlę.
- Test e2e `@PATH-1` (390 i 1280 px): `/` → czytam zdanie i 3 kroki → „Otwórz mapę” → adres `/mapa`; mapa gotowa; cała Polska widoczna; domyślny wskaźnik na województwach; 0 błędów w konsoli.
- Test e2e budżetu: na `/` zero żądań `values/`, `units.json`, `localities`; tylko obrys i `start.json`; pliki mieszczą się w budżecie rozmiaru.
- Test e2e: `/mapa` nie ma sekcji pod mapą ani napisu „Rekordy Polski”.
- Test e2e reduced-motion: kolory tła nie zmieniają się przez 6 s.
Nie ruszaj: src/core/start/idle-motion.ts, src/view/map/AtlasMap.tsx, src/view/map/hooks/*, src/view/map/IntroOverlay.tsx, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Strona startowa dostała animowany obrys Polski w tle: sam się rusza, a gdy poruszasz myszą albo palcem, reaguje. Po „Otwórz mapę” obrys płynnie powiększa się i otwiera się mapa. Sekcje pod mapą zniknęły.
- Co sprawdzić na podglądzie Vercel: Otwórz `/` na telefonie i komputerze: czy tło jest płynne, czy nie zacina, czy palec po tle nie blokuje przewijania strony, czy kolory zmieniają się co kilka sekund; wejdź na `/mapa`.
- Czego nie zrobiłeś i dlaczego: Nie zmieniałem logiki ruchu (jest z U07) ani nie robiłem przejścia kamerą WebGL: przejście to powiększenie obrysu. Jeśli telefon zacina, schodzimy do jednego stałego wskaźnika (ludność) jedną zmianą.
Tytuł PR zaczyna się od `[W23-B07]`; gałąź `claude/W23-B07` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B07] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B07-tlo-animowane-i-wejscie-do-mapy.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: B03, B04. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B07 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B07] Animowane tło strony startowej i wejście do mapy”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
