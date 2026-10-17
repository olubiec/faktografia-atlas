// Kontekst Reacta dla wyznaczania aktywnego zakreślenia (zarządzanie zasadą "jedno zakreślenie na ekranie").

import React, { useState } from 'react';
import { AnnotationManager } from '../../core/annotation/annotationManager';
import { AnnotationContext } from './AnnotationContext';

export const AnnotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manager] = useState(() => new AnnotationManager());

  return (
    <AnnotationContext.Provider value={manager}>
      {children}
    </AnnotationContext.Provider>
  );
};
