'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

/**
 * The cinematic hero: a 240-frame sequence scrubbed by scroll position.
 *
 * Why frames and not <video>: writing `currentTime` is not frame-accurate. Browsers seek to the
 * nearest keyframe and decode forward, so reversing direction stalls the decoder and the picture
 * visibly stutters — worst on mobile Safari. A frame sequence on a canvas is exact in both
 * directions and free to reverse.
 *
 * Why HTMLImageElement and not ImageBitmap: a decoded 1280x720 bitmap is 3.7 MB. All 240 would be
 * ~880 MB. Image elements let the browser hold the encoded bytes (3.2 MB total) and manage decoded
 * surfaces itself.
 *
 * Smoothness comes from three things: every source frame is used (not a sample), neighbouring
 * frames are cross-faded by the fractional remainder so no frame boundary is ever visible, and the
 * one hard cut in the footage (frame 134) is widened into a dissolve so the edit reads as a
 * transition rather than a glitch.
 */

const DESKTOP = { folder: '/frames/d/', count: 240 };
const MOBILE = { folder: '/frames/m/', count: 120 };

/** The single scene change in Video.mp4, as normalised progress (frame 134 of 240). */
const CUT = 134 / 239;
const DISSOLVE = 0.028;

/** Matches the film's own near-black stage, so letterboxed edges are invisible. */
const STAGE = '#0E0A09';

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Exactly three text moments, as the brief requires — opening, middle, close. Each holds for
 * roughly a fifth of the scroll, which at a 520vh track is about a full viewport of scrolling:
 * long enough to read without hurrying.
 */
const BEATS = [
  { from: 0.03, to: 0.24, line: 'Structured. Bold. Yours.', place: 'left' },
  { from: 0.42, to: 0.62, line: 'Cut to hold its shape.', place: 'left' },
  { from: 0.80, to: 1.0, line: 'Seven pieces. One first run.', place: 'centre' },
] as const;

/**
 * The film finishes before the scroll does.
 *
 * Mapping the last frame to the very end of the track meant the complete suit appeared and was
 * immediately carried off — no time to actually look at it. Frames now finish at 76% of the
 * track, and the remaining 24% (roughly two unhurried scrolls at a 700svh track) holds on the
 * finished silhouette before the section releases.
 */
const FILM_ENDS_AT = 0.76;

const filmProgress = (raw: number) => Math.min(1, raw / FILM_ENDS_AT);

/** Fade in, hold, fade out across a window. */
function beatOpacity(p: number, from: number, to: number) {
  if (p <= from || p >= to) return 0;
  const t = (p - from) / (to - from);
  const edge = 0.22;
  return Math.min(1, Math.min(t / edge, (1 - t) / edge));
}

/**
 * Touch devices get a different interaction entirely.
 *
 * Scrubbing a pinned section with a thumb is genuinely awkward: momentum overshoots, the browser
 * chrome collapses mid-gesture and re-measures the pin, and the finger covers the thing it is
 * revealing. Press-and-hold is calmer and more tactile — you hold, the film unfolds; you let go,
 * it waits. Nothing is pinned, so native scrolling is never touched.
 */
const COARSE = '(pointer: coarse)';

function subscribeCoarse(cb: () => void) {
  const mq = window.matchMedia(COARSE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function usePointerCoarse() {
  return useSyncExternalStore(
    subscribeCoarse,
    () => window.matchMedia(COARSE).matches,
    () => false,
  );
}

/** Continuous holding needed to run the whole film, in ms. Close to the source's own 10s. */
const HOLD_DURATION = 11000;

export function HeroScrub({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const coarse = usePointerCoarse();
  const holdRef = useRef(0);
  const heldRef = useRef(false);
  const lastTsRef = useRef(0);
  const holdRafRef = useRef(0);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const [holdDone, setHoldDone] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cueRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>([]);
  const tierRef = useRef(DESKTOP);
  const progressRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [pct, setPct] = useState(0);
  /** Per-frame relative detail, used to settle on a crisp frame when the user stops. */
  const detailRef = useRef<number[] | null>(null);
  const idleRef = useRef<number>(0);
  const settleRef = useRef<number>(0);

  /* ---------- load, progressively ---------- */
  useEffect(() => {
    if (reducedMotion) return;
    const tier =
      window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1100 ? DESKTOP : MOBILE;
    tierRef.current = tier;
    imagesRef.current = new Array(tier.count).fill(null);

    // Opening frames first so the hero paints at once, then a coarse sweep of the whole timeline
    // so any scrub target has a near neighbour, then the gaps.
    const order: number[] = [];
    const seen = new Set<number>();
    const push = (i: number) => { if (i >= 0 && i < tier.count && !seen.has(i)) { seen.add(i); order.push(i); } };
    for (let i = 0; i < 10; i++) push(i);
    for (let i = 0; i < tier.count; i += 6) push(i);
    push(tier.count - 1);
    for (let i = 0; i < tier.count; i += 2) push(i);
    for (let i = 0; i < tier.count; i++) push(i);

    let cancelled = false;
    let loaded = 0, cursor = 0, inFlight = 0;
    const MAX = tier === DESKTOP ? 10 : 4;

    const pump = () => {
      while (!cancelled && inFlight < MAX && cursor < order.length) {
        const idx = order[cursor++];
        if (imagesRef.current[idx]) continue;
        inFlight++;
        const img = new Image();
        img.decoding = 'async';
        img.src = `${tier.folder}f_${String(idx + 1).padStart(3, '0')}.webp`;
        const done = (ok: boolean) => {
          if (cancelled) return;
          inFlight--;
          if (ok) {
            imagesRef.current[idx] = img;
            loaded++;
            setPct(Math.round((loaded / tier.count) * 100));
            if (loaded >= Math.ceil(tier.count / 6)) setReady(true);
          }
          pump();
        };
        img.decode().then(() => done(true)).catch(() => {
          if (img.complete && img.naturalWidth > 0) done(true);
          else { img.onload = () => done(true); img.onerror = () => done(false); }
        });
      }
    };
    pump();
    return () => { cancelled = true; };
  }, [reducedMotion]);

  /* ---------- draw ---------- */
  const nearest = (i: number): HTMLImageElement | null => {
    const imgs = imagesRef.current;
    const n = tierRef.current.count;
    const c = Math.max(0, Math.min(n - 1, Math.round(i)));
    if (imgs[c]) return imgs[c];
    // Substitute only from nearby; past that, hold the last picture rather than teleport.
    for (let r = 1; r <= 6; r++) {
      if (c - r >= 0 && imgs[c - r]) return imgs[c - r];
      if (c + r < n && imgs[c + r]) return imgs[c + r];
    }
    return null;
  };

  const draw = (p: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const last = tierRef.current.count - 1;

    let a: HTMLImageElement | null, b: HTMLImageElement | null = null, t = 0;

    if (p > CUT - DISSOLVE && p < CUT + DISSOLVE) {
      a = nearest((CUT - DISSOLVE) * last);
      b = nearest((CUT + DISSOLVE) * last);
      t = smoothstep((p - (CUT - DISSOLVE)) / (2 * DISSOLVE));
    } else {
      const f = p * last;
      a = nearest(Math.floor(f));
      b = nearest(Math.floor(f) + 1);
      t = f - Math.floor(f);
    }
    if (!a) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';
    ctx.fillStyle = STAGE;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const paint = (img: HTMLImageElement) => {
      const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    };
    paint(a);
    if (b && b !== a && t > 0.002) { ctx.globalAlpha = t; paint(b); ctx.globalAlpha = 1; }

    // Typography is written straight to the DOM — no React state at 60fps.
    for (let i = 0; i < BEATS.length; i++) {
      const el = beatRefs.current[i];
      if (!el) continue;
      const o = beatOpacity(p, BEATS[i].from, BEATS[i].to);
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${(1 - o) * 12}px, 0)`;
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    }
    if (cueRef.current) {
      const o = Math.max(0, 1 - p * 16);
      cueRef.current.style.opacity = String(o);
      cueRef.current.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    }

    progressRef.current = p;
  };

  /* ---------- size the canvas (never inside the scrub loop) ---------- */
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const resize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = canvas.getBoundingClientRect();
        // Source is 1280x720; above 1x on a wide screen we would be paying fill rate to upscale
        // detail that does not exist, and we draw two images per frame.
        const cap = r.width >= 1600 ? 1 : r.width >= 1000 ? 1.25 : 1.5;
        const s = Math.min(window.devicePixelRatio || 1, cap);
        const w = Math.max(1, Math.round(r.width * s));
        const h = Math.max(1, Math.round(r.height * s));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w; canvas.height = h;
          draw(progressRef.current);
        }
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reducedMotion]);

  /* ---------- the film is in motion, so held frames can land on a blurred one ----------
   *
   * The footage carries real motion blur. Stop scrolling to read a line and you may be parked on
   * a smeared frame, which looks like the site is out of focus rather than like cinema.
   *
   * `detail.json` carries each frame's relative encoded detail (measured offline: at fixed
   * quality, a sharper frame keeps more high-frequency information and encodes larger). Absolute
   * values track content as much as focus, so we only ever compare LOCALLY — the crispest frame
   * within a few either side. When scrolling stops we ease onto it. The move is small enough to
   * read as the camera settling, never as a jump, and any new scroll cancels it immediately.
   */
  useEffect(() => {
    if (reducedMotion) return;
    let alive = true;
    fetch('/frames/detail.json')
      .then((r) => r.json())
      .then((j: { count: number; detail: number[] }) => {
        if (alive && Array.isArray(j?.detail)) detailRef.current = j.detail;
      })
      .catch(() => { /* settling is an enhancement; the scrub works without it */ });
    return () => { alive = false; };
  }, [reducedMotion]);

  /** Nearest locally-crispest frame index, or null if there is nothing better to move to. */
  const crispestNear = (frame: number): number | null => {
    const detail = detailRef.current;
    if (!detail) return null;
    // The manifest is indexed against the 240-frame master; map if we are on the mobile tier.
    const scale = detail.length / tierRef.current.count;
    const master = Math.round(frame * scale);
    const RADIUS = 5;
    let best = master, bestV = -1;
    for (let i = Math.max(0, master - RADIUS); i <= Math.min(detail.length - 1, master + RADIUS); i++) {
      if (detail[i] > bestV) { bestV = detail[i]; best = i; }
    }
    const target = best / scale;
    return Math.abs(target - frame) < 0.6 ? null : target;
  };

  /* ---------- touch: press and hold ---------- */
  const tick = (ts: number) => {
    if (!heldRef.current) return;
    const dt = lastTsRef.current ? ts - lastTsRef.current : 16;
    lastTsRef.current = ts;

    holdRef.current = Math.min(1, holdRef.current + dt / HOLD_DURATION);
    draw(holdRef.current);
    if (barRef.current) barRef.current.style.width = `${holdRef.current * 100}%`;

    if (holdRef.current >= 1) {
      heldRef.current = false;
      setHoldDone(true);
      return;
    }
    holdRafRef.current = requestAnimationFrame(tick);
  };

  const startHold = () => {
    if (holdRef.current >= 1) return;
    heldRef.current = true;
    lastTsRef.current = 0;
    cancelAnimationFrame(holdRafRef.current);
    holdRafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    heldRef.current = false;
    cancelAnimationFrame(holdRafRef.current);
  };

  useEffect(() => () => cancelAnimationFrame(holdRafRef.current), []);

  // First paint for the hold layout, once frames are in.
  useEffect(() => {
    if (coarse && ready && !reducedMotion) draw(holdRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coarse, ready, reducedMotion]);

  /* ---------- pointer: pin + scrub ---------- */
  useEffect(() => {
    if (reducedMotion || coarse || !ready) return;
    const track = trackRef.current;
    if (!track) return;
    draw(0);

    const settle = () => {
      const last = tierRef.current.count - 1;
      const from = progressRef.current;
      const target = crispestNear(from * last);
      if (target === null) return;
      const to = Math.max(0, Math.min(1, target / last));
      const start = performance.now();
      const DURATION = 420;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        const eased = 1 - Math.pow(1 - t, 3);
        draw(from + (to - from) * eased);
        if (t < 1) settleRef.current = requestAnimationFrame(tick);
      };
      settleRef.current = requestAnimationFrame(tick);
    };

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      pin: track.firstElementChild as HTMLElement,
      pinSpacing: false,
      scrub: 0.7,
      onUpdate: (self) => {
        // Any movement cancels a settle in progress — the finger always wins.
        cancelAnimationFrame(settleRef.current);
        clearTimeout(idleRef.current);
        draw(filmProgress(self.progress));
        idleRef.current = window.setTimeout(settle, 200);
      },
      onRefresh: () => draw(progressRef.current),
    });

    return () => {
      st.kill();
      clearTimeout(idleRef.current);
      cancelAnimationFrame(settleRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reducedMotion, coarse]);

  /* ---------- touch layout: one screen, held rather than scrubbed ---------- */
  if (coarse && !reducedMotion) {
    return (
      <section id="film" data-ground="dark" className="relative h-[100svh] w-full overflow-hidden bg-[#0E0A09]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(115% 75% at 50% 40%, transparent 45%, rgba(14,10,9,0.72) 100%)' }}
        />

        {BEATS.map((b, i) => (
          <div
            key={b.line}
            ref={(el) => { beatRefs.current[i] = el; }}
            className="pointer-events-none absolute inset-x-6 top-[14svh] z-10 text-ivory"
            style={{ opacity: 0, visibility: 'hidden', willChange: 'opacity, transform' }}
          >
            <p className="display-lg max-w-[14em]" style={{ textShadow: '0 2px 40px rgba(14,10,9,0.6)' }}>
              {b.line}
            </p>
          </div>
        ))}

        {/*
          The hold target. `touch-action: none` so the gesture is ours and the page never scrolls
          underneath a held finger; everything outside this strip scrolls completely normally.
        */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Press and hold to play the film"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); startHold(); }}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startHold(); } }}
          onKeyUp={endHold}
          className="absolute inset-x-0 bottom-0 z-20 flex h-[34svh] select-none flex-col items-center justify-end pb-12"
          style={{ touchAction: 'none' }}
        >
          <span className="eyebrow mb-5 text-ivory/70">
            {holdDone ? 'Scroll on' : 'Press and hold'}
          </span>
          <span aria-hidden className="relative block h-px w-[58%] max-w-[280px] bg-ivory/20">
            <span ref={barRef} className="absolute inset-y-0 left-0 block bg-ivory/70" style={{ width: '0%' }} />
          </span>
        </div>

        {!ready && (
          <div className="absolute inset-x-0 top-0 z-20 h-px bg-ivory/10">
            <div className="h-full bg-ivory/45 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
          </div>
        )}

        <div className="sr-only">{BEATS.map((b) => <p key={b.line}>{b.line}</p>)}</div>
      </section>
    );
  }

  /* ---------- reduced motion: one still, full narrative as text ---------- */
  if (reducedMotion) {
    return (
      <section id="film" data-ground="dark" className="bg-[#0E0A09] text-ivory">
        <div className="shell py-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/frames/poster.webp" alt="The RORA suit in plum with gold crest buttons" className="w-full" />
          <div className="mt-14 grid gap-8">
            {BEATS.map((b) => (
              <p key={b.line} className="display-md max-w-[20ch]">{b.line}</p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="film"
      ref={trackRef}
      data-ground="dark"
      // Longer than the film needs on purpose: the extra distance is what buys the unhurried
      // scroll rate through the sequence and the held beat on the finished suit at the end.
      className="relative h-[700svh] bg-[#0E0A09]"
      aria-label="The RORA suit, in film"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* A whisper of vignette so type always has a ground, without dimming the garment. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(115% 75% at 50% 45%, transparent 45%, rgba(14,10,9,0.6) 100%)' }}
        />

        {BEATS.map((b, i) => (
          <div
            key={b.line}
            ref={(el) => { beatRefs.current[i] = el; }}
            className={
              b.place === 'centre'
                ? 'pointer-events-none absolute inset-x-6 top-[16svh] z-10 text-center text-ivory sm:inset-x-10 lg:inset-x-20'
                : 'pointer-events-none absolute inset-x-6 bottom-[15svh] z-10 text-ivory sm:inset-x-10 lg:inset-x-20'
            }
            style={{ opacity: 0, visibility: 'hidden', willChange: 'opacity, transform' }}
          >
            <p
              className={`display-lg ${b.place === 'centre' ? 'mx-auto max-w-[16em]' : 'max-w-[13em]'}`}
              style={{ textShadow: '0 2px 40px rgba(14,10,9,0.55)' }}
            >
              {b.line}
            </p>
          </div>
        ))}

        <div
          ref={cueRef}
          className="pointer-events-none absolute inset-x-0 bottom-9 z-10 flex flex-col items-center gap-3 text-ivory/55"
          style={{ willChange: 'opacity' }}
        >
          <span className="eyebrow">Scroll</span>
          <span aria-hidden className="block h-9 w-px bg-current opacity-40" />
        </div>

        {!ready && (
          // A hairline, not a spinner. A spinner would read as a web app.
          <div className="absolute inset-x-0 bottom-0 z-20 h-px bg-ivory/10">
            <div className="h-full bg-ivory/45 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      <div className="sr-only">
        {BEATS.map((b) => <p key={b.line}>{b.line}</p>)}
      </div>
    </section>
  );
}
