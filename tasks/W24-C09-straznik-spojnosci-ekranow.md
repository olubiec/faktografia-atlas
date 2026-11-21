# C09 – Strażnik spójności: testy pilnują zasłaniania, powtórzeń i wytycznych na wszystkich ekranach
Fala pliku: W24 (etap C). Fala budowy: 4 z 4. Zależy od: C05, C06, C07, C08. Równolegle z: B14.
Cel: Jeden zestaw testów e2e sprawdza na każdej trasie i w czterech rozmiarach, że nic się nie zasłania, nie wychodzi poza ekran i nie łamie wytycznych STYL, żeby kolejne zmiany nie psuły układu.
Zmieniaj: tests/e2e/c09-layout-guard.spec.ts, tests/e2e/helpers/layoutGuard.ts, tests/unit/c09-style-guard.test.ts
Wymagane: tests/e2e/c09-layout-guard.spec.ts, tests/unit/c09-style-guard.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/STYL.md (§5, §12), docs/research/c/C03-audyt-ukladu.md, tests/e2e/c08-map-layout.spec.ts
Zadanie:
1. `layoutGuard.ts`: funkcja zbierająca prostokąty elementów `fixed/sticky/absolute` i interaktywnych (a, button, input) i sprawdzająca: brak przecięć między elementami z różnych stref, wszystko w oknie, pola dotykowe ≥ 44 px, brak poziomego przewijania strony.
2. Test e2e przechodzi trasy `/`, `/mapa`, `/mapa` z wybraną gminą i profilem, `/o-projekcie`, `/zrodla`, `/prywatnosc`, `/rankingi`, `/porownaj` w 360, 390, 768, 1280 px (dla `/rankingi` i `/porownaj` tylko zasłanianie i poziome przewijanie).
3. Test jednostkowy `c09-style-guard`: w `src/view` brak `rounded-*`, `shadow-*`, `backdrop-blur` (poza `src/components/ui/*` po `shadcn add`: tam sprawdza, że nie ma ich po zamianie); brak odwołań do `/biblioteka` poza `App.tsx` i `legacy-links.ts`; logo tylko z `/brand/`.
4. Jeśli test znajdzie błąd w kodzie, NIE osłabiaj testu ani nie poprawiaj kodu poza „Zmieniaj”: wypisz w PR listę błędów (plik, ekran, rozmiar); Claude zdecyduje o poprawce.
Gotowe, gdy:
- Test e2e jest zielony na wszystkich trasach i rozmiarach albo PR zawiera listę znalezionych błędów z dowodem (zrzut/prostokąty).
- Test jednostkowy zielony; dla każdej reguły jest przypadek, w którym test by zawiódł (sprawdzenie na sztucznym wejściu).
Nie ruszaj: cały kod poza testami, config/*, docs/STAN.md, package.json, istniejące testy i `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Dodałem testy, które same sprawdzają, że na żadnym ekranie nic się nie zasłania i nic nie wychodzi poza ekran.
- Co sprawdzić na podglądzie Vercel: Nic na stronie; przeczytaj w PR, czy testy coś znalazły.
- Czego nie zrobiłeś i dlaczego: Nie naprawiałem znalezionych błędów w tym PR.
Tytuł PR zaczyna się od `[W24-C09]`; gałąź `claude/W24-C09` od `origin/main`; nie scalaj.
Prompt podagenta: sekcja 3 w `docs/PLAN-FALE-C.md` z id = C09.
