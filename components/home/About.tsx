import { Reveal } from "@/components/Reveal";
import { Eyebrow, container, displayHeading } from "@/components/ui";
import { site } from "@/lib/site";

const principles = [
  {
    term: "Usability",
    detail: "A check-in that feels quick and intuitive for students of every age.",
  },
  {
    term: "Operational simplicity",
    detail: "Workflows that fit the way your school already runs its day, not the other way round.",
  },
  {
    term: "Institutional fit",
    detail: "Designed to work within the policies, roles and responsibilities your institution defines.",
  },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-cream py-24 md:py-32">
      <div className={`${container} grid gap-14 md:grid-cols-12 md:gap-12`}>
        <Reveal className="md:col-span-5">
          <Eyebrow>About us</Eyebrow>
          <h2 id="about-title" className={`${displayHeading} mt-6 text-navy`}>
            Built for Schools. Designed for People.
          </h2>
        </Reveal>

        <div className="md:col-span-6 md:col-start-7 md:pt-12">
          <Reveal delay={0.08}>
            <p className="text-lg leading-relaxed text-ink/80 md:text-xl md:leading-relaxed">
              {site.name} helps educational institutions modernise attendance. We bring together
              facial recognition and streamlined digital workflows so the daily register happens as
              students arrive, rather than taking time away from teaching.
            </p>
            <p className="mt-6 leading-relaxed text-muted">
              We design around the people who rely on attendance every day: students who should be
              able to check in without fuss, teachers who need an accurate register, and the
              administrators responsible for records, policies and reporting.
            </p>
          </Reveal>

          <dl className="mt-12 border-t border-stone/70">
            {principles.map((p, i) => (
              <Reveal
                key={p.term}
                delay={0.06 * i}
                className="grid gap-1 border-b border-stone/70 py-6 sm:grid-cols-[12rem_1fr] sm:gap-6"
              >
                <dt className="font-medium text-navy">{p.term}</dt>
                <dd className="leading-relaxed text-muted">{p.detail}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
