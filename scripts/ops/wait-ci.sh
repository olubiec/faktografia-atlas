#!/usr/bin/env bash
# Czeka (maks. ~9 min) na bramki CI dla PR. Wypisuje wynik i kończy się. Nie uruchamia niczego ponownie.
# Użycie: scripts/ops/wait-ci.sh 107
source "$(dirname "$0")/lib.sh"
PR="${1:?numer PR}"
for _ in $(seq 1 21); do
  sha="$(pr_field "$PR" .head.sha)"; st="$(ci_state "$sha")"
  case "$st" in
    *in_progress*|*queued*|*pending*|"") sleep 25;;
    *) echo "#$PR ${sha:0:7}: $st"; exit 0;;
  esac
done
echo "#$PR ${sha:0:7}: nadal trwa ($st). Sprawdź ponownie później – NIE uruchamiaj niczego od nowa."
