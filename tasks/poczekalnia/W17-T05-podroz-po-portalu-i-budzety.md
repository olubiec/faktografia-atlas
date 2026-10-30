# T05 – Podroz po portalu historia Wstecz i budzety zapytan
Cel: Test calej sciezki uzytkownika przez wszystkie nowe podstrony, weryfikacja popstate i budzetu 0 zbednych pobran.
Zmieniaj: tests/e2e/navigation-and-budgets.spec.ts
Wymagane: tests/e2e/navigation-and-budgets.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§7 Progi), docs/ARCHITEKTURA.md

Zadanie:
1. Utworz `tests/e2e/navigation-and-budgets.spec.ts`: testujacy pelna podroz uzytkownika:
   - Start na `/` -> przewiniecie do sekcji portalu -> klik w gotowy pojedynek miejsc -> `/porownaj?c=...` -> klik w `Rankingi` w menu -> `/rankingi` -> klik w wiersz jednostki -> przejscie do profilu jednostki na mapie `/?u=...` -> klik w `Biblioteka` -> `/biblioteka` -> wybor zmiennej -> `/biblioteka/:id`.
   - Nastepnie seria klikniec „Wstecz” i „Dalej” w przegladarce (`page.goBack()`, `page.goForward()`).
   - Weryfikacja, ze stan adresu i widok na ekranie zawsze sie zgadzaja.
   - Weryfikacja twardego budzetu zapytan: powrot do wczesniej odwiedzonej jednostki lub wskaznika generuje **dokladnie 0 nowych zadan sieciowych** dzieki pamieci podrecznej.

Gotowe, gdy:
- Test `tests/e2e/navigation-and-budgets.spec.ts` przechodzi 3 razy z rzedu na komputerze i telefonie (390x844).

Nie ruszaj: src/
