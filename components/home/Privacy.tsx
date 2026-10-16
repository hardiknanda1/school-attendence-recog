import { Reveal } from "@/components/Reveal";
import { Eyebrow, container, displayHeading } from "@/components/ui";

const considerations = [
  {
    title: "Institution-defined policies",
    body: "Each school decides how attendance data is used, who it applies to and how long it is kept.",
  },
  {
    title: "Access controls",
    body: "Attendance records and facial data should be available only to authorised staff with a clear need.",
  },
  {
    title: "Secure data handling",
    body: "Data should be stored, transmitted and retained with appropriate safeguards that are reviewed regularly.",
  },
  {
    title: "Transparency",
    body: "Students, families and staff should understand how the system works, including any alternatives your policies provide.",
  },
];

export function Privacy() {
  return (
    <section aria-labelledby="privacy-title" className="bg-navy py-24 text-paper md:py-32">
      <div className={`${container} grid gap-14 lg:grid-cols-12 lg:gap-12`}>
        <Reveal className="lg:col-span-5">
          <Eyebrow tone="dark">Our approach</Eyebrow>
          <h2 id="privacy-title" className={`${displayHeading} mt-6 text-paper`}>
            Privacy and Responsible Use.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-paper/75">
            Facial recognition in schools should be introduced carefully, with appropriate privacy
            protections and clear policies set by each institution. Requirements differ between
            states and institutions, so every deployment should be reviewed against the rules that
            apply to yours.
          </p>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <ul className="grid gap-x-10 sm:grid-cols-2">
            {considerations.map((item, i) => (
              <Reveal as="li" key={item.title} delay={0.06 * i} className="border-t border-paper/15 py-7">
                <h3 className="font-medium text-paper">{item.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-paper/70">{item.body}</p>
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 border-l-2 border-[#9cb8ea]/50 pl-5 text-[0.95rem] leading-relaxed text-paper/80">
            Facial attendance is intended to support — not replace — your school’s existing
            safeguarding and attendance policies.
          </p>
        </div>
      </div>
    </section>
  );
}
