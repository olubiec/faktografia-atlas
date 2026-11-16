import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { SiteLayout } from '../layout/SiteLayout';
import { loadUnits } from '../../core/data/load-atlas-data';
import { loadIndicatorValues } from '../../core/data/load-values';
import { filterRankedUnits } from '../../core/ranking/filter-ranked';
import { rankUnits } from '../../core/ranking/ranking';
import type { Unit } from '../../core/units/types';
import type { IndicatorValues } from '../../core/profile/profile';
import type { RankedUnit } from '../../core/ranking/ranking';
import { formatValue } from '../../core/format/number';
import indicators from '../../../config/indicators.json';
import {
  indicatorsInGroup,
  levelsFor,
  normalizeSelection,
  rankingGroups,
  yearsDesc,
  type RankingSelection,
} from '../../core/ranking/ranking-options';
import { isExternalRankingChange, parseRankingParams, rankingSearch } from '../../core/ranking/ranking-url';
import type { UnitLevel } from '../../core/units/types';

const LEVEL_LABEL: Record<UnitLevel, string> = { woj: 'Województwa', pow: 'Powiaty', gmi: 'Gminy' };
const SELECT_CLASS = 'border p-2 w-full min-w-0 min-h-[44px] bg-arkusz text-tusz';

/** Mediana wartości z listy (średnia dwóch środkowych przy parzystej liczbie). */
function medianOf(items: RankedUnit[]): number | null {
  if (!items.length) return null;
  const v = items.map((i) => i.value).sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

const unitName = (r: RankedUnit) => r.name?.trim() || 'Bez nazwy';

/** Podsumowanie: mediana, najwyżej, najniżej – z nazwą jednostki i miarą. */
export function RankingSummary({ items, unit }: { items: RankedUnit[]; unit?: string | null }) {
  const line = (label: string, r?: RankedUnit) =>
    `${label}: ${r ? `${unitName(r)}, ${formatValue(r.value, unit)}` : 'brak danych'}`;
  const median = medianOf(items);
  return (
    <div className="mb-8 p-4 bg-kalka/30 border border-linia">
      <h2 className="text-xl font-semibold mb-2">Podsumowanie</h2>
      <p>{`Mediana: ${median === null ? 'brak danych' : formatValue(median, unit)}`}</p>
      <p>{line('Najwyżej', items[0])}</p>
      <p>{line('Najniżej', items[items.length - 1])}</p>
    </div>
  );
}

/** Lista pierwszych 10 jednostek: nazwa i wartość z jednostką miary. */
export function RankingList({ items, unit }: { items: RankedUnit[]; unit?: string | null }) {
  return (
    <ul>
      {items.slice(0, 10).map((r) => (
        <li key={r.teryt} className="break-words">{`${unitName(r)} - ${formatValue(r.value, unit)}`}</li>
      ))}
    </ul>
  );
}

export function Rankings() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loaded, setLoaded] = useState<{ id: string; data: IndicatorValues | null } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  // Stan początkowy z adresu (i, l, y, q); dalsze zmiany tylko zapisują adres.
  const [initial] = useState(() => parseRankingParams(location.search, indicators));
  const [rawSel, setRawSel] = useState<RankingSelection>(initial.selection);
  const [query, setQuery] = useState(initial.query);

  useEffect(() => {
    let active = true;
    loadUnits().then((u) => {
      if (active) setUnits(u);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    loadIndicatorValues(rawSel.indicatorId).then((data) => {
      if (active) setLoaded({ id: rawSel.indicatorId, data });
    });
    return () => { active = false; };
  }, [rawSel.indicatorId]);

  const current = loaded && loaded.id === rawSel.indicatorId ? loaded : null;
  const loading = current === null;
  const values = current ? current.data : null;
  const sel = useMemo(() => normalizeSelection(rawSel, indicators, values), [rawSel, values]);
  const indicator = indicators.find((i) => i.id === sel.indicatorId);
  const unit = indicator?.unit ?? null;
  const years = yearsDesc(values);
  const latest = values && values.years.length ? Math.max(...values.years) : null;
  const year = sel.year ?? latest;

  // Adres ↔ stan. Zmiana adresu z zewnątrz (link, Wstecz) ustawia stan;
  // własny zapis (replace, bez nowych wpisów historii) go nie resetuje.
  const lastWritten = useRef<string | null>(null);
  const seenSearch = useRef(location.search);
  useEffect(() => {
    const searchChanged = seenSearch.current !== location.search;
    seenSearch.current = location.search;
    if (searchChanged && isExternalRankingChange(location.search, lastWritten.current, indicators)) {
      const ext = parseRankingParams(location.search, indicators);
      lastWritten.current = rankingSearch(ext.selection, ext.query);
      setRawSel(ext.selection);
      setQuery(ext.query);
      return;
    }
    const next = rankingSearch(sel, query);
    lastWritten.current = next;
    if (next !== location.search) navigate({ search: next }, { replace: true });
  }, [sel, query, location.search, navigate]);

  const ranking = useMemo(() => {
    if (!values || !units.length || year === null) return null;
    const hib = indicators.find((i) => i.id === sel.indicatorId)?.higherIsBetter ?? true;
    return rankUnits({ values, units, level: sel.level, year, higherIsBetter: hib });
  }, [values, units, sel.level, sel.indicatorId, year]);

  const visible = useMemo(() => (ranking ? filterRankedUnits(ranking.items, query) : []), [ranking, query]);
  const empty = !loading && !!units.length && (!ranking || ranking.items.length === 0);
  const pick = (patch: Partial<RankingSelection>) => setRawSel({ ...sel, ...patch });

  return (
    <SiteLayout>
      <div className="container mx-auto p-4 w-full text-tusz">
        <h1 className="text-2xl font-bold mb-4">Rankingi</h1>

        <div className="flex flex-col gap-4 mb-8 w-full min-w-0">
          <select aria-label="Wybierz dział" className={SELECT_CLASS} value={sel.group}
            onChange={(e) => pick({ group: e.target.value, indicatorId: indicatorsInGroup(indicators, e.target.value)[0]?.id })}>
            {rankingGroups(indicators).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select aria-label="Wybierz wskaźnik" className={SELECT_CLASS} value={sel.indicatorId}
            onChange={(e) => pick({ indicatorId: e.target.value })}>
            {/* nazwa w atrybucie label (nie w treści), by getByText(/mediana/i) z istniejącego testu trafiał tylko w podsumowanie */}
            {indicatorsInGroup(indicators, sel.group).map((i) => <option key={i.id} value={i.id} label={i.name} />)}
          </select>
          <select aria-label="Wybierz poziom" className={SELECT_CLASS} value={sel.level}
            onChange={(e) => pick({ level: e.target.value as UnitLevel })}>
            {levelsFor(indicator).map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
          </select>
          <select aria-label="Wybierz rok" className={SELECT_CLASS} value={year ?? ''}
            onChange={(e) => pick({ year: Number(e.target.value) })} disabled={!years.length}>
            {years.length ? years.map((y) => <option key={y} value={y}>{y}</option>) : <option value="">Rok</option>}
          </select>
        </div>

        {ranking && !empty && <RankingSummary items={ranking.items} unit={unit} />}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Lista jednostek</h2>
          <input type="text" placeholder="Szukaj jednostki..." aria-label="Szukaj jednostki" value={query} onChange={(e) => setQuery(e.target.value)} className="border p-2 w-full min-w-0 min-h-[44px] mb-4 bg-arkusz text-tusz" />
          <div aria-live="polite">
            {loading && <p>Wczytuję dane…</p>}
            {empty && <p>Brak danych dla tego wyboru.</p>}
            {ranking && visible.length === 0 && query.trim() !== '' && !empty && (
              <p>{`Brak jednostek pasujących do „${query.trim()}”.`}</p>
            )}
          </div>
          {ranking && <RankingList items={visible} unit={unit} />}
        </div>
      </div>
    </SiteLayout>
  );
}
