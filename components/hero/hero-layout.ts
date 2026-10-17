/**
 * Where the frame is drawn inside the hero stage. Mirrors `.hero-media` in
 * app/globals.css so the canvas and the static fallback image line up exactly.
 */

/** Narrow/portrait screens use a dedicated crop with the headline above it. */
export const PORTRAIT_QUERY = "(max-aspect-ratio: 17/20)";

/** Fraction of the frame width visible in portrait (the right-hand part, with the scanner). */
const PORTRAIT_VISIBLE = 0.54;
/** Cover alignment in landscape: favour the right so the scanner never crops out. */
const ALIGN_X = 0.85;
const ALIGN_Y = 0.6;

export type Rect = { x: number; y: number; w: number; h: number };

export function mediaRect(
  stageW: number,
  stageH: number,
  imageW: number,
  imageH: number,
  portrait: boolean,
): Rect {
  if (portrait) {
    const w = stageW / PORTRAIT_VISIBLE;
    const h = (w * imageH) / imageW;
    return { x: stageW - w, y: stageH - h, w, h };
  }
  const scale = Math.max(stageW / imageW, stageH / imageH);
  const w = imageW * scale;
  const h = imageH * scale;
  return { x: (stageW - w) * ALIGN_X, y: (stageH - h) * ALIGN_Y, w, h };
}
