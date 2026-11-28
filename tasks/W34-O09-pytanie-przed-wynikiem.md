# O09 – Pytanie przed wynikiem w karcie „Najbardziej nietypowe”
Cel: karta 1 najpierw pyta spokojnie („Zanim zobaczysz wynik: …”), po wyborze pokazuje wynik; „Pokaż wynik” jest zawsze widoczny.
Zmieniaj: src/view/start/GuessReveal.tsx, src/core/facts/guess.ts, tests/unit/w34-o09-guess.test.tsx
Wymagane: tests/unit/w34-o09-guess.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (§3 „Pytanie przed wynikiem”, §5), src/view/start/RoleCard.tsx (W33-O07)

Zadanie:
1. `guess.ts`: z faktu karty 1 buduje 3 odpowiedzi (np. „1 na 3”, „1 na 10”, „1 na 31”) z poprawną w losowej, ale stabilnej (ziarno = TERYT) pozycji; tylko dla wskaźników w skali „1 na N” albo procentów.
2. `GuessReveal`: pytanie „Zanim zobaczysz wynik: …”, trzy przyciski ≥ 44 px, „Pokaż wynik”; po wyborze „Twoja odpowiedź: 1 na 10. Wynik:” i zdanie z karty. Bez „Brawo”, punktów, odznak, zapisu na serwerze i konta.
3. `prefers-reduced-motion` = odsłona bez animacji. Brak odpowiedzi możliwych do zbudowania = karta bez pytania (jak dziś).

Gotowe, gdy:
- Test: poprawna odpowiedź jest zawsze jedną z trzech i ma stabilną pozycję dla tego samego TERYT.
- Test: „Pokaż wynik” odsłania wynik bez wyboru; po wyborze widać „Twoja odpowiedź”.
- Test: żaden tekst nie narusza słownika tonu i nie zawiera „Brawo”, „Trafiłeś”.
- Test: zero żądań sieciowych i zero zapisów w `localStorage`.
Nie ruszaj: pozostałych kart ani `PlaceFacts.tsx`.
Tytuł PR zaczyna się od `[W34-O09]`; opis ma „Po ludzku”.
