/** Zamiana znaków specjalnych HTML. Każda wartość z danych trafia do strony przez tę funkcję. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Wartość atrybutu: te same zamiany co w treści (cudzysłów i apostrof są zawsze zamieniane). */
export const escapeAttr = escapeHtml;
