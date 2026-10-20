# CC7.2b – wybranie jednostki na mapie otwiera profil

Zadanie: CC7.2b – wybranie jednostki na mapie otwiera profil
Wymaga na main: src/view/map/hooks/useChoropleth.ts#useChoropleth, src/view/profile/ProfileSheet.tsx#ProfileSheet, src/view/profile/ProfileSheetMobile.tsx#ProfileSheetMobile, src/core/data/load-values.ts#loadIndicatorValues
Kontekst: arkusze profilu są gotowe: ProfileSheet (komputer, props { profile, units, onClose }) i ProfileSheetMobile (telefon, props { profile, units, isOpen, onClose }) w src/view/profile/. Profil liczy buildProfile(teryt, indicators, valuesById, units) z src/core/profile/profile.ts; wartości wczytuje loadIndicatorValues (src/core/data/load-values.ts). Wybór jednostki: useMapSelection (src/view/map/hooks/). W src/view/Home.tsx jest pusty kontener <div data-slot="side" /> na arkusz. Próg telefonu: breakpoints.tablet = 768 px w config/tokens.json.
Cel dla użytkownika: kliknięcie gminy (albo wybór w Ctrl+K) otwiera po prawej arkusz z jej wskaźnikami; na telefonie arkusz wysuwa się od dołu. Zamknięcie arkusza nie zmienia wyboru na mapie.

Zakres:
- src/view/map/hooks/useProfile.ts (nowy): wczytuje wartości wszystkich 20 wskaźników równolegle po pierwszym wyborze, liczy buildProfile
- src/view/map/ProfilePortal.tsx (nowy): createPortal do [data-slot="side"], wybór wersji wg szerokości ekranu
- src/view/map/AtlasMap.tsx (tylko: render ProfilePortal)
- src/core/map/test-seam.ts (tylko: pole profileOpen: boolean)
- tests/e2e/profile.spec.ts (nowy; wartości syntetyczne w samym pliku testu, podawane przez page.route('/data/values/*.json'))
- docs/sessions/CC7.2b.md

Warunki odbioru:
- /?e2e&u=1217011 → widoczny arkusz z nazwą „Zakopane” i window.__atlas.profileOpen === true.
- Przycisk zamknięcia i Escape zamykają arkusz (profileOpen false), ?u= zostaje.
- Szerokość 390 px → wersja telefonu (ProfileSheetMobile), 1440 px → komputer (test e2e na obu rozmiarach).
- Brak plików wartości → arkusz z komunikatem o braku danych, bez błędu w konsoli.
- Istniejące e2e przechodzą bez zmian.
