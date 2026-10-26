export interface OrderIndicatorParams {
  id: string | number;
  name: string;
  categoryPath?: string | string[];
  level?: string;
}

/**
 * Generuje adres URL do utworzenia nowego zgłoszenia (issue) zamówienia wskaźnika na GitHubie.
 */
export function orderIssueUrl(params: OrderIndicatorParams): string {
  const { id, name, categoryPath, level } = params;
  const idStr = String(id);

  const formattedCategoryPath = Array.isArray(categoryPath)
    ? categoryPath.join(' > ')
    : categoryPath || '';
  const formattedLevel = level || '';

  const buildUrl = (currName: string): string => {
    const titleText = `Zamówienie wskaźnika: ${currName} (${idStr})`;

    const bodyLines: string[] = [
      `Proszę o dodanie wskaźnika do Faktografia Atlas. Zgłoszenie nie zawiera danych osobowych.`,
      '',
      `ID wskaźnika: ${idStr}`,
      `Nazwa: ${currName}`,
    ];

    if (formattedCategoryPath) {
      bodyLines.push(`Ścieżka kategorii: ${formattedCategoryPath}`);
    }
    if (formattedLevel) {
      bodyLines.push(`Poziom: ${formattedLevel}`);
    }

    const bodyText = bodyLines.join('\n');

    const searchParams = new URLSearchParams();
    searchParams.set('title', titleText);
    searchParams.set('labels', 'zamowienie-wskaznika');
    searchParams.set('body', bodyText);

    return `https://github.com/olubiec/faktografia-atlas/issues/new?${searchParams.toString()}`;
  };

  let currentUrl = buildUrl(name);
  if (currentUrl.length <= 1800) {
    return currentUrl;
  }

  let truncatedName = name;
  while (currentUrl.length > 1800 && truncatedName.length > 0) {
    truncatedName = truncatedName.slice(0, -1);
    currentUrl = buildUrl(truncatedName + '…');
  }

  return currentUrl;
}
