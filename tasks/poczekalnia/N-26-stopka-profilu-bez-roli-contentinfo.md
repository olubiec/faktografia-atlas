# N-26 – Stopka profilu nie udaje stopki strony (axe landmark-no-duplicate-contentinfo)
Cel: Na telefonie profil (arkusz w `document.body`) ma `<footer>` poza treścią sekcyjną, więc przeglądarka daje mu rolę `contentinfo` – obok prawdziwej stopki strony (`SiteFooter`, `role="contentinfo"`). Czytnik ekranu widzi dwie stopki strony. Przez to padają w axe s20-parts (telefon 390 i 360).
Zmieniaj: src/view/profile/ProfileSheet.tsx, tests/unit/profile-footer-landmark.test.tsx, tests/e2e/profile-single-contentinfo.spec.ts
Wymagane: tests/unit/profile-footer-landmark.test.tsx, tests/e2e/profile-single-contentinfo.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/profile-single-contentinfo.spec.ts tests/e2e/s20-parts.spec.ts tests/e2e/profile.spec.ts tests/e2e/s14-profile.spec.ts tests/e2e/footnote-target-size.spec.ts tests/e2e/site-footer-mobile.spec.ts
Przeczytaj najpierw: src/view/profile/ProfileSheet.tsx (stopka ok. linii 232–259; plik ekranu – wolno go zmienić tylko w tym zadaniu i tylko w tym miejscu), src/view/layout/SiteFooter.tsx (tylko czytasz), tests/unit/profile-sheet.test.tsx, tests/e2e/s20-parts.spec.ts (ścieżka telefonu, mocki), tasks/poczekalnia/DIAGNOZA-E2E.md (grupa 6)

Diagnoza (planista, 2026-11-16): axe w s20-parts 390/360: `landmark-no-duplicate-contentinfo` – `<footer role="contentinfo" class="border-t … mt-auto">` (SiteFooter) i `<footer class="pt-4 border-t border-linia text-xs text-olowek space-y-3">` (ProfileBody).

Zadanie:
1. `ProfileSheet.tsx`: element `<footer className="pt-4 border-t …">` zamień na `<div data-slot="profile-footer" className="…te same klasy…">` (zamknięcie `</footer>` → `</div>`). Treść, kolejność i klasy bez zmian. Plik nie może urosnąć (limit style-guard 350).
2. `tests/unit/profile-footer-landmark.test.tsx` (`renderToString`, dane jak w profile-sheet.test.tsx): HTML `ProfileSheet` nie zawiera `<footer`, zawiera `data-slot="profile-footer"` oraz nadal „Źródło: GUS”.
3. `tests/e2e/profile-single-contentinfo.spec.ts` (nazwy z `@S20`): `/?e2e&u=12` przy 390×844 i 1440×900, po `__atlas.profileOpen === true` → dokładnie jeden element z rolą `contentinfo` (`page.getByRole('contentinfo')` ma count 1) i axe `withRules(['landmark-no-duplicate-contentinfo','landmark-unique'])` → 0 naruszeń.

Gotowe, gdy:
- Nowe testy zielone; profile-sheet.test, footnotes-format.test, profile.spec, s14-profile, footnote-target-size, site-footer-mobile zielone bez zmian.
- s20-parts.spec.ts (390 i 360) zielony bez zmian w nim – jeśli nadal pada, wklej w raporcie identyfikatory reguł axe (może czekać na N-25).

Nie rób: zmian w SiteFooter.tsx, ProfileSheetMobile.tsx, innych częściach ProfileSheet.tsx, istniejących testach; bez nowych pakietów.
