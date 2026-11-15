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

## P2-C – Strony Kontakt i Zastrzeżenie o danych
- Testy: lint, typecheck, test (809/809), build zielone; e2e nie uruchamiane. Brak usuniętych plików względem main.
- Zrobione: `src/view/pages/Contact.tsx` (autor, mailto, link do zgłoszeń GitHub) i `DataDisclaimer.tsx` (GUS BDL, CC BY 4.0, brak gwarancji, link do /kontakt), testy w `tests/unit/info-pages.test.tsx`.
- Vercel: stron jeszcze nie widać, bo trasy dopisuje P2-D (App.tsx); po P2-D otwórz /kontakt i sprawdź mailto oraz link do zgłoszeń.
- Odłożone: w stopce nie ma wskaźnika daty odświeżenia danych, a zastrzeżenie się do niego odwołuje; trzeba go dodać osobnym zadaniem. Trasa /kontakt jest założona w linku (P2-D).

## P2-B – Polityka prywatności zgodna z RODO
- Wynik: lint, typecheck, test (815 zielone) i build przechodzą; e2e nie uruchamiano. Brak usuniętych plików względem main.
- Zrobione: Privacy.tsx z 8 sekcjami h2 (administrator, dane, podstawa prawna, okres, odbiorcy, prawa/UODO, linki, zmiany + data), klucze localStorage zgodne z kodem, opis PostHog z `persistence: memory` (brak ph_*); przycisk „Cofnij zgodę” bez zmian; tests/unit/privacy-page.test.tsx.
- Vercel: otwórz /prywatnosc – 8 numerowanych sekcji, mail kontaktowy, „Cofnij zgodę” działa.
- Do sprawdzenia w panelach: okres przechowywania zdarzeń w PostHog i logów w Vercel (w polityce: „zgodnie z ustawieniami usługi”); w PostHog włącz „Discard client IP data”.
- Odłożone: lokalizacja przetwarzania logów Vercel opisana ogólnie („także poza UE”); do potwierdzenia z ustawieniami regionu projektu.
