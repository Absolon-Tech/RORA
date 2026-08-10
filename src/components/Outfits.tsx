'use client';

import { Reveal } from './Reveal';
import type { Piece } from '@/lib/content';

/**
 * The seven.
 *
 * Laid out as an editorial index rather than a product grid: a numeral, a name, a material line,
 * and one sentence. Rows alternate so the eye travels rather than scanning a catalogue.
 *
 * Choosing a piece is framed as marking it, not adding it to a basket — the conversion here is
 * curiosity, not checkout. What is marked follows the visitor down to the request.
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
  return (
    <section id="pieces" data-ground="light" className="bg-ivory py-28 text-java sm:py-40">
      <div className="shell">
        <Reveal as="header" className="mb-20 sm:mb-32">
          <p className="eyebrow text-sceptre">The collection</p>
          <h2 className="display-lg mt-7 max-w-[15ch]">
            Seven pieces. <em className="italic">Nothing spare.</em>
          </h2>
          <p className="lede mt-8 max-w-[46ch] opacity-65">
            A short first run, cut in small numbers. Mark the ones you want — they will travel with
            you to the request below.
          </p>
        </Reveal>

        <ol className="grid gap-y-24 sm:gap-y-36">
          {pieces.map((piece, i) => {
            const on = selected.includes(piece.id);
            const flip = i % 2 === 1;
            return (
              <Reveal as="li" key={piece.id} delay={60}>
                <article
                  className={`grid items-center gap-8 sm:grid-cols-12 sm:gap-14 ${
                    flip ? 'sm:[&>figure]:order-2' : ''
                  }`}
                >
                  <figure className={`sm:col-span-5 ${flip ? 'sm:col-start-8' : ''}`}>
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[color-mix(in_srgb,var(--color-soil)_12%,transparent)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={piece.image}
                        alt={piece.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out will-change-transform hover:scale-[1.03]"
                      />
                    </div>
                  </figure>

                  <div className={`sm:col-span-6 ${flip ? 'sm:col-start-1 sm:row-start-1' : 'sm:col-start-7'}`}>
                    <div className="flex items-baseline gap-5">
                      <span className="eyebrow opacity-40">{piece.numeral}</span>
                      <span aria-hidden className="h-px flex-1 bg-current opacity-15" />
                    </div>

                    <h3 className="display-md mt-6">{piece.name}</h3>
                    <p className="eyebrow mt-4 text-sceptre">{piece.material}</p>
                    <p className="lede mt-6 max-w-[40ch] opacity-65">{piece.note}</p>

                    <button
                      type="button"
                      onClick={() => onToggle(piece.id)}
                      aria-pressed={on}
                      className="eyebrow mt-9 inline-flex items-center gap-4 border-b border-current pb-2 transition-opacity duration-500"
                      style={{ opacity: on ? 1 : 0.55, color: on ? 'var(--color-sceptre)' : 'inherit' }}
                    >
                      <span
                        aria-hidden
                        className="inline-block h-[7px] w-[7px] rounded-full border border-current transition-colors duration-500"
                        style={{ backgroundColor: on ? 'currentColor' : 'transparent' }}
                      />
                      {on ? 'Marked' : 'Mark this piece'}
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
