import React, { useEffect } from 'react';
import { Sheet } from 'react-modal-sheet';
import { cn } from '@/lib/utils';
import { Icon } from '@/view/ui/Icon';
import { Xmark } from 'iconoir-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: number[];
  initialSnap?: number;
  title: string;
  children: React.ReactNode;
  noBackdrop?: boolean;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  snapPoints = [1, 0.4, 0], // By default react-modal-sheet expects points from highest to lowest. 1 means 100% height, 0.4 means 40% height.
  initialSnap = 1, // index 1 corresponds to 0.4 height.
  title,
  children,
  noBackdrop = false,
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Normalize snapPoints if user passes it as [0.4, 1] instead of [1, 0.4] per task instruction
  const normalizedSnapPoints = snapPoints && snapPoints[0] < snapPoints[snapPoints.length - 1]
    ? [...snapPoints].reverse()
    : snapPoints;
  const normalizedInitialSnap = snapPoints && snapPoints[0] < snapPoints[snapPoints.length - 1]
    ? (normalizedSnapPoints.length - 1 - (initialSnap || 0))
    : initialSnap;


  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={normalizedSnapPoints}
      initialSnap={normalizedInitialSnap}
      onSnap={(index) => {
        if (normalizedSnapPoints[index] === 0) {
          onClose();
        }
      }}
      unstyled
      className={cn('z-50', className, noBackdrop ? 'pointer-events-none' : '')}
    >
      <Sheet.Container
        unstyled
        className={cn(
          "bg-arkusz border-t border-linia text-tusz flex flex-col shadow-none rounded-none max-w-full w-full mx-auto pb-[env(safe-area-inset-bottom)]",
          noBackdrop ? 'pointer-events-auto' : ''
        )}
        style={{ height: '100dvh' }}
        role="dialog"
        aria-label={title}
      >
        <Sheet.Header unstyled className="py-2 flex flex-col items-center cursor-grab relative">
          {/* Drag handle */}
          <div className="w-12 h-1 bg-olowek/40 mt-2 rounded-none" />

          {/* Close button - min touch target 44px */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-0 w-[44px] h-[44px] min-w-[44px] min-h-[44px] flex items-center justify-center text-olowek"
            aria-label="Zamknij"
          >
            <Icon icon={Xmark} aria-hidden={true} />
          </button>
        </Sheet.Header>
        <Sheet.Content unstyled className="px-4 pb-4 overflow-y-auto">
          {children}
        </Sheet.Content>
      </Sheet.Container>
      {!noBackdrop && (
        <Sheet.Backdrop
          unstyled
          className="bg-tusz/20 pointer-events-auto"
          style={{ opacity: 1 }}
          aria-label="Zamknij arkusz"
          onClick={onClose}
        />
      )}
      {noBackdrop && (
        <Sheet.Backdrop unstyled className="pointer-events-none opacity-0" />
      )}
    </Sheet>
  );
}
