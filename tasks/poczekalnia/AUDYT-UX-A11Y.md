# AUDYT-UX-A11Y – przegląd telefonu, dostępności, wydajności, SEO i prywatności

Data: 16.11.2026 · Zakres: przegląd kodu na gałęzi roboczej (bez zmian w kodzie) · Odniesienia: AGENTS.md, docs/PRODUKT.md (§5 telefon, §7 progi), docs/STYL.md, config/tokens.json, `dist/` z ostatniego `pnpm build`.

Priorytety: **P1** – realna szkoda (prawo, dane, główny scenariusz zepsuty) · **P2** – wyraźnie gorsze doświadczenie / niezgodność WCAG 2.2 AA · **P3** – porządki.
Pozycje już opisane w `tasks/poczekalnia/N-*.md` tylko wskazuję, nie powielam (np. N-16 menu telefonu i Escape, N-10/N-11 ładowanie, N-14 arkusz profilu, N-15 kontrast granic).

---

## Znaleziska

### P1

**P1-1. Cofnięcie zgody nie zatrzymuje PostHog w bieżącej sesji (RODO art. 7 ust. 3)**
- `src/view/pages/Privacy.tsx:8-11` – `handleRevoke` wywołuje tylko `clearConsent()`; nigdzie nie jest wołane `stopAnalytics()` (`src/core/consent/analytics.ts:87-94`, komentarz w kodzie sam mówi „do podpięcia w src/view/consent”). Po kliknięciu „cofnij zgodę” moduł PostHog zostaje w pamięci i `trackSearch` dalej wysyła frazy aż do przeładowania strony.
- Dodatkowo `src/view/consent/ConsentBar.tsx:29-32` (`handleDeny`) też nie woła `stopAnalytics()` – istotne, gdy pasek pojawi się ponownie po wygaśnięciu 12 miesięcy w trakcie sesji z wcześniej uruchomioną analityką.
- Poprawka: w `Privacy.handleRevoke` i `ConsentBar.handleDeny` dodać `stopAnalytics()`; test Vitest: po cofnięciu `trackSearch('Kraków')` nie wywołuje `capture`. (Wymaga zgody na zmianę `src/view/consent` – zgodnie z AGENTS.md prompt musi to wprost dopuścić.)

**P1-2. Obrazek OG to SVG – podgląd linku na Facebooku/X/Messengerze/WhatsAppie jest pusty**
- `index.html:18` – `og:image` wskazuje `faktografia-logo-granat.svg`. Serwisy społecznościowe nie renderują SVG w kartach; przy `twitter:card=summary_large_image` (`index.html:19`) karta wychodzi bez obrazka. Główny scenariusz z PRODUKT.md §2 pkt 4 („wysłać komuś link”) traci wizytówkę.
- Poprawka: statyczny `public/og/atlas-1200x630.png` (z logo z `public/brand/`, kolory z tokenów), `og:image:width/height/alt`, `twitter:image`. To nowy zasób → wpis w `docs/ELEMENTY.md`.

### P2

**P2-1. Zdublowane meta-tagi i dwa `canonical` na podstronach**
- `index.html:9-18` ma statyczne `description`, `canonical`, `og:*`, a `src/view/layout/PageMeta.tsx:25-31` (React 19 hoisting) dokłada drugi komplet zamiast podmienić. Na `/rankingi` itd. w `<head>` są dwa `<link rel="canonical">` (jeden zawsze na `/`) – Google może uznać podstrony za duplikat strony głównej.
- Poprawka: usunąć z `index.html` `canonical` i `og:url` (zostawić tylko domyślne wartości dla strony głównej, renderowane przez `PageMeta` na `/`), albo w `PageMeta` aktualizować istniejące tagi. Test: na `/rankingi` dokładnie jeden `link[rel=canonical]` z właściwym adresem.

**P2-2. Link do konkretnej gminy/wskaźnika ma zawsze ogólny podgląd**
- SPA z regułą `"/(.*)" → /index.html` (`vercel.json`, sekcja `rewrites`): roboty kart (FB, X, Slack) nie uruchamiają JS, więc `?unit=…&ind=…` zawsze pokazuje „Faktografia Atlas”. Ta sama reguła daje miękkie 404 (status 200 dla nieistniejących adresów; `src/view/NotFound.tsx` nie zmienia statusu).
- Poprawka (do decyzji właściciela, zmiana `vercel.json` wymaga zgody): Vercel Edge/OG Image dla kart albo przynajmniej `noindex` na `NotFound` przez `PageMeta`.

**P2-3. Wysokość ekranu głównego na telefonie: `100vh` obok `100dvh`**
- `src/view/Home.tsx:31` – `main` ma `min-h-[calc(100vh-64px)]` wewnątrz kontenera `h-dvh` z `overflowY: auto` (`Home.tsx:29`). Na iOS/Android przy widocznym pasku adresu `100vh > 100dvh`, więc ekran mapy przewija się o kilkadziesiąt pikseli, a dolny pasek wskaźnika/arkusz bywa ucięty lub „pływa”. Plik ekranu – zmiana tylko z promptem wymieniającym `Home.tsx`.
- Poprawka: `min-h-0` / `calc(100dvh - wysokość nagłówka)` z tokenu; e2e @S na 360×640 i 390×844: `document.scrollingElement.scrollHeight === innerHeight`.
- Podobnie `src/view/tune/TunePanel.tsx:200` (`calc(100vh - 96px)`) – na telefonie dolna część panelu pod paskiem przeglądarki.

**P2-4. Pasek zgody: przyciski o nierównej wadze i ramka poniżej 3:1**
- `src/view/consent/ConsentBar.tsx:53` – „Nie” ma ramkę `border-linia` (#C5CDD3 na #F8FAF9 ≈ 1,5:1, WCAG 1.4.11 wymaga 3:1 dla granic kontrolek), „Zgadzam się” (`:60`) jest wypełniony granatem. EDPB (wytyczne 03/2022) uznaje wyraźnie słabszy przycisk odmowy za zwodniczy wzorzec.
- Poprawka: oba przyciski w tym samym stylu (np. oba `border-tusz`, bez wypełnienia, albo oba wypełnione). Zmiana w `src/view/consent` – wymaga zgody w prompcie.

**P2-5. Duże paczki JS na telefonie (3G/średni Android)**
- Z `dist/assets` (gzip): wejście `index-*.js` ≈ 205 kB, `AtlasMap-*.js` ≈ 355 kB (maplibre + deck.gl), `ProfileCompareTable-*.js` ≈ 167 kB, `module-*.js` ≈ 100 kB, `BottomSheet-*.js` ≈ 55 kB. Do pierwszej mapy w kolorach telefon pobiera ~600 kB gzip JS, co przy próg „≤ 3 s” z §7 jest na granicy na słabszych telefonach.
- `ProfileCompareTable` (167 kB gzip) wygląda na wspólny kawałek z bibliotekami wykresów/tabel – sprawdzić `vite build --report` / `rollup-plugin-visualizer`, czy nie ładuje się z wejściem profilu, gdy porównanie jest zamknięte.
- Poprawka: zadanie pomiarowe – budżet rozmiaru w CI (np. test czytający `dist/.vite/manifest.json`: wejście ≤ 220 kB gzip, mapa ≤ 380 kB), `manualChunks` dla wykresów, lazy dla tabeli porównania. Zmiana `vite.config.ts` wymaga zgody.

**P2-6. Pierścień fokusu 1 px na zakładkach, przełącznikach i suwaku**
- `src/components/ui/tabs.tsx:47,63`, `src/components/ui/toggle-group.tsx:30`, `src/components/ui/slider.tsx:51`, `src/components/ui/dialog.tsx:65` – `focus-visible:ring-1`; na zaznaczonym przełączniku (tło `tusz`) pierścień w kolorze `tusz` jest niewidoczny. WCAG 2.4.7 / 2.4.13 (zalecenie AA-plus w 2.2: min. 2 px, kontrast 3:1).
- Poprawka: jak w `button.tsx:7` – `focus-visible:outline-2 outline-offset-2 outline-tusz` (offset daje kontrast także na ciemnym tle).

### P3

**P3-1. Przycisk „Rozwiń/Zwiń” arkusza bez stanu** – `src/view/ui/BottomSheet.tsx:40-53`: jest `aria-label`, brak `aria-expanded`; czytnik nie mówi, w jakim stanie jest arkusz. Dodać `aria-expanded={isExpanded}`.

**P3-2. Arkusz profilu bez nazwy dostępnej dialogu** – `src/view/ui/BottomSheet.tsx` (`Sheet.Container`, ok. l. 130-150): prop `title` nie jest podpięty jako `aria-labelledby`/`role="dialog"`; czytnik ogłasza tylko treść. Dodać `role="dialog" aria-label={title}` (bez `aria-modal`, gdy `noBackdrop`).

**P3-3. `theme-color` tylko jasny** – `index.html:11` (#F8FAF9): w ciemnym motywie pasek przeglądarki telefonu zostaje jasny. Dodać drugi `<meta name="theme-color" media="(prefers-color-scheme: dark)">` z tokenu `arkusz` (dark) i aktualizację w `public/theme-init.js` przy ręcznym przełączeniu.

**P3-4. CSP z `'unsafe-eval'`** – `vercel.json` (`script-src`). Jeśli deck.gl/maplibre działają bez niego (maplibre-gl CSP build), usunąć; sprawdzić w osobnym zadaniu z e2e.

**P3-5. Opcja `ip: false` w `POSTHOG_CONFIG`** – `src/core/consent/analytics.ts:21`. W posthog-js ta flaga jest przestarzała i nie gwarantuje braku IP po stronie serwera; obietnica z `Privacy.tsx:44` („zapisywanie IP wyłączone”) powinna być oparta na ustawieniu projektu PostHog „Discard client IP data”. Sprawdzić w panelu PostHog i dopisać do `docs/ELEMENTY.md`.

**P3-6. Pasek zgody zasłania dół mapy na telefonie** – `ConsentBar.tsx:38`: `fixed bottom-0 z-40` na 360 px ma ~110 px (tekst w 2 liniach + przyciski) i nachodzi na `MobileIndicatorBar`/arkusz profilu (25%). Sprawdzić, czy arkusz/dolny pasek dostaje odstęp, gdy pasek zgody jest widoczny.

---

## Co właściciel ma sprawdzić na telefonie (kroki)

1. **Cofnięcie zgody (P1-1):** otwórz podgląd w trybie prywatnym → „Zgadzam się” → wpisz w wyszukiwarkę „Kraków” → wejdź w Stopka › Prywatność → „Cofnij zgodę” → wróć i wpisz „Gdańsk”. W PostHog (Live events) nie może pojawić się „Gdańsk”. Dziś się pojawi.
2. **Podgląd linku (P1-2, P2-2):** wyślij sobie link do podglądu w Messengerze/WhatsAppie i do konkretnej gminy. Powinien być obrazek i tytuł; dziś karta jest bez obrazka i zawsze ogólna.
3. **Wysokość ekranu (P2-3):** na telefonie, z widocznym paskiem adresu, na stronie głównej spróbuj przewinąć palcem poza mapą (nad dolnym paskiem wskaźnika). Ekran nie powinien się przesuwać, dolny pasek ma być cały widoczny; obróć telefon i wróć.
4. **Pasek zgody (P2-4, P3-6):** przy pierwszym wejściu oceń, czy „Nie” jest równie widoczne jak „Zgadzam się” i czy pasek nie zasłania dolnego paska wskaźnika ani arkusza profilu (dotknij gminę, zanim odpowiesz).
5. **Szybkość (P2-5):** w Chrome na telefonie (Ustawienia › Wyczyść dane strony) wejdź na podgląd przez sieć komórkową, licz od dotknięcia linku do kolorowej mapy. Próg z §7: ≤ 3 s; zanotuj wynik.
6. **Arkusz profilu z czytnikiem (P3-1, P3-2):** włącz VoiceOver/TalkBack, dotknij gminę, przesuń na przycisk nad arkuszem – powinno być „Rozwiń, zwinięty” (dziś tylko „Rozwiń”) i nazwa arkusza z nazwą gminy.
7. **Ciemny motyw (P3-3):** przełącz motyw na ciemny – górny pasek przeglądarki powinien ściemnieć.
8. **Klawiatura (P2-6, na komputerze):** Tab po zakładkach profilu i przełączniku Woj/Pow/Gmi – fokus ma być wyraźnie widoczny także na zaznaczonym przycisku.

## Proponowana kolejność zadań
1. P1-1 + P2-4 (jeden PR w `src/view/consent` + `Privacy.tsx`, wymaga zgody w prompcie).
2. P1-2 + P2-1 (obraz OG i porządek meta; `index.html`, `PageMeta.tsx`, `ELEMENTY.md`).
3. P2-3 (prompt musi wymienić `src/view/Home.tsx`).
4. P2-5 (najpierw pomiar i budżet w CI, potem cięcie paczek).
5. P2-6 + P3-1/P3-2 (dostępność komponentów UI).
