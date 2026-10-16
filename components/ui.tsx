import type { ReactNode } from "react";

export const container = "mx-auto w-full max-w-7xl px-[max(1.5rem,5vw)] xl:px-10";

export function Eyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <p
      className={`flex items-center gap-3 text-[0.7rem] font-medium tracking-[0.22em] uppercase ${
        tone === "dark" ? "text-[#9cb8ea]" : "text-accent-deep"
      }`}
    >
      <span className={`h-px w-8 ${tone === "dark" ? "bg-[#9cb8ea]/60" : "bg-accent/60"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

export const displayHeading =
  "font-display text-[clamp(2.4rem,5vw,4.25rem)] leading-[1.04] tracking-[-0.015em] text-balance";
