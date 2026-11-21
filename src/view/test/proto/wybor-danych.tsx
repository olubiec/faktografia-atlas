import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import indicatorsData from '../../../../config/indicators.json';
import {
  buildCatalogTree,
  searchCatalog,
  type CatalogEntry,
  type CatalogHit,
} from '@/core/catalog/prototype-tree';
import { loadAvailable } from '@/core/indicators/load-available';
import type { AvailableFile } from '@/core/indicators/registry';
import type { Indicator } from '@/core/profile/profile';
import { SearchField } from '@/view/ui/SearchField';

// PROTOTYP (U04) – jeden wybór danych: kategorie + szukajka. Bez podpinania do mapy.
const MAIN = indicatorsData as Indicator[];
const PAGE = 50;
const LEVEL_NAMES = { woj: 'woj.', pow: 'powiaty', gmi: 'gminy' } as const;

const rowClass =
  'flex min-h-[44px] w-full items-center justify-between gap-3 border border-linia bg-arkusz px-3 py-2 text-left text-sm text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz cursor-pointer';

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

function EntryRow({ entry, path, onPick }: { entry: CatalogEntry; path?: string; onPick: (e: CatalogEntry) => void }) {
  return (
    <button type="button" className={rowClass} onClick={() => onPick(entry)}>
      <span className="min-w-0">
        <span className="block break-words font-semibold">{entry.name}</span>
        {path && <span className="block break-words text-xs text-olowek">{path}</span>}
      </span>
      <span className="shrink-0 text-xs text-olowek">{entry.levels.map((l) => LEVEL_NAMES[l]).join(' · ')}</span>
    </button>
  );
}

export default function WyborDanychProto() {
  const [available, setAvailable] = useState<AvailableFile | null | undefined>(undefined);
  const [text, setText] = useState('');
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [picked, setPicked] = useState<CatalogEntry | null>(null);

  useEffect(() => {
    let off = false;
    loadAvailable().then((a) => { if (!off) setAvailable(a); });
    return () => { off = true; };
  }, []);

  const tree = useMemo(() => buildCatalogTree(MAIN, available ?? null), [available]);
  const hits: CatalogHit[] = useMemo(() => searchCatalog(tree, text, 200), [tree, text]);
  const searching = text.trim().length >= 2;
  const section = tree.sections.find((s) => s.id === sectionId) ?? null;
  const group = section?.groups.find((g) => g.id === groupId) ?? null;
  const goHome = () => { setSectionId(null); setGroupId(null); setLimit(PAGE); };
  const openSection = (id: string) => { setSectionId(id); setGroupId(null); setLimit(PAGE); };
  const shown = group?.entries.slice(0, limit) ?? [];

  return (
    <div className="min-h-dvh bg-arkusz text-tusz">
      <div className="border-b border-tusz bg-linia/30 px-4 py-2 text-sm">
        <strong>PROTOTYP – nie jest to docelowy ekran.</strong>{' '}
        <Link to="/__test/proto" className="underline underline-offset-4">Lista prototypów</Link>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-4">
        <h1 className="mb-3 text-xl font-bold">Wybierz dane</h1>
        <SearchField id="wybor-szukaj" label="Szukaj wskaźnika" placeholder="np. bezrobocie, szkoły, mieszkania"
          value={text} onChange={(e) => setText(e.target.value)} />
        <p className="mt-2 text-xs text-olowek" role="status">
          {available === undefined ? 'Wczytuję spis…' : `${tree.total} wskaźników z danymi w ${tree.sections.length} działach.`}
          {available === null && ' Spisu biblioteki nie udało się pobrać – tylko wskaźniki wbudowane.'}
        </p>
        {picked && (
          <p className="mt-2 border border-tusz p-2 text-sm" role="status">
            Wybrano: <strong>{picked.name}</strong> (w prawdziwym ekranie mapa przełączy się na ten wskaźnik).
          </p>
        )}
        <div className="mt-4 grid gap-4 md:grid-cols-[18rem_1fr]">
          <nav aria-label="Działy" className={`${section || searching ? 'hidden md:block' : 'block'} space-y-1`}>
            {tree.sections.map((s) => (
              <button key={s.id} type="button" onClick={() => { setText(''); openSection(s.id); }}
                aria-current={s.id === sectionId ? 'true' : undefined}
                className={`${rowClass} ${s.id === sectionId ? 'border-tusz font-bold' : ''}`}>
                <span className="min-w-0 break-words">{s.name}</span>
                <span className="shrink-0 text-xs text-olowek">{s.count}</span>
              </button>
            ))}
          </nav>
          <section aria-label="Wskaźniki" className={`${section || searching ? 'block' : 'hidden md:block'} min-w-0 space-y-2`}>
            {searching ? (
              hits.length === 0 ? (
                <p className="text-sm">Brak pobranych danych o „{text.trim()}”. Wskaźników niepobranych nie pokazujemy.</p>
              ) : (
                <>
                  <p className="text-sm text-olowek">{hits.length} wyników</p>
                  {hits.slice(0, limit).map((h) => (
                    <EntryRow key={h.entry.id} entry={h.entry} path={`${h.section} › ${h.group}`} onPick={setPicked} />
                  ))}
                  {hits.length > limit && (
                    <button type="button" className={rowClass} onClick={() => setLimit(limit + PAGE)}>Pokaż więcej</button>
                  )}
                </>
              )
            ) : !section ? (
              <p className="hidden text-sm text-olowek md:block">Wybierz dział z listy albo wpisz hasło.</p>
            ) : (
              <>
                <Crumbs items={[
                  { label: 'Wszystkie', onClick: goHome },
                  { label: section.name, onClick: () => openSection(section.id) },
                  ...(group ? [{ label: group.name, onClick: () => setGroupId(group.id) }] : []),
                ]} />
                {!group && section.groups.map((g) => (
                  <button key={g.id} type="button" className={rowClass} onClick={() => { setGroupId(g.id); setLimit(PAGE); }}>
                    <span className="min-w-0 break-words">{g.name}</span>
                    <span className="shrink-0 text-xs text-olowek">{g.entries.length}</span>
                  </button>
                ))}
                {group && shown.map((e, i) => (
                  <div key={e.id} className="space-y-1">
                    {e.topic && e.topic !== shown[i - 1]?.topic && (
                      <h3 className="pt-2 text-xs font-bold uppercase text-olowek">{e.topic}</h3>
                    )}
                    <EntryRow entry={e} onPick={setPicked} />
                  </div>
                ))}
                {group && group.entries.length > limit && (
                  <button type="button" className={rowClass} onClick={() => setLimit(limit + PAGE)}>
                    Pokaż więcej ({group.entries.length - limit})
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
