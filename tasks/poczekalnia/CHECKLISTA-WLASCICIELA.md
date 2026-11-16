# Checklista właściciela – podgląd Vercel z telefonu

Źródła: NOC-RAPORT.md, AUDYT-BEZPIECZENSTWO/DANYCH/SEO/TESTOW/UX-A11Y.md, KONCEPTY-ROZWOJU.md.
Jak czytać: najpierw „Zrób", potem „Spodziewaj się", na końcu „Jeśli inaczej". Wynik zapisuj jako OK / NIE OK (+ zrzut ekranu). Gdy coś jest NIE OK, nie naprawiaj sam: wyślij zrzut i numer kroku.

Przed startem: otwórz najnowszy podgląd z Vercel (Deployments → ostatni zielony → Visit). Najlepiej w Chrome na telefonie, raz w karcie prywatnej (pierwsze wejście), raz w zwykłej.

## Część 1. Szybkie wejście (5 minut)

1. **Strona główna.** Zrób: otwórz link podglądu przez sieć komórkową. Spodziewaj się: kolorowa mapa w ok. 3 sekundy, krótkie rysowanie granic; dotknięcie ekranu przerywa rysowanie. Jeśli inaczej: zapisz, ile sekund trwało, i wyślij zrzut.
2. **Odświeżenie.** Zrób: odśwież stronę w tej samej karcie. Spodziewaj się: mapa od razu, bez rysowania granic. W nowej karcie rysowanie wraca. Jeśli inaczej: opisz, co zobaczyłeś.
3. **Pasek zgody.** Zrób: w karcie prywatnej wejdź na stronę. Spodziewaj się: pasek zgody, w którym „Nie" jest tak samo widoczne jak „Zgadzam się", nie zasłania dolnego paska wskaźnika. Jeśli inaczej: zrzut.
4. **Dotknij gminę na mapie.** Spodziewaj się: arkusz profilu wysuwa się nisko, mapa nad nim dalej widoczna. Przeciągnij arkusz w górę i w dół; paski nie powinny wychodzić poza ekran. Jeśli inaczej: zrzut, numer kroku.
5. **Przewiń palcem poza mapą**, nad dolnym paskiem wskaźnika. Spodziewaj się: cała strona się nie przesuwa, dolny pasek jest cały widoczny. Obróć telefon i wróć: nadal tak samo.
6. **Ciemny motyw.** Zrób: przełącz motyw w nagłówku. Spodziewaj się: mapa i kolory ciemne, granice wyraźnie jaśniejsze od tła, górny pasek przeglądarki ściemnia się. Jasny motyw wygląda jak wcześniej.

## Część 2. Strony i menu

7. **Menu telefonu** (ikona w nagłówku). Spodziewaj się: Mapa, Rankingi, Biblioteka itd. Klikanie daje lekkie rozmycie przejścia (fade). Jeśli w telefonie masz włączone „ograniczenie ruchu", przejść nie ma. Uwaga: linków Kontakt i Zastrzeżenie w menu i stopce jeszcze nie ma (czeka decyzja D3), więc ich brak jest OK.
8. **/kontakt.** Zrób: dopisz do adresu /kontakt. Spodziewaj się: autor, link mailto i link do zgłoszeń na GitHubie; krótka pusta chwila przy ładowaniu jest OK. Jeśli inaczej: zrzut.
9. **/zastrzezenie.** Spodziewaj się: tekst o danych GUS BDL, licencji CC BY 4.0 i braku gwarancji, link do /kontakt.
10. **/prywatnosc.** Spodziewaj się: 8 numerowanych sekcji, adres kontaktowy, przycisk „Cofnij zgodę" działa. Jeśli inaczej: zrzut.
11. **Zły adres** (np. /nie-ma-takiej). Spodziewaj się: strona 404 z linkiem do strony głównej. Uwaga: to zwykły ekran aplikacji, nie prawdziwy kod 404 (decyzja D2).
12. **Stopka, data danych.** Zrób: zjedź na sam dół dowolnej strony. Spodziewaj się: pod linijką CC BY 4.0 napis „Dane GUS odświeżone: 19.10.2026" (jedna data dla wszystkich wskaźników). Po 60 dniach dopisek „(dane mogą być nieaktualne)". Jeśli inaczej: zrzut.
13. **Biblioteka** (/biblioteka). Spodziewaj się: pierwsze 20 kart, same gotowe, przycisk „Pokaż wszystkie (N)"; /biblioteka?q=ludnosc filtruje; brak przewijania w poziomie. Jeśli inaczej: zrzut i adres.
14. **Rankingi** (/rankingi). Spodziewaj się: listy działają. Uwaga: listy Dział/Wskaźnik/Poziom/Rok i wyszukiwarka na tej stronie są dopiero w planie, więc ich brak nie jest błędem.

## Część 3. Dane (najważniejsze dla wiarygodności)

15. **Wychowanie przedszkolne.** Zrób: wskaźnik „Wychowanie przedszkolne", ostatni rok, „Najwyżej". Spodziewaj się: jeśli któraś jednostka ma ponad 100 %, jest wyjaśnienie. Sprawdź gminę 2417052 w profilu: wykres lat, rok 2014 = 203,6 %. Jeśli ponad 100 % bez wyjaśnienia: zapisz jednostkę (to znane niedociągnięcie danych).
16. **Mediana wieku.** Zrób: przesuń suwak lat. Spodziewaj się: czy sięga 2026 i czy gminy Stanisławów, Małkinia Górna i Staroźreby są szare. Porównaj z „Gęstością zaludnienia", która kończy się na 2025. Zapisz, co widzisz.
17. **Wskaźniki tylko powiatowe.** Zrób: poziom „Gminy" przy Przeciętne wynagrodzenie, Noclegi, Samochody, Stopa bezrobocia. Spodziewaj się: komunikat, że dane są tylko dla powiatów. Jeśli brak: zapisz, który wskaźnik.
18. **Wyszukiwarka.** Wpisz „Bolesławiec", „Wąsosz", „Janów". Spodziewaj się: da się odróżnić gminy (miasto/wieś). Wpisz „Janów Podlaski", „Stanisławów", „Branice": mają się znaleźć miejscowości.
19. **Liczby.** Ludność gminy ≥ 1 000: spacja jako separator tysięcy, liczba nie łamie się od jednostki w wąskiej kolumnie. Przyrost naturalny: przecinek i prawdziwy minus (−), nie dywiz.
20. **Objaśnienia wskaźników.** Zrób: profil → rozwiń wskaźnik. Spodziewaj się: „Co to jest", „Jak czytać" i link „Definicja GUS". Kliknij ten link dla: Dochody, Wydatki, REGON, Mieszkania, Kanalizacja, Przedszkola, Bezrobotni (udział). Czy trafia na konkretne hasło, czy na ogólny słownik? Zapisz, które są ogólne (linki nie były sprawdzone w sieci).
21. **Nazwy wskaźników.** Czy „(%)" w nazwie nie dubluje się z „%" przy liczbie.

## Część 4. Prywatność i udostępnianie

22. **Cofnięcie zgody.** Zrób: karta prywatna → „Zgadzam się" → wyszukaj „Kraków" → Stopka › Prywatność → „Cofnij zgodę" → wróć i wyszukaj „Gdańsk". Spodziewaj się: w PostHogu (Live events) nie ma „Gdańsk". Uwaga: dziś „Gdańsk" prawdopodobnie jeszcze się pojawi (wyłączenie analityki po cofnięciu zgody czeka na osobne zadanie). Jeśli się pojawi: zapisz to jako „znane, do naprawy" i nie panikuj.
23. **Dane w przeglądarce.** Zrób: po „Zgadzam się" otwórz Narzędzia deweloperskie (na komputerze) → Local Storage. Spodziewaj się: brak kluczy zaczynających się od ph_. Po wpisaniu frazy w wyszukiwarkę w Network jest wywołanie do eu.i.posthog.com.
24. **Podgląd linku.** Zrób: wyślij sobie link w Messengerze/WhatsAppie. Spodziewaj się: tytuł i opis. Obrazka jeszcze nie będzie (brak PNG 1200×630, decyzja D6), więc brak obrazka to znany stan. Wyślij też link do konkretnej gminy: karta jest dziś ogólna, to też znane.
25. **Pliki techniczne.** Otwórz /robots.txt, /sitemap.xml, /site.webmanifest. Spodziewaj się: tekst lub XML, nie strona aplikacji. W sitemap ma być 9 adresów (7 tras + /kontakt + /zastrzezenie).

## Część 5. Panele i konfiguracja (robisz raz, najlepiej na komputerze)

26. **Vercel → Settings → Environment Variables.** Dodaj VITE_POSTHOG_KEY (Production i Preview), potem Redeploy. Bez tego analityka nie działa.
27. **PostHog.** Włącz „Discard client IP data", wyłącz Session replay, sprawdź okres przechowywania zdarzeń (polityka mówi „zgodnie z ustawieniami usługi").
28. **Vercel – region logów.** Sprawdź region projektu; polityka prywatności pisze ogólnie „także poza UE". Jeśli region jest w UE, można to doprecyzować.
29. **GitHub → Settings → General → „Allow auto-merge".** Włącz; bez tego nocny pobór danych nie scali się sam.
30. **GitHub → Pull requests → PR #451 (data/nightly).** Scal albo sprawdź, czemu auto-merge nie zadziałał. Potem Actions → „Fetch data" → Run workflow i sprawdź, czy pojawia się PR „Dane GUS: odświeżenie RRRR-MM-DD" z auto-merge.
31. **Google Search Console** (domena faktografia.eu, weryfikacja rekordem DNS TXT). Mapy witryn → dodaj https://faktografia.eu/sitemap.xml → status „Sukces". Sprawdź adres /kontakt: jeden canonical. Po 2–4 tygodniach zajrzyj w Skuteczność.
32. **Podglądy linków (komputer).** Facebook Sharing Debugger i LinkedIn Post Inspector: wklej adres strony. Dopóki nie ma PNG 1200×630, obrazka nie będzie.

## Część 6. Dla czytnika ekranu i klawiatury (opcjonalnie)

33. **VoiceOver/TalkBack.** Dotknij gminę, przesuń na przycisk nad arkuszem. Spodziewaj się „Rozwiń, zwinięty" i nazwy arkusza z nazwą gminy. Dziś może być samo „Rozwiń": znane.
34. **Klawiatura (komputer).** Tab po zakładkach profilu i przełączniku Woj/Pow/Gmi: fokus wyraźnie widoczny także na zaznaczonym przycisku. Alt+1/2/3 przełącza poziom woj/pow/gmi. Klawisze + i − (zoom) jeszcze nie działają: znane.

## Znane braki (nie zgłaszaj jako błędów)

- Brak PNG do podglądu linków i do instalacji na telefonie (OG 1200×630, ikony 192 i 512).
- Brak linków Kontakt i Zastrzeżenie w stopce i menu (D3).
- Nieznany adres daje ekran 404 z kodem 200 (D2); dla wyszukiwarek jest tag noindex.
- Cofnięcie zgody nie zatrzymuje analityki w otwartej karcie (krok 22).
- Zoom klawiszami + i − nie jest podpięty do mapy.
- Eksport kart w wysokiej rozdzielczości: logika gotowa, w interfejsie jeszcze nie ma przycisku.
- Trzy testy e2e mogą być czerwone: home „loads properly" (za szeroki selektor logo), library-search „1 żądanie index.json" (po cofnięciu adres traci k=1), plus kilka kruchych testów z AUDYT-TESTOW. To nie wpływa na wygląd strony.

---

# Decyzje do podjęcia

Dla każdej: wybierz A lub B (albo napisz „pomiń"). Domyślna propozycja jest w nawiasie.

**D1. Trasy testowe /__test/* i /design w produkcji.** (Zadanie P2-D zablokowane; audyt bezpieczeństwa P2-2.)
- A: pozwalam zmienić konfigurację testów (playwright.config.ts i CI), żeby te trasy były tylko w trybie testowym. (propozycja)
- B: zostawiamy jak jest, trasy zostają publiczne.

**D2. Prawdziwy kod 404 dla błędnych adresów.** (P2-F zablokowane.)
- A: tylko znane trasy i zwykła strona 404 Vercela.
- B: to samo plus własny plik 404.html (osobna prosta strona).
- C: zostawiamy jak jest (kod 200 + noindex). (propozycja na teraz, najmniej ryzyka)

**D3. Linki Kontakt i Zastrzeżenie w stopce i menu.** (P2-E zablokowane: wymaga zmiany dwóch istniejących testów.)
- A: zgoda na zaktualizowanie tych dwóch testów (17 → 19 linków w stopce, 6 → 8 w menu). (propozycja)
- B: bez linków, strony dostępne tylko z adresu.

**D4. Obraz do podglądu linków i ikony aplikacji.**
- A: dostarczam PNG 1200×630 oraz ikony 192 i 512 (albo zlecam wygenerowanie z logo). (propozycja)
- B: zostajemy z SVG; podglądy linków bez obrazka.

**D5. Test logo na stronie głównej** (selektor łapie logo w nagłówku i stopce).
- A: zgoda na poprawienie selektora w teście. (propozycja)
- B: usuwamy logo ze stopki.

**D6. Cofnięcie zgody a analityka.**
- A: zlecam zadanie: po cofnięciu zgody analityka zatrzymuje się od razu (wymaga zmiany w pliku zgody). (propozycja)
- B: zostaje jak jest, działa po odświeżeniu.

**D7. Pierwsza fala rozwoju (KONCEPTY-ROZWOJU).**
- A: „Odpowiedzi szybciej": wyszukiwanie naturalne, co się zmieniło, karta zmiany w czasie. (propozycja autora)
- B: najpierw porządki (testy, dług stylu, dostępność z listy N-*).

**D8. Osadzanie mapy na cudzych stronach.**
- A: tak, zgoda na zmianę nagłówków w vercel.json tylko dla /osadz; wcześniej sprawdzam warunki Vercel Hobby (użytek niekomercyjny).
- B: nie teraz.

**D9. Kanał Atom (powiadomienia o nowych danych) i tryb offline (PWA).**
- A: tak, zgoda na zmiany w scripts/data i vite.config.ts oraz nowy pakiet.
- B: nie teraz.

**D10. Tryb edukacyjny „Zgadnij, gdzie".**
- A: ja akceptuję teksty pytań, zaczynamy.
- B: odkładamy.

**D11. Nocny pobór danych a auto-merge.**
- A: włączam „Allow auto-merge" i reguły gałęzi, PR-y z danymi scalają się same. (propozycja)
- B: scalam PR-y z danymi ręcznie.

**D12. Zaostrzenie bezpieczeństwa (AUDYT-BEZPIECZENSTWO P1-1, P2-1, P2-3).** Akcje GitHub przypięte do SHA, ciaśniejsza CSP, mniejsze uprawnienia workflowów. Wymaga zmian w .github/workflows i vercel.json.
- A: zgoda na zadanie z tymi zmianami. (propozycja)
- B: odkładamy.
