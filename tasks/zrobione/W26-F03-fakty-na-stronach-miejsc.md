# F03 – Fakty na stronach miejsc, sąsiedzi i bliźniak
Fala pliku: W26 (Odkrycia). Fala budowy: F-3. Zależy od: F01, S07.
Cel: Statyczne strony miejsc (S07) mają w `lead` 3 najsilniejsze fakty jednostki; robot liczy sąsiedztwo z `admin.topo.json` i dodaje fakty F3 „na tle sąsiadów” oraz F8 „bliźniak” z linkami do tych stron (linki wewnętrzne).
Zmieniaj: src/core/facts/*, src/core/seo/*, scripts/data/build-facts.mjs, scripts/seo/*, config/facts.json, public/data/facts/*, public/data/facts-start.json, tests/unit/f03-*.test.ts, tests/fixtures/facts/*, src/view/start/*
Wymagane: tests/unit/f03-neighbours.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA.md (§3 F3/F8, §8), src/core/seo/unit-page.ts, scripts/seo (generator S07)
Zadanie: sąsiedzi = wspólne łuki w topologii (ten sam poziom); przy < 4 sąsiadach – sąsiedzi sąsiadów (obwarzanek: miasto z 1 sąsiadem). F3: wartość poza zakresem wszystkich sąsiadów. F8: najbliższa jednostka w innym województwie wg ~10 wskaźników standaryzowanych. `lead` strony miejsca = 3 zdania faktów + dotychczasowe zdania S06 (bez powtórzeń). Na starcie w stanie B dodaj „Twoja okolica” (F3) i „Twój bliźniak” (F8) z linkiem do porównania. Audyt S08: ostrzeżenie, gdy jeden szablon zdania jest na > 30% stron.
Gotowe, gdy:
- Test: obwarzanek (miasto z 1 sąsiadem) dostaje sąsiadów drugiego rzędu; sąsiedztwo jest symetryczne.
- Test: bliźniak jest z innego województwa i różny od jednostki.
- Test: strona miejsca z fixture zawiera ≥ 3 zdania faktów i link do sąsiada/bliźniaka.
Nie ruszaj: pliki ekranu mapy, docs/STAN.md, `*-snapshots/`.
Po ludzku: strony gmin i powiatów w Google pokazują ciekawostki (np. „najmniej osób 65+ spośród 8 gmin dookoła”) i prowadzą do sąsiadów i „bliźniaka” z innego województwa.
Tytuł PR zaczyna się od `[W26-F03]`; gałąź `claude/W26-F03` od `origin/main`.
