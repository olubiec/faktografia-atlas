// Wspólna ramka statycznych stron (nagłówek z menu i stopka jak w aplikacji, W26-F04+): bez JavaScriptu.
// Klasy Tailwind z tokenów; wszystkie napisy to stałe, więc nie ma tu danych do escapowania poza adresami i nazwami linków.
import { escapeAttr as attr, escapeHtml as text } from './html';

export const LOGO_LINK =
  '<a href="/" aria-label="Faktografia – strona główna" class="flex min-h-[44px] shrink-0 items-center">' +
  '<img src="/brand/faktografia-logo-granat.svg" alt="Faktografia" class="logo-na-jasnym relative -top-1.5 md:-top-2 h-10 md:h-12 w-auto -ml-3 md:-ml-3.5">' +
  '<img src="/brand/faktografia-logo-jasne.svg" alt="" aria-hidden="true" class="logo-na-ciemnym relative -top-1.5 md:-top-2 h-10 md:h-12 w-auto -ml-3 md:-ml-3.5"></a>';

const NAV_LINK = 'inline-flex min-h-[44px] items-center text-sm text-tusz underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-tusz';
const nav = (label: string, items: readonly (readonly [string, string])[], cls: string) =>
  `<nav aria-label="${attr(label)}"><ul class="${cls}">${items.map(([href, name]) => `<li><a href="${attr(href)}" class="${NAV_LINK}">${text(name)}</a></li>`).join('')}</ul></nav>`;

/** Nagłówek jak w aplikacji: logo, menu główne (Start, Mapa, Miejsca, Zestawienia) ; szukajka i przełącznik motywu wymagają aplikacji, więc ich tu nie ma (motyw wybrany w aplikacji obowiązuje, patrz theme-init.js). */
export const HEADER = `<header class="relative z-20 flex h-14 md:h-18 shrink-0 items-center justify-between gap-2 border-b border-linia bg-kalka px-4 text-tusz md:px-8">${LOGO_LINK}<div class="flex items-center gap-3 md:gap-6">${nav(
  'Menu główne',
  [['/', 'Start'], ['/mapa', 'Mapa'], ['/miejsca', 'Miejsca'], ['/zestawienia', 'Zestawienia']],
  'flex items-center gap-x-3 md:gap-x-6',
)}</div></header>`;

/** Linki stopki jak w aplikacji (SiteFooter). */
const FOOTER_LINKS: readonly (readonly [string, string])[] = [
  ['/mapa', 'Mapa'],
  ['/miejsca', 'Miejsca'],
  ['/o-projekcie', 'O projekcie'],
  ['/zrodla', 'Skąd są dane'],
  ['/prywatnosc', 'Prywatność i zgoda'],
  ['https://github.com/olubiec/faktografia-atlas', 'GitHub'],
  ['https://creativecommons.org/licenses/by/4.0/deed.pl', 'CC BY 4.0'],
];

export const footer = (dataDate: string) => `<footer role="contentinfo" class="mt-auto border-t border-linia bg-arkusz text-tusz">
<div class="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
<img src="/brand/faktografia-logo-granat.svg" alt="" width="160" height="32" class="logo-na-jasnym -mb-1 -ml-3 -mt-4 block h-10 w-auto md:-ml-3.5 md:h-12"><img src="/brand/faktografia-logo-jasne.svg" alt="" width="160" height="32" class="logo-na-ciemnym -mb-1 -ml-3 -mt-4 h-10 w-auto md:-ml-3.5 md:h-12">
<p class="mt-4 max-w-prose text-sm leading-[1.6] text-olowek">Faktografia to niezależna, interaktywna mapa Polski prezentująca rzetelne statystyki GUS dla każdego województwa, powiatu i gminy. Dane i opracowanie na licencji CC BY 4.0.</p>
<section aria-labelledby="stopka-strony" class="mt-4 md:mt-6"><h2 id="stopka-strony" class="text-xl font-bold text-tusz">Strony</h2><div class="mt-3">${nav('Stopka', FOOTER_LINKS, 'flex flex-wrap gap-x-4 gap-y-1')}</div></section>
<p class="mt-6 text-sm text-olowek">Źródło: GUS, Bank Danych Lokalnych, CC BY 4.0 · dane z ${text(dataDate)}</p>
</div>
</footer>`;

