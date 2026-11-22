import { useEffect } from 'react';
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  absoluteUrl,
  canonicalFor,
} from '@/core/seo/site';

export interface PageMetaProps {
  title: string;
  description?: string;
  /** Pełny adres kanoniczny; domyślnie z bieżącej ścieżki, bez parametrów. */
  canonical?: string;
  ogType?: string;
  /** Strona poza indeksem wyszukiwarek (linki nadal śledzone). */
  noindex?: boolean;
}

/**
 * Ustawia tytuł i tagi meta strony zgodnie ze standardem React 19 (hoisting tagów do <head>).
 * Po pierwszym renderze usuwa tagi zastępcze z index.html (`data-fallback`), żeby nie było duplikatów.
 */
export function PageMeta({
  title,
  description,
  canonical,
  ogType = 'website',
  noindex = false,
}: PageMetaProps) {
  const fullTitle = title.includes('Faktografia') ? title : `${title} – Faktografia`;
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname;
  const url = canonical ?? canonicalFor(pathname);
  const image = absoluteUrl(OG_IMAGE_PATH);

  useEffect(() => {
    document.head.querySelectorAll('[data-fallback]').forEach((el) => el.remove());
  }, []);

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,follow" />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Faktografia" />
      <meta property="og:locale" content="pl_PL" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
    </>
  );
}
