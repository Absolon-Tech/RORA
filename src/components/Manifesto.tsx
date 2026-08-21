'use client';

import type { MouseEvent } from 'react';

/**
 * The Manifesto / Roma Section Artwork Stage (The Final Section):
 * Displays `_RomaPhoneSection.png` on phone screens. On larger screens, uses a real fabric-texture
 * crop (fabric-texture.jpg, pulled from the same shoot) with the alpha-masked wordmark
 * (rora-wordmark.png) layered near the top, so desktop matches the mobile fabric backdrop instead
 * of a flat fill, with a shorter section and tighter gap to the footer row.
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
      {/* Mobile Phone Artwork: _RomaPhoneSection.png (9:16 vertical portrait graphic) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/_RomaPhoneSection.png"
        alt="RORA Tailored Posture mobile artwork"
        className="block md:hidden absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Desktop / Tablet Background: real fabric texture crop, no flat fill */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/fabric-texture.jpg"
        alt=""
        aria-hidden
        className="hidden md:block absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Desktop / Tablet Wordmark: alpha-masked RORA, layered on the fabric near the top */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/rora-wordmark.png"
        alt="RORA"
        className="hidden md:block absolute top-8 lg:top-10 left-1/2 -translate-x-1/2 w-[60%] max-w-2xl pointer-events-none select-none z-0"
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
        <div className="w-full text-[#EDE7DE]">
          <div className="shell">
            {/* Top Row: Brand Specs & Vector Social Media Icons Floated Directly Over Artwork */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 md:gap-6 pb-3">
              <div className="space-y-1">
                <p className="eyebrow text-[0.65rem] sm:text-xs tracking-[0.38em] text-white font-semibold uppercase drop-shadow-md">
                  STRUCTURED &middot; BOLD &middot; YOURS
                </p>
                <p className="text-[0.65rem] sm:text-[0.72rem] tracking-[0.22em] text-[#EDE7DE]/85 font-light uppercase drop-shadow-sm">
                  PUNE &mdash; SHIPPING NATIONWIDE
                </p>
              </div>

              {/* Vector Social Icons & Labels */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-6 text-[0.65rem] sm:text-[0.72rem] tracking-[0.2em] font-medium uppercase text-[#EDE7DE]/90 drop-shadow-md">
                {/* Instagram Icon + Link */}
                <a
                  href="https://instagram.com/theroraera"
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

                {/* Facebook Icon + Link */}
                <a
                  href="https://facebook.com/theroraera"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex items-center gap-1.5 sm:gap-2 hover:text-white transition-all duration-300 group"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span>FACEBOOK</span>
                </a>

                <span className="text-[#EDE7DE]/30 hidden sm:inline" aria-hidden>&middot;</span>

                {/* Twitter / X Icon + Link */}
                <a
                  href="https://x.com/theroraera"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter X"
                  className="inline-flex items-center gap-1.5 sm:gap-2 hover:text-white transition-all duration-300 group"
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>TWITTER</span>
                </a>

                <span className="text-[#EDE7DE]/30 hidden sm:inline" aria-hidden>&middot;</span>

                {/* WhatsApp Icon + Link */}
                <a
                  href="https://wa.me/?text=Exploring%20RORA%20Autumn%202026"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex items-center gap-1.5 sm:gap-2 hover:text-white transition-all duration-300 group"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                  </svg>
                  <span>WHATSAPP</span>
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
