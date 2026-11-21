import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Jedyne miejsce na odstępy sekcji: strona 48–64 px (STYL §5), panel 16–24 px. */
const SPACING = {
  page: 'mt-12 md:mt-16',
  panel: 'mt-4 md:mt-6',
} as const;

export type PageSectionProps = {
  title: string;
  id?: string;
  /** page = sekcja strony, panel = sekcja w panelu. */
  variant?: keyof typeof SPACING;
  children: ReactNode;
};

/** Sekcja: nagłówek + treść + odstęp od poprzedniej. Bez „eyebrow” i bez wersalików. */
export function PageSection({ title, id, variant = 'page', children }: PageSectionProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn(SPACING[variant], 'first:mt-0')}>
      <h2 id={headingId} className="text-xl font-bold text-tusz">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
