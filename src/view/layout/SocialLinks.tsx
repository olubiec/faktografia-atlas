import { Instagram, Mail, Tiktok, X } from 'iconoir-react';
import { SOCIAL_LINKS, type SocialId } from '@/core/brand/social';
import { Icon } from '../ui/Icon';

const ICONS: Record<SocialId, typeof X> = { x: X, instagram: Instagram, tiktok: Tiktok, email: Mail };

/** Rząd ikon z odnośnikami do profili Faktografii i adresu e-mail. Pola dotykowe 44 × 44 px. */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="Faktografia w sieci" className={className}>
      <ul className="flex flex-wrap items-center gap-2">
        {SOCIAL_LINKS.map((link) => {
          const external = link.id !== 'email';
          return (
            <li key={link.id}>
              <a
                href={link.href}
                aria-label={link.label}
                title={link.label}
                data-social={link.id}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer me' : undefined}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-olowek hover:text-tusz focus-visible:outline-2 focus-visible:outline-tusz"
              >
                <Icon icon={ICONS[link.id]} aria-hidden={true} size={22} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
