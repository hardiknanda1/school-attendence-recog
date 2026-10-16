import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, container, displayHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

/**
 * PLACEHOLDER — replace this page with the organisation's actual privacy
 * policy before launch. It intentionally makes no privacy commitments.
 */
export default function PrivacyPage() {
  return (
    <div className="bg-cream pt-28 pb-24 md:pt-36 md:pb-32">
      <div className={`${container} max-w-3xl`}>
        <Eyebrow>Legal</Eyebrow>
        <h1 className={`${displayHeading} mt-6 text-navy`}>Privacy Policy</h1>

        <div
          role="note"
          className="mt-10 rounded-xl border border-[#e6c27a] bg-[#fdf6e7] px-6 py-5 text-[#5c4210]"
        >
          <p className="font-semibold">Placeholder — policy not yet published</p>
          <p className="mt-2 leading-relaxed">
            The privacy policy for this website and service has not been provided yet. This page is
            a placeholder and should be replaced with the organisation’s reviewed policy before
            launch.
          </p>
        </div>

        <p className="mt-10 leading-relaxed text-muted">
          If you have a question about privacy in the meantime, please{" "}
          <Link href="/contact" className="font-medium text-navy underline underline-offset-4">
            contact our team
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
