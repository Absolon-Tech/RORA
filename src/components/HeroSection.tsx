'use client';

import { Reveal } from './Reveal';

/**
 * The Primary Hero Section (Power Dressing):
 * Features brand portrait image `Color 2-3.png` (Model in plum tailored suit with gold buttons).
 * Clean crisp model presentation on right with zero brown overlay, and sharp text backdrop scrim on left.
 */
export function HeroSection() {
  return (
    <section
      id="hero"
      data-ground="dark"
      data-nav-bg="transparent"
      className="relative flex min-h-[100svh] flex-col justify-end sm:justify-center overflow-hidden bg-[#1E1715] pb-12 pt-28 text-ivory sm:pb-24 sm:pt-32"
    >
      {/* Layer 1: Main Featured Portrait Image (Model in plum tailored suit - Bright & Clear) */}
      <div className="absolute inset-0 lg:left-auto lg:right-0 w-full lg:w-[62%] h-full overflow-hidden pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/Color 2-3.png"
          alt="Model in RORA plum tailored power suit with gold buttons"
          className="h-full w-full object-cover object-[50%_10%] lg:object-[80%_15%]"
        />

        {/* Soft Left Edge Transition for Desktop */}
        <div
          aria-hidden
          className="hidden lg:block absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #1E1715 0%, rgba(30,23,21,0.85) 12%, rgba(30,23,21,0.15) 35%, transparent 55%), linear-gradient(180deg, rgba(30,23,21,0.4) 0%, transparent 15%, transparent 85%, rgba(30,23,21,0.5) 100%)',
          }}
        />
      </div>

      {/* Mobile Seamless Bottom Scrim (Leaves model's face & suit 100% bright & clear) */}
      <div
        aria-hidden
        className="lg:hidden absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(30,23,21,0.4) 25%, rgba(30,23,21,0.92) 70%, #1E1715 100%)',
        }}
      />

      {/* Desktop Left Column Scrim for High-Contrast Text Readability (Leaves right 50% model completely clear) */}
      <div
        aria-hidden
        className="hidden lg:block absolute inset-y-0 left-0 w-[55%] pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, #1E1715 0%, #1E1715 65%, rgba(30,23,21,0.7) 85%, transparent 100%)',
        }}
      />

      {/* Content Container */}
      <div className="shell relative z-10 w-full">
        <div className="max-w-2xl">
          <Reveal delay={120}>
            <h1 className="display-xl mt-4 sm:mt-6 max-w-[15ch] leading-[1.02] text-ivory drop-shadow-md">
              An elevated take on <em className="italic font-normal text-ivory">power dressing.</em>
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="lede mt-4 sm:mt-7 max-w-[44ch] leading-relaxed text-ivory/85 drop-shadow-sm text-sm sm:text-base">
              Structured pieces built to move with you &mdash; to dinner, to the door, to nowhere at
              all. The first collection arrives 30 August.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-7 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
              <a
                href="#interest"
                className="invite invite--onDark inline-flex items-center justify-center border border-sceptre bg-sceptre px-7 sm:px-9 py-3.5 sm:py-4 text-ivory shadow-2xl transition-all duration-500 hover:border-[#661318] hover:bg-[#661318]"
              >
                <span>JOIN THE WAITLIST</span>
              </a>

              <a
                href="#pieces"
                className="eyebrow inline-flex items-center gap-3 border-b border-ivory/60 pb-1.5 text-[0.72rem] tracking-[0.3em] text-ivory/90 transition-all duration-300 hover:border-ivory hover:text-ivory"
              >
                SEE WHAT&apos;S COMING &rarr;
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Bottom Corner Watermarks */}
      <span aria-hidden className="absolute bottom-4 left-4 z-10 eyebrow text-[0.58rem] text-ivory/40 sm:left-12">
        &copy; 2026 RORA
      </span>
      <span aria-hidden className="absolute bottom-4 right-4 z-10 eyebrow text-[0.58rem] text-ivory/40 tracking-[0.35em] sm:right-12">
        STRUCTURED &middot; BOLD &middot; YOURS
      </span>
    </section>
  );
}
