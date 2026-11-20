# U07 – Strona startowa z animowaną mapą w tle
Cel: specyfikacja i prototyp strony startowej, która tłumaczy koncept, ma animowaną mapę (losową w spoczynku, reagującą na kursor) i dopiero po kliknięciu otwiera mapę.
Zmieniaj: docs/research/u/U07.md, src/view/test/proto/start.tsx, src/core/start/idle-motion.ts, tests/unit/u07-idle-motion.test.ts
Wymagane: docs/research/u/U07.md, tests/unit/u07-idle-motion.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PLAN-UPROSZCZENIE.md (cel właściciela 20.11), AGENTS.md, docs/PRODUKT.md, docs/KONCEPT-STRONA-STARTOWA.md (decyzja właściciela 20.11: wariant A, / = startowa, mapa po kliknięciu), docs/research/qu/QU32*.md (jeśli jest), docs/STYL.md
Zadanie:
1. Animacja: lekki SVG lub canvas z uproszczonym obrysem (bez pełnej mapy WebGL). Kolory z aktualnego domyślnego wskaźnika. Tryb losowy, gdy brak ruchu przez N s. Reakcja na kursor (np. podświetlenie i fala wokół kursora). Telefon: losowo i reakcja na dotyk. prefers-reduced-motion = obraz statyczny.
2. Budżety: rozmiar obrysu, czas do pierwszego obrazu, p95 klatki na SwiftShader.
3. Treść: 1 zdanie „co to jest”, 3 kroki „jak używać”, przycisk „Otwórz mapę”, źródło danych (GUS). Szkic tekstów w raporcie.
4. Przejście do /mapa: co trzeba zmienić (trasy, stare linki /?u=…, ok. 100 testów e2e na „/”). Lista z liczbami z kodu.
5. Prototyp pod /__test/proto/start; czysta logika ruchu w src/core/start/idle-motion.ts.
Gotowe, gdy:
- Test jednostkowy: bez ruchu kursora logika przechodzi w tryb losowy po zadanym czasie, a ruch kursora wraca do trybu reakcji.
- Test jednostkowy: przy reduced-motion logika nie zwraca ruchu.
- U07.md ma budżety, teksty i listę zmian dla przeniesienia mapy na /mapa.
Raport kończy się sekcjami „Rekomendacja” i „Pytania do właściciela” (najwyżej 3, każde z odpowiedziami do wyboru i zaleceniem). Pisz po ludzku: właściciel nie czyta kodu.
Nie ruszaj: src/App.tsx, plików ekranu (src/view/Home.tsx, src/view/map/AtlasMap.tsx, src/view/profile/ProfileSheet*.tsx, src/view/map/hooks/*), istniejących testów, docs/STAN.md, package.json, pnpm-lock.yaml.
Tytuł PR zaczyna się od `[W22-<id>]`; opis ma „Po ludzku”.
