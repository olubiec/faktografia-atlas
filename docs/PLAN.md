# Plan – Faktografia Atlas
Cel produktu: interaktywna mapa Polski z danymi GUS, w której użytkownik szuka i porównuje wskaźniki dla województw, powiatów, gmin i miejscowości.

Format sesji: WORKFLOW v3 §5 i §16.4. Stary plan fal 0–13 (47 zadań) przeniesiony do `docs/archiwum/PLAN-v3.2.md`.

## S14 – szkic (zakres do potwierdzenia przez Ciebie)
Efekt dla użytkownika: do ustalenia w `TRYB: PLAN – S14` (fala 4: CC2.6, CC4.1, CC5.1, CC5.3, CC6.3 wg archiwum).

Kto i jak (WORKFLOW §6):
| Krok | Kto | Jak |
|---|---|---|
| Wdrożenie v3 (PR #177) | Ty | patrz tabela w docs/STAN.md, kroki 1–4 |
| Fala 3 (PR #27/#28) | Ty, ew. Audytor | docs/STAN.md, krok 5 |
| Plan S14 i paczka `docs/zadania/S14.md` | Architekt (Claude Opus, nowy czat) → Ty wgrywasz | `TRYB: PLAN – S14` + link KONTEKST → Upload files do `docs/zadania/` |
| Zadania S14 | Autopilot startuje, Jules koduje | automat, bez Twojej akcji |
| Audyt zadań krytycznych | Audytor (Claude Code) | `/audyt-pr <nr>` po Tablicy |
| Scalanie widocznych | Ty | podgląd Vercel + lista §16.12 |
| Audyt sesji i zamknięcie | Ty → Claude Code `/audyt-sesji S14`, potem Architekt `TRYB: ZAMKNIJ SESJĘ` | WORKFLOW §6 kroki 9–10 |

## Później
- Pozostałe fale z archiwum – przepisywane do sesji S15+ po zamknięciu S14.
