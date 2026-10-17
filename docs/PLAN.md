# Faktografia Atlas — plan sesji v3.1 (małe zadania, praca równoległa)

Zasady:
- 1 zadanie = 1 zgłoszenie na GitHubie = 1 sesja Julesa = 1 PR.
- Zgłoszenia zakłada Claude i sam dodaje etykietę `jules` (wtedy Jules startuje). Ty: zatwierdzasz plan w Julesie,
  piszesz Claude „gotowe”, po przeglądzie scalasz.
- Zadania z tej samej „fali” mogą iść równolegle — nie dotykają tych samych plików.
- Wszystkie paczki są instalowane raz (CC1.2), więc kolejne zadania nie zmieniają package.json (główne źródło konfliktów).
- Jeśli po scaleniu jednego PR inny pokaże konflikt: komentarz w tamtym PR „@Jules zaktualizuj gałąź do main i rozwiąż konflikty”.
- Komponenty nie są pisane od zera: shadcn/ui (kod Radix kopiowany do repo) przerobiony na nasz styl.

Wykonawca: **J** Jules, **C** Claude.

---

## Fala 0 (teraz)
| Zadanie | Kto | Zgłoszenie | Zależy od |
|---|---|---|---|
| CC1.1 porządki i bramka bezpieczeństwa | J | #3 (w toku) | — |
| CC1.5 makiety 4 ekranów + decyzja o logo | C | — | — (równolegle z CC1.1) |

## Fala 1
| CC1.2 wszystkie paczki naraz, shadcn/ui, zasady pracy równoległej | J | #4 | CC1.1 |

## Fala 2 — 5 sesji naraz
| Zadanie | Kto | Zgłoszenie | Zależy od |
|---|---|---|---|
| CC2.1 przycisk, pole, arkusz, ikona | J | #5 | CC1.2 |
| CC2.2 zakładki, dymek, okno, popover, suwak, przełącznik | J | #6 | CC1.2 |
| CC2.3 ręczne zakreślenia | J | #7 | CC1.2 |
| CC3.1 geometria TopoJSON | J | #8 | CC1.2 |
| CC6.1 klient API GUS + nagrane odpowiedzi | J | #9 | CC1.2 |

## Fala 3 — 4 sesje naraz
| CC2.4 strona /design (wszystko razem) + wzorce zrzutów | J | | CC2.1–2.3 |
| CC2.5 nagłówek (samo F) i ekran startowy wg makiety | J | | CC2.1, CC1.5 |
| CC3.2 units.json + logika jednostek | J | | CC3.1 |
| CC6.2 mapowanie jednostek GUS ↔ TERYT | J | | CC6.1, CC3.2* |
*CC6.2 startuje, gdy CC3.2 jest scalone (potrzebuje units.json).

## Fala 4
| CC2.6 panel ?tune | J | | CC2.4 |
| CC4.1 mapa: czysta kalka, kontur, stan testowy | J | | CC2.5, CC3.2 |
| CC5.1 indeks wyszukiwania jednostek | J | | CC3.2 |
| CC5.3 skrypt miejscowości (PRNG) | J | | CC3.2 |
| CC6.3 wybór 20 wskaźników → raport | J | | CC6.2 → **STOP: przegląd C** |
**Przegląd końca sesji CC2: C.**

## Fala 5
| CC4.2 przechodzenie w głąb | J | | CC4.1 |
| CC5.2 okno wyszukiwania (Ctrl+K) | J | | CC5.1, CC2.2 |
| CC6.4 pobieranie danych do public/data | J | | przegląd CC6.3, sekret BDL_CLIENT_ID |

## Fala 6
| CC4.3 okruszki, adres ?u=, lista dla klawiatury | J | | CC4.2 |
| CC5.4 miejscowości w wyszukiwarce i na mapie | J | | CC5.2, CC5.3, CC4.2 |
| CC6.5 nocny robot + test kontraktu API | J | | CC6.4 |
| CC7.1 logika profilu | J | | CC6.4 |
| CC8.1 klasy kolorów (logika) | J | | CC6.4 |

## Fala 7
| CC4.4 blady podkład od zoomu 9 | J | | CC4.3 |
| CC7.2 arkusz profilu (komputer) | J | | CC7.1, CC4.3 |
| CC8.2 kolorowanie mapy + legenda | J | | CC8.1, CC4.3 |

## Fala 8
| CC4.5 dopasowanie mapy do makiety | J | | CC4.4 → **przegląd C (wizualny)** |
| CC7.3 arkusz na telefonie | J | | CC7.2 |
| CC8.3 wybór wskaźnika, suwak lat | J | | CC8.2 |

## Fala 9
| CC7.4 wykresy, przypisy, zakreślenie | J | | CC7.3 → **przegląd C** |
| CC8.4 brak danych, kreskowanie | J | | CC8.3 |
| CC9.1 scena „kreślenie” | J | | CC8.2 |

## Fala 10
| CC8.5 porównanie miejsc | J | | CC8.4, CC7.4 |
| CC9.2 przejścia | J | | CC9.1 |
| CC10.1 tryb 3D | J | | CC8.3 |

## Fala 11
| CC10.2 3D: ograniczenia i szlif | J | | CC10.1 |
| CC11.1 zgoda + PostHog | J | | — (może wcześniej) |
| CC11.2 strona /prywatnosc | J | | CC11.1 |

## Fala 12
| CC11.3 wydajność, Lighthouse CI | J | | wszystko powyżej |
| CC11.4 axe wszędzie, alarm błędów | J | | wszystko powyżej → **przegląd przed startem: C** |

Generator karuzel: osobne prywatne repo po starcie strony.

Łącznie 47 zadań w 13 falach. Zgłoszenia na fale 1 i 2 już są w repo (#4–#9).
Zgłoszenia na kolejne fale piszę po scaleniu poprzedniej, bo zależą od tego, co faktycznie powstało.
