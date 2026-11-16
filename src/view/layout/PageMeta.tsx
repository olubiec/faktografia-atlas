import { useEffect } from 'react';
import { dropStaticDuplicates, leavePage } from './pageMetaHead';

const DOMAIN = 'https://faktografia.eu';
const DEFAULT_DESCRIPTION =
  'Interaktywna mapa Polski z danymi GUS: województwa, powiaty, gminy i miejscowości. Sprawdź, porównaj i pobierz liczby w jednym miejscu.';

export interface PageMetaProps {
  title: string;
  description?: string;
  canonical?: string;
  ogType?: string;
}

/**
 * Ustawia tytuł i tagi meta strony zgodnie ze standardem React 19 (hoisting tagów do <head>).
 */
export function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical = DOMAIN + (typeof location === 'undefined' ? '/' : location.pathname),
  ogType = 'website',
}: PageMetaProps) {
  const fullTitle = title.includes('Faktografia') ? title : `${title} – Faktografia Atlas`;

  useEffect(() => {
    dropStaticDuplicates();
    return () => {
      leavePage();
    };
  }, [canonical]);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
    </>
  );
}
