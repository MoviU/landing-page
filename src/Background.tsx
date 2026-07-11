import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import './Background.css';

// --- Configuration ---
const MIN_DURATION = 30;
const MAX_DURATION = 50;

type Tier = 'high' | 'medium' | 'low' | 'off';

type TierConfig = {
  count: number; // how many glow layers to render (overdraw = count × area)
  blur: number; // blur radius in px — a convolution, the single biggest GPU cost
  size: number; // glow diameter in px
  xRange: number; // horizontal travel in px (repaint region width)
  yRange: number; // vertical travel in px
  animate: boolean; // false = static glows, no per-frame work
  animateScale: boolean; // animate scale too? scale + blur re-rasterizes the
  //                         blurred layer every frame; translate-only just
  //                         re-composites a cached texture (nearly free).
  breathe: number[]; // scale keyframes — fewer points = cheaper interpolation
};

// The full "breathing" scale curve used on capable devices, and a cheaper
// 3-point curve for the lowest animated tier (less per-frame interpolation work
// for the same gentle pulsing feel).
const BREATHE_RICH = [1, 1.2, 0.8, 1.1, 0.9, 1.15, 0.85, 1.05, 1];
const BREATHE_LITE = [1, 1.08, 0.96, 1];

// Quality tiers. The app starts at the best tier the device is likely to handle
// and a runtime FPS monitor steps it down if frames drop, so capable machines
// keep the full effect while weak ones degrade gracefully.
//
// The cheap path for weak GPUs: blur 0 (the soft radial-gradient falloff already
// reads as a glow, so we skip the expensive blur convolution entirely) + fewer,
// smaller layers (less overdraw) + translate-only motion (the layer rasterizes
// once and the compositor just moves a cached texture each frame).
const TIERS: Record<Tier, TierConfig> = {
  high: { count: 8, blur: 60, size: 850, xRange: 1000, yRange: 1200, animate: true, animateScale: true, breathe: BREATHE_RICH },
  medium: { count: 5, blur: 28, size: 720, xRange: 700, yRange: 900, animate: true, animateScale: true, breathe: BREATHE_RICH },
  low: { count: 3, blur: 0, size: 540, xRange: 420, yRange: 520, animate: true, animateScale: false, breathe: BREATHE_LITE },
  off: { count: 3, blur: 0, size: 620, xRange: 0, yRange: 0, animate: false, animateScale: false, breathe: BREATHE_LITE },
};

// One-way degradation path. We prefer to keep motion, but a device that still
// can't hold the target frame rate at the minimal animated 'low' tier (4 small,
// lightly blurred layers) is genuinely struggling, so as a last resort we fall
// back to fully static glows ('off') rather than let it stutter indefinitely.
const NEXT_DOWN: Record<Tier, Tier> = {
  high: 'medium',
  medium: 'low',
  low: 'off',
  off: 'off',
};

// Helper to get a random number between min and max
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Helper to generate a random path array.
// We ensure the last point equals the first point for a seamless loop.
const generateRandomPath = (range: number, steps: number) => {
  const path = Array.from({ length: steps }, () => random(-range, range));
  path.push(path[0]); // Close the loop
  return path;
};

// Probe for a real, hardware GPU. A software rasterizer (SwiftShader, llvmpipe,
// "Microsoft Basic Render Driver") or no WebGL at all means there's effectively
// no GPU to composite blurred layers — exactly the case we must render cheaply.
function hasWeakOrNoGpu(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return true; // no WebGL → assume no usable GPU
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false; // can't tell; trust the other heuristics
    const renderer = String(
      gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? ''
    ).toLowerCase();
    return /swiftshader|llvmpipe|software|microsoft basic|mesa offscreen/.test(renderer);
  } catch {
    return false;
  }
}

// Pick the starting tier from what the device tells us about itself, so weak
// hardware never has to render a few seconds of the heaviest effect before the
// runtime FPS monitor can react. The monitor still fine-tunes from here.
function getInitialTier(): Tier {
  if (typeof window === 'undefined') return 'high';
  // Respect the OS-level accessibility preference: no motion at all.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off';

  const nav = navigator as Navigator & {
    deviceMemory?: number; // GB of RAM (rounded), Chromium only
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  // Hard "this device/connection is constrained" signals.
  const saveData = nav.connection?.saveData === true;
  const slowNet = /2g/.test(nav.connection?.effectiveType ?? '');
  const cores = nav.hardwareConcurrency ?? 8; // logical CPUs; assume capable if unknown
  const memory = nav.deviceMemory ?? 8; // GB; assume capable if unknown
  const isPhone = window.matchMedia('(max-width: 767px)').matches;

  // No real GPU → the cheap, blur-free, translate-only path from the start.
  if (hasWeakOrNoGpu()) return 'low';

  // Clearly low-end: few cores / little RAM, or the user asked to save data.
  if (saveData || slowNet || cores <= 4 || memory <= 4) return 'low';

  // iOS Safari has a hard per-tab GPU-memory cap and discards the page (dark
  // blank screen) when blurred animated layers exceed it. Start phones at
  // 'medium' so the page can't blank out before the FPS monitor reacts.
  if (isPhone) return 'medium';

  return 'high';
}

const Background = () => {
  const [tier, setTier] = useState<Tier>(getInitialTier);

  // Mirror the tier into a ref so the once-mounted FPS loop can read the current
  // value without being torn down and restarted every time the tier changes.
  const tierRef = useRef(tier);
  useEffect(() => {
    tierRef.current = tier;
  }, [tier]);

  // Runtime performance probe. Sample the real frame rate in ~1s windows; if the
  // device misses our target across a couple of windows, drop a quality tier.
  // Degradation is one-way, so we settle on the best tier the device sustains.
  useEffect(() => {
    if (!TIERS[tierRef.current].animate) return; // nothing to monitor when static

    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let acc = 0;
    let strikes = 0;
    let warmedUp = false; // skip the first window: mount/font work isn't steady state
    const SAMPLE_MS = 1000;
    const TARGET_FPS = 45;
    const MAX_STRIKES = 2;

    const tick = (now: number) => {
      frames += 1;
      acc += now - last;
      last = now;

      if (acc >= SAMPLE_MS) {
        const fps = (frames * 1000) / acc;
        if (!warmedUp) {
          warmedUp = true; // discard the noisy startup window
        } else if (fps < TARGET_FPS) {
          strikes += 1;
          if (strikes >= MAX_STRIKES) {
            setTier((t) => NEXT_DOWN[t]);
            strikes = 0;
          }
        } else {
          strikes = 0; // a healthy window forgives earlier stutter
        }
        frames = 0;
        acc = 0;
        // Reached the animated floor — stop probing to save the main thread.
        if (NEXT_DOWN[tierRef.current] === tierRef.current) return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const config = TIERS[tier];

  // Regenerate the random paths when the tier's motion envelope changes. This
  // only happens on the rare downgrade, so the slight re-seed is unnoticeable.
  const glows = useMemo(() => {
    return Array.from({ length: config.count }).map((_, i) => {
      // 1. Create random motion paths covering the screen
      const xPath = generateRandomPath(config.xRange, 8);
      const yPath = generateRandomPath(config.yRange, 8);

      // 2. Randomize timing so they don't move in sync
      const duration = random(MIN_DURATION, MAX_DURATION);

      // 3. Large negative delay for "pre-warming" (instant smooth movement)
      const delay = -random(0, duration);

      // Scale "breathing" is only enabled on capable tiers. On the low tier we
      // animate position alone: combined with blur 0 the layer rasterizes once
      // and the GPU simply re-composites the cached texture at a new offset.
      const scaleAnim = config.animateScale
        ? {
            scale: config.breathe,
            transition: {
              scale: {
                duration: duration * 0.8, // slightly faster than movement, organic feel
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop' as const,
                delay,
              },
            },
          }
        : null;

      return {
        id: i,
        colorClass: `glow-${(i % 4) + 1}`, // Cycles through glow-1, glow-2, etc.
        variants: {
          initial: {
            opacity: 0,
            scale: config.animateScale ? 0.5 : 1,
          },
          animate: {
            opacity: 1,
            x: xPath,
            y: yPath,
            ...(scaleAnim ? { scale: scaleAnim.scale } : {}),
            transition: {
              x: { duration, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', delay },
              y: { duration, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', delay },
              ...(scaleAnim ? scaleAnim.transition : {}),
              opacity: { duration: 2, ease: 'easeOut' }, // Entrance fade-in
            },
          },
        },
      };
    });
  }, [config.count, config.xRange, config.yRange, config.animateScale, config.breathe]);

  // When blur is 0 we drop the filter entirely ('no-blur') rather than apply
  // blur(0px) — even a zero-radius filter establishes a filter layer the GPU has
  // to allocate and rasterize. The soft radial-gradient carries the glow look.
  const blurClass = config.blur === 0 ? ' no-blur' : '';

  return (
    <div
      className="aurora-container"
      style={
        {
          '--glow-size': `${config.size}px`,
          '--glow-blur': `${config.blur}px`,
        } as CSSProperties
      }
    >
      {config.animate
        ? glows.map((glow) => (
            <motion.div
              key={glow.id}
              // 'is-animated' carries `will-change`; the static fallback below
              // omits it so it doesn't needlessly hold a GPU layer.
              className={`aurora-glow is-animated${blurClass} ${glow.colorClass}`}
              variants={glow.variants}
              initial="initial"
              animate="animate"
            />
          ))
        : glows.map((glow) => (
            // Static fallback: positioned and tinted by CSS, no per-frame work.
            <div key={glow.id} className={`aurora-glow${blurClass} ${glow.colorClass}`} />
          ))}

      {/* The Dark Overlay */}
      <div className="dark-overlay"></div>
    </div>
  );
};

export default Background;
