// Wszystkie strony tematów i zestawień (W26-F04) dla generatora scripts/seo/build-pages.mjs i ich mapa strony.
import type { FactsShard } from '../facts/build';
import { decodeFact } from '../facts/codec';
import type { Fact } from '../facts/types';
import { renderDiscoverIndex, renderListPage, renderTopicPage } from './discover-template';
import { buildListPage, type DiscoverContext } from './list-page';
import type { PageAssets } from './page-template';
import { buildTopicPage } from './topic-page';
import { DISCOVER_INDEX, topicsOf } from './topics';

export const DISCOVER_SITEMAP = 'sitemap-tematy.xml';

export interface BuiltDiscoverPage {
  path: string;
  html: string;
  indexable: boolean;
  lastmod: string;
  kind: 'topic' | 'list' | 'index';
}

/** Fakty ze wszystkich plików public/data/facts/<WW>.json. */
export function factsFromShards(shards: readonly Pick<FactsShard, 'units'>[]): Fact[] {
  return shards.flatMap((s) => Object.entries(s.units).flatMap(([teryt, list]) => list.map((e) => decodeFact(teryt, e))));
}

/** Sprawdza config/lists.json: unikalne adresy i tytuły, znane wskaźniki, poziom gmin albo powiatów. */
export function validateLists(ctx: Pick<DiscoverContext, 'lists' | 'indicators'>): string[] {
  const problems: string[] = [];
  const seen = { slug: new Set<string>(), title: new Set<string>(), h1: new Set<string>() };
  for (const l of ctx.lists.lists) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.slug)) problems.push(`${l.slug}: adres tylko z małych liter, cyfr i „-”`);
    if (!ctx.indicators.some((i) => i.id === l.indicatorId)) problems.push(`${l.slug}: nieznany wskaźnik ${l.indicatorId}`);
    if (l.level !== 'gmi' && l.level !== 'pow') problems.push(`${l.slug}: poziom ${String(l.level)} (dozwolone gmi, pow)`);
    if (l.title.length > 58) problems.push(`${l.slug}: tytuł ma ${l.title.length} znaków (limit 58)`);
    for (const key of ['slug', 'title', 'h1'] as const) {
      if (seen[key].has(l[key])) problems.push(`${l.slug}: powtórzone pole ${key}`);
      seen[key].add(l[key]);
    }
  }
  return problems;
}

/** 7 tematów, wszystkie zestawienia i spis `/zestawienia`. */
export function buildDiscoverSite(ctx: DiscoverContext, facts: readonly Fact[], assets: PageAssets): BuiltDiscoverPage[] {
  const problems = validateLists(ctx);
  if (problems.length) throw new Error(`config/lists.json: ${problems.join('; ')}`);
  const topics = topicsOf(ctx.indicators);
  const pages: BuiltDiscoverPage[] = [];
  for (const topic of topics) {
    const page = buildTopicPage(topic, topics, facts, ctx);
    pages.push({ path: page.path, html: renderTopicPage(page, assets), indexable: true, lastmod: page.lastmod, kind: 'topic' });
  }
  for (const def of ctx.lists.lists) {
    const page = buildListPage(def, ctx);
    pages.push({ path: page.path, html: renderListPage(page, assets), indexable: page.indexable, lastmod: page.lastmod, kind: 'list' });
  }
  const lastmod = pages.map((p) => p.lastmod).sort().at(-1) ?? new Date(0).toISOString();
  pages.push({ path: DISCOVER_INDEX, html: renderDiscoverIndex(topics, ctx.lists.lists, lastmod, assets), indexable: true, lastmod, kind: 'index' });
  return pages;
}
