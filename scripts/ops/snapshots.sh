#!/usr/bin/env bash
# Odświeża zrzuty wzorcowe /design na gałęzi PR (workflow "Update snapshots"; to samo robi etykieta `aktualizuj-zrzuty`).
# Tylko gdy padł krok "E2E tests" w PR, który celowo zmienia /design. Użycie: scripts/ops/snapshots.sh 107
source "$(dirname "$0")/lib.sh"
PR="${1:?numer PR}"
BR="$(pr_field "$PR" .head.ref)"
BEFORE="$(gh api "repos/$REPO/actions/workflows/update-snapshots.yml/runs?per_page=1" --jq '.workflow_runs[0].id // 0')"
gh api -X POST "repos/$REPO/actions/workflows/update-snapshots.yml/dispatches" -f ref=main -f "inputs[branch]=$BR"
for _ in $(seq 1 22); do
  sleep 25
  R="$(gh api "repos/$REPO/actions/workflows/update-snapshots.yml/runs?per_page=1" --jq '.workflow_runs[0] | "\(.id) \(.status) \(.conclusion)"')"
  read -r RID RST RCON <<< "$R"
  [ "$RID" != "$BEFORE" ] || continue
  if [ "$RST" = "completed" ]; then
    [ "$RCON" = "success" ] || die "Update snapshots zakończył się: $RCON – eskalacja"
    echo "Zrzuty odświeżone na $BR (workflow sam uruchomił CI)."
    sleep 20
    [ -n "$(ci_state "$(pr_field "$PR" .head.sha)")" ] || exec "$(dirname "$0")/kick-ci.sh" "$PR"
    echo "Teraz: scripts/ops/wait-ci.sh $PR"; exit 0
  fi
done
die "Update snapshots trwa za długo – sprawdź później w Actions"
