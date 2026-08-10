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

/**
 * Anticipation, not a utility. A still from the film sits behind it, so the countdown belongs to
 * the same world rather than being a widget bolted on.
 *
 * The clock renders only after mount — the server cannot know the visitor's time, and rendering it
 * during SSR guarantees a hydration mismatch and a flicker on every load.
 */
export function Countdown({ launchISO, enabled }: { launchISO: string; enabled: boolean }) {
  const target = new Date(launchISO).getTime();
  const valid = Number.isFinite(target);
  const [left, setLeft] = useState<Left | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!enabled || !valid) return;
    // Scheduled, not called inline: a synchronous setState in an effect body cascades a render.
    const first = requestAnimationFrame(() => { setLeft(remaining(target)); setLive(true); });
    const id = setInterval(() => setLeft(remaining(target)), 1000);
    return () => { cancelAnimationFrame(first); clearInterval(id); };
  }, [target, valid, enabled]);

  if (!enabled || !valid) return null;

  const units: Array<[string, number | null]> = [
    ['Days', left?.days ?? null],
    ['Hours', left?.hours ?? null],
    ['Minutes', left?.minutes ?? null],
    ['Seconds', left?.seconds ?? null],
  ];

  return (
    <section
      id="countdown"
      data-ground="dark"
      // Exactly one viewport, never less: the landing must be the countdown alone, with no strip
      // of the film showing underneath to pull the eye down before the moment lands.
      className="relative isolate flex h-[100svh] items-center overflow-hidden bg-java text-ivory"
    >
      {/*
        A portrait photograph in a full-width band, so it is anchored right-of-centre rather than
        centred — the three figures sit clear of the type instead of behind it.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/countdown-ground.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        style={{ objectPosition: '72% 28%' }}
      />
      {/*
        Two scrims doing different jobs. The horizontal one is heavy on the left where the
        headline and clock sit and clears to almost nothing on the right, so the photograph is
        actually visible rather than uniformly dimmed. The second is a warm Potting Soil wash that
        pulls the image's cool blues and whites back towards the palette without touching the file.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(100deg, rgba(35,24,21,0.95) 0%, rgba(35,24,21,0.88) 32%, rgba(35,24,21,0.55) 62%, rgba(35,24,21,0.28) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 mix-blend-multiply"
        style={{ backgroundColor: 'rgba(74,46,39,0.42)' }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{ background: 'linear-gradient(180deg, rgba(35,24,21,0) 0%, rgba(35,24,21,0.85) 100%)' }}
      />

      <div className="shell w-full">
        <Reveal>
          <p className="eyebrow text-ivory/50">Autumn 2026</p>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="display-xl mt-8 max-w-[13ch]">
            The first run <em className="italic">arrives</em>.
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-16 flex flex-wrap items-start gap-x-12 gap-y-8 sm:gap-x-20" role="timer" aria-live="off">
            {units.map(([label, value]) => (
              <div key={label}>
                <div className="display-lg tabular-nums leading-none">
                  {live && value !== null ? String(value).padStart(2, '0') : <span className="opacity-0" aria-hidden>00</span>}
                </div>
                <div className="eyebrow mt-4 text-ivory/45">{label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
