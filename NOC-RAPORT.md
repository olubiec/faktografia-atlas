
## [N-40] Logika „Największe zmiany”
- Dodano src/core/story/changes.ts (computeChanges, shareBelow) i change-sentence.ts (changeSentence).
- Testy: tests/unit/story-changes.test.ts, story-change-sentence.test.ts; fixture tests/fixtures/story/density-sample.json (wycięty z prawdziwego values/density.json, 3 lata, woj + powiaty 02/12/14) – dopisany do „Zmieniaj”.
- lint, typecheck, build zielone; pnpm test: wszystko zielone poza cudzym, niezacommitowanym tests/unit/search-intent.test.ts (nie mój).
- Brak usuniętych plików względem origin/main. Bez nowych pakietów, bez zmian UI/configów/snapshotów.
