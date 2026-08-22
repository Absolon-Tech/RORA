'use client';

import type { MouseEvent } from 'react';

/**
 * The Manifesto / Roma Section Artwork Stage (The Final Section):
 * Displays `footer-mobile.png` on phone screens and `Roma Section.png` (fabric texture with the
 * wordmark baked in) on larger screens, so desktop matches the mobile fabric backdrop instead of a
 * flat fill, with a shorter section and tighter gap to the footer row.
 */
export function Manifesto() {
  const handleScrollTop = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="craft"
      data-ground="dark"
      data-nav-bg="#33201B"
      className="relative bg-[#33201B] w-full min-h-[90vh] sm:min-h-[100svh] md:min-h-[65vh] flex flex-col justify-between pt-0 pb-0 text-[#1C1614] overflow-hidden"
    >
      {/* Mobile Phone Artwork: footer-mobile.png (9:16 vertical portrait graphic) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/footer-mobile.png"
        alt="RORA Tailored Posture mobile artwork"
        className="block md:hidden absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Desktop / Tablet Artwork: Roma Section.png (fabric texture with wordmark baked in) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/Roma Section.png"
        alt="RORA Tailored Posture artwork"
        className="hidden md:block absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Ambient Vignette at Bottom for Overlay Legibility */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(35,24,21,0.5) 40%, rgba(35,24,21,0.85) 100%)',
        }}
      />

      {/* Direct Floating Overlay (No Separate Background Color Bar) */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pointer-events-auto pb-5 sm:pb-8">
        <div className="w-full text-white">
          <div className="shell">
            {/* Top Row: Brand Specs & Vector Social Media Icons Floated Directly Over Artwork */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 md:gap-6 pb-3">
              <div className="space-y-1">
                <p className="eyebrow text-[0.65rem] sm:text-xs tracking-[0.38em] text-white font-semibold uppercase drop-shadow-md">
                  STRUCTURED &middot; BOLD &middot; YOURS
                </p>
                <p className="text-[0.65rem] sm:text-[0.72rem] tracking-[0.22em] text-white font-light uppercase drop-shadow-sm">
                  PUNE &mdash; SHIPPING NATIONWIDE
                </p>
              </div>

              {/* Instagram & Email */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-6 text-[0.65rem] sm:text-[0.72rem] tracking-[0.2em] font-medium uppercase text-[#EDE7DE]/90 drop-shadow-md">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/theroraera?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex items-center gap-1.5 sm:gap-2 hover:text-white transition-all duration-300 group"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current stroke-[1.8] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span>INSTAGRAM</span>
                </a>

                <span className="text-[#EDE7DE]/30 hidden sm:inline" aria-hidden>&middot;</span>

                {/* Email */}
                <a
                  href="mailto:contact@therora.in"
                  aria-label="Email us"
                  className="inline-flex items-center gap-1.5 sm:gap-2 hover:text-white transition-all duration-300 group"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current stroke-[1.8] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                  <span>contact@therora.in</span>
                </a>
              </div>
            </div>

            <div aria-hidden className="h-px bg-[#EDE7DE]/20 w-full my-2.5 sm:my-3 shadow-sm" />

            {/* Bottom Row: Copyright & Animated Smooth Scroll to Top */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-[0.62rem] sm:text-[0.68rem] text-[#EDE7DE]/75 font-light uppercase tracking-wider drop-shadow-sm">
              <p>&copy; {new Date().getFullYear()} RORA. ALL RIGHTS RESERVED.</p>
              <a
                href="#top"
                onClick={handleScrollTop}
                className="group inline-flex items-center gap-2 hover:text-white transition-all duration-300 tracking-[0.3em] font-medium border-b border-[#EDE7DE]/40 hover:border-white pb-0.5"
              >
                <span>BACK TO TOP</span>
                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-1">&uarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
