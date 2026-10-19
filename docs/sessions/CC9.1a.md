Zadanie: CC9.1a – oś czasu sceny „kreślenie” (czysta logika)

Wymaga na main: config/tokens.json
Kontekst: przy wejściu kontur Polski ma się narysować tuszem, potem wypełnienie, potem jedno zakreślenie. Czasy WYŁĄCZNIE z config/tokens.json → motion (drawOutline 1200, base 300, slow 600, easing). Przy prefers-reduced-motion brak animacji. Scenę na mapie zrobi CC9.1b.
Cel dla użytkownika: brak widocznej zmiany.
Zakres (tylko te pliki):

src/core/motion/timeline.ts (nowy)
tests/unit/timeline.test.ts (nowy)
docs/sessions/CC9.1a.md

Warunki odbioru:

buildIntroTimeline({ reducedMotion, motion }) zwraca etapy [{ id: 'outline' | 'fill' | 'annotate', start, duration }] po kolei, bez nakładania; czasy z przekazanego motion (test z tokens.motion).
reducedMotion: true → wszystkie duration = 0 i start = 0.
stageAt(timeline, t) zwraca { id, progress } (0–1) dla czasu t w ms; przed startem progress 0, po końcu ostatni etap z progress 1.
totalDuration(timeline) zgodny z sumą etapów.
Brak liczb czasu wpisanych w kodzie (test: źródło nie zawiera 1200, 300, 600).

Poza zakresem: rysowanie na mapie (CC9.1b).
