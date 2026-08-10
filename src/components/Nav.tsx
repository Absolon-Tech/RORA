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
  const [hidden, setHidden] = useState(false);
  const current = useRef(true);
  const hiddenRef = useRef(false);
  const lastY = useRef(0);

  useEffect(() => {
    const grounds = Array.from(document.querySelectorAll<HTMLElement>('[data-ground]'));
    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = window.scrollY;

      // Ground beneath the mark, for the colour swap.
      let nextDark = true;
      for (const el of grounds) {
        const r = el.getBoundingClientRect();
        if (r.top <= PROBE_Y && r.bottom > PROBE_Y) nextDark = el.dataset.ground === 'dark';
      }
      if (current.current !== nextDark) { current.current = nextDark; setDark(nextDark); }

      /**
       * The header stays put. A transparent one collides with every line that passes under it,
       * so instead it earns its own surface: once you are off the top, a very quiet frosted panel
       * fades in behind it. Blur and a low-opacity tint of whatever ground it is currently over —
       * enough to separate the mark from a headline, far too little to read as a toolbar.
       *
       * At the very top there is no panel at all, so the arrival stays completely clean.
       */
      const next = y > 80;
      if (hiddenRef.current !== next) { hiddenRef.current = next; setHidden(next); }
      lastY.current = y;
    };

    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    lastY.current = window.scrollY;
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
      {/*
        The frosted panel. Tinted with the ground it is currently over rather than a neutral grey,
        so it never reads as a foreign grey bar laid across a warm page. The tint is deliberately
        low and paired with a hairline instead of a border — the separation should be felt, not
        seen. `saturate` keeps the plum beneath from going muddy under the blur.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: dark ? 'rgba(35,24,21,0.42)' : 'rgba(245,241,230,0.5)',
          backdropFilter: 'blur(16px) saturate(125%)',
          WebkitBackdropFilter: 'blur(16px) saturate(125%)',
          maskImage: 'linear-gradient(to bottom, black 62%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 62%, transparent 100%)',
          opacity: hidden ? 1 : 0,
          transition:
            'opacity 700ms cubic-bezier(0.22,1,0.36,1), background-color 900ms cubic-bezier(0.22,1,0.36,1)',
        }}
      />

      <nav className="shell relative flex items-center justify-between py-7 sm:py-9">
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
