import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { SiteFooter } from '../../src/view/layout/SiteFooter';
import type { DataStatus } from '../../src/core/data/load-status';

const status = (checkedAt: string): DataStatus => ({
  version: 1,
  checkedAt,
  values: { count: 1, latestFetchedAt: '2026-10-19T03:00:00Z', latestYear: 2024, oldestFetchedAt: null },
  library: null,
});
const render = (s: DataStatus | null) =>
  renderToString(
    <MemoryRouter>
      <SiteFooter initialStatus={s} />
    </MemoryRouter>,
  );
const recent = () => new Date(Date.now() - 3_600_000).toISOString();

describe('stopka: świeżość danych (PU02)', () => {
  it('ze świeżym statusem pokazuje „Sprawdzone przez automat” i datę danych', () => {
    const html = render(status(recent()));
    expect(html).toContain('Sprawdzone przez automat');
    expect(html).toContain('Dane z 19.10.2026');
  });
  it('bez pliku statusu stopka jest jak dotąd (bez „Sprawdzone”)', () => {
    expect(render(null)).not.toContain('Sprawdzone');
  });
  it('status sprzed 5 dni dopisuje „Uwaga”', () => {
    expect(render(status(new Date(Date.now() - 5 * 86_400_000).toISOString()))).toContain('Uwaga');
  });
});
