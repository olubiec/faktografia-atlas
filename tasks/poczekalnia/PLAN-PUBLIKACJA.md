# Plan publikacji: fale P1–P4 (zadania do puszczania ręcznie w Claude Code)

Każdy plik P*-*.md = jedna sesja Claude Code. Wklej do sesji: „Wykonaj dokładnie zadanie z pliku tasks/poczekalnia/P1-A.md”.
Zadania w jednej fali są niezależne (różne pliki), można je puszczać równolegle w osobnych sesjach/oknach.
Każda sesja pracuje na własnej gałęzi `task/<ID>` odgałęzionej od `claude/inspiring-shannon-vfxoax` i ją pushuje (bez PR).
Po fali: w sesji głównej „scal falę N” → git merge task/* → pełne testy → push.

Kolejność: P1 (telefon) → P2 (braki formalne; P2-D po P2-C, P2-F po P2-D, P2-E po P1-F i P1-G) → P3 (dane) → P4 (animacje).
P2-G (PostHog) jest niezależne; zrób je przed P2-B, bo polityka prywatności opisuje jego konfigurację (POSTHOG_CONFIG). Zmienia src/core/consent/analytics.ts za zgodą wprost.
P3-B i P4-D to zadania tylko do odczytu (raport).
Pliki w tej katalogu pętla Jules Loop ignoruje. Zakresy pokrywają się częściowo z W18-P03 (intro) i W18-P04 (SEO): przy puszczaniu P4-B/P2-A zrezygnuj z odpowiedniego W18-*.
