/** Profile Faktografii w mediach społecznościowych i adres kontaktowy – jedno źródło dla stopki i JSON-LD. */
export type SocialId = 'x' | 'instagram' | 'tiktok' | 'email';

export interface SocialLink {
  id: SocialId;
  /** Nazwa czytana przez czytnik ekranu i pokazywana w podpowiedzi. */
  label: string;
  href: string;
}

export const CONTACT_EMAIL = 'kontakt@faktografia.eu';

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { id: 'x', label: 'Faktografia w serwisie X', href: 'https://x.com/faktografia_eu' },
  { id: 'instagram', label: 'Faktografia na Instagramie', href: 'https://www.instagram.com/faktografia.eu' },
  { id: 'tiktok', label: 'Faktografia na TikToku', href: 'https://www.tiktok.com/@faktografia.eu' },
  { id: 'email', label: `Napisz do nas: ${CONTACT_EMAIL}`, href: `mailto:${CONTACT_EMAIL}` },
];

/** Adresy profili (bez poczty) – pole `sameAs` w danych strukturalnych organizacji. */
export const SOCIAL_PROFILE_URLS: string[] = SOCIAL_LINKS.filter((l) => l.id !== 'email').map((l) => l.href);
