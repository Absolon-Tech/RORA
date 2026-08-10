'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Navigation held to the absolute minimum: the wordmark, one word of invitation, and nothing else.
 *
 * Sections declare `data-ground="light" | "dark"`. Each frame the page scrolls we find whichever
 * section is crossing the navigation's own midline and adopt it, so the mark is always legible.
 * The two supplied logo files are cross-faded — the artwork itself is never recoloured.
 *
 * There is no bar, no background, no border. On a fashion site the chrome should disappear.
 */

const PROBE_Y = 34;

export function Nav() {
  const [dark, setDark] = useState(true);
  const current = useRef(true);

  useEffect(() => {
    const grounds = Array.from(document.querySelectorAll<HTMLElement>('[data-ground]'));
    if (!grounds.length) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      let next = true;
      for (const el of grounds) {
        const r = el.getBoundingClientRect();
        if (r.top <= PROBE_Y && r.bottom > PROBE_Y) next = el.dataset.ground === 'dark';
      }
      if (current.current !== next) { current.current = next; setDark(next); }
    };

    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-[120]"
      style={{
        color: dark ? 'var(--color-ivory)' : 'var(--color-java)',
        transition: 'color 900ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <nav className="shell flex items-center justify-between py-7 sm:py-9">
        {/* The mark carries the brand, so it is given real presence rather than being tucked
            into a corner. Still no bar, no background — the chrome stays invisible. */}
        <a
          href="#top"
          aria-label="RORA — top"
          className="pointer-events-auto relative block h-[30px] w-[92px] sm:h-[38px] sm:w-[116px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/rora-dark.png"
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: dark ? 0 : 1, transition: 'opacity 900ms cubic-bezier(0.22,1,0.36,1)' }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/rora-light.png"
            alt="RORA"
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: dark ? 1 : 0, transition: 'opacity 900ms cubic-bezier(0.22,1,0.36,1)' }}
          />
        </a>

        <a
          href="#interest"
          className="eyebrow pointer-events-auto border-b border-current pb-1.5 text-[0.75rem] opacity-75 transition-opacity duration-500 hover:opacity-100"
        >
          Request access
        </a>
      </nav>
    </header>
  );
}
