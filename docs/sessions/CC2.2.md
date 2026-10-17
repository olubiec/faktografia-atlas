# CC2.2 – komponenty interaktywne: zakładki, dymek, okno, popover, suwak, przełącznik

Zadanie: CC2.2 – komponenty interaktywne: zakładki, dymek, okno, popover, suwak, przełącznik
Kontekst: przeczytaj AGENTS.md, docs/STYL.md (sekcje 2, 5, 8, 12) i config/tokens.json. Baza: shadcn/ui.
Gotowce: pnpm dlx shadcn@latest add tabs tooltip dialog popover slider toggle-group — przerabiasz skopiowany kod na nasz styl.
Równolegle trwają CC2.1 i CC2.3 — nie ruszaj plików spoza zakresu.
Zakres: src/components/ui/tabs.tsx, tooltip.tsx, dialog.tsx, popover.tsx, slider.tsx, toggle-group.tsx, tests/.
Poza zakresem: button/input (CC2.1), strona /design, nagłówek.
Warunki odbioru (testy przed kodem)

Tabs: aktywna zakładka podkreślona 3 px w kolorze --korekta, tekst --tusz; nieaktywne --olowek. Bez tła i ramek „pigułek”.
Tooltip: tło --tusz, tekst --arkusz, 13 px, radius 0, bez strzałki-ozdobnika, bez cieni.
Dialog: przyciemnienie tła = --tusz z kryciem 40%, BEZ backdrop-filter. Okno = arkusz (CC2.1 styl: --arkusz, ramka --linia).
Przycisk zamknięcia z ikoną Iconoir Xmark i aria-label „Zamknij”. Animacje wejścia tylko przezroczystość, 150 ms z tokenów;
przy prefers-reduced-motion brak animacji.
Popover: jak arkusz, bez cieni.
Slider: tor 2 px --linia, wypełnienie --tusz, uchwyt kwadrat 20×20 px --tusz z polem dotyku 44 px.
ToggleGroup: elementy z ramką 1 px --tusz, wybrany = tło --tusz, tekst --arkusz. Min. 44 px.
Żadnego importu lucide-react, żadnych klas shadow-, rounded- (poza rounded-none), backdrop-blur.
Test unit: skan plików src/components/ui/*.tsx pod kątem tych wzorców.
Strona testowa /__test/interactive (tylko DEV) ze wszystkimi komponentami; axe bez naruszeń w obu motywach;
test e2e: Dialog otwiera się i zamyka Escape, fokus wraca do przycisku; Tabs obsługują strzałki.

Weryfikacja
pnpm verify zielone. Zrzuty strony testowej w PR (jasny/ciemny, 1440/390). Lista kontrolna STYL.md §12.
