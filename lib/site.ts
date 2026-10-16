/**
 * Site-wide configuration. Replace the placeholder brand details here — every
 * page, the navigation, the footer and metadata read from this object.
 */
export const site = {
  /** Placeholder brand name — replace with the real product/company name. */
  name: "Your Brand",
  /**
   * Path to a logo in /public (e.g. "/logo.svg"). While null, a neutral
   * placeholder mark is rendered next to the brand name.
   */
  logoSrc: null as string | null,
  description:
    "Facial-recognition attendance for schools: simpler daily check-ins, less manual administration and centralised attendance records.",
  /**
   * Optional public contact email shown on the contact page. Leave null to
   * hide it (the contact form works independently of this value).
   */
  publicEmail: null as string | null,
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerLinks = [
  ...navLinks,
  { label: "Privacy Policy", href: "/privacy" },
] as const;
