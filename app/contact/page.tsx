import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Eyebrow, container, displayHeading } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} about facial-recognition attendance for your school.`,
};

const topics = [
  "How check-ins could work at your school’s entrances",
  "How attendance records fit with your existing systems and processes",
  "Privacy, access and policy questions for your institution",
];

export default function ContactPage() {
  return (
    <div className="bg-cream pt-28 pb-24 md:pt-36 md:pb-32">
      <div className={`${container} grid gap-14 lg:grid-cols-12 lg:gap-12`}>
        <div className="lg:col-span-5">
          <Eyebrow>Contact</Eyebrow>
          <h1 className={`${displayHeading} mt-6 text-navy`}>Let’s talk about attendance at your school.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/80">
            Share a few details about your institution and what you’d like to achieve, and our team
            will follow up.
          </p>

          <div className="mt-12 border-t border-stone/70 pt-8">
            <h2 className="text-sm font-semibold text-navy">Topics we can discuss</h2>
            <ul className="mt-4 space-y-3">
              {topics.map((topic) => (
                <li key={topic} className="flex gap-3 leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          {site.publicEmail && (
            <p className="mt-10 text-sm text-muted">
              Prefer email?{" "}
              <a
                href={`mailto:${site.publicEmail}`}
                className="font-medium text-navy underline underline-offset-4"
              >
                {site.publicEmail}
              </a>
            </p>
          )}
        </div>

        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
