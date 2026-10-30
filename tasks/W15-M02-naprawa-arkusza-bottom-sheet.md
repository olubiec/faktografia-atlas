# M02 – Telefon: naprawa arkusza BottomSheet i ProfileSheetMobile
Cel: Przewijanie zawartosci arkusza na 40% wysokosci ekranu siega konca tresci, przyciski Rozwin/Zwin wg WCAG 2.5.7, jeden przycisk zamknij i brak szarpania kamery przy 100%.
Zmieniaj: src/view/ui/BottomSheet.tsx, src/view/profile/ProfileSheetMobile.tsx, tests/e2e/bottom-sheet-scroll.spec.ts, tests/e2e/profile-mobile.spec.ts
Wymagane: tests/e2e/bottom-sheet-scroll.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§5 telefon), docs/STYL.md, src/view/ui/BottomSheet.tsx, src/view/profile/ProfileSheetMobile.tsx

Zadanie:
1. W `BottomSheet.tsx`: ujednolic rosnace `snapPoints = [0, 0.4, 1]`. Podepnij w `Sheet.Content` wlasciwosci `scrollClassName` i `disableDrag={({ scrollPosition }) => scrollPosition !== 'top'}`. Dopasuj wysokosc/padding kontenera przewijania do aktywnego punktu zatrzymania tak, by przy 40% wysokosci ekranu uzytkownik mogl przewinac tresc na sam dol az do przycisku „Pobierz i udostepnij” / „Kopiuj link” bez przeciagania arkusza.
2. W naglowku `BottomSheet.tsx`: dodaj przycisk „Rozwin” / „Zwin” (min-h-[44px] min-w-[44px], wolajacy `snapTo(2)` / `snapTo(1)`) jako alternatywe dla przeciagania (WCAG 2.2 kryterium 2.5.7). Przekaz `prefersReducedMotion` z `matchMedia`.
3. W `ProfileSheetMobile.tsx`: przekaz `showCloseButton={false}` do `ProfileBody`, usuwajac zduplikowany drugi przycisk `×`.
4. W `ProfileSheetMobile.tsx`: zastap ciagla petle `requestAnimationFrame` obserwatorem pozycji i ogranicz `setSheetInset` do maksymalnie 45% wysokosci okna (`Math.min(visibleHeight, Math.round(window.innerHeight * 0.45))`), aby przy 100% arkusza kamera mapy nie uciekala. Usun obejscie `?sheet=full`.

Gotowe, gdy:
- Test e2e `tests/e2e/bottom-sheet-scroll.spec.ts` (390x844 i 360x740) potwierdza, ze przy stanie 40% przewiniecie wewnatrz arkusza pozwala dosiegnac i kliknac ostatni przycisk w profilu („Pobierz i udostepnij”) bez uzycia `?sheet=full`.
- Klikniecie przycisku „Rozwin” zwieksza arkusz do >= 90%, a „Zwin” wraca do ~40%.
- W profilu mobilnym jest dokladnie jeden przycisk `×` („Zamknij”).
- Istniejace testy `profile-mobile.spec.ts` i `share-profile.spec.ts` przechodza.

Nie ruszaj: src/view/profile/ProfileSheet.tsx, src/view/map/AtlasMap.tsx, src/core/map/
