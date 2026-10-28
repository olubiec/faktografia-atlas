# Prompty i zadania – co jest aktualne

Od 28.10.2026 **zadania dla Julesa to pliki `tasks/W<fala>-<id>-<nazwa>.md`**, a wykonuje je pętla Jules Loop (`docs/AUTOMAT.md`, `docs/WORKFLOW.md` §3d i §9.1). Wklejanie promptów do Julesa odpada.

| Plik | Stan | Co zrobić |
|---|---|---|
| `tasks/poczekalnia/W10-*`, `W11-*`, `W12-*` (F10–F12, S20 i S21) | gotowe do startu po zielonym CI na `main` | `git mv tasks/poczekalnia/W10-*.md tasks/` → commit → push na `main` (fala po fali) |
| `tasks/poczekalnia/W13-T13*` (stabilizacja czterech testów e2e) | gotowe do startu po scaleniu #408 | jak wyżej |
| `F8b.md`, `F9.md`, `NAPRAWA-share-profile-mobile.md` | zamknięte, archiwum | nic |
| `docs/research/*-prompt.md`, `gemini-prompty-v2.md`, `haiku-zlecenia*.md` | prompty do Gemini / Haiku (research, nie dla Julesa) | wklejać w aplikacji Gemini z Deep Research; wynik weryfikuje Claude (WORKFLOW §8.19) |

Nowe zadanie: skopiuj `tasks/SZABLON.md`, nazwij `W<n>-<id>-<nazwa>.md` (n = następna fala, id bez kropek). Plan fal i kolejka: `docs/ARCHITEKTURA.md` §3–§4, `scripts/ops/automat-kolejka.json`; pliki fali generuje `node scripts/ops/wave-files.mjs F<n>`.
