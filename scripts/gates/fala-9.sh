#!/usr/bin/env bash
# Bramka fali 9 (przed wysłaniem zadań fali 10). Kod 0 = spełniona.
source "$(dirname "$0")/../ops/lib.sh"
git -C "$ROOT" fetch -q origin main
for f in src/view/map/MapControls.tsx src/view/map/layers/basemap.ts; do
  git -C "$ROOT" cat-file -e "origin/main:$f" 2>/dev/null || die "bramka fali 9: na main brak $f"
done
S="$(ci_state "$(git -C "$ROOT" rev-parse origin/main)")"
[ "$S" = "security=success verify=success" ] || die "bramka fali 9: CI na main nie jest zielone ($S)"
echo "Bramka fali 9: OK. Pamiętaj o teście właściciela na telefonie (panel, suwak, legenda, link)."
