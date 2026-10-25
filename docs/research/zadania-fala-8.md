# Rozpiska zadań po raportach R1–R5 (25.10.2026)
Podstawa: `docs/research/weryfikacja-raportow-v2.md`. Zadania N1–N12 to **propozycja**: do `docs/ARCHITEKTURA.md` §3–§4 i `scripts/ops/automat-kolejka.json` wchodzą dopiero po Twoich decyzjach D1–D5 (jeden osobny PR; test `ops-kolejka.test.ts` pilnuje zgodności obu plików). Do tego czasu automat ich nie widzi i niczego nie uruchomi.
Format promptów: `WORKFLOW` §9.1. Każdy warunek „Gotowe, gdy” = co najmniej jeden test. Przy wszystkich: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`, brak usuniętych plików z `main`, wzorce zrzutów odświeża właściciel w CI (nie Jules).

## Decyzje właściciela (zanim zadania wejdą do planu)
| Nr | Pytanie | Rekomendacja | Zadania zależne |
|---|---|---|---|
| D1 | Budujemy stronę główną wg makiety 01 (`docs/design/01-start-komputer.png`: nagłówek, wyszukiwarka, zakładki wskaźników, mapa po prawej, stopka ze źródłem)? | **Tak** | N3 |
| D2 | Usuwamy z projektu nieużywany `@observablehq/plot` (wpis w ELEMENTY.md jest nieprawdziwy)? | **Tak** (1,5 MB, zero importów). Alternatywa: zostawić do zadania, które go użyje – wtedy poprawić tylko opis w ELEMENTY.md | N6 |
| D3 | „Zamów wskaźnik”: zwykły odnośnik do formularza Tally (nowa usługa, wpis w ELEMENTY, wzmianka w Prywatności), czy odnośnik do zgłoszenia na GitHubie (wymaga konta GitHub)? | **Tally jako odnośnik, bez osadzania** (osadzenie wymagałoby zmiany CSP). Zgłoszenia czytasz ręcznie | N12 |
| D4 | Magazyn biblioteki GUS: zakładasz konto Cloudflare i bucket R2 (darmowo do 10 GB, bez opłat za transfer) – czy zostajemy przy gałęzi do ~500 MB? Czy masz własną domenę (potrzebna do buforowania i CORS; adres `r2.dev` jest tylko do testów)? | Zacznij od adaptera (N8) – nic nie kosztuje; R2 (N9) dopiero, gdy `data/library` przekroczy ~500 MB albo ruszy S21 | N8, N9 |
| D5 | Kamera: czy po obejrzeniu S16 na telefonie szarpie? | Jeśli płynnie – N7 **nie robimy**. Jeśli szarpie – robimy | N7 |
Hosting zostaje na Vercel Hobby, dopóki nie ma reklam, płatności ani afiliacji (Fair Use Guidelines: darowizny są dozwolone). Przejście na Cloudflare Pages/Vercel Pro dopiero przy monetyzacji.

## Kolejność
| Fala | Zadania naraz | Pliki (kolizje: brak) | Warunek startu |
|---|---|---|---|
| F8 | N1 układ podstron · N2 SEO i metadane · N4 utrata kontekstu WebGL · N5 rozbicie TrendChart | `src/view/layout`+`pages/*` · `index.html`,`scripts/build`,`public/robots.txt`,`package.json` · `AtlasMap.tsx`,`core/map/test-seam.ts` · `view/profile/TrendChart*` | zielone CI na `main`, D1 niepotrzebne |
| F9 | N3 strona główna · N6 usunięcie Plot · (N7 kamera, tylko gdy D5 = szarpie) | `Home.tsx`,`view/home/*` · `package.json`,`pnpm-lock.yaml`,`ELEMENTY.md` · `useMapViewState.ts`,`useChoropleth.ts` | F8 scalona; D1, D2 |
| S20 | miasto/wieś (osobny plan w ARCHITEKTURA) | – | po F9 |
| F10 | N8 adapter magazynu biblioteki · N10 rdzeń katalogu i wyszukiwarki | `scripts/data/library-publish*`,`config/library.json` · `src/core/library/*` | D4 |
| F11 | N9 R2 ⚠️ (tylko gdy D4 = R2) · N11 widok biblioteki | `.github/workflows/fetch-library.yml` · `src/view/library/*`,`src/App.tsx` | F10; konto i sekrety założone |
| F12 | N12 „Zamów wskaźnik” | `src/view/library/Request*.tsx` | N11; D3 |

---

## N1 · Wspólny układ podstron i stopka
**Po ludzku:** „O projekcie”, „Skąd dane”, „Prywatność” i 404 dostają ten sam układ (nagłówek, treść, stopka z licencją i odnośnikami), zamiast trzech osobnych szkieletów.
**Przeczytaj najpierw:** `docs/STYL.md`, `docs/design/01-start-komputer.png` (stopka: „Źródło: GUS, Bank Danych Lokalnych. Licencja CC BY 4.0. Granice jednostek: domena publiczna.”), `src/view/pages/About.tsx`, `Sources.tsx`, `Privacy.tsx`, `src/view/NotFound.tsx`. Wzorzec układu (tylko pomysł, nie kod): shadcn/ui blocks – https://ui.shadcn.com/blocks (wpis `zweryfikowane` w INSPIRACJE.md).
**Zadanie:**
1. `src/view/layout/SiteLayout.tsx`: `Header` + `<main id="main">` (max-width treści ~70ch z tokenów) + `SiteFooter`; pierwszy element: odnośnik „Przejdź do treści”.
2. `src/view/layout/SiteFooter.tsx`: źródło danych, link do `/zrodla`, `/o-projekcie`, `/prywatnosc`, link do repozytorium kodu, rok. Bez zakreślenia (jedno czerwone zakreślenie na ekran zostaje dla treści strony).
3. Przepisz cztery strony na `SiteLayout`; treść bez zmian poza dwiema poprawkami:
   - **Sources:** licencja CC BY 4.0 z odnośnikiem https://creativecommons.org/licenses/by/4.0/legalcode.pl oraz **data ostatniego pobrania danych** czytana z pliku w `public/data` (znajdź pole z datą generowania; jeśli żadnego nie ma – nie wymyślaj, opisz w PR i pomiń datę).
   - **Privacy:** tekst ma zgadzać się z faktami: analityka PostHog tylko po zgodzie, motyw w `localStorage`. **Nie pisz**, że serwis „nie używa żadnych narzędzi śledzących ani ciasteczek”.
**Pliki:** `src/view/layout/SiteLayout.tsx`, `src/view/layout/SiteFooter.tsx`, `src/view/pages/About.tsx`, `Sources.tsx`, `Privacy.tsx`, `src/view/NotFound.tsx`, `tests/unit/layout.test.tsx`, `tests/e2e/pages.spec.ts` (nowe, `@S20`).
**Gotowe, gdy:**
- na `/o-projekcie`, `/zrodla`, `/prywatnosc` i nieistniejącej ścieżce jest `header`, `main#main` i `footer` z trzema odnośnikami (test e2e);
- stopka ma odnośnik do pełnej treści CC BY 4.0 (test);
- na 390 px żaden napis nie wychodzi poza pole, pola dotykowe ≥ 44 px (test geometrii);
- axe bez naruszeń na czterech stronach;
- zero kolorów i rozmiarów wpisanych na sztywno (`no-hardcoded-colors` przechodzi).
**Nie ruszaj:** `Home.tsx`, `App.tsx`, `AtlasMap.tsx`, istniejących testów i zrzutów.
**Ty sprawdzasz:** na telefonie: wszystkie cztery strony wyglądają spójnie; stopka ma źródło i licencję; w „Prywatności” zgadza się opis zgody.

## N2 · Metadane, udostępnianie linków, robots i sitemap
**Po ludzku:** po wklejeniu linku do strony w komunikator widać tytuł i opis, a wyszukiwarki dostają mapę strony – bez nowych pakietów.
**Przeczytaj najpierw:** `index.html`, `vercel.json`, `package.json` (skrypt `build`). Dokumentacja: React 19 – metadane w komponentach (`<title>`, `<meta>` trafiają do `<head>`): https://react.dev/reference/react-dom/components/title . **Prerender z React Router 8 odpada** (to tryb framework; my mamy `BrowserRouter`) – dowód: https://reactrouter.com/8.2.0/how-to/pre-rendering.md
**Zadanie:**
1. `index.html`: `<meta name="description">`, `og:title`, `og:description`, `og:type`, `og:locale=pl_PL`, `og:url` (adres produkcyjny z `VITE_SITE_URL`, jeśli brak – pomiń tag), `twitter:card=summary`. Obrazek OG **nie** w tym zadaniu (patrz „Poza zakresem”).
2. `src/view/seo/PageMeta.tsx`: komponent renderujący `<title>` i `<meta name="description">` per strona (hoisting React 19); użyj go w czterech stronach z N1 **tylko jeśli N1 jest już scalone**, inaczej zostaw podpięcie na osobny commit w N3.
3. `scripts/build/prerender-pages.mjs` (Node, bez pakietów): po `vite build` kopiuje `dist/index.html` do `dist/o-projekcie/index.html`, `dist/zrodla/index.html`, `dist/prywatnosc/index.html`, podmieniając `<title>`, `description` i `og:*` na wartości z tabeli w pliku `src/core/seo/pages.ts` (jedno źródło prawdy dla PageMeta i skryptu). Vercel serwi istniejące pliki przed regułą `rewrites`, więc boty dostają gotowy HTML.
4. `scripts/build/write-sitemap.mjs`: `dist/sitemap.xml` (4 adresy) i `public/robots.txt` (`Sitemap:` + dozwolone wszystko poza `/__test/`, `/design`).
5. `package.json`: tylko skrypt `build` (dopisz `&& node scripts/build/prerender-pages.mjs && node scripts/build/write-sitemap.mjs`). Żadnych nowych zależności. **Nie** dodawaj `vite-plugin-sitemap` (brak licencji w npm).
**Pliki:** `index.html`, `src/core/seo/pages.ts`, `src/view/seo/PageMeta.tsx`, `scripts/build/prerender-pages.mjs`, `scripts/build/write-sitemap.mjs`, `public/robots.txt`, `package.json` (tylko `scripts.build`), `tests/unit/seo-pages.test.ts`, `tests/unit/prerender-pages.test.ts`.
**Gotowe, gdy:**
- test jednostkowy: po `pnpm build` istnieje `dist/o-projekcie/index.html` z `<title>` i `og:title` właściwymi dla strony i z działającym `<script type="module">` (aplikacja nadal się uruchamia);
- `dist/sitemap.xml` zawiera dokładnie adresy z `pages.ts`, `robots.txt` wskazuje sitemap;
- `/__test/*` i `/design` nie są w sitemap;
- test e2e na podglądzie: wejście bezpośrednio na `/zrodla` ładuje stronę (bez 404) i ma właściwy tytuł.
**Nie ruszaj:** `vercel.json`, `.github/workflows/`, `Home.tsx`.
**Poza zakresem (napisz w PR):** obrazek `og:image` (potrzebna grafika od właściciela w `public/brand/`), dynamiczne karty OG per gmina (`satori`, licencja MPL-2.0 – dopiero przy podstronach gmin).
**Ty sprawdzasz:** wklej link strony z podglądu do komunikatora – pojawia się tytuł i opis; `/sitemap.xml` i `/robots.txt` otwierają się.

## N3 · Strona główna wg makiety 01 (D1)
**Po ludzku:** po wejściu widać nagłówek „Mapa Polski z danymi GUS”, wyszukiwarkę, zakładki wskaźników i mapę – tak jak na makiecie.
**Przeczytaj najpierw:** `docs/design/01-start-komputer.png`, `docs/PRODUKT.md` §3, §7, §8, `docs/STYL.md`, `src/view/Home.tsx`, `src/view/main/*`, `tests/e2e/home.spec.ts`, `tests/e2e/main-screen.spec.ts` (istniejące, nie zmieniać).
**Zadanie:** `Home.tsx` składa układ: lewa kolumna (komputer ≥ 1024 px) / góra (telefon): `h1`, zdanie z liczbami, pole „Szukaj miejsca” (istniejące `SearchField`, skrót Ctrl K), podpis „albo kliknij region na mapie”, zakładki wskaźników („Pokaż na mapie”: te z `useMainView`; **nie tworzysz drugiego stanu wskaźnika**), prawa kolumna / dół: istniejąca `AtlasMap`. Stopka: `SiteFooter` z N1. Liczby „16 województw, 380 powiatów i N gmin” liczone z `public/data/units.json` (nie wpisywane; makieta ma 2479, dane mogą mieć inną liczbę – obowiązuje dana). Zakreślenie: jedno, pod liczbą gmin (jak na makiecie). `AtlasMap` ładowana przez `React.lazy` z `Suspense` i statycznym polem o stałej wysokości (bez skoku układu).
**Pliki:** `src/view/Home.tsx`, `src/view/home/HomeHero.tsx`, `src/view/home/IndicatorTabs.tsx`, `tests/e2e/home-hero.spec.ts` (`@S20`), `tests/unit/home-hero.test.tsx`.
**Gotowe, gdy:**
- 1440×900: `h1`, pole wyszukiwania i mapa widoczne bez przewijania; 390×844: `h1` i pole wyszukiwania widoczne bez przewijania, mapa niżej o wysokości ≥ 60% ekranu;
- liczba gmin w zdaniu = liczba rekordów gmin z `units.json` (test na danych z `tests/fixtures`);
- klik w zakładkę wskaźnika zmienia `window.__atlas` (wskaźnik) i adres (`?i=`) tak samo jak dotychczas – istniejące `main-screen.spec.ts` i `home.spec.ts` przechodzą bez zmian;
- żądania danych na wejściu zgodne z PRODUKT §7 (granice + lista jednostek + jeden plik wskaźnika; żadnego `profiles/*`);
- `prefers-reduced-motion`: brak animacji wejścia; axe czysty.
**Nie ruszaj:** `AtlasMap.tsx`, `ProfileSheet*.tsx`, `src/view/map/hooks/*`, istniejących testów.
**Ty sprawdzasz:** porównaj z makietą 01 na komputerze i na telefonie; mapa dalej startuje w ≤ 3 s.

## N4 · Mapa nie zostaje pusta po utracie kontekstu WebGL
**Po ludzku:** jeśli telefon „zgubi” grafikę mapy, użytkownik zobaczy komunikat i przycisk „Wczytaj mapę ponownie” zamiast pustego pola.
**Przeczytaj najpierw:** `src/view/map/AtlasMap.tsx`, `src/core/map/test-seam.ts`. Raport R1 ryzyko 1; zdarzenia `webglcontextlost` / `webglcontextrestored` na elemencie `canvas`: https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/webglcontextlost_event
**Zadanie:** nasłuchuj zdarzeń na kanwie mapy (MapLibre: `map.getCanvas()`); przy `webglcontextlost` wywołaj `preventDefault()` (pozwala przeglądarce przywrócić kontekst), pokaż nakładkę z komunikatem (token koloru, bez cienia) i przyciskiem; przy `webglcontextrestored` ukryj nakładkę i odśwież warstwy; przycisk wymusza ponowne zamontowanie mapy. W `window.__atlas` dodaj pole `contextLost: boolean`.
**Pliki:** `src/view/map/AtlasMap.tsx` (wymieniony wprost), `src/view/map/MapContextLostNotice.tsx` (nowy), `src/core/map/test-seam.ts`, `tests/e2e/context-lost.spec.ts` (`@S20`).
**Gotowe, gdy:** test Playwright wywołuje `gl.getExtension('WEBGL_lose_context').loseContext()` → pojawia się komunikat, `__atlas.contextLost === true`; `restoreContext()` → komunikat znika, mapa ma kolory (`__atlas` raportuje warstwę); przycisk „Wczytaj mapę ponownie” przywraca mapę; reszta e2e map bez zmian; (jeśli rozszerzenie WEBGL_lose_context niedostępne w CI – test pomijany z komentarzem środowiskowym).
**Nie ruszaj:** `hooks/*`, `layers/*`.
**Ty sprawdzasz:** zwykłe użycie mapy bez zmian.

## N5 · Rozbicie `TrendChart.tsx` (427 linii) bez zmiany zachowania
**Po ludzku:** wykres lat w profilu wygląda i działa tak samo; kod podzielony na małe pliki (zasada ≤ ~200 linii), łatwiejszy do poprawiania przez Julesa.
**Przeczytaj najpierw:** `src/view/profile/TrendChart.tsx`, istniejące testy wykresu (`grep -l TrendChart tests`).
**Zadanie:** wydziel czystą geometrię (skale, ścieżki, siatka) do `src/core/profile/trend-geometry.ts` z testami jednostkowymi; z komponentu wydziel `TrendAxis.tsx`, `TrendPoints.tsx`, `TrendStatus.tsx` (pasek `aria-live`). Zachowanie, atrybuty ARIA i klasy bez zmian. **Nie** podłączaj `@observablehq/plot` (decyzja w weryfikacji: ZOSTAW rysowanie).
**Pliki:** `src/view/profile/TrendChart.tsx`, `src/view/profile/Trend*.tsx` (nowe), `src/core/profile/trend-geometry.ts`, `tests/unit/trend-geometry.test.ts`.
**Gotowe, gdy:** wszystkie istniejące testy i zrzuty przechodzą **bez zmian**; każdy nowy plik ≤ 200 linii; test geometrii pokrywa: brak danych, jeden punkt, luki w latach, wartości ujemne.
**Nie ruszaj:** `ProfileSheet*.tsx`, `ProfileIndicatorRow.tsx`.
**Ty sprawdzasz:** profil: wykres identyczny, najechanie/dotknięcie roku działa.

## N6 · Usunięcie nieużywanego `@observablehq/plot` (D2)
**Pliki:** `package.json`, `pnpm-lock.yaml`, `docs/ELEMENTY.md` (wiersz skreślony z datą, wzór jak przy d3-scale), `tests/unit/no-unused-deps.test.ts` (nowy: żaden pakiet z `dependencies` o nazwie `@observablehq/*` bez importu).
**Zadanie:** `pnpm remove @observablehq/plot`; potwierdź grepem brak importów w `src`, `scripts`, `tests`; w ELEMENTY.md skreśl wiersz („usunięty 2026-10-xx, brak importów”). Prompt wprost zezwala na zmianę `package.json`, lockfile i `ELEMENTY.md`.
**Gotowe, gdy:** `pnpm install --frozen-lockfile`, build i wszystkie testy przechodzą; rozmiar JS na wejściu nie rośnie; w PR podaj rozmiar `dist` przed/po.

## N7 · (warunkowe, D5) Kamera przez `map.fitBounds` zamiast własnej pętli
**Warunek:** zrób tylko, jeśli po ocenie S16 na telefonie animacje szarpią albo chcemy ściąć kod. Inaczej pomiń.
**Po ludzku:** ten sam ruch kamery, ale liczy go MapLibre; mniej własnego kodu.
**Przeczytaj najpierw:** `useMapViewState.ts`, `AtlasMap.tsx`, `tests/e2e/camera.spec.ts`; MapLibre `fitBounds` i `padding`: https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/ ; `AnimationOptions.essential`: https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/AnimationOptions . Raport R2 ostrzega: po przerwaniu ruchu `padding` może „zostać” z poprzedniej animacji (sprawdź i przypnij `padding` w każdym wywołaniu).
**Zadanie:** wejście i powrót przez `map.fitBounds(bbox, { padding: {top,right,bottom,left}, duration: 600/400, essential: false })`, gdzie dolny `padding` = wysokość arkusza z W2.7; wejście z linku i zmiana rozmiaru – `duration: 0`; `window.__atlas.zoom` nadal publikowane z zdarzenia `move` mapy. Usuń własną pętlę rAF kamery.
**Pliki:** `src/view/map/hooks/useMapViewState.ts`, `src/view/map/AtlasMap.tsx`, `src/core/map/test-seam.ts` (wymienione wprost).
**Gotowe, gdy:** `tests/e2e/camera.spec.ts`, `drill.spec.ts`, `map.spec.ts`, `map-zoom-out.spec.ts` przechodzą **bez zmian**; `useMapViewState.ts` ≤ 200 linii; `prefers-reduced-motion` → widok końcowy natychmiast; w PR: pomiar z `s16-motion.spec.ts` przed/po.

## N8 · Adapter magazynu biblioteki (bez chmury) ⚠️ konfiguracja robota
**Po ludzku:** robot zapisuje dane biblioteki przez jeden wymienialny „adapter”; strona czyta z adresu z manifestu. Dzięki temu przejście z gałęzi na R2 to zmiana ustawienia, nie przepisywanie.
**Przeczytaj najpierw:** `docs/research/biblioteka-gus.md`, `scripts/data/library.mjs`, `library-lib.mjs`, `docs/ARCHITEKTURA.md` §5.5.
**Zadanie:** `scripts/data/library-publish.mjs`: interfejs `put(path, bytes)`, `get(path)`, `list(prefix)`; implementacje `branch` (obecna) i `local-dir` (do testów). Układ ścieżek: `library/v/<data-wydania>/values/<id>.json`, `library/v/<data-wydania>/catalog.json` oraz stały `library/manifest.json` (`{ version, catalogUrl, valuesBase, generatedAt }`). Zasada: **pliki wersjonowane są niezmienne, tylko `manifest.json` się zmienia** – dzięki temu nie potrzeba czyszczenia cache CDN. Konfiguracja: `config/library.json` (`provider: "branch"`).
**Pliki:** `scripts/data/library-publish.mjs`, `scripts/data/library.mjs` (minimalna zmiana: zapis przez adapter), `config/library.json` (nowy), `tests/unit/library-publish.test.ts`.
**Gotowe, gdy:** testy na `local-dir` (fixtures): zapis → odczyt → manifest wskazuje nową wersję; ponowny zapis tej samej wersji nie nadpisuje istniejących plików; robot z `provider: "branch"` daje taki sam wynik jak dziś (test porównawczy na nagraniu odpowiedzi BDL z `tests/fixtures`).
**Nie ruszaj:** `.github/workflows/`, limitów i kolejki robota.

## N9 · Dostawca R2 ⚠️ (tylko gdy D4 = R2; wymaga Twoich ustawień)
**Przygotowanie przez Ciebie (Jules tego nie zrobi):** konto Cloudflare → R2 → bucket `faktografia-library` (klasa **Standard**, nie Infrequent Access) → **token API ograniczony do tego jednego bucketa** (Object Read & Write) → w GitHub: Settings → Environments → nowe środowisko `production-r2`, „Deployment branches: Selected branches → main”, sekrety `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. Własna domena podpięta do bucketa (np. `data.<domena>`), reguła CORS: `GET`, `HEAD` dla originu strony, `MaxAgeSeconds: 86400`. Darmowy próg R2: 10 GB, 1 mln zapisów, 10 mln odczytów miesięcznie, transfer wychodzący 0 (stan na 25.10.2026, źródło pośrednie – sprawdź cennik Cloudflare przed założeniem konta).
**Zadanie Julesa:** dostawca `r2` w `library-publish.mjs` przez klienta S3 – **najpierw zaproponuj pakiet w PR** (nazwa, link npm, licencja, pobrania; kandydat do sprawdzenia: `@aws-sdk/client-s3` – nie dodawaj bez weryfikacji), wpis w `ELEMENTY.md`; workflow `fetch-library.yml`: krok publikacji w jobie z `environment: production-r2`; sekrety tylko z Environment; przy braku sekretów robot zostaje na `branch`. Nagłówki zapisu: pliki wersjonowane `Cache-Control: public, max-age=31536000, immutable`; `manifest.json`: `max-age=300`.
**Pliki:** `scripts/data/library-publish.mjs`, `.github/workflows/fetch-library.yml` (wymienione wprost), `docs/ELEMENTY.md`, `package.json`, `pnpm-lock.yaml`, `tests/unit/library-publish-r2.test.ts` (mock klienta, bez sieci).
**Gotowe, gdy:** testy z atrapą klienta: poprawne klucze, nagłówki cache, brak zapisu poza prefiksem `library/`; gitleaks czysty; w PR lista kroków dla właściciela i **jawna uwaga o ryzyku** (token w Secrets; nie ma OIDC dla R2 – niezweryfikowane).

## N10 · Rdzeń katalogu i wyszukiwarki wskaźników (S21, część 1)
**Po ludzku:** logika „kategorie → wskaźniki → szukaj”, bez ekranu.
**Przeczytaj najpierw:** `docs/research/biblioteka-gus.md` („Kategorie i filtry”), `src/core/search/index.ts` i `normalize.ts` (wzorzec), `docs/PRODUKT.md` §7. Pakiety (zweryfikowane w npm): `nuqs` 2.10.2 MIT – https://www.npmjs.com/package/nuqs ; `@tanstack/react-virtual` 3.14.22 MIT – https://www.npmjs.com/package/@tanstack/react-virtual (dopiero w N11).
**Zadanie:** `src/core/library/`: typy katalogu (zod), `buildCategoryTree()` (działy → podkategorie, liczniki), `filterCatalog(filters)` (poziom: powiaty/gminy, zakres lat, jednostka), `createCatalogSearch()` na **MiniSearch** z indeksem ładowanym z gotowego pliku (`MiniSearch.loadJSON`), normalizacja polskich znaków jak w `normalize.ts`. Skrypt `scripts/data/build-library-index.mjs` (budowany przez robota): `search-index.json` + `index.json` (id, nazwa, dział, poziom, lata – mały). Sprawdź w teście, że `nuqs` działa z `react-router` 8 i `BrowserRouter` (adapter `nuqs/adapters/react-router`); jeśli nie – opisz w PR i zatrzymaj się.
**Pliki:** `src/core/library/*`, `scripts/data/build-library-index.mjs`, `tests/unit/library-*.test.ts`, `tests/fixtures/library-catalog.json` (przycięte nagranie prawdziwego `catalog.json`), `package.json`, `pnpm-lock.yaml`, `docs/ELEMENTY.md`.
**Gotowe, gdy:** wyszukiwanie „bezrobocie”, „bezrobocie” bez ogonków i literówka „bezrobocei” zwracają ten sam wskaźnik na pierwszych miejscach (test na fixtures); filtr poziomu i lat; budowa indeksu dla 10 000 sztucznych rekordów < 5 s i indeks ładowany w < 300 ms (test pomiarowy w Vitest, opis w PR); żaden plik > 200 linii.
**Nie ruszaj:** `src/core/search/*`, `config/*`.

## N11 · Strona biblioteki: kategorie, filtry, lista (S21, część 2)
**Przeczytaj najpierw:** N10, `docs/design/` (czy jest makieta biblioteki – jeśli nie, `TRYB: DECYZJA` o wyglądzie przed startem), `docs/STYL.md`. Wzorce wyglądu (inspiracja wizualna, nie kod): World Bank Open Data (kafelki tematów z miniaturą trendu), Eurostat Data Browser (drzewo po lewej, wyniki po prawej), BDL (systematyka działów) – https://data.worldbank.org , https://ec.europa.eu/eurostat/databrowser/ , https://bdl.stat.gov.pl ; opisy z raportu R4 niezweryfikowane.
**Zadanie:** trasa `/biblioteka` w `App.tsx`: kafelki 10–15 działów → po wejściu podkategorie (akordeon z `radix-ui`, najwyżej 2 poziomy); filtry (poziom, lata, jednostka) w arkuszu `react-modal-sheet` na telefonie i w panelu po lewej na komputerze; stan filtrów w adresie przez `nuqs`; pole wyszukiwania (N10); lista wyników **wirtualizowana** `@tanstack/react-virtual` (sprawdź w dokumentacji, czy dla React 19 trzeba ustawić `useFlushSync: false`); wybór wskaźnika ładuje **jeden** `values/<id>.json` i otwiera mapę z tym wskaźnikiem (istniejący `useMainView`).
**Pliki:** `src/view/library/*`, `src/App.tsx` (dopisanie trasy), `tests/e2e/library.spec.ts` (`@S21`), `tests/unit/library-view.test.tsx`.
**Gotowe, gdy:** 10 000 pozycji w fixture: w DOM ≤ 60 wierszy naraz; wejście na `/biblioteka` pobiera tylko `index.json` + indeks (żadnych `values/*`); filtr zmienia adres i przywraca się po odświeżeniu; nawigacja klawiaturą (Tab, strzałki w akordeonie), axe czysty; 390 px: arkusz filtrów otwiera się i zamyka; pola ≥ 44 px.
**Nie ruszaj:** `Home.tsx`, `AtlasMap.tsx`.

## N12 · „Zamów wskaźnik” (D3)
**Zadanie:** w pustym wyniku wyszukiwania i w stopce biblioteki odnośnik „Zamów wskaźnik” (`rel="noopener noreferrer"`, nowa karta) do formularza Tally (adres z `VITE_REQUEST_FORM_URL`; brak zmiennej → przycisk ukryty); w `Privacy.tsx` akapit o Tally jako podmiocie przetwarzającym (po potwierdzeniu przez Ciebie warunków na stronie Tally); wpis w `ELEMENTY.md` (usługa, źródło, licencja/warunki, data). **Bez** osadzania iframe i bez zmian CSP.
**Pliki:** `src/view/library/RequestIndicator.tsx`, `src/view/pages/Privacy.tsx`, `docs/ELEMENTY.md`, `tests/unit/request-indicator.test.tsx`.
**Gotowe, gdy:** bez zmiennej – brak przycisku; ze zmienną – link z poprawnym adresem i atrybutami; Privacy wymienia usługę; `vercel.json` bez zmian.
