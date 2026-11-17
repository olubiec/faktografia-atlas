// Testy paska „Kopiuj link · Pobierz i udostępnij”.
// W projekcie nie ma biblioteki DOM, więc hooki Reacta są podmienione prostą
// atrapą (stan w tablicy), a drzewo elementów przeglądamy bez renderowania do DOM.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ReactElement, ReactNode } from 'react';

const hooks = vi.hoisted(() => ({
  slots: [] as unknown[],
  idx: 0,
  cleanups: [] as Array<() => void>,
}));

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  const useState = <T,>(init: T | (() => T)) => {
    const i = hooks.idx++;
    if (!(i in hooks.slots)) {
      hooks.slots[i] = typeof init === 'function' ? (init as () => T)() : init;
    }
    const set = (v: T | ((p: T) => T)) => {
      hooks.slots[i] = typeof v === 'function' ? (v as (p: T) => T)(hooks.slots[i] as T) : v;
    };
    return [hooks.slots[i] as T, set] as const;
  };
  const useRef = <T,>(init: T) => {
    const i = hooks.idx++;
    if (!(i in hooks.slots)) hooks.slots[i] = { current: init };
    return hooks.slots[i] as { current: T };
  };
  const useEffect = (fn: () => void | (() => void)) => {
    // Efekty nie są uruchamiane przy renderze; zapisujemy tylko sprzątanie.
    void fn;
  };
  const mocked = { ...actual, useState, useRef, useEffect };
  return { ...mocked, default: mocked };
});

import { ShareBar, type ShareBarProps } from '../../src/view/share/ShareBar';

type El = ReactElement<{ children?: ReactNode; [k: string]: unknown }>;

function render(props: ShareBarProps = {}): El {
  hooks.idx = 0;
  return ShareBar(props) as El;
}

function walk(node: ReactNode, out: El[] = []): El[] {
  if (Array.isArray(node)) node.forEach((n) => walk(n, out));
  else if (node && typeof node === 'object' && 'props' in node) {
    out.push(node as El);
    walk((node as El).props.children, out);
  }
  return out;
}

function text(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join('');
  return text((node as El).props.children);
}

const buttons = (t: El) => walk(t).filter((e) => e.type === 'button');
const byText = (t: El, s: string) => buttons(t).find((b) => text(b).includes(s));
const field = (t: El) => walk(t).find((e) => e.type === 'input');
const flush = () => new Promise<void>((r) => queueMicrotask(r));

beforeEach(() => {
  hooks.slots = [];
  hooks.idx = 0;
  vi.useFakeTimers();
  vi.stubGlobal('window', { location: { href: 'https://atlas.test/mapa?x=1' } });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function stubClipboard(writeText: (s: string) => Promise<void>) {
  vi.stubGlobal('navigator', { clipboard: { writeText } });
}

describe('ShareBar', () => {
  it('klik „Kopiuj link” kopiuje bieżący adres, pokazuje „Skopiowano” i po 2 s wraca', async () => {
    const writeText = vi.fn<(s: string) => Promise<void>>().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const click = byText(render(), 'Kopiuj link')!.props.onClick as () => void;
    click();
    await flush();
    expect(writeText).toHaveBeenCalledWith('https://atlas.test/mapa?x=1');
    expect(text(render())).toContain('Skopiowano');
    vi.advanceTimersByTime(2000);
    const after = render();
    expect(text(after)).toContain('Kopiuj link');
    expect(text(after)).not.toContain('Skopiowano');
  });

  it('podany url ma pierwszeństwo przed location.href', async () => {
    const writeText = vi.fn<(s: string) => Promise<void>>().mockResolvedValue(undefined);
    stubClipboard(writeText);
    (byText(render({ url: 'https://atlas.test/inny' }), 'Kopiuj link')!.props.onClick as () => void)();
    await flush();
    expect(writeText).toHaveBeenCalledWith('https://atlas.test/inny');
  });

  it('brak schowka → pole z linkiem i „Skopiuj ręcznie”, bez wyjątku', async () => {
    vi.stubGlobal('navigator', {});
    const click = byText(render(), 'Kopiuj link')!.props.onClick as () => void;
    expect(() => click()).not.toThrow();
    await flush();
    const t = render();
    expect(field(t)!.props.value).toBe('https://atlas.test/mapa?x=1');
    expect(field(t)!.props.readOnly).toBe(true);
    expect(text(t)).toContain('Skopiuj ręcznie');
  });

  it('odrzucenie obietnicy schowka → pole z linkiem, bez wyjątku', async () => {
    stubClipboard(vi.fn<(s: string) => Promise<void>>().mockRejectedValue(new Error('odmowa')));
    (byText(render(), 'Kopiuj link')!.props.onClick as () => void)();
    await flush();
    await flush();
    const t = render();
    expect(field(t)!.props.value).toBe('https://atlas.test/mapa?x=1');
    expect(text(t)).toContain('Skopiuj ręcznie');
    expect(text(t)).not.toContain('Skopiowano');
  });

  it('„Pobierz i udostępnij” woła onOpenDialog raz; showDownload={false} ukrywa przycisk', () => {
    const onOpenDialog = vi.fn<() => void>();
    const t = render({ onOpenDialog });
    (byText(t, 'Pobierz i udostępnij')!.props.onClick as () => void)();
    expect(onOpenDialog).toHaveBeenCalledTimes(1);
    expect(byText(render({ onOpenDialog, showDownload: false }), 'Pobierz i udostępnij')).toBeUndefined();
  });

  it('sam render nie dotyka schowka ani okna', () => {
    const writeText = vi.fn<(s: string) => Promise<void>>();
    stubClipboard(writeText);
    const onOpenDialog = vi.fn<() => void>();
    render({ onOpenDialog });
    expect(writeText).not.toHaveBeenCalled();
    expect(onOpenDialog).not.toHaveBeenCalled();
  });

  it('dostępność: oba przyciski mają nazwy, a „Skopiowano” jest w role="status" z aria-live', async () => {
    stubClipboard(vi.fn<(s: string) => Promise<void>>().mockResolvedValue(undefined));
    const t = render({ onOpenDialog: () => {} });
    expect(text(byText(t, 'Kopiuj link')!).trim()).not.toBe('');
    expect(text(byText(t, 'Pobierz i udostępnij')!).trim()).not.toBe('');
    (byText(t, 'Kopiuj link')!.props.onClick as () => void)();
    await flush();
    const status = walk(render()).find((e) => e.props.role === 'status')!;
    expect(status.props['aria-live']).toBe('polite');
    expect(text(status)).toContain('Skopiowano');
  });

  it('plik nie importuje ShareDialog (ciężki kod okna ładuje się po kliknięciu)', () => {
    const src = readFileSync('src/view/share/ShareBar.tsx', 'utf8');
    expect(src).not.toMatch(/ShareDialog/);
  });
});
