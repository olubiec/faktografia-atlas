#!/usr/bin/env bash
# Gdy commit robota (np. "Update snapshots") nie uruchomił CI: dokłada pusty commit na gałąź PR.
# Tylko wtedy, gdy status.sh pokazuje "BRAK CI". Użycie: scripts/ops/kick-ci.sh 107
source "$(dirname "$0")/lib.sh"
PR="${1:?numer PR}"
SHA="$(pr_field "$PR" .head.sha)"; BR="$(pr_field "$PR" .head.ref)"
[ -z "$(ci_state "$SHA")" ] || die "CI dla ${SHA:0:7} już istnieje ($(ci_state "$SHA")) – nie trzeba"
fetch_pr "$PR"
TMP="$(mktemp -d)"; git -C "$ROOT" worktree add -q --detach "$TMP" "refs/ops/pr-$PR"
git -C "$TMP" commit -q --allow-empty -m "ci: uruchom bramki (commit robota nie uruchamia CI)"
git -C "$TMP" push -q origin "HEAD:refs/heads/$BR"
git -C "$ROOT" worktree remove --force "$TMP"
echo "Wypchnięto pusty commit na $BR. Teraz: scripts/ops/wait-ci.sh $PR"
