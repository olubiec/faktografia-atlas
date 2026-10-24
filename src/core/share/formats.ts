export type ShareFormatKey = 'post' | 'square' | 'story' | 'wide';

export interface SafeMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ShareFormat {
  id: ShareFormatKey;
  name: string;
  width: number;
  height: number;
  safe: SafeMargin;
}

/**
 * Formaty obrazów pod social media (Instagram, X, Facebook, Threads, LinkedIn).
 * Każdy format ma zdefiniowane pole safe (margines treści).
 * safe dla story: 155 px od góry i od dołu, 64 px po bokach.
 * safe dla pozostałych: 64 px z każdej strony (zgodnie ze skalą space w tokenach = 64).
 */
export const SHARE_FORMATS: Record<ShareFormatKey, ShareFormat> = {
  post: {
    id: 'post',
    name: 'Post 4:5 – Instagram, Facebook, Threads',
    width: 1080,
    height: 1350,
    safe: { top: 64, bottom: 64, left: 64, right: 64 },
  },
  square: {
    id: 'square',
    name: 'Kwadrat – komentarze, X',
    width: 1080,
    height: 1080,
    safe: { top: 64, bottom: 64, left: 64, right: 64 },
  },
  story: {
    id: 'story',
    name: 'Story 9:16',
    width: 1080,
    height: 1920,
    safe: { top: 155, bottom: 155, left: 64, right: 64 },
  },
  wide: {
    id: 'wide',
    name: 'Poziomy 16:9 – X, LinkedIn',
    width: 1600,
    height: 900,
    safe: { top: 64, bottom: 64, left: 64, right: 64 },
  },
};
