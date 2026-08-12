'use client';

import { useEffect, useState } from 'react';
import { Reveal } from './Reveal';

type Left = { days: number; hours: number; minutes: number; seconds: number };

function remaining(target: number): Left | null {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function Countdown({ launchISO, enabled }: { launchISO: string; enabled: boolean }) {
  const target = new Date(launchISO).getTime();
  const valid = Number.isFinite(target);
  const [left, setLeft] = useState<Left | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!enabled || !valid) return;
    const first = requestAnimationFrame(() => {
      setLeft(remaining(target));
      setLive(true);
    });
    const id = setInterval(() => setLeft(remaining(target)), 1000);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(id);
    };
  }, [target, valid, enabled]);

  if (!enabled || !valid) return null;

  return (
    <section
      id="countdown"
      data-ground="dark"
      data-nav-bg="transparent"
      className="relative flex h-[100svh] flex-col justify-end overflow-hidden bg-[#1C1614] px-4 pb-4 pt-16 text-center text-ivory sm:px-12 sm:pb-10"
    >
      {/* Full Bleed Background Photograph filling 100% of screen height with zero void space */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/countdown-ground.jpg"
        alt="Three women in RORA tailoring"
        className="absolute inset-0 h-full w-full object-cover object-[50%_0%] pointer-events-none select-none z-0"
      />

      {/* Seamless Gradient Scrim: Leaves top faces clear while ensuring sharp legibility for countdown text */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,22,20,0.02) 0%, rgba(28,22,20,0.18) 32%, rgba(28,22,20,0.8) 60%, rgba(28,22,20,0.95) 100%)',
        }}
      />

      {/* Content Container - Compactly anchored at lower half over ambient scrim */}
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center">
        <Reveal>
          <div className="flex flex-col items-center">
            {/* Tagline */}
            <p className="eyebrow text-[0.62rem] tracking-[0.38em] text-ivory/90 sm:text-[0.75rem] drop-shadow-md">
              STRUCTURED &middot; BOLD &middot; YOURS
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-2.5 sm:mt-5 flex flex-col items-center">
            <p className="eyebrow text-[0.58rem] tracking-[0.38em] text-ivory/70">LAUNCHING</p>
            <p className="display-md mt-0.5 font-display italic font-normal text-ivory text-lg sm:text-2xl drop-shadow-sm">
              30 August 2026
            </p>
          </div>
        </Reveal>

        {/* Countdown Clock */}
        <Reveal delay={200}>
          <div className="mt-3.5 sm:mt-7 flex items-center justify-center gap-2.5 sm:gap-6" role="timer" aria-live="off">
            <div className="flex flex-col items-center">
              <span className="display-lg text-xl sm:text-4xl lg:text-5xl tabular-nums font-display text-ivory drop-shadow-md">
                {live && left ? String(left.days).padStart(2, '0') : '00'}
              </span>
              <span className="eyebrow mt-1 text-[0.55rem] sm:text-[0.6rem] tracking-[0.22em] text-ivory/60">DAYS</span>
            </div>

            <span className="text-base sm:text-2xl text-ivory/40 select-none -mt-2">&middot;</span>

            <div className="flex flex-col items-center">
              <span className="display-lg text-xl sm:text-4xl lg:text-5xl tabular-nums font-display text-ivory drop-shadow-md">
                {live && left ? String(left.hours).padStart(2, '0') : '00'}
              </span>
              <span className="eyebrow mt-1 text-[0.55rem] sm:text-[0.6rem] tracking-[0.22em] text-ivory/60">HRS</span>
            </div>

            <span className="text-base sm:text-2xl text-ivory/40 select-none -mt-2">&middot;</span>

            <div className="flex flex-col items-center">
              <span className="display-lg text-xl sm:text-4xl lg:text-5xl tabular-nums font-display text-ivory drop-shadow-md">
                {live && left ? String(left.minutes).padStart(2, '0') : '00'}
              </span>
              <span className="eyebrow mt-1 text-[0.55rem] sm:text-[0.6rem] tracking-[0.22em] text-ivory/60">MIN</span>
            </div>

            <span className="text-base sm:text-2xl text-ivory/40 select-none -mt-2">&middot;</span>

            <div className="flex flex-col items-center">
              <span className="display-lg text-xl sm:text-4xl lg:text-5xl tabular-nums font-display text-ivory drop-shadow-md">
                {live && left ? String(left.seconds).padStart(2, '0') : '00'}
              </span>
              <span className="eyebrow mt-1 text-[0.55rem] sm:text-[0.6rem] tracking-[0.22em] text-ivory/60">SEC</span>
            </div>
          </div>
        </Reveal>

        {/* Join Waitlist Button */}
        <Reveal delay={300}>
          <div className="mt-3.5 sm:mt-6">
            <a
              href="#interest"
              className="invite invite--onDark inline-block border border-ivory/60 bg-[#1C1614]/80 backdrop-blur-md px-7 sm:px-8 py-2.5 sm:py-3 eyebrow text-[0.6rem] sm:text-[0.65rem] tracking-[0.28em] text-ivory shadow-xl transition-all duration-500 hover:border-ivory hover:bg-ivory hover:text-java"
            >
              JOIN THE WAITLIST
            </a>
          </div>
        </Reveal>

        {/* Follow us for updates + Social Icons */}
        <Reveal delay={400}>
          <div className="mt-3.5 sm:mt-6 flex flex-col items-center">
            <p className="eyebrow text-[0.55rem] tracking-[0.3em] text-ivory/60 mb-2">
              FOLLOW US FOR UPDATES
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/theroraera"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-ivory/30 text-ivory/80 transition-all duration-300 hover:border-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/theroraera"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-ivory/30 text-ivory/80 transition-all duration-300 hover:border-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://pinterest.com/theroraera"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-ivory/30 text-ivory/80 transition-all duration-300 hover:border-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="relative z-10 pt-2 pb-1">
        <a
          href="#hero"
          className="flex flex-col items-center gap-1 text-ivory/70 transition-opacity duration-300 hover:text-ivory"
        >
          <span className="eyebrow text-[0.55rem] sm:text-[0.6rem] tracking-[0.28em]">
            SCROLL TO EXPLORE OUR LAUNCH LINEUP
          </span>
          <span className="animate-bounce text-xs opacity-80">&darr;</span>
        </a>
      </div>

      {/* Bottom Corner Watermarks */}
      <span aria-hidden className="absolute bottom-3 left-4 z-10 eyebrow text-[0.55rem] text-ivory/40 sm:left-12">
        &copy; 2026 RORA
      </span>
      <span aria-hidden className="absolute bottom-3 right-4 z-10 eyebrow text-[0.55rem] text-ivory/40 tracking-[0.3em] sm:right-12">
        RORA
      </span>
    </section>
  );
}
