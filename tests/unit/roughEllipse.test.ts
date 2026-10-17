import { describe, it, expect, beforeEach } from 'vitest';
import { roughEllipse } from '../../src/view/annotation/roughEllipse';

class MockSVGElement {
  tagName = 'g';
  attributes: Record<string, string> = {};
  children: MockSVGElement[] = [];
  parentNode: MockSVGElement | null = null;

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  getAttribute(name: string) {
    return this.attributes[name] || null;
  }

  appendChild(child: MockSVGElement) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
}

class MockSVGSVGElement extends MockSVGElement {
  override tagName = 'svg';

  createSVGMatrix() {
    return {};
  }

  createSVGPoint() {
    return { x: 0, y: 0 };
  }
}

if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).window = globalThis;
}

if (typeof globalThis.getComputedStyle === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).getComputedStyle = () => ({
    getPropertyValue: (prop: string) => (prop === '--korekta' ? '#E3242B' : ''),
  });
}

if (typeof globalThis.document === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).document = {
    createElementNS(_ns: string, name: string) {
      if (name === 'svg') return new MockSVGSVGElement();
      return new MockSVGElement();
    },
    documentElement: {
      style: {
        getPropertyValue(prop: string) {
          if (prop === '--korekta') return '#E3242B';
          return '';
        },
      },
    },
  };
}

describe('roughEllipse', () => {
  beforeEach(() => {
    // reset if needed
  });

  it('draws an ellipse SVG element with stroke matching korekta color and returns SVGGElement', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as SVGSVGElement;

    const bbox = { x: 10, y: 20, width: 100, height: 50 };
    const g = roughEllipse(svg, bbox);

    expect(g).toBeDefined();

    const stroke = g.getAttribute('stroke');
    expect(stroke?.toLowerCase()).toBe('#e3242b');
  });

  it('allows overriding stroke color via options', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as SVGSVGElement;
    const bbox = { x: 0, y: 0, width: 40, height: 40 };
    const g = roughEllipse(svg, bbox, { color: '#FF5A5F' });

    expect(g.getAttribute('stroke')?.toLowerCase()).toBe('#ff5a5f');
  });
});
