import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Variable serif with a full weight range, so headlines can be set heavier
// where they sit over imagery (the hero) and lighter elsewhere.
const displaySerif = Newsreader({
  variable: "--font-display-serif",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Facial Attendance for Schools`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#f5eee3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US" className={`${geistSans.variable} ${displaySerif.variable} antialiased`}>
      <body className="flex min-h-svh flex-col">
        <Providers>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
