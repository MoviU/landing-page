import type { Rgb } from './colors';

// The aurora, as a pure renderer. No DOM beyond the canvases it's handed —
// Background.tsx owns the canvas, the clock and the quality level.
//
// Why a canvas: the glows are nothing but soft, slow, low-frequency color, so
// there's no detail to lose by rendering them at a fraction of the screen's
// resolution and letting the browser's bilinear upscale do the softening. That
// turns eight huge blurred GPU layers into one tiny bitmap (~240x135 on a 1080p
// screen) plus a single full-screen textured quad, which even a software
// compositor handles, at any devicePixelRatio.

type Wave = { amp: number; speed: number; phase: number };

export type Blob = {
  color: number; // index into the 4 palette glow colors
  ax: number; // anchor, as a fraction of the viewport
  ay: number;
  x: [Wave, Wave]; // two sines per axis with unrelated periods, so the path
  y: [Wave, Wave]; //   wanders without ever visibly repeating
  breathe: [Wave, Wave]; // radius pulse
};

// Blob radius as a fraction of the viewport's longer side (~480px at 1080p,
// about half the screen's height across on a phone).
const RADIUS = 0.25;

// Peak alpha per glow color. Glow 1 a touch stronger, as it always was. Wide
// wander means blobs spend time partly off-screen, which is what keeps the
// on-screen color saturated rather than overlapping into grey; these strengths
// put the average brightness back on the old CSS aurora's.
const STRENGTH = [0.5, 0.44, 0.44, 0.44];

// Radial falloff: 1 - smoothstep. A soft shoulder at the center and a tail that
// eases to zero, the look the old radial-gradient + blur(60px) produced — minus
// the blur.
const FALLOFF: [number, number][] = [0, 0.2, 0.4, 0.6, 0.8, 1].map((d) => [
  d,
  1 - d * d * (3 - 2 * d),
]);

const BASE = '#110606';
// The old .dark-overlay: 20% black over everything.
const DIM = 'rgba(0, 0, 0, 0.2)';

export const INTRO_MS = 2000;

// Each glow color is baked once into a small sprite; a frame is then just a
// scaled drawImage per blob, with no gradients or color strings allocated.
// Sprites are repainted only when their color changes (a palette fade).
const SPRITE_SIZE = 128;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const wave = (amp: number, minPeriodS: number, maxPeriodS: number): Wave => ({
  amp,
  speed: (Math.PI * 2) / (rand(minPeriodS, maxPeriodS) * 1000),
  phase: rand(0, Math.PI * 2),
});

const at = (w: Wave, t: number) => w.amp * Math.sin(t * w.speed + w.phase);

// Anchors sit on a jittered 4x2 grid, so the colors spread across the screen on
// every load instead of sometimes clumping into one muddy patch. The second row
// is color-shifted by two so no column stacks the same hue.
export function createBlobs(count: number): Blob[] {
  return Array.from({ length: count }, (_, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4) % 2;
    return {
      color: (col + row * 2) % 4,
      ax: (col + 0.5) / 4 + rand(-0.08, 0.08),
      ay: (row + 0.5) / 2 + rand(-0.1, 0.1),
      x: [wave(0.3, 14, 24), wave(0.12, 8, 13)],
      y: [wave(0.42, 14, 24), wave(0.15, 8, 13)],
      breathe: [wave(0.12, 6, 10), wave(0.06, 3.5, 5.5)],
    };
  });
}

export function createSprite(): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  return sprite;
}

// Bake glow `color` (0-3) in `rgb` into its sprite: the full falloff, with the
// color's strength as the peak alpha.
export function paintSprite(sprite: HTMLCanvasElement, color: number, [r, g, b]: Rgb) {
  const ctx = sprite.getContext('2d');
  if (!ctx) return;
  const c = SPRITE_SIZE / 2;
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
  for (const [stop, k] of FALLOFF) {
    gradient.addColorStop(stop, `rgba(${r}, ${g}, ${b}, ${STRENGTH[color] * k})`);
  }
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
}

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/**
 * Paint one frame into a (small) canvas of `width` x `height` pixels, using
 * one sprite per glow color.
 *
 * `t` is the animation clock in ms. The first two seconds fade and bloom the
 * glows in, as the old per-layer entrance did.
 */
export function drawAurora(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  blobs: Blob[],
  sprites: HTMLCanvasElement[],
  t: number
) {
  const intro = easeOut(Math.min(1, t / INTRO_MS));
  const unit = Math.max(width, height) * RADIUS * (0.75 + 0.25 * intro);

  ctx.fillStyle = BASE;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = intro;
  for (const blob of blobs) {
    const x = width * (blob.ax + at(blob.x[0], t) + at(blob.x[1], t));
    const y = height * (blob.ay + at(blob.y[0], t) + at(blob.y[1], t));
    const r = unit * (1 + at(blob.breathe[0], t) + at(blob.breathe[1], t));
    ctx.drawImage(sprites[blob.color], x - r, y - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = DIM;
  ctx.fillRect(0, 0, width, height);
}
