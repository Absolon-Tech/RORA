'use client';

import { CSSProperties, useEffect, useRef, useState } from 'react';

// --- design tokens ---
const C = {
  red: '#4D0E12', // Sceptre Red
  ivory: '#F5F1E6', // Soft Ivory
  blue: '#A5BCD6', // Cerulean
  soil: '#4A2E27', // Potting Soil
  java: '#231815', // Java Brown
} as const;

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter Tight', 'Inter', sans-serif";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// --- helpers ---
function pad(n: number) {
  return String(n).padStart(2, '0');
}

function useCountdown(launchISO: string) {
  const calc = () => {
    const target = new Date(launchISO).getTime();
    const d = Math.max(0, target - Date.now());
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    };
  };
  const [cd, setCd] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setCd(calc()), 1000);
    return () => clearInterval(id);
  }, [launchISO]);
  return cd;
}

function usePrefersReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(mq.matches);
    const h = (e: MediaQueryListEvent) => setR(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return r;
}

function useMediaQuery(query: string) {
  const [m, setM] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });
  useEffect(() => {
    const mq = window.matchMedia(query);
    setM(mq.matches);
    const h = (e: MediaQueryListEvent) => setM(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [query]);
  return m;
}

const eyebrow: CSSProperties = {
  fontFamily: SANS,
  fontSize: "11px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  fontWeight: 400,
  display: "block",
};

function CountdownOverlay({ progress, reduced, launchISO }: { progress: number; reduced: boolean; launchISO: string }) {
  const cd = useCountdown(launchISO);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isNarrow = useMediaQuery("(max-width: 520px)");

  const overlayOpacity = reduced
    ? progress >= 1
      ? 0
      : 1
    : Math.max(0, 1 - Math.pow(progress, 0.65) * 1.18);
  const scale = reduced ? 1 : 1 - progress * 0.02;

  const [ctaHover, setCtaHover] = useState(false);

  return (
    <div
      aria-hidden={overlayOpacity < 0.05}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        overflow: "hidden",
        opacity: overlayOpacity,
        transform: `scale(${scale})`,
        willChange: "opacity, transform",
        pointerEvents: overlayOpacity < 0.05 ? "none" : "auto",
      }}
    >
      <img
        src="/images/DEE01332.JPG"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(160deg, rgba(35,24,21,0.96) 0%, rgba(35,24,21,0.93) 60%, rgba(35,24,21,0.88) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(35,24,21,0.6) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 45% at 50% 36%, rgba(74,46,39,0.25) 0%, transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='280' height='280' filter='url(%23g)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: "overlay",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: `clamp(40px,6vh,80px) clamp(1.2rem, 5vw, 5rem) 0`,
          }}
        >
          <div
            className="flex flex-col md:flex-row items-center md:items-baseline justify-center flex-nowrap md:flex-wrap gap-4 md:gap-3 mb-[clamp(1rem,2.2vh,1.8rem)] md:mb-[clamp(1rem,2vh,1.8rem)]"
          >
            <span
              className="text-[clamp(1.9rem,9vw,3rem)] md:text-[clamp(1.9rem,min(5.2vw,6vh),3.4rem)]"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 300,
                color: "#F5F1E6",
                lineHeight: 1,
              }}
            >
              It&apos;s
            </span>
            <img
              src="/images/logo-light-tight.png"
              alt="RORA"
              className="w-[min(70vw,320px)] h-auto md:w-auto md:h-[clamp(42px,min(6.4vw,7.6vh),76px)]"
            />
            <span
              className="text-[clamp(1.9rem,9vw,3rem)] md:text-[clamp(1.9rem,min(5.2vw,6vh),3.4rem)]"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 300,
                color: "#F5F1E6",
                lineHeight: 1,
              }}
            >
              o&apos;clock
            </span>
          </div>

          <div
            style={{
              ...eyebrow,
              fontSize: "clamp(11px, 1.3vw, 14px)",
              letterSpacing: isNarrow ? "0.18em" : "0.34em",
              color: "rgba(74,46,39,0.8)",
              marginBottom: "clamp(1.4rem, 3vh, 3.4rem)",
            }}
          >
            Structured · Bold · Yours
          </div>

          <div
            style={{
              ...eyebrow,
              fontSize: "clamp(11px, 1.1vw, 13px)",
              letterSpacing: "0.36em",
              color: "rgba(245,241,230,0.55)",
              marginBottom: "0.45rem",
            }}
          >
            Launching
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(1.3rem, min(3vw, 3.2vh), 2.4rem)",
              color: "rgba(245,241,230,0.75)",
              marginBottom: "clamp(1.4rem, 3vh, 3rem)",
              lineHeight: 1,
            }}
          >
            30 August 2026
          </div>

          <div
            className="countdown-units"
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "clamp(1.8rem, 3.5vh, 4rem)",
            }}
          >
            {([
              { label: "Days", val: cd.days },
              { label: "Hrs", val: cd.hours },
              { label: "Min", val: cd.minutes },
              { label: "Sec", val: cd.seconds },
            ] as const).map((u, i) => (
              <div
                key={u.label}
                className="countdown-pair"
                style={{ display: "flex", alignItems: "flex-start" }}
              >
                {i > 0 && (
                  <span
                    className="countdown-sep"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "clamp(0.2rem, 0.7vw, 0.55rem)",
                      height: "clamp(3.6rem, min(11vw, 11vh), 10.5rem)",
                      padding: "0 clamp(0.15rem, 0.5vw, 0.6rem)",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        width: "clamp(0.18rem, 0.55vw, 0.42rem)",
                        height: "clamp(0.18rem, 0.55vw, 0.42rem)",
                        borderRadius: "50%",
                        background: C.blue,
                      }}
                    />
                    <span
                      style={{
                        width: "clamp(0.18rem, 0.55vw, 0.42rem)",
                        height: "clamp(0.18rem, 0.55vw, 0.42rem)",
                        borderRadius: "50%",
                        background: C.blue,
                      }}
                    />
                  </span>
                )}
                <div
                  style={{
                    textAlign: "center",
                    minWidth: "clamp(3rem, min(10vw, 10vh), 9.5rem)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 300,
                      fontSize: "clamp(3.6rem, min(11vw, 11vh), 10.5rem)",
                      color: C.ivory,
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                      fontVariantNumeric: "tabular-nums",
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {pad(u.val)}
                  </div>
                  <div
                    style={{
                      ...eyebrow,
                      fontSize: "clamp(9px, 1vw, 11px)",
                      letterSpacing: "0.34em",
                      color: "rgba(245,241,230,0.45)",
                      marginTop: "0.5rem",
                    }}
                  >
                    {u.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#interest"
            onMouseEnter={() => setCtaHover(true)}
            onMouseLeave={() => setCtaHover(false)}
            style={{
              display: "inline-block",
              border: `1px solid rgba(245,241,230,0.38)`,
              color: ctaHover ? C.java : C.ivory,
              backgroundColor: ctaHover ? C.ivory : "transparent",
              padding: "clamp(14px, 2.2vh, 18px) clamp(32px, 5vw, 68px)",
              textDecoration: "none",
              fontFamily: SANS,
              fontSize: "clamp(10px, 1.1vw, 12px)",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              fontWeight: 400,
              marginBottom: "clamp(1.2rem, 2.4vh, 2.2rem)",
              minHeight: "44px",
              transition: `background-color 250ms ${EASE}, color 250ms ${EASE}, border-color 250ms ${EASE}`,
              borderColor: ctaHover ? C.ivory : "rgba(245,241,230,0.38)",
            }}
          >
            Join the Waitlist
          </a>

          <div
            style={{
              ...eyebrow,
              fontSize: "clamp(10px, 1.1vw, 12px)",
              letterSpacing: "0.28em",
              color: "rgba(245,241,230,0.38)",
              marginBottom: "clamp(0.7rem, 1.4vh, 1.1rem)",
            }}
          >
            Follow Us for Updates
          </div>
          <div style={{ display: "flex", gap: "0.8rem" }}>
            {[
              {
                k: "ig",
                label: "Instagram",
                svg: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                ),
                url: "https://instagram.com/theroraera"
              },
              {
                k: "tw",
                label: "Twitter / X",
                svg: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                ),
                url: "https://twitter.com/theroraera"
              },
              {
                k: "pi",
                label: "Pinterest",
                svg: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.36 9.31-.09-.79-.17-2 .03-2.87.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.48c0-1.39.81-2.43 1.81-2.43.85 0 1.26.64 1.26 1.41 0 .86-.55 2.14-.83 3.33-.24.99.5 1.8 1.48 1.8 1.77 0 2.98-2.29 2.98-5 0-2.07-1.4-3.59-3.91-3.59-2.84 0-4.64 2.13-4.64 4.49 0 .82.24 1.39.62 1.83.17.2.2.28.13.52-.04.17-.14.58-.18.74-.06.24-.24.32-.44.23-1.25-.52-1.85-1.9-1.85-3.48 0-2.57 2.17-5.67 6.45-5.67 3.46 0 5.73 2.51 5.73 5.21 0 3.56-1.96 6.24-4.85 6.24-.97 0-1.88-.52-2.19-1.1l-.61 2.35c-.22.84-.82 1.91-1.22 2.55.92.28 1.9.44 2.91.44C17.52 22 22 17.52 22 12S17.52 2 12 2z" />
                  </svg>
                ),
                url: "https://pinterest.com/theroraera"
              },
            ].map(({ k, label, svg, url }) => (
              <a
                key={k}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: `1px solid rgba(74,46,39,0.5)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(245,241,230,0.45)",
                  textDecoration: "none",
                  transition: `all 200ms ${EASE}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(245,241,230,0.6)";
                  e.currentTarget.style.color = C.ivory;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(74,46,39,0.5)";
                  e.currentTarget.style.color = "rgba(245,241,230,0.45)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                {svg}
              </a>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.65rem",
            padding: `clamp(1.2rem, 2.5vh, 2rem) 0 clamp(1.6rem, max(3.5vh, env(safe-area-inset-bottom, 1.6rem)), 3.2rem)`,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              ...eyebrow,
              fontSize: "clamp(9px, 1.1vw, 11px)",
              letterSpacing: "0.26em",
              color: "rgba(245,241,230,0.45)",
            }}
          >
            Scroll to explore our launch lineup
          </span>
          <svg
            width="16"
            height="22"
            viewBox="0 0 16 22"
            fill="none"
            style={{
              color: "rgba(245,241,230,0.45)",
              animation: reduced ? "none" : "bounce 2s ease-in-out infinite",
            }}
          >
            <path d="M8 1v15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M2 12l6 7 6-7" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.65rem 2.5rem",
          borderTop: `1px solid rgba(74,46,39,0.2)`,
        }}
      >
        <span style={{ ...eyebrow, fontSize: "8px", color: "rgba(245,241,230,0.2)", letterSpacing: "0.2em" }}>
          © 2026 RORA
        </span>
        <span style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "0.6rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(245,241,230,0.2)" }}>
          RORA
        </span>
      </div>
    </div>
  );
}

function NormalHero({ heroReveal, reduced }: { heroReveal: number; reduced: boolean }) {
  const [parallaxY, setParallaxY] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced) return;
    const h = () => {
      if (!ref.current) return;
      const top = ref.current.getBoundingClientRect().top;
      setParallaxY(-top * 0.15);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [reduced]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#161210]"
    >
      {/* Right-aligned Image */}
      <div 
        className="absolute inset-y-0 right-0 w-full lg:w-[60%] h-[110%] overflow-hidden pointer-events-none z-0"
        style={{
          transform: reduced ? "none" : `translateY(${parallaxY}px)`,
          willChange: reduced ? "auto" : "transform",
        }}
      >
        <img
          src="/images/section-2.png"
          alt="RORA editorial — structured womenswear"
          className="h-full w-full object-cover object-[center_30%] lg:object-[center_top]"
        />
        {/* Soft Left Edge Dissolve Mask into Dark Background */}
        <div
          aria-hidden
          className="hidden lg:block absolute inset-0"
          style={{
            background:
              'linear-gradient(270deg, transparent 0%, transparent 35%, rgba(22,18,16,0.85) 75%, #161210 100%)',
          }}
        />
      </div>

      {/* Mobile Bottom Blur Scrim */}
      <div
        aria-hidden
        className="lg:hidden absolute inset-x-0 bottom-0 h-[60%] pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(22,18,16,0.6) 25%, rgba(22,18,16,0.95) 70%, #161210 100%)',
        }}
      />

      {/* Left Dark Blur Layer for text (desktop) */}
      <div
        aria-hidden
        className="hidden lg:block absolute inset-y-0 left-0 w-[55%] pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(270deg, transparent 0%, rgba(22,18,16,0.7) 25%, #161210 60%, #161210 100%)',
        }}
      />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='280' height='280' filter='url(%23g)'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16"
        style={{
          opacity: heroReveal,
          transform: reduced ? "none" : `translateY(${(1 - heroReveal) * 22}px)`,
        }}
      >
        <div className="lg:w-[65%] xl:w-[60%] pt-[40vh] lg:pt-0">
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 300,
              color: C.ivory,
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
            }}
            className="text-[2.9rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] mb-6 drop-shadow-md"
          >
            An elevated take<br className="hidden lg:block" /> on <em style={{ fontStyle: "italic", color: "rgba(245,241,230,0.85)", fontWeight: 300 }}>power dressing.</em>
          </h1>

          <p
            style={{
              fontFamily: SANS,
              fontWeight: 300,
              color: "rgba(245,241,230,0.65)",
              lineHeight: 1.75,
            }}
            className="text-[0.95rem] sm:text-base mb-12 max-w-[44ch] drop-shadow-sm"
          >
            Structured pieces built to move with you — to dinner, to the door, to nowhere at all. The first collection arrives 30 August.
          </p>

          <div className="flex flex-wrap gap-x-10 gap-y-6 items-center">
            <a
              href="#interest"
              style={{
                fontFamily: SANS,
                fontSize: "11px",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 400,
                color: C.ivory,
                border: `1px solid rgba(245,241,230,0.3)`,
              }}
              className="px-9 py-4 hover:bg-[#F5F1E6] hover:text-[#161210] transition-colors duration-300"
            >
              Join the Waitlist
            </a>

            <a
              href="#pieces"
              style={{
                fontFamily: SANS,
                fontSize: "11px",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 400,
                color: "rgba(245,241,230,0.55)",
              }}
              className="hover:text-ivory transition-colors duration-300 flex items-center gap-2"
            >
              See what&apos;s coming <span style={{ fontSize: "14px" }}>&rarr;</span>
            </a>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex justify-between items-center px-6 sm:px-10 lg:px-16 pb-6 lg:pb-10 pointer-events-none"
      >
        <span style={{ ...eyebrow, fontSize: "9px", color: "rgba(245,241,230,0.25)", letterSpacing: "0.25em" }}>
          © 2026 RORA
        </span>
        <span className="hidden sm:block" style={{ ...eyebrow, fontSize: "9px", color: "rgba(245,241,230,0.25)", letterSpacing: "0.25em" }}>
          STRUCTURED · BOLD · YOURS
        </span>
      </div>
    </section>
  );
}

export function LaunchSequence({ launchISO }: { launchISO: string }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const h = () => {
      const ih = window.innerHeight;
      const p = ih > 0 ? Math.min(1, window.scrollY / ih) : 0;
      setScrollProgress(p);
    };
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);

  const heroReveal = reduced ? 1 : Math.min(1, Math.max(0, (scrollProgress - 0.65) / 0.35));

  return (
    <>
      <div aria-hidden style={{ height: "100svh", backgroundColor: C.java, pointerEvents: "none" }} />
      <CountdownOverlay progress={scrollProgress} reduced={reduced} launchISO={launchISO} />
      <NormalHero heroReveal={heroReveal} reduced={reduced} />
    </>
  );
}
