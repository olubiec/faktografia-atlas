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

  return fitUrl(buildUrl, name);
}

const MAX_URL_LENGTH = 1800;
const MAX_TOPIC_LENGTH = 200;

/** Wspólny pomocnik: ucina nazwę (dopisując „…”), aż adres zmieści się w limicie. */
function fitUrl(buildUrl: (name: string) => string, name: string): string {
  let currentUrl = buildUrl(name);
  if (currentUrl.length <= MAX_URL_LENGTH) {
    return currentUrl;
  }

  let truncatedName = name;
  while (currentUrl.length > MAX_URL_LENGTH && truncatedName.length > 0) {
    truncatedName = truncatedName.slice(0, -1);
    currentUrl = buildUrl(truncatedName + '…');
  }

  return currentUrl;
}

/**
 * Adres zgłoszenia zamówienia danych na dany temat (nie konkretny wskaźnik).
 * Temat trafia w pole `nazwa`, a w `id` ląduje tekst „temat”.
 */
export function orderTopicUrl(topic: string, categoryPath?: string | string[]): string {
  const cleanTopic = topic.trim().slice(0, MAX_TOPIC_LENGTH);
  const path = Array.isArray(categoryPath) ? categoryPath.join(' > ') : categoryPath || '';

  const buildUrl = (currTopic: string): string => {
    const searchParams = new URLSearchParams();
    searchParams.set('template', 'zamowienie-wskaznika.yml');
    searchParams.set('title', `Zamówienie danych na temat: ${currTopic}`);
    searchParams.set('id', 'temat');
    searchParams.set('nazwa', currTopic);
    if (path) {
      searchParams.set('dzial', path);
    }
    return `https://github.com/olubiec/faktografia-atlas/issues/new?${searchParams.toString()}`;
  };

  return fitUrl(buildUrl, cleanTopic);
}
