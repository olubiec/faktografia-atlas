#!/usr/bin/env bash
# Wspólne funkcje skryptów operacyjnych (docs/OPERACJE.md). Wymaga: gh, git, python3.
set -euo pipefail
REPO="${REPO:-olubiec/faktografia-atlas}"
ROOT="$(git rev-parse --show-toplevel)"

die() { printf "STOP: %b\n" "$*" >&2; exit 1; }

# Stan bramek CI dla commita: wypisuje "verify=<stan> security=<stan>"
ci_state() {
  gh api "repos/$REPO/commits/$1/check-runs" --jq '
    [.check_runs[] | select(.name=="verify" or .name=="security")
     | "\(.name)=\(if .status=="completed" then .conclusion else .status end)"]
    | sort | join(" ")'
}

pr_field() { gh api "repos/$REPO/pulls/$1" --jq "$2"; }

# Świeże pobranie main i głowy PR do osobnych referencji (nigdy do gałęzi wybranej w katalogu roboczym)
fetch_pr() {
  git -C "$ROOT" fetch -q origin "+refs/heads/main:refs/ops/main" "+refs/pull/$1/head:refs/ops/pr-$1"
}
