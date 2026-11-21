import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LevelSwitch } from '@/view/main/LevelSwitch';

/** Nazwy wyłączonych przycisków z wyrenderowanego HTML. */
const disabled = (html: string) =>
  [...html.matchAll(/<button[^>]*disabled[^>]*>([^<]*)</g)].map((m) => m[1]);

describe('LevelSwitch: poziomy z danymi', () => {
  it('wyłącza poziom bez danych, nawet gdy minLevel by go dopuszczał', () => {
    expect(disabled(renderToStaticMarkup(<LevelSwitch value="pow" minLevel="gmi" levels={['pow', 'gmi']} onChange={vi.fn<() => void>()} />)))
      .toEqual(['Województwa']);
  });

  it('bez listy poziomów działa jak dotąd (województwa zawsze)', () => {
    expect(disabled(renderToStaticMarkup(<LevelSwitch value="woj" minLevel="pow" onChange={vi.fn<() => void>()} />)))
      .toEqual(['Gminy']);
  });
});
