import { describe, it, expect, beforeEach } from 'vitest';
import { AnnotationManager } from '../../src/core/annotation/annotationManager';

describe('AnnotationManager', () => {
  let manager: AnnotationManager;

  beforeEach(() => {
    manager = new AnnotationManager();
  });

  it('allows registering and activating an annotation', () => {
    manager.setActive('ann-1');
    expect(manager.getActiveId()).toBe('ann-1');
  });

  it('ensures highest one active annotation at a time (hides previous)', () => {
    const hidden: string[] = [];
    manager.subscribe('ann-1', () => hidden.push('ann-1'));
    manager.subscribe('ann-2', () => hidden.push('ann-2'));

    manager.setActive('ann-1');
    expect(manager.getActiveId()).toBe('ann-1');

    manager.setActive('ann-2');
    expect(manager.getActiveId()).toBe('ann-2');
    expect(hidden).toEqual(['ann-1']);
  });

  it('allows deactivating active annotation', () => {
    manager.setActive('ann-1');
    manager.clearActive('ann-1');
    expect(manager.getActiveId()).toBeNull();
  });

  it('does not deactivate if another annotation is active', () => {
    manager.setActive('ann-1');
    manager.setActive('ann-2');
    manager.clearActive('ann-1');
    expect(manager.getActiveId()).toBe('ann-2');
  });
});
