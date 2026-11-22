// Bezpieczne wstawianie tekstu do statycznego HTML stron miejsc (S07). Każda wartość z danych przechodzi tędy.

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Tekst do treści elementu: `& < > " '` zamienione na encje, więc dane nie tworzą znaczników. */
export function escapeHtml(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

/** Wartość atrybutu (zawsze w cudzysłowie "): jak escapeHtml, dodatkowo grawis i znaki nowej linii. */
export function escapeAttr(value: string | number): string {
  return escapeHtml(value)
    .replace(/`/g, '&#96;')
    .replace(/\r?\n/g, '&#10;');
}
