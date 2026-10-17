import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import { SearchField } from '../../src/view/ui/SearchField';
import { Sheet } from '../../src/view/ui/Sheet';
import { Icon } from '../../src/view/ui/Icon';

describe('CC2.1 UI Components Unit Tests', () => {
  it('renders Button with correct variants and classes', () => {
    const htmlPrimary = renderToString(<Button variant="default">Primary</Button>);
    expect(htmlPrimary).toContain('min-h-[44px]');
    expect(htmlPrimary).toContain('rounded-none');
    expect(htmlPrimary).not.toContain('shadow-');

    const htmlSecondary = renderToString(<Button variant="secondary">Secondary</Button>);
    expect(htmlSecondary).toContain('border-tusz');

    const htmlGhost = renderToString(<Button variant="ghost">Ghost</Button>);
    expect(htmlGhost).toContain('hover:underline');
  });

  it('renders Input and Label correctly', () => {
    const htmlInput = renderToString(<Input placeholder="Test placeholder" />);
    expect(htmlInput).toContain('min-h-[44px]');
    expect(htmlInput).toContain('bg-arkusz');
    expect(htmlInput).toContain('text-[17px]');

    const htmlLabel = renderToString(<Label>Test Label</Label>);
    expect(htmlLabel).toContain('text-[17px]');
  });

  it('renders SearchField with required label and placeholder', () => {
    const htmlSearch = renderToString(<SearchField />);
    expect(htmlSearch).toContain('Szukaj miejsca');
    expect(htmlSearch).toContain('Gmina, powiat albo miejscowość');
  });

  it('renders Sheet with arkusz background and 24px padding', () => {
    const htmlSheet = renderToString(<Sheet>Sheet Content</Sheet>);
    expect(htmlSheet).toContain('bg-arkusz');
    expect(htmlSheet).toContain('border-linia');
    expect(htmlSheet).toContain('p-6');
    expect(htmlSheet).not.toContain('shadow-');
  });

  it('renders Icon with strokeWidth 1.5 and 20px size requirement', () => {
    const DummyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />;
    const htmlIcon = renderToString(<Icon icon={DummyIcon} aria-label="Nawigacja" />);
    expect(htmlIcon).toContain('stroke-width="1.5"');
    expect(htmlIcon).toContain('width="20"');
    expect(htmlIcon).toContain('height="20"');
    expect(htmlIcon).toContain('aria-label="Nawigacja"');
  });
});
