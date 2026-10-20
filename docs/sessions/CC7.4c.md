CC7.4c – jedno zakreślenie najlepszego miejsca w rankingu w profilu

Zadanie: CC7.4c – jedno zakreślenie najlepszego miejsca w rankingu w profilu
Wymaga na main: src/core/profile/footnotes.ts#collectFootnotes, src/view/annotation/Annotate.tsx
Kontekst: zakreślenia „czerwonym ołówkiem”: Annotate (src/view/annotation/Annotate.tsx) w AnnotationProvider; zasada STYL.md: najwyżej JEDNO zakreślenie na ekranie. Profil ma rankNational, rankVoivodeship, neutral (src/core/profile/profile.ts).
Cel dla użytkownika: w profilu jedna wyróżniona rzecz: wskaźnik, w którym jednostka wypada najlepiej w województwie (np. „1. miejsce w małopolskim”), jest zakreślona.
Zakres (tylko te pliki):

src/core/profile/highlight.ts (nowy): pickHighlight(items) → indicatorId | null
src/view/profile/ProfileIndicatorRow.tsx (tylko: zakreślenie dla wybranego)
src/view/profile/ProfileSheet.tsx (tylko: przekazanie wyniku pickHighlight)
tests/unit/highlight.test.ts (nowy)
docs/sessions/CC7.4c.md

Warunki odbioru:

Wybierany wskaźnik nie-neutralny z najlepszym rankVoivodeship (remis → mniejszy rankNational, dalej kolejność w pliku); wskaźniki neutralne nigdy.
Brak rankingów → null, brak zakreślenia.
Test DOM: w profilu jest dokładnie jedno zakreślenie.
Przy prefers-reduced-motion zakreślenie bez animacji (jak w Annotate).
Bez zmian /design i zrzutów.
