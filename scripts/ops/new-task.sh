#!/usr/bin/env bash
# Tworzy issue dla Julesa z gotowego promptu w docs/PROMPTY.md albo docs/FALE.md (+ wspólny blok z PROMPTY.md §5).
# Sprawdza linię "Wymaga na main:" w prompcie i duplikaty. Nic nie wymyśla: brak promptu = STOP.
# Użycie: scripts/ops/new-task.sh CC8.3a [--dry-run]
source "$(dirname "$0")/lib.sh"
ID="${1:?Podaj ID zadania, np. CC8.3a}"; DRY="${2:-}"
git -C "$ROOT" fetch -q origin main
OUT="$(mktemp)"
# LOCAL=1 czyta prompty z katalogu roboczego (tylko do sprawdzania nowych promptów przed PR; zadań tak nie wysyłamy)
if [ "${LOCAL:-}" = 1 ]; then SRC="cat $ROOT/docs/PROMPTY.md $ROOT/docs/FALE.md"; else
  SRC="git -C $ROOT show origin/main:docs/PROMPTY.md origin/main:docs/FALE.md"; fi
$SRC | ID="$ID" python3 -c '
import os, re, sys
s = sys.stdin.read(); tid = os.environ["ID"]
blocks = re.findall(r"```markdown\n(.*?)```", s, re.S)
common = [b for b in blocks if b.startswith("### Zasady")]
mine = [b for b in blocks if re.match(r"Zadanie: " + re.escape(tid) + r" ", b)]
if len(mine) != 1 or len(common) != 1:
    sys.exit(f"STOP: w PROMPTY.md + FALE.md jest {len(mine)} promptów dla {tid} (musi być dokładnie 1)")
b = mine[0]
print(b.splitlines()[0].replace("Zadanie: ", "", 1))
print("---")
print(b + "\n" + common[0] + "\nŹródło: docs/PROMPTY.md na main.")
' > "$OUT" || { rm -f "$OUT"; die "brak promptu $ID na main"; }
TITLE="$(head -n1 "$OUT")"; BODY="$(tail -n +3 "$OUT")"; rm -f "$OUT"

# Warunki startu: pliki i eksporty, które muszą już być na main
REQ="$(printf '%s\n' "$BODY" | sed -n 's/^Wymaga na main: *//p' | head -n1)"
if [ -n "$REQ" ] && [ "$REQ" != "nic" ]; then
  IFS=',' read -ra ITEMS <<< "$REQ"
  for it in "${ITEMS[@]}"; do
    it="$(echo "$it" | sed 's/[` ]//g')"
    if [[ "$it" == *"#"* ]]; then         # plik#eksport
      f="${it%%#*}"; e="${it##*#}"
      git -C "$ROOT" show "origin/main:$f" 2>/dev/null | grep -Eq "export (async )?(function|const|type|interface) $e\b" \
        || die "na main brak eksportu $e w $f – zadanie $ID jeszcze nie może iść"
    else
      git -C "$ROOT" cat-file -e "origin/main:$it" 2>/dev/null || die "na main brak $it – zadanie $ID jeszcze nie może iść"
    fi
  done
fi

# Bramka fali: zadanie fali 9 wymaga bramki 8b, fali 10 – bramki 9 (komendy w scripts/gates/, zasady w docs/FALE.md §1)
WAVE="$(git -C "$ROOT" show origin/main:docs/FALE.md | sed -n "s/^| *\([0-9A-Za-z]*\) *| *$(printf '%s' "$ID" | sed 's/[.]/\\./g') .*/\1/p" | head -n1)"
case "$WAVE" in
  9)  GATE=fala-8b.sh ;;
  10) GATE=fala-9.sh ;;
  *)  GATE="" ;;
esac
if [ -n "$GATE" ]; then
  [ -f "$ROOT/scripts/gates/$GATE" ] || die "brak scripts/gates/$GATE (zsynchronizuj main: OPERACJE.md §3 krok 1)"
  GERR="$(bash "$ROOT/scripts/gates/$GATE" 2>&1 >/dev/null)" || die "zadanie $ID (fala $WAVE) czeka na bramkę – ${GERR#STOP: }"
fi

# Duplikat: otwarte issue albo PR z tym samym ID w tytule
DUP="$(gh api "repos/$REPO/issues?state=open&per_page=100" --jq ".[] | select(.title | startswith(\"$ID \")) | .number" | head -n1)"
[ -z "$DUP" ] || die "zadanie $ID już jest otwarte (#$DUP)"

echo "Tytuł: $TITLE"
echo "Warunki startu: ${REQ:-brak} – spełnione"
if [ "$DRY" = "--dry-run" ]; then echo "(próba – nic nie utworzono)"; exit 0; fi
gh api -X POST "repos/$REPO/issues" -f title="$TITLE" -f body="$BODY" -f 'labels[]=jules' --jq '"UTWORZONO #\(.number): \(.html_url)"'
