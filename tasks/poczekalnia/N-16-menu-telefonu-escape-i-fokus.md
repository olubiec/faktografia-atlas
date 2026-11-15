# N-16 – Menu na telefonie: Escape, dotknięcie obok i powrót fokusu
Cel: Rozwijane menu w nagłówku na telefonie zachowuje się jak inne okna: zamyka się klawiszem Escape i dotknięciem poza menu, fokus wraca na przycisk „Menu”, a przycisk wskazuje sterowany element (`aria-controls`).
Zmieniaj: src/view/Header.tsx, src/view/hooks/useMenuDismiss.ts, tests/unit/menu-dismiss.test.ts, tests/e2e/mobile-menu-a11y.spec.ts
Wymagane: src/view/hooks/useMenuDismiss.ts, tests/unit/menu-dismiss.test.ts, tests/e2e/mobile-menu-a11y.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/mobile-menu-a11y.spec.ts tests/e2e/main-menu-links.spec.ts tests/e2e/navigation-and-budgets.spec.ts tests/e2e/keyboard-zoom.spec.ts tests/e2e/a11y-matrix.spec.ts
Przeczytaj najpierw: src/view/Header.tsx (stan `mobileMenuOpen`, przycisk „Menu”, `MobileMenuLinks`), src/view/hooks/useKeyboardNavigation.ts (globalny Escape i pomijanie `defaultPrevented`), tests/unit/main-menu-links.test.tsx, tests/e2e/main-menu-links.spec.ts

Zadanie:
1. `src/view/hooks/useMenuDismiss.ts`: hook `useMenuDismiss({ open, onClose, menuRef, triggerRef })` – przy otwartym menu: Escape → `onClose()` i fokus na `triggerRef`; `pointerdown` poza `menuRef` i `triggerRef` → `onClose()` (bez przenoszenia fokusu). Logikę decyzji wydziel do czystej funkcji `dismissReason(event, { menuEl, triggerEl })` → `'escape' | 'outside' | null` w tym samym pliku (testowalna w środowisku node na prostych atrapach obiektów z `contains`).
2. `Header.tsx`: `id` na kontenerze menu, `aria-controls` na przycisku „Menu”, refy do obu, użycie hooka. Escape przy otwartym menu zamyka tylko menu (`preventDefault`, żeby `useKeyboardNavigation` nie zamknął przy tym profilu). Plik nie może urosnąć o więcej niż 15 linii.
3. `tests/unit/menu-dismiss.test.ts`: Escape → `'escape'`; inny klawisz → `null`; klik w menu / w przycisk → `null`; klik obok → `'outside'`.
4. `tests/e2e/mobile-menu-a11y.spec.ts` (nazwy z `@S15`, 390×844, zgoda „denied”, start `/rankingi` i `/?e2e`): otwarcie „Menu” → `aria-expanded="true"` i `aria-controls` wskazuje widoczny element; Escape → menu niewidoczne, `aria-expanded="false"`, fokus na przycisku „Menu”; ponowne otwarcie i dotknięcie treści strony poza menu → menu zamknięte; kliknięcie linku w menu nadal przechodzi na stronę i zamyka menu; na `/?e2e&u=12` Escape przy otwartym menu zamyka menu, a profil zostaje otwarty (`__atlas.profileOpen === true`).

Gotowe, gdy:
- Nowe testy zielone; main-menu-links (unit i e2e), navigation-and-budgets, keyboard-zoom, a11y-matrix zielone bez zmian.

Nie rób: zmian w useKeyboardNavigation.ts, Home.tsx, SearchDialog ani w istniejących testach; bez pułapki fokusu w menu (to nie okno modalne); bez nowych pakietów.
