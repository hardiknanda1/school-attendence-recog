"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "./BrandMark";
import { navLinks } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Close on Escape, lock page scroll and move focus into the menu while open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu(true);
    };
    const onWide = (e: MediaQueryListEvent) => e.matches && closeMenu();
    const wide = window.matchMedia("(min-width: 768px)");
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen, closeMenu]);

  const solid = scrolled || menuOpen || !isHome;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        solid
          ? "border-b border-line/80 bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only rounded-md bg-navy px-4 py-2 text-sm text-paper focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-[max(1.5rem,5vw)] xl:px-10 md:h-[4.5rem]"
      >
        <BrandMark onNavigate={() => closeMenu()} />

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={link.href === pathname ? "page" : undefined}
                className="rounded-sm text-sm text-ink/80 transition-colors hover:text-navy aria-[current=page]:text-navy aria-[current=page]:font-medium"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden h-10 items-center rounded-full bg-navy px-5 text-sm font-medium text-paper transition-colors hover:bg-ink sm:inline-flex"
          >
            Get in Touch
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="grid size-10 place-items-center rounded-full text-navy md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 8h16M4 16h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!menuOpen}
        className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper px-6 pt-6 pb-10 md:hidden"
      >
        <ul className="flex flex-col">
          {navLinks.map((link) => (
            <li key={link.href} className="border-b border-line">
              <Link
                href={link.href}
                onClick={() => closeMenu()}
                aria-current={link.href === pathname ? "page" : undefined}
                className="block py-4 font-display text-3xl text-navy"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/contact"
          onClick={() => closeMenu()}
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-navy text-sm font-medium text-paper"
        >
          Get in Touch
        </Link>
      </div>
    </header>
  );
}
