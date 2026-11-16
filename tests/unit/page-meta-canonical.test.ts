import { describe, test, expect } from 'vitest';
import { dropStaticDuplicates } from '../../src/view/layout/pageMetaHead';

// Brak środowiska DOM w Vitest: minimalny sztuczny <head> z selektorami z PageMeta.
type El = { sel: string; id: string; removed: boolean; remove: () => void };
function fakeDoc(items: { sel: string; id: string }[]) {
  const els: El[] = items.map((i) => ({
    ...i,
    removed: false,
    remove() {
      this.removed = true;
    },
  }));
  const doc = {
    querySelectorAll: (q: string) =>
      els.filter((e) => !e.removed && q.includes(e.sel)),
  } as unknown as Document;
  return { doc, els };
}

describe('PageMeta – jeden canonical', () => {
  test('statyczny canonical i og:url znikają, zostaje ostatni (z ?u=)', () => {
    const { doc, els } = fakeDoc([
      { sel: 'link[rel="canonical"]', id: 'static' },
      { sel: 'meta[property="og:url"]', id: 'static-og' },
      { sel: 'link[rel="canonical"]', id: 'react?u=1465011' },
      { sel: 'meta[property="og:url"]', id: 'react-og?u=1465011' },
    ]);
    dropStaticDuplicates(doc);
    const left = els.filter((e) => !e.removed).map((e) => e.id);
    expect(left).toEqual(['react?u=1465011', 'react-og?u=1465011']);
    expect(left.filter((i) => !i.includes('og'))).toHaveLength(1);
  });

  test('jedyny tag nie jest usuwany', () => {
    const { doc, els } = fakeDoc([{ sel: 'link[rel="canonical"]', id: 'one' }]);
    dropStaticDuplicates(doc);
    expect(els[0].removed).toBe(false);
  });
});
