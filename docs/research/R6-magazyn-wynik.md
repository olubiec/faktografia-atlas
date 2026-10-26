# R6 – magazyn danych biblioteki GUS: wynik weryfikacji (25.10.2026)
Źródło: raport Gemini Deep Research (do 40 000 plików JSON, bez własnego backendu). Weryfikacja: Claude, 25.10.2026.

## Przyjęte do decyzji
- **Docelowo Cloudflare R2**: 10 GB bezpłatnie, potem 0,015 USD za GB-miesiąc, transfer wychodzący bezpłatny (cennik potwierdzony drugim źródłem; strony Cloudflare nie były dostępne dla narzędzia – **sprawdź na stronie cennika przed założeniem konta**).
- Rozmiar danych biblioteki mieści się w darmowym limicie (szacunek: setki MB do kilku GB – po pierwszym pełnym przebiegu zmierzyć).
## Niepotwierdzone / do sprawdzenia
- Limity zapytań do R2 i zachowanie CORS dla publicznego zasobnika – niezweryfikowane.
## Decyzja
- **Tymczasowo:** gałąź `data/library` w repo, adres w jednym miejscu (`VITE_LIBRARY_BASE`). **Docelowo:** R2; przejście = zmiana adresu, bez zmian w kodzie stron.
- Konto R2, zasobnik i klucze zakłada Właściciel dopiero gdy gałąź przestanie wystarczać (rozmiar lub limity raw.githubusercontent). Klucze tylko w GitHub Secrets.
