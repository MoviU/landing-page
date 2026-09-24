import { livePaletteColor, mixRgb, rgbCss, type Rgb } from '../colors';
import { COLS, DIRECTION_VECTORS, ROWS, type GameState } from './snakeEngine';

const WHITE: Rgb = [255, 255, 255];
const APPLE = '#e5484d';
const APPLE_STEM = '#2f9e6a';
const GRID_LINE = 'rgba(243, 241, 236, 0.05)';
const EYE = '#0c0202';

export type SnakeColors = { head: Rgb; tail: Rgb };

// The snake wears the site palette, which App.tsx cross-fades on the root
// element — so the board re-tints along with the aurora behind it. The apple
// keeps a fixed red so it never blends into a palette the snake is wearing.
export function readSnakeColors(): SnakeColors {
  const near = livePaletteColor('--g2', '#17a370');
  return {
    head: mixRgb(near, WHITE, 0.45),
    tail: livePaletteColor('--g1', '#04477d'),
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawGrid(ctx: CanvasRenderingContext2D, size: number, cell: number) {
  ctx.strokeStyle = GRID_LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < COLS; i++) {
    const x = Math.round(i * cell) + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
  }
  for (let i = 1; i < ROWS; i++) {
    const y = Math.round(i * cell) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
  }
  ctx.stroke();
}

function drawApple(
  ctx: CanvasRenderingContext2D,
  cell: number,
  apple: { x: number; y: number },
  pulse: number
) {
  const cx = (apple.x + 0.5) * cell;
  const cy = (apple.y + 0.5) * cell;
  const r = cell * 0.32 * pulse;

  // Soft halo, so the apple reads at a glance against any palette.
  const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.4);
  halo.addColorStop(0, 'rgba(229, 72, 77, 0.35)');
  halo.addColorStop(1, 'rgba(229, 72, 77, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = APPLE;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = APPLE_STEM;
  ctx.lineWidth = Math.max(1, cell * 0.09);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.8);
  ctx.lineTo(cx + r * 0.4, cy - r * 1.45);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.34, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  cell: number,
  x: number,
  y: number,
  dir: GameState['dir']
) {
  const v = DIRECTION_VECTORS[dir];
  const cx = x + cell / 2;
  const cy = y + cell / 2;
  // Sit the pair ahead of centre, spread across the direction of travel.
  const ahead = cell * 0.14;
  const spread = cell * 0.19;
  const r = Math.max(1, cell * 0.09);

  ctx.fillStyle = EYE;
  for (const side of [1, -1]) {
    ctx.beginPath();
    ctx.arc(
      cx + v.x * ahead - v.y * spread * side,
      cy + v.y * ahead + v.x * spread * side,
      r,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

/**
 * Paint one frame.
 *
 * `alpha` is how far the clock has travelled toward the next tick (0..1).
 * Segment i of the current state sits where segment i-1 sat on the previous
 * tick, so tweening each segment from prev[i] to curr[i] slides the whole
 * chain forward smoothly. A segment the snake just grew has no previous
 * position and simply stays put.
 */
export function drawSnake(
  ctx: CanvasRenderingContext2D,
  size: number,
  curr: GameState,
  prev: GameState,
  alpha: number,
  colors: SnakeColors,
  pulse: number
) {
  const cell = size / COLS;

  ctx.clearRect(0, 0, size, size);
  drawGrid(ctx, size, cell);

  if (curr.status !== 'won') drawApple(ctx, cell, curr.apple, pulse);

  const last = curr.snake.length - 1;
  // Tail first so the head paints on top of the segment behind it.
  for (let i = last; i >= 0; i--) {
    const to = curr.snake[i];
    const from = prev.snake[i] ?? to;
    const x = (from.x + (to.x - from.x) * alpha) * cell;
    const y = (from.y + (to.y - from.y) * alpha) * cell;

    ctx.fillStyle = rgbCss(
      mixRgb(colors.head, colors.tail, last === 0 ? 0 : i / last)
    );
    const inset = cell * (i === 0 ? 0.05 : 0.09);
    roundRect(
      ctx,
      x + inset,
      y + inset,
      cell - inset * 2,
      cell - inset * 2,
      cell * 0.3
    );
    ctx.fill();

    if (i === 0) drawEyes(ctx, cell, x, y, curr.dir);
  }
}
