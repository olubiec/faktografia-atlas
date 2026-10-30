# M03 – Profil: odblokowanie zakladki Porownaj i wybor 2. miejsca
Cel: Podpiecie gotowej porownywarki do profilu jednostki, wybor drugiego miejsca i responsywny pasek zakladek na 360 px.
Zmieniaj: src/view/profile/ProfileSheet.tsx, src/view/profile/ProfileCompare.tsx, src/components/ui/tabs.tsx, tests/e2e/compare-pick.spec.ts
Wymagane: tests/e2e/compare-pick.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§4 Profil, §4b Porownanie), src/view/profile/ProfileSheet.tsx, src/view/profile/ProfileCompare.tsx

Zadanie:
1. W `ProfileSheet.tsx`: zdejmij `disabled` i dopisek `(wkrótce)` z zakladki `compare`, dodaj `<TabsContent value="compare">` renderujacy `<ProfileCompare />` oraz przycisk „Porownaj z innym miejscem”. Gdy parametr `?c=A,B` jest obecny w adresie, umozliw przelaczenie na zakladke porownania. Dla gminy (brak podrzednych jednostek) uzyj siatki `grid-cols-2` zamiast `grid-cols-3`. Usun `uppercase` z naglowkow sekcji.
2. W `ProfileCompare.tsx`: dodaj pole wyszukiwania drugiego miejsca ustawiajace `?c=<biezacy>,<wybrany>` oraz przycisk `×` czyszczacy drugie miejsce. Dodaj przyciski szybkiego wyboru przykladowych jednostek kontrastowych. Usun hack `window.__renderProfileCompare`.
3. W `tabs.tsx`: dopasuj paddingi zakladek, aby na 360 px napisy nie nachodzily na siebie.

Gotowe, gdy:
- Test e2e `tests/e2e/compare-pick.spec.ts` (1440x900 i 360x740) potwierdza, ze w profilu jednostki zakladka „Porownaj” jest aktywna, wyszukanie i wybor drugiego miejsca ustawia parametr `?c=` w adresie, wyswietla obie mapki i tabele porownania, a `×` czyści porownanie.
- Na 360 px pasek zakladek miesci sie bez poziomego przewijania i bez ucinania etykiet.
- Brak bledow axe na zakladce porownania.

Nie ruszaj: src/view/profile/ProfileOverview.tsx, src/view/profile/ProfileCompareTable.tsx, src/view/profile/CompareMaps.tsx
