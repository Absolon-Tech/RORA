'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Navigation bar that remains completely transparent over full-bleed image/media sections
 * (like the Countdown landing photograph and Hero film sequence), and seamlessly transitions
 * to a solid section background color over text & content sections.
 */

const PROBE_Y = 40;

export function Nav() {
  const [dark, setDark] = useState(true);
  const [navBg, setNavBg] = useState('transparent');
  const currentDark = useRef(true);
  const currentBg = useRef('transparent');

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const grounds = Array.from(
        document.querySelectorAll<HTMLElement>('[data-ground], [data-nav-bg], [data-nav-transparent]')
      );
      let nextDark = true;
      let nextBg = 'transparent';

      for (const el of grounds) {
        const r = el.getBoundingClientRect();
        if (r.top <= PROBE_Y && r.bottom > PROBE_Y) {
          nextDark = el.dataset.ground === 'dark';
          if (el.dataset.navTransparent === 'true' || el.dataset.navBg === 'transparent') {
            nextBg = 'transparent';
          } else if (el.dataset.navBg) {
            nextBg = el.dataset.navBg;
          } else {
            nextBg = nextDark ? '#231815' : '#F5F1E6';
          }
        }
      }

      if (currentDark.current !== nextDark) {
        currentDark.current = nextDark;
        setDark(nextDark);
      }
      if (currentBg.current !== nextBg) {
        currentBg.current = nextBg;
        setNavBg(nextBg);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const isTransparent = navBg === 'transparent';

  return (
    <header
      className="fixed inset-x-0 top-0 z-[120]"
      style={{
        backgroundColor: isTransparent ? 'transparent' : navBg,
        color: dark ? 'var(--color-ivory)' : 'var(--color-java)',
        borderBottom: isTransparent
          ? '1px solid transparent'
          : dark
          ? '1px solid rgba(245,241,230,0.08)'
          : '1px solid rgba(35,24,21,0.08)',
        boxShadow: isTransparent
          ? 'none'
          : dark
          ? '0 4px 20px rgba(0,0,0,0.25)'
          : '0 4px 20px rgba(0,0,0,0.05)',
        transition:
          'background-color 700ms cubic-bezier(0.22,1,0.36,1), color 700ms cubic-bezier(0.22,1,0.36,1), border-color 700ms cubic-bezier(0.22,1,0.36,1), box-shadow 700ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <nav className="shell relative flex items-center justify-between py-4 sm:py-5">
        <a
          href="#top"
          aria-label="RORA — top"
          className="pointer-events-auto relative block h-[28px] w-[88px] sm:h-[34px] sm:w-[106px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/rora-dark.png"
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: dark ? 0 : 1, transition: 'opacity 700ms cubic-bezier(0.22,1,0.36,1)' }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/rora-light.png"
            alt="RORA"
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: dark ? 1 : 0, transition: 'opacity 700ms cubic-bezier(0.22,1,0.36,1)' }}
          />
        </a>

        <a
          href="#interest"
          className="eyebrow pointer-events-auto border-b border-current pb-1 text-[0.75rem] opacity-80 transition-opacity duration-300 hover:opacity-100"
        >
          Request access
        </a>
      </nav>
    </header>
  );
}
