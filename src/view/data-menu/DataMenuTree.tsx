import { BASIC_GROUP, type CatalogEntry, type CatalogSection, type CatalogTree } from '@/core/catalog/tree';
import { DataMenuList, rowClass } from './DataMenuList';

// Drzewo Dział › Grupa › Wskaźnik. Kolumna działów (komputer) i prawa kolumna: grupy, potem wskaźniki grupy.

export function DataMenuSections({ tree, sectionId, onOpen }: { tree: CatalogTree; sectionId: string | null; onOpen: (id: string) => void }) {
  return (
    <nav aria-label="Działy" className="flex flex-col gap-1">
      {tree.sections.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onOpen(s.id)}
          aria-current={s.id === sectionId ? 'true' : undefined}
          className={`${rowClass} ${s.id === sectionId ? 'border-tusz font-bold' : ''}`}
        >
          <span className="min-w-0 break-words">{s.name}</span>
          <span className="shrink-0 text-xs text-olowek">{s.count}</span>
        </button>
      ))}
    </nav>
  );
}

function Crumbs({ items }: { items: { label: string; onClick: () => void }[] }) {
  return (
    <nav aria-label="Ścieżka" className="flex flex-wrap items-center text-sm">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center">
          {i > 0 && <span aria-hidden="true" className="px-1 text-olowek">›</span>}
          <button type="button" onClick={item.onClick} className="min-h-[44px] px-1 text-tusz underline-offset-4 hover:underline cursor-pointer">
            {item.label}
          </button>
        </span>
      ))}
    </nav>
  );
}

export type DataMenuBranchProps = {
  section: CatalogSection | null;
  groupId: string | null;
  selectedId: string | null;
  onPick: (id: string) => void;
  onHome: () => void;
  onOpenSection: (id: string) => void;
  onOpenGroup: (id: string) => void;
  isDisabled?: (entry: CatalogEntry) => boolean;
  limit: number;
  onMore: () => void;
};

/** Prawa kolumna: bez działu – podpowiedź; w dziale – grupy; w grupie – wskaźniki (po 50). */
export function DataMenuBranch({ section, groupId, selectedId, onPick, onHome, onOpenSection, onOpenGroup, isDisabled, limit, onMore }: DataMenuBranchProps) {
  if (!section) return <p className="text-sm text-olowek">Wybierz dział z listy albo wpisz hasło.</p>;
  const group = section.groups.find((g) => g.id === groupId) ?? null;
  return (
    <div className="flex flex-col gap-2">
      <Crumbs
        items={[
          { label: 'Wszystkie', onClick: onHome },
          { label: section.name, onClick: () => onOpenSection(section.id) },
          ...(group ? [{ label: group.name, onClick: () => onOpenGroup(group.id) }] : []),
        ]}
      />
      {!group &&
        section.groups.map((g) => (
          <button key={g.id} type="button" className={rowClass} onClick={() => onOpenGroup(g.id)}>
            <span className="min-w-0 break-words">{g.name === BASIC_GROUP ? `★ ${g.name}` : g.name}</span>
            <span className="shrink-0 text-xs text-olowek">{g.entries.length}</span>
          </button>
        ))}
      {group && (
        <DataMenuList entries={group.entries} selectedId={selectedId} onPick={onPick} isDisabled={isDisabled} limit={limit} onMore={onMore} />
      )}
    </div>
  );
}
