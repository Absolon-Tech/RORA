'use client';

import { Reveal } from './Reveal';

/**
 * Why RORA. Three claims, no more — each one short enough to read without deciding to.
 * Set on ivory so the page breathes between the film and the request.
 */
const CLAIMS = [
  {
    numeral: 'I',
    head: 'Tailoring without the boardroom.',
    body: 'Cut with real structure — canvassed, shaped, made to hold its line. Then softened enough that it never announces the office.',
  },
  {
    numeral: 'II',
    head: 'Made in small numbers.',
    body: 'The first run is short by design. Fewer pieces, cut properly, in sizes decided by the people actually waiting for them.',
  },
  {
    numeral: 'III',
    head: 'Worn however the day goes.',
    body: 'Split the suit. Wear the waistcoat alone. Throw the blazer over something soft. Nothing here only works one way.',
  },
];

export function Story() {
  return (
    <section id="house" data-ground="light" className="bg-ivory py-28 text-java sm:py-40">
      <div className="shell">
        <Reveal as="header">
          <p className="eyebrow text-sceptre">The house</p>
          <h2 className="display-lg mt-7 max-w-[17ch]">
            Clothes with a spine, <em className="italic">worn softly.</em>
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-14 sm:mt-28 sm:grid-cols-3 sm:gap-10">
          {CLAIMS.map((c, i) => (
            <Reveal key={c.numeral} delay={i * 120}>
              <div className="flex items-center gap-5">
                <span className="eyebrow opacity-35">{c.numeral}</span>
                <span aria-hidden className="h-px flex-1 bg-current opacity-15" />
              </div>
              <h3 className="display-md mt-7 max-w-[16ch]">{c.head}</h3>
              <p className="lede mt-5 max-w-[38ch] opacity-65">{c.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
