import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';

type HeroProps = {
  showContent: boolean;
  onAnimationComplete: () => void;
  reducedMotion: boolean;
};

const INTRO_APPEAR_MS = 700;
const INTRO_HOLD_MS = 450;
export const GLIDE_DURATION_S = 1.0;
const GLIDE_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const WORDMARK_FONT: CSSProperties = { fontFamily: "'Skyer Monolite', sans-serif" };

const riseIn = (delay: number): CSSProperties =>
  ({ animationDelay: `${delay}s`, '--rise-from': '8px' }) as CSSProperties;

function Hero({ showContent, onAnimationComplete, reducedMotion }: HeroProps) {
  const wordmarkRef = useRef<HTMLDivElement>(null);
  // Where the intro wordmark sat when it handed off to the in-flow one.
  const introRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    if (showContent) return;
    const timer = setTimeout(() => {
      introRectRef.current = wordmarkRef.current?.getBoundingClientRect() ?? null;
      onAnimationComplete();
    }, INTRO_APPEAR_MS + INTRO_HOLD_MS);
    return () => clearTimeout(timer);
  }, [showContent, onAnimationComplete]);

  // FLIP glide: the wordmark has just jumped from the center of the screen to
  // its place in the hero. Before the browser paints, shift it back to where it
  // was and animate the transform home — a compositor-only animation, so it
  // glides smoothly while React mounts the rest of the page.
  useLayoutEffect(() => {
    const from = introRectRef.current;
    const el = wordmarkRef.current;
    if (!showContent || !from || !el) return;
    introRectRef.current = null;
    if (reducedMotion) return;

    const to = el.getBoundingClientRect();
    const glide = el.animate(
      [
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` },
        { transform: 'none' },
      ],
      { duration: GLIDE_DURATION_S * 1000, easing: GLIDE_EASE }
    );
    return () => glide.cancel();
  }, [showContent, reducedMotion]);

  if (!showContent) {
    return (
      <section className="hero">
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            ref={wordmarkRef}
            className="wordmark title-gradient fade-in"
            style={{ ...WORDMARK_FONT, animationDuration: `${INTRO_APPEAR_MS}ms` }}
          >
            Max Kachimov
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      <p className="kicker rise-in" style={riseIn(GLIDE_DURATION_S + 0.05)}>
        Software engineer, building quietly reliable systems in fintech &amp; medtech.
      </p>

      <div ref={wordmarkRef} className="wordmark title-gradient" style={WORDMARK_FONT}>
        Max Kachimov
      </div>

      <p className="tagline rise-in" style={riseIn(GLIDE_DURATION_S + 0.2)}>
        Software Engineer · California, USA
      </p>
    </section>
  );
}

export default Hero;
