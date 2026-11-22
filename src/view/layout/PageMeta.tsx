import { useEffect } from 'react';
import {
  absoluteUrl,
  canonicalFor,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  removeFallbackTags,
} from '@/core/seo/site';

export interface PageMetaProps {
  title: string;
  description?: string;
  /** Adres kanoniczny (ścieżka albo pełny adres); domyślnie bieżąca ścieżka bez parametrów. */
  canonical?: string;
  /** Ścieżka strony; domyślnie `location.pathname`. */
  path?: string;
  ogType?: string;
  /** Ścieżka albo pełny adres obrazka 1200×630; domyślnie obrazek serwisu. */
  image?: string;
  /** Strona poza indeksem Google (linki dalej śledzone). */
  noindex?: boolean;
}

// Statyczny <title> z index.html, zapamiętany przed pierwszym renderem Reacta.
// React wstawia własny <title> przed nim, więc ten stary usuwamy, żeby był jeden.
const staticTitle =
  typeof document === 'undefined' ? null : document.querySelector('head > title');

function currentPath(): string {
  return typeof location === 'undefined' ? '/' : location.pathname;
}

/**
 * Ustawia tytuł i tagi meta strony zgodnie ze standardem React 19 (hoisting tagów do <head>).
 */
export function PageMeta({
  title,
  description,
  canonical,
  path,
  ogType = 'website',
  image = OG_IMAGE_PATH,
  noindex = false,
}: PageMetaProps) {
  const fullTitle = title.includes('Faktografia') ? title : `${title} – Faktografia`;
  const url = canonicalFor(canonical ?? path ?? currentPath());
  const imageUrl = absoluteUrl(image);

  // Po pierwszym renderze: zapasowe tagi z index.html nie są już potrzebne.
  useEffect(() => {
    removeFallbackTags(document.head);
    staticTitle?.remove();
  }, []);

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex,follow" />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Faktografia" />
      <meta property="og:locale" content="pl_PL" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      <meta property="og:image:alt" content="Logo Faktografii i hasło serwisu" />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
