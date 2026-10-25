import React, { Suspense } from 'react';
import type { ShareDialogProps } from './ShareDialog';

const ShareDialogComponent = React.lazy(() => import('./ShareDialog'));

export const LazyShareDialog: React.FC<ShareDialogProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <Suspense fallback={null}>
      <ShareDialogComponent {...props} />
    </Suspense>
  );
};

export default LazyShareDialog;
