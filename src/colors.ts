export type Rgb = [number, number, number];

// Accepts #rgb, #rrggbb, or rgb(...) and returns an [r, g, b] tuple.
export function toRgb(color: string): Rgb {
  if (color.startsWith('rgb')) {
    const [r, g, b] = color.match(/\d+/g)!.map(Number);
    return [r, g, b];
  }
  const s = color.replace('#', '');
  const hex = s.length === 3 ? s.replace(/./g, (c) => c + c) : s;
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const lerp = (a: number, b: number, t: number) =>
  Math.round(a + (b - a) * t);

export const mixRgb = (from: Rgb, to: Rgb, t: number): Rgb => [
  lerp(from[0], to[0], t),
  lerp(from[1], to[1], t),
  lerp(from[2], to[2], t),
];

export const rgbCss = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;

// The live palette colors App.tsx tweens onto the root element. Reading the
// inline style (rather than getComputedStyle) is a plain map lookup with no
// style recalc, so it's safe to call from an animation frame. Before the first
// tween lands the property is empty and the caller's fallback is used.
export function livePaletteColor(name: string, fallback: string): Rgb {
  const inline = document.documentElement.style.getPropertyValue(name).trim();
  return toRgb(inline || fallback);
}
