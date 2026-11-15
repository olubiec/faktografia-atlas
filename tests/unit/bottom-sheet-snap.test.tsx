import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Przechwytujemy właściwości przekazane do Sheet z react-modal-sheet.
const captured: { props: Record<string, unknown> | null } = { props: null };

vi.mock('react-modal-sheet', () => {
  const Pass = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const Sheet = Object.assign(
    (props: Record<string, unknown> & { children?: React.ReactNode }) => {
      captured.props = props;
      return <div>{props.children}</div>;
    },
    {
      Container: ({ children, className, role, ...rest }: Record<string, any>) => (
        <div className={className} role={role} aria-label={rest['aria-label']}>
          {children}
        </div>
      ),
      Header: Pass,
      Content: Pass,
      Backdrop: () => null,
      useContext: () => ({ currentSnap: 1, snapTo: () => {} }),
    }
  );
  return { Sheet };
});

import { BottomSheet } from '../../src/view/ui/BottomSheet';

function renderDefault() {
  renderToString(
    <BottomSheet isOpen onClose={() => {}} title="Test">
      <p>treść</p>
    </BottomSheet>
  );
  return captured.props as { snapPoints: number[]; initialSnap: number };
}

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('window', {
    matchMedia: () => ({
      matches: reduce,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
}

describe('P4-C BottomSheet: punkty zatrzymania', () => {
  beforeEach(() => {
    captured.props = null;
    vi.unstubAllGlobals();
  });

  it('ma 3 punkty zatrzymania (ok. 0,25 / 0,6 / 0,95) plus zamknięcie, rosnąco', () => {
    const { snapPoints } = renderDefault();
    expect(snapPoints).toEqual([0, 0.25, 0.6, 0.95]);
    expect(snapPoints.filter((p) => p > 0)).toHaveLength(3);
    expect(snapPoints).toEqual([...snapPoints].sort((a, b) => a - b));
  });

  it('otwiera się na pierwszym (najniższym) punkcie, nie na zamkniętym', () => {
    const { snapPoints, initialSnap } = renderDefault();
    expect(snapPoints[initialSnap]).toBe(0.25);
  });

  it('reduced-motion wyłącza animacje arkusza', () => {
    mockReducedMotion(true);
    renderToString(
      <BottomSheet isOpen onClose={() => {}} title="Test">
        <p>x</p>
      </BottomSheet>
    );
    expect(captured.props?.prefersReducedMotion).toBe(true);
  });

  it('bez reduced-motion animacje są włączone', () => {
    mockReducedMotion(false);
    renderToString(
      <BottomSheet isOpen onClose={() => {}} title="Test">
        <p>x</p>
      </BottomSheet>
    );
    expect(captured.props?.prefersReducedMotion).toBe(false);
  });

  it('ma aria-label i dolny bezpieczny obszar', () => {
    const html = renderToString(
      <BottomSheet isOpen onClose={() => {}} title="Profil gminy">
        <p>x</p>
      </BottomSheet>
    );
    expect(html).toContain('aria-label="Profil gminy"');
    expect(html).toContain('safe-area-inset-bottom');
  });
});
