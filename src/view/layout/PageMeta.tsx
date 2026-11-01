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
  description,
  canonical,
  ogType = 'website',
}: PageMetaProps) {
  const fullTitle = title.includes('Faktografia') ? title : `${title} – Faktografia Atlas`;

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
    </>
  );
}
