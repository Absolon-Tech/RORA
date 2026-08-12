'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import { Countdown } from '@/components/Countdown';
import { HeroSection } from '@/components/HeroSection';
import { Interest } from '@/components/Interest';
import { Manifesto } from '@/components/Manifesto';
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

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

/**
 * Deck-of-Cards Layered Page Flow with Magnetic Scroll Snap:
 * Card 1: Countdown (Sticky top-0 z-10)
 * Card 2: HeroSection (The Main Hero Section - relative z-20 min-h-[100svh] snap-start snap-always)
 * Card 3: Outfits Collection (What's Coming 7-Item Grid - relative z-30 min-h-[100svh] snap-start)
 * Card 4: Story - The House (relative z-40 min-h-[85vh] snap-start)
 * Card 5: Interest Request Form (BEIGE BACKGROUND - relative z-50 min-h-[100svh] snap-start)
 * Card 6: Manifesto / Roma Section Artwork Stage (Placed RIGHT AFTER THE FORM - relative z-60 min-h-[85vh] snap-start)
 */
export default function Page() {
  const reduced = usePrefersReducedMotion();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    let cancelled = false;
    const top = () => { if (!cancelled && window.scrollY > 0) window.scrollTo(0, 0); };

    top();
    const t1 = window.setTimeout(top, 60);
    const t2 = window.setTimeout(top, 260);
    window.addEventListener('load', top, { once: true });

    const release = () => { cancelled = true; };
    const t3 = window.setTimeout(release, 700);
    window.addEventListener('wheel', release, { passive: true, once: true });
    window.addEventListener('touchstart', release, { passive: true, once: true });
    window.addEventListener('keydown', release, { once: true });

    return () => {
      cancelled = true;
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      window.removeEventListener('load', top);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchstart', release);
      window.removeEventListener('keydown', release);
    };
  }, []);

  const toggle = useCallback(
    (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    [],
  );

  return (
    <>
      <Opening />

      <div style={{ backgroundColor: '#231815' }}>
        <main id="main" className="relative snap-y snap-proximity">
          <div id="top" />

          {/* Card 1: Countdown Section (Sticky Pinned Layer) */}
          <div className="sticky top-0 z-10 h-[100svh] w-full overflow-hidden snap-start snap-always">
            <Countdown launchISO={CONTENT.launchISO} enabled={CONTENT.countdownEnabled} />
          </div>

          {/* Card 2: THE HERO SECTION (Original Hero with Plum Suit Color 2-3.png) */}
          <div className="relative z-20 min-h-[100svh] w-full bg-[#1E1715] snap-start snap-always">
            <HeroSection />
          </div>

          {/* Card 3: Outfits Collection (What's Coming 7-Item Grid) */}
          <div className="relative z-30 min-h-[100svh] w-full bg-ivory snap-start">
            <Outfits pieces={CONTENT.pieces} selected={selected} onToggle={toggle} />
          </div>

          {/* Card 4: Story - The House */}
          <div className="relative z-40 min-h-[85vh] w-full bg-[#3D2620] snap-start">
            <Story />
          </div>

          {/* Card 5: Interest Request Form (Beige Theme) */}
          <div className="relative z-50 min-h-[100svh] w-full bg-[#EDE7DE] snap-start">
            <Interest pieces={CONTENT.pieces} selected={selected} />
          </div>

          {/* Card 6: Manifesto / Roma Section Artwork Stage (Placed RIGHT AFTER THE FORM) */}
          <div className="relative z-60 min-h-[85vh] sm:min-h-[92vh] w-full bg-[#EDE7DE] snap-start">
            <Manifesto />
          </div>
        </main>
      </div>
    </>
  );
}
