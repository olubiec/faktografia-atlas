# F04 – 7 stron tematów i zestawienia
Fala pliku: W26 (Odkrycia). Fala budowy: F-3. Zależy od: F01, S07, S10.
Cel: Powstaje 7 statycznych stron `/temat/<grupa>` (Ludność, Praca, Pieniądze, Mieszkania, Środowisko, Życie, Transport – wg grup z config/indicators.json) i ok. 25 stron zestawień `/zestawienie/<slug>` (np. „Gminy, które urosły najbardziej w 10 lat”), w mapie strony, z linkami do rankingów i stron miejsc.
Zmieniaj: src/core/seo/*, src/core/facts/*, scripts/seo/*, config/lists.json, src/view/start/*, vercel.json, tests/unit/f04-*.test.ts
Wymagane: tests/unit/f04-topics.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA.md (§7, §7a, §7b), scripts/seo (S07, S10), docs/SEO.md
Zadanie: `config/lists.json` – definicje zestawień (wskaźnik, poziom, kierunek, rodzaj: wartość / zmiana 10 lat, min. ludność dla gmin = 5 000, by uniknąć szumu); generator tworzy strony z tytułem, H1, wstępem ze stałych zdań (liczby z danych), tabelą 50 pozycji z linkami do stron miejsc, `ItemList` w JSON-LD, linkiem do mapy. Strona tematu: co mierzymy (wskaźniki grupy z linkami do rankingów), najwyżej/najniżej, 3 najsilniejsze fakty tematu, linki do zestawień. Karty „Zestawienia” na starcie linkują do tych stron. Strażnik S08 obejmuje nowe strony.
Gotowe, gdy:
- Test: 7 stron tematów i każda z `config/lists.json` ma unikalny tytuł, opis, jeden H1, kanoniczny adres i jest w mapie strony.
- Test: zestawienie zmian 10 lat pomija gminy < 5 000 mieszkańców i okna ze zmianą granic.
- Test: brak martwych linków wewnętrznych z nowych stron.
Nie ruszaj: pliki ekranu mapy, docs/STAN.md, `*-snapshots/`.
Po ludzku: powstają strony tematyczne (np. „Mieszkania”) i zestawienia typu „najszybciej rosnące gminy” – to na nie ludzie trafiają z Google i to je cytują media.
Tytuł PR zaczyna się od `[W26-F04]`; gałąź `claude/W26-F04` od `origin/main`.
