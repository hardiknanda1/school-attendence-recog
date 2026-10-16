import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, container, displayHeading } from "@/components/ui";

const primary = [
  {
    name: "K–12 schools",
    detail:
      "Elementary, middle and high schools managing daily attendance across grades, classrooms and arrival times.",
  },
  {
    name: "Private and independent schools",
    detail: "Schools that want a modern, considered arrival experience for students and families.",
  },
  {
    name: "School networks and multi-campus institutions",
    detail: "Groups that want consistent attendance processes and centralised records across every site.",
  },
];

export function Institutions() {
  return (
    <section aria-labelledby="institutions-title" className="bg-paper py-24 md:py-32">
      <div className={container}>
        <Reveal className="max-w-3xl">
          <Eyebrow>Designed for educational institutions</Eyebrow>
          <h2 id="institutions-title" className={`${displayHeading} mt-6 text-navy`}>
            A Smarter Start to Every School Day.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <figure className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand lg:sticky lg:top-28">
              <Image
                src="/frames/frame-0079.webp"
                alt="A student checks in at a facial-recognition scanner in a sunlit school lobby."
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[88%_50%]"
              />
            </figure>
          </Reveal>

          <div className="lg:col-span-7">
            <ol className="border-t border-line">
              {primary.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.name}
                  delay={0.06 * i}
                  className="grid grid-cols-[3rem_1fr] gap-4 border-b border-line py-8 md:py-10"
                >
                  <span className="pt-2 font-display text-xl text-accent-deep" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-navy">
                      {item.name}
                    </h3>
                    <p className="mt-3 max-w-lg leading-relaxed text-muted">{item.detail}</p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal className="mt-10 rounded-2xl bg-cream px-6 py-7 md:px-8">
              <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">Also suited to</p>
              <h3 className="mt-2 text-lg font-semibold text-navy">Colleges and universities</h3>
              <p className="mt-2 max-w-lg leading-relaxed text-muted">
                Campuses looking to simplify attendance for lectures, seminars and other sessions where
                presence needs to be recorded.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
