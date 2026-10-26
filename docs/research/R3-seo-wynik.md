# R3 – SEO podstron gmin: wynik weryfikacji (25.10.2026)
Źródło: raport Gemini Deep Research (2500 statycznych podstron gmin w Vite + React na Vercel). Weryfikacja: Claude, 25.10.2026.

## Błędna teza raportu
- „Limit 2048 routes blokuje 2500 podstron” – **fałsz**. Wg dokumentacji Vercel limit dotyczy reguł z `vercel.json` (rewrites, redirects, headers) i trasy Build Output API, nie plików statycznych w katalogu wyjściowym.
## Co zostaje z raportu
- Sama SPA bez prerenderingu słabo się indeksuje; dla podstron gmin potrzebny byłby prerendering albo SSG.
- Ryzyko jakości: tysiące podobnych stron z samych liczb wyszukiwarki mogą uznać za treści masowe o małej wartości („scaled content abuse”) – wymaga unikalnej treści na stronie.
## Decyzja
**Odłożone** na po K7. Najpierw biblioteka i uwagi z oglądu; potem osobny research z oceną prerenderingu i unikalnej treści na stronę. Nic w kodzie się nie zmienia.
