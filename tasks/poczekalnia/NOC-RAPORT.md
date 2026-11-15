# Raport nocnej zmiany (koniec pracy: 05:00 czasu PL = 04:00 UTC)

Kolejność: P2-G → P2-A → P2-C → P2-B → P2-D → P2-F → P2-E → P3-A..E → P4-A..E → koncepty (lepszy model).
Każdy wpis: ID · wynik testów · commit · co sprawdzić na Vercel · co odłożone.


## P2-G – PostHog: konfiguracja przyjazna prywatności
- Testy: lint, typecheck, test (793/793), build zielone; e2e nie uruchamiane.
- Zrobione: `POSTHOG_CONFIG` (memory, bez nagrań/ankiet/pageleave, identified_only, ip:false, EU), `trackSearch` przycina do 100 znaków i pomija e-mail/9+ cyfr, nowe `stopAnalytics()`, wpis w ELEMENTY.md.
- Odstępstwo: zamiast `advanced_disable_decide` użyto `advanced_disable_flags` (w posthog-js 1.438.13 decide jest przestarzałe).
- Do podpięcia (osobne zadanie): `stopAnalytics()` w src/view/consent przy zmianie zgody na „denied”.
- Vercel: ustaw `VITE_POSTHOG_KEY` (Production+Preview), Redeploy; kliknij „Akceptuję” – w Local Storage nie ma kluczy `ph_*`, a w Network po wpisaniu frazy jest wywołanie do `eu.i.posthog.com`.
- PostHog: włącz „Discard client IP data”, wyłącz Session replay.

## P2-A – Meta, SEO, manifest, robots, sitemap
- Wynik: lint, typecheck, test (805 zielone) i build przechodzą; e2e nie uruchamiano. Brak usuniętych plików względem main.
- Zrobione: tagi w index.html (opis, canonical, OG, twitter, theme-color, manifest), domyślne meta w PageMeta, robots.txt, sitemap.xml (7 tras), site.webmanifest, tests/unit/meta.test.ts.
- Vercel: wklej link strony do komunikatora (Messenger/Slack) – powinien pokazać tytuł i opis; otwórz /robots.txt, /sitemap.xml i /site.webmanifest – powinny się wyświetlić.
- Odłożone: w public/brand są tylko SVG. og:image wskazuje SVG logo, a większość komunikatorów go nie pokaże. Brakuje PNG 1200x630 (og:image) oraz ikon PNG 192 i 512 (manifest, instalacja na telefonie). Trzeba dodać te pliki.
- theme-color i kolor tła w manifeście = #F8FAF9 (token --arkusz); manifest nie ma wariantu ciemnego.
