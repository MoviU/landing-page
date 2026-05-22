import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import Background from './Background';
import Hero, { GLIDE_DURATION_S } from './Hero';
import Topbar, { type Palette } from './Topbar';
import Contact from './Contact';
import Footer from './Footer';

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

type Rgb = [number, number, number];

// Accepts #rgb, #rrggbb, or rgb(...) and returns an [r, g, b] tuple.
function toRgb(color: string): Rgb {
  if (color.startsWith('rgb')) {
    const [r, g, b] = color.match(/\d+/g)!.map(Number);
    return [r, g, b];
  }
  const s = color.replace('#', '');
  const hex = s.length === 3 ? s.replace(/./g, (c) => c + c) : s;
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

function App() {
  const [showContent, setShowContent] = useState(false);
  const [palette, setPalette] = useState<Palette>(PALETTES[0]);
  const [autoPalette, setAutoPalette] = useState(true);

  // Read the latest palette inside the cycle interval without restarting it
  // every change (which would reset the timer).
  const paletteRef = useRef(palette);
  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);

  // Auto: cycle palettes on an interval. First transition fires after 3s so the
  // cross-fade is visible right away, then every 7s.
  useEffect(() => {
    if (!autoPalette) return;
    const tick = () => {
      const i = PALETTES.findIndex((opt) =>
        opt.every((c, j) => c === paletteRef.current[j])
      );
      setPalette(PALETTES[(i + 1 + PALETTES.length) % PALETTES.length]);
    };
    const first = setTimeout(tick, AUTO_FIRST_DELAY_MS);
    const id = setInterval(tick, AUTO_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [autoPalette]);

  // Colors currently painted on screen (rgb strings), so an interrupted fade
  // resumes from where it visually is rather than snapping.
  const displayedRef = useRef<string[]>(PALETTES[0]);
  const rafRef = useRef<number>(0);

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

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS);
      const e = easeInOut(t);
      apply(
        from.map(
          ([r, g, b], i) =>
            `rgb(${lerp(r, to[i][0], e)}, ${lerp(g, to[i][1], e)}, ${lerp(b, to[i][2], e)})`
        )
      );
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    // requestAnimationFrame is paused while the tab is hidden, so guarantee the
    // final colors land regardless. When visible, the rAF tween reaches the same
    // values first and this is a harmless no-op.
    const settle = window.setTimeout(
      () => apply(to.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`)),
      FADE_MS + 50
    );

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(settle);
    };
  }, [palette]);

  // A manual pick turns Auto off.
  const pickPalette = (next: Palette) => {
    setAutoPalette(false);
    setPalette(next);
  };

  return (
    <>
      <Background />
      <main className="page">
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: GLIDE_DURATION_S }}
          >
            <Topbar
              palettes={PALETTES}
              palette={palette}
              onPaletteChange={pickPalette}
              auto={autoPalette}
              onToggleAuto={() => setAutoPalette((v) => !v)}
            />
          </motion.div>
        )}

        <Hero
          showContent={showContent}
          onAnimationComplete={() => setShowContent(true)}
        />

        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: GLIDE_DURATION_S + 0.2 }}
          >
            <Contact />
          </motion.div>
        )}

        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: GLIDE_DURATION_S + 0.35 }}
          >
            <Footer />
          </motion.div>
        )}
      </main>
    </>
  );
}

export default App;
