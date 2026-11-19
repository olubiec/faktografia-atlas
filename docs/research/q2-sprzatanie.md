# QR05 – Inwentarz gałęzi claude/* i kopii roboczych (stan 19.11.2026, main = 3ed628d)

Nic nie zostało usunięte. Raport tylko wylicza i podaje polecenia dla właściciela.

## Ustalenia
1. Na GitHubie istnieją dziś tylko 4 gałęzie `claude/*`: `FIX6A`, `FIX6I`, `clever-ptolemy-r5yel7`, `laughing-pasteur-8af8jz`. PR-y z gałęzi `claude/*`: 73 scalone (gałęzie zdalne usunięte przy scalaniu) i 3 otwarte z bieżącej fali W3 (#524 QR06, #525 QR03, #526 QR01); innych niescalonych nie ma.
2. Lokalnie jest 10 „duchów” `origin/claude/QC*` (QC104, QC203, QC302, QC603, QC703, QC902, QC910, QC911, QC913, QC914): to nieodświeżone ślady po usuniętych gałęziach. Leczy je `git fetch --prune`; nie wymagają usuwania niczego na GitHubie.
3. Zdalne gałęzie:
   - `FIX6I` – wskazuje na commit już będący na main (przodek). Do usunięcia, zero ryzyka.
   - `FIX6A` – 2 commity ([W2-FIX6A] i [W2-FIX6B]); ich treść weszła na main przez PR #494 (`FIX6A-clean`) i #493 (`FIX6B`). Różnica patchy to artefakt squasha. Do usunięcia.
   - `clever-ptolemy-r5yel7` (326 commitów przed main, tip [Q1-QC601]) i `laughing-pasteur-8af8jz` (512 commitów, tip [W17-C03]): brak wspólnego przodka z main (historia main została zbudowana od nowa), brak PR. Tip QC601 jest na main jako #459 (7b5c350). NIE usuwać na razie: to jedyne kopie starej historii.
4. Lokalnie 35 gałęzi `claude/*` i 32 worktrees w `/home/user/wt`:
   - 18 gałęzi QC*: każda ma 1–4 commity „przed main”, ale PR każdej jest scalony (squash): #506, #520, #514, #511, #519, #507, #517, #518, #522, #513, #510, #521, #509, #512, #508, #515, #516, #523 (+ QC911 #508, QC913 #515, QC914 #516). `git cherry` pokazuje 0 niescalonych dla 14 z nich; dla QC203/QC302/QC703/QC902 po 1–2 „plusy” to commity „Merge”/„Usunięcie node_modules” (patrz Dowody). Można usunąć.
   - 3 stare gałęzie robocze (`q2-start`, `q2-korekta`, `q2-wiring-tasks`): 0 commitów przed main. Można usunąć.
   - 14 gałęzi QR/QS/QT: 0 commitów przed main (to bieżąca fala W3).
5. Worktrees QC* (18): każdy ma tylko nieśledzony `node_modules` (dowiązanie do instalacji) – brak pracy do stracenia.
6. Worktrees W3, których NIE wolno ruszać:
   - `QS01`, `QS02`, `QS03`, `QS04`: niezatwierdzone zmiany w plikach śledzonych + nowe testy (praca w toku).
   - `QT01`–`QT04`: nieśledzone nowe pliki testów (praca w toku).
   - `QR04`: zablokowany (`locked`), prawdopodobnie sesja trwa.
   - `QR01`–`QR03`, `QR06`, `QR07`: czyste, ale to zadania tej samej fali (sesje mogą trwać); `QR05` to ten PR.

## Dowody
- `git branch -r | grep claude/` → 10 wpisów QC*; `gh api repos/olubiec/faktografia-atlas/branches/claude/QC104` → `404 Branch not found` (to samo dla pozostałych 9 i dla `q2-*`).
- `gh api 'repos/olubiec/faktografia-atlas/branches?per_page=100' --paginate -q '.[].name' | grep claude` → `claude/FIX6A claude/FIX6I claude/clever-ptolemy-r5yel7 claude/laughing-pasteur-8af8jz`.
- `gh api 'repos/olubiec/faktografia-atlas/pulls?state=all' --paginate` → 76 PR-ów z głową `claude/*`: 73 `merged=true`, 3 otwarte (#524, #525, #526 – fala W3); poza tym otwarty jest tylko #450 (dependabot).
- Per gałąź lokalna: `for b in $(git branch --list 'claude/*' --format='%(refname:short)'); do echo $b $(git rev-list --count origin/main..$b) $(git cherry origin/main $b | grep -c '^+'); done`
  - QC104/106/303/603/610/611/612/705/910/911/913/914/915: ahead=1, cherry+=0 (zawartość już na main).
  - QC203: ahead=3, cherry+=2; QC302: 2/1; QC703: 2/2; QC902: 2/2; QC702: 4/2 – squash scalił je inaczej niż pojedyncze patche.
- Sprawdzenie treści dla tych pięciu (`git diff origin/main claude/X -- <pliki gałęzi>`): QC302, QC703, QC902 → identyczne z main; QC203 → różnica tylko „main jest nowszy” (−58/+2 w jednym pliku, późniejsze zmiany QC4xx/QC9xx); QC702 → jw. (−6/+1). Czyli nic nie jest unikalne w gałęzi.
- QC703 i QC902 mają commity „Usunięcie przypadkowo dodanego linku node_modules” (5f7b4cf, 96f087d) – to naprawa po sobie, bez wartości.
- `git merge-base origin/main claude/clever-ptolemy-r5yel7` → puste (to samo dla `laughing-pasteur-8af8jz`): niepowiązane historie. `git merge-base --is-ancestor claude/FIX6I origin/main` → tak.
- Stan worktrees: `git -C /home/user/wt/<X> status --porcelain` → QC*: tylko `?? node_modules`; QS01–QS04: ` M src/...` + `?? tests/unit/...`; QT01–QT04: `?? tests/...spec/test`; `git worktree list` → `QR04 ... locked`.
- Zgodne z `docs/STAN.md` („Stare gałęzie FIX6A i FIX6I … usunąć; Claude nie może: proxy blokuje usuwanie gałęzi”).

## Rekomendacja
Usunąć teraz: zdalne `FIX6A` i `FIX6I`, 3 stare gałęzie `q2-*`, 18 gałęzi lokalnych QC* wraz z ich 18 worktrees, oraz odświeżyć ślady (`git fetch --prune`). Zostawić: `clever-ptolemy-r5yel7` i `laughing-pasteur-8af8jz` (oznaczyć jako archiwum starej historii; usunąć dopiero po zadaniu z sekcji niżej), wszystkie worktrees i gałęzie QR*/QS*/QT* do czasu scalenia ich PR-ów (QS/QT mają pracę niezatwierdzoną). Polecenia uruchamia właściciel na swoim komputerze (Claude nie ma uprawnień do usuwania gałęzi).

```
# 1) odświeżenie śladów po usuniętych gałęziach (bezpieczne)
git fetch --prune origin

# 2) usunięcie zdalnych FIX6A i FIX6I (zawartość jest na main)
git push origin --delete claude/FIX6A claude/FIX6I

# 3) usunięcie worktrees QC* (nieśledzony node_modules to dowiązanie – stąd --force)
for x in QC104 QC106 QC203 QC302 QC303 QC603 QC610 QC611 QC612 QC702 QC703 QC705 QC902 QC910 QC911 QC913 QC914 QC915; do
  git worktree remove --force /home/user/wt/$x
done

# 4) usunięcie lokalnych gałęzi QC* i q2-* (-D, bo squash nie robi z nich przodków main)
git branch -D claude/QC104 claude/QC106 claude/QC203 claude/QC302 claude/QC303 claude/QC603 \
  claude/QC610 claude/QC611 claude/QC612 claude/QC702 claude/QC703 claude/QC705 claude/QC902 \
  claude/QC910 claude/QC911 claude/QC913 claude/QC914 claude/QC915 \
  claude/q2-start claude/q2-korekta claude/q2-wiring-tasks
```
Przed krokiem 3 sprawdź jeszcze `git worktree list` – jeśli któryś QC* ma dziś niezatwierdzone zmiany inne niż `node_modules`, pomiń go.
Po scaleniu fali W3 (osobno): `git worktree remove` + `git branch -D` dla QR01–QR07, QS01–QS04, QT01–QT04 (QR04: najpierw `git worktree unlock`).

## Proponowane zadania
1. **Archiwum starych historii**
   - Zmieniaj: docs/research/q2-sprzatanie-archiwum.md
   - Cel: ustalić, czy `clever-ptolemy-r5yel7` i `laughing-pasteur-8af8jz` zawierają coś, czego nie ma na main (porównanie plików, nie commitów), i zakończyć rekomendacją: usunąć albo zachować jako tag.
   - Gotowe, gdy: raport ma sekcje „Ustalenia”, „Dowody”, „Rekomendacja”; lista plików obecnych tylko w gałęzi (albo „brak”); jednoznaczne polecenie dla właściciela.
2. **Automatyczne usuwanie gałęzi po scaleniu**
   - Zmieniaj: docs/research/q2-sprzatanie-ustawienia.md
   - Cel: sprawdzić, czy ustawienie repozytorium „Automatically delete head branches” jest włączone (gałęzie PR giną same, więc tak wygląda), i opisać dla właściciela, jak je potwierdzić; wskazać, dlaczego `FIX6A`/`FIX6I` przetrwały (obcy commit / inny autor).
   - Gotowe, gdy: raport z dowodem (`gh api repos/olubiec/faktografia-atlas -q .delete_branch_on_merge`) i jednoznaczną decyzją.
3. **Sprzątanie worktrees po fali W3**
   - Zmieniaj: docs/research/q2-sprzatanie-w3.md
   - Cel: po scaleniu PR-ów QR/QS/QT podać aktualną listę worktrees do usunięcia i polecenia (jak w kroku 3–4 wyżej).
   - Gotowe, gdy: dla każdego worktree wynik `git status --porcelain` i status PR; zero pozycji z niezatwierdzoną pracą na liście do usunięcia.
