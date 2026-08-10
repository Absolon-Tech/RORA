'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * The arrival.
 *
 * Soft Ivory with the dark wordmark, then an extremely slow bleed into Potting Soil while the
 * wordmark cross-fades to its light variant. The swap is timed to the middle of the colour
 * transition, so contrast never dips — at no point is a dark mark sitting on a dark ground.
 *
 * Deliberately not a loading spinner. Nothing is loading; this is a held beat before the film.
 *
 * Two concessions to the visitor: any interaction fast-forwards it, and anyone who has asked for
 * reduced motion skips it entirely. A luxury experience should never feel like a trap.
 */

const PHASES = {
  /** wordmark fades up on ivory */
  settle: 900,
  /** the long colour bleed */
  bleed: 3400,
  /** hold on the finished state */
  hold: 700,
  /** curtain lifts */
  exit: 900,
} as const;

const REDUCED = '(prefers-reduced-motion: reduce)';

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

type Phase = 'settle' | 'bleed' | 'hold' | 'exit' | 'done';

export function Opening({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('settle');
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  useEffect(() => {
    if (reduced) {
      finished.current = true;
      onDone();
      return;
    }

    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    at(PHASES.settle, () => setPhase('bleed'));
    at(PHASES.settle + PHASES.bleed, () => setPhase('hold'));
    at(PHASES.settle + PHASES.bleed + PHASES.hold, () => setPhase('exit'));
    at(PHASES.settle + PHASES.bleed + PHASES.hold + PHASES.exit, () => {
      setPhase('done');
      if (!finished.current) { finished.current = true; onDone(); }
    });

    // Any deliberate interaction jumps to the end rather than making them wait it out.
    const skip = () => {
      if (finished.current) return;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setPhase('exit');
      window.setTimeout(() => {
        setPhase('done');
        if (!finished.current) { finished.current = true; onDone(); }
      }, 420);
    };

    window.addEventListener('wheel', skip, { passive: true, once: true });
    window.addEventListener('touchstart', skip, { passive: true, once: true });
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });

    return () => {
      timers.current.forEach(clearTimeout);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchstart', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [reduced, onDone]);

  if (reduced || phase === 'done') return null;

  const bled = phase === 'bleed' || phase === 'hold' || phase === 'exit';

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[150] flex items-center justify-center"
      style={{
        // The single long bleed. One property, one curve, no steps.
        backgroundColor: bled ? '#4A2E27' : '#F5F1E6',
        transition: `background-color ${PHASES.bleed}ms cubic-bezier(0.45, 0, 0.15, 1)`,
        opacity: phase === 'exit' ? 0 : 1,
        // The curtain lift is its own, later curve so it never overlaps the colour move.
        transitionProperty: 'background-color, opacity',
        transitionDuration: `${PHASES.bleed}ms, ${PHASES.exit}ms`,
        transitionTimingFunction: 'cubic-bezier(0.45, 0, 0.15, 1), cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: phase === 'exit' ? 'none' : 'auto',
      }}
    >
      <div
        className="relative w-[min(46vw,300px)]"
        style={{
          opacity: phase === 'settle' ? 0 : 1,
          transform: phase === 'settle' ? 'scale(0.985)' : 'scale(1)',
          transition: `opacity ${PHASES.settle}ms ease-out, transform 2200ms cubic-bezier(0.22,1,0.36,1)`,
        }}
      >
        {/*
          The dark mark stays fully opaque for the whole sequence and the light one fades in on
          top of it. Cross-fading BOTH would put each at ~50% at the midpoint, and because they
          are the same artwork the mark visibly washes out exactly when the ground is at its
          least forgiving. Layering this way keeps coverage at 100% throughout — only the colour
          changes. The artwork itself is never recoloured.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/rora-dark.png" alt="" className="block w-full" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/rora-light.png"
          alt="RORA"
          className="absolute inset-0 block w-full"
          style={{
            opacity: bled ? 1 : 0,
            // Centred on the ground's luminance crossover, and brisk enough that the mark is
            // never ambiguous — but still eased at both ends so nothing snaps.
            transition: `opacity ${Math.round(PHASES.bleed * 0.42)}ms cubic-bezier(0.4,0,0.2,1) ${Math.round(PHASES.bleed * 0.3)}ms`,
          }}
        />
      </div>
    </div>
  );
}
