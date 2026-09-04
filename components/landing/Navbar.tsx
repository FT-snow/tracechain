"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Product", href: "#product" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b bg-bg transition-colors duration-300 ${
        scrolled ? "border-border" : "border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#" className="text-lg font-bold tracking-tight text-text-primary">
          TraceChain
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex">
          <a href="/trace" className="btn-primary px-4 py-2">
            Trace
          </a>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center border border-border text-text-secondary md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-b border-border bg-bg md:hidden">
          <div className="flex flex-col px-5 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-text-secondary hover:text-text-primary"
              >
                {l.label}
              </a>
            ))}
            <a href="/trace" onClick={() => setOpen(false)} className="btn-primary mt-2 py-2.5 text-center">
              Trace
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
