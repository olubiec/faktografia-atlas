Kontekst: przeczytaj AGENTS.md, docs/MASTER_PLAN.md §6 i STAN_PROJEKTU.md. Od teraz kilka zadań będzie szło równolegle. Żeby nie było konfliktów, wszystkie paczki instalujemy JEDEN raz w tym zadaniu, a kolejne zadania nie zmieniają package.json. To zadanie wprost pozwala zmieniać package.json, pnpm-lock.yaml, AGENTS.md, .gitignore, vite.config.ts, tsconfig*.json, src/styles/global.css.

Cel dla użytkownika: strona wygląda tak samo; projekt jest gotowy na równoległe zadania.

Warunki odbioru
Paczki z MASTER_PLAN §6, których jeszcze nie ma, zainstalowane w jednym kroku:
pnpm add nuqs maplibre-gl react-map-gl @deck.gl/core @deck.gl/layers @deck.gl/mapbox @deck.gl/extensions topojson-client cmdk minisearch motion @observablehq/plot d3-scale d3-array react-modal-sheet zod p-throttle posthog-js rough-notation roughjs iconoir-react tweakpane
pnpm add -D @axe-core/playwright mapshaper topojson-server @types/topojson-client @types/d3-scale @types/d3-array @types/geojson Test unit: package.json zawiera każdą z tych paczek.
shadcn/ui jako baza komponentów (kod kopiowany do repo, licencja MIT, zbudowany na Radix — zgodny z naszym stosem). Postępuj według oficjalnej instrukcji https://ui.shadcn.com/docs/installation/vite dla istniejącego projektu: alias @/ w tsconfig i vite.config.ts, pnpm dlx shadcn@latest init, plik components.json, src/lib/utils.ts (funkcja cn).
Zmienne motywu shadcn (--background, --foreground, --primary, --primary-foreground, --secondary, --muted, --muted-foreground, --accent, --border, --input, --ring, --destructive, --popover, --card itd.) NIE mają własnych kolorów: w global.css każda wskazuje na nasz token, np. --background: var(--kalka), --foreground: var(--tusz), --card i --popover: var(--arkusz), --primary: var(--tusz), --primary-foreground: var(--arkusz), --muted-foreground: var(--olowek), --border i --input: var(--linia), --ring: var(--tusz), --destructive: var(--korekta-tekst), --accent: var(--seq-1). --radius: 0. Tryb ciemny działa automatycznie, bo nasze tokeny już się przełączają. Usuń kolory, które wstawił kreator.
Ikony: w projekcie używamy wyłącznie iconoir-react. Jeśli kreator doinstaluje lucide-react — usuń tę paczkę. Dodaj regułę lintera zakazującą importu lucide-react.
W tym zadaniu NIE dodawaj żadnych komponentów shadcn (zrobią to zadania CC2.x). Test e2e: strona "/" wygląda jak przed zmianą (dotychczasowe testy zielone, zrzuty bez widocznych różnic).
MASTER_PLAN — nie zmieniaj (wiersz shadcn/ui w §6 już jest, PR #10).
Zasady pracy równoległej w AGENTS.md — w sekcji „Definicja gotowe” zamień punkt 4 na: „4. Na koniec zapisz treść zadania jako docs/sessions/<ID>.md. NIE edytuj STAN_PROJEKTU.md, package.json ani pnpm-lock.yaml (chyba że zadanie wprost na to pozwala) — STAN aktualizuje przegląd końca sesji.” W sekcji „Polecenia” usuń linię o pnpm handoff. W sekcji „Najpierw zapytaj” dodaj: „Zmiana package.json lub pnpm-lock.yaml”.
GEMINI_HANDOFF.md usunięty z repo i dopisany do .gitignore (skrypt pnpm handoff zostaje do użytku ręcznego).
pnpm audit --prod --audit-level high zielone. Jeśli któraś paczka ma podatność wysokiego poziomu — zatrzymaj się i opisz w PR.
