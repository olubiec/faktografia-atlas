# Faktografia Atlas — plan sesji v3.2 (małe zadania, praca równoległa, stałe kontrole)

Wykonawcy: **J** Jules, **C** Claude, **Ty** właściciel.

## Zasady

- 1 zadanie = 1 zgłoszenie na GitHubie = 1 sesja Julesa = 1 PR. Zgłoszenia zakłada C i dodaje etykietę `jules`.
- Zadania z jednej fali idą równolegle i nie dotykają tych samych plików. Wszystkie paczki są już zainstalowane (CC1.2), więc zadania nie zmieniają `package.json` (poza wskazaną linią skryptu).
- Gałąź aktualizuje się tylko przez `git merge origin/main`; PR nie może usuwać niczego z main (AGENTS.md, „Gałąź i PR”).
- Komponenty nie są pisane od zera: shadcn/ui przerobione na nasz styl, paczki z MASTER_PLAN §6.
- Wzorzec wyglądu: makiety w `docs/design/` (CC1.5). Zadania z UI mają warunek „zgodne z makietą”.

## Stałe kroki

### Przy każdym PR

| Krok | Kto |
|---|---|
| CI: lint, typy, testy jednostkowe, build, e2e, gitleaks, `pnpm audit` | automat |
| Przegląd: diff zgodny z zakresem zadania, zero usuniętych plików z main (`git diff --diff-filter=D`), każdy warunek odbioru ma test, testy nie osłabione, brak sekretów i `VITE_*` z kluczami | C |
| Gdy PR zmienia wygląd: etykieta `aktualizuj-zrzuty`, potem ocena różnic w zrzutach | Ty dodajesz etykietę, C ocenia |
| Lista 8 punktów z telefonu (niżej) i scalenie przez **squash** | Ty |
| Gdy Jules nie reaguje na komentarz w PR: poprawka C tylko za Twoją zgodą | C |

**Twoja lista przed scaleniem:** 1) CI zielone; 2) PR dotyczy jednego zadania, pliki pasują do zakresu; 3) każdy warunek odbioru ma dowód; 4) recenzent nie ma otwartych uwag o błędzie lub bezpieczeństwie; 5) różnice w zrzutach są zamierzone; 6) na podglądzie Vercel w telefonie główna ścieżka działa; 7) brak nowych zależności, zmian w testach lub w `.github/` bez Twojej zgody; 8) squash.

### Na koniec każdej fali

| Krok | Kto |
|---|---|
| Audyt fali: pełne `pnpm verify` na main, porównanie z makietami, przegląd bezpieczeństwa całej fali, lista poprawek jako nowe zadania | C |
| Aktualizacja `STAN_PROJEKTU.md` | C |
| Scalenie zaległych PR od Dependabota (po zielonym CI i przeglądzie C) | Ty |
| Przy falach z UI: druga opinia o zrzutach w aplikacji Gemini (zrzut + STYL.md, pytanie o zgodność) – darmowa, opcjonalna | Ty |
| Zgłoszenia na następną falę piszemy dopiero po scaleniu bieżącej | C |

## Jednorazowo, teraz (przed falą 4)

| Krok | Kto | Po co |
|---|---|---|
| Decyzja: repo publiczne | Ty | ochrona gałęzi main i reguły są w darmowym GitHubie tylko dla repo publicznych; do tego darmowy CodeRabbit i CodeQL. Sekrety są w GitHub Secrets, gitleaks na main jest czysty |
| Po upublicznieniu: ochrona main (zakaz bezpośredniego pushu, wymagane `verify` i `security`, scalanie tylko przez PR) | C przygotuje instrukcję, Ty klikasz |
| Po upublicznieniu: CodeRabbit („tylko błędy i bezpieczeństwo”) i CodeQL | Ty + C |
| Podpięcie Vercel do repo (podgląd każdego PR) | Ty, ok. 5 minut |
| Ustawienia repo: tylko squash, automatyczne usuwanie gałęzi po scaleniu, usunięcie starych gałęzi | C przygotuje, Ty potwierdzasz |

## Fale

### Fala 0–2 (zakończone)
CC1, CC1.1, CC1.1b, CC1.2, CC2.1, CC2.2, CC2.3, CC3.1, CC6.1 – na main. Szczegóły: STAN_PROJEKTU.md.

### Fala 3 (w toku)
| Zadanie | Kto | Zgłoszenie | Zależy od |
|---|---|---|---|
| CC3.2 units.json + logika jednostek | J | #24 / PR #27 | CC3.1 |
| CC2.4 strona /design + wzorce zrzutów (workflow z etykietą `aktualizuj-zrzuty`) | J | #25 / PR #28 | CC2.1–2.3 |
| CC1.5 makiety 4 ekranów + logo | C | płótno „Faktografia Atlas – makiety” | — |
| CC2.5 nagłówek (logo i przełącznik „logo / znak F na powiatach”) + ekran startowy wg makiety | J | po akceptacji makiet | CC2.1, CC1.5 |
| CC6.2 mapowanie jednostek GUS ↔ TERYT | J | po scaleniu CC3.2 | CC6.1, CC3.2 |

**Dodatkowo w fali 3:** makiety jako PNG w `docs/design/` (C); pierwsze wzorce zrzutów /design przez etykietę (Ty); kroki „teraz” z tabeli wyżej.

### Fala 4
| Zadanie | Kto | Zależy od |
|---|---|---|
| CC2.6 panel ?tune | J | CC2.4 |
| CC4.1 mapa: czysta kalka, kontur, szew `window.__atlas` (warstwy, wybrana jednostka, skala) | J | CC2.5, CC3.2 |
| CC5.1 indeks wyszukiwania jednostek | J | CC3.2 |
| CC5.3 skrypt miejscowości (PRNG) | J | CC3.2 |
| CC6.3 wybór 20 wskaźników → raport | J | CC6.2 → **STOP: przegląd C** |

**Dodatkowo w fali 4:**
- CC4.1 warunki: testy mapy tylko na stanie `window.__atlas`; zrzut mapy jako informacyjny, nieblokujący; w lincie zakaz HTML w dymkach deck.gl (`getTooltip` zwracający `html`).
- CC5.3: jeśli eTERYT wymaga ręcznego pobrania pliku, Jules zatrzymuje się i podaje Ci instrukcję.
- Koniec fali: **przegląd końca sesji CC2** (C), w tym zgodność /design i nagłówka z makietami.

### Fala 5
| Zadanie | Kto | Zależy od |
|---|---|---|
| CC4.2 przechodzenie w głąb | J | CC4.1 |
| CC5.2 okno wyszukiwania (Ctrl+K) | J | CC5.1, CC2.2 |
| CC6.4 pobieranie danych do public/data | J | przegląd CC6.3, sekret `BDL_CLIENT_ID` |

**Dodatkowo w fali 5:**
- **Przed CC6.4 (Ty):** klucz `BDL_CLIENT_ID` w GitHub Secrets i w ustawieniach repo w Julesie.
- CC6.4 warunki: test, że zbudowana strona nie zawiera adresu `bdl.stat.gov.pl` ani zmiennych `VITE_*` z kluczem; strona czyta tylko `public/data`.
- Koniec fali: audyt przepływu danych (C).

### Fala 6
| Zadanie | Kto | Zależy od |
|---|---|---|
| CC4.3 okruszki, adres ?u=, lista dla klawiatury | J | CC4.2 |
| CC5.4 miejscowości w wyszukiwarce i na mapie | J | CC5.2, CC5.3, CC4.2 |
| CC6.5 nocny robot + test kontraktu API | J | CC6.4 |
| CC7.1 logika profilu | J | CC6.4 |
| CC8.1 klasy kolorów (logika) | J | CC6.4 |

**Dodatkowo w fali 6:**
- CC6.5: test kontraktu uruchamiany przez robota (czy API nie zmieniło formatu); przy błędzie e-mail z GitHuba.
- **Ty:** jedno ręczne uruchomienie robota (Actions → Nightly data → Run workflow) i sprawdzenie, że zrobił commit danych.

### Fala 7
| CC4.4 blady podkład od zoomu 9 | J | CC4.3 |
|---|---|---|
| CC7.2 arkusz profilu (komputer) | J | CC7.1, CC4.3 |
| CC8.2 kolorowanie mapy + legenda | J | CC8.1, CC4.3 |

**Dodatkowo:** zrzuty arkusza profilu i legendy jako wzorce (DOM/SVG); ocena zgodności z makietą „Profil – komputer” (C).

### Fala 8
| CC4.5 dopasowanie mapy do makiety | J | CC4.4 → **przegląd C (wizualny)** |
|---|---|---|
| CC7.3 arkusz na telefonie | J | CC7.2 |
| CC8.3 wybór wskaźnika, suwak lat | J | CC8.2 |

**Dodatkowo:** **Ty** sprawdzasz podgląd Vercel na swoim telefonie (start, mapa, profil); druga opinia Gemini o zrzutach (opcjonalnie).

### Fala 9
| CC7.4 wykresy, przypisy, zakreślenie | J | CC7.3 → **przegląd C** |
|---|---|---|
| CC8.4 brak danych, kreskowanie | J | CC8.3 |
| CC9.1 scena „kreślenie” | J | CC8.2 |

**Dodatkowo:** test `prefers-reduced-motion` (bez animacji wejścia); test „najwyżej jedno zakreślenie na ekranie”.

### Fala 10
| CC8.5 porównanie miejsc | J | CC8.4, CC7.4 |
|---|---|---|
| CC9.2 przejścia | J | CC9.1 |
| CC10.1 tryb 3D | J | CC8.3 |

**Dodatkowo:** 3D sprawdzane przez `window.__atlas` (kąt kamery, wysokości warstw), zrzuty 3D tylko informacyjne. Antigravity na komputerze tylko tu, gdy 3D wygląda źle.

### Fala 11
| CC10.2 3D: ograniczenia i szlif | J | CC10.1 |
|---|---|---|
| CC11.1 zgoda + PostHog | J | — (może wcześniej) |
| CC11.2 strona /prywatnosc | J | CC11.1 |

**Dodatkowo:** **przed CC11.1 (Ty):** klucz PostHog. CC11.1 warunek: test, że bez zgody nie wychodzi żadne zdarzenie ani ciasteczko.

### Fala 12
| CC11.3 wydajność, Lighthouse CI z budżetami | J | wszystko powyżej |
|---|---|---|
| CC11.4 axe na wszystkich ekranach, alarm błędów JS | J | wszystko powyżej → **przegląd przed startem: C** |

**Dodatkowo przed startem:** pełny audyt C (bezpieczeństwo, dane, dostępność, zgodność z makietami); **Ty:** domena w Vercel, test na 2 telefonach.

## Po starcie (stałe)

| Co | Kiedy | Kto |
|---|---|---|
| PR od Dependabota | co tydzień, po zielonym CI | Ty + C |
| Kontrola nocnego robota (czy dane się odświeżają) | e-mail z GitHuba przy błędzie | automat, Ty reagujesz |
| Odświeżenie granic (`pnpm geo`, `pnpm units`) | raz w roku, po zmianach granic gmin | J |
| Generator karuzel | osobne prywatne repo; recenzentem jest C na koniec sesji | J + C |

Łącznie 47 zadań w 13 falach.
