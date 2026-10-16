import { Reveal } from "@/components/Reveal";
import { Eyebrow, container, displayHeading } from "@/components/ui";

const points = [
  {
    title: "Less manual administration",
    body: "Reduce the routine of paper registers, roll calls and re-keying attendance into separate systems.",
  },
  {
    title: "Streamlined daily check-ins",
    body: "Students check in as they arrive, so the register is taken as part of the walk into school.",
  },
  {
    title: "Centralised records",
    body: "Attendance is kept in one place, ready for teachers, office staff and administrators to review.",
  },
];

export function Intro() {
  return (
    <section aria-labelledby="intro-title" className="bg-cream pt-16 pb-24 md:pt-24 md:pb-32">
      <div className={container}>
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <Reveal className="md:col-span-5">
            <Eyebrow>Why it matters</Eyebrow>
            <h2 id="intro-title" className={`${displayHeading} mt-6 text-navy`}>
              More Time for What Matters.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-6 md:col-start-7 md:pt-12">
            <p className="text-lg leading-relaxed text-ink/80 md:text-xl md:leading-relaxed">
              Every school day begins with attendance. In many schools that still means paper
              registers, manual roll calls and records reconciled by hand. Automated attendance turns
              that routine into a simple check-in at the door — so teachers can start the day with
              their students, and operations teams spend less time chasing records.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid border-t border-stone/70 md:mt-24 md:grid-cols-3">
          {points.map((point, i) => (
            <Reveal
              key={point.title}
              delay={0.08 * i}
              className="border-b border-stone/70 py-8 md:border-b-0 md:border-l md:py-10 md:pr-8 md:pl-8 md:first:border-l-0 md:first:pl-0"
            >
              <h3 className="text-base font-semibold text-navy">{point.title}</h3>
              <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-muted">{point.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
