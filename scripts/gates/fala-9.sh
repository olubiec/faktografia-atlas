#!/usr/bin/env bash
# Bramka fali 9 (przed wysłaniem zadań fali 10). Kod 0 = spełniona. Zasady: docs/FALE.md §1, docs/PRODUKT.md §8.
source "$(dirname "$0")/../ops/lib.sh"
git -C "$ROOT" fetch -q origin main
for f in public/data/profiles/12.json public/data/explanations.json \
         tests/e2e/perf-budget.spec.ts tests/e2e/main-screen.spec.ts tests/e2e/profile-panel.spec.ts; do
  git -C "$ROOT" cat-file -e "origin/main:$f" 2>/dev/null || die "bramka fali 9: na main brak $f"
done
S="$(ci_state "$(git -C "$ROOT" rev-parse origin/main)")"
[ "$S" = "security=success verify=success" ] || die "bramka fali 9: CI na main nie jest zielone ($S)"
echo "Bramka fali 9: OK. Teraz test właściciela: docs/OPERACJE.md §4 „Test ekranu głównego” (komputer i telefon)."
