import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './Background.css';

// --- Configuration ---
const MIN_DURATION = 30;
const MAX_DURATION = 50;

type Tier = 'high' | 'medium' | 'low' | 'off';

type TierConfig = {
  count: number; // how many glow layers to render
  blur: number; // blur radius in px (the dominant GPU cost)
  size: number; // glow diameter in px
  xRange: number; // horizontal travel in px (repaint region width)
  yRange: number; // vertical travel in px
  animate: boolean; // false = static glows, no per-frame work
};

// Quality tiers. The app starts at the best tier the device is likely to
// handle and a runtime FPS monitor steps it down if frames are being dropped,
// so capable machines keep the full effect while weak ones degrade gracefully.
const TIERS: Record<Tier, TierConfig> = {
  high: { count: 10, blur: 70, size: 900, xRange: 1000, yRange: 1200, animate: true },
  medium: { count: 6, blur: 55, size: 800, xRange: 700, yRange: 900, animate: true },
  low: { count: 4, blur: 45, size: 700, xRange: 450, yRange: 550, animate: true },
  off: { count: 4, blur: 60, size: 800, xRange: 0, yRange: 0, animate: false },
};

// One-way degradation path. 'low' is the animated floor; we never auto-disable
// motion — that only happens when the user asks for it via prefers-reduced-motion.
const NEXT_DOWN: Record<Tier, Tier> = {
  high: 'medium',
  medium: 'low',
  low: 'low',
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

function getInitialTier(): Tier {
  if (typeof window === 'undefined') return 'high';
  // Respect the OS-level accessibility preference: no motion at all.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off';
  // iOS Safari has a hard per-tab GPU-memory cap and discards the page (dark
  // blank screen) when blurred animated layers exceed it. Start phones lower so
  // the page can't blank out before the FPS monitor has a chance to react.
  if (window.matchMedia('(max-width: 767px)').matches) return 'medium';
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

      return {
        id: i,
        colorClass: `glow-${(i % 4) + 1}`, // Cycles through glow-1, glow-2, etc.
        variants: {
          initial: {
            opacity: 0,
            scale: 0.5,
          },
          animate: {
            opacity: 1,
            x: xPath,
            y: yPath,
            scale: [1, 1.2, 0.8, 1.1, 0.9, 1.15, 0.85, 1.05, 1], // Breathing effect
            transition: {
              x: { duration, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', delay },
              y: { duration, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', delay },
              scale: {
                duration: duration * 0.8, // Slightly faster than movement for organic feel
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
                delay,
              },
              opacity: { duration: 2, ease: 'easeOut' }, // Entrance fade-in
            },
          },
        },
      };
    });
  }, [config.count, config.xRange, config.yRange]);

  return (
    <div
      className="aurora-container"
      style={
        {
          '--glow-size': `${config.size}px`,
          '--glow-blur': `${config.blur}px`,
        } as React.CSSProperties
      }
    >
      {config.animate
        ? glows.map((glow) => (
            <motion.div
              key={glow.id}
              className={`aurora-glow ${glow.colorClass}`}
              variants={glow.variants}
              initial="initial"
              animate="animate"
            />
          ))
        : glows.map((glow) => (
            // Static fallback: positioned and tinted by CSS, no per-frame work.
            <div key={glow.id} className={`aurora-glow ${glow.colorClass}`} />
          ))}

      {/* The Dark Overlay */}
      <div className="dark-overlay"></div>
    </div>
  );
};

export default Background;
