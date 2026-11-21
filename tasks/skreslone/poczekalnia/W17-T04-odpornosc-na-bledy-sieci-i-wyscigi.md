# T04 – Odpornosc na bledy sieci CORS i wyscigi klikniec
Cel: Symulacja awarii sieci 404/500/timeout oraz testowanie szybkich wyscigow klikniec bez zawieszania aplikacji.
Zmieniaj: tests/e2e/network-resilience.spec.ts
Wymagane: tests/e2e/network-resilience.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§7), docs/STAN.md (Znane problemy)

Zadanie:
1. Utworz `tests/e2e/network-resilience.spec.ts`: testujacy w Playwright:
   - Symulacja bledu 500 / timeout na `profiles/*`: profil wyswietla komunikat bledu z przyciskiem „Sprobuj ponownie” zamiast bialego ekranu.
   - Symulacja bledu 404 na `parts/*`: profil gminy miejsko-wiejskiej informuje o braku danych miasto/wies bez blokowania glownego profilu.
   - Symulacja bledu sieciowego / CORS na `index.json` biblioteki: strona `/biblioteka` wyswietla komunikat z mozliwoscia ponowienia proby.
   - Szybkie klikniecie 5 jednostek z rzedu z opozniona odpowiedzia sieciowa: weryfikacja, ze wygrywa ostatnio kliknieta jednostka (brak race conditions).

Gotowe, gdy:
- Test `tests/e2e/network-resilience.spec.ts` przechodzi 3 razy z rzedu bez bledow.

Nie ruszaj: src/
