import { Link } from 'react-router';
import { cn } from '@/lib/utils';

/** `reloadDocument`: adres poza aplikacją (statyczna strona z generatora) – zwykłe przejście zamiast routera. */
export type LinkListItem = { to: string; label: string; reloadDocument?: boolean };

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

/** Lista linków: jeden styl, pole dotykowe min. 44 px, fokus i stan aktywny z tokenów. */
export function LinkList({ items, variant = 'footer', activePath, label }: LinkListProps) {
  return (
    <nav aria-label={label}>
      <ul className={VARIANT[variant]}>
        {items.map((item) => {
          const active = item.to === activePath;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                reloadDocument={item.reloadDocument}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-[44px] items-center text-sm text-tusz underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-tusz',
                  active && 'font-bold',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
