Zadanie: CC8.2a-1 – logika kartogramu, ładowanie plików wartości i parametry ?i= ?y=
Wymaga na main: src/core/map/classes.ts#computeBreaks, src/core/profile/profile.ts#IndicatorValues, src/core/url/state.ts#readUrlState
Kontekst: klasy kolorów są w src/core/map/classes.ts (computeBreaks, classify, classColorToken). Typ pliku wartości to IndicatorValues z src/core/profile/profile.ts ({ indicatorId, years, values: { [teryt]: (number|null)[] }, fetchedAt }); pliki będą w public/data/values/<id>.json (serwowane jako /data/values/<id>.json). Wzór leniwego ładowania: src/core/search/load-localities.ts. Stan adresu: src/core/url/state.ts (UrlState ma już pola i, y, ale readUrlState/writeUrlState obsługują tylko u). To zadanie jest czystą logiką; mapę podłącza CC8.2a-2.
Cel dla użytkownika: brak widocznej zmiany.
Zakres (tylko te pliki):

src/core/url/state.ts (tylko: obsługa i i y w readUrlState i writeUrlState)
src/core/data/load-values.ts (nowy): loadIndicatorValues(id, fetchImpl?) → Promise<IndicatorValues | null>
src/core/map/choropleth.ts (nowy): buildChoropleth(...) i schemeFor(...)
tests/unit/url-state.test.ts (tylko dopisanie testów), tests/unit/load-values.test.ts, tests/unit/choropleth.test.ts (nowe)
docs/sessions/CC8.2a-1.md

Warunki odbioru:

readUrlState('?i=avg-wage&y=2023') zwraca { i: 'avg-wage', y: 2023 }; nieznane i (brak w config/indicators.json) i nieliczbowe y są pomijane; writeUrlState({ i, y }) zachowuje inne parametry (u, e2e). Istniejące testy url-state.test.ts przechodzą bez zmian.
loadIndicatorValues('population') pobiera /data/values/population.json raz (pamięć podręczna, test z fałszywym fetch liczy wywołania); 404 lub błąd sieci zwraca null bez wyjątku.
buildChoropleth({ values, units, level, year, n = 5, method = 'quantile' }) zwraca { year, breaks, scheme, classByTeryt }: progi liczone ze WSZYSTKICH jednostek danego poziomu w kraju; year = podany, jeśli jest w values.years, inaczej ostatni rok z jakąkolwiek wartością na tym poziomie; brak wartości → 'no-data'.
schemeFor(numbers) zwraca 'diverging', gdy są wartości ujemne i dodatnie, inaczej 'sequential'.
Testy na tests/fixtures/synthetic/values-sample.json i fragmencie public/data/units.json (bez sieci).

Poza zakresem: warstwa na mapie, legenda, wybór wskaźnika.
Zasady (obowiązują zawsze)

Przeczytaj AGENTS.md. Najpierw testy do warunków odbioru (pokaż, że nie przechodzą), potem kod.
Zmieniasz WYŁĄCZNIE pliki z listy „Zakres”. Nie zmieniasz istniejących testów, package.json, pnpm-lock.yaml, .github/, config/tokens.json, docs/STYL.md.
Bez sieci: testy i kod działają na plikach z repo (public/data, public/geo, tests/fixtures). Nie wywołuj API GUS, PRNG ani innych serwerów. Jeśli czegoś brakuje w danych, zatrzymaj się i napisz komentarz.
Gałąź: tylko git merge origin/main, bez rebase i bez --force. git diff --name-status --diff-filter=D origin/main...HEAD musi być puste.
Kolory, kroje, odstępy i czasy tylko z tokenów. Zero hexów i liczb wpisanych na sztywno w UI. Brak HTML w dymkach. Pola dotykowe min. 44 px. Animacje wyłączone przy prefers-reduced-motion.
Przed pushem osobno: pnpm lint, pnpm typecheck, pnpm test, pnpm build, pnpm test:e2e – wszystkie zielone. Nie uruchamiaj pnpm shots ani pnpm verify, nie commituj docs/shots/ ani wzorców zrzutów.
ZAKAZ PUSTYCH COMMITÓW: przed pushem git diff --stat origin/main...HEAD nie może być puste. Gdy odpowiadasz na uwagę, commit musi zmieniać pliki. Jeśli nie umiesz czegoś zrobić, NIE pushuj – napisz komentarz, co blokuje, i dostarcz mniejszą część.
Opis PR po polsku: co zmieniło się dla użytkownika; tabela „warunek → test”; lista plików; rozmiar paczki głównej (gzip) przed i po, jeśli zmieniasz src/; czego nie zrobiłeś i dlaczego. Na koniec zapisz treść zadania jako docs/sessions/.md.

Źródło: docs/PROMPTY.md na main.
