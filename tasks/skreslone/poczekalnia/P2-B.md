# P2-B – Polityka prywatności zgodna z RODO
Cel: Privacy.tsx opisuje faktyczne przetwarzanie danych i prawa użytkownika.
Zmieniaj: src/view/pages/Privacy.tsx, tests/unit/privacy-page.test.tsx
Wymagane: tests/unit/privacy-page.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/view/pages/Privacy.tsx, src/core/consent/*.ts (tylko do czytania)
Uwaga: jeśli P2-G jest już scalone, opisz konfigurację z `POSTHOG_CONFIG` (persistence: memory = brak kluczy ph_*).

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P2-B`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P2-B] Polityka prywatności zgodna z RODO`, `git push -u origin task/P2-B`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Administrator: Mateusz Ołubiec, kontakt: mateuszolubiec05@gmail.com, strona faktografia.eu. Nie wymyślaj innych danych.
Fakty z kodu (zweryfikuj w src/core/consent/analytics.ts): PostHog uruchamiany dopiero po zgodzie, host https://eu.i.posthog.com (serwery w UE), autocapture i pageview wyłączone, wysyłane jest jedno zdarzenie „search” z wpisaną frazą wyszukiwania.
Domyślnie posthog-js zapisuje w przeglądarce własny identyfikator (klucze ph_*), jeśli konfiguracja tego nie zmienia: opisz to uczciwie i wypisz klucze localStorage/cookie faktycznie używane w kodzie (grep).
Sekcje (nagłówki h2): 1 Administrator i kontakt; 2 Jakie dane przetwarzamy (logi hostingu Vercel, w tym IP; identyfikator i zdarzenia PostHog po zgodzie); 3 Cel i podstawa prawna (zgoda, art. 6 ust. 1 lit. a RODO; logi: prawnie uzasadniony interes, lit. f); 4 Okres przechowywania; 5 Odbiorcy (Vercel, PostHog; lokalizacja); 6 Twoje prawa (dostęp, sprostowanie, usunięcie, ograniczenie, sprzeciw, cofnięcie zgody, skarga do Prezesa UODO); 7 Zewnętrzne linki (GitHub przy „Zamów wskaźnik” – osobna polityka GitHuba); 8 Zmiany polityki + data aktualizacji.
Okresy przechowywania PostHog i Vercel podaj tylko jeśli wynikają z konfiguracji w kodzie; inaczej napisz „zgodnie z ustawieniami usługi” i dopisz w raporcie, co Mateusz ma sprawdzić w panelach.
Przycisk „Cofnij zgodę” zostaje bez zmian.

## Gotowe, gdy
- test: 8 nagłówków sekcji, e-mail kontaktowy, słowo „UODO”, „PostHog”, „Vercel”
- test: lista kluczy zapisu w treści = klucze używane w kodzie (test czyta stałe z src/core/consent)

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
