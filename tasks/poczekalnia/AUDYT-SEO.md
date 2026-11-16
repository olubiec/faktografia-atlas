# Audyt SEO – Faktografia Atlas (16.11.2026, [SEO-1])

Zakres: `index.html`, meta, Open Graph / Twitter, canonical, `public/robots.txt`, `public/sitemap.xml`, dane strukturalne (JSON-LD), tytuły per trasa, sposób indeksowania SPA (prerender/SSR). Audyt bez zmian w kodzie. Gotowe zadanie: `tasks/poczekalnia/N-43-seo-sitemap.md`.

## Jak strona jest dziś indeksowana (po ludzku)

- To czysta SPA (Vite + React 19, `react-router`). Serwer Vercel każdy adres przepisuje na ten sam `index.html` (`vercel.json:33-38`, rewrite `/(.*)` → `/index.html`). Bez prerenderu i bez SSR (prerender RR8 odrzucony – `docs/STAN.md:77`).
- Google renderuje JavaScript, więc po chwili zobaczy tytuły z `PageMeta` (React 19 przenosi `<title>`, `<meta>`, `<link>` do `<head>`). **Roboty podglądów linków (Facebook, X, LinkedIn, Slack, Messenger, WhatsApp) JS nie uruchamiają** – widzą zawsze ten sam `index.html`: tytuł „Faktografia Atlas” i logo SVG.
- Jednostki (województwo/powiat/gmina) nie mają własnych ścieżek: wybór żyje w parametrze `?u=<TERYT>` (`src/core/url/state.ts:16-28`). Canonical liczony jest z samej ścieżki (`src/view/layout/PageMeta.tsx:18`), a strona główna ma statyczny canonical `/` (`index.html:10`). Skutek: dla Google 2 875 jednostek (16 woj., 380 pow., 2 479 gmin w `public/data/units.json`) to **jedna strona** `/`.

## P1 – naprawić najpierw

| # | Problem | Gdzie | Co zrobić |
|---|---|---|---|
| P1-1 | **Podwójny canonical / opis na podstronach.** `index.html` ma na sztywno `<link rel="canonical" href="https://faktografia.eu/">` i `description`; `PageMeta` dokłada drugi canonical i drugi opis (React 19 dopisuje, nie podmienia tagów spoza Reacta). Na `/kontakt` w `<head>` są dwa canonicale: `/` i `/kontakt` – Google może wybrać `/` i nie indeksować podstrony. | `index.html:9-10`, `index.html:13-17`, `src/view/layout/PageMeta.tsx:25-31` | Statyczne `canonical`/`og:url` usunąć z `index.html` i ustawiać tylko przez `PageMeta` (także na `/`) **albo** w `PageMeta` przy montowaniu usuwać tagi statyczne. Uwaga: `tests/unit/meta.test.ts:51` wymaga canonicala w `index.html` – zmiana tego testu wymaga decyzji właściciela (zasada AGENTS.md). |
| P1-2 | **Obraz podglądu to SVG.** Facebook, X, LinkedIn nie pokazują SVG w `og:image` – udostępniony link nie ma obrazka mimo `twitter:card=summary_large_image`. | `index.html:18-19` | Dodać rastrowy obraz 1200×630 (PNG/JPG) w `public/brand/` (logo tylko z `public/brand/`) + `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image`. Obraz musi dać właściciel/projekt (nowy zasób = wpis w `docs/ELEMENTY.md`). |
| P1-3 | **Brak tytułów na połowie tras.** `meta` przekazują tylko Kontakt, Zastrzeżenie, Prywatność, Źródła. Bez `PageMeta`: `/` (Home), `/o-projekcie`, `/rankingi`, `/porownaj`, `/biblioteka`, `/biblioteka/:id` – w wynikach Google wszystkie mają tytuł „Faktografia Atlas” i ten sam opis (duplikaty w Search Console). | `src/view/pages/About.tsx:5`, `Rankings.tsx:129`, `ComparePage.tsx:137`, `Library.tsx`, `LibraryVariable.tsx`, `src/view/Home.tsx` | Dodać `meta={{ title, description }}` w `SiteLayout` każdej strony; dla `/biblioteka/:id` tytuł z nazwy zmiennej. Plan jest już w `tasks/poczekalnia/W18-P04-metadane-opengraph-i-seo.md` – rozszerzyć go o About/Compare/Library; Home to plik ekranu (wymaga wprost wymienienia w prompcie). |
| P1-4 | **Jednostki niewidoczne dla wyszukiwarki.** Zapytania typu „gęstość zaludnienia powiat bolesławiecki” to główny potencjał ruchu, a dziś canonical zawsze wskazuje `/`. | `src/view/layout/PageMeta.tsx:18`, `index.html:10`, `src/core/url/state.ts:122-136` | **Decyzja D-SEO-1 (właściciel):** (a) canonical zachowuje `?u=<TERYT>` (najmniej zmian) albo (b) ścieżki `/j/<teryt>-<slug>` (lepsze, ale to zmiana architektury URL). Dopiero po decyzji jednostki trafiają do sitemapy (N-43 ma to przygotowane, domyślnie wyłączone). |

## P2 – ważne, po P1

| # | Problem | Gdzie | Co zrobić |
|---|---|---|---|
| P2-1 | **Brak danych strukturalnych JSON-LD** (zero wystąpień `application/ld+json` w `src/` i `index.html`). | `index.html` (head), brak `src/core/seo/` | Na `/`: `WebSite` + `Organization` (nazwa, logo z `public/brand/`, `url`). Na `/biblioteka/:id` i stronach wskaźników: `Dataset` (name, description, `creator`: GUS BDL, `license`: CC BY 4.0, `temporalCoverage`, `spatialCoverage`: Polska, `distribution` CSV) – to otwiera **Google Dataset Search**, idealne dla danych GUS. `BreadcrumbList` z okruszków (`breadcrumbs`). Generować czystą funkcją w `src/core/seo/jsonld.ts`, wstawiać jako `<script type="application/ld+json">{JSON.stringify(...)}</script>` (tekst, nie `dangerouslySetInnerHTML`; escapować `<` jako `<`). |
| P2-2 | **Soft 404.** Nieznany adres zwraca HTTP 200 (rewrite na `index.html`), `noindex` dokładany dopiero przez JS. Google zwykle to rozpozna, ale Search Console pokaże „Soft 404”. | `vercel.json:33-38`, `src/App.tsx:53-59` | Akceptowalne na teraz; ewentualnie lista znanych tras w `rewrites` + `404.html` (zmiana `vercel.json` = decyzja). |
| P2-3 | **Sitemap pisany ręcznie**, bez `lastmod`, bez `/biblioteka/:id`. Test pilnuje tylko tras statycznych. | `public/sitemap.xml:1-12`, `tests/unit/meta.test.ts:82-90` | Generator + test zgodności – zadanie **N-43**. Zmienne biblioteki leżą poza repo (`src/core/library/config.ts:2`, gałąź `data`) – osobna sitemapa po decyzji, czy robot `fetch-library` może ją zapisywać. |
| P2-4 | **Podglądy linków bez prerenderu.** Nawet po P1-3 udostępniony link do `/rankingi` pokaże meta strony głównej (roboty social nie wykonują JS). | `index.html`, build Vite | Lekki prerender tras statycznych w buildzie (np. osobny krok renderujący `PageMeta` do `dist/<trasa>/index.html`) albo Vercel Edge Middleware podmieniający `<title>/og:*` dla botów. Oba = nowy element/konfiguracja → decyzja w prompcie, wpis w `ELEMENTY.md`. |
| P2-5 | **Brak `twitter:title/description/image`.** X bierze `og:*` jako zapas, ale `twitter:image` jest wymagany do dużej karty przy SVG. | `index.html:19` | Razem z P1-2. |

## P3 – drobne

- P3-1: Manifest i favicon tylko SVG – brak `apple-touch-icon` PNG 180×180 i ikon 192/512 (`public/site.webmanifest`, `index.html:6`). Zasób od właściciela.
- P3-2: `og:site_name` brak (`index.html:12-18`); `og:locale` jest.
- P3-3: `robots.txt` blokuje `/__test/`, ale nie `/design` (`public/robots.txt:3`) – strona wewnętrzna może trafić do indeksu; dodać `Disallow: /design` lub `noindex` na tej trasie (`src/App.tsx:99`).
- P3-4: `PageMeta` nie ustawia `og:image` per strona ani `og:site_name` (`src/view/layout/PageMeta.tsx:25-31`) – po P1-2 dodać domyślny obraz.
- P3-5: Długość opisu w `index.html:9` ≈ 140 znaków – OK; pilnować 50–160 znaków w teście dla każdej strony.

## Plan automatyzacji SEO

1. **Sitemapa z generatora (N-43, gotowe zadanie).** `scripts/seo/sitemap.mjs` czyta trasy z `src/App.tsx` (ta sama reguła co `publicRoutes()` w `tests/unit/meta.test.ts:38-43`) i opcjonalnie jednostki z `public/data/units.json`; zapisuje `public/sitemap.xml` deterministycznie. Test w Vitest porównuje plik na dysku z wynikiem generatora → zapomniana trasa = czerwony CI. Jednostki włączane flagą dopiero po D-SEO-1.
2. **Test meta per trasa (kolejne zadanie, N-44).** Playwright `@S<n>`: dla każdej trasy z `publicRoutes()` po załadowaniu: dokładnie 1 `title` (unikalny między trasami), 1 `link[rel=canonical]` = domena + ścieżka, 1 `meta[name=description]` 50–160 znaków, `og:title`/`og:url` zgodne z canonical, brak `noindex` (poza 404). Wykrywa P1-1 i P1-3 automatycznie.
3. **Walidacja JSON-LD (N-45, po P2-1).** Czysta funkcja `src/core/seo/jsonld.ts` + test jednostkowy: każdy obiekt ma `@context: https://schema.org`, `@type` z listy dozwolonych, wymagane pola Google dla `Dataset` (`name`, `description`) i `license`; `JSON.parse` treści skryptu w e2e. Walidacja schematem: najpierw sprawdzić w rejestrze npm pakiet z typami schema.org (np. `schema-dts` – **zweryfikować** istnienie, licencję i datę przed użyciem, wpis w `ELEMENTY.md`); bez pakietu – własna lista wymaganych pól.
4. **Kontrola builda (opcjonalnie).** Krok w `ci.yml` po `pnpm build`: `dist/index.html` zawiera 1 canonical i `og:image` rastrowy. Zmiana workflow tylko na prośbę właściciela.

## Co sprawdzić (właściciel, po wdrożeniu)

1. **Google Search Console** (właściwość domeny `faktografia.eu`, weryfikacja rekordem DNS TXT): Mapy witryn → dodaj `https://faktografia.eu/sitemap.xml` → status „Sukces”, liczba wykrytych adresów = liczba tras. Strony → „Strona zduplikowana, Google wybrał inny canonical” powinno znikać po P1-1. Sprawdzanie adresu URL `/kontakt` → „Wyświetl sprawdzoną stronę” → HTML: jeden canonical `…/kontakt`, tytuł „Kontakt – Faktografia Atlas”.
2. **Rich Results Test** (search.google.com/test/rich-results) i **Schema Markup Validator** (validator.schema.org) – po P2-1 wkleić adres `/` i `/biblioteka/<id>`: zero błędów, wykryte `WebSite`, `Organization`, `Dataset`, `BreadcrumbList`.
3. **Podglądy linków:** Facebook Sharing Debugger (developers.facebook.com/tools/debug), LinkedIn Post Inspector, wklejenie linku na X/Slacku – obraz 1200×630 i właściwy tytuł (po P1-2; dla podstron dopiero po P2-4).
4. **Na telefonie / w przeglądarce:** otwórz `/kontakt`, w konsoli `document.querySelectorAll('link[rel=canonical]').length` → ma być `1` (dziś `2`).
5. **`https://faktografia.eu/robots.txt` i `/sitemap.xml`** otwierają się jako tekst/XML (nie jako strona aplikacji).
6. Po 2–4 tygodniach: Search Console → Skuteczność → zapytania z nazwami powiatów/gmin (pojawią się dopiero po D-SEO-1).
