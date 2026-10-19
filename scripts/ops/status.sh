#!/usr/bin/env bash
# Przegląd stanu projektu jednym poleceniem. Tylko odczyt.
# Użycie: scripts/ops/status.sh
source "$(dirname "$0")/lib.sh"

echo "== main: $(ci_state "$(gh api "repos/$REPO/commits/main" --jq .sha)")"
echo
echo "== Otwarte PR"
gh api "repos/$REPO/pulls?state=open&per_page=50" --jq '.[] | "\(.number)\t\(.draft)\t\(.head.sha)\t\(.title)"' |
while IFS=$'\t' read -r n draft sha title; do
  st="$(ci_state "$sha")"
  case "$st" in
    *failure*|*cancelled*|*timed_out*) verdict="CZERWONE → OPERACJE.md §6";;
    "verify=success security=success"|"security=success verify=success") verdict="ZIELONE → merge.sh $n";;
    "") verdict="BRAK CI (push robota?) → kick-ci.sh $n";;
    *) verdict="CZEKA na CI";;
  esac
  echo "#$n  draft=$draft  $st  [$verdict]  $title"
done
echo
echo "== Otwarte zadania Jules (issue z etykietą jules)"
gh api "repos/$REPO/issues?state=open&labels=jules&per_page=50" --jq '.[] | select(.pull_request|not) | "#\(.number)  \(.title)"'
echo
echo "== Ostatnie uruchomienia workflow innych niż CI"
gh api "repos/$REPO/actions/runs?per_page=30" --jq '[.workflow_runs[] | select(.name!="CI")][:6][] | "\(.name)  \(.status)/\(.conclusion // "-")  \(.created_at)  gałąź=\(.head_branch)"'
