import Link from "next/link";
import { site } from "@/lib/site";

/** Brand name with logo. Shows a neutral placeholder mark until `site.logoSrc` is set. */
export function BrandMark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-sm text-navy"
      aria-label={`${site.name} — home`}
    >
      {site.logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={site.logoSrc} alt="" className="h-8 w-auto" />
      ) : (
        <span
          aria-hidden="true"
          title="Logo placeholder"
          className="grid size-8 place-items-center rounded-lg border border-navy/25 bg-paper/60"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2 6V3.5A1.5 1.5 0 0 1 3.5 2H6M14 2h2.5A1.5 1.5 0 0 1 18 3.5V6M18 14v2.5a1.5 1.5 0 0 1-1.5 1.5H14M6 18H3.5A1.5 1.5 0 0 1 2 16.5V14" />
            <circle cx="10" cy="10" r="2.25" />
          </svg>
        </span>
      )}
      <span className="text-[0.95rem] font-semibold tracking-tight">{site.name}</span>
    </Link>
  );
}
