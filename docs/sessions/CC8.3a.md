# Session CC8.3a: Komponent wyboru wskaźnika, bez podpinania do mapy

## Treść zadania

**Zadanie:** CC8.3a – komponent wyboru wskaźnika, bez podpinania do mapy
**Wymaga na main:** config/indicators.json, src/core/profile/profile.ts#Indicator, src/components/ui/popover.tsx
**Kontekst:** lista 20 wskaźników jest w config/indicators.json (pola id, name, unit, group, description), typ Indicator w src/core/profile/profile.ts. Gotowe prymitywy UI: src/components/ui/ (popover, button, tabs) i src/view/ui/ (Icon, SearchField). Makieta: docs/design/02-mapa-komputer.png (panel wskaźnika). Podpięcie do mapy i adresu robi CC8.W.
**Cel dla użytkownika:** brak zmiany na stronie; gotowy komponent.

**Zakres (tylko te pliki):**
- `src/view/controls/IndicatorPicker.tsx` (nowy)
- `tests/unit/indicator-picker.test.tsx` (nowy)
- `docs/sessions/CC8.3a.md`

**Warunki odbioru:**
1. Lista pogrupowana według group (kolejność grup jak w pliku), przy każdym wskaźniku nazwa i jednostka; wybrany ma aria-selected="true".
2. Pole filtrowania po nazwie (bez polskich znaków też działa: „ludnosc” znajduje „Ludność”); brak wyników → tekst „Brak wskaźnika o tej nazwie”.
3. Obsługa klawiatury: strzałki, Enter wybiera, Escape zamyka; onChange z id (test).
4. Pola dotykowe co najmniej 44 px (klasy), kolory i odstępy tylko z tokenów; najdłuższa nazwa wskaźnika zawija się (test po klasach).
5. NIE dodawaj sekcji do /design i NIE zmieniaj zrzutów wzorcowych.

**Poza zakresem:** podpięcie do mapy i ?i= (CC8.W), suwak lat (CC8.3b).

---

## Przebieg prac

1. Utworzono testy jednostkowe TDD w `tests/unit/indicator-picker.test.tsx` weryfikujące:
   - Grupowanie wskaźników według pola `group` i zachowanie kolejności pierwszego wystąpienia grupy.
   - Renderowanie przycisku wyzwalającego (`IndicatorPicker`) z wybranym wskaźnikiem i wysokością min. 44 px.
   - Renderowanie nazwy, jednostki oraz nagłówków grup.
   - Atrybut `aria-selected="true"` dla wybranego wskaźnika.
   - Filtrowanie po nazwie z normalizacją polskich znaków diakrytycznych (`normalize`).
   - Wyświetlanie tekstu "Brak wskaźnika o tej nazwie" w przypadku braku wyników.
   - Zgodność z wytycznymi dotyczącymi celów dotykowych (min. 44 px) i zawijania tekstu najdłuższych nazw (`whitespace-normal`, `break-words`).
   - Obsługę zdarzeń klawiatury i wywoływanie funkcji `onSelect` / `onChange`.

2. Zaimplementowano komponent `IndicatorPicker` oraz podkomponent `IndicatorPickerContent` w `src/view/controls/IndicatorPicker.tsx`:
   - Wykorzystano istniejący prymityw `Popover` (`src/components/ui/popover.tsx`) oraz ikony `NavArrowDown`, `Check`, `Search` z `iconoir-react`.
   - Zastosowano kolory i typografię z tokenów CSS (`bg-arkusz`, `border-linia`, `text-tusz`, `text-olowek`, `text-korekta`, `bg-kalka`).
   - Zapewniono pełną obsługę celów dotykowych min. 44 px (`min-h-[44px]`).
