# CC2.6a – tokens-map i diffTokens (pierwszy krok panelu ?tune)

Kontekst: przeczytaj AGENTS.md („Gałąź i PR”), docs/STYL.md oraz config/tokens.json i src/styles/tokens.css (tokeny są tu jako zmienne CSS).
Poprzednie próby tego zadania (#34, PR #37 i #39) zakończyły się pustymi PR-ami albo błędem. Dlatego teraz robimy tylko pierwszy, mały krok. Panel Tweakpane przyjdzie w osobnym zgłoszeniu, po scaleniu tego.
Cel: dwie czyste funkcje, bez interfejsu. Pierwsza mapuje klucze z config/tokens.json na nazwy zmiennych CSS. Druga liczy różnicę między wartościami oryginalnymi a bieżącymi.
Zakres (tylko te pliki):

src/view/tune/tokens-map.ts (nowy)
tests/unit/tune.test.ts (nowy)
docs/sessions/CC2.6a.md (nowy)

Nie zmieniaj: src/main.tsx, src/App.tsx, package.json, src/view/** poza nowym katalogiem src/view/tune/, tests/e2e/, public/, config/. Nie instaluj żadnych paczek.
Warunki odbioru (najpierw testy):

tokens-map.ts eksportuje mapę: każdy klucz kolorów, typografii i odstępów z config/tokens.json ma nazwę zmiennej CSS. Test sprawdza, że każda nazwa zmiennej istnieje w src/styles/tokens.css.
diffTokens(original, current) zwraca tylko zmienione wartości, w tej samej strukturze zagnieżdżeń co config/tokens.json. Test: identyczne dane dają pusty obiekt; jedna zmieniona wartość koloru daje jeden wpis; zmiana zagnieżdżona zachowuje ścieżkę.
Funkcje są czyste: nie czytają DOM, nie używają localStorage ani sieci.

Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build zielone. Nie trzeba e2e.
Zasady gałęzi (obowiązkowe): tylko git merge origin/main, bez rebase i bez --force. Przed pushem git diff --name-status --diff-filter=D origin/main...HEAD musi być puste. Opis PR: tabela „warunek → test”.
