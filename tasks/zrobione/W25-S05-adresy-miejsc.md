# S05 – Stałe, czytelne adresy stron miejsc (logika)
Fala pliku: W25 (SEO). Fala budowy: S-2. Zależy od: S03 (`site.ts`).
Cel: Każde z 2875 miejsc ma jeden stały, unikalny adres bez polskich znaków, np. `/wojewodztwo/malopolskie`, `/powiat/krakowski`, `/miasto/krakow`, `/gmina/wieliczka`, `/gmina/boleslawiec-miasto`; z adresu da się odczytać TERYT.
Zmieniaj: src/core/seo/slug.ts, tests/unit/s05-slug.test.ts
Wymagane: tests/unit/s05-slug.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: docs/SEO.md (D2), src/core/units/ (typy jednostek), tests/fixtures (lista jednostek; jeśli brak pełnej listy – nagraj `tests/fixtures/seo/units.json` z `public/data/units.json` i opisz w PR)
Zadanie:
1. `slugify(name)`: małe litery, ą→a, ć→c, ę→e, ł→l, ń→n, ó→o, ś→s, ź/ż→z, inne znaki → `-`, bez podwójnych i końcowych `-`.
2. `buildUnitPaths(units)` → `Map<teryt, path>` i odwrotna `Map<path, teryt>`:
   - woj: `/wojewodztwo/<slug>`;
   - pow (nazwa bez „powiat ”): `/powiat/<slug>`; powtórzona nazwa → `-<slug województwa>`;
   - miasto na prawach powiatu (TERYT powiatu 61–99): **jedna** strona `/miasto/<slug>`; TERYT powiatu i gminy (np. 1261 i 1261011) wskazują ten sam adres;
   - gmina: `/gmina/<slug>`; powtórzona nazwa → dopisek z 7. cyfry TERYT (1 `-miasto`, 2 `-gmina-wiejska`, 3 `-gmina-miejsko-wiejska`); nadal powtórzona → `-powiat-<slug powiatu>`; nadal → `-<teryt>`.
3. Kody TERYT jako string.
Gotowe, gdy:
- Test na pełnej liście (2875): wszystkie adresy unikalne, tylko `[a-z0-9/-]`, odwzorowanie odwrotne zgodne; 66 miast ma `/miasto/`.
- Test przykładów: 12 → `/wojewodztwo/malopolskie`; 0201011 i 0201022 (Bolesławiec) mają różne adresy; „Łódź” → `lodz`; „Kędzierzyn-Koźle” → `kedzierzyn-kozle`.
- Test stabilności: lista adresów 30 wybranych jednostek zapisana w teście dosłownie (zmiana algorytmu = świadoma zmiana testu za zgodą właściciela, bo zmienia adresy w Google).
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku: ustalamy, pod jakim adresem będzie strona każdej gminy, powiatu i województwa. Nic jeszcze nie widać na stronie.
Tytuł PR zaczyna się od `[W25-S05]`; gałąź `claude/W25-S05` od `origin/main`; nie scalaj.
