import { orderIssueUrl } from '@/core/library/order';
import type { LibraryVariable } from '@/core/library/query';
import { Button } from '@/components/ui/button';

export interface OrderButtonProps {
  variable: LibraryVariable;
}

export function OrderButton({ variable }: OrderButtonProps) {
  const url = orderIssueUrl({
    id: variable.id,
    name: variable.name,
    categoryPath: variable.cat ?? variable.categoryId ?? variable.subjectId ?? undefined,
    level: variable.level != null ? String(variable.level) : undefined,
  });

  return (
    <div className="flex flex-col gap-2">
      <Button asChild variant="default" size="default">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Zamów ten wskaźnik
        </a>
      </Button>
      <p className="text-xs text-olowek m-0 leading-normal">
        Otworzy się zgłoszenie na GitHubie (wymaga konta). Nic nie wysyłamy bez Twojej zgody. Zgłoszenie dostanie etykietę dopiero po sprawdzeniu przez nas (osoby bez uprawnień nie mogą jej ustawić).
      </p>
    </div>
  );
}
