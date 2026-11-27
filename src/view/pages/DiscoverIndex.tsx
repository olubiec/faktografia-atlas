import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { SiteLayout } from '../layout/SiteLayout';
import { DataMenu } from '../data-menu/DataMenu';
import { useIsMobile } from '../hooks/useIsMobile';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../start/ListPodium';
import indicators from '../../../config/indicators.json';
import listsConfig from '../../../config/lists.json';
import { DISCOVER_INDEX, DISCOVER_INDEX_NAME, listPath, plural, topicsOf, type TopicIndicator } from '@/core/seo/topics';
import { mapHref } from '@/core/start/discoveries';
import { useIndicatorRegistry } from '../hooks/useIndicatorRegistry';
import { RANKINGS_DEFAULTS, writeRankingsParams } from '@/core/ranking/rankings-url';
import { RankingsView } from '../ranking/RankingsView';

const DESCRIPTION = 'Zestawienia gmin i powiatów Polski: ludność, praca, pieniądze, mieszkania i inne. Dane GUS.';

/**
 * Spis „Tematy i zestawienia” (`/zestawienia`): to samo menu „Wybierz dane” co przy mapie (działy, grupy, szukajka)
 * oraz gotowe zestawienia pogrupowane tematami. Statyczna wersja tej strony (scripts/seo) jest dla wyszukiwarek
 * i czytelna bez JavaScriptu; po wczytaniu przejmuje ją ta.
 */
export function DiscoverIndex() {
  const [picked, setPicked] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  // Ranking jest na tej samej stronie: stan (wskaźnik, poziom, rok…) siedzi w adresie, więc link działa po wysłaniu dalej.
  const showRanking = params.has('i');
  const { registry } = useIndicatorRegistry();
  const pickedName = picked ? (registry.byId.get(picked)?.name ?? null) : null;
  const mobile = useIsMobile();
  const lists = listsConfig.lists;
  const topics = topicsOf(indicators as TopicIndicator[]).map((t) => ({ ...t, own: lists.filter((l) => t.indicators.some((i) => i.id === l.indicatorId)) }));
  return (
    <SiteLayout meta={{ title: 'Tematy i zestawienia gmin i powiatów – dane GUS', description: DESCRIPTION, canonical: DISCOVER_INDEX }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12 text-tusz">
        <nav aria-label="Okruszki" className="text-sm">
          <ol className="flex flex-wrap gap-x-4">
            <li><Link to="/" className="inline-flex min-h-[44px] items-center underline underline-offset-4">Faktografia</Link></li>
            <li><span aria-current="page" className="inline-flex min-h-[44px] items-center text-olowek">{DISCOVER_INDEX_NAME}</span></li>
          </ol>
        </nav>
        <h1 className="mt-6 break-words text-3xl font-extrabold leading-tight md:text-4xl">{DISCOVER_INDEX_NAME}</h1>
        <p className="mt-4 max-w-prose">
          {`${plural(topics.length, 'temat', 'tematy', 'tematów')} i ${plural(lists.length, 'zestawienie', 'zestawienia', 'zestawień')} z danych Banku Danych Lokalnych GUS. Każde zestawienie obejmuje całą listę porównanych jednostek, po 50 pozycji na stronę, z linkami do stron miejsc.`}
        </p>

        {showRanking && (
          <div className="mt-8" data-slot="discover-ranking-view">
            <RankingsView />
            <p className="mt-4">
              <Link to={DISCOVER_INDEX} className={BUTTON_SECONDARY} data-slot="discover-back">Wybierz inne dane</Link>
            </p>
          </div>
        )}

        {!showRanking && (
        <section aria-labelledby="wybierz-dane" className="mt-12 md:mt-16" data-slot="discover-menu">
          <h2 id="wybierz-dane" className="text-xl font-bold">Wybierz dane</h2>
          <p className="mt-2 max-w-prose text-sm text-olowek">Dział, grupa, wskaźnik – to samo menu co przy mapie. Po wyborze wskaźnika zobaczysz jego ranking albo mapę.</p>
          <div className="mt-4 border border-linia bg-arkusz p-4 md:p-6">
            <DataMenu selectedId={picked} onSelect={setPicked} onClose={() => undefined} layout={mobile ? 'stack' : 'columns'} />
          </div>
          {picked && (
            <div className="mt-4 flex flex-col gap-3 border border-tusz bg-arkusz p-4 md:flex-row md:items-center md:justify-between" role="status" data-slot="discover-picked">
              <p className="m-0 font-bold">{pickedName ?? 'Wybrany wskaźnik'}</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setParams(writeRankingsParams({ ...RANKINGS_DEFAULTS, i: picked }))} className={`${BUTTON_PRIMARY} cursor-pointer`} data-slot="discover-ranking">Pokaż ranking</button>
                <Link to={mapHref({ indicatorId: picked })} className={BUTTON_SECONDARY} data-slot="discover-map">Zobacz na mapie</Link>
              </div>
            </div>
          )}
        </section>
        )}

        {topics.map((t, i) => (
          <section key={t.slug} aria-labelledby={`t${i + 1}`} className="mt-12 md:mt-16">
            <h2 id={`t${i + 1}`} className="text-xl font-bold">{t.name}</h2>
            <p className="mt-3"><a href={t.path} className={BUTTON_PRIMARY}>{`Zobacz temat: ${t.name}`}</a></p>
            {t.own.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-3">
                {t.own.map((l) => (
                  <li key={l.slug}><a href={listPath(l.slug)} className={BUTTON_SECONDARY}>{l.h1}</a></li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </SiteLayout>
  );
}
