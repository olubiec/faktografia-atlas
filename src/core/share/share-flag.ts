// Przełącznik „Pobierz i udostępnij” (U10): domyślnie wyłączony.
// Włącza go tylko adres z ?share=1 (testy, ewentualny powrót). Po wejściu z ?share=1
// wartość trzymamy w sessionStorage, żeby przeżyła przejścia między stronami.
const PARAM = 'share';
const STORAGE_KEY = 'atlas-share';

export function isShareEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(window.location.search).get(PARAM) === '1') {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // brak sessionStorage – działa tylko przy ?share=1 w adresie
      }
      return true;
    }
  } catch {
    return false;
  }
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
