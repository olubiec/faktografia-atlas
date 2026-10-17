// Komponent Reacta otaczający treść zakreśleniem czerwonym długopisem (rough-notation).

import React, { useEffect, useRef, useId, useCallback } from 'react';
import { annotate } from 'rough-notation';
import type { RoughAnnotation, RoughAnnotationType } from 'rough-notation/lib/model';
import { useAnnotationManager } from './useAnnotationManager';

export interface AnnotateProps {
  type: RoughAnnotationType;
  children: React.ReactNode;
  show?: boolean;
  className?: string;
  as?: React.ElementType;
}

function getKorektaColor(): string {
  if (typeof window !== 'undefined' && typeof getComputedStyle !== 'undefined' && document.documentElement) {
    const computed = getComputedStyle(document.documentElement)
      .getPropertyValue('--korekta')
      .trim();
    if (computed) return computed;
  }
  return '#E3242B';
}

export const Annotate: React.FC<AnnotateProps> = ({
  type,
  children,
  show = true,
  className,
  as: Component = 'span',
}) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const annotationRef = useRef<RoughAnnotation | null>(null);
  const manager = useAnnotationManager();
  const id = useId();

  const createAndShowAnnotation = useCallback(() => {
    if (!elementRef.current) return;

    if (annotationRef.current) {
      annotationRef.current.remove();
      annotationRef.current = null;
    }

    const color = getKorektaColor();
    const isReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const annotation = annotate(elementRef.current, {
      type,
      color,
      strokeWidth: 2.5,
      iterations: 2,
      padding: 6,
      animationDuration: 600,
      animate: !isReducedMotion,
    });

    annotationRef.current = annotation;
    annotation.show();
  }, [type]);

  const hideAnnotation = useCallback(() => {
    if (annotationRef.current) {
      annotationRef.current.hide();
    }
  }, []);

  // Subskrypcja do manager (reakcja na aktywowanie innego zakreślenia)
  useEffect(() => {
    const unsubscribe = manager.subscribe(id, () => {
      hideAnnotation();
    });
    return () => {
      unsubscribe();
    };
  }, [manager, id, hideAnnotation]);

  // Obsługa propa show oraz zmian konfiguracji
  useEffect(() => {
    if (show) {
      manager.setActive(id);
      createAndShowAnnotation();
    } else {
      manager.clearActive(id);
      hideAnnotation();
    }
  }, [show, id, manager, createAndShowAnnotation, hideAnnotation]);

  // Przerysowanie przy zmianie motywu (MutationObserver na HTML data-theme)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleThemeChange = () => {
      if (manager.getActiveId() === id) {
        createAndShowAnnotation();
      }
    };

    const observer = new MutationObserver(() => {
      handleThemeChange();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });

    return () => {
      observer.disconnect();
    };
  }, [id, manager, createAndShowAnnotation]);

  // Sprzątanie przy odmontowaniu
  useEffect(() => {
    return () => {
      if (annotationRef.current) {
        annotationRef.current.remove();
        annotationRef.current = null;
      }
    };
  }, []);

  return (
    <Component ref={elementRef} className={className}>
      {children}
    </Component>
  );
};
