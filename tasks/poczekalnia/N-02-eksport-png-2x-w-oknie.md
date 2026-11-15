# N-02 – Przełącznik „Wysoka rozdzielczość (2×)” przy pobieraniu karty PNG
Cel: Użytkownik może w oknie „Pobierz i udostępnij” zaznaczyć wysoką rozdzielczość i dostaje plik PNG o podwójnych wymiarach (np. 2160×2700 zamiast 1080×1350); domyślnie nic się nie zmienia (domknięcie odłożonego z W18-P05).
Zmieniaj: src/view/share/export-scene.ts, src/view/share/ShareDialog.tsx, src/view/share/ShareControls.tsx, src/view/share/render-png.ts, tests/unit/share-export-scale.test.ts, tests/e2e/share-scale.spec.ts
Wymagane: src/view/share/export-scene.ts, tests/unit/share-export-scale.test.ts, tests/e2e/share-scale.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/share-scale.spec.ts tests/e2e/s19-share.spec.ts
Przeczytaj najpierw: docs/PRODUKT.md (§4b), docs/STYL.md, src/core/share/formats.ts (ShareScale, scaleFormat), src/core/share/card.ts (cardScene z opcją scale, scaleCardScene), src/view/share/ShareDialog.tsx, tests/e2e/s19-share.spec.ts (linie ok. 160–182: domyślny PNG ma DOKŁADNIE wymiary formatu)

Zadanie:
1. Nowy plik `src/view/share/export-scene.ts`: funkcja `buildExportScene(kind, data, format, theme, { measure, scale })`, która woła `cardScene(..., { measure, siteUrl: 'faktografia.pl', scale })`. W `ShareDialog.tsx` zastąp nią trzy miejsca budujące scenę do pliku (pobierz, udostępnij, zestaw); podgląd SVG zostaje w skali 1. Przy okazji plik ShareDialog.tsx ma się skrócić, nie wydłużyć.
2. Stan `scale: ShareScale` (domyślnie `1`) w `ShareDialog.tsx`, przekazany do `ShareControls` jako nowe opcjonalne propsy `scale` i `onSelectScale`. W `ShareControls.tsx` jeden przycisk z `aria-pressed` i etykietą „Wysoka rozdzielczość (2×)” w pełnej szerokości siatki (`md:col-span-3`), min. 44 px, klasy jak przy istniejących przyciskach (tylko tokeny, bez rounded/shadow).
3. `render-png.ts`: grubość kółka korekty (`strokeWidth`/`lineWidth` 2.5) ma rosnąć razem ze skalą. Dodaj drugi, opcjonalny argument `renderPng(scene, { scale = 1 } = {})` i mnóż 2.5 przez `scale`; dotychczasowe wywołania bez argumentu działają jak dziś.
4. `tests/unit/share-export-scale.test.ts`: dla każdego z 4 formatów `buildExportScene(..., { scale: 2 })` daje `width`/`height` = 2× `SHARE_FORMATS[f]`, a `scale: 1` – dokładnie wymiary formatu; liczba elementów sceny jest taka sama w obu skalach.
5. `tests/e2e/share-scale.spec.ts` (`@S19`): otwórz okno udostępniania jak w s19-share.spec.ts, zaznacz „Wysoka rozdzielczość (2×)”, pobierz PNG formatu Post – nagłówek IHDR ma 2160×2700; odznacz – 1080×1350.

Gotowe, gdy:
- Test jednostkowy wymiarów 1×/2× dla 4 formatów przechodzi.
- Test e2e odczytuje z pliku 2160×2700 przy włączonym przełączniku i 1080×1350 przy wyłączonym.
- Istniejący s19-share.spec.ts (domyślne wymiary) zielony bez zmian.

Nie rób: zmian w src/core/share/* (skalowanie już jest), zmiany domyślnej skali na 2, nowych pakietów, zmian istniejących testów. Wzorce zrzutów okna mogą się zmienić – napisz w PR, że trzeba je odświeżyć w CI.
