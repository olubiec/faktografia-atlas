# S01 – robots.txt, mapa strony i podstawowe meta w HTML startowym
Fala pliku: W25 (SEO). Fala budowy: S-1. Zależy od: nic. Równolegle z: S02, S04.
Cel: Robot, który nie wykonuje JavaScriptu (Bing, ChatGPT, Perplexity), widzi w HTML strony tytuł, opis, język, link do mapy strony i krótką treść z linkami; robots.txt i sitemap.xml są prawdziwymi plikami.
Zmieniaj: public/robots.txt, public/sitemap.xml, index.html, tests/unit/s01-seo-basics.test.ts
Wymagane: tests/unit/s01-seo-basics.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/SEO.md (§1, §3), index.html, src/App.tsx (trasy), src/view/start/StartPage.tsx (opis strony)
Zadanie:
1. `public/robots.txt`: `User-agent: *`, `Allow: /`, `Disallow: /__test/`, `Disallow: /design`; bez blokowania `/data/` i `/geo/` (Google potrzebuje ich do renderowania). Linia `Sitemap: https://faktografia.eu/sitemap.xml`. Roboty AI (D5) nie są blokowane – bez osobnych sekcji.
2. `public/sitemap.xml`: 5 adresów: `/`, `/mapa`, `/o-projekcie`, `/zrodla`, `/prywatnosc` (pełne adresy https://faktografia.eu, bez `lastmod`). Plik zostanie zastąpiony generatorem w S07.
3. `index.html`: `<meta name="description" data-fallback>` (tekst z StartPage), `og:site_name` = Faktografia, `og:locale` = pl_PL, `og:type` = website. Wszystkie tagi, które PageMeta też ustawia, mają atrybut `data-fallback` (S03 usuwa je po starcie aplikacji, żeby nie było duplikatów).
4. W `<div id="root">` treść zastępcza (React ją zastąpi): `<h1>Faktografia – dane GUS o gminach i powiatach na mapie</h1>`, jedno zdanie opisu, lista linków: Mapa, O projekcie, Skąd są dane. Bez stylów wpisanych na sztywno (zwykłe znaczniki).
Gotowe, gdy:
- Test: robots.txt zawiera `Sitemap: https://faktografia.eu/sitemap.xml`, nie zawiera `Disallow: /` (samego), nie blokuje `/data`.
- Test: sitemap.xml jest poprawnym XML z 5 elementami `<loc>`, wszystkie zaczynają się od `https://faktografia.eu/`, każda ścieżka istnieje w `src/App.tsx`.
- Test: index.html ma `lang="pl"`, opis 70–160 znaków, `og:locale` pl_PL, `<h1>` i co najmniej 3 linki wewnątrz `#root`.
- `pnpm build`: `dist/robots.txt` i `dist/sitemap.xml` istnieją.
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku (do opisu PR):
- Co zrobiłeś: strona ma plik dla robotów wyszukiwarek, spis adresów i opis widoczny nawet bez JavaScriptu.
- Co sprawdzić na podglądzie Vercel: adres `/robots.txt` i `/sitemap.xml` pokazują tekst (nie stronę z mapą).
- Czego nie zrobiłeś: obrazka do udostępnień i adresów kanonicznych – to S03.
Tytuł PR zaczyna się od `[W25-S01]`; gałąź `claude/W25-S01` od `origin/main`; nie scalaj.
