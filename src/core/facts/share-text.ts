// Tekst „Udostępnij” z karty (W33-O08, docs/KONCEPT-ODKRYCIA-V2.md §6): spokojne zdanie z liczbą, odniesieniem, rokiem i linkiem.
// Bez zachęt, bez emotikonów, bez danych osoby; link dostaje tylko ?ref=karta.

export interface ShareCard {
  /** Zdanie główne karty (z humanScale / roles). */
  main: string;
  /** „W typowej gminie: …”; może być puste. */
  reference: string;
  /** „GUS BDL, 2025 · 32 na 1000”. */
  source: string;
}

/** Dopisuje ?ref=karta (zachowuje istniejące parametry i hash). */
export function withRef(link: string): string {
  try {
    const u = new URL(link, 'https://faktografia.local');
    u.searchParams.set('ref', 'karta');
    const out = `${u.pathname}${u.search}${u.hash}`;
    return /^https?:/i.test(link) ? `${u.origin}${out}` : out;
  } catch {
    return link;
  }
}

/** Tekst do wysłania: „Maszewo na tle Polski. {zdanie} {odniesienie} {źródło}. {link}”. */
export function shareText(place: string, card: ShareCard, link: string): string {
  const parts = [`${place} na tle Polski.`, card.main, card.reference, card.source ? `${card.source}.` : '', withRef(link)];
  return parts.filter(Boolean).join(' ');
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'error';

interface NavLike {
  share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
  clipboard?: { writeText?: (text: string) => Promise<void> };
}

/** Web Share, a bez niego schowek. Anulowanie okna nie jest błędem; błąd schowka nie rzuca wyjątku. */
export async function shareOrCopy(nav: NavLike | undefined, title: string, text: string): Promise<ShareResult> {
  if (nav && typeof nav.share === 'function') {
    try {
      await nav.share({ title, text });
      return 'shared';
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'cancelled';
      // inny błąd Web Share: próbujemy schowka
    }
  }
  try {
    if (!nav?.clipboard || typeof nav.clipboard.writeText !== 'function') return 'error';
    await nav.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'error';
  }
}
