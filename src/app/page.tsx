'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

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

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

/**
 * The journey, in order:
 *   arrival (ivory bleeding to coffee), anticipation (countdown), the film (scrubbed),
 *   the collection, the house, the request.
 *
 * Grounds alternate dark / light / dark so the wordmark always has something to do, and the page
 * breathes between the two cinematic passages.
 */
export default function Page() {
  const reduced = usePrefersReducedMotion();
  const [selected, setSelected] = useState<string[]>([]);

  /**
   * Browsers restore the previous scroll offset on reload, which on a page with a 520vh pinned
   * film means a returning visitor is dropped straight into the request at the bottom. The
   * arrival is the whole point, so the entry is always the top.
   */
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // One reset is not enough. The browser restores its offset around load, and ScrollTrigger
    // re-measures when it installs the pin — either can land us mid-film. We reset now, again on
    // load, and once more after the pin has settled, then stop. Guarded so it can never fight a
    // visitor who has genuinely started scrolling.
    let cancelled = false;
    const top = () => { if (!cancelled && window.scrollY > 0) window.scrollTo(0, 0); };

    top();
    const t1 = window.setTimeout(top, 60);
    const t2 = window.setTimeout(top, 260);
    window.addEventListener('load', top, { once: true });

    // From here on the visitor owns the scroll.
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

      {/*
        The page sits under the curtain from the start, fully painted, so the frame sequence is
        already downloading and nothing pops in when the curtain lifts.

        It is NOT cross-faded in. Fading the page up while the curtain fades out leaves both
        semi-transparent at the midpoint, and the document's own light ground shows through as a
        pale flash between the coffee curtain and the dark first section. The curtain simply lifts
        off an already-opaque page, and this wrapper carries the first section's ground so there is
        never a lighter surface behind it.
      */}
      <div style={{ backgroundColor: '#231815' }}>
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
              <p className="eyebrow">&copy; {new Date().getFullYear()} RORA</p>
              <p className="eyebrow">Pune &mdash; shipping nationwide</p>
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
