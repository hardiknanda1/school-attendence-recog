import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, container, displayHeading } from "@/components/ui";

const iconProps = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-7",
  "aria-hidden": true,
};

const steps: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Face Capture",
    body: "The student approaches the attendance device as they arrive. No cards to carry, codes to remember or sheets to sign.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 10V6a2 2 0 0 1 2-2h4M22 4h4a2 2 0 0 1 2 2v4M28 22v4a2 2 0 0 1-2 2h-4M10 28H6a2 2 0 0 1-2-2v-4" />
        <circle cx="16" cy="13.5" r="4" />
        <path d="M9.5 23.5c1.4-2.6 3.8-4 6.5-4s5.1 1.4 6.5 4" />
      </svg>
    ),
  },
  {
    title: "Identity Verification",
    body: "The system checks the captured face against the school’s authorised records to confirm who has arrived.",
    icon: (
      <svg {...iconProps}>
        <rect x="4" y="7" width="13" height="18" rx="2" />
        <circle cx="10.5" cy="13.5" r="2.5" />
        <path d="M7 21c.8-1.6 2-2.4 3.5-2.4s2.7.8 3.5 2.4" />
        <path d="M21 12h7M21 16h7M21 20h4" />
      </svg>
    ),
  },
  {
    title: "Attendance Recorded",
    body: "When verification succeeds, the check-in is recorded in the attendance system, ready for staff to review.",
    icon: (
      <svg {...iconProps}>
        <rect x="6" y="4" width="20" height="24" rx="2" />
        <path d="M11 4v3h10V4" />
        <path d="M11.5 17.5l3 3 6-6.5" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="bg-paper py-24 md:py-32"
    >
      <div className={container}>
        <Reveal className="max-w-3xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-title" className={`${displayHeading} mt-6 text-navy`}>
            Simple for Students. Efficient for Schools.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Three steps, from the moment a student walks in to the moment their attendance is
            recorded.
          </p>
        </Reveal>

        <div className="relative mt-16 md:mt-24">
          {/* Connector: vertical on mobile, horizontal on larger screens. */}
          <span
            aria-hidden="true"
            className="absolute top-8 bottom-8 left-8 w-px bg-gradient-to-b from-accent/50 via-stone to-accent/50 md:top-8 md:right-[16%] md:bottom-auto md:left-[8%] md:h-px md:w-auto md:bg-gradient-to-r"
          />
          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-10">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={0.12 * i} className="relative pl-24 md:pl-0">
                <div className="absolute top-0 left-0 grid size-16 place-items-center rounded-full border border-line bg-paper text-accent-deep shadow-[0_0_0_8px_var(--color-paper)] md:relative">
                  {step.icon}
                </div>
                <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase md:mt-8">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-3xl text-navy">{step.title}</h3>
                <p className="mt-3 max-w-xs leading-relaxed text-muted">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <p className="mt-16 max-w-2xl border-l-2 border-accent/40 pl-5 text-[0.95rem] leading-relaxed text-muted md:mt-20">
          When a check-in can’t be verified, your school’s own procedures decide what happens next
          — facial attendance works alongside the processes you already have.
        </p>
      </div>
    </section>
  );
}
