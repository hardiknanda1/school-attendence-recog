"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { FRAME_HEIGHT, FRAME_NUMBERS, FRAME_WIDTH, frameSrc } from "@/lib/frame-manifest";
import { usePrefersReducedMotion } from "@/lib/use-media-query";
import { FrameSequence } from "./frame-sequence";
import { PORTRAIT_QUERY, mediaRect } from "./hero-layout";

const FRAME_URLS = FRAME_NUMBERS.map(frameSrc);
const LAST_FRAME = FRAME_URLS.length - 1;
const POSTER_SRC = FRAME_URLS[0];

/**
 * Scroll timeline (0 → 1 across the pinned section). The sequence plays over
 * the first 90%; the remaining scroll holds the final empty-lobby frame so the
 * closing message can settle before the page continues.
 */
const PLAY_END = 0.86;
const MESSAGE_SWITCH = [0.17, 0.82] as const;

/** Playhead smoothing per 60 fps frame; lower is softer. */
const SMOOTHING = 0.18;

const messages = [
  {
    headline: "Attendance, Reimagined.",
    copy: "Smarter school attendance. Less administrative work. More time for learning.",
  },
  {
    headline: "One Face. One Seamless Check-In.",
    copy: "Make daily attendance simpler with intelligent facial recognition.",
  },
  {
    headline: "Every School Day, Made Smarter.",
    copy: "Modernise attendance with a seamless, reliable experience for your school community.",
  },
] as const;

const progressToFrame = (p: number) => Math.min(1, Math.max(0, p / PLAY_END)) * LAST_FRAME;

export function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [canvasReady, setCanvasReady] = useState(false);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(p < MESSAGE_SWITCH[0] ? 0 : p < MESSAGE_SWITCH[1] ? 1 : 2);
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  // Canvas renderer: scroll progress → smoothed playhead → drawn frame.
  useEffect(() => {
    if (reduceMotion) return;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!stage || !canvas || !ctx) return;

    const sequence = new FrameSequence(FRAME_URLS);
    const portraitQuery = window.matchMedia(PORTRAIT_QUERY);
    let target = progressToFrame(scrollYProgress.get());
    let playhead = target;
    let raf = 0;
    let lastTime = 0;
    let lastDrawn = "";
    let ready = false;
    let size = { w: 0, h: 0, dpr: 1 };

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      const rect = mediaRect(w, h, FRAME_WIDTH, FRAME_HEIGHT, portraitQuery.matches);
      // No benefit rendering far beyond the source resolution; caps fill cost on HiDPI screens.
      const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.max(1, (FRAME_WIDTH / rect.w) * 1.25));
      size = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      lastDrawn = "";
      schedule();
    };

    const draw = () => {
      if (!size.w) return;
      const base = Math.floor(playhead);
      const mix = playhead - base;
      let image = sequence.get(base);
      let shown = base;
      if (!image) {
        const near = sequence.nearest(playhead);
        if (!near) return;
        image = near.image;
        shown = near.index;
      }
      // Cross-dissolve between adjacent supplied frames only (never synthesised).
      const next = image && shown === base && mix > 0.02 ? sequence.get(base + 1) : null;
      const key = `${shown}:${next ? mix.toFixed(2) : 0}:${size.w}x${size.h}`;
      if (key === lastDrawn) return;
      lastDrawn = key;
      sequence.pin(shown);

      const { w, h, dpr } = size;
      const r = mediaRect(w, h, FRAME_WIDTH, FRAME_HEIGHT, portraitQuery.matches);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.drawImage(image, r.x, r.y, r.w, r.h);
      if (next) {
        ctx.globalAlpha = mix;
        ctx.drawImage(next, r.x, r.y, r.w, r.h);
        ctx.globalAlpha = 1;
      }
      if (!ready) {
        ready = true;
        setCanvasReady(true);
      }
    };

    const tick = (time: number) => {
      raf = 0;
      const dt = lastTime ? Math.min(64, time - lastTime) : 16.7;
      lastTime = time;
      const delta = target - playhead;
      playhead =
        Math.abs(delta) < 0.005 ? target : playhead + delta * (1 - Math.pow(1 - SMOOTHING, dt / 16.7));
      sequence.setTarget(playhead);
      draw();
      if (playhead !== target) raf = requestAnimationFrame(tick);
      else lastTime = 0;
    };

    function schedule() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    sequence.onFrameReady = schedule;
    sequence.setTarget(playhead);

    const unsubscribe = scrollYProgress.on("change", (p) => {
      target = progressToFrame(p);
      schedule();
    });
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    portraitQuery.addEventListener("change", resize);
    window.addEventListener("resize", resize);
    resize();

    return () => {
      cancelAnimationFrame(raf);
      unsubscribe();
      observer.disconnect();
      portraitQuery.removeEventListener("change", resize);
      window.removeEventListener("resize", resize);
      sequence.dispose();
      setCanvasReady(false);
    };
  }, [reduceMotion, scrollYProgress]);

  return (
    <section
      ref={sectionRef}
      id="home"
      aria-label="Introduction"
      className="relative h-[450svh] motion-reduce:h-svh"
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-svh w-full overflow-hidden bg-cream [container-type:inline-size]"
      >
        {/* Static first frame: instant paint, reduced-motion and no-canvas fallback. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={POSTER_SRC}
          alt="Three students with backpacks queue in a sunlit school lobby beside a facial-recognition attendance scanner."
          width={FRAME_WIDTH}
          height={FRAME_HEIGHT}
          fetchPriority="high"
          decoding="async"
          className="hero-media select-none"
          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 motion-reduce:hidden ${
            canvasReady ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Hero copy — HTML, not canvas, so it stays crisp and accessible. */}
        <div className="hero-copy z-10">
          <div className="w-full">
            <p className="hero-legible mb-4 flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-orange uppercase hero-portrait:mb-3 hero-portrait:text-accent-deep hero-short:hidden">
              <span className="h-0.5 w-8 bg-white hero-portrait:bg-accent-deep" aria-hidden="true" />
              Facial attendance for schools
            </p>
            <div className="grid">
              {messages.map((m, i) => (
                <HeroMessage
                  key={m.headline}
                  index={i}
                  progress={scrollYProgress}
                  active={reduceMotion ? i === 0 : active === i}
                  {...m}
                />
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 hero-portrait:mt-6 hero-short:mt-3">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-full bg-navy px-6 text-sm font-semibold text-white hero-short:h-10 shadow-[0_8px_24px_-12px_rgba(21,35,58,0.6)] transition-colors hover:bg-ink"
              >
                Get in Touch
              </Link>
              <a
                href="#how-it-works"
                className="hero-legible group inline-flex h-12 items-center gap-2 text-sm font-semibold text-white hero-short:h-10 underline-offset-4 hover:underline hero-portrait:text-navy"
              >
                Discover How It Works
                <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
            </div>
          </div>
        </div>

        <motion.div
          aria-hidden="true"
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 text-[0.7rem] font-semibold tracking-[0.2em] text-navy uppercase motion-reduce:hidden hero-portrait:hidden hero-short:hidden"
        >
          <span className="relative block h-10 w-px overflow-hidden bg-ink/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_2.2s_ease-in-out_infinite] bg-navy" />
          </span>
          Scroll to explore
        </motion.div>
      </div>
    </section>
  );
}

const ranges: { input: number[]; opacity: number[]; y: number[] }[] = [
  { input: [0, 0.1, 0.16], opacity: [1, 1, 0], y: [0, 0, -20] },
  { input: [0.18, 0.24, 0.74, 0.8], opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] },
  { input: [0.84, 0.9], opacity: [0, 1], y: [20, 0] },
];

function HeroMessage({
  index,
  headline,
  copy,
  progress,
  active,
}: {
  index: number;
  headline: string;
  copy: string;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const { input, opacity: o, y: yOut } = ranges[index];
  const opacity = useTransform(progress, input, o);
  const y = useTransform(progress, input, yOut);
  const Heading = index === 0 ? "h1" : "h2";

  return (
    <motion.div
      style={{ opacity, y }}
      aria-hidden={!active}
      inert={!active}
      className={`col-start-1 row-start-1 ${
        index === 0 ? "motion-reduce:transform-none! motion-reduce:opacity-100!" : "motion-reduce:hidden"
      }`}
    >
      <Heading className="hero-legible hero-headline font-display font-bold leading-[1.04] tracking-[-0.025em] text-black text-balance hero-portrait:text-paper">
        {headline}
      </Heading>
      <p className="hero-legible hero-lede mt-4 font-semibold leading-relaxed text-white text-pretty hero-portrait:mt-3 hero-short:mt-2">
        {copy}
      </p>
    </motion.div>
  );
}
