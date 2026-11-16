import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import { DEFAULT_SELECTION } from '../../src/core/ranking/ranking-options';
import { isExternalRankingChange, parseRankingParams, rankingSearch } from '../../src/core/ranking/ranking-url';

const other = indicators.find((i) => i.id !== DEFAULT_SELECTION.indicatorId)!;
const written = (search: string) => {
  const p = parseRankingParams(search, indicators);
  return rankingSearch(p.selection, p.query);
};

describe('isExternalRankingChange', () => {
  it('ten sam adres co ostatnio zapisany → false', () => {
    const last = written(`?i=${other.id}&l=pow`);
    expect(isExternalRankingChange(last, last, indicators)).toBe(false);
  });

  it('inna kolejność parametrów → false', () => {
    const last = written(`?i=${other.id}&l=pow`);
    expect(isExternalRankingChange(`?l=pow&i=${other.id}`, last, indicators)).toBe(false);
  });

  it('pusty adres wobec innego wskaźnika → true', () => {
    expect(isExternalRankingChange('', written(`?i=${other.id}`), indicators)).toBe(true);
  });

  it('pierwsze wejście (null) → false, bo stan pochodzi z tego adresu', () => {
    expect(isExternalRankingChange(`?i=${other.id}&l=pow`, null, indicators)).toBe(false);
    expect(isExternalRankingChange('', null, indicators)).toBe(false);
  });

  it('zmiana samego q → true', () => {
    expect(isExternalRankingChange('?q=ski', written(''), indicators)).toBe(true);
  });
});
