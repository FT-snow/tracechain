import Link from "next/link";

import Reveal from "./Reveal";

const productLinks = [
  { label: "Trace", href: "/trace" },
  { label: "Live Watch", href: "/watch" },
  { label: "Reports", href: "/reports" },
  { label: "Heat Map", href: "/heatmap" },
  { label: "Provenance", href: "/provenance" },
];
const resourcesLinks = [
  { label: "API reference", href: "/terminal" },
  { label: "Terminal", href: "/terminal" },
  { label: "Settings", href: "/settings" },
  { label: "Sign in", href: "/login" },
  { label: "GitHub", href: "https://github.com/FT-snow/tracechain" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Reveal className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <Link href="/" className="text-lg font-bold tracking-tight text-text-primary">
              TraceChain
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              Real-time identification of fraud-linked crypto exchanges for law-enforcement teams.
            </p>
          </div>

          <div>
            <div className="mono mb-4 text-xs uppercase tracking-[0.18em] text-text-muted">Product</div>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-[15px] text-text-secondary transition-colors hover:text-text-primary">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mono mb-4 text-xs uppercase tracking-[0.18em] text-text-muted">Resources</div>
            <ul className="space-y-2.5">
              {resourcesLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-[15px] text-text-secondary transition-colors hover:text-text-primary">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="mono text-xs text-text-muted">
            © {new Date().getFullYear()} TraceChain · For law-enforcement use
          </p>
          <p className="mono text-xs text-text-muted">
            BTC · ETH · BSC · USDT-TRC20
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
