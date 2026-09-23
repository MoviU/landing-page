import { useLayoutEffect, useRef } from 'react';
import { createBlobs, createSprite, drawAurora, INTRO_MS, paintSprite } from './aurora';
import { toRgb } from './colors';
import './Background.css';

const BLOB_COUNT = 8;

type Level = {
  fps: number; // frame-rate cap
  downscale: number; // canvas pixels per CSS pixel, inverted (8 = 1/8 size)
};

// Quality ladder. Every level draws the full aurora — all eight glows, same
// look. What gives on a struggling device is only the frame rate and the size
// of the tiny bitmap, both close to invisible on something this soft and slow.
// The whole-screen GPU cost is one textured quad per rendered frame, so the
// frame rate is the lever that actually matters on a weak GPU.
const LEVELS: Level[] = [
  { fps: 60, downscale: 8 },
  { fps: 30, downscale: 8 },
  { fps: 20, downscale: 12 },
];

// The palette colors App.tsx tweens onto the root element's inline style.
const GLOW_VARS = ['--glow-1', '--glow-2', '--glow-3', '--glow-4'];

// Longest step the clock takes in one frame, so a stalled or backgrounded tab
// resumes where it left off instead of jumping ahead.
const MAX_STEP_MS = 100;

// How early a frame may land, so vsync jitter doesn't skip a frame that's due.
const PACING_SLACK_MS = 2;

// Runtime probe: sample the rendered frame rate in ~1s windows and drop a level
// after a couple of windows below 80% of the target. One-way, so the page
// settles on the best level the device sustains.
const SAMPLE_MS = 1000;
const MAX_STRIKES = 2;

// Start constrained devices a level down, so they don't spend the first few
// seconds proving to the probe that they're slow.
function getInitialLevel(): number {
  const nav = navigator as Navigator & {
    deviceMemory?: number; // GB of RAM (rounded), Chromium only
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const saveData = nav.connection?.saveData === true;
  const slowNet = /2g/.test(nav.connection?.effectiveType ?? '');
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return saveData || slowNet || cores <= 4 || memory <= 4 ? 1 : 0;
}

type BackgroundProps = {
  reducedMotion: boolean;
};

const Background = ({ reducedMotion }: BackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Layout effect so the first frame is painted before the browser's first
  // paint — an opaque canvas starts out black.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return;

    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const defaults = GLOW_VARS.map((name) => styles.getPropertyValue(name).trim());
    const blobs = createBlobs(BLOB_COUNT);
    const sprites = GLOW_VARS.map(createSprite);
    const spriteColors = GLOW_VARS.map(() => ''); // the color each sprite holds

    let level = getInitialLevel();
    // Reduced motion gets one still frame with the glows already fully in.
    let clock = reducedMotion ? INTRO_MS : 0;

    // Re-bake a sprite only when its palette color changed, i.e. mid palette
    // fade. The rest of the time a frame costs four string compares.
    const syncSprites = () => {
      for (let i = 0; i < GLOW_VARS.length; i++) {
        const color = root.style.getPropertyValue(GLOW_VARS[i]).trim() || defaults[i];
        if (color === spriteColors[i]) continue;
        spriteColors[i] = color;
        paintSprite(sprites[i], i, toRgb(color));
      }
    };

    const resize = () => {
      const { downscale } = LEVELS[level];
      // Size from the element's own box, which is what CSS stretches the
      // bitmap over; window.innerWidth/innerHeight can differ by the scrollbar
      // or the iOS toolbar and would squash the glows into ellipses.
      const width = Math.max(1, Math.ceil(canvas.clientWidth / downscale));
      const height = Math.max(1, Math.ceil(canvas.clientHeight / downscale));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width; // also clears the bitmap, so repaint right after
      canvas.height = height;
    };

    const paint = () => {
      syncSprites();
      drawAurora(ctx, canvas.width, canvas.height, blobs, sprites, clock);
    };

    const repaint = () => {
      resize();
      paint();
    };

    repaint();
    canvas.dataset.level = reducedMotion ? 'still' : String(level); // for devtools
    const resizeObserver = new ResizeObserver(repaint);
    resizeObserver.observe(canvas);

    if (reducedMotion) {
      // No clock. Repaint only when something visible changes: a resize, or
      // App snapping to a new palette on the root element's inline style.
      const styleObserver = new MutationObserver(paint);
      styleObserver.observe(root, { attributes: true, attributeFilter: ['style'] });
      return () => {
        styleObserver.disconnect();
        resizeObserver.disconnect();
      };
    }

    let raf = 0;
    let last = performance.now();
    let due = 0; // time accrued toward the next rendered frame
    let windowStart = last;
    let frames = 0;
    let strikes = 0;
    let warmedUp = false; // skip the first window: mount/font work isn't steady state

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      const elapsed = now - last;
      last = now;
      clock += Math.min(elapsed, MAX_STEP_MS);
      if (elapsed > 500) {
        // A hidden tab or a one-off stall, not a slow device.
        windowStart = now;
        frames = 0;
      }

      // Pace to the level's frame rate. The remainder carries over rather than
      // resetting, so the average holds the target at any refresh rate: a 90Hz
      // display alternates one- and two-frame gaps for a steady 60fps instead
      // of settling on every other frame (45fps).
      const interval = 1000 / LEVELS[level].fps;
      due += elapsed;
      if (due < interval - PACING_SLACK_MS) return;
      due = Math.min(due - interval, interval);
      paint();

      if (level === LEVELS.length - 1) return; // at the floor, nothing left to tune
      frames += 1;
      if (now - windowStart < SAMPLE_MS) return;
      const fps = (frames * 1000) / (now - windowStart);
      windowStart = now;
      frames = 0;

      if (!warmedUp) {
        warmedUp = true;
      } else if (fps >= LEVELS[level].fps * 0.8) {
        strikes = 0; // a healthy window forgives earlier stutter
      } else if (++strikes >= MAX_STRIKES) {
        strikes = 0;
        level += 1;
        canvas.dataset.level = String(level);
        repaint();
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="aurora" aria-hidden="true" />;
};

export default Background;
