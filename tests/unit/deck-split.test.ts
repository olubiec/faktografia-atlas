import { describe, expect, it } from 'vitest';
import tokens from '../../config/tokens.json';
import { createDeck, numbering, type Deck, type DeckPage, type PageKind } from '../../src/core/share/deck';
import { getThemeColors, type CardItem, type TextItem } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';
import { renderTableContent, type TableCardRow } from '../../src/core/share/card-table';
import { PROFILE_ROW_LIMIT, TABLE_ROW_LIMIT, canSplit, splitHint, splitPage } from '../../src/core/share/deck-split';

const FORMATS: ShareFormatKey[] = ['post', 'square', 'story', 'wide'];
const LONGEST = 'Przeciętna pow. użytkowa mieszkania na osobę (m²)';
const ids = (n: number): string[] => Array.from({ length: n }, (_, i) => `i${i + 1}`);
const page = (kind: PageKind, n: number, extra: Partial<DeckPage> = {}): Omit<DeckPage, 'id'> => ({ kind, indicatorIds: ids(n), ...extra });
const flat = (d: Deck): string[] => d.pages.flatMap((p) => p.indicatorIds);

describe('deck-split', () => {
  it('tabela 10 wierszy w post: 2 strony (8 + 2), numeracja 1/5..5/5', () => {
    const deck = createDeck([page('map', 1), page('table', 10), page('ranking', 1), page('trend', 1)]);
    const out = splitPage(deck, 'p2', 'post');
    expect(out.pages.map((p) => p.indicatorIds.length)).toEqual([1, 8, 2, 1, 1]);
    expect(numbering(out).map((n) => n.label)).toEqual(['1/5', '2/5', '3/5', '4/5', '5/5']);
  });

  it('tabela 10 wierszy w story: nie dzieli, ta sama referencja', () => {
    const deck = createDeck([page('table', 10)]);
    expect(canSplit(deck.pages[0], 'story')).toBe(false);
    expect(splitPage(deck, 'p1', 'story')).toBe(deck);
  });

  it('tabela 25 wierszy w post: 8, 8, 8, 1', () => {
    const out = splitPage(createDeck([page('table', 25)]), 'p1', 'post');
    expect(out.pages.map((p) => p.indicatorIds.length)).toEqual([8, 8, 8, 1]);
  });

  it('profil 12 wskaźników: 5, 5, 2; compare dzieli się jak tabela', () => {
    const prof = splitPage(createDeck([page('profile', 12)]), 'p1', 'post');
    expect(PROFILE_ROW_LIMIT).toBe(5);
    expect(prof.pages.map((p) => p.indicatorIds.length)).toEqual([5, 5, 2]);
    const cmp = splitPage(createDeck([page('compare', 10)]), 'p1', 'post');
    expect(cmp.pages.map((p) => p.kind)).toEqual(['compare', 'compare']);
    expect(cmp.pages.map((p) => p.indicatorIds.length)).toEqual([8, 2]);
  });

  it.each(['map', 'ranking', 'bignumber', 'trend', 'histogram', 'versus'] as PageKind[])('%s nie dzieli się', (kind) => {
    const deck = createDeck([page(kind, 1)]);
    expect(canSplit(deck.pages[0], 'post')).toBe(false);
    expect(splitPage(deck, 'p1', 'post')).toBe(deck);
    expect(splitHint(deck.pages[0], 'post')).toBeNull();
  });

  it('brak strony: ta sama referencja', () => {
    const deck = createDeck([page('table', 10)]);
    expect(splitPage(deck, 'nie-ma', 'post')).toBe(deck);
  });

  it('zachowuje sumę i kolejność wskaźników, bez duplikatów', () => {
    const deck = createDeck([page('table', 25)]);
    const out = splitPage(deck, 'p1', 'post');
    expect(flat(out)).toEqual(flat(deck));
    expect(new Set(out.pages.map((p) => p.id)).size).toBe(out.pages.length);
    expect(out.pages[0].id).toBe('p1');
  });

  it('options.part/parts i side źródła', () => {
    const out = splitPage(createDeck([page('table', 10, { options: { side: 'top' } })]), 'p1', 'post');
    expect(out.pages.map((p) => [p.options?.part, p.options?.parts])).toEqual([[1, 2], [2, 2]]);
    expect(out.pages.every((p) => p.options?.side === 'top')).toBe(true);
  });

  it.each(FORMATS)('limit wierszy mieści się w karcie (%s)', (fmt) => {
    const { width, height, safe } = SHARE_FORMATS[fmt];
    const sf = width / 1080;
    const fontScale: Record<string, number> = {};
    for (const [k, v] of Object.entries(tokens.font.scale)) fontScale[k] = Math.round(v * sf);
    const contentTop = Math.round(200 * sf);
    const rows: TableCardRow[] = Array.from({ length: TABLE_ROW_LIMIT[fmt] }, () => ({ name: LONGEST, valueText: '28,4 m²', rank: '12. z 380' }));
    const items: CardItem[] = [];
    renderTableContent({
      data: { unitName: 'Kraków', year: 2024, rows }, contentTop,
      availableContentHeight: height - safe.bottom - Math.round(60 * sf) - contentTop,
      safe, safeWidth: width - safe.left - safe.right, fontScale, colors: getThemeColors('light'), items,
      measure: (t, s) => Math.round(0.55 * s * t.length), scaleFactor: sf,
    });
    const all = items.filter((i): i is TextItem => i.type === 'text').flatMap((t) => t.lines).join(' ');
    expect(all).not.toContain('jeszcze');
  });

  it('splitHint: polski tekst z liczbami', () => {
    const p = createDeck([page('table', 10)]).pages[0];
    const hint = splitHint(p, 'post')!;
    expect(hint).toContain('10 wskaźników');
    expect(hint).toContain('2 strony');
    expect(splitHint(createDeck([page('table', 3)]).pages[0], 'post')).toBeNull();
  });

  it('strona w środku: inne strony bez zmian (te same referencje)', () => {
    const deck = createDeck([page('map', 1), page('table', 10), page('trend', 1)]);
    const out = splitPage(deck, 'p2', 'post');
    expect(out.pages[0]).toBe(deck.pages[0]);
    expect(out.pages[out.pages.length - 1]).toBe(deck.pages[2]);
    expect(out.pages.map((p) => p.kind)).toEqual(['map', 'table', 'table', 'trend']);
  });
});
