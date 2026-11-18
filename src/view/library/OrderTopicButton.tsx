import { orderTopicUrl } from '@/core/library/order';
import { Button } from '@/components/ui/button';

export interface OrderTopicButtonProps {
  topic?: string;
  categoryPath?: string | string[];
}

/** Przycisk „Zamów dane na temat…” – otwiera zgłoszenie na GitHubie z wpisanym tematem. */
export function OrderTopicButton({ topic, categoryPath }: OrderTopicButtonProps) {
  const clean = (topic ?? '').trim().slice(0, 200);
  const url = orderTopicUrl(clean, categoryPath);

  return (
    <div className="flex flex-col gap-2">
      <Button asChild variant="default" size="default">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {clean ? `Zamów dane o „${clean}”` : 'Zamów dane na temat…'}
        </a>
      </Button>
      <p className="text-xs text-olowek m-0 leading-normal">
        Otworzy się zgłoszenie na GitHubie (wymaga konta). Nic nie wysyłamy bez Twojej zgody. Zgłoszenie dostanie etykietę dopiero po sprawdzeniu przez nas (osoby bez uprawnień nie mogą jej ustawić).
      </p>
    </div>
  );
}
