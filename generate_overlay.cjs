const fs = require('fs');

const pathData = fs.readFileSync('kalka-path.txt', 'utf8');

const content = `import { useState, useEffect } from 'react';
import tokens from '@/../config/tokens.json';

// Czysta logika osi czasu animacji wejściowej (zgodna z timeline.ts)
export function IntroOverlay() {
  const hasE2e = typeof window !== 'undefined' && window.location.search.includes('e2e');
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initialVisibility = !(hasE2e || reducedMotion);

  const [isVisible, setIsVisible] = useState(initialVisibility);
  const [stage, setStage] = useState<'outline' | 'done'>('outline');
  const shouldAnimate = initialVisibility;

  useEffect(() => {
    if (!initialVisibility) {
      return;
    }

    const duration = tokens.motion.drawOutline;
    const timer = setTimeout(() => {
      setStage('done');
      setIsVisible(false);
    }, duration + 50); // slight buffer

    return () => clearTimeout(timer);
  }, [initialVisibility]);

  if (!isVisible) return null;

  const outlineDuration = tokens.motion.drawOutline;

  return (
    <div className="absolute inset-0 z-[50] pointer-events-none flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 900 800"
        className="w-full h-full object-contain"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          d="${pathData}"
          fill="none"
          stroke="var(--tusz)"
          strokeWidth="1.5"
          className="stroke-tusz"
          style={{
            strokeDasharray: 20000,
            strokeDashoffset: stage === 'outline' ? 20000 : 0,
            transition: shouldAnimate ? \`stroke-dashoffset \${outlineDuration}ms \${tokens.motion.easing}\` : 'none',
          }}
        />
      </svg>
    </div>
  );
}
`;

fs.writeFileSync('src/view/map/IntroOverlay.tsx', content);
console.log('Created IntroOverlay.tsx');
