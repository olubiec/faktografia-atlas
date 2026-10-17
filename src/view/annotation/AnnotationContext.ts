import { createContext } from 'react';
import { AnnotationManager } from '../../core/annotation/annotationManager';

const globalFallbackManager = new AnnotationManager();

export const AnnotationContext = createContext<AnnotationManager>(globalFallbackManager);
