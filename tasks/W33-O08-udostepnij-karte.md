# O08 – „Udostępnij” na karcie: tekst z liczbą i linkiem
Cel: jedno stuknięcie wysyła spokojny tekst („Maszewo: z bibliotek publicznych korzysta 1 na 31 mieszkańców (typowa gmina: 1 na 10). GUS, 2025. {link}”) przez Web Share albo kopiuje go na komputerze.
Zmieniaj: src/view/start/ShareFact.tsx, src/core/facts/share-text.ts, tests/unit/w33-o08-share-fact.test.tsx
Wymagane: tests/unit/w33-o08-share-fact.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (§6), src/core/share/share-flag.ts, src/view/share (jak działa kopiowanie linku)

Zadanie:
1. `shareText(role, human, link)`: tekst bez zachęt („Sprawdź swoją gminę!”), bez emotikonów, link z `?ref=karta` (bez danych osoby).
2. `ShareFact`: przycisk ikonowy „Udostępnij” (≥ 44 px, `aria-label`), `navigator.share` gdy dostępne, inaczej kopiowanie do schowka z potwierdzeniem „Skopiowano”.
3. Nie wymaga cofnięcia wstrzymania D9 (żadnego obrazka, tylko tekst i link).

Gotowe, gdy:
- Test: tekst zawiera nazwę, liczbę, punkt odniesienia, rok i link z `ref=karta`, i nie narusza słownika tonu.
- Test: bez `navigator.share` używa schowka i pokazuje potwierdzenie; błąd schowka = komunikat bez wyjątku.
- Test: anulowanie okna udostępniania nie jest błędem.
Nie ruszaj: `PlaceFacts.tsx` (podpięcie robi O07 przy kolejnej zmianie – opisz w PR miejsce wpięcia).
Tytuł PR zaczyna się od `[W33-O08]`; opis ma „Po ludzku”.
