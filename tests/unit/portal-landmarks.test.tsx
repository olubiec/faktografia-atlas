import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { PortalSections } from '../../src/view/home/PortalSections';

describe('PortalSections – punkty orientacyjne (N-25)', () => {
  const html = renderToString(
    <MemoryRouter>
      <PortalSections />
    </MemoryRouter>
  );

  it('nie renderuje własnego <main> (jedyny main należy do Home)', () => {
    expect(html).not.toContain('<main');
  });

  it('opakowuje działy w <section> z nazwą dostępną', () => {
    expect(html).toMatch(/<section[^>]*aria-label="Działy i skróty"/);
  });
});
