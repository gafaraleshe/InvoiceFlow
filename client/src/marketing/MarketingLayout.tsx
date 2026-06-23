import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLoginUrl } from "@/const";
import { Container, MButton } from "./primitives";
import type { ReactNode } from "react";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const footerColumns: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Changelog", href: "/features" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/about" },
      { label: "Customers", href: "/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API reference", href: "/docs#api" },
      { label: "Guides", href: "/docs#quickstart" },
      { label: "Status", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Security", href: "/" },
      { label: "DPA", href: "/" },
    ],
  },
];

function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[#f7f8f8]"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#5e6ad2] text-[13px] font-bold text-white">
        I
      </span>
      InvoiceFlow
    </Link>
  );
}

function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled
          ? "border-[#1c1d20] bg-[#010102]/80 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <Container className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(link => {
              const active = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[14px] transition-colors",
                    active
                      ? "text-[#f7f8f8]"
                      : "text-[#8a8f98] hover:text-[#f7f8f8]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <MButton variant="ghost" size="sm" href={getLoginUrl()}>
            Sign in
          </MButton>
          <MButton variant="primary" size="sm" href={getLoginUrl()}>
            Get started
          </MButton>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md text-[#d0d6e0] hover:bg-white/5 md:hidden"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </Container>

      {mobileOpen ? (
        <div className="border-t border-[#1c1d20] bg-[#010102] md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-[15px] text-[#d0d6e0] hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <MButton variant="secondary" size="md" href={getLoginUrl()}>
                Sign in
              </MButton>
              <MButton variant="primary" size="md" href={getLoginUrl()}>
                Get started
              </MButton>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1c1d20] bg-[#010102] pt-16 pb-10">
      <Container>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-[#8a8f98]">
              Invoicing built for modern teams. Create, send, and get paid —
              without the busywork.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#23252a] bg-[#0f1011] px-3 py-1.5 text-[12px] text-[#d0d6e0]">
              <span className="h-2 w-2 rounded-full bg-[#27a644]" />
              All systems operational
            </div>
          </div>
          {footerColumns.map(col => (
            <div key={col.title}>
              <div className="mb-3 text-[13px] font-medium text-[#d0d6e0]">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((link, i) => (
                  <li key={`${link.label}-${i}`}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#8a8f98] transition-colors hover:text-[#f7f8f8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#1c1d20] pt-6 sm:flex-row">
          <span className="text-[12px] text-[#62666d]">
            © {new Date().getFullYear()} InvoiceFlow, Inc. All rights reserved.
          </span>
          <span className="text-[12px] text-[#62666d]">
            Made for teams that get paid on time.
          </span>
        </div>
      </Container>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mkt min-h-screen">
      <TopNav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
