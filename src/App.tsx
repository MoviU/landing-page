import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import './App.css';
import Background from './Background';
import Hero, { GLIDE_DURATION_S } from './Hero';
import Topbar, { type Palette } from './Topbar';
import Contact from './Contact';
import Footer from './Footer';
import { Link } from './router';
import { useRouter } from './routerContext';
import { mixRgb, rgbCss, toRgb } from './colors';

// The games live in their own chunks: the landing page is the hot path and
// shouldn't carry a game engine it may never run.
const Arcade = lazy(() => import('./games/Arcade'));
const Snake = lazy(() => import('./games/Snake'));

// Each palette is 4 colors: the four aurora glows. The title gradient reuses
// the first three. Index 0 is the site's signature maroon/blue/teal/purple.
const PALETTES: Palette[] = [
  ['#702727', '#04477d', '#17a370', '#70277d'], // signature
  ['#d97757', '#7a5ae0', '#1f8a5b', '#2a6fdb'], // amber / violet / emerald
  ['#f97066', '#2a6fdb', '#06b6d4', '#7a5ae0'], // coral / cobalt / cyan
  ['#a3a3a3', '#71717a', '#525252', '#404040'], // monochrome
  ['#eab308', '#f97316', '#dc2626', '#9333ea'], // sunset
];

const AUTO_FIRST_DELAY_MS = 3000;
const AUTO_INTERVAL_MS = 7000;
const FADE_MS = 1800;

const TITLES: Record<string, string> = {
  '/': 'Max Kachimov - official website',
  '/games': 'Arcade — Max Kachimov',
  '/games/snake': 'Snake — Max Kachimov',
};

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// Fade/slide-in wrapper for the content that appears after the hero intro.
// A CSS animation (see .rise-in), so it runs on the compositor thread.
function Reveal({
  delay,
  y = 0,
  children,
}: {
  delay: number;
  y?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="rise-in"
      style={{ animationDelay: `${delay}s`, '--rise-from': `${y}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function NotFound() {
  return (
    <section className="cta-row">
      <article className="cta-card">
        <h2>Nothing here</h2>
        <p>
          That page doesn&rsquo;t exist &mdash; or it did once and has since
          been tidied away.
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/">
            Back home
          </Link>
          <Link className="btn btn-ghost" href="/games">
            Visit the arcade
          </Link>
        </div>
      </article>
    </section>
  );
}

function App() {
  const { path } = useRouter();

  // Honor the OS "reduce motion" setting: no auto-cycling, palette changes snap
  // instead of running a per-frame color tween, the aurora holds a still frame
  // and the wordmark skips its glide. Read once here and passed down.
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // The wordmark intro only belongs on a fresh landing at the root. Deep-link
  // straight into a game and the chrome is simply there.
  const [landedOnHome] = useState(() => path === '/');
  const [showContent, setShowContent] = useState(!landedOnHome);
  const revealDelay = landedOnHome ? GLIDE_DURATION_S : 0;

  const [paletteIndex, setPaletteIndex] = useState(0);
  const [autoPalette, setAutoPalette] = useState(!prefersReducedMotion);
  const palette = PALETTES[paletteIndex];

  useEffect(() => {
    document.title = TITLES[path] ?? 'Max Kachimov';
  }, [path]);

  // Auto: cycle palettes on an interval. First transition fires after 3s so the
  // cross-fade is visible right away, then every 7s.
  useEffect(() => {
    if (!autoPalette || prefersReducedMotion) return;
    const tick = () => setPaletteIndex((i) => (i + 1) % PALETTES.length);
    const first = setTimeout(tick, AUTO_FIRST_DELAY_MS);
    const id = setInterval(tick, AUTO_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [autoPalette, prefersReducedMotion]);

  // Colors currently painted on screen (rgb strings), so an interrupted fade
  // resumes from where it visually is rather than snapping.
  const displayedRef = useRef<string[]>(PALETTES[0]);

  // Tween the palette into the CSS custom properties so the background glows
  // and the wordmark gradient cross-fade when the palette changes.
  useEffect(() => {
    const root = document.documentElement.style;
    const from = displayedRef.current.map(toRgb);
    const to = palette.map(toRgb);
    const start = performance.now();

    const apply = (colors: string[]) => {
      colors.forEach((c, i) => root.setProperty(`--glow-${i + 1}`, c));
      root.setProperty('--g0', colors[0]);
      root.setProperty('--g1', colors[1]);
      root.setProperty('--g2', colors[2]);
      displayedRef.current = colors;
    };

    // Reduced motion: skip the per-frame cross-fade entirely and snap.
    if (prefersReducedMotion) {
      apply(to.map(rgbCss));
      return;
    }

    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS);
      const e = easeInOut(t);
      apply(from.map((color, i) => rgbCss(mixRgb(color, to[i], e))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // requestAnimationFrame is paused while the tab is hidden, so guarantee the
    // final colors land regardless. When visible, the rAF tween reaches the same
    // values first and this is a harmless no-op.
    const settle = window.setTimeout(() => apply(to.map(rgbCss)), FADE_MS + 50);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [palette, prefersReducedMotion]);

  // A manual pick turns Auto off.
  const pickPalette = (index: number) => {
    setAutoPalette(false);
    setPaletteIndex(index);
  };

  const isHome = path === '/';

  return (
    <>
      <Background reducedMotion={prefersReducedMotion} />
      <main className="page">
        {showContent && (
          <Reveal delay={revealDelay} y={-8}>
            <Topbar
              palettes={PALETTES}
              paletteIndex={paletteIndex}
              onPaletteChange={pickPalette}
              auto={autoPalette}
              onToggleAuto={() => setAutoPalette((v) => !v)}
            />
          </Reveal>
        )}

        {isHome ? (
          <>
            <Hero
              showContent={showContent}
              onAnimationComplete={() => setShowContent(true)}
              reducedMotion={prefersReducedMotion}
            />

            {showContent && (
              <Reveal delay={revealDelay + 0.2} y={12}>
                <Contact />
              </Reveal>
            )}
          </>
        ) : (
          <Suspense fallback={<div className="route-loading" />}>
            {path === '/games' ? (
              <Arcade />
            ) : path === '/games/snake' ? (
              <Snake />
            ) : (
              <NotFound />
            )}
          </Suspense>
        )}

        {showContent && (
          <Reveal delay={revealDelay + 0.35}>
            <Footer />
          </Reveal>
        )}
      </main>
    </>
  );
}

export default App;
