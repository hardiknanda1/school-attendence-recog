import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { container, displayHeading } from "@/components/ui";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-cream">
      {/* The empty lobby from the end of the hero sequence. */}
      <Image
        src="/hero/hero-end.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[80%_60%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-cream via-cream/85 to-cream/10 max-md:bg-gradient-to-b max-md:via-cream/90 max-md:to-cream/40"
      />
      <div className={`${container} py-28 md:py-40`}>
        <Reveal className="max-w-2xl">
          <h2 id="cta-title" className={`${displayHeading} text-navy`}>
            Every School Deserves a Smarter Way to Take Attendance.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/80">
            Let’s explore how intelligent attendance can fit into your school’s daily routine.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex h-13 items-center rounded-full bg-navy px-7 text-sm font-medium text-paper shadow-[0_10px_30px_-14px_rgba(21,35,58,0.7)] transition-colors hover:bg-ink"
          >
            Contact Our Team
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
