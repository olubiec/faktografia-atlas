# C03 – Audyt układu: powtórzenia, zasłanianie, niespójne okna i menu (21.11.2026)
Zadanie `tasks/W24-C03-audyt-ukladu-i-powtorzen.md`. Bez zmian w kodzie strony. Stan kodu: gałąź z C01 i C02 (okno „Wybierz dane”, wejście do mapy). Zrzuty: `docs/research/c/C03-zrzuty/`, `deviceScaleFactor` 1, skrypt pomiarowy poza repo (scratchpad). Nie jestem w stanie ocenić wyglądu na prawdziwym telefonie; wnioski o układzie opieram na zrzutach Chromium i pomiarze prostokątów.

## Zrzuty
Nazwa: `<ekran>-<szerokość>-<motyw>[-stopka].png`; szerokości 390 (×844), 768 (×1024), 1280 (×800); `overlaps.json` = surowy wynik pomiaru zasłaniania.
| Ekran | Pliki | Motywy |
|---|---|---|
| `/` | `start-{390,768,1280}-{light,dark}.png` | jasny, ciemny |
| `/mapa` bez wyboru | `mapa-{390,768,1280}-{light,dark}.png` | jasny, ciemny |
| `/mapa` z gminą (`u=1217`) | `mapa-gmina-{…}-light.png` | jasny |
| `/mapa` z profilem | `mapa-profil-{…}-light.png` | jasny |
| `/mapa` z oknem „Wybierz dane” (po C01) | `mapa-wybierz-dane-{…}-light.png` | jasny |
| `/rankingi`, `/porownaj`, `/zrodla`, `/prywatnosc` | `<ekran>-{…}-light.png` + `-stopka.png` | jasny |
| `/o-projekcie` | `o-projekcie-{…}-{light,dark}.png` + `-stopka.png` | jasny, ciemny |
Uwaga: `mapa-profil` używa adresu `u=1217&profil=1`; jeśli parametr `profil` nie otwiera profilu, zrzut pokazuje tylko wybraną gminę (patrz `mapa-gmina`). Do sprawdzenia w C08 na podglądzie.

## Zasłanianie
Pomiar: elementy `fixed/sticky/absolute` w widocznej części ekranu, pary o wspólnym polu > 100 px². Szum od wnętrza mapy (canvas, `deck-widget-container`, `svg` kropek) pominięto: to jedna warstwa mapy, nie kolizja interfejsu.
| Ekran · rozmiar | Co zasłania co | Gdzie w kodzie | Ocena |
|---|---|---|---|
| `/mapa` 390 · gmina/profil | Arkusz profilu (`react-modal-sheet-root`, z 9999 w bibliotece) pokrywa mapę prawie całą (390×788), zostaje pasek 56 px z logo i dolny pasek; okruszki „Polska / … / powiat” widać nad mapą | `src/view/profile/ProfileSheetMobile.tsx:106`, `src/view/ui/BottomSheet.tsx:141` | profil zamyka mapę; „Wróć” bywa pod arkuszem |
| `/mapa` 768 i 1280 · gmina | Okruszki/przycisk „Wróć do wyższego poziomu” (93×44) nakładają się na pole mapy (316×84) w lewym górnym rogu | `src/view/map/AtlasMap.tsx` (overlay `top-4`), `src/view/map/*` | przycisk na mapie, nie zasłania danych, ale leży na kropkach miejscowości |
| `/mapa` 390 · bez wyboru | Pasek okruszków (358×48) nad mapą, dolny pasek wyżej o 12 px (po C01) | `src/view/main/MobileIndicatorBar.tsx` (`mb-3`) | po C01 pasek nie dotyka krawędzi; atrybucja mapy nie jest zasłonięta |
| `/mapa` 390 · okno „Wybierz dane” | Okno (`z-[10000]`) przykrywa arkusz (z 9999) i całą mapę; to zamierzone (pełny ekran) | `src/view/data-menu/DataMenuWindow.tsx` | wymaga `z` powyżej arkusza (magiczna liczba, do modułu `Window` w C04) |
| `/mapa` 768/1280 · okno „Wybierz dane” | Okno 100 % ekranu przykrywa nagłówek strony; zamykanie ikoną 44 px w prawym górnym rogu | `DataMenuWindow.tsx`, `src/components/ui/dialog.tsx` | zgodne z poleceniem |
| `/mapa` 390 · okienko miejsca (`UnitTooltip`) | Odstęp 12 px od dolnego paska liczony przez `getBoundingClientRect` (obsługa zgody na analitykę i paska) | `src/view/main/UnitTooltip.tsx:42-85` | działa, ale stała 12 jest zdublowana z `mb-3` paska: wspólny token w C08 |
| `/rankingi`, `/porownaj`, strony tekstowe · wszystkie | Brak zasłaniania w pomiarze (poza paskiem zgody na analitykę, jeśli widoczny) | – | OK |
Wniosek: realne kolizje to (1) profil jako arkusz niemal na cały ekran telefonu, (2) przyciski nad mapą nakładające się na pole mapy, (3) dwie warstwy modalne (arkusz + okno) wymagające ręcznego `z`.

## Powtórzenia
| Ekran | Co się powtarza | Gdzie | Co zostaje |
|---|---|---|---|
| `/mapa` (komputer) | Nazwa wskaźnika w przycisku, w `IndicatorInfo` (nazwa dla czytnika) i podtytuł z rokiem; rok także w suwaku | `src/view/main/IndicatorPanel.tsx` (przycisk, `subtitle`, `YearSlider`) | po C01: nazwa raz (przycisk), rok w przycisku i w suwaku (suwak zostaje) |
| `/mapa` (telefon) | Nazwa wskaźnika w dolnym pasku i w przycisku w arkuszu | `MobileIndicatorBar.tsx` (pasek), `IndicatorPanel.tsx` (przycisk) | pasek zostaje (skrót), przycisk w arkuszu zostaje jako jedyne wejście do okna |
| Wszystkie strony | „Strona główna” i „Mapa” dwa razy w nagłówku (menu komputera i menu telefonu) oraz trzeci raz w stopce; logo także prowadzi na `/` | `src/view/Header.tsx:110-205`, `SiteFooter.tsx:64,97` | nagłówek: logo + 3–4 linki; stopka: tylko linki niewystępujące w nagłówku (C05/C06) |
| Wszystkie strony | Stopka ma 3 kolumny, 7 linków do wskaźników (`/mapa?i=…`) plus linki główne: ok. 15 linków, duża część duplikuje nagłówek | `SiteFooter.tsx:97-185` | skrócić do ok. 6 linków (C06) |
| Wszystkie strony | Link „Biblioteka” w stopce (`/biblioteka`) – strona nie istnieje, to przekierowanie | `SiteFooter.tsx:115`, `App.tsx:73` | usunąć (C06) |
| Profil (`/mapa`) | Linki `/biblioteka/<id>` w wynikach dodawania wskaźnika | `src/view/profile/LibrarySearchPanel.tsx:31` | do B13 (profil), bez zmian w C06 |
| `/` | Trzy kroki w tekście „1. Wybierz dane…” i przycisk „Otwórz mapę” + sekcja przykładów; nagłówek ma też „Mapa” | `StartPage.tsx` | zostaje jeden główny przycisk; „Mapa” w nagłówku zostaje jako nawigacja |

## Spójność
Wspólne cechy sprawdzane: tło `arkusz`, ramka `linia`, `rounded-none`, `shadow-none`, pole dotykowe ≥ 44 px, przycisk zamknięcia, nagłówek okna.
| Komponent | Odchylenie od STYL.md / innych okien | Gdzie w kodzie |
|---|---|---|
| `Dialog` (shadcn) | Zamknięcie 44 px w rogu (`h-11 w-11`), `p-6`, kolory przez `var(--…)` w klasie, własna maska `bg-[var(--tusz)]/40`, `z-50` | `src/components/ui/dialog.tsx` |
| `DataMenuWindow` (C01) | Pełny ekran `h-dvh w-screen`, `p-4 md:p-6`, `z-[10000]` – inne okna mają `z-50` i `max-w-lg`/`max-w-4xl` | `src/view/data-menu/DataMenuWindow.tsx` |
| `DataMenuDialog` (stare) | `max-h-[85dvh] max-w-4xl`; po C01 bez importera (używa tylko własnego pliku) | `src/view/data-menu/DataMenu.tsx:131-142` |
| `BottomSheet` | `shadow-none rounded-none` jawnie (ręcznie), przycisk zamknięcia własny, uchwyt przeciągania | `src/view/ui/BottomSheet.tsx:36,141-166` |
| `Sheet` (panel menu telefonu w nagłówku) | `top-[56px] md:top-[72px]` wpisane na sztywno, `z-30`, `shadow-none` | `src/view/Header.tsx:184` |
| `Popover` (Radix) | `w-80 sm:w-96`, `z-50`, `shadow-none` ręcznie; różne szerokości w trzech miejscach | `src/view/controls/IndicatorPicker.tsx:285`, `src/view/explain/IndicatorInfo.tsx:100`, `src/view/share/AddPageMenu.tsx:88` |
| Arkusz profilu | `Sheet` z `max-w-[440px]` na komputerze, `BottomSheet` na telefonie – dwa różne nagłówki i zamknięcia | `src/view/profile/ProfileSheet.tsx:253`, `ProfileSheetMobile.tsx:106` |
| Nagłówek strony | Wysokość `h-[56px] md:h-[72px]` wpisana na sztywno także w innym pliku (menu) | `src/view/Header.tsx:109,184` |
| Przyciski i linki | Klasy skopiowane w każdym pliku (`min-h-[44px] … focus:ring-2 …`): stopka ×13, start ×6, panel ×5 | `SiteFooter.tsx`, `StartPage.tsx`, `IndicatorPanel.tsx` |

## Gotowce
Co już jest, bez nowych pakietów:
| Potrzeba | Gotowiec | Plik / pakiet | Licencja |
|---|---|---|---|
| Okno / pełny ekran | `Dialog` | `src/components/ui/dialog.tsx` (pakiet `radix-ui`) | MIT |
| Dolny arkusz | `BottomSheet` na `react-modal-sheet` | `src/view/ui/BottomSheet.tsx` | MIT |
| Lista z szukajką | `DataMenu*` (szukajka + działy) | `src/view/data-menu/*` | własne |
| Szukajka | `SearchField` | `src/view/ui/SearchField.tsx` | własne |
| Ikony | `Icon` (iconoir-react) | `src/view/ui/Icon.tsx` | MIT |
| Podpowiedzi, przełączniki, suwak, zakładki | shadcn: `tooltip`, `toggle-group`, `slider`, `tabs`, `popover` | `src/components/ui/*` | MIT |
| Wzorce stron (nagłówek, stopka, sekcje) | shadcn/ui blocks – tylko jako wzór układu (wpis `zweryfikowane` w INSPIRACJE.md), kod piszemy własny | docs/INSPIRACJE.md | MIT |
Kandydaci spoza listy: nie dodawałem żadnych; `cmdk` nie jest zainstalowany (szukajka DataMenu działa na własnym kodzie, więc nie jest potrzebny).

## Moduły wspólne
Propozycja dla C04 (propsy → co zastępuje → szacunek ubytku linii):
| Moduł | Propsy | Zastępuje | Ubytek |
|---|---|---|---|
| `Window` | `title`, `description?`, `mode: 'full' \| 'dialog' \| 'sheet'`, `onClose`, `children` | `DataMenuWindow` (szkielet), `DataMenuDialog`, nagłówki arkuszy profilu i menu telefonu; jedno miejsce na `z` i przycisk zamknięcia | ok. 120 |
| `PageSection` | `title`, `children`, `id?` | powtarzane `section`/`h2`/odstępy na stronach tekstowych, rankingach, porównaniu, stronie startowej | ok. 80 |
| `LinkList` | `items: {to, label}[]`, `variant: 'footer' \| 'menu'` | linki stopki (13 powtórzeń klas) i menu telefonu w nagłówku | ok. 90 |
| `ToolbarButton` | `variant: 'primary' \| 'secondary'`, `as`, `children` | przyciski „Otwórz mapę”, „Pobierz i udostępnij”, przyciski w panelu, chipy przykładów | ok. 60 |
| Stała `bottomGap` | jedna wartość z tokenów skali | `mb-3` paska + `+ 12` w `UnitTooltip` | 2 miejsca → 1 |

## Wniosek
Poprawki wg ekranów; proponowane listy plików „Zmieniaj” (do wpisania w taski przed falą 3):
**C05 – nagłówek i menu telefonu.** Usunąć powtórzone „Strona główna”/„Mapa” (logo + 1 menu), wysokość z tokenu zamiast `h-[56px]`/`top-[56px]`, logo według STYL §4. Zmieniaj: `src/view/Header.tsx` (+ `LinkList` z C04).
**C06 – stopka i odwołania do Biblioteki.** Skrócić stopkę do ok. 6 linków, usunąć „Biblioteka” (`SiteFooter.tsx:115`), usunąć 7 linków do wskaźników; linki na `LinkList`. Zmieniaj: `src/view/layout/SiteFooter.tsx`, `src/view/layout/SiteLayout.tsx` (jeśli stopka tego wymaga).
**C07 – strona `/`.** Jeden przycisk główny, 3 kroki i przykłady na `PageSection`/`ToolbarButton`, logo i kolory ze STYL §2–§5, §12. Zmieniaj: `src/view/start/StartPage.tsx`.
**C08 – panele i okna na mapie.** (1) Profil: jeden szkielet okna dla komputera i telefonu (`Window`, tryb `sheet`), „Wróć” nie pod arkuszem; (2) wspólny odstęp dolny dla paska i `UnitTooltip`; (3) przyciski nad mapą (okruszki, „Wróć do wyższego poziomu”) bez nakładania na pole mapy. Pliki ekranu (`AtlasMap.tsx`, `ProfileSheet*.tsx`) są chronione: potrzebna zgoda właściciela; bez niej C08 ogranicza się do `src/view/main/UnitTooltip.tsx`, `src/view/main/MobileIndicatorBar.tsx`, `src/view/main/IndicatorPanel.tsx`.
Do C04: `Window` rozwiązuje `z` (arkusz 9999 vs okno) w jednym miejscu.
