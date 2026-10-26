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

    const searchParams = new URLSearchParams();
    searchParams.set('template', 'zamowienie-wskaznika.yml');
    searchParams.set('title', titleText);
    searchParams.set('id', idStr);
    searchParams.set('nazwa', currName);
    if (formattedCategoryPath) {
      searchParams.set('dzial', formattedCategoryPath);
    }
    if (formattedLevel) {
      searchParams.set('poziom', formattedLevel);
    }

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
