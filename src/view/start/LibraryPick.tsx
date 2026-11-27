import { DataMenuWindow } from '@/view/data-menu/DataMenuWindow';
import { useCatalog } from '@/view/data-menu/useCatalog';
import { useIsMobile } from '@/view/hooks/useIsMobile';
import { plural } from '@/core/seo/topics';

export interface LibraryPickProps {
  /** Wskaźnik pokazany teraz w panelu (nazwa w przycisku, zaznaczenie w menu). */
  selectedId: string;
  selectedName: string;
  onPick: (id: string) => void;
}

/** Podpis przycisku z liczbą wskaźników; bez liczby, dopóki spis się nie wczyta. */
const pickLabel = (total: number | null): string => (total ? `Wybierz dane · ${plural(total, 'wskaźnik', 'wskaźniki', 'wskaźników')}` : 'Wybierz dane');

/**
 * „Wybierz dane”: to samo menu kategorii co przy mapie (Dział › Grupa › Wskaźnik z szukajką), w oknie na cały ekran.
 * Liczba wskaźników w podpisie pochodzi ze spisu (available.json, jedno lekkie żądanie), więc okno otwiera się od razu.
 */
export function LibraryPick({ selectedId, selectedName, onPick }: LibraryPickProps) {
  const mobile = useIsMobile();
  const { tree, loading, failed } = useCatalog();
  return (
    <DataMenuWindow
      indicatorId={selectedId}
      indicatorName={selectedName}
      onSelect={onPick}
      layout={mobile ? 'stack' : 'columns'}
      label={pickLabel(loading || failed ? null : tree.total)}
      syncUrl={false}
      triggerSlot="library-pick"
    />
  );
}
