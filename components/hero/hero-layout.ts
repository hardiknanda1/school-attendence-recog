/**
 * Where the frame is drawn inside the hero stage. Mirrors `.hero-media` in
 * app/globals.css so the canvas and the static fallback image line up exactly.
 */

/** Narrow/portrait screens use a dedicated crop with the headline above it. */
export const PORTRAIT_QUERY = "(max-aspect-ratio: 17/20)";

/** Fraction of the frame width visible in portrait (the right-hand part, with the scanner). */
const PORTRAIT_VISIBLE = 0.54;
/**
 * Landscape: the frame is shown from CROP_START (where the plain lobby wall
 * begins; everything left of it is corridor and lockers) to its right edge,
 * beside a solid text panel. The visible crop takes 60–64% of the stage width
 * and covers the full height where the aspect ratio allows.
 */
const CROP_START = 0.42;
const CROP_MIN_SHARE = 0.6;
const CROP_MAX_SHARE = 0.64;
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
  const visible = 1 - CROP_START;
  const w = Math.max(
    Math.min((stageH * imageW) / imageH, (stageW * CROP_MAX_SHARE) / visible),
    (stageW * CROP_MIN_SHARE) / visible,
  );
  const h = (w * imageH) / imageW;
  // Shorter than the stage (squarer screens): sit on the floor line, faded in at the top.
  const gap = stageH - h;
  return { x: stageW - w, y: Math.max(gap, gap * ALIGN_Y), w, h };
}
