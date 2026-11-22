import { escapeAttr, escapeHtml as h } from './html';
import { OG_IMAGE_PATH, SITE_URL } from './site';

export interface DocumentOptions {
  title: string;
  description: string;
  url: string;
  noindex?: boolean;
  cssHrefs: string[];
  /** Gotowe znaczniki <script type="application/ld+json"> (z serializeLd). */
  ld?: string[];
  /** Zawartość <main> (już zabezpieczona przez escapeHtml). */
  main: string;
}

/** Wspólna rama statycznych stron SEO: nagłówek z logo, stopka z linkami i źródłem. */
export function renderDocument(o: DocumentOptions): string {
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="/theme-init.js"></script>
<title>${h(o.title)}</title>
<meta name="description" content="${escapeAttr(o.description)}">
<link rel="canonical" href="${escapeAttr(o.url)}">
${o.noindex ? '<meta name="robots" content="noindex,follow">' : ''}
<link rel="icon" type="image/svg+xml" href="/brand/faktografia-favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Faktografia">
<meta property="og:locale" content="pl_PL">
<meta property="og:title" content="${escapeAttr(o.title)}">
<meta property="og:description" content="${escapeAttr(o.description)}">
<meta property="og:url" content="${escapeAttr(o.url)}">
<meta property="og:image" content="${escapeAttr(SITE_URL + OG_IMAGE_PATH)}">
<meta name="twitter:card" content="summary_large_image">
${o.cssHrefs.map((c) => `<link rel="stylesheet" href="${escapeAttr(c)}">`).join('\n')}
${(o.ld ?? []).join('\n')}
</head>
<body class="bg-kalka text-tusz">
<header class="border-b border-linia"><div class="mx-auto max-w-3xl px-4 py-3"><a href="/" class="inline-flex min-h-11 items-center"><img src="/brand/faktografia-logo-granat.svg" alt="Faktografia" height="40" class="h-10 w-auto"></a></div></header>
<main class="mx-auto max-w-3xl px-4 py-6">
${o.main}
</main>
<footer class="mx-auto max-w-3xl px-4 py-6 text-sm text-olowek border-t border-linia"><p>Źródło: GUS, Bank Danych Lokalnych, licencja CC BY 4.0</p><p class="mt-1"><a class="underline" href="/miejsca">Miejsca</a> · <a class="underline" href="/zrodla">Skąd są dane</a> · <a class="underline" href="/o-projekcie">O projekcie</a></p></footer>
</body>
</html>
`;
}
