import Link from "next/link";
import { cacheLife } from "next/cache";
import { BrandMark } from "./BrandMark";
import { CurrentYear } from "./CurrentYear";
import { footerLinks, site } from "@/lib/site";

async function serverYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const year = await serverYear();
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-[max(1.5rem,5vw)] py-14 xl:px-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <BrandMark />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Facial-recognition attendance designed for schools.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="rounded-sm text-ink/75 transition-colors hover:text-navy">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-[max(1.5rem,5vw)] py-6 text-xs text-muted xl:px-10">
          © <CurrentYear fallback={year} /> {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
