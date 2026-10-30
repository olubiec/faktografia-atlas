# M06 – Okno Pobierz i udostepnij ShareDialog pelny ekran na telefonie
Cel: Przebudowa ShareDialog na pelnoekranowy responsywny arkusz na telefonie i czyszczenie klas niezgodnych ze STYL.md.
Zmieniaj: src/view/share/ShareDialog.tsx, src/view/share/ShareControls.tsx, tests/e2e/share-dialog.spec.ts
Wymagane: src/view/share/ShareControls.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§4b Udostępnianie), docs/STYL.md (§5 i §12), src/view/share/ShareDialog.tsx

Zadanie:
1. Wydziel przelaczniki opcji karty, formatu i motywu do `src/view/share/ShareControls.tsx` (ponizej 200 linii kodu).
2. Na ekranie mobilnym (< 768 px): `ShareDialog.tsx` wyswietla sie jako pelnoekranowy arkusz (`max-md:fixed max-md:inset-0 max-md:h-dvh max-md:max-h-none flex flex-col bg-arkusz`):
   - U gory: sticky naglowek z ikona Xmark z iconoir-react (zamiast tekstowego ✕) i podglad karty SVG.
   - W srodku: przewijalne przelaczniki z `ShareControls.tsx`.
   - Na dole: sticky pasek glownych przyciskow akcji („Pobierz obraz”, „Udostepnij”, „CSV”) z odstepem `pb-[env(safe-area-inset-bottom)]` – stale widoczny na 360x740 bez koniecznosci przewijania calego dialogu.
3. Usun wszystkie zabronione klasy ze `STYL.md §12`: `rounded-xl`, `rounded-lg`, `shadow-xl`, `drop-shadow-sm`, `backdrop-blur-xs`, `uppercase`.

Gotowe, gdy:
- Test e2e `tests/e2e/share-dialog.spec.ts` (na 360x740 oraz 1440x900) potwierdza, ze podglad karty SVG oraz glowny przycisk „Pobierz obraz” sa jednoczesnie widoczne w oknie bez obcinania.
- Zadne elementy w oknie nie uzywaja klas `rounded-*`, `shadow-*`, `backdrop-blur-*`.
- Wszystkie pola dotykowe >= 44x44 px; brak bledow axe.

Nie ruszaj: src/core/share/, src/view/share/useShareData.ts
