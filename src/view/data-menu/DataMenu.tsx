import { useEffect, useRef, useState } from 'react';
import { NavArrowDown } from 'iconoir-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Icon } from '@/view/ui/Icon';
import type { CatalogEntry, CatalogTree } from '@/core/catalog/tree';
import { useCatalog } from './useCatalog';
import { PAGE_SIZE } from './DataMenuList';
import { DataMenuResults, DataMenuSearchField, MIN_QUERY } from './DataMenuSearch';
import { DataMenuBranch, DataMenuSections } from './DataMenuTree';
import { clearMenuUrl, readMenuUrl } from './menuUrl';

// Jedno menu wyboru danych: Dział › Grupa › Wskaźnik z szukajką. Wielokrotnego użytku (panel mapy,
// profil miejsca, telefon): nie zna panelu mapy ani adresu, wynik oddaje przez onSelect(id).

export type DataMenuProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  /** Wyłącza pozycje bez danych na danym poziomie (np. w profilu). */
  isDisabled?: (entry: CatalogEntry) => boolean;
  /** 'columns' = komputer (dwie kolumny); 'stack' = telefon (jeden widok naraz, dodaje B06). */
  layout: 'columns' | 'stack';
  /** Fraza wpisana w szukajkę przy otwarciu (adres ?q=). */
  initialQuery?: string;
  /** Dział (i grupa) otwarte od razu, np. po powrocie do menu. */
  initialSectionId?: string | null;
  initialGroupId?: string | null;
};

export type DataMenuBodyProps = DataMenuProps & {
  tree: CatalogTree;
  loading?: boolean;
  failed?: boolean;
};

/** Część bez ładowania danych: dostaje gotowe drzewo (łatwa do testów). */
export function DataMenuBody({ tree, loading = false, failed = false, selectedId, onSelect, onClose, isDisabled, layout, initialQuery = '', initialSectionId = null, initialGroupId = null }: DataMenuBodyProps) {
  const [text, setText] = useState(initialQuery);
  const [sectionId, setSectionId] = useState<string | null>(initialSectionId);
  const [groupId, setGroupId] = useState<string | null>(initialGroupId);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const searching = text.trim().length >= MIN_QUERY;
  const section = tree.sections.find((s) => s.id === sectionId) ?? null;
  const more = () => setLimit((n) => n + PAGE_SIZE);
  const openSection = (id: string) => {
    setText('');
    setSectionId(id);
    setGroupId(null);
    setLimit(PAGE_SIZE);
  };
  const openGroup = (id: string) => {
    setGroupId(id);
    setLimit(PAGE_SIZE);
  };
  const pick = (id: string) => {
    onSelect(id);
    onClose();
  };
  const columns = layout === 'columns';
  // Po wyborze działu/grupy prawa zawartość pokazuje się od początku (także na telefonie, gdzie lista była przewinięta).
  const rightRef = useRef<HTMLElement | null>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = rightRef.current;
    if (!el) return;
    el.scrollTop = 0;
    if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'start' });
  }, [sectionId, groupId]);

  return (
    <div className="flex min-h-0 flex-col gap-3 text-tusz" data-layout={layout}>
      <div className="sticky top-0 z-10 bg-arkusz pb-1">
        <DataMenuSearchField value={text} onChange={(t) => { setText(t); setLimit(PAGE_SIZE); }} />
      </div>
      <p className="text-xs text-olowek" role="status">
        {loading ? 'Wczytuję spis…' : `${tree.total} wskaźników z danymi w ${tree.sections.length} działach.`}
        {failed && ' Spisu pobranych danych nie udało się wczytać – widać tylko wskaźniki wbudowane.'}
      </p>
      <div className={columns ? 'grid min-h-0 gap-4 md:max-h-[65dvh] md:grid-cols-[16rem_1fr]' : 'flex min-h-0 flex-col gap-3'}>
        {!searching && (!section || columns) && <DataMenuSections tree={tree} sectionId={sectionId} onOpen={openSection} scrollable={columns} />}
        <section ref={rightRef} aria-label="Wskaźniki" className={columns ? 'min-w-0 md:min-h-0 md:overflow-y-auto md:overscroll-contain' : 'min-w-0'}>
          {searching ? (
            <DataMenuResults
              tree={tree}
              text={text}
              selectedId={selectedId}
              onPick={pick}
              onOpenSection={(name) => openSection(name)}
              isDisabled={isDisabled}
              limit={limit}
              onMore={more}
            />
          ) : (
            (columns || section) && (
              <DataMenuBranch
                section={section}
                groupId={groupId}
                selectedId={selectedId}
                onPick={pick}
                onHome={() => { setSectionId(null); setGroupId(null); }}
                onOpenSection={openSection}
                onOpenGroup={openGroup}
                isDisabled={isDisabled}
                limit={limit}
                onMore={more}
              />
            )
          )}
        </section>
      </div>
    </div>
  );
}

/** Menu wyboru danych z wczytywaniem spisu (jedno żądanie available.json). */
export function DataMenu(props: DataMenuProps) {
  const { tree, loading, failed } = useCatalog();
  return <DataMenuBody {...props} tree={tree} loading={loading} failed={failed} />;
}

export type DataMenuDialogProps = {
  indicatorId: string;
  indicatorName: string;
  onSelect: (id: string) => void;
};

/**
 * Przycisk z nazwą wskaźnika, który otwiera DataMenu w oknie (komputer).
 * Adres ?menu=dane otwiera okno przy wejściu, ?q=<fraza> wpisuje frazę w szukajkę.
 */
export function DataMenuDialog({ indicatorId, indicatorName, onSelect }: DataMenuDialogProps) {
  const [initial] = useState(readMenuUrl);
  const [open, setOpen] = useState(initial.open);
  const change = (next: boolean) => {
    setOpen(next);
    if (!next) clearMenuUrl();
  };
  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          className="flex min-h-[44px] w-full items-center justify-between gap-2 border border-linia bg-arkusz px-3 py-2 text-left text-base font-bold text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz cursor-pointer"
        >
          <span className="min-w-0 break-words">{indicatorName}</span>
          <Icon icon={NavArrowDown} aria-hidden={true} size={20} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] max-w-4xl overflow-y-auto overscroll-contain">
        <DialogHeader>
          <DialogTitle>Wybierz dane</DialogTitle>
          <DialogDescription>Dział, grupa, wskaźnik. Pokazujemy tylko dane, które mamy.</DialogDescription>
        </DialogHeader>
        <DataMenu
          selectedId={indicatorId}
          onSelect={onSelect}
          onClose={() => change(false)}
          layout="columns"
          initialQuery={initial.query}
        />
      </DialogContent>
    </Dialog>
  );
}
