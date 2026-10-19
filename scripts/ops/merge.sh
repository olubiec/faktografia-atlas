#!/usr/bin/env bash
# Bezpieczne scalenie PR (squash) z wszystkimi kontrolami z PROMPTY.md §8.
# Przy JAKIMKOLWIEK zastrzeżeniu kończy się "STOP" i nic nie scala – wtedy eskalacja (OPERACJE.md §5).
# Użycie: scripts/ops/merge.sh 107 [--dry-run] [--zakres-ok]
#   --zakres-ok: pomija TYLKO kontrolę zakresu. Wolno go użyć wyłącznie, gdy właściciel albo Sonnet
#                napisał w PR komentarz "zakres OK" (OPERACJE.md §5). Haiku nie decyduje o tym sam.
source "$(dirname "$0")/lib.sh"
PR="${1:?numer PR}"; shift || true
DRY=""; SCOPE_OK=""
for a in "$@"; do case "$a" in --dry-run) DRY="--dry-run";; --zakres-ok) SCOPE_OK=1;; *) die "nieznana opcja $a";; esac; done

[ "$(pr_field "$PR" .state)" = "open" ] || die "PR #$PR nie jest otwarty"
SHA="$(pr_field "$PR" .head.sha)"; TITLE="$(pr_field "$PR" .title)"
ST="$(ci_state "$SHA")"
[ "$ST" = "security=success verify=success" ] || die "bramki CI nie są zielone ($ST)"

fetch_pr "$PR"
[ "$(git -C "$ROOT" rev-parse "refs/ops/pr-$PR")" = "$SHA" ] || die "pobrana głowa PR różni się od tej z GitHuba – uruchom ponownie"

# 1. Usunięte pliki względem main (musi być pusto)
DEL="$(git -C "$ROOT" diff --name-status --diff-filter=D refs/ops/main...refs/ops/pr-$PR)"
[ -z "$DEL" ] || die "PR usuwa pliki z main:\n$DEL"

FILES="$(git -C "$ROOT" diff --name-only refs/ops/main...refs/ops/pr-$PR)"
echo "Pliki w PR:"; echo "$FILES" | sed 's/^/  /'

# 2. Zakres: pliki spoza listy "Zakres" w issue zadania (ID z początku tytułu PR)
ID="$(echo "$TITLE" | grep -oE '^(CC[0-9]+(\.[0-9A-Za-z-]+)*)' || true)"
WARN=""
if [ -n "$ID" ]; then
  ISSUE_BODY="$(gh api "repos/$REPO/issues?state=all&labels=jules&per_page=100" --jq ".[] | select(.pull_request|not) | select(.title | startswith(\"$ID \")) | .body" | head -c 200000)"
  if [ -n "$ISSUE_BODY" ]; then
    OUTSIDE="$(FILES="$FILES" python3 -c '
import os, re, sys
body = sys.stdin.read()
m = re.search(r"Zakres[^\n]*\n(.*?)\n\s*\n", body, re.S)
allowed = set(re.findall(r"`([^`\s]+[./][^`\s]*)`", m.group(1))) if m else set()
out = []
for f in os.environ["FILES"].split():
    if f.startswith("docs/sessions/") or "-snapshots/" in f: continue
    if f in allowed: continue
    if any(a.endswith("/") and f.startswith(a) for a in allowed): continue
    out.append(f)
print("\n".join(out))
' <<< "$ISSUE_BODY")"
    if [ -n "$OUTSIDE" ] && [ -n "$SCOPE_OK" ]; then
      gh api "repos/$REPO/issues/$PR/comments" --jq '.[].body' | grep -qi 'zakres OK' \
        || die "--zakres-ok bez komentarza \"zakres OK\" w PR – nie wolno"
      WARN="$WARN\n- pliki spoza Zakresu zaakceptowane komentarzem \"zakres OK\": $(echo $OUTSIDE)"
      OUTSIDE=""
    fi
    [ -z "$OUTSIDE" ] || die "pliki spoza Zakresu zadania $ID:\n$OUTSIDE\n(→ eskalacja do Sonneta, OPERACJE.md §5)"
  else
    WARN="$WARN\n- nie znalazłem issue dla $ID – zakres niesprawdzony"
  fi
else
  WARN="$WARN\n- tytuł PR nie zaczyna się od ID zadania – zakres niesprawdzony"
fi

# 3. Twarde kolory w dodanych liniach src/ (zasada: tylko tokeny)
HEX="$(git -C "$ROOT" diff refs/ops/main...refs/ops/pr-$PR -- src | grep -E '^\+' | grep -E "#[0-9A-Fa-f]{6}\b|\[[0-9]{1,3}, *[0-9]{1,3}, *[0-9]{1,3}(, *[0-9]{1,3})?\]|rgba?\(" || true)"
[ -z "$HEX" ] || die "w src/ dodano wartości kolorów zamiast tokenów:\n$HEX"

# 4. Ostrzeżenia (nie blokują): zrzuty wzorcowe, package.json, as any
echo "$FILES" | grep -q -- '-snapshots/' && WARN="$WARN\n- PR zmienia zrzuty wzorcowe (dozwolone tylko z workflow Update snapshots) – CI zielone, więc akceptuję"
echo "$FILES" | grep -qx 'package.json' && WARN="$WARN\n- PR zmienia package.json – sprawdź, czy zadanie na to pozwala"
git -C "$ROOT" diff refs/ops/main...refs/ops/pr-$PR -- src | grep -E '^\+' | grep -q 'as any' && WARN="$WARN\n- w kodzie jest 'as any'"
[ -z "$WARN" ] || printf "Uwagi:%b\n" "$WARN"

if [ "$DRY" = "--dry-run" ]; then echo "PRÓBA: wszystkie kontrole przeszły, nic nie scalono."; exit 0; fi

OLD="$(git -C "$ROOT" rev-parse refs/ops/main)"
[ "$(pr_field "$PR" .draft)" = "true" ] && gh api -X POST "repos/$REPO/pulls/$PR/ccr/ready_for_review" >/dev/null 2>&1 || true
gh api -X PUT "repos/$REPO/pulls/$PR/merge" -f merge_method=squash -f sha="$SHA" --jq '.merged' | grep -q true || die "GitHub odmówił scalenia"
git -C "$ROOT" fetch -q origin "+refs/heads/main:refs/ops/main"
LOST="$(git -C "$ROOT" diff --name-status --diff-filter=D "$OLD" refs/ops/main)"
[ -z "$LOST" ] || die "PO SCALENIU zniknęły pliki z main – natychmiast eskaluj do Sonneta:\n$LOST"
echo "SCALONO #$PR ($TITLE)"
