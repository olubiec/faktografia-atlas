import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { OrderTopicButton } from '../../src/view/library/OrderTopicButton';
import { orderTopicUrl } from '../../src/core/library/order';

const BASE = 'https://github.com/olubiec/faktografia-atlas/issues/new?';

describe('orderTopicUrl (@S21)', () => {
  it('zamawia temat przez szablon zamowienie-wskaznika', () => {
    const url = orderTopicUrl('żłobki');
    expect(url.startsWith(BASE)).toBe(true);
    expect(url).toContain('template=zamowienie-wskaznika.yml');
    expect(url).toContain('nazwa=%C5%BC%C5%82obki');
    const p = new URL(url).searchParams;
    expect(p.get('id')).toBe('temat');
    expect(p.get('title')).toBe('Zamówienie danych na temat: żłobki');
  });

  it('poprawnie koduje &, #, spacje i polskie znaki', () => {
    const topic = 'szkoły & przedszkola #2 w gminie Łódź';
    const p = new URL(orderTopicUrl(topic)).searchParams;
    expect(p.get('nazwa')).toBe(topic);
  });

  it('przycina temat (trim, 200 znaków) i trzyma adres do 1800 znaków', () => {
    const p = new URL(orderTopicUrl('  ' + 'a'.repeat(500) + '  ')).searchParams;
    expect(p.get('nazwa')).toBe('a'.repeat(200));
    const long = orderTopicUrl('ż'.repeat(500));
    expect(long.length).toBeLessThanOrEqual(1800);
    expect(new URL(long).searchParams.get('nazwa')?.endsWith('…')).toBe(true);
  });

  it('pusty temat daje pustą nazwę; dział jest opcjonalny', () => {
    const p = new URL(orderTopicUrl('   ')).searchParams;
    expect(p.get('nazwa')).toBe('');
    expect(p.has('dzial')).toBe(false);
    expect(new URL(orderTopicUrl('x', ['Ludność', 'Demografia'])).searchParams.get('dzial')).toBe(
      'Ludność > Demografia',
    );
  });
});

describe('OrderTopicButton (@S21)', () => {
  it('bez tematu pokazuje ogólny tekst', () => {
    const html = renderToString(<OrderTopicButton />);
    expect(html).toContain('Zamów dane na temat…');
  });

  it('z tematem pokazuje tekst z cudzysłowem i zakodowany temat w href', () => {
    const html = renderToString(<OrderTopicButton topic="żłobki" />);
    expect(html).toContain('Zamów dane o „żłobki”');
    expect(html).toContain('nazwa=%C5%BC%C5%82obki');
  });

  it('otwiera nową kartę z noopener noreferrer i ma pole min. 44 px', () => {
    const html = renderToString(<OrderTopicButton topic="żłobki" />);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('min-h-[44px]');
  });

  it('wyjaśnia, że zgłoszenie wymaga konta GitHub i nic nie jest wysyłane bez zgody', () => {
    const html = renderToString(<OrderTopicButton />);
    expect(html).toContain('Nic nie wysyłamy bez Twojej zgody');
    expect(html).toContain('wymaga konta');
  });
});
