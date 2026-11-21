// Jednorazowe, ciche usunięcie zapisanej listy „Moje wskaźniki” (funkcja została wycofana).
export const LEGACY_MY_INDICATORS_KEY = 'faktografia-my-indicators';

export function cleanupLegacyStorage(): void {
  try {
    localStorage.removeItem(LEGACY_MY_INDICATORS_KEY);
  } catch {
    // pamięć przeglądarki niedostępna – nic do sprzątania
  }
}
