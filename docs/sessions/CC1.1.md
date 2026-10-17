CC1.1 – porządki po CC1 i bramka bezpieczeństwa

Zadanie: CC1.1 – porządki po CC1 i bramka bezpieczeństwa
Kontekst: przeczytaj AGENTS.md, docs/STYL.md (sekcje 3, 5, 12) i STAN_PROJEKTU.md. CC1 (PR #2) jest scalone i działa.
Przegląd po CC1 wykazał usterki, a nowe wytyczne projektu wymagają bramki bezpieczeństwa w CI i krótszego AGENTS.md.
To zadanie wprost pozwala zmieniać AGENTS.md, .github/, package.json, vercel.json i scripts/.
Cel dla użytkownika: strona wygląda tak samo, ale nie miga przy ciemnym motywie, przycisk motywu łatwo trafić palcem,
a każdy PR jest automatycznie sprawdzany pod kątem sekretów i podatności.
Zakres: AGENTS.md, STAN_PROJEKTU.md, docs/sessions/, index.html, src/view/Header.tsx, src/view/Home.tsx,
scripts/tokens.mjs, scripts/handoff.mjs, package.json, .oxlintrc.json, vercel.json, .github/ (workflows, dependabot.yml,
ISSUE_TEMPLATE), tests/. Usuwane pliki: src/assets/hero.png, src/assets/react.svg, src/assets/vite.svg,
public/icons.svg, public/favicon.svg.
Poza zakresem: wygląd strony (poza przyciskiem motywu), nowe biblioteki do aplikacji, config/tokens.json, docs/STYL.md,
docs/MASTER_PLAN.md.
