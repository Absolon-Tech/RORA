'use client';

import { Reveal } from './Reveal';

/**
 * The House Section ("Built for the way you actually live"):
 * Features model image section-4.jpg.
 * On Mobile: Pulled down & centered so her head and hair are 100% complete and intact without top clipping.
 * On Desktop: Zoomed in (scale 1.45) & pulled left, while brown coffee (#3D2620) blur covers the right side text.
 */
export function Story() {
  return (
    <section
      id="house"
      data-ground="dark"
      data-nav-bg="#3D2620"
      className="relative flex min-h-[100svh] flex-col justify-end lg:justify-center overflow-hidden bg-[#3D2620] pb-12 pt-28 sm:pb-20 text-ivory"
    >
      {/* Model Image Container */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[65%] h-full overflow-hidden pointer-events-none z-0">
        {/* Mobile View Image: Pulled down slightly (object-14% top offset) & centered so head is 100% intact */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/section-4.jpg"
          alt="Model in RORA cerulean pinstripe vest and wide trousers"
          className="lg:hidden h-full w-full object-cover object-[48%_14%]"
        />

        {/* Desktop View Image: Zoomed in (scale 1.45) & pulled left/up */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/section-4.jpg"
          alt="Model in RORA cerulean pinstripe vest and wide trousers"
          className="hidden lg:block h-full w-full object-cover object-[0%_0%]"
          style={{
            transform: 'scale(1.45) translateX(-18%) translateY(-12%) translateZ(0)',
            transformOrigin: 'left top',
            imageRendering: '-webkit-optimize-contrast' as any,
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        />

        {/* Soft Right Edge Dissolve Mask into Brown Background */}
        <div
          aria-hidden
          className="hidden lg:block absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, transparent 50%, rgba(61,38,32,0.85) 78%, #3D2620 100%)',
          }}
        />
      </div>

      {/* Mobile Bottom Brown Blur Scrim: Covers text area at bottom while model is clear at top */}
      <div
        aria-hidden
        className="lg:hidden absolute inset-x-0 bottom-0 h-[55%] pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(61,38,32,0.5) 25%, rgba(61,38,32,0.95) 70%, #3D2620 100%)',
        }}
      />

      {/* Desktop Right Brown Blur Layer: Covers text column seamlessly */}
      <div
        aria-hidden
        className="hidden lg:block absolute inset-y-0 right-0 w-[55%] pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(61,38,32,0.8) 25%, #3D2620 60%, #3D2620 100%)',
        }}
      />

      <div className="shell relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Narrative Content: Covered by Brown Blur Layer on Right Column */}
          <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
            <Reveal>
              <div>
                <p className="eyebrow text-[0.65rem] sm:text-[0.68rem] tracking-[0.38em] text-ivory/70">THE HOUSE</p>
                <span aria-hidden className="block h-px w-8 bg-ivory/35 mt-2 mb-6 sm:mb-8" />
              </div>
            </Reveal>

            <Reveal delay={120}>
              <h2 className="display-lg font-display text-ivory text-3xl sm:text-5xl lg:text-6xl leading-[1.08] max-w-[15ch] drop-shadow-md">
                Built for the way <br className="hidden sm:inline" />
                you actually live.
              </h2>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-5 sm:mt-8 space-y-4 sm:space-y-6 text-ivory/85 font-light lede max-w-[44ch] leading-relaxed drop-shadow-sm text-sm sm:text-base">
                <p>
                  RORA began with one question: why does clothing that looks serious have to feel serious?
                  We design from the opposite direction &mdash; from the body outward, from the evening inward,
                  from what you actually do.
                </p>
                <p>
                  Each piece is cut to hold its shape and release you from thinking about it. That&apos;s what
                  structure is for.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
