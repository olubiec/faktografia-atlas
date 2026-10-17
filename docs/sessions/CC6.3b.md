# Sesja CC6.3b – config/indicators.json i uzupełnienie raportu wskaźników

Kontekst: przeczytaj AGENTS.md („Gałąź i PR”, „Zawsze”), docs/MASTER_PLAN.md §4.1, §4.2 i §4.5, docs/data-report.md (CC6.3), scripts/data/discover.mjs, src/core/bdl/ (klient z limitami) i public/data/units.json (pole bdlId, mapowanie z CC6.2).
Cel: zamknąć wybór wskaźników. Właściciel zaakceptował decyzje dotyczące wskaźników. Powstaje config/indicators.json (kształt Indicator z MASTER_PLAN §4.5), a raport dostaje uzupełnienia dla 7 wskaźników, których kandydaci byli niewłaściwi.

Wybrane 20 wskaźników (config/indicators.json):
1. population (varId 72305, gmi, neutral)
2. density (varId 60559, gmi, neutral)
3. natural-increase (varId 450551, gmi, true)
4. migration-balance (varId 453193, gmi, true)
5. share-65plus (varId 634989, gmi, neutral)
6. median-age (varId 1650633, gmi, neutral)
7. unemployment-rate (varId 461691, pow, false)
8. unemployed-share-working-age (varId 1613094, pow, false)
9. avg-wage (varId 64428, pow, true, footnote: "bez firm do 9 pracowników")
10. income-per-capita (varId 76973, gmi, true)
11. spending-per-capita (varId 76964, gmi, null)
12. regon-per-10k (varId 60530, gmi, true)
13. dwellings-per-1000 (varId 747060, gmi, true)
14. dwelling-area-per-person (varId 60573, gmi, true)
15. forest-cover (varId 194828, gmi, true)
16. sewerage-share (varId 79130, gmi, true)
17. preschool-3-6 (varId 1617169, gmi, true)
18. library-readers-per-1000 (varId 60191, gmi, true)
19. tourist-nights-per-1000 (varId 60298, pow, null)
20. cars-per-1000 (varId 60533, pow, null, footnote: "rejestracje flot leasingowych zawyżają niektóre miasta")

Gminy miejsko-wiejskie: BDL na poziomie 6 zwraca 3934 rekordów zamiast 2479. Skrypt discover.mjs filtruje wyłącznie jednostki mające odpowiednik w units.json.
