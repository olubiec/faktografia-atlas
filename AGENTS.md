# Faktografia Atlas — zasady dla agentów

## Projekt
Publiczna strona: interaktywna mapa Polski (województwo > powiat > gmina > miejscowość) z danymi GUS.
Później: generator karuzel IG działający TYLKO lokalnie (nigdy w wersji publicznej).
Plan: docs/MASTER_PLAN.md. Styl: docs/STYL.md (Kalka i korekta). Stan: STAN_PROJEKTU.md.
Bieżąca sesja: docs/sessions/CCx.md.

## Właściciel
Nie jest programistą i często pracuje z telefonu. Opis każdego PR pisz po polsku, prosto:
co zrobiłeś, co widać na zrzutach w docs/shots/, co nie działa lub zostało na później.

## Zawsze
1. Stack: Vite + React + TypeScript (strict), pnpm. Biblioteki tylko z docs/MASTER_PLAN.md, sekcja 6.
   Inną dodajesz wyłącznie z uzasadnieniem w opisie PR.
2. Przed użyciem biblioteki przeczytaj jej typy w node_modules. Nie zgaduj API.
3. src/core = czysta logika bez DOM, testowana w Vitest. src/view = React. Parametry w config/*.json.
4. Nazwy w kodzie po angielsku, komentarze po polsku. Małe pliki (do ok. 200 linii).
5. Zmieniaj tylko pliki potrzebne w bieżącej sesji.
6. Liczby wyłącznie z plików w public/data generowanych skryptami z API GUS. Nigdy ręcznie.
7. Kody TERYT zawsze jako string.
8. Sekrety tylko ze zmiennych środowiskowych (np. BDL_CLIENT_ID). Nigdy w kodzie, commitach, logach.
9. Design: obowiązuje docs/STYL.md. Kolory, kroje, odstępy i czasy wyłącznie z config/tokens.json.
   Logo tylko z public/brand/. Przed każdym PR przejdź listę kontrolną z docs/STYL.md, sekcja 12,
   i wpisz w opisie PR, że jest spełniona.
10. Napisy nie mogą wychodzić poza swoje pola (zawijanie, skracanie, dopasowanie).
11. Animacje wyłączane przy prefers-reduced-motion.
12. Repozytoria referencyjne klonuj wyłącznie do /tmp/ref. Przy zaadaptowanym kodzie komentarz:
    źródło, autor, licencja.
13. Jeśli czegoś brakuje albo coś jest niejasne, zatrzymaj się i zapytaj, zamiast zgadywać.
14. Po `shadcn add` zamień wszystkie ikony lucide na iconoir-react (Icon z src/view/ui) i usuń klasy shadow-*, rounded-*, backdrop-blur.

## Najpierw zapytaj
Zmiana package.json lub pnpm-lock.yaml

## Polecenia (tylko z pnpm)
`dev`, `build`, `lint` (oxlint), `typecheck` (tsc noEmit), `test` (vitest tests/unit),
`test:e2e` (playwright tests/e2e), `shots` (zrzuty Playwright do docs/shots),
`verify` (odpala lint, typecheck, test, build, test:e2e, shots).

## Definicja gotowe (od CC1)
1. `pnpm verify` przechodzi (lint, typecheck, testy, build, zrzuty do docs/shots/).
2. 2-3 zdania dopisane do STAN_PROJEKTU.md.
3. Na koniec zapisz treść zadania jako docs/sessions/<ID>.md. NIE edytuj STAN_PROJEKTU.md, package.json ani pnpm-lock.yaml (chyba że zadanie wprost na to pozwala) — STAN aktualizuje przegląd końca sesji.
