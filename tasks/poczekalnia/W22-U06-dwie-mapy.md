# U06 – Dwie mapy obok siebie (zestawienie dwóch wskaźników)
Cel: sprawdzić, czy i jak pokazać dwie zsynchronizowane mapy z różnymi wskaźnikami, także na telefonie.
Zmieniaj: docs/research/u/U06.md, src/view/test/proto/dwie-mapy.tsx
Wymagane: docs/research/u/U06.md
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, docs/ARCHITEKTURA.md, src/view/profile/CompareMaps.tsx, docs/research/p-animacja-kamery-pomiar.md, docs/research/u/WYTYCZNE.md, docs/PLAN-UPROSZCZENIE.md §0 (decyzje zatwierdzone)
Zadanie:
1. Technika: dwie instancje MapLibre i deck.gl czy jedna mapa z dwoma widokami (deck.gl views). Synchronizacja kamery, pamięć GPU, klatki (pomiar SwiftShader jak w PF01, liczby orientacyjne), limit kontekstów WebGL na telefonach.
2. UX: wspólny rok i poziom czy osobne? Klik w miejsce zaznacza je na obu? Legenda każdej mapy. Telefon: punkt wyjścia to jedna mapa pod drugą (decyzja D1). Prototyp ma przełącznik układu (góra/dół ↔ przełącznik A/B), żeby właściciel porównał je w praktyce na telefonie; opisz plusy i minusy obu.
3. Alternatywa: wykres punktowy „wskaźnik A × wskaźnik B” (każda gmina = kropka). Kiedy lepszy niż dwie mapy?
4. Prototyp pod /__test/proto/dwie-mapy: dwie zsynchronizowane mapy z dwoma wskaźnikami na istniejących warstwach. Bez zmian w AtlasMap.tsx i map/hooks (najwyżej import istniejących funkcji).
Gotowe, gdy:
- U06.md ma pomiar (p95 klatki, pamięć) dla 1 i 2 map oraz rekomendację na komputer i telefon.
- Prototyp działa pod /__test/proto/dwie-mapy na podglądzie.
Raport kończy się sekcjami „Rekomendacja” i „Pytania do właściciela” (najwyżej 3, każde z odpowiedziami do wyboru i zaleceniem). Pisz po ludzku: właściciel nie czyta kodu.
Nie ruszaj: src/App.tsx, plików ekranu (src/view/Home.tsx, src/view/map/AtlasMap.tsx, src/view/profile/ProfileSheet*.tsx, src/view/map/hooks/*), istniejących testów, docs/STAN.md, package.json, pnpm-lock.yaml.
Tytuł PR zaczyna się od `[W22-<id>]`; opis ma „Po ludzku”.
