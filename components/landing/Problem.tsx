"use client";

import Reveal from "./Reveal";

export default function Problem() {
  return (
    <section id="problem" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal className="max-w-4xl">
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-risk-hi">
            The problem
          </span>
          <h2 className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-text-primary sm:text-3xl md:text-4xl">
            By the time a manual trace finishes,{" "}
            <span className="text-risk-hi">the scammer has already cashed out.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            Victims report crypto fraud with a suspect wallet address. Tracing
            that money hop-by-hop across exchanges takes trained forensic
            analysts days. India's cybercrime cells have no station-level,
            self-serve real-time tool — only expensive enterprise suites built
            for central agencies.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
          <Reveal className="bg-bg p-8">
            <div className="mono mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-text-muted">
              <span className="h-2 w-2 rounded-full bg-text-muted" />
              Manual tracing
            </div>
            <div className="mono space-y-1.5 text-sm text-text-secondary">
              <p className="border-l-2 border-text-muted/40 pl-3">Day 1 · Analyst queues chain APIs by hand</p>
              <p className="border-l-2 border-text-muted/40 pl-3">Day 2 · Hop-by-hop, wallet by wallet</p>
              <p className="border-l-2 border-text-muted/40 pl-3">Day 3 · Funds already withdrawn</p>
            </div>
            <p className="mono mt-6 text-3xl font-bold text-text-muted">~72 hrs</p>
          </Reveal>

          <Reveal delay={0.15} className="bg-bg p-8">
            <div className="mono mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-trace">
              <span className="h-2 w-2 rounded-full bg-trace shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
              TraceChain
            </div>
            <div className="mono space-y-1.5 text-sm text-text-secondary">
              <p className="border-l-2 border-trace/60 pl-3">Submit wallet + UPI/IFSC</p>
              <p className="border-l-2 border-trace/60 pl-3">Automated multi-hop trace, live</p>
              <p className="border-l-2 border-trace/60 pl-3">Exchange ID + freeze letter generated</p>
            </div>
            <p className="mono mt-6 text-3xl font-bold text-trace">
              &lt; 1 min
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
