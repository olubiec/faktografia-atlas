import { Link } from 'react-router';
import { cn } from '@/lib/utils';

/** `reload`: zwykły link (pełne ładowanie) do statycznej strony poza aplikacją, np. /miejsca. */
export type LinkListItem = { to: string; label: string; reload?: boolean };

const VARIANT = {
  footer: 'flex flex-wrap gap-x-4 gap-y-1',
  menu: 'flex flex-col',
} as const;

export type LinkListProps = {
  items: LinkListItem[];
  variant?: keyof typeof VARIANT;
  /** Ścieżka aktywnego linku (dostaje aria-current). */
  activePath?: string;
  label?: string;
};

const linkClass =
  'inline-flex min-h-[44px] items-center text-sm text-tusz underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-tusz';

/** Lista linków: jeden styl, pole dotykowe min. 44 px, fokus i stan aktywny z tokenów. */
export function LinkList({ items, variant = 'footer', activePath, label }: LinkListProps) {
  return (
    <nav aria-label={label}>
      <ul className={VARIANT[variant]}>
        {items.map((item) => {
          const active = item.to === activePath;
          return (
            <li key={item.to}>
              {item.reload ? (
                <a href={item.to} className={linkClass}>
                  {item.label}
                </a>
              ) : (
                <Link to={item.to} aria-current={active ? 'page' : undefined} className={cn(linkClass, active && 'font-bold')}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
