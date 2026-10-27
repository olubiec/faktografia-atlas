# Weryfikacja researchu – runda 3 (27.10.2026)
`TRYB: WERYFIKACJA` (WORKFLOW §8.19) na ośmiu załączonych plikach i podsumowaniu jednej sesji: cztery grupy zleceń z `docs/research/haiku-zlecenia-runda3.md`, każda puszczona w dwóch sesjach. Wyniki przyjęte leżą w `docs/research/haiku/` (R9.5-R2.4-R5.4-R11.4.md, R13-szablon-mobile.md, R14.1-R14.3.md, R15.1-R15.3.md).

## 1. Które pliki przyjęte, które odrzucone
Pliki nie są podpisane modelem; rozróżnienie wynika z treści.

| Grupa | Przyjęte | Odrzucone | Powód |
|---|---|---|---|
| A (runda 2) | `e8287177` | `a52646f7` | w odrzuconym każde wywołanie Pythona kończy się błędem rozwiązywania nazw (brak sieci); raportu z wynikami nie ma |
| B (R13) | podsumowanie sesji (pełny plik nie dołączony) | `e37de801`, `238fc92b` (ten sam tekst) | sesja bez sieci; tabele z „stan na 2026” zamiast dat, licencje bez dowodu, pola ostatniego wydania i zgłoszeń puste; za „szablony” podano biblioteki arkusza i przykłady na Mapbox/Ember |
| C (R14) | `4eedf07f` | `dbc554ca` | w odrzuconym wszystkie wywołania sieciowe nie powiodły się, raportu nie ma |
| D (R15) | `d28c05e9` | `51522aab` | odrzucony wpisuje „Brak” w wielu komórkach bez otwierania stron (reguła zlecenia: brak elementu na stronie startowej nie dowodzi jego nieobecności); „5–7 klas” przypisane Chartability, którego strony sesja z siecią nie mogła otworzyć |

**Reguła na przyszłość:** raport z sesji, w której narzędzia sieciowe zwracają błędy (rozwiązywanie nazw, brak połączenia), odrzucamy w całości; nie dopisujemy z niego „faktów”. Taki raport może najwyżej podsunąć nazwy kandydatów do sprawdzenia. Szeroki research modelem z dostępem do internetu (w dowolnej firmie) jest uzupełnieniem, nie zamiennikiem drugiego: gdy jedna sesja nie może otworzyć strony (robots.txt na stat.gov.pl, strony wymagające JavaScript, domeny spoza listy), druga może – ale wynik zawsze sprawdzamy.

## 2. Co sprawdziłem sam (27.10.2026)
Rejestr npm (`npm view`) i typy zainstalowanej biblioteki.

| Pakiet | Wersja | Licencja | Peer React | Ostatnia zmiana w rejestrze |
|---|---|---|---|---|
| react-modal-sheet | 5.6.0 | MIT | `>=16` (+ peer `motion >=11`) | 27.03.2026 |
| vaul | 1.1.2 | MIT | do 19 | 14.12.2024 |
| motion | 14.7.1 | MIT | 18 / 19 | 27.10.2026 |
| animejs | 4.5.0 | MIT | – | 17.08.2026 |
| gsap | 3.15.0 | własna „Standard no charge” (nie z listy otwartych) | – | 13.04.2026 |
| rough-notation | 0.5.1 | MIT | – | 16.05.2022 (nieutrzymywany) |
| @formkit/auto-animate | 0.10.0 | MIT | – | 10.07.2026 |
| @lottiefiles/dotlottie-react | 0.20.0 | MIT | 17–19 | 06.10.2026 |
| @rive-app/react-canvas | 4.37.1 | MIT | do 19 | 22.10.2026 |
| workbox-window | 7.4.1 | MIT | – | 04.05.2026 |

Poprawki do raportów: Motion ma dziś wersję 14.7.1 (raport podawał 12.x); `Sheet.Scroller` z `draggableAt` **nie istnieje** w react-modal-sheet 5.6.0 – odpowiednikiem są `disableDrag`/`disableScroll` jako funkcje stanu `{ scrollPosition, currentSnap }` w `Sheet.Content`; **`motion` jest już w drzewie zależności** (peer `react-modal-sheet`), więc jego użycie w animacjach nie dokłada nowej biblioteki (ale wymaga dopisania do `package.json`, bo W0.1 usunął bezpośrednią zależność, a test `dependencies.test.ts` jej pilnuje).
Nie udało się: strony poza listą dozwolonych (deck.gl, MapLibre, OpenFreeMap, Cloudflare) i prywatne repozytoria (ColorBrewer, Workbox) nie były dostępne w tej sesji – te twierdzenia zostają „z raportu”.

## 3. Wynik po zleceniach
| Zlecenie | Wynik | Skutek dla planu |
|---|---|---|
| R9.5 | hasła znalezione dla 6 z 15 wskaźników (share-65plus 3958, median-age 3925, avg-wage 693, library-readers-per-1000 49, tourist-nights-per-1000 1233, cars-per-1000 1125); razem z pierwszą rundą 11 z 20. Bez hasła GUS: population, unemployed-share-working-age, income-per-capita, spending-per-capita, regon-per-10k, dwellings-per-1000, dwelling-area-per-person, sewerage-share, preschool-3-6. Lista haseł GUS zablokowana przez robots.txt | W1.9 (teksty objaśnień) ma źródło dla 11 wskaźników; dla 9 teksty z innego źródła – zlecenie R9.6 (niżej). Nie blokuje F10 |
| R2.4 | dokumentacja OpenMapTiles nie opisuje, kiedy `name:pl` jest wypełniane; OpenFreeMap tego nie opisuje; pole `name:pl` nie widnieje na liście pól schematu | nierozstrzygnięte w dokumentacji → sprawdzamy wprost na kafelkach w spike W3.7 |
| R5.4 | OpenFreeMap wymienia style Positron, Bright, Liberty, Dark, Fiord; czy Dark używa tych samych kafelków co Positron – NIEZWERYFIKOWANE; kopia repozytorium sugeruje, że style poza Liberty nie są utrzymywane przez autora źródła; `setPaintProperty` to oficjalnie wspierany sposób (przykład MapLibre, 25.06.2025) | do spike W3.7: pobrać JSON stylu Dark i porównać źródła kafelków |
| R11.4 | CORS na własnej domenie R2: wystarczy polityka CORS w zasobniku (Cloudflare, 23.09.2026), po zmianie wyczyścić cache; kompresja JSON – brak potwierdzenia; nowsze AWS CLI (od 2.23) wysyłają sumy kontrolne, których R2 mogło nie przyjmować – obejście `request_checksum_calculation = when_required` (źródło zewnętrzne, 2025) | „próba R2” na koncie zostaje; nic do zmiany w planie |
| R13 | gotowego szablonu strony mobilnej dla React 19 + Tailwind 4 + MapLibre **nie ma**; elementy: `react-modal-sheet` (MIT) ma gotowe opcje przewijania/przeciągania, `snapTo`, `prefersReducedMotion`, `avoidKeyboard`; wytyczne: niemodalny arkusz, gdy tło ma zostać aktywne | **nowe zadanie W2.38** (fala F10): poprawa układu arkusza i przycisk zamiast przeciągania. Szablonu nie podmieniamy |
| R14 | brak gotowego zasobu animacji z potwierdzoną licencją; deck.gl `transitions` (czas, easing, `enter`) i MapLibre `essential` (omija redukcję ruchu) opisane; opóźnienia między jednostkami (stagger) w dokumentacji brak; krzywa `cubic-bezier(0.2, 0, 0, 1)` zgodna z opisem Material 3 (źródło wtórne) | bez zmian w kodzie; opcjonalne R14.4 przed W3.5 |
| R15 | audyt 9 serwisów (głównie elementy „jest”); dostępność: WCAG 2.5.7 wymaga alternatywy dla przeciągania, 2.5.8 minimum 24 px (nasze 44 px to więcej), 1.4.11 kontrast 3:1 (wyjątek, gdy ta sama informacja jest w tekście lub tabeli); telefon: Web Share z plikami, PWA bez wymaganego service workera, brak automatycznego monitu instalacji na iOS | alternatywa dla przeciągania trafia do W2.38; reszta – lista kandydatów niżej, do decyzji |

## 4. Kandydaci z audytu (do decyzji właściciela – nic nie dodano do planu)
Co mają inne atlasy, a my (na dziś) nie: rozkład wartości (histogram) w legendzie i porównanie z sąsiadami (Regionalatlas Destatis); kod osadzania mapy (Census Reporter); deklaracja dostępności (5 z 9 serwisów) i kanał zgłaszania błędów (6 z 9) widoczne w interfejsie; widoczna data aktualizacji danych (BDL, Census Reporter, OWID); przycisk „Znajdź mnie”; instalacja jako aplikacja (PWA). Mamy już: ranking, porównanie, udostępnianie, objaśnienia (W1.9 w kolejce), tryb ciemny interfejsu (mapa – W3.7). Przegląd przy okazji „Później” po K7.

## 5. Zlecenia opcjonalne (runda 4) – żadne nie blokuje F10
- **R9.6** źródło definicji dla 9 wskaźników bez hasła w słowniku GUS (np. opis zmiennej w BDL: metadane zmiennej/„Opis”, zeszyty metodologiczne GUS) + licencja tekstów. Przed W1.9.
- **R14.4** deck.gl 9.x: dokumentacja `transitions` (opóźnienie per obiekt, wydajność przy ok. 2 500 wielokątach); MapLibre: sekcja `setPaintProperty`. Przed W3.5.
- **R5.5 / R2.5** w spike W3.7 zamiast zlecenia: pobrać JSON stylu Dark i dekodować próbkę kafelka (pole `name:pl`).
