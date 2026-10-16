/**
 * Progressive loader and bounded decode cache for the hero image sequence.
 *
 * - Compressed frames are fetched with limited concurrency, prioritised by
 *   distance from the current playhead. Every 8th/4th frame is pulled forward
 *   so a fast scroll always has a nearby frame to show.
 * - Only frames within `decodeRadius` of the playhead are kept decoded
 *   (a decoded 1280x720 frame is ~3.7 MB), so memory stays bounded no matter
 *   how long the sequence is. Compressed blobs (~70 KB each) are retained.
 */

type Drawable = ImageBitmap | HTMLImageElement;

type Options = {
  fetchConcurrency?: number;
  decodeConcurrency?: number;
  decodeRadius?: number;
};

const MAX_FETCH_ATTEMPTS = 2;

export class FrameSequence {
  readonly length: number;
  /** Called whenever a newly decoded frame becomes drawable. */
  onFrameReady: ((index: number) => void) | null = null;

  private readonly urls: readonly string[];
  private readonly blobs: (Blob | null)[];
  private readonly attempts: number[];
  private readonly failed: boolean[];
  private readonly fetching = new Set<number>();
  private readonly decoding = new Set<number>();
  private readonly decoded = new Map<number, Drawable>();
  private readonly abort = new AbortController();
  private readonly fetchConcurrency: number;
  private readonly decodeConcurrency: number;
  private readonly decodeRadius: number;
  private target = 0;
  private pinned = -1;
  private disposed = false;

  constructor(urls: readonly string[], options: Options = {}) {
    this.urls = urls;
    this.length = urls.length;
    this.blobs = new Array(urls.length).fill(null);
    this.attempts = new Array(urls.length).fill(0);
    this.failed = new Array(urls.length).fill(false);
    this.fetchConcurrency = options.fetchConcurrency ?? 4;
    this.decodeConcurrency = options.decodeConcurrency ?? 3;
    this.decodeRadius = options.decodeRadius ?? 10;
  }

  /** Moves the playhead; loading and eviction reprioritise around it. */
  setTarget(index: number) {
    const next = this.clamp(Math.round(index));
    if (next === this.target && (this.fetching.size || this.decoding.size)) return;
    this.target = next;
    this.evict();
    this.pump();
  }

  /** Protects the frame currently on screen from eviction. */
  pin(index: number) {
    this.pinned = index;
  }

  get(index: number): Drawable | null {
    return this.decoded.get(index) ?? null;
  }

  /** The decoded frame closest to `index`, if any. */
  nearest(index: number): { index: number; image: Drawable } | null {
    const i = this.clamp(Math.round(index));
    for (let d = 0; d < this.length; d++) {
      const a = this.decoded.get(i - d);
      if (a) return { index: i - d, image: a };
      const b = this.decoded.get(i + d);
      if (b) return { index: i + d, image: b };
    }
    return null;
  }

  get allFailed(): boolean {
    return this.failed.every(Boolean);
  }

  dispose() {
    this.disposed = true;
    this.abort.abort();
    for (const image of this.decoded.values()) release(image);
    this.decoded.clear();
    this.onFrameReady = null;
  }

  private clamp(i: number) {
    return Math.min(this.length - 1, Math.max(0, i));
  }

  private pump() {
    if (this.disposed) return;
    while (this.fetching.size < this.fetchConcurrency) {
      const next = this.nextToFetch();
      if (next < 0) break;
      void this.fetchFrame(next);
    }
    this.pumpDecode();
  }

  private nextToFetch(): number {
    let best = -1;
    let bestCost = Infinity;
    for (let i = 0; i < this.length; i++) {
      if (this.blobs[i] || this.failed[i] || this.fetching.has(i)) continue;
      const distance = Math.abs(i - this.target);
      const keyframe = i === 0 || i === this.length - 1 || i % 8 === 0;
      const cost = keyframe ? distance / 4 : i % 4 === 0 ? distance / 2 : distance;
      if (cost < bestCost) {
        bestCost = cost;
        best = i;
      }
    }
    return best;
  }

  private async fetchFrame(i: number) {
    this.fetching.add(i);
    try {
      const res = await fetch(this.urls[i], { signal: this.abort.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.blobs[i] = await res.blob();
    } catch {
      if (this.disposed) return;
      this.attempts[i] += 1;
      if (this.attempts[i] >= MAX_FETCH_ATTEMPTS) this.failed[i] = true;
    } finally {
      this.fetching.delete(i);
      this.pump();
    }
  }

  private pumpDecode() {
    for (let d = 0; d <= this.decodeRadius; d++) {
      for (const i of d === 0 ? [this.target] : [this.target + d, this.target - d]) {
        if (this.decoding.size >= this.decodeConcurrency) return;
        if (i < 0 || i >= this.length) continue;
        if (!this.blobs[i] || this.decoded.has(i) || this.decoding.has(i)) continue;
        void this.decodeFrame(i);
      }
    }
  }

  private async decodeFrame(i: number) {
    const blob = this.blobs[i];
    if (!blob) return;
    this.decoding.add(i);
    try {
      const image = await decodeBlob(blob);
      if (this.disposed || Math.abs(i - this.target) > this.decodeRadius + 2) {
        release(image);
        return;
      }
      this.decoded.set(i, image);
      this.onFrameReady?.(i);
    } catch {
      // Corrupt or undecodable frame: drop it; neighbours are drawn instead.
      this.blobs[i] = null;
      this.failed[i] = true;
    } finally {
      this.decoding.delete(i);
      if (!this.disposed) this.pumpDecode();
    }
  }

  private evict() {
    for (const [i, image] of this.decoded) {
      if (i !== this.pinned && Math.abs(i - this.target) > this.decodeRadius + 2) {
        release(image);
        this.decoded.delete(i);
      }
    }
  }
}

async function decodeBlob(blob: Blob): Promise<Drawable> {
  if (typeof createImageBitmap === "function") return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function release(image: Drawable) {
  if ("close" in image) image.close();
}
