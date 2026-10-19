#!/usr/bin/env bash
# Jedno (i tylko jedno) ponowne uruchomienie nieudanych jobów CI dla PR – na wypadek niestabilnego testu.
# Druga porażka = STOP i eskalacja (OPERACJE.md §6). Użycie: scripts/ops/rerun.sh 107
source "$(dirname "$0")/lib.sh"
PR="${1:?numer PR}"
SHA="$(pr_field "$PR" .head.sha)"
RUN="$(gh api "repos/$REPO/actions/runs?head_sha=$SHA" --jq '[.workflow_runs[] | select(.name=="CI")][0] | "\(.id) \(.run_attempt) \(.status)"')"
read -r ID ATT STATUS <<< "$RUN"
[ -n "${ID:-}" ] || die "brak uruchomienia CI dla ${SHA:0:7}"
[ "$STATUS" = "completed" ] || die "CI jeszcze trwa – użyj wait-ci.sh"
[ "$ATT" -lt 2 ] || die "to już była druga próba – nie powtarzam. Eskalacja (OPERACJE.md §6)"
gh api -X POST "repos/$REPO/actions/runs/$ID/rerun-failed-jobs" >/dev/null
echo "Uruchomiono ponownie nieudane joby (próba 2). Teraz: scripts/ops/wait-ci.sh $PR"
