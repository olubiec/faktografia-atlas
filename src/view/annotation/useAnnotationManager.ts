// Hook dostępu do AnnotationManager

import { useContext } from 'react';
import { AnnotationContext } from './AnnotationContext';
import type { AnnotationManager } from '../../core/annotation/annotationManager';

export const useAnnotationManager = (): AnnotationManager => {
  return useContext(AnnotationContext);
};
