# Wzór pliku zadania dla pętli Jules Loop (nie jest zadaniem: nazwa nie zaczyna się od `W<n>-`)

Skopiuj jako `tasks/W<n>-<id>-<nazwa>.md` (n = numer fali, id bez kropek i myślników, np. `W14-P01-napraw-legende.md`).
Pliki z `tasks/poczekalnia/` pętla ignoruje; start fali = plik w `tasks/` + push na `main`.
Linie „Zmieniaj:” i „Wymagane:” czyta maszyna (jedna linia, pliki po przecinku; `dir/*` = cały katalog).

---

# P01 – <tytuł jednym zdaniem>
Cel: <jedno zdanie: zachowanie, nie implementacja>
Zmieniaj: src/core/x/x.ts, tests/unit/x.test.ts
Wymagane: tests/unit/x.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (sekcja ekranu), <pliki>
Zadanie: <co zrobić, konkretnie; pliki i funkcje po nazwach>
Gotowe, gdy:
- <sprawdzalny warunek = co najmniej jeden test>
Nie ruszaj: <czego nie zmieniać>
Jedno zadanie = 1 zachowanie, 1–4 pliki, 50–150 linii. Zadanie zależne od innego idzie do następnej fali.
Tytuł PR zaczyna się od `[W<n>-<id>]`; opis ma „Po ludzku”.
