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

/**
 * Takes no callback: the page beneath is already painted and opaque from the first frame, so
 * nothing downstream needs to wait for the curtain. It simply lifts.
 */
export function Opening() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('settle');
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  useEffect(() => {
    if (reduced) {
      finished.current = true;
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
      finished.current = true;
    });

    // Any deliberate interaction jumps to the end rather than making them wait it out.
    const skip = () => {
      if (finished.current) return;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setPhase('exit');
      window.setTimeout(() => {
        setPhase('done');
        finished.current = true;
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
  }, [reduced]);

  if (reduced || phase === 'done') return null;

  const bled = phase === 'bleed' || phase === 'hold' || phase === 'exit';

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden"
      style={{
        // The ground stays ivory. The coffee arrives as a spreading body of colour, below.
        backgroundColor: '#F5F1E6',
        opacity: phase === 'exit' ? 0 : 1,
        transition: `opacity ${PHASES.exit}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        pointerEvents: phase === 'exit' ? 'none' : 'auto',
      }}
    >
      {/*
        The colour does not simply cross-fade — it spreads.
        A soft body of coffee blooms outward from behind the wordmark until it has taken the whole
        frame. Heavily blurred so the leading edge is a wash rather than a visible disc, and eased
        with a long tail so it decelerates into stillness instead of arriving and stopping.
        This is what makes the change read as a process that happened, rather than a state that
        was swapped.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          // Three viewports tall and anchored to the bottom. Only the soft upper edge is ever
          // allowed to cross the screen — the element's own hard bottom boundary stays far below
          // the fold at every point in the travel, so no straight line is ever visible.
          height: '300vh',
          // Solid through the lower two-thirds, then a long tail. There is no shape to perceive:
          // a circle, however blurred, still reads as a disc sweeping past, which looks like an
          // effect. A wash reads as the colour soaking up through the ground.
          background:
            'linear-gradient(to top, #4A2E27 0%, #4A2E27 62%, rgba(74,46,39,0.9) 74%, rgba(74,46,39,0.5) 87%, rgba(74,46,39,0) 100%)',
          // Fully below the fold, then home. Never past it — overshooting is what exposed the edge.
          transform: bled ? 'translate3d(0, 0, 0)' : 'translate3d(0, 100%, 0)',
          // Decelerating hard at the end so it settles rather than stops.
          transition: `transform ${PHASES.bleed}ms cubic-bezier(0.30, 0, 0.10, 1)`,
          willChange: 'transform',
        }}
      />
      <div
        className="relative z-10 w-[min(46vw,300px)]"
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
            // Timed to just precede the wash reaching the mark's own height, so the light form is
            // already carrying the shape by the time the ground beneath it goes dark. Erring
            // early is deliberate: light-on-ivory reads for a moment, dark-on-coffee does not.
            transition: `opacity ${Math.round(PHASES.bleed * 0.3)}ms cubic-bezier(0.4,0,0.2,1) ${Math.round(PHASES.bleed * 0.2)}ms`,
          }}
        />
      </div>
    </div>
  );
}
