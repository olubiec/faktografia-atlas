# Prompty i zadania – co jest aktualne

Od 28.10.2026 **zadania dla Julesa to pliki `tasks/W<fala>-<id>-<nazwa>.md`**, a wykonuje je pętla Jules Loop (`docs/AUTOMAT.md`, `docs/WORKFLOW.md` §3d i §9.1). Wklejanie promptów do Julesa odpada.

| Plik | Stan | Co zrobić |
|---|---|---|
| F10–F13 (S20, S21, stabilizacja testów) | **wykonane i scalone** (PR #389–#417); pliki usunięte z `tasks/poczekalnia/` | nic |
| `F8b.md`, `F9.md`, `NAPRAWA-share-profile-mobile.md` | zamknięte, archiwum | nic |
| `docs/research/*-prompt.md`, `gemini-prompty-v2.md`, `haiku-zlecenia*.md` | prompty do Gemini / Haiku (research, nie dla Julesa) | wklejać w aplikacji Gemini z Deep Research; wynik weryfikuje Claude (WORKFLOW §8.19) |

Nowe zadanie: skopiuj `tasks/SZABLON.md`, nazwij `W<n>-<id>-<nazwa>.md` (n = następna fala, id bez kropek). Plan fal i kolejka: `docs/ARCHITEKTURA.md` §3–§4, `scripts/ops/automat-kolejka.json`; pliki fali generuje `node scripts/ops/wave-files.mjs F<n>`.
