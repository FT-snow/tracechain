"use client";

import { Check, X } from "lucide-react";
import Reveal from "./Reveal";

const rows = [
  {
    aspect: "Time to verdict",
    enterprise: "Days — analyst-led",
    trace: "Under 1 minute",
    fast: true,
  },
  {
    aspect: "Who operates it",
    enterprise: "Trained forensic analyst",
    trace: "Any officer, zero training",
    fast: true,
  },
  {
    aspect: "Cost per seat",
    enterprise: "Lakhs / year",
    trace: "Near-zero (free-tier APIs)",
    fast: true,
  },
  {
    aspect: "Freeze request",
    enterprise: "Manual draft",
    trace: "Auto-generated + machine-ready",
    fast: true,
  },
  {
    aspect: "Keeps watching",
    enterprise: "One-off report",
    trace: "Live Watch, 24/7",
    fast: true,
  },
  {
    aspect: "Sees the full chain",
    enterprise: "Crypto only",
    trace: "Bank (UPI/IFSC) → wallet → exchange",
    fast: true,
  },
  {
    aspect: "Court evidence",
    enterprise: "Readable PDF",
    trace: "SHA-256 chain-of-custody hashed",
    fast: true,
  },
  {
    aspect: "Scam-ring detection",
    enterprise: "Manual correlation",
    trace: "Automatic multi-victim links",
    fast: true,
  },
];

export default function Uvp() {
  return (
    <section id="how" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal className="mb-16 max-w-2xl">
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-info">
            Why we're different
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Not another forensic suite.
            <br />
            A faster loop.
          </h2>
        </Reveal>

        <Reveal className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[1.4fr_1fr_1.4fr] items-center gap-0 border-b border-border bg-surface-2 px-6 py-4">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-text-muted">Aspect</div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
              Enterprise / manual
            </div>
            <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-trace">
              <Check className="h-3.5 w-3.5" /> TraceChain
            </div>
          </div>

          {rows.map((r, i) => (
            <div
              key={r.aspect}
              className={`grid grid-cols-[1.4fr_1fr_1.4fr] items-center gap-0 px-6 py-5 transition-colors hover:bg-surface ${
                i % 2 === 1 ? "bg-surface/50" : "bg-bg"
              }`}
            >
              <div className="text-sm font-medium text-text-primary">{r.aspect}</div>
              <div className="flex items-center gap-2 pr-2 text-sm text-text-muted">
                <X className="h-3.5 w-3.5 shrink-0 text-risk-hi/70" />
                <span>{r.enterprise}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <Check className="h-3.5 w-3.5 shrink-0 text-risk-low" />
                <span>{r.trace}</span>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
