import React, { useEffect, useState } from 'react';
import { Sheet } from 'react-modal-sheet';
import { cn } from '@/lib/utils';
import { Icon } from '@/view/ui/Icon';
import { Xmark, NavArrowUp, NavArrowDown } from 'iconoir-react';

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

function SheetHeaderControls({
  onClose,
}: {
  onClose: () => void;
}) {
  const { currentSnap, snapTo } = Sheet.useContext();
  const isExpanded = currentSnap === 2;

  const handleToggleExpand = () => {
    console.log('[BottomSheet] handleToggleExpand CALLED! currentSnap =', currentSnap, 'isExpanded =', isExpanded);
    if (isExpanded) {
      snapTo(1);
    } else {
      snapTo(2);
    }
  };

  return (
    <Sheet.Header unstyled className="py-2 flex flex-col items-center cursor-grab relative min-h-[44px]">
      {/* Rozwiń / Zwiń (WCAG 2.5.7) */}
      <button
        type="button"
        onClick={handleToggleExpand}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-0 left-0 min-h-[44px] min-w-[44px] px-3 flex items-center gap-1.5 text-xs font-medium text-olowek hover:text-tusz focus:outline-none focus-visible:ring-2 focus-visible:ring-tusz cursor-pointer select-none"
        aria-label={isExpanded ? 'Zwiń' : 'Rozwiń'}
      >
        <Icon
          icon={isExpanded ? NavArrowDown : NavArrowUp}
          size={16}
          aria-hidden={true}
        />
        <span>{isExpanded ? 'Zwiń' : 'Rozwiń'}</span>
      </button>

      {/* Drag handle */}
      <div className="w-12 h-1 bg-olowek/40 mt-2 rounded-none" />

      {/* Close button - min touch target 44px */}
      <button
        type="button"
        onClick={onClose}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-0 right-0 w-[44px] h-[44px] min-w-[44px] min-h-[44px] flex items-center justify-center text-olowek hover:text-tusz focus:outline-none focus-visible:ring-2 focus-visible:ring-tusz cursor-pointer"
        aria-label="Zamknij"
      >
        <Icon icon={Xmark} aria-hidden={true} />
      </button>
    </Sheet.Header>
  );
}

function SheetContentBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentSnap } = Sheet.useContext();
  return (
    <Sheet.Content
      unstyled
      disableDrag={({ scrollPosition }) => scrollPosition !== 'top'}
      className="flex-1 overflow-hidden"
      scrollClassName={cn(
        'px-4 overflow-y-auto',
        currentSnap === 1 ? 'pb-[calc(60dvh+2rem)]' : 'pb-6'
      )}
      scrollStyle={{
        paddingBottom: currentSnap === 1 ? 'calc(60dvh + 2rem)' : undefined,
      }}
    >
      {children}
    </Sheet.Content>
  );
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

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

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      prefersReducedMotion={prefersReducedMotion}
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
        <SheetHeaderControls onClose={onClose} />
        <SheetContentBody>{children}</SheetContentBody>
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
