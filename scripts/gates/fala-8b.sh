#!/usr/bin/env bash
# Bramka fali 8b (przed wysłaniem zadań fali 9). Kod 0 = spełniona. Sprawdza stan origin/main, nie raport modelu.
source "$(dirname "$0")/../ops/lib.sh"
git -C "$ROOT" fetch -q origin main
N="$(git -C "$ROOT" ls-tree --name-only origin/main public/data/values/ | grep -c '\.json$' || true)"
[ "$N" -eq 20 ] || die "bramka fali 8b: na main jest $N plików wartości zamiast 20 (public/data/values/)"
for f in src/view/map/ProfilePortal.tsx tests/unit/data-contract.test.ts; do
  git -C "$ROOT" cat-file -e "origin/main:$f" 2>/dev/null || die "bramka fali 8b: na main brak $f"
done
S="$(ci_state "$(git -C "$ROOT" rev-parse origin/main)")"
[ "$S" = "security=success verify=success" ] || die "bramka fali 8b: CI na main nie jest zielone ($S)"
echo "Bramka fali 8b: OK (20 plików danych, profil po kliknięciu, test kontraktu, CI zielone). Pamiętaj o teście właściciela na telefonie."
