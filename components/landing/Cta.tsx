"use client";

import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

export default function Cta() {
  return (
    <section id="cta" className="relative overflow-hidden border-t border-border">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 60% at 50% 20%, rgba(168,85,247,0.16) 0%, transparent 100%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-5 py-32 text-center md:px-8">
        <Reveal>
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-trace">
            Request early access
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
            Start tracing now.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
            A wallet in the system today. The exchange on your desk in under a
            minute. Built for every cybercrime cell in India.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-md bg-text-primary px-7 py-3.5 text-sm font-semibold text-bg transition-colors hover:bg-text-secondary"
            >
              Request a demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="mono inline-flex items-center gap-1.5 rounded-md border border-border px-7 py-3.5 text-sm text-text-secondary transition-colors hover:border-trace/50 hover:text-text-primary"
            >
              Contact the team
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
