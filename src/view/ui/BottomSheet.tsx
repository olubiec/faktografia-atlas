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

  // IMPORTANT: react-modal-sheet interprets `initialSnap` as the index in the `snapPoints` array.
  // If `snapPoints` is `[1, 0.4, 0]` and we want it to open at 40%, `initialSnap` should be `1`.
  // The fact that it is opening at ~95% height in tests means it's opening at index 0 (which is `1` i.e. 100%).
  // Let's force initialSnap to 1 if it's undefined, but also the prop is defaulted to 1.

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      onSnap={(index) => {
        if (snapPoints[index] === 0) {
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
        <Sheet.Content unstyled className="flex-1 min-h-0 px-4 pb-4 overflow-y-auto">
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
