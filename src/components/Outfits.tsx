'use client';

import { Reveal } from './Reveal';
import type { Piece } from '@/lib/content';

const PRICES: Record<string, string> = {
  suit: '₹48,000',
  blazer: '₹39,500',
  'dinner-dress': '₹39,500',
  trouser: '₹26,000',
  shirt: '₹32,000',
  coat: '₹52,000',
  waistcoat: '₹24,000',
};

/**
 * The Collection (What's Coming):
 * 3-column editorial product grid matching Images 1 & 2.
 * Includes price indicators, material lines, and "NOTIFY ME WHEN THIS DROPS" action buttons
 * that mark the item and smoothly navigate the customer to the access request form.
 */
export function Outfits({
  pieces,
  selected,
  onToggle,
}: {
  pieces: Piece[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const handleSelect = (id: string) => {
    onToggle(id);
    const formSection = document.getElementById('interest');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pieces" data-ground="light" data-nav-bg="#F5F1E6" className="bg-ivory py-24 text-java sm:py-36">
      <div className="shell">
        <Reveal as="header" className="mb-14 sm:mb-20">
          <p className="eyebrow text-[0.68rem] tracking-[0.35em] text-sceptre font-medium">FIRST PIECES</p>
          <h2 className="display-lg mt-3 text-4xl sm:text-6xl lg:text-7xl font-display font-medium text-java">
            What&apos;s coming.
          </h2>
        </Reveal>

        {/* 7-Item Grid matching Images 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-14 lg:gap-x-10 lg:gap-y-16">
          {pieces.map((piece, i) => {
            const on = selected.includes(piece.id);
            const price = PRICES[piece.id] || '₹36,000';

            return (
              <Reveal key={piece.id} delay={(i % 3) * 100}>
                <article className="group flex flex-col justify-between">
                  <div>
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={piece.image}
                        alt={piece.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>

                    {/* Name & Price Hairline Row */}
                    <div className="mt-4 flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-medium text-java">{piece.name}</h3>
                      <span aria-hidden className="h-px flex-1 bg-java/20 mx-2" />
                      <span className="font-mono text-xs text-java/60 tracking-wider">{price}</span>
                    </div>

                    {/* Material Description */}
                    <p className="mt-1 text-xs text-java/60 font-body leading-relaxed">{piece.material}</p>
                  </div>

                  {/* Notify / Mark Button */}
                  <button
                    type="button"
                    onClick={() => handleSelect(piece.id)}
                    aria-pressed={on}
                    className={`mt-5 w-full py-3.5 px-4 eyebrow text-[0.625rem] tracking-[0.25em] transition-all duration-300 border ${
                      on
                        ? 'bg-sceptre text-ivory border-sceptre shadow-md'
                        : 'border-java/25 text-java/75 hover:border-java hover:bg-java hover:text-ivory'
                    }`}
                  >
                    {on ? 'MARKED FOR ACCESS' : 'NOTIFY ME WHEN THIS DROPS'}
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
