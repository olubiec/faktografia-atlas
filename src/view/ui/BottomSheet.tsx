import React, { useEffect, useRef, useState } from 'react';
import { Sheet } from 'react-modal-sheet';
import { cn } from '@/lib/utils';
import { Icon } from '@/view/ui/Icon';
import { Xmark, NavArrowDown, NavArrowUp } from 'iconoir-react';
import type { SheetRef } from 'react-modal-sheet';

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
  snapPoints = [0, 0.4, 1],
  initialSnap = 1,
  title,
  children,
  noBackdrop = false,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<SheetRef>(null);
  const [snapIndex, setSnapIndex] = useState(initialSnap);
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const m = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      m.addEventListener('change', handler);
      return () => m.removeEventListener('change', handler);
    }
  }, []);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSnapIndex(initialSnap);
    }
  }

  const activeSnap = snapPoints[snapIndex] ?? 0;
  const isExpanded = activeSnap === 1;

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
      ref={sheetRef}
      prefersReducedMotion={reduceMotion}
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      onSnap={(index) => {
        setSnapIndex(index);
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
          {/* Przycisk Rozwiń/Zwiń - min touch target 44px */}
          <button
            type="button"
            onClick={() => sheetRef.current?.snapTo(isExpanded ? 1 : 2)}
            className="absolute top-0 left-0 w-[44px] h-[44px] min-w-[44px] min-h-[44px] flex items-center justify-center text-olowek"
            aria-label={isExpanded ? "Zwiń" : "Rozwiń"}
          >
            <Icon icon={isExpanded ? NavArrowDown : NavArrowUp} aria-hidden={true} />
          </button>

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
        <Sheet.Content
          unstyled
          className="px-4 pb-4"
          scrollClassName="overflow-y-auto"
          disableDrag={({ scrollPosition }) => scrollPosition !== 'top'}
          style={{ paddingBottom: activeSnap > 0 && activeSnap < 1 ? `calc(${(1 - activeSnap) * 100}dvh + 1rem)` : undefined }}
        >
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
