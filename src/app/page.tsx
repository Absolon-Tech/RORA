'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';

import { Countdown } from '@/components/Countdown';
import { HeroScrub } from '@/components/HeroScrub';
import { Interest } from '@/components/Interest';
import { Nav } from '@/components/Nav';
import { Opening } from '@/components/Opening';
import { Outfits } from '@/components/Outfits';
import { Story } from '@/components/Story';
import { CONTENT } from '@/lib/content';

const REDUCED = '(prefers-reduced-motion: reduce)';

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

/**
 * matchMedia is exactly the external store this hook exists for. Reading it with an effect and
 * setState causes a cascading render and a hydration mismatch.
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

/**
 * The journey, in order:
 *   arrival (ivory bleeding to coffee) → anticipation (countdown) → the film (scrubbed)
 *   → the collection → the house → the request
 *
 * Grounds alternate dark / light / dark so the wordmark always has something to do, and the page
 * breathes between the two cinematic passages.
 */
export default function Page() {
  const reduced = usePrefersReducedMotion();
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const onDone = useCallback(() => setEntered(true), []);
  const toggle = useCallback(
    (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    [],
  );

  return (
    <>
      <Opening onDone={onDone} />

      {/* The page is mounted underneath the curtain from the start, so nothing pops in when it
          lifts and the frame sequence has already begun downloading. */}
      <div
        style={{
          opacity: entered || reduced ? 1 : 0,
          transition: 'opacity 900ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <Nav />

        <main id="main">
          <div id="top" />
          <Countdown launchISO={CONTENT.launchISO} enabled={CONTENT.countdownEnabled} />
          <HeroScrub reducedMotion={reduced} />
          <Outfits pieces={CONTENT.pieces} selected={selected} onToggle={toggle} />
          <Story />
          <Interest pieces={CONTENT.pieces} selected={selected} />
        </main>

        <footer data-ground="dark" className="bg-soil pb-14 text-ivory">
          <div className="shell">
            <div aria-hidden className="mb-10 h-px bg-ivory/12" />
            <div className="flex flex-wrap items-center justify-between gap-6 text-ivory/45">
              <p className="eyebrow">© {new Date().getFullYear()} RORA</p>
              <p className="eyebrow">Pune — shipping nationwide</p>
              <a
                href="https://instagram.com/theroraera"
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow border-b border-current pb-1 transition-opacity duration-300 hover:text-ivory"
              >
                @theroraera
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
