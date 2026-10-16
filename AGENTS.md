# Faktografia Atlas — zasady dla agentów (Jules, Gemini)

## Projekt
Publiczna strona: interaktywna mapa Polski (województwo > powiat > gmina > miejscowość) z danymi GUS.
Później: generator karuzel IG działający TYLKO lokalnie (nigdy w wersji publicznej).
Plan: docs/MASTER_PLAN.md. Stan: STAN_PROJEKTU.md. Bieżąca sesja: docs/sessions/CCx.md.
Raport dla planisty: GEMINI_HANDOFF.md (generowany skryptem `pnpm handoff`).

## Właściciel
Nie jest programistą i często pracuje z telefonu. Opis każdego PR pisz po polsku, prosto:
co zrobiłeś, co widać na zrzutach w docs/shots/CCx/, co nie działa lub zostało na później.

## Zasady techniczne
1. Stack: Vite + React + TypeScript (strict), pnpm. Nie dodawaj bibliotek spoza docs/MASTER_PLAN.md
   bez uzasadnienia w opisie PR.
2. Przed użyciem biblioteki przeczytaj jej typy w node_modules. Nie zgaduj API.
3. src/core = czysta logika bez DOM, testowana w Vitest. src/view = React. Parametry w config/*.json.
4. Nazwy w kodzie po angielsku, komentarze po polsku. Małe pliki (do ok. 200 linii).
5. Zmieniaj tylko pliki potrzebne w bieżącej sesji. legacy/ jest tylko do odczytu (referencja).
6. Liczby wyłącznie z plików w public/data generowanych skryptami z API GUS. Nigdy ręcznie.
7. Kody TERYT zawsze jako string.
8. Sekrety tylko ze zmiennych środowiskowych (np. BDL_CLIENT_ID). Nigdy w kodzie, commitach, logach.
9. Design: tokeny tylko z config/tokens.json. Zakazy anty-slop z docs/MASTER_PLAN.md (bez
   gradientów fioletowo-niebieskich, glassmorphismu, fontów Inter/Geist, emoji jako ikon,
   domyślnego wyglądu bibliotek UI, neonów).
10. Napisy nie mogą wychodzić poza swoje pola (zawijanie, skracanie, dopasowanie).
11. Animacje 150-400 ms, wyłączane przy prefers-reduced-motion.
12. Repozytoria referencyjne klonuj wyłącznie do /tmp/ref. Przy zaadaptowanym kodzie komentarz:
    źródło, autor, licencja.

## Koniec każdej sesji (obowiązkowo, od CC1)
- `pnpm verify` przechodzi (lint, typecheck, testy, build, zrzuty do docs/shots/CCx/).
- `pnpm handoff` aktualizuje GEMINI_HANDOFF.md.
- 2-3 zdania dopisane do STAN_PROJEKTU.md.
- Treść zadania zapisana jako docs/sessions/CCx.md.