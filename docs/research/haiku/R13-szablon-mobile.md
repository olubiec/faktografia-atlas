# Gotowa formatka strony mobilnej: R13.1–R13.5 (podsumowanie sesji)

- Data: 2026-10-27
- Pytania: R13.1–R13.5 (`docs/research/haiku-zlecenia-runda3.md`, grupa B)
- Wykonał: sesja badawcza z dostępem do wyszukiwania i otwierania stron (model nie jest podpisany w pliku)
- Status: **zweryfikowane częściowo** – patrz `docs/research/weryfikacja-runda3.md`
- Zasada: same fakty, bez rekomendacji; „NIEZWERYFIKOWANE” tam, gdzie strony nie otwarto.
- **Uwaga:** pełny plik `szablon-mobile.md` z tej sesji nie został dołączony; poniżej końcowe podsumowanie sesji (przepisane z czatu). Tabele i linki z pełnego pliku – do dołączenia, jeśli będą potrzebne.

---

Zakres sesji: wytyczne oficjalne, repozytoria, biblioteka arkusza.

### Co ustalono (z otwartych stron, z datami)
- **R13.2, Apple HIG „Sheets”:** arkusz może być modalny lub niemodalny; zalecane punkty zatrzymania to `large` i `medium`; uchwyt działa z VoiceOver. Strona zaktualizowana 24.03.2026.
- **R13.3, przeglądarki:** `dvh`/`svh`/`lvh` wspierane od Chrome 108, Firefox 101, Safari 15.4 (web.dev, 29.11.2022). Klawiatura ekranowa nie zmienia „layout viewport” w Safari iOS, więc element `position: fixed` może zostać zasłonięty. Chrome na Androidzie od 108 domyślnie zmienia tylko „visual viewport” (`interactive-widget=resizes-visual`). `overscroll-behavior` nie jest w Baseline (MDN, 13.10.2026).
- **R13.4, react-modal-sheet:** licencja MIT (plik LICENSE), `snapPoints`, w opisie sesji: `Sheet.Scroller` z `draggableAt` (**nieaktualne dla wersji 5.6.0** – patrz weryfikacja). Najnowszy tag v5.6.0; rozbieżność z `package.json` na gałęzi master (2.0.0) – **wyjaśniona** rejestrem npm: aktualna wersja to 5.6.0.
- **R13.5, DWP (GOV.UK, 30.01.2026):** filtry opcjonalne, radio zamiast listy rozwijanej, opcja „Any”, filtry widoczne domyślnie.

### Czego nie ustalono
- **R13.1:** nie znaleziono 6–10 projektów z gotowym układem (mapa + wyszukiwarka + dolny arkusz). Znaleziono głównie biblioteki komponentów MapLibre; ich licencji nie otwarto. **Wynik ujemny: gotowego szablonu dla naszej kombinacji nie ma.**
- **R13.4:** wiarygodnie opisano tylko react-modal-sheet i vaul; rozmiaru po gzip nie podano (bundlephobia się nie otworzyła).
- Wytyczne Material 3 nie dały się odczytać (strona wymaga JavaScript); nie przeszukano GOV.UK, USWDS ani HIG pod kątem wyszukiwarki i filtrów na telefonie.

### Dodane przy weryfikacji (27.10.2026, nasze sprawdzenie)
- Rejestr npm: `react-modal-sheet` **5.6.0**, MIT, peer: `react >=16`, `motion >=11` (w drzewie jest `motion` 14.3.0). `vaul` **1.1.2**, MIT, ostatnia zmiana w rejestrze 14.12.2024.
- Typy zainstalowanej biblioteki (`node_modules/react-modal-sheet/dist/index.d.ts`): `Sheet.Content` ma `scrollRef`, `scrollClassName`, `scrollStyle`, oraz `disableDrag` i `disableScroll` jako funkcje stanu `{ scrollPosition: 'top' | 'bottom' | 'middle', currentSnap }`; `Sheet` ma `detent`, `avoidKeyboard`, `prefersReducedMotion`, `tweenConfig`; `Sheet.useContext().snapTo(index)`. **`Sheet.Scroller` nie istnieje w 5.6.0.**
