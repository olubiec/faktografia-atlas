# S03 – Pełne meta na każdej stronie: adres kanoniczny, obrazek do udostępnień, karta X
Fala pliku: W25 (SEO). Fala budowy: S-1 (po S01). Zastępuje: tasks/skreslone/W18-P04.
Cel: Każda strona aplikacji ma jeden tytuł, jeden opis, adres kanoniczny bez parametrów, `og:image` 1200×630 z logo i kartę `summary_large_image`; link wklejony w Messengerze/X/LinkedIn pokazuje obrazek.
Zmieniaj: src/core/seo/site.ts, src/view/layout/PageMeta.tsx, scripts/seo/og-image.mjs, public/og/faktografia.png, tests/unit/s03-page-meta.test.tsx
Wymagane: tests/unit/s03-page-meta.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/SEO.md (D1, D6), src/view/layout/PageMeta.tsx, src/view/layout/SiteLayout.tsx, index.html (`data-fallback` z S01), public/brand/, config/tokens.json
Zadanie:
1. `src/core/seo/site.ts`: `SITE_URL = 'https://faktografia.eu'` (D1), `absoluteUrl(path)`, `canonicalFor(pathname)` (bez parametrów i bez `/` na końcu, poza `/`).
2. PageMeta: kanoniczny adres domyślnie z bieżącej ścieżki; `og:url`, `og:image` (absolutny), `og:image:width/height`, `og:locale`, `twitter:card`; prop `noindex` → `<meta name="robots" content="noindex,follow">`. Po pierwszym renderze usuń z `<head>` elementy `[data-fallback]` (żeby nie było dwóch opisów).
3. `scripts/seo/og-image.mjs`: Playwright (już zainstalowany) renderuje 1200×630: logo z `public/brand/`, hasło ze strony startowej, kolory z `config/tokens.json`; zapis do `public/og/faktografia.png` (≤ 150 KB). Plik PNG dodajesz do repo.
Gotowe, gdy:
- Test (render PageMeta): dokładnie jeden `<title>`, jeden `meta[name=description]`, `link[rel=canonical]` = `https://faktografia.eu/o-projekcie` dla `/o-projekcie?x=1`; `og:image` zaczyna się od `https://`; `noindex` daje meta robots.
- Test: `canonicalFor('/mapa/')` = `https://faktografia.eu/mapa`, `canonicalFor('/')` = `https://faktografia.eu/`.
- Test: public/og/faktografia.png ma wymiary 1200×630 (odczyt nagłówka PNG) i ≤ 150 KB.
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku: Link do Faktografii wklejony w komunikatorze pokazuje obrazek z logo i opis; każda strona mówi Google, który adres jest „właściwy”. Sprawdź: wklej link podglądu w Messengerze lub w https://www.opengraph.xyz.
Tytuł PR zaczyna się od `[W25-S03]`; gałąź `claude/W25-S03` od `origin/main`; nie scalaj.
