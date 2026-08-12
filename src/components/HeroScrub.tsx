'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

/**
 * Enhanced Cinematic 3D Hero Sequence:
 * A 240-frame sequence scrubbed by scroll position with dynamic 3D camera depth,
 * interactive mouse perspective tilt, volumetric atmospheric lighting,
 * and a luxury editorial chapter HUD timeline controller.
 */

const DESKTOP = { folder: '/frames/d/', count: 240 };
const MOBILE = { folder: '/frames/m/', count: 120 };

/** The single scene change in Video.mp4, as normalised progress (frame 134 of 240). */
const CUT = 134 / 239;
const DISSOLVE = 0.028;

/** Matches the film's own near-black stage, so letterboxed edges are invisible. */
const STAGE = '#0E0A09';

const smoothstep = (t: number) => t * t * (3 - 2 * t);

const BEATS = [
  { from: 0.03, to: 0.24, targetP: 0.13, badge: '01 · ARCHITECTURE', line: 'Structured. Bold. Yours.', place: 'left' },
  { from: 0.42, to: 0.62, targetP: 0.52, badge: '02 · CRAFT & SHAPE', line: 'Cut to hold its shape.', place: 'left' },
  { from: 0.80, to: 1.0,  targetP: 0.88, badge: '03 · THE REVEAL',    line: 'Seven pieces. One first run.', place: 'centre' },
] as const;

const FILM_ENDS_AT = 0.76;
const filmProgress = (raw: number) => Math.min(1, raw / FILM_ENDS_AT);

function beatOpacity(p: number, from: number, to: number) {
  if (p <= from || p >= to) return 0;
  const t = (p - from) / (to - from);
  const edge = 0.22;
  return Math.min(1, Math.min(t / edge, (1 - t) / edge));
}

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

  /** 3D Mouse perspective tilt */
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });
  const tiltRaf = useRef<number>(0);

  /** Direct HUD DOM Refs for high performance 60fps updates */
  const hudFrameRef = useRef<HTMLSpanElement>(null);
  const hudPctRef = useRef<HTMLSpanElement>(null);
  const hudBarRef = useRef<HTMLDivElement>(null);
  const chapterDotRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const detailRef = useRef<number[] | null>(null);
  const idleRef = useRef<number>(0);
  const settleRef = useRef<number>(0);

  /* ---------- 3D mouse parallax listener ---------- */
  useEffect(() => {
    if (coarse || reducedMotion) return;

    const updateTilt = () => {
      setTilt((prev) => {
        const dx = targetTilt.current.x - prev.x;
        const dy = targetTilt.current.y - prev.y;
        if (Math.abs(dx) < 0.005 && Math.abs(dy) < 0.005) return prev;
        return { x: prev.x + dx * 0.08, y: prev.y + dy * 0.08 };
      });
      tiltRaf.current = requestAnimationFrame(updateTilt);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const nx = (e.clientX - cx) / cx;
      const ny = (e.clientY - cy) / cy;
      targetTilt.current = { x: -ny * 4.5, y: nx * 5.5 };
    };

    const handlePointerLeave = () => {
      targetTilt.current = { x: 0, y: 0 };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    tiltRaf.current = requestAnimationFrame(updateTilt);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(tiltRaf.current);
    };
  }, [coarse, reducedMotion]);

  /* ---------- load, progressively ---------- */
  useEffect(() => {
    if (reducedMotion) return;
    const tier =
      window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1100 ? DESKTOP : MOBILE;
    tierRef.current = tier;
    imagesRef.current = new Array(tier.count).fill(null);

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
    const totalFrames = tierRef.current.count;
    const last = totalFrames - 1;

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

    // Dynamic 3D Camera Dolly Zoom
    const dollyScale = 1.0 + Math.sin(p * Math.PI) * 0.045 + p * 0.02;

    const paint = (img: HTMLImageElement) => {
      const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight) * dollyScale;
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    };
    paint(a);
    if (b && b !== a && t > 0.002) { ctx.globalAlpha = t; paint(b); ctx.globalAlpha = 1; }

    // Atmospheric 3D Lighting & Vignette Overlay
    const lightGrad = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * (0.38 + p * 0.1), 0,
      canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.7
    );
    lightGrad.addColorStop(0, 'rgba(245, 241, 230, 0.04)');
    lightGrad.addColorStop(0.4, 'rgba(77, 14, 18, 0.03)');
    lightGrad.addColorStop(1, 'rgba(14, 10, 9, 0.65)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update Text Beats & 3D Depth
    for (let i = 0; i < BEATS.length; i++) {
      const el = beatRefs.current[i];
      if (!el) continue;
      const o = beatOpacity(p, BEATS[i].from, BEATS[i].to);
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${(1 - o) * 16}px, ${o * 20}px) scale(${0.96 + o * 0.04})`;
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    }

    if (cueRef.current) {
      const o = Math.max(0, 1 - p * 16);
      cueRef.current.style.opacity = String(o);
      cueRef.current.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    }

    // High performance HUD update
    const currentFrameIdx = Math.min(last, Math.floor(p * totalFrames));
    if (hudFrameRef.current) {
      hudFrameRef.current.textContent = String(currentFrameIdx + 1).padStart(3, '0');
    }
    if (hudPctRef.current) {
      hudPctRef.current.textContent = `${Math.round(p * 100)}%`;
    }
    if (hudBarRef.current) {
      hudBarRef.current.style.height = `${p * 100}%`;
    }

    // Update active chapter node styling in HUD
    BEATS.forEach((b, idx) => {
      const btn = chapterDotRefs.current[idx];
      if (btn) {
        const active = p >= b.from && p <= b.to;
        btn.style.opacity = active ? '1' : '0.4';
        btn.style.transform = active ? 'scale(1.25)' : 'scale(1)';
      }
    });

    progressRef.current = p;
  };

  /* ---------- size the canvas ---------- */
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const resize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = canvas.getBoundingClientRect();
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
  }, [ready, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    let alive = true;
    fetch('/frames/detail.json')
      .then((r) => r.json())
      .then((j: { count: number; detail: number[] }) => {
        if (alive && Array.isArray(j?.detail)) detailRef.current = j.detail;
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [reducedMotion]);

  const crispestNear = (frame: number): number | null => {
    const detail = detailRef.current;
    if (!detail) return null;
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

  useEffect(() => {
    if (coarse && ready && !reducedMotion) draw(holdRef.current);
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
  }, [ready, reducedMotion, coarse]);

  const scrollToBeat = (targetP: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const trackTop = window.scrollY + rect.top;
    const trackHeight = rect.height - window.innerHeight;
    const targetY = trackTop + targetP * trackHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  /* ---------- touch layout ---------- */
  if (coarse && !reducedMotion) {
    return (
      <section id="film" data-ground="dark" data-nav-bg="transparent" className="relative h-[100svh] w-full overflow-hidden bg-[#0E0A09]">
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
            <span className="eyebrow mb-3 inline-block rounded-full border border-ivory/15 bg-ivory/10 px-3 py-1 text-[0.65rem] tracking-[0.3em] text-cerulean backdrop-blur-md">
              {b.badge}
            </span>
            <p className="display-lg max-w-[14em]" style={{ textShadow: '0 2px 40px rgba(14,10,9,0.6)' }}>
              {b.line}
            </p>
          </div>
        ))}

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

  /* ---------- reduced motion ---------- */
  if (reducedMotion) {
    return (
      <section id="film" data-ground="dark" data-nav-bg="transparent" className="bg-[#0E0A09] text-ivory">
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
      data-nav-bg="transparent"
      className="relative h-[700svh] bg-[#0E0A09]"
      aria-label="The RORA suit, in film"
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{
          perspective: '1000px',
        }}
      >
        {/* 3D Tilted Viewport Container */}
        <div
          className="relative h-full w-full transition-transform duration-75 ease-out"
          style={{
            transform: `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

          {/* Radial Vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(115% 75% at 50% 45%, transparent 45%, rgba(14,10,9,0.65) 100%)' }}
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
              <span className="eyebrow mb-3 inline-block rounded-full border border-ivory/15 bg-ivory/10 px-3 py-1 text-[0.65rem] tracking-[0.34em] text-cerulean shadow-lg backdrop-blur-md">
                {b.badge}
              </span>
              <p
                className={`display-lg mt-2 ${b.place === 'centre' ? 'mx-auto max-w-[16em]' : 'max-w-[13em]'}`}
                style={{ textShadow: '0 4px 50px rgba(14,10,9,0.7)' }}
              >
                {b.line}
              </p>
            </div>
          ))}

          {/* 3D Luxury Editorial Timeline HUD */}
          <div className="pointer-events-auto absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-6 sm:flex lg:right-10">
            <div className="flex flex-col items-end gap-1.5 text-right font-mono text-[0.65rem] tracking-widest text-ivory/60">
              <span className="eyebrow text-[0.6rem] text-ivory/40">SCENE</span>
              <div className="flex items-center gap-1">
                <span ref={hudFrameRef} className="font-bold text-ivory">001</span>
                <span className="text-ivory/30">/</span>
                <span className="text-ivory/50">{tierRef.current.count}</span>
              </div>
            </div>

            {/* Vertical Progress Bar & Chapter Markers */}
            <div className="relative my-2 flex h-36 w-6 flex-col items-center justify-between">
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ivory/15" />
              <div ref={hudBarRef} className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-cerulean shadow-[0_0_8px_#A5BCD6]" style={{ height: '0%' }} />

              {BEATS.map((b, idx) => (
                <button
                  key={b.badge}
                  type="button"
                  ref={(el) => { chapterDotRefs.current[idx] = el; }}
                  onClick={() => scrollToBeat(b.targetP)}
                  title={`Jump to ${b.badge}`}
                  className="group relative z-10 flex items-center justify-center p-1.5 transition-transform duration-300"
                >
                  <span className="h-2 w-2 rounded-full border border-ivory/50 bg-[#0E0A09] transition-colors duration-300 group-hover:border-cerulean group-hover:bg-cerulean" />
                  <span className="eyebrow pointer-events-none absolute right-8 rounded border border-ivory/10 bg-[#231815]/90 px-2 py-1 text-[0.6rem] whitespace-nowrap text-ivory opacity-0 shadow-xl transition-opacity duration-300 group-hover:opacity-100">
                    {b.badge}
                  </span>
                </button>
              ))}
            </div>

            <div className="font-mono text-[0.65rem] tracking-widest text-ivory/50">
              <span ref={hudPctRef}>0%</span>
            </div>
          </div>

          <div
            ref={cueRef}
            className="pointer-events-none absolute inset-x-0 bottom-9 z-10 flex flex-col items-center gap-3 text-ivory/55"
            style={{ willChange: 'opacity' }}
          >
            <span className="eyebrow text-[0.7rem] tracking-[0.3em]">Scroll to Explore</span>
            <span aria-hidden className="block h-9 w-px animate-pulse bg-current opacity-40" />
          </div>

          {!ready && (
            <div className="absolute inset-x-0 bottom-0 z-20 h-px bg-ivory/10">
              <div className="h-full bg-ivory/45 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      </div>

      <div className="sr-only">
        {BEATS.map((b) => <p key={b.line}>{b.line}</p>)}
      </div>
    </section>
  );
}
